<template>
  <div class="campsite-config">
    <el-alert
      title="营地配置说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>配置不同合作类型的营地分润比例和捆绑销售加成</p>
    </el-alert>

    <el-table :data="configList" v-loading="loading" border stripe>
      <el-table-column prop="cooperationType" label="合作类型" width="150">
        <template #default="{ row }">
          <el-tag>{{ getCooperationTypeName(row.cooperationType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
        <template #default="{ row }">{{ row.baseRatio }}%</template>
      </el-table-column>
      <el-table-column prop="bundleBonus" label="捆绑加成" width="120" align="right">
        <template #default="{ row }">{{ row.bundleBonus }}%</template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="编辑营地配置" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="基础比例" prop="baseRatio">
          <el-input-number v-model="formData.baseRatio" :min="0" :max="100" :precision="2" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="捆绑加成" prop="bundleBonus">
          <el-input-number v-model="formData.bundleBonus" :min="0" :max="100" :precision="2" />
          <span style="margin-left: 10px">%</span>
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CampsiteProfitConfig, CampsiteCooperationType } from '@/types/profit'
import { getCampsiteProfitConfigs, updateCampsiteProfitConfig } from '@/api/profit'

const loading = ref(false)
const submitting = ref(false)
const configList = ref<CampsiteProfitConfig[]>([])
const currentConfig = ref<CampsiteProfitConfig | null>(null)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  baseRatio: 0,
  bundleBonus: 0,
})

const formRules: FormRules = {
  baseRatio: [{ required: true, message: '请输入基础比例', trigger: 'blur' }],
  bundleBonus: [{ required: true, message: '请输入捆绑加成', trigger: 'blur' }],
}

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await getCampsiteProfitConfigs()
    configList.value = res.data
  } catch (error) {
    console.error('获取配置失败:', error)
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: CampsiteProfitConfig) => {
  currentConfig.value = row
  formData.baseRatio = row.baseRatio
  formData.bundleBonus = row.bundleBonus
  dialogVisible.value = true
}

const handleStatusChange = async (row: CampsiteProfitConfig) => {
  try {
    await updateCampsiteProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await updateCampsiteProfitConfig(currentConfig.value!.id, {
        baseRatio: formData.baseRatio,
        bundleBonus: formData.bundleBonus,
      })
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchConfigs()
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

const getCooperationTypeName = (type: CampsiteCooperationType) => {
  const map: Record<CampsiteCooperationType, string> = {
    ground_cooperation: '地面合作',
    venue_rental: '场地租赁',
  }
  return map[type] || type
}

onMounted(() => {
  fetchConfigs()
})
</script>
