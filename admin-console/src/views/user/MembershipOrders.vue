<template>
  <div class="membership-orders-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">会员订单管理</span>
      </template>
    </el-page-header>

    <el-alert title="功能说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>管理用户会员订单，查看订单状态和支付信息</p>
    </el-alert>

    <!-- 查询表单 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="queryParams.payment_status" placeholder="请选择" clearable>
            <el-option label="未支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="membership_level" label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.membership_level === 'silver'" type="info">银卡</el-tag>
            <el-tag v-else-if="row.membership_level === 'gold'" type="warning">金卡</el-tag>
            <el-tag v-else-if="row.membership_level === 'platinum'" type="success">铂金</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(月)" width="100" />
        <el-table-column prop="actual_amount" label="实付金额" width="120">
          <template #default="{ row }">
            ¥{{ row.actual_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="payment_status" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.payment_status === 'unpaid'" type="warning">未支付</el-tag>
            <el-tag v-else-if="row.payment_status === 'paid'" type="success">已支付</el-tag>
            <el-tag v-else type="info">已退款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

// 查询参数
const queryParams = reactive({
  status: '',
  payment_status: '',
  page: 1,
  limit: 10,
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

// 查询列表
const handleQuery = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/membership-orders', {
      params: queryParams,
    });
    if (response.data.success) {
      tableData.value = response.data.data.list;
      total.value = response.data.data.total;
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 重置查询
const handleReset = () => {
  queryParams.status = '';
  queryParams.payment_status = '';
  queryParams.page = 1;
  handleQuery();
};

// 查看详情
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div>
      <p><strong>订单号：</strong>${row.order_no}</p>
      <p><strong>用户ID：</strong>${row.user_id}</p>
      <p><strong>会员等级：</strong>${row.membership_level}</p>
      <p><strong>时长：</strong>${row.duration}个月</p>
      <p><strong>原价：</strong>¥${row.original_price}</p>
      <p><strong>优惠：</strong>¥${row.discount_amount}</p>
      <p><strong>实付：</strong>¥${row.actual_amount}</p>
      <p><strong>支付状态：</strong>${row.payment_status}</p>
      <p><strong>订单状态：</strong>${row.status}</p>
      <p><strong>创建时间：</strong>${row.created_at}</p>
      ${row.paid_at ? `<p><strong>支付时间：</strong>${row.paid_at}</p>` : ''}
      ${row.remark ? `<p><strong>备注：</strong>${row.remark}</p>` : ''}
    </div>`,
    '订单详情',
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
.membership-orders-container {
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
