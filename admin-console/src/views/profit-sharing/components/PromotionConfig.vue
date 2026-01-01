<template>
  <div class="promotion-config">
    <el-alert title="推广配置说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>配置不同产品类型的推广分润比例、PLUS会员奖励和累计推广门槛奖励</p>
    </el-alert>

    <!-- 配置列表 -->
    <el-table :data="configList" v-loading="loading" border stripe>
      <el-table-column prop="productType" label="产品类型" width="150">
        <template #default="{ row }">
          <el-tag :type="getProductTypeTag(row.productType)">
            {{ getProductTypeName(row.productType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level1Ratio" label="一级推广比例" width="120" align="right">
        <template #default="{ row }"> {{ row.level1Ratio }}% </template>
      </el-table-column>
      <el-table-column prop="level2Ratio" label="二级推广比例" width="120" align="right">
        <template #default="{ row }"> {{ row.level2Ratio }}% </template>
      </el-table-column>
      <el-table-column prop="plusMemberDirectReward" label="PLUS直推奖励" width="130" align="right">
        <template #default="{ row }"> ¥{{ row.plusMemberDirectReward }} </template>
      </el-table-column>
      <el-table-column prop="plusMemberAssistReward" label="PLUS助力奖励" width="130" align="right">
        <template #default="{ row }"> ¥{{ row.plusMemberAssistReward }} </template>
      </el-table-column>
      <el-table-column prop="milestoneRewards" label="门槛奖励" min-width="200">
        <template #default="{ row }">
          <el-tag
            v-for="(reward, index) in row.milestoneRewards"
            :key="index"
            size="small"
            style="margin-right: 5px"
          >
            {{ reward.orderCount }}单: ¥{{ reward.reward }}
          </el-tag>
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
      :title="`编辑${getProductTypeName((currentConfig?.productType || 'vehicle_rental') as ProductType)}推广配置`"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="一级推广比例" prop="level1Ratio">
          <el-input-number
            v-model="formData.level1Ratio"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.1"
          />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="二级推广比例" prop="level2Ratio">
          <el-input-number
            v-model="formData.level2Ratio"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.1"
          />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="PLUS直推奖励" prop="plusMemberDirectReward">
          <el-input-number v-model="formData.plusMemberDirectReward" :min="0" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="PLUS助力奖励" prop="plusMemberAssistReward">
          <el-input-number v-model="formData.plusMemberAssistReward" :min="0" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="门槛奖励">
          <div
            v-for="(reward, index) in formData.milestoneRewards"
            :key="index"
            style="margin-bottom: 10px"
          >
            <el-input-number
              v-model="reward.orderCount"
              :min="1"
              placeholder="订单数"
              style="width: 120px"
            />
            <span style="margin: 0 10px">单奖励</span>
            <el-input-number
              v-model="reward.reward"
              :min="0"
              :precision="2"
              placeholder="奖励金额"
              style="width: 120px"
            />
            <span style="margin: 0 10px">元</span>
            <el-button
              type="danger"
              size="small"
              @click="handleRemoveReward(index)"
              :disabled="formData.milestoneRewards.length === 1"
            >
              删除
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="handleAddReward"> 添加门槛奖励 </el-button>
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
import type { PromotionProfitConfig, ProductType } from '@/types/profit'
import { getPromotionProfitConfigs, updatePromotionProfitConfig } from '@/api/profit'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 配置列表
const configList = ref<PromotionProfitConfig[]>([])

// 当前配置
const currentConfig = ref<PromotionProfitConfig | null>(null)

// 对话框
const dialogVisible = ref(false)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  level1Ratio: 0,
  level2Ratio: 0,
  plusMemberDirectReward: 0,
  plusMemberAssistReward: 0,
  milestoneRewards: [{ orderCount: 10, reward: 100 }],
})

// 表单规则
const formRules: FormRules = {
  level1Ratio: [{ required: true, message: '请输入一级推广比例', trigger: 'blur' }],
  level2Ratio: [{ required: true, message: '请输入二级推广比例', trigger: 'blur' }],
  plusMemberDirectReward: [{ required: true, message: '请输入PLUS直推奖励', trigger: 'blur' }],
  plusMemberAssistReward: [{ required: true, message: '请输入PLUS助力奖励', trigger: 'blur' }],
}

// 获取配置列表
const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await getPromotionProfitConfigs()
    configList.value = res.data
  } catch (error) {
    console.error('获取配置列表失败:', error)
    ElMessage.error('获取配置列表失败')
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = (row: PromotionProfitConfig) => {
  currentConfig.value = row
  formData.level1Ratio = row.level1Ratio
  formData.level2Ratio = row.level2Ratio
  formData.plusMemberDirectReward = row.plusMemberDirectReward
  formData.plusMemberAssistReward = row.plusMemberAssistReward
  formData.milestoneRewards = JSON.parse(JSON.stringify(row.milestoneRewards))
  dialogVisible.value = true
}

// 状态改变
const handleStatusChange = async (row: PromotionProfitConfig) => {
  try {
    await updatePromotionProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

// 添加门槛奖励
const handleAddReward = () => {
  formData.milestoneRewards.push({ orderCount: 10, reward: 100 })
}

// 删除门槛奖励
const handleRemoveReward = (index: number) => {
  formData.milestoneRewards.splice(index, 1)
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      await updatePromotionProfitConfig(currentConfig.value!.id, {
        level1Ratio: formData.level1Ratio,
        level2Ratio: formData.level2Ratio,
        plusMemberDirectReward: formData.plusMemberDirectReward,
        plusMemberAssistReward: formData.plusMemberAssistReward,
        milestoneRewards: formData.milestoneRewards,
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

// 获取产品类型名称
const getProductTypeName = (type: ProductType) => {
  const map: Record<ProductType, string> = {
    vehicle_rental: '房车租赁',
    campsite: '营地产品',
    tour: '房车旅游',
  }
  return map[type] || type
}

// 获取产品类型标签
const getProductTypeTag = (type: ProductType) => {
  const map: Record<ProductType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    vehicle_rental: 'primary',
    campsite: 'success',
    tour: 'warning',
  }
  return map[type] || ''
}

// 初始化
onMounted(() => {
  fetchConfigs()
})
</script>

<style scoped lang="scss">
.promotion-config {
  // 样式
}
</style>
