<template>
  <div class="hosting-config">
    <el-alert title="托管配置说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>配置不同托管类型的基础分成比例和绩效加成规则</p>
    </el-alert>

    <!-- 配置列表 -->
    <el-table :data="configList" v-loading="loading" border stripe>
      <el-table-column prop="hostingType" label="托管类型" width="150">
        <template #default="{ row }">
          <el-tag :type="getHostingTypeTag(row.hostingType)">
            {{ getHostingTypeName(row.hostingType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
        <template #default="{ row }"> {{ row.baseRatio }}% </template>
      </el-table-column>
      <el-table-column prop="performanceBonus" label="绩效加成" min-width="300">
        <template #default="{ row }">
          <el-tag
            v-for="(bonus, index) in row.performanceBonus"
            :key="index"
            size="small"
            style="margin-right: 5px"
          >
            {{ bonus.metric }}>={{ bonus.threshold }}: +{{ bonus.bonusRatio }}%
          </el-tag>
          <span v-if="row.performanceBonus.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)"> 编辑 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`编辑${getHostingTypeName((currentConfig?.hostingType || 'own_car') as HostingType)}配置`"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="基础比例" prop="baseRatio">
          <el-input-number
            v-model="formData.baseRatio"
            :min="0"
            :max="100"
            :precision="2"
            :step="1"
          />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="绩效加成">
          <div
            v-for="(bonus, index) in formData.performanceBonus"
            :key="index"
            style="margin-bottom: 10px"
          >
            <el-input v-model="bonus.metric" placeholder="指标名称" style="width: 100px" />
            <span style="margin: 0 5px">≥</span>
            <el-input-number
              v-model="bonus.threshold"
              :min="0"
              :precision="2"
              placeholder="阈值"
              style="width: 100px"
            />
            <span style="margin: 0 5px">加成</span>
            <el-input-number
              v-model="bonus.bonusRatio"
              :min="0"
              :max="100"
              :precision="2"
              placeholder="加成比例"
              style="width: 100px"
            />
            <span style="margin: 0 5px">%</span>
            <el-button type="danger" size="small" @click="handleRemoveBonus(index)">
              删除
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="handleAddBonus"> 添加绩效加成 </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"> 保存 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { HostingProfitConfig, HostingType } from '@/types/profit'
import { getHostingProfitConfigs, updateHostingProfitConfig } from '@/api/profit'

const loading = ref(false)
const submitting = ref(false)
const configList = ref<HostingProfitConfig[]>([])
const currentConfig = ref<HostingProfitConfig | null>(null)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  baseRatio: 0,
  performanceBonus: [] as Array<{ metric: string; threshold: number; bonusRatio: number }>,
})

const formRules: FormRules = {
  baseRatio: [{ required: true, message: '请输入基础比例', trigger: 'blur' }],
}

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await getHostingProfitConfigs()
    configList.value = res.data
  } catch (error) {
    console.error('获取配置列表失败:', error)
    ElMessage.error('获取配置列表失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: HostingProfitConfig) => {
  currentConfig.value = row
  formData.baseRatio = row.baseRatio
  formData.performanceBonus = JSON.parse(JSON.stringify(row.performanceBonus))
  dialogVisible.value = true
}

const handleStatusChange = async (row: HostingProfitConfig) => {
  try {
    await updateHostingProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleAddBonus = () => {
  formData.performanceBonus.push({ metric: '满意度', threshold: 4.5, bonusRatio: 5 })
}

const handleRemoveBonus = (index: number) => {
  formData.performanceBonus.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      await updateHostingProfitConfig(currentConfig.value!.id, {
        baseRatio: formData.baseRatio,
        performanceBonus: formData.performanceBonus,
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

const getHostingTypeName = (type: HostingType) => {
  const map: Record<HostingType, string> = {
    own_car: '自有车托管',
    new_car: '购车托管',
    crowdfunding: '众筹托管',
  }
  return map[type] || type
}

const getHostingTypeTag = (type: HostingType) => {
  const map: Record<HostingType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    own_car: 'primary',
    new_car: 'success',
    crowdfunding: 'warning',
  }
  return map[type] || ''
}

onMounted(() => {
  fetchConfigs()
})
</script>
