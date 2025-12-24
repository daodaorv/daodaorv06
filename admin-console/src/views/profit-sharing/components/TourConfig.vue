<template>
  <div class="tour-config">
    <el-alert title="旅游配置说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>配置不同旅游产品类型的分润比例、满意度加成和众筹分润规则</p>
    </el-alert>

    <el-table :data="configList" v-loading="loading" border stripe>
      <el-table-column prop="productType" label="产品类型" width="150">
        <template #default="{ row }">
          <el-tag>{{ getProductTypeName(row.productType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
        <template #default="{ row }">{{ row.baseRatio }}%</template>
      </el-table-column>
      <el-table-column prop="satisfactionBonus" label="满意度加成" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="(bonus, index) in row.satisfactionBonus" :key="index" size="small" style="margin-right: 5px">
            评分≥{{ bonus.minRating }}: +{{ bonus.bonusRatio }}%
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="crowdfundingRatio" label="众筹比例" width="120" align="right">
        <template #default="{ row }">{{ row.crowdfundingRatio }}%</template>
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

    <el-dialog v-model="dialogVisible" title="编辑旅游配置" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="基础比例" prop="baseRatio">
          <el-input-number v-model="formData.baseRatio" :min="0" :max="100" :precision="2" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="众筹比例" prop="crowdfundingRatio">
          <el-input-number v-model="formData.crowdfundingRatio" :min="0" :max="100" :precision="2" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="满意度加成">
          <div v-for="(bonus, index) in formData.satisfactionBonus" :key="index" style="margin-bottom: 10px">
            <span>评分≥</span>
            <el-input-number v-model="bonus.minRating" :min="0" :max="5" :precision="1" :step="0.1" style="width: 100px; margin: 0 5px" />
            <span>加成</span>
            <el-input-number v-model="bonus.bonusRatio" :min="0" :max="100" :precision="2" style="width: 100px; margin: 0 5px" />
            <span>%</span>
            <el-button type="danger" size="small" @click="handleRemoveBonus(index)">删除</el-button>
          </div>
          <el-button type="primary" size="small" @click="handleAddBonus">添加满意度加成</el-button>
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
import type { TourProfitConfig, TourProductType } from '@/types/profit'
import { getTourProfitConfigs, updateTourProfitConfig } from '@/api/profit'

const loading = ref(false)
const submitting = ref(false)
const configList = ref<TourProfitConfig[]>([])
const currentConfig = ref<TourProfitConfig | null>(null)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  baseRatio: 0,
  crowdfundingRatio: 0,
  satisfactionBonus: [] as Array<{ minRating: number; bonusRatio: number }>,
})

const formRules: FormRules = {
  baseRatio: [{ required: true, message: '请输入基础比例', trigger: 'blur' }],
  crowdfundingRatio: [{ required: true, message: '请输入众筹比例', trigger: 'blur' }],
}

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await getTourProfitConfigs()
    configList.value = res.data
  } catch (error) {
    console.error('获取配置失败:', error)
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: TourProfitConfig) => {
  currentConfig.value = row
  formData.baseRatio = row.baseRatio
  formData.crowdfundingRatio = row.crowdfundingRatio
  formData.satisfactionBonus = JSON.parse(JSON.stringify(row.satisfactionBonus))
  dialogVisible.value = true
}

const handleStatusChange = async (row: TourProfitConfig) => {
  try {
    await updateTourProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleAddBonus = () => {
  formData.satisfactionBonus.push({ minRating: 4.5, bonusRatio: 5 })
}

const handleRemoveBonus = (index: number) => {
  formData.satisfactionBonus.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await updateTourProfitConfig(currentConfig.value!.id, {
        baseRatio: formData.baseRatio,
        crowdfundingRatio: formData.crowdfundingRatio,
        satisfactionBonus: formData.satisfactionBonus,
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

const getProductTypeName = (type: TourProductType) => {
  const map: Record<TourProductType, string> = {
    self_drive: '自驾线路',
    butler_route: '管家路线',
  }
  return map[type] || type
}

onMounted(() => {
  fetchConfigs()
})
</script>
