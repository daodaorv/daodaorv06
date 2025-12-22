<template>
  <el-dialog
    v-model="visible"
    title="批量计算基础租金"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-alert
      title="批量计算说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>已选择 <strong>{{ selectedVehicles.length }}</strong> 辆车进行批量计算</p>
      <p>系统将使用统一的计算参数为所有车辆计算建议租金，您可以预览结果后选择性应用</p>
    </el-alert>

    <!-- 计算参数配置 -->
    <el-card shadow="never" style="margin-bottom: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>计算参数配置</span>
          <el-button type="primary" size="small" @click="handleCalculate" :loading="calculating">
            <el-icon><Operation /></el-icon>
            开始计算
          </el-button>
        </div>
      </template>

      <el-form :model="params" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-divider content-position="left">财务参数</el-divider>
            <el-form-item label="目标年化收益率">
              <el-input-number
                v-model="params.targetAnnualReturn"
                :min="0.01"
                :max="0.5"
                :step="0.01"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 8px">%</span>
            </el-form-item>
            <el-form-item label="投资周期">
              <el-input-number
                v-model="params.investmentPeriod"
                :min="1"
                :max="20"
                :step="1"
                style="width: 100%"
              />
              <span style="margin-left: 8px">年</span>
            </el-form-item>
            <el-form-item label="残值率">
              <el-input-number
                v-model="params.residualValueRate"
                :min="0.1"
                :max="0.8"
                :step="0.01"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 8px">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-divider content-position="left">运营参数</el-divider>
            <el-form-item label="年运营率">
              <el-input-number
                v-model="params.annualOperatingRate"
                :min="0.1"
                :max="1.0"
                :step="0.01"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 8px">%</span>
            </el-form-item>
            <el-form-item label="运营成本占比">
              <el-input-number
                v-model="params.operatingCostRate"
                :min="0.1"
                :max="0.9"
                :step="0.01"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 8px">%</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算结果表格 -->
    <el-card shadow="never" v-if="results.length > 0">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>计算结果（{{ results.length }} 辆）</span>
          <div>
            <el-button
              type="success"
              size="small"
              @click="handleApplySelected"
              :disabled="selectedResults.length === 0"
            >
              应用选中 ({{ selectedResults.length }})
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleApplyAll"
            >
              应用全部
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="results"
        border
        stripe
        max-height="400"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="vehicleNumber" label="车牌号" width="120" fixed="left" />
        <el-table-column label="购买信息" width="180">
          <template #default="{ row }">
            <div>购买价格: ¥{{ row.purchasePrice.toLocaleString() }}</div>
            <div style="font-size: 12px; color: #909399">
              购买日期: {{ row.purchaseDate }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="车况评级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeTagType(row.conditionGrade)" size="small">
              {{ row.conditionGrade }}级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前租金" width="100" align="right">
          <template #default="{ row }">
            <span style="color: #909399">¥{{ row.currentPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="建议租金" width="100" align="right">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: bold">
              ¥{{ row.suggestedPrice }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="价格变化" width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.priceChange !== 0" :style="{ color: row.priceChange > 0 ? '#f56c6c' : '#67c23a' }">
              <el-icon v-if="row.priceChange > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ row.priceChange > 0 ? '+' : '' }}{{ row.priceChange }}
              ({{ row.priceChangePercent > 0 ? '+' : '' }}{{ row.priceChangePercent }}%)
            </div>
            <span v-else style="color: #909399">无变化</span>
          </template>
        </el-table-column>
        <el-table-column label="计算状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.success" type="success" size="small">成功</el-tag>
            <el-tooltip v-else :content="row.error" placement="top">
              <el-tag type="danger" size="small">失败</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="计算明细" min-width="200">
          <template #default="{ row }">
            <el-collapse accordion v-if="row.success">
              <el-collapse-item title="查看详情" name="1">
                <el-descriptions :column="1" size="small" border>
                  <el-descriptions-item label="预期总资产">
                    ¥{{ row.breakdown.expectedTotalAsset.toLocaleString() }}
                  </el-descriptions-item>
                  <el-descriptions-item label="残值">
                    ¥{{ row.breakdown.residualValue.toLocaleString() }}
                  </el-descriptions-item>
                  <el-descriptions-item label="所需净收入">
                    ¥{{ row.breakdown.requiredNetIncome.toLocaleString() }}
                  </el-descriptions-item>
                  <el-descriptions-item label="总营收">
                    ¥{{ row.breakdown.totalRevenue.toLocaleString() }}
                  </el-descriptions-item>
                  <el-descriptions-item label="年均营收">
                    ¥{{ row.breakdown.annualRevenue.toLocaleString() }}
                  </el-descriptions-item>
                  <el-descriptions-item label="运营天数">
                    {{ row.breakdown.operatingDays }} 天/年
                  </el-descriptions-item>
                  <el-descriptions-item label="基础日租金">
                    ¥{{ row.breakdown.baseDailyPrice }}
                  </el-descriptions-item>
                  <el-descriptions-item label="车况溢价">
                    {{ row.breakdown.conditionPremium }}x
                  </el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
            <span v-else style="color: #f56c6c; font-size: 12px">{{ row.error }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <div style="margin-top: 20px; padding: 15px; background: #f5f7fa; border-radius: 4px">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">成功计算</div>
              <div class="stat-value" style="color: #67c23a">
                {{ successCount }} / {{ results.length }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">平均建议租金</div>
              <div class="stat-value">¥{{ avgSuggestedPrice }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">最高建议租金</div>
              <div class="stat-value" style="color: #f56c6c">¥{{ maxSuggestedPrice }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">最低建议租金</div>
              <div class="stat-value" style="color: #67c23a">¥{{ minSuggestedPrice }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 进度条 -->
    <el-progress
      v-if="calculating"
      :percentage="progress"
      :status="progress === 100 ? 'success' : undefined"
      style="margin-top: 20px"
    >
      <span>{{ progressText }}</span>
    </el-progress>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Operation, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { calculateBaseRental, detectConditionGrade } from '@/utils/baseRentalCalculator'
import type { CalculationParams, CalculationResult } from '@/types/system'
import type { Vehicle } from '@/mock/vehicles'
import { DEFAULT_FINANCIAL_PARAMS, DEFAULT_OPERATIONAL_PARAMS } from '@/constants/conditionGrades'

interface BatchCalculationResult {
  vehicleId: number
  vehicleNumber: string
  purchasePrice: number
  purchaseDate: string
  conditionGrade: 'A' | 'B' | 'C' | 'D'
  currentPrice: number
  suggestedPrice: number
  priceChange: number
  priceChangePercent: number
  success: boolean
  error?: string
  breakdown: CalculationResult['breakdown']
}

interface Props {
  modelValue: boolean
  selectedVehicles: Vehicle[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', results: Array<{ vehicleId: number; dailyPrice: number; calculationParams: any }>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 计算参数
const params = ref({
  targetAnnualReturn: DEFAULT_FINANCIAL_PARAMS.TARGET_ANNUAL_RETURN * 100, // 转换为百分比
  investmentPeriod: DEFAULT_FINANCIAL_PARAMS.INVESTMENT_PERIOD,
  residualValueRate: DEFAULT_FINANCIAL_PARAMS.RESIDUAL_VALUE_RATE * 100,
  annualOperatingRate: DEFAULT_OPERATIONAL_PARAMS.ANNUAL_OPERATING_RATE * 100,
  operatingCostRate: DEFAULT_OPERATIONAL_PARAMS.OPERATING_COST_RATE * 100,
})

// 计算状态
const calculating = ref(false)
const progress = ref(0)
const progressText = ref('')

// 计算结果
const results = ref<BatchCalculationResult[]>([])
const selectedResults = ref<BatchCalculationResult[]>([])

// 统计数据
const successCount = computed(() => results.value.filter(r => r.success).length)
const avgSuggestedPrice = computed(() => {
  const successResults = results.value.filter(r => r.success)
  if (successResults.length === 0) return 0
  const sum = successResults.reduce((acc, r) => acc + r.suggestedPrice, 0)
  return Math.round(sum / successResults.length)
})
const maxSuggestedPrice = computed(() => {
  const successResults = results.value.filter(r => r.success)
  if (successResults.length === 0) return 0
  return Math.max(...successResults.map(r => r.suggestedPrice))
})
const minSuggestedPrice = computed(() => {
  const successResults = results.value.filter(r => r.success)
  if (successResults.length === 0) return 0
  return Math.min(...successResults.map(r => r.suggestedPrice))
})

// 获取车况评级标签类型
const getGradeTagType = (grade: string): 'success' | 'primary' | 'warning' | 'info' => {
  const typeMap: Record<string, 'success' | 'primary' | 'warning' | 'info'> = {
    A: 'success',
    B: 'primary',
    C: 'warning',
    D: 'info',
  }
  return typeMap[grade] || 'info'
}

// 批量计算
const handleCalculate = async () => {
  if (props.selectedVehicles.length === 0) {
    ElMessage.warning('没有选中的车辆')
    return
  }

  calculating.value = true
  progress.value = 0
  results.value = []

  try {
    const total = props.selectedVehicles.length
    const calculationResults: BatchCalculationResult[] = []

    for (let i = 0; i < total; i++) {
      const vehicle = props.selectedVehicles[i]
      progressText.value = `正在计算 ${vehicle.vehicleNumber} (${i + 1}/${total})`

      try {
        // 验证必要字段
        if (!vehicle.purchasePrice || vehicle.purchasePrice <= 0) {
          throw new Error('购买价格无效')
        }
        if (!vehicle.purchaseDate) {
          throw new Error('购买日期缺失')
        }

        // 检测车况评级
        const conditionGrade = vehicle.conditionGrade || detectConditionGrade(vehicle.purchaseDate)

        // 构建计算参数
        const calculationParams: CalculationParams = {
          purchasePrice: vehicle.purchasePrice,
          purchaseDate: vehicle.purchaseDate,
          conditionGrade,
          targetAnnualReturn: params.value.targetAnnualReturn / 100,
          investmentPeriod: params.value.investmentPeriod,
          residualValueRate: params.value.residualValueRate / 100,
          annualOperatingRate: params.value.annualOperatingRate / 100,
          operatingCostRate: params.value.operatingCostRate / 100,
        }

        // 计算基础租金
        const result = calculateBaseRental(calculationParams)

        // 计算价格变化
        const priceChange = result.suggestedDailyPrice - vehicle.dailyPrice
        const priceChangePercent = vehicle.dailyPrice > 0
          ? Math.round((priceChange / vehicle.dailyPrice) * 100)
          : 0

        calculationResults.push({
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          purchasePrice: vehicle.purchasePrice,
          purchaseDate: vehicle.purchaseDate,
          conditionGrade,
          currentPrice: vehicle.dailyPrice,
          suggestedPrice: result.suggestedDailyPrice,
          priceChange,
          priceChangePercent,
          success: true,
          breakdown: result.breakdown,
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '计算失败'
        calculationResults.push({
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          purchasePrice: vehicle.purchasePrice || 0,
          purchaseDate: vehicle.purchaseDate || '',
          conditionGrade: vehicle.conditionGrade || 'B',
          currentPrice: vehicle.dailyPrice,
          suggestedPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          success: false,
          error: errorMessage,
          breakdown: {
            expectedTotalAsset: 0,
            residualValue: 0,
            requiredNetIncome: 0,
            totalRevenue: 0,
            annualRevenue: 0,
            operatingDays: 0,
            baseDailyPrice: 0,
            conditionPremium: 0,
          },
        })
      }

      // 更新进度
      progress.value = Math.round(((i + 1) / total) * 100)

      // 模拟延迟，避免计算过快
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    results.value = calculationResults
    progressText.value = '计算完成'

    ElMessage.success(`批量计算完成！成功 ${successCount.value} 辆，失败 ${total - successCount.value} 辆`)
  } catch (error) {
    console.error('批量计算失败:', error)
    ElMessage.error('批量计算失败')
  } finally {
    calculating.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: BatchCalculationResult[]) => {
  selectedResults.value = selection
}

// 应用选中
const handleApplySelected = async () => {
  if (selectedResults.value.length === 0) {
    ElMessage.warning('请先选择要应用的车辆')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要应用选中的 ${selectedResults.value.length} 辆车的建议租金吗？`,
      '确认应用',
      {
        type: 'warning',
      }
    )

    const applyData = selectedResults.value
      .filter(r => r.success)
      .map(r => ({
        vehicleId: r.vehicleId,
        dailyPrice: r.suggestedPrice,
        calculationParams: {
          targetAnnualReturn: params.value.targetAnnualReturn / 100,
          residualValueRate: params.value.residualValueRate / 100,
          annualOperatingRate: params.value.annualOperatingRate / 100,
          operatingCostRate: params.value.operatingCostRate / 100,
          conditionPremium: r.breakdown.conditionPremium,
          calculatedAt: new Date().toISOString(),
        },
      }))

    emit('success', applyData)
    ElMessage.success(`已应用 ${applyData.length} 辆车的建议租金`)
    handleClose()
  } catch (error: unknown) {
    if (error === 'cancel') {
      return
    }
    console.error('应用失败:', error)
  }
}

// 应用全部
const handleApplyAll = async () => {
  const successResults = results.value.filter(r => r.success)
  if (successResults.length === 0) {
    ElMessage.warning('没有成功计算的车辆')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要应用全部 ${successResults.length} 辆车的建议租金吗？`,
      '确认应用',
      {
        type: 'warning',
      }
    )

    const applyData = successResults.map(r => ({
      vehicleId: r.vehicleId,
      dailyPrice: r.suggestedPrice,
      calculationParams: {
        targetAnnualReturn: params.value.targetAnnualReturn / 100,
        residualValueRate: params.value.residualValueRate / 100,
        annualOperatingRate: params.value.annualOperatingRate / 100,
        operatingCostRate: params.value.operatingCostRate / 100,
        conditionPremium: r.breakdown.conditionPremium,
        calculatedAt: new Date().toISOString(),
      },
    }))

    emit('success', applyData)
    ElMessage.success(`已应用 ${applyData.length} 辆车的建议租金`)
    handleClose()
  } catch (error: unknown) {
    if (error === 'cancel') {
      return
    }
    console.error('应用失败:', error)
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  results.value = []
  selectedResults.value = []
  progress.value = 0
  progressText.value = ''
}

// 监听对话框打开，重置参数
watch(visible, (val) => {
  if (val) {
    params.value = {
      targetAnnualReturn: DEFAULT_FINANCIAL_PARAMS.TARGET_ANNUAL_RETURN * 100,
      investmentPeriod: DEFAULT_FINANCIAL_PARAMS.INVESTMENT_PERIOD,
      residualValueRate: DEFAULT_FINANCIAL_PARAMS.RESIDUAL_VALUE_RATE * 100,
      annualOperatingRate: DEFAULT_OPERATIONAL_PARAMS.ANNUAL_OPERATING_RATE * 100,
      operatingCostRate: DEFAULT_OPERATIONAL_PARAMS.OPERATING_COST_RATE * 100,
    }
  }
})
</script>

<style scoped lang="scss">
.stat-item {
  text-align: center;

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
  }
}

:deep(.el-collapse-item__header) {
  font-size: 12px;
  padding: 0;
  height: 32px;
  line-height: 32px;
}

:deep(.el-collapse-item__content) {
  padding: 10px 0;
}
</style>
