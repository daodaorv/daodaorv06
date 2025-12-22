<template>
  <el-dialog
    v-model="visible"
    title="智能定价建议"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="smart-pricing-container">
      <!-- 车辆信息 -->
      <el-alert type="info" :closable="false" class="vehicle-info">
        <template #title>
          <div class="info-row">
            <span><strong>车牌号：</strong>{{ suggestion?.vehicleNumber }}</span>
            <span><strong>车型：</strong>{{ suggestion?.modelName }}</span>
            <span><strong>当前价格：</strong>¥{{ suggestion?.currentPrice }}</span>
          </div>
        </template>
      </el-alert>

      <!-- 市场对比 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span>市场对比分析</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">市场均价</div>
              <div class="stat-value">¥{{ suggestion?.marketComparison.averagePrice }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">价格区间</div>
              <div class="stat-value">
                ¥{{ suggestion?.marketComparison.priceRange.min }} -
                ¥{{ suggestion?.marketComparison.priceRange.max }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">市场定位</div>
              <div class="stat-value">
                <el-tag :type="getPositionTagType(suggestion?.marketComparison.position)">
                  {{ getPositionLabel(suggestion?.marketComparison.position) }}
                </el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">竞品数量</div>
              <div class="stat-value">{{ suggestion?.marketComparison.competitorCount }} 辆</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 定价策略建议 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span>定价策略建议</span>
        </template>
        <el-tabs v-model="activeStrategy">
          <el-tab-pane
            v-for="item in suggestion?.suggestions"
            :key="item.strategy"
            :label="item.strategyName"
            :name="item.strategy"
          >
            <div class="strategy-content">
              <!-- 建议价格 -->
              <div class="price-section">
                <div class="price-label">建议价格</div>
                <div class="price-value">¥{{ item.suggestedPrice }}</div>
                <el-tag
                  :type="item.expectedImpact.revenueChange > 0 ? 'success' : 'danger'"
                  size="large"
                  class="change-tag"
                >
                  {{ item.expectedImpact.revenueChange > 0 ? '+' : '' }}
                  {{ item.expectedImpact.revenueChange }}%
                </el-tag>
              </div>

              <!-- 置信度 -->
              <div class="confidence-section">
                <span class="label">置信度：</span>
                <el-progress
                  :percentage="item.confidence"
                  :color="getConfidenceColor(item.confidence)"
                  :stroke-width="20"
                  :text-inside="true"
                />
              </div>

              <!-- 定价理由 -->
              <div class="reasoning-section">
                <div class="section-title">定价理由</div>
                <ul class="reasoning-list">
                  <li v-for="(reason, index) in item.reasoning" :key="index">
                    {{ reason }}
                  </li>
                </ul>
              </div>

              <!-- 预期影响 -->
              <div class="impact-section">
                <div class="section-title">预期影响</div>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="impact-item">
                      <div class="impact-label">收益变化</div>
                      <div class="impact-value" :class="item.expectedImpact.revenueChange > 0 ? 'positive' : 'negative'">
                        {{ item.expectedImpact.revenueChange > 0 ? '+' : '' }}
                        {{ item.expectedImpact.revenueChange }}%
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="impact-item">
                      <div class="impact-label">竞争力</div>
                      <div class="impact-value">
                        <el-tag :type="getCompetitivenessTagType(item.expectedImpact.competitiveness)">
                          {{ getCompetitivenessLabel(item.expectedImpact.competitiveness) }}
                        </el-tag>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="impact-item">
                      <div class="impact-label">市场定位</div>
                      <div class="impact-value">{{ item.expectedImpact.marketPosition }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <!-- 应用按钮 -->
              <div class="action-section">
                <el-button
                  type="primary"
                  size="large"
                  :loading="applying"
                  @click="handleApply(item.strategy, item.suggestedPrice)"
                >
                  应用此策略
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 历史参考 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span>历史参考</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="历史平均价格">
            ¥{{ suggestion?.historicalReference.averageHistoricalPrice }}
          </el-descriptions-item>
          <el-descriptions-item label="调价频率">
            {{ suggestion?.historicalReference.priceChangeFrequency }} 次/年
          </el-descriptions-item>
          <el-descriptions-item label="最后调整日期">
            {{ suggestion?.historicalReference.lastAdjustmentDate }}
          </el-descriptions-item>
          <el-descriptions-item label="最后调整原因">
            {{ suggestion?.historicalReference.lastAdjustmentReason }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSmartPricingSuggestion, applySmartPricing } from '@/api/priceAnalysis'
import type { SmartPricingSuggestion } from '@/types/system'

interface Props {
  vehicleId: number
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'applied', price: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const loading = ref(false)
const applying = ref(false)
const suggestion = ref<SmartPricingSuggestion>()
const activeStrategy = ref('balanced')

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadSuggestion()
  }
})

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载智能定价建议
const loadSuggestion = async () => {
  loading.value = true
  try {
    suggestion.value = await getSmartPricingSuggestion(props.vehicleId)
    // 默认选择平衡策略
    activeStrategy.value = 'balanced'
  } catch (error) {
    console.error('加载智能定价建议失败:', error)
    ElMessage.error('加载智能定价建议失败')
  } finally {
    loading.value = false
  }
}

// 应用定价策略
const handleApply = async (strategy: string, price: number) => {
  applying.value = true
  try {
    await applySmartPricing(props.vehicleId, strategy)
    ElMessage.success('定价策略应用成功')
    emit('applied', price)
    handleClose()
  } catch (error) {
    console.error('应用定价策略失败:', error)
    ElMessage.error('应用定价策略失败')
  } finally {
    applying.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 获取市场定位标签类型
const getPositionTagType = (position?: string) => {
  if (position === 'above') return 'danger'
  if (position === 'below') return 'success'
  return 'info'
}

// 获取市场定位标签文本
const getPositionLabel = (position?: string) => {
  const labels: Record<string, string> = {
    above: '高于市场',
    at: '市场平均',
    below: '低于市场',
  }
  return labels[position || 'at'] || '未知'
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
</script>

<style scoped lang="scss">
.smart-pricing-container {
  .vehicle-info {
    margin-bottom: 20px;

    .info-row {
      display: flex;
      gap: 30px;
      font-size: 14px;
    }
  }

  .section-card {
    margin-bottom: 20px;

    .stat-item {
      text-align: center;
      padding: 10px;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .strategy-content {
    .price-section {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      margin-bottom: 20px;

      .price-label {
        font-size: 16px;
        color: #fff;
        margin-bottom: 10px;
      }

      .price-value {
        font-size: 48px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10px;
      }

      .change-tag {
        font-size: 16px;
        padding: 8px 16px;
      }
    }

    .confidence-section {
      margin-bottom: 20px;

      .label {
        font-size: 14px;
        color: #606266;
        margin-right: 10px;
      }
    }

    .reasoning-section,
    .impact-section {
      margin-bottom: 20px;

      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 12px;
      }

      .reasoning-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 8px 0;
          padding-left: 20px;
          position: relative;
          color: #606266;
          line-height: 1.6;

          &::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #409eff;
            font-weight: bold;
          }
        }
      }

      .impact-item {
        text-align: center;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;

        .impact-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .impact-value {
          font-size: 18px;
          font-weight: bold;
          color: #303133;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }
        }
      }
    }

    .action-section {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
