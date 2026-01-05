<template>
  <div class="hosting-applications-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">托管申请审核</span>
      </template>
    </el-page-header>

    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="申请状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="application_type" label="申请类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.application_type === 'own_car'" type="success">自有车辆</el-tag>
            <el-tag v-else-if="row.application_type === 'new_car'" type="primary">新车购买</el-tag>
            <el-tag v-else type="info">自用车辆</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 'rejected'" type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160" />
        <el-table-column prop="reviewed_at" label="审核时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="500px">
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reject_reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

// 查询参数
const queryParams = reactive({
  status: '',
  page: 1,
  limit: 10,
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

// 拒绝对话框
const rejectDialogVisible = ref(false);
const rejectForm = reactive({
  reject_reason: '',
  currentId: null as number | null,
});

// 查询列表
const handleQuery = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/hosting-applications/pending', {
      params: queryParams,
    });
    if (response.data.success) {
      tableData.value = response.data.data.list;
      total.value = response.data.data.total;
    }
  } catch (error) {
    ElMessage.error('获取申请列表失败');
  } finally {
    loading.value = false;
  }
};

// 重置查询
const handleReset = () => {
  queryParams.status = '';
  queryParams.page = 1;
  handleQuery();
};

// 通过申请
const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认通过该托管申请吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await axios.post(`/api/v1/hosting-applications/${row.id}/review`, {
      status: 'approved',
    });

    if (response.data.success) {
      ElMessage.success('审核通过，已自动分配托管车主角色和权益');
      handleQuery();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败');
    }
  }
};

// 拒绝申请
const handleReject = (row: any) => {
  rejectForm.currentId = row.id;
  rejectForm.reject_reason = '';
  rejectDialogVisible.value = true;
};

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reject_reason) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }

  try {
    const response = await axios.post(`/api/v1/hosting-applications/${rejectForm.currentId}/review`, {
      status: 'rejected',
      reject_reason: rejectForm.reject_reason,
    });

    if (response.data.success) {
      ElMessage.success('已拒绝申请');
      rejectDialogVisible.value = false;
      handleQuery();
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 查看详情
const handleViewDetail = (row: any) => {
  ElMessageBox.alert(
    `<div>
      <p><strong>申请ID：</strong>${row.id}</p>
      <p><strong>用户ID：</strong>${row.user_id}</p>
      <p><strong>申请类型：</strong>${row.application_type}</p>
      <p><strong>状态：</strong>${row.status}</p>
      <p><strong>申请时间：</strong>${row.created_at}</p>
      ${row.reject_reason ? `<p><strong>拒绝原因：</strong>${row.reject_reason}</p>` : ''}
    </div>`,
    '申请详情',
    {
      dangerouslyUseHTMLString: true,
    }
  );
};

// 页面加载时查询
onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.hosting-applications-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}
</style>

