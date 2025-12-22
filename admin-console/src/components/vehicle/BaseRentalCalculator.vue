<!-- @ts-nocheck -->
<template>
  <div class="base-rental-calculator">
    <el-alert
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    >
      <template #title>
        <div style="font-size: 13px">
          根据车辆购买价格、车况评级等参数，智能计算建议的基础日租金
        </div>
      </template>
    </el-alert>

    <!-- 输入参数区域 -->
    <el-form :model="calcParams" label-width="140px" size="default">
      <!-- 必填参数 -->
      <el-divider content-position="left">基础信息</el-divider>

      <el-form-item label="购买价格" required>
        <el-input-number
          v-model="calcParams.purchasePrice"
          :min="0"
          :step="10000"
          :precision="0"
          style="width: 100%"
          placeholder="请输入购买价格"
          @change="handleParamChange"
        >
          <template #suffix>元</template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="购买日期" required>
        <el-date-picker
          v-model="calcParams.purchaseDate"
          type="date"
          placeholder="选择购买日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          @change="handlePurchaseDateChange"
        />
      </el-form-item>

      <el-form-item label="车况评级" required>
        <el-select
          v-model="calcParams.conditionGrade"
          placeholder="选择车况评级"
          style="width: 100%"
          @change="handleParamChange"
        >
          <el-option
            v-for="grade in conditionGrades"
            :key="grade.grade"
            :label="`${grade.name}(${grade.grade}级) - ${grade.description}`"
            :value="grade.grade"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ grade.name }}({{ grade.grade }}级)</span>
              <el-tag size="small" :type="getGradeTagType(grade.grade)">
                溢价×{{ grade.premiumMultiplier }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
        <div v-if="autoDetectedGrade" style="margin-top: 4px; font-size: 12px; color: #67c23a">
          <el-icon><InfoFilled /></el-icon>
          根据购买日期，建议评级：{{ autoDetectedGrade.name }}({{ autoDetectedGrade.grade }}级)
        </div>
      </el-form-item>

      <!-- 高级参数(可折叠) -->
      <el-divider content-position="left">
        <el-button
          text
          size="small"
          @click="showAdvanced = !showAdvanced"
        >
          高级参数
          <el-icon>
            <component :is="showAdvanced ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </el-button>
      </el-divider>

      <el-collapse-transition>
        <div v-show="showAdvanced" class="advanced-params">
          <el-form-item label="目标年化收益率">
            <el-input-number
              v-model="calcParams.targetAnnualReturn"
              :min="0"
              :max="50"
              :step="0.5"
              :precision="1"
              style="width: 100%"
              @change="handleParamChange"
            >
              <template #suffix>%</template>
            </el-input-number>
          </el-form-item>

          <el-form-item label="投资周期">
            <el-input-number
              v-model="calcParams.investmentPeriod"
              :min="1"
              :max="10"
              :step="1"
              style="width: 100%"
              @change="handleParamChange"
            >
              <template #suffix>年</template>
            </el-input-number>
          </el-form-item>

          <el-form-item label="残值率">
            <el-slider
              v-model="calcParams.residualValueRate"
              :min="0"
              :max="100"
              :step="5"
              show-input
              @change="handleParamChange"
            />
          </el-form-item>

          <el-form-item label="年运营率">
            <el-slider
              v-model="calcParams.annualOperatingRate"
              :min="10"
              :max="100"
              :step="5"
              show-input
              @change="handleParamChange"
            />
            <div class="param-hint">
              预计年运营{{ Math.round(365 * calcParams.annualOperatingRate / 100) }}天
            </div>
          </el-form-item>

          <el-form-item label="运营成本占比">
            <el-slider
              v-model="calcParams.operatingCostRate"
              :min="0"
              :max="80"
              :step="5"
              show-input
              @change="handleParamChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button size="small" @click="resetToDefaults">
              恢复默认值
            </el-button>
          </el-form-item>
        </div>
      </el-collapse-transition>
    </el-form>

    <!-- 计算按钮 -->
    <div class="calculator-actions">
      <el-button
        type="primary"
        :loading="calculating"
        :disabled="!canCalculate"
        @click="handleCalculate"
        style="width: 100%"
      >
        <el-icon><Money /></el-icon>
        计算建议租金
      </el-button>
    </div>

    <!-- 计算结果区域 -->
    <div v-if="result" class="calculator-result">
      <el-divider />

      <!-- 建议租金展示 -->
      <div class="result-highlight">
        <div class="result-label">建议基础日租金</div>
        <div class="result-value">¥{{ result.suggestedDailyPrice }}</div>
        <div class="result-hint">此价格为基础价，实际订单价格还需叠加城市因子、时间因子等</div>
      </div>

      <!-- 计算明细 -->
      <el-collapse v-model="activeCollapse" class="result-details">
        <el-collapse-item title="计算过程" name="process">
          <div class="calculation-steps">
            <div
              v-for="(step, index) in result.explanation"
              :key="index"
              class="step-item"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="详细数据" name="breakdown">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="期望总资产">
              ¥{{ Math.round(result.breakdown.expectedTotalAsset).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="残值">
              ¥{{ Math.round(result.breakdown.residualValue).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="需要净收入">
              ¥{{ Math.round(result.breakdown.requiredNetIncome).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="总营收需求">
              ¥{{ Math.round(result.breakdown.totalRevenue).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="年均营收">
              ¥{{ Math.round(result.breakdown.annualRevenue).toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="年运营天数">
              {{ Math.round(result.breakdown.operatingDays) }}天
            </el-descriptions-item>
            <el-descriptions-item label="基础日租金">
              ¥{{ Math.round(result.breakdown.baseDailyPrice) }}
            </el-descriptions-item>
            <el-descriptions-item label="车况溢价系数">
              ×{{ result.breakdown.conditionPremium }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>

      <!-- 警告信息 -->
      <div v-if="result.warnings.length > 0" class="result-warnings">
        <el-alert
          v-for="(warning, index) in result.warnings"
          :key="index"
          :title="warning"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 8px"
        />
      </div>

      <!-- 应用按钮 -->
      <div class="result-actions">
        <el-button type="success" @click="handleApplyPrice">
          <el-icon><Check /></el-icon>
          应用此价格
        </el-button>
        <el-button @click="result = null">
          清除结果
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  InfoFilled,
  Check,
  Money,
} from '@element-plus/icons-vue'
import { calculateBaseRental, detectConditionGrade } from '@/utils/baseRentalCalculator'
import { CONDITION_GRADES, DEFAULT_FINANCIAL_PARAMS, DEFAULT_OPERATIONAL_PARAMS } from '@/constants/conditionGrades'
import type { CalculationResult } from '@/types/system'

// Props
interface Props {
  purchasePrice?: number
  purchaseDate?: string
  conditionGrade?: 'A' | 'B' | 'C' | 'D'
}

const props = withDefaults(defineProps<Props>(), {
  purchasePrice: 0,
  purchaseDate: '',
  conditionGrade: 'B',
})

// Emits
const emit = defineEmits<{
  apply: [price: number, result: CalculationResult]
}>()

// 参数
const calcParams = reactive({
  purchasePrice: props.purchasePrice || 0,
  purchaseDate: props.purchaseDate || '',
  conditionGrade: props.conditionGrade || 'B' as 'A' | 'B' | 'C' | 'D',
  targetAnnualReturn: DEFAULT_FINANCIAL_PARAMS.TARGET_ANNUAL_RETURN * 100, // 转换为百分比
  investmentPeriod: DEFAULT_FINANCIAL_PARAMS.INVESTMENT_PERIOD,
  residualValueRate: DEFAULT_FINANCIAL_PARAMS.RESIDUAL_VALUE_RATE * 100, // 转换为百分比
  annualOperatingRate: DEFAULT_OPERATIONAL_PARAMS.ANNUAL_OPERATING_RATE * 100, // 转换为百分比
  operatingCostRate: DEFAULT_OPERATIONAL_PARAMS.OPERATING_COST_RATE * 100, // 转换为百分比
})

// 数据
const conditionGrades = CONDITION_GRADES
const calculating = ref(false)
const result = ref<CalculationResult | null>(null)
const showAdvanced = ref(false)
const activeCollapse = ref(['process'])
const autoDetectedGrade = ref<typeof CONDITION_GRADES[0] | null>(null)

// 是否可以计算
const canCalculate = computed(() => {
  return calcParams.purchasePrice > 0 && calcParams.purchaseDate && calcParams.conditionGrade
})

// 监听 props 变化
watch(() => props.purchasePrice, (val) => {
  if (val) calcParams.purchasePrice = val
})

watch(() => props.purchaseDate, (val) => {
  if (val) {
    calcParams.purchaseDate = val
    handlePurchaseDateChange()
  }
})

watch(() => props.conditionGrade, (val) => {
  if (val) calcParams.conditionGrade = val
})

// 购买日期变化 - 自动检测车况评级
const handlePurchaseDateChange = () => {
  if (calcParams.purchaseDate) {
    const detectedGrade = detectConditionGrade(calcParams.purchaseDate)
    const gradeConfig = CONDITION_GRADES.find(g => g.grade === detectedGrade)
    autoDetectedGrade.value = gradeConfig || null
  } else {
    autoDetectedGrade.value = null
  }
  handleParamChange()
}

// 参数变化
const handleParamChange = () => {
  // 清空结果
  result.value = null
}

// 恢复默认值
const resetToDefaults = () => {
  calcParams.targetAnnualReturn = DEFAULT_FINANCIAL_PARAMS.TARGET_ANNUAL_RETURN * 100
  calcParams.investmentPeriod = DEFAULT_FINANCIAL_PARAMS.INVESTMENT_PERIOD
  calcParams.residualValueRate = DEFAULT_FINANCIAL_PARAMS.RESIDUAL_VALUE_RATE * 100
  calcParams.annualOperatingRate = DEFAULT_OPERATIONAL_PARAMS.ANNUAL_OPERATING_RATE * 100
  calcParams.operatingCostRate = DEFAULT_OPERATIONAL_PARAMS.OPERATING_COST_RATE * 100
  handleParamChange()
}

// 计算价格
const handleCalculate = () => {
  if (!canCalculate.value) {
    ElMessage.warning('请完整填写所有必填参数')
    return
  }

  calculating.value = true
  try {
    // 调用计算函数(将百分比转换回小数)
    result.value = calculateBaseRental({
      purchasePrice: calcParams.purchasePrice,
      purchaseDate: calcParams.purchaseDate,
      conditionGrade: calcParams.conditionGrade,
      targetAnnualReturn: calcParams.targetAnnualReturn / 100,
      investmentPeriod: calcParams.investmentPeriod,
      residualValueRate: calcParams.residualValueRate / 100,
      annualOperatingRate: calcParams.annualOperatingRate / 100,
      operatingCostRate: calcParams.operatingCostRate / 100,
    })

    ElMessage.success('价格计算完成')
  } catch (error: unknown) {
    console.error('价格计算失败:', error)
    if (error instanceof Error) {
      ElMessage.error(`计算失败: ${error.message}`)
    } else {
      ElMessage.error('价格计算失败')
    }
  } finally {
    calculating.value = false
  }
}

// 应用价格
const handleApplyPrice = () => {
  if (result.value) {
    emit('apply', result.value.suggestedDailyPrice, result.value)
    ElMessage.success('已应用建议价格')
  }
}

// 获取评级标签类型
const getGradeTagType = (grade: string): 'success' | 'primary' | 'warning' | 'info' => {
  const typeMap: Record<string, 'success' | 'primary' | 'warning' | 'info'> = {
    A: 'success',
    B: 'primary',
    C: 'warning',
    D: 'info',
  }
  return typeMap[grade] || 'info'
}
</script>

<style scoped lang="scss">
.base-rental-calculator {
  .advanced-params {
    padding: 0 0 16px 0;

    .param-hint {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
    }
  }

  .calculator-actions {
    margin-top: 16px;
  }

  .calculator-result {
    .result-highlight {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
      margin-bottom: 16px;

      .result-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .result-value {
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .result-hint {
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .result-details {
      margin-top: 16px;

      .calculation-steps {
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: #409eff;
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
          }

          .step-text {
            flex: 1;
            font-size: 14px;
            color: #606266;
            line-height: 24px;
          }
        }
      }
    }

    .result-warnings {
      margin-top: 16px;
    }

    .result-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
  }
}
</style>
