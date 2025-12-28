<!-- @ts-nocheck -->
<template>
  <div class="price-calculator">
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <template #title>
        <div style="font-size: 13px">
          价格计算演示工具可以帮助您理解价格计算逻辑：最终价格 = 基础价 + 城市因子 + 时间因子 +
          其他因子
        </div>
      </template>
    </el-alert>

    <el-row :gutter="20">
      <!-- 左侧：参数选择 -->
      <el-col :span="10">
        <el-card shadow="never" class="param-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>参数配置</span>
            </div>
          </template>

          <el-form :model="params" label-width="120px" label-position="left">
            <!-- 车型选择 -->
            <el-form-item label="车型">
              <el-select
                v-model="params.modelId"
                placeholder="请选择车型"
                style="width: 100%"
                @change="handleParamChange"
              >
                <el-option
                  v-for="model in vehicleModels"
                  :key="model.id"
                  :label="`${model.modelName} (¥${model.dailyPrice}/天)`"
                  :value="model.id"
                />
              </el-select>
            </el-form-item>

            <!-- 门店/城市选择 -->
            <el-form-item label="门店">
              <el-select
                v-model="params.storeId"
                placeholder="请选择门店"
                style="width: 100%"
                @change="handleParamChange"
              >
                <el-option
                  v-for="store in stores"
                  :key="store.id"
                  :label="`${store.name} (${store.cityName})`"
                  :value="store.id"
                />
              </el-select>
            </el-form-item>

            <!-- 租期选择 -->
            <el-form-item label="租期">
              <el-date-picker
                v-model="params.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
                @change="handleParamChange"
              />
            </el-form-item>

            <!-- 计算按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                :loading="calculating"
                :disabled="!canCalculate"
                @click="calculatePrice"
                style="width: 100%"
              >
                <el-icon><Money /></el-icon>
                计算价格
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：计算结果 -->
      <el-col :span="14">
        <el-card shadow="never" class="result-card">
          <template #header>
            <div class="card-header">
              <el-icon><Money /></el-icon>
              <span>计算结果</span>
            </div>
          </template>

          <div v-if="!result" class="empty-result">
            <el-empty description="请选择参数并点击计算按钮" />
          </div>

          <div v-else class="result-content">
            <!-- 总价展示 -->
            <div class="total-price-section">
              <div class="label">订单总价</div>
              <div class="value">¥{{ result.totalPrice }}</div>
              <div class="sub-info">
                租期 {{ result.rentalDays }} 天 × 平均日租 ¥{{ result.averageDailyRental }}
              </div>
            </div>

            <el-divider />

            <!-- 价格明细 -->
            <div class="price-breakdown">
              <h4>价格计算明细</h4>

              <!-- 基础价格 -->
              <div class="breakdown-item">
                <div class="item-label">
                  <el-icon><Document /></el-icon>
                  车型基础价
                </div>
                <div class="item-value">¥{{ result.basePrice }}/天</div>
              </div>

              <!-- 城市因子 -->
              <div v-if="result.cityFactor" class="breakdown-item">
                <div class="item-label">
                  <el-icon><Location /></el-icon>
                  城市因子【{{ result.cityFactor.factorName }}】
                </div>
                <div class="item-value" :class="getValueClass(result.cityFactor.calculatedAmount)">
                  {{ formatAmount(result.cityFactor.calculatedAmount) }}/天
                </div>
                <el-tag size="small" type="primary">
                  优先级: {{ result.cityFactor.priority }}
                </el-tag>
              </div>

              <!-- 时间因子 -->
              <div v-if="result.timeFactorSummary.averageAmount !== 0" class="breakdown-item">
                <div class="item-label">
                  <el-icon><Clock /></el-icon>
                  时间因子（平均）
                </div>
                <div
                  class="item-value"
                  :class="getValueClass(result.timeFactorSummary.averageAmount)"
                >
                  {{ formatAmount(result.timeFactorSummary.averageAmount) }}/天
                </div>
              </div>

              <!-- 其他因子 -->
              <div
                v-for="factor in result.otherFactors"
                :key="factor.factorId"
                class="breakdown-item"
              >
                <div class="item-label">
                  <el-icon><Star /></el-icon>
                  {{ factor.factorName }}
                </div>
                <div class="item-value" :class="getValueClass(factor.calculatedAmount)">
                  {{ formatAmount(factor.calculatedAmount) }}/天
                </div>
              </div>

              <el-divider />

              <!-- 平均日租 -->
              <div class="breakdown-item final">
                <div class="item-label">
                  <strong>平均每日租金</strong>
                </div>
                <div class="item-value final-price">¥{{ result.averageDailyRental }}/天</div>
              </div>
            </div>

            <el-divider />

            <!-- 每日价格详情 -->
            <div class="daily-details">
              <h4>
                每日价格详情
                <el-tag size="small" type="info">共 {{ result.rentalDays }} 天</el-tag>
              </h4>

              <el-table
                :data="result.timeFactorSummary.dailyDetails"
                border
                stripe
                size="small"
                max-height="300"
              >
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column label="时间因子" width="150">
                  <template #default="{ row }">
                    <div v-if="row.timeFactor">
                      <el-tag size="small" type="danger">
                        {{ row.timeFactor.factorName }}
                      </el-tag>
                      <div style="font-size: 12px; color: #909399; margin-top: 4px">
                        {{ formatFactorValue(row.timeFactor) }}
                      </div>
                    </div>
                    <span v-else style="color: #c0c4cc">-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="dailyRental" label="当日租金" width="120">
                  <template #default="{ row }">
                    <span class="price-highlight">¥{{ row.dailyRental }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="价格变化" width="100">
                  <template #default="{ row, $index }">
                    <div v-if="$index > 0" class="price-change">
                      <template
                        v-if="
                          row.dailyRental >
                          result.timeFactorSummary.dailyDetails[$index - 1].dailyRental
                        "
                      >
                        <el-icon color="#f56c6c"><CaretTop /></el-icon>
                        <span style="color: #f56c6c">
                          +{{
                            Math.round(
                              ((row.dailyRental -
                                result.timeFactorSummary.dailyDetails[$index - 1].dailyRental) /
                                result.timeFactorSummary.dailyDetails[$index - 1].dailyRental) *
                                100
                            )
                          }}%
                        </span>
                      </template>
                      <template
                        v-else-if="
                          row.dailyRental <
                          result.timeFactorSummary.dailyDetails[$index - 1].dailyRental
                        "
                      >
                        <el-icon color="#67c23a"><CaretBottom /></el-icon>
                        <span style="color: #67c23a">
                          {{
                            Math.round(
                              ((row.dailyRental -
                                result.timeFactorSummary.dailyDetails[$index - 1].dailyRental) /
                                result.timeFactorSummary.dailyDetails[$index - 1].dailyRental) *
                                100
                            )
                          }}%
                        </span>
                      </template>
                      <span v-else style="color: #909399">-</span>
                    </div>
                    <span v-else style="color: #909399">-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 计算说明 -->
            <div class="calculation-explanation">
              <el-alert type="success" :closable="false">
                <template #title>
                  <div style="font-size: 12px; line-height: 1.8; white-space: pre-line">
                    {{ result.calculationExplanation }}
                  </div>
                </template>
              </el-alert>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Money,
  Document,
  Location,
  Clock,
  Star,
  CaretTop,
  CaretBottom,
} from '@element-plus/icons-vue'
import { getVehicleModels, type VehicleModel } from '@/api/vehicle'
import { getStoreList, type Store } from '@/api/store'
import type { PriceCalculationResult } from '@/utils/pricingHelper'

