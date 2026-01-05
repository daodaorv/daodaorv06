<template>
  <div class="benefit-config-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>权益配置</span>
          <el-button type="primary" @click="handleCreate">新增配置</el-button>
        </div>
      </template>

      <el-alert title="配置说明" type="info" :closable="false" style="margin-bottom: 20px">
        <p>管理会员权益和托管欢迎权益的配置，包括优惠券、折扣、推广比例等</p>
      </el-alert>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="membership_level" label="用户角色" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.membership_level === 'normal'" type="info">普通注册用户</el-tag>
            <el-tag v-else-if="row.membership_level === 'plus'" type="warning">PLUS用户</el-tag>
            <el-tag v-else-if="row.membership_level === 'hosting_own'" type="success">自有车托管用户</el-tag>
            <el-tag v-else-if="row.membership_level === 'hosting_purchase'" type="primary">购车托管用户</el-tag>
            <el-tag v-else-if="row.membership_level === 'hosting_crowdfunding'" type="danger">众筹托管用户</el-tag>
            <el-tag v-else>{{ row.membership_level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="benefit_type" label="权益类型" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.benefit_type === 'coupon'">优惠券</el-tag>
            <el-tag v-else-if="row.benefit_type === 'discount'" type="success">折扣</el-tag>
            <el-tag v-else-if="row.benefit_type === 'promotion_rate'" type="warning">推广比例</el-tag>
            <el-tag v-else type="info">托管欢迎</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            {{ formatDescription(row.description) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="用户角色" prop="membership_level">
          <el-select v-model="formData.membership_level" placeholder="请选择用户角色">
            <el-option label="普通注册用户" value="normal" />
            <el-option label="PLUS用户" value="plus" />
            <el-option label="自有车托管用户" value="hosting_own" />
            <el-option label="购车托管用户" value="hosting_purchase" />
            <el-option label="众筹托管用户" value="hosting_crowdfunding" />
          </el-select>
        </el-form-item>

        <el-form-item label="权益类型" prop="benefit_type">
          <el-select v-model="formData.benefit_type" placeholder="请选择权益类型">
            <el-option label="优惠券" value="coupon" />
            <el-option label="折扣" value="discount" />
            <el-option label="推广比例" value="promotion_rate" />
            <el-option label="托管欢迎" value="hosting_welcome" />
          </el-select>
        </el-form-item>

        <el-form-item label="权益值" prop="benefit_value">
          <el-input
            v-model="formData.benefit_value"
            type="textarea"
            :rows="4"
            placeholder='请输入JSON格式，例如: {"amount": 100, "type": "cash"}'
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权益描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import axios from 'axios';

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增权益配置');
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = ref({
  membership_level: '',
  benefit_type: '',
  benefit_value: '',
  description: '',
  status: 'active',
});

// 表单验证规则
const formRules: FormRules = {
  membership_level: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
  benefit_type: [{ required: true, message: '请选择权益类型', trigger: 'change' }],
  benefit_value: [
    { required: true, message: '请输入权益值', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        try {
          JSON.parse(value);
          callback();
        } catch {
          callback(new Error('权益值必须是有效的JSON格式'));
        }
      },
      trigger: 'blur',
    },
  ],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
};

// 用户角色映射
const roleMap: Record<string, string> = {
  normal: '普通注册用户',
  plus: 'PLUS用户',
  hosting_own: '自有车托管用户',
  hosting_purchase: '购车托管用户',
  hosting_crowdfunding: '众筹托管用户',
};

// 格式化用户角色
const formatRole = (role: string): string => {
  return roleMap[role] || role;
};

// 格式化描述字段
const formatDescription = (description: any): string => {
  if (!description) return '无';

  // 如果是字符串，直接返回
  if (typeof description === 'string') {
    return description;
  }

  // 如果是对象，转换为字符串
  if (typeof description === 'object') {
    return JSON.stringify(description, null, 2);
  }

  return String(description);
};

// 查询列表
const loadConfigs = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/benefit-configs');
    if (response.data.success) {
      tableData.value = response.data.data;
    }
  } catch (error) {
    ElMessage.error('获取权益配置失败');
  } finally {
    loading.value = false;
  }
};

// 新增配置
const handleCreate = () => {
  dialogTitle.value = '新增权益配置';
  dialogVisible.value = true;
};

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields();
  formData.value = {
    membership_level: '',
    benefit_type: '',
    benefit_value: '',
    description: '',
    status: 'active',
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const response = await axios.post('/api/v1/benefit-configs', {
      membership_level: formData.value.membership_level,
      benefit_type: formData.value.benefit_type,
      benefit_value: JSON.parse(formData.value.benefit_value),
      description: formData.value.description,
      status: formData.value.status,
    });

    if (response.data.success) {
      ElMessage.success('权益配置创建成功');
      dialogVisible.value = false;
      loadConfigs();
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('创建权益配置失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 查看详情
const handleView = (row: any) => {
  const benefitValue = typeof row.benefit_value === 'string'
    ? JSON.parse(row.benefit_value)
    : row.benefit_value;

  ElMessageBox.alert(
    `<div>
      <p><strong>ID：</strong>${row.id}</p>
      <p><strong>用户角色：</strong>${formatRole(row.membership_level)}</p>
      <p><strong>权益类型：</strong>${row.benefit_type}</p>
      <p><strong>权益值：</strong><pre>${JSON.stringify(benefitValue, null, 2)}</pre></p>
      <p><strong>描述：</strong>${formatDescription(row.description)}</p>
      <p><strong>状态：</strong>${row.status === 'active' ? '启用' : '禁用'}</p>
    </div>`,
    '权益配置详情',
    {
      dangerouslyUseHTMLString: true,
    }
  );
};

// 删除配置
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该权益配置吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    ElMessage.info('删除功能开发中');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    ElMessage.info('状态切换功能开发中');
  } catch (error) {
    ElMessage.error('状态更新失败');
    // 恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active';
  }
};

// 页面加载时查询
onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.benefit-config-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
