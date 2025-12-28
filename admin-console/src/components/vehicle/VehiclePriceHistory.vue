<template>
  <div class="vehicle-price-history">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>价格变更历史</span>
          <el-tag v-if="history.length > 0" type="info" size="small">
            共 {{ history.length }} 条记录
          </el-tag>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="history.length === 0" description="暂无价格变更记录" :image-size="100" />

      <!-- 时间线 -->
      <el-timeline v-else>
        <el-timeline-item
          v-for="item in history"
          :key="item.id"
          :timestamp="item.createdAt"
          placement="top"
          :color="getTimelineColor(item.changeReason)"
        >
          <el-card shadow="hover" class="history-card">
            <div class="history-header">
              <div class="price-change">
                <span class="old-price">¥{{ item.oldPrice }}</span>
                <el-icon class="arrow-icon">
                  <Right />
                </el-icon>
                <span class="new-price">¥{{ item.newPrice }}</span>
                <el-tag
                  v-if="item.priceChange !== 0"
                  :type="item.priceChange > 0 ? 'danger' : 'success'"
                  size="small"
                  class="change-tag"
                >
                  <el-icon v-if="item.priceChange > 0"><CaretTop /></el-icon>
                  <el-icon v-else><CaretBottom /></el-icon>
                  {{ item.priceChange > 0 ? '+' : '' }}{{ item.priceChange }} ({{
                    item.priceChange > 0 ? '+' : ''
                  }}{{ item.priceChangePercent }}%)
                </el-tag>
              </div>
              <el-tag :type="getReasonTagType(item.changeReason)" size="small">
                {{ getReasonLabel(item.changeReason) }}
              </el-tag>
            </div>

            <div class="history-content">
              <div class="info-row">
                <span class="label">变更原因：</span>
                <span class="value">{{ item.changeReasonText }}</span>
              </div>
              <div class="info-row">
                <span class="label">价格来源：</span>
                <el-tag :type="getPriceSourceTagType(item.priceSource)" size="small">
                  {{ getPriceSourceLabel(item.priceSource) }}
                </el-tag>
              </div>
              <div class="info-row">
                <span class="label">操作人员：</span>
                <span class="value">{{ item.operatorName }}</span>
              </div>

              <!-- 计算参数详情 -->
              <el-collapse v-if="item.calculationParams" class="params-collapse">
                <el-collapse-item title="查看计算参数" name="1">
                  <el-descriptions :column="2" size="small" border>
                    <el-descriptions-item label="年化收益率">
                      {{ (item.calculationParams.targetAnnualReturn * 100).toFixed(2) }}%
                    </el-descriptions-item>
                    <el-descriptions-item label="残值率">
                      {{ (item.calculationParams.residualValueRate * 100).toFixed(2) }}%
                    </el-descriptions-item>
                    <el-descriptions-item label="年运营率">
                      {{ (item.calculationParams.annualOperatingRate * 100).toFixed(2) }}%
                    </el-descriptions-item>
                    <el-descriptions-item label="成本占比">
                      {{ (item.calculationParams.operatingCostRate * 100).toFixed(2) }}%
                    </el-descriptions-item>
                    <el-descriptions-item label="车况溢价">
                      {{ item.calculationParams.conditionPremium }}x
                    </el-descriptions-item>
                    <el-descriptions-item label="计算时间">
                      {{ item.calculationParams.calculatedAt }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 统计信息 -->
      <div v-if="history.length > 0" class="statistics">
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">总变更次数</div>
              <div class="stat-value">{{ history.length }} 次</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">当前价格</div>
              <div class="stat-value" style="color: #409eff">¥{{ history[0]?.newPrice || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-label">初始价格</div>
              <div class="stat-value" style="color: #909399">
                ¥{{ history[history.length - 1]?.oldPrice || 0 }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Right, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { getVehiclePriceHistory } from '@/api/vehiclePriceHistory'
import type { VehiclePriceHistory } from '@/types/system'

interface Props {
  vehicleId: number
}

const props = defineProps<Props>()

const loading = ref(false)
const history = ref<VehiclePriceHistory[]>([])

// 获取时间线颜色
const getTimelineColor = (reason: string): string => {
  const colorMap: Record<string, string> = {
    manual: '#409eff',
    calculator: '#67c23a',
    batch_calculator: '#e6a23c',
    system: '#909399',
  }
  return colorMap[reason] || '#909399'
}

// 获取变更原因标签类型
const getReasonTagType = (reason: string): 'primary' | 'success' | 'warning' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    manual: 'primary',
    calculator: 'success',
    batch_calculator: 'warning',
    system: 'info',
  }
  return typeMap[reason] || 'info'
}

// 获取变更原因标签文本
const getReasonLabel = (reason: string): string => {
  const labelMap: Record<string, string> = {
    manual: '手动调整',
    calculator: '计算器计算',
    batch_calculator: '批量计算',
    system: '系统操作',
  }
  return labelMap[reason] || '未知'
}

// 获取价格来源标签类型
const getPriceSourceTagType = (source: string): 'success' | 'info' | 'warning' => {
  const typeMap: Record<string, 'success' | 'info' | 'warning'> = {
    calculated: 'success',
    manual: 'info',
    inherited: 'warning',
  }
  return typeMap[source] || 'info'
}

// 获取价格来源标签文本
const getPriceSourceLabel = (source: string): string => {
  const labelMap: Record<string, string> = {
    calculated: '计算得出',
    manual: '手动设置',
    inherited: '继承车型',
  }
  return labelMap[source] || '未知'
}

// 加载价格历史
const loadHistory = async () => {
  loading.value = true
  try {
    history.value = await getVehiclePriceHistory(props.vehicleId)
  } catch (error) {
    console.error('加载价格历史失败:', error)
    ElMessage.error('加载价格历史失败')
  } finally {
    loading.value = false
  }
}

// 刷新历史记录
const refresh = () => {
  loadHistory()
}

// 初始化
onMounted(() => {
  loadHistory()
})

// 暴露方法供父组件调用
defineExpose({
  refresh,
})
</script>

<style scoped lang="scss">
.vehicle-price-history {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .loading-container {
    padding: 20px;
  }

  .history-card {
    margin-bottom: 0;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .price-change {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;

        .old-price {
          color: #909399;
          text-decoration: line-through;
        }

        .arrow-icon {
          color: #909399;
        }

        .new-price {
          color: #303133;
          font-weight: bold;
        }

        .change-tag {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }
    }

    .history-content {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;

        .label {
          color: #909399;
          margin-right: 8px;
          min-width: 80px;
        }

        .value {
          color: #303133;
        }
      }

      .params-collapse {
        margin-top: 12px;

        :deep(.el-collapse-item__header) {
          font-size: 12px;
          padding: 0;
          height: 32px;
          line-height: 32px;
        }

        :deep(.el-collapse-item__content) {
          padding: 10px 0;
        }
      }
    }
  }

  .statistics {
    margin-top: 20px;

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
  }

  :deep(.el-timeline-item__timestamp) {
    color: #909399;
    font-size: 12px;
  }
}
</style>
