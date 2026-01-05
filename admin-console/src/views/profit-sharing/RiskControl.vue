<template>
  <div class="risk-control-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">风控配置</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增规则
        </el-button>
      </template>
    </el-page-header>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <!-- 风控规则 -->
        <el-tab-pane label="风控规则" name="rules">
          <el-table :data="ruleList" v-loading="loading" border stripe>
            <el-table-column prop="name" label="规则名称" width="150" />
            <el-table-column prop="type" label="规则类型" width="150">
              <template #default="{ row }">
                <el-tag>{{ getRuleTypeName(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="阈值" width="100" align="right" />
            <el-table-column prop="action" label="动作" width="100">
              <template #default="{ row }">
                <el-tag :type="getActionTag(row.action)">{{ getActionName(row.action) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="250" />
            <el-table-column prop="enabled" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="160" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEdit(row)"
                  >编辑</el-button
                >
                <el-button link type="danger" size="small" @click="handleDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 风控记录 -->
        <el-tab-pane label="风控记录" name="records">
          <risk-control-records />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择">
            <el-option label="设备限制" value="device_limit" />
            <el-option label="IP限制" value="ip_limit" />
            <el-option label="订单频率" value="order_frequency" />
            <el-option label="金额阈值" value="amount_threshold" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值" prop="threshold">
          <el-input-number
            v-model="formData.threshold"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="动作" prop="action">
          <el-select v-model="formData.action" placeholder="请选择">
            <el-option label="冻结" value="freeze" />
            <el-option label="预警" value="alert" />
            <el-option label="拒绝" value="reject" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { RiskControlRule } from '@/types/profit'
import {
  getRiskControlRules,
  createRiskControlRule,
  updateRiskControlRule,
  deleteRiskControlRule,
} from '@/api/profit'
import RiskControlRecords from './RiskControlRecords.vue'

const activeTab = ref('rules')
const loading = ref(false)
const submitting = ref(false)
const ruleList = ref<RiskControlRule[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentRule = ref<RiskControlRule | null>(null)
const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  type: 'device_limit' as 'device_limit' | 'ip_limit' | 'order_frequency' | 'amount_threshold',
  threshold: 0,
  action: 'freeze' as 'freeze' | 'alert' | 'reject',
  enabled: true,
  description: '',
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
  action: [{ required: true, message: '请选择动作', trigger: 'change' }],
  description: [{ required: true, message: '请输入规则说明', trigger: 'blur' }],
}

const fetchRules = async () => {
  loading.value = true
  try {
    const res = await getRiskControlRules()
    ruleList.value = res.data
  } catch (error) {
    console.error('获取规则列表失败:', error)
    ElMessage.error('获取规则列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  currentRule.value = null
  formData.name = ''
  formData.type = 'device_limit'
  formData.threshold = 0
  formData.action = 'freeze'
  formData.description = ''
  dialogVisible.value = true
}

const handleEdit = (row: RiskControlRule) => {
  isEdit.value = true
  currentRule.value = row
  formData.name = row.name
  formData.type = row.type
  formData.threshold = row.threshold
  formData.action = row.action
  formData.description = row.description
  dialogVisible.value = true
}

const handleStatusChange = async (row: RiskControlRule) => {
  try {
    await updateRiskControlRule(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleDelete = async (row: RiskControlRule) => {
  try {
    await ElMessageBox.confirm('确认删除该规则？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteRiskControlRule(row.id)
    ElMessage.success('删除成功')
    fetchRules()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value && currentRule.value) {
        await updateRiskControlRule(currentRule.value.id, formData)
      } else {
        await createRiskControlRule(formData)
      }
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchRules()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const getRuleTypeName = (type: string) => {
  const map: Record<string, string> = {
    device_limit: '设备限制',
    ip_limit: 'IP限制',
    order_frequency: '订单频率',
    amount_threshold: '金额阈值',
  }
  return map[type] || type
}

const getActionName = (action: string) => {
  const map: Record<string, string> = {
    freeze: '冻结',
    alert: '预警',
    reject: '拒绝',
  }
  return map[action] || action
}

const getActionTag = (action: string) => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    freeze: 'danger',
    alert: 'warning',
    reject: 'info',
  }
  return map[action] || ''
}

onMounted(() => {
  fetchRules()
})
</script>

<style scoped lang="scss">
.risk-control-container {
  padding: 20px;

  }
}
</style>