// 参数
const params = reactive({
  modelId: undefined as number | undefined,
  storeId: undefined as number | undefined,
  dateRange: [] as Date[],
})

// 数据
const vehicleModels = ref<VehicleModel[]>([])
const stores = ref<Store[]>([])
const calculating = ref(false)
const result = ref<PriceCalculationResult | null>(null)

// 是否可以计算
const canCalculate = computed(() => {
  return params.modelId && params.storeId && params.dateRange && params.dateRange.length === 2
})

// 加载车型列表
const loadVehicleModels = async () => {
  try {
    const res = await getVehicleModels({ page: 1, pageSize: 100, status: 'active' })
    vehicleModels.value = res.data.list
  } catch (error) {
    console.error('加载车型列表失败:', error)
    ElMessage.error('加载车型列表失败')
  }
}

// 加载门店列表
const loadStores = async () => {
  try {
    const res = (await getStoreList({ page: 1, pageSize: 100, status: 'active' })) as any
    stores.value = res.data.list
  } catch (error) {
    console.error('加载门店列表失败:', error)
    ElMessage.error('加载门店列表失败')
  }
}

// 参数变化
const handleParamChange = () => {
  // 清空结果
  result.value = null
}

// 计算价格
const calculatePrice = async () => {
  if (!canCalculate.value) {
    ElMessage.warning('请完整填写所有参数')
    return
  }

  calculating.value = true
  try {
    const model = vehicleModels.value.find(m => m.id === params.modelId)
    const store = stores.value.find(s => s.id === params.storeId)

    if (!model || !store) {
      ElMessage.error('车型或门店信息不存在')
      return
    }

    const startDate = params.dateRange[0].toISOString().split('T')[0]
    const endDate = params.dateRange[1].toISOString().split('T')[0]

    // 调用价格计算引擎
    const { calculateMultiFactorPrice } = await import('@/utils/pricingHelper')

    const request = {
      modelId: model.id,
      modelName: model.modelName,
      basePrice: model.dailyPrice,
      cityId: store.cityId,
      cityName: store.cityName,
      startDate,
      endDate,
    }

    result.value = calculateMultiFactorPrice(request)

    ElMessage.success('价格计算完成')
  } catch (error) {
    console.error('价格计算失败:', error)
    ElMessage.error('价格计算失败')
  } finally {
    calculating.value = false
  }
}

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount > 0) {
    return `+¥${amount}`
  } else if (amount < 0) {
    return `-¥${Math.abs(amount)}`
  } else {
    return '¥0'
  }
}

