<template>
  <el-dialog
    v-model="visible"
    title="批量智能定价"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="batch-smart-pricing-container">
      <!-- 汇总信息 -->
      <el-alert v-if="batchSuggestion" type="info" :closable="false" class="summary-alert">
        <template #title>
          <div class="summary-row">
            <span><strong>选中车辆：</strong>{{ batchSuggestion.totalVehicles }} 辆</span>
            <span><strong>当前均价：</strong>¥{{ batchSuggestion.summary.averageCurrentPrice }}</span>
            <span><strong>建议均价：</strong>¥{{ batchSuggestion.summary.averageSuggestedPrice }}</span>
            <span><strong>预期收益增长：</strong>
              <el-tag :type="batchSuggestion.summary.totalRevenueImpact > 0 ? 'success' : 'danger'">
                {{ batchSuggestion.summary.totalRevenueImpact > 0 ? '+' : '' }}
                {{ batchSuggestion.summary.totalRevenueImpact }}%
              </el-tag>
            </span>
          </div>
        </template>
      </el-alert>

      <!-- 定价建议列表 -->
      <el-table
        :data="batchSuggestion?.suggestions"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
        <el-table-column prop="modelName" label="车型" width="150" />
        <el-table-column prop="currentPrice" label="当前价格" width="100">
          <template #default="{ row }">
            <span>¥{{ row.currentPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="建议策略" width="120">
          <template #default="{ row }">
            <el-select
              v-model="selectedStrategies[row.vehicleId]"
              size="small"
              @change="handleStrategyChange(row)"
            >
              <el-option
                v-for="suggestion in row.suggestions"
                :key="suggestion.strategy"
                :label="suggestion.strategyName"
                :value="suggestion.strategy"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="建议价格" width="100">
          <template #default="{ row }">
            <span class="suggested-price">
              ¥{{ getSuggestedPrice(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="价格变化" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getPriceChange(row) > 0 ? 'success' : getPriceChange(row) < 0 ? 'danger' : 'info'"
              size="small"
            >
              {{ getPriceChange(row) > 0 ? '+' : '' }}{{ getPriceChange(row) }}
              ({{ getPriceChangePercent(row) > 0 ? '+' : '' }}{{ getPriceChangePercent(row) }}%)
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getConfidence(row)"
              :color="getConfidenceColor(getConfidence(row))"
              :stroke-width="16"
            />
          </template>
        </el-table-column>
        <el-table-column label="竞争力" width="100">
          <template #default="{ row }">
            <el-tag :type="getCompetitivenessTagType(getCompetitiveness(row))">
              {{ getCompetitivenessLabel(getCompetitiveness(row)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <div class="selection-info">
          已选择 <strong>{{ selectedSuggestions.length }}</strong> 辆车
        </div>
        <div class="action-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :disabled="selectedSuggestions.length === 0"
            :loading="applying"
            @click="handleBatchApply"
          >
            应用选中 ({{ selectedSuggestions.length }})
          </el-button>
          <el-button
            type="success"
            :loading="applying"
            @click="handleApplyAll"
          >
            应用全部 ({{ batchSuggestion?.totalVehicles || 0 }})
          </el-button>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <SmartPricingSuggestion
      v-if="detailVehicleId"
      v-model="detailVisible"
      :vehicle-id="detailVehicleId"
      @applied="handleDetailApplied"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBatchPricingSuggestions, batchApplySmartPricing } from '@/api/priceAnalysis'
import SmartPricingSuggestion from './SmartPricingSuggestion.vue'
import type { BatchPricingSuggestion, SmartPricingSuggestion as SmartPricingSuggestionType } from '@/types/system'

interface Props {
  vehicleIds: number[]
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'applied'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const loading = ref(false)
const applying = ref(false)
const batchSuggestion = ref<BatchPricingSuggestion>()
const selectedSuggestions = ref<SmartPricingSuggestionType[]>([])
const selectedStrategies = reactive<Record<number, string>>({})

// 详情对话框
const detailVisible = ref(false)
const detailVehicleId = ref<number>()

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadBatchSuggestions()
  }
})

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载批量智能定价建议
const loadBatchSuggestions = async () => {
  loading.value = true
  try {
    batchSuggestion.value = await getBatchPricingSuggestions(props.vehicleIds)

    // 初始化默认策略（平衡策略）
    batchSuggestion.value.suggestions.forEach(suggestion => {
      selectedStrategies[suggestion.vehicleId] = 'balanced'
    })
  } catch (error) {
    console.error('加载批量智能定价建议失败:', error)
    ElMessage.error('加载批量智能定价建议失败')
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection: SmartPricingSuggestionType[]) => {
  selectedSuggestions.value = selection
}

// 处理策略变化
const handleStrategyChange = (row: SmartPricingSuggestionType) => {
  // 策略变化时更新显示
  console.log('策略变化:', row.vehicleId, selectedStrategies[row.vehicleId])
}

// 获取建议价格
const getSuggestedPrice = (row: SmartPricingSuggestionType): number => {
  const strategy = selectedStrategies[row.vehicleId] || 'balanced'
  const suggestion = row.suggestions.find(s => s.strategy === strategy)
  return suggestion?.suggestedPrice || row.currentPrice
}

// 获取价格变化
const getPriceChange = (row: SmartPricingSuggestionType): number => {
  return getSuggestedPrice(row) - row.currentPrice
}

// 获取价格变化百分比
const getPriceChangePercent = (row: SmartPricingSuggestionType): number => {
  const change = getPriceChange(row)
  return row.currentPrice > 0 ? Math.round((change / row.currentPrice) * 100) : 0
}

// 获取置信度
const getConfidence = (row: SmartPricingSuggestionType): number => {
  const strategy = selectedStrategies[row.vehicleId] || 'balanced'
  const suggestion = row.suggestions.find(s => s.strategy === strategy)
  return suggestion?.confidence || 0
}

// 获取竞争力
const getCompetitiveness = (row: SmartPricingSuggestionType): string => {
  const strategy = selectedStrategies[row.vehicleId] || 'balanced'
  const suggestion = row.suggestions.find(s => s.strategy === strategy)
  return suggestion?.expectedImpact.competitiveness || 'medium'
}

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return '#67c23a'
  if (confidence >= 70) return '#409eff'
  return '#e6a23c'
}

// 获取竞争力标签类型
const getCompetitivenessTagType = (competitiveness: string) => {
  if (competitiveness === 'high') return 'success'
  if (competitiveness === 'medium') return 'warning'
  return 'danger'
}

// 获取竞争力标签文本
const getCompetitivenessLabel = (competitiveness: string) => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  }
  return labels[competitiveness] || '未知'
}

// 查看详情
const handleViewDetail = (row: SmartPricingSuggestionType) => {
  detailVehicleId.value = row.vehicleId
  detailVisible.value = true
}

// 详情应用后
const handleDetailApplied = () => {
  // 重新加载数据
  loadBatchSuggestions()
}

// 批量应用选中
const handleBatchApply = async () => {
  if (selectedSuggestions.value.length === 0) {
    ElMessage.warning('请先选择要应用的车辆')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要为选中的 ${selectedSuggestions.value.length} 辆车应用智能定价建议吗？`,
      '确认应用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    applying.value = true
    const applications = selectedSuggestions.value.map(suggestion => ({
      vehicleId: suggestion.vehicleId,
      strategy: selectedStrategies[suggestion.vehicleId] || 'balanced',
    }))

    await batchApplySmartPricing(applications)
    ElMessage.success(`成功为 ${applications.length} 辆车应用智能定价`)
    emit('applied')
    handleClose()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量应用失败:', error)
      ElMessage.error('批量应用失败')
    }
  } finally {
    applying.value = false
  }
}

// 应用全部
const handleApplyAll = async () => {
  if (!batchSuggestion.value) return

  try {
    await ElMessageBox.confirm(
      `确定要为全部 ${batchSuggestion.value.totalVehicles} 辆车应用智能定价建议吗？`,
      '确认应用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    applying.value = true
    const applications = batchSuggestion.value.suggestions.map(suggestion => ({
      vehicleId: suggestion.vehicleId,
      strategy: selectedStrategies[suggestion.vehicleId] || 'balanced',
    }))

    await batchApplySmartPricing(applications)
    ElMessage.success(`成功为 ${applications.length} 辆车应用智能定价`)
    emit('applied')
    handleClose()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量应用失败:', error)
      ElMessage.error('批量应用失败')
    }
  } finally {
    applying.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  selectedSuggestions.value = []
}
</script>

<style scoped lang="scss">
.batch-smart-pricing-container {
  .summary-alert {
    margin-bottom: 20px;

    .summary-row {
      display: flex;
      gap: 30px;
      font-size: 14px;
    }
  }

  .suggested-price {
    font-weight: bold;
    color: #409eff;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;

    .selection-info {
      font-size: 14px;
      color: #606266;

      strong {
        color: #409eff;
        font-size: 16px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }
}
</style>