// 格式化因子值
const formatFactorValue = (factor: any) => {
  if (!factor) return ''
  if (factor.adjustmentType === 'percentage') {
    return `${factor.configValue > 0 ? '+' : ''}${factor.configValue}%`
  } else {
    return `${factor.configValue > 0 ? '+' : ''}¥${factor.configValue}`
  }
}

// 获取值的样式类
const getValueClass = (amount: number) => {
  if (amount > 0) {
    return 'value-positive'
  } else if (amount < 0) {
    return 'value-negative'
  } else {
    return 'value-zero'
  }
}

// 初始化
onMounted(() => {
  loadVehicleModels()
  loadStores()
})
</script>

<style scoped lang="scss">
.price-calculator {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
  }

  .param-card {
    .el-form {
      .el-form-item {
        margin-bottom: 20px;
      }
    }
  }

  .result-card {
    min-height: 600px;

    .empty-result {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .result-content {
      .total-price-section {
        text-align: center;
        padding: 20px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: white;

        .label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .value {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .sub-info {
          font-size: 14px;
          opacity: 0.8;
        }
      }

      .price-breakdown {
        h4 {
          margin-bottom: 16px;
          color: #303133;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &.final {
            padding: 16px 0;
            border-top: 2px solid #409eff;
            border-bottom: none;
            margin-top: 8px;
          }

          .item-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;
            flex: 1;
          }

          .item-value {
            font-size: 16px;
            font-weight: bold;
            min-width: 100px;
            text-align: right;

            &.value-positive {
              color: #f56c6c;
            }

            &.value-negative {
              color: #67c23a;
            }

            &.value-zero {
              color: #909399;
            }

            &.final-price {
              font-size: 24px;
              color: #409eff;
            }
          }

          .el-tag {
            margin-left: auto;
          }
        }
      }

      .daily-details {
        margin-top: 20px;

        h4 {
          margin-bottom: 16px;
          color: #303133;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-highlight {
          color: #f56c6c;
          font-weight: bold;
          font-size: 14px;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
      }

      .calculation-explanation {
        margin-top: 20px;
      }
    }
  }
}
</style>
