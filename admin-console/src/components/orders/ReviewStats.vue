<template>
  <div class="review-stats-container">
    <!-- 总体统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#409eff">
              <Document />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalReviews }}</div>
              <div class="stat-label">评价总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#67c23a">
              <Star />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.averageRating.toFixed(1) }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#e6a23c">
              <Picture />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.withImages }}</div>
              <div class="stat-label">带图评价</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#f56c6c">
              <ChatDotRound />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.replyRate }}%</div>
              <div class="stat-label">回复率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分分布图表 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">评分分布</span>
          <el-radio-group v-model="ratingType" size="small">
            <el-radio-button value="overall">综合评分</el-radio-button>
            <el-radio-button value="vehicle">车辆评分</el-radio-button>
            <el-radio-button value="service">服务评分</el-radio-button>
            <el-radio-button value="cleanliness">清洁度评分</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="rating-distribution">
        <div v-for="item in ratingDistribution" :key="item.rating" class="rating-item">
          <div class="rating-label">
            <el-rate
              :model-value="item.rating"
              disabled
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            />
          </div>
          <div class="rating-bar">
            <el-progress
              :percentage="item.percentage"
              :color="getProgressColor(item.rating)"
              :show-text="false"
            />
          </div>
          <div class="rating-count">{{ item.count }} ({{ item.percentage }}%)</div>
        </div>
      </div>
    </el-card>

    <!-- 按车型统计 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <span class="card-title">按车型统计</span>
      </template>
      <el-table :data="vehicleStats" stripe>
        <el-table-column prop="vehicleName" label="车型" width="200" />
        <el-table-column prop="reviewCount" label="评价数量" width="120" align="center" />
        <el-table-column label="平均评分" width="200" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.averageRating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="satisfactionRate" label="满意度" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getSatisfactionTag(row.satisfactionRate)" size="small">
              {{ row.satisfactionRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分趋势" align="center">
          <template #default="{ row }">
            <div class="trend-indicator">
              <el-icon v-if="row.trend === 'up'" :size="20" color="#67c23a">
                <TrendCharts />
              </el-icon>
              <el-icon v-else-if="row.trend === 'down'" :size="20" color="#f56c6c">
                <TrendCharts style="transform: rotate(180deg)" />
              </el-icon>
              <el-icon v-else :size="20" color="#909399">
                <Minus />
              </el-icon>
              <span class="trend-text">{{ getTrendText(row.trend) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 按门店统计 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <span class="card-title">按门店统计</span>
      </template>
      <el-table :data="storeStats" stripe>
        <el-table-column prop="storeName" label="门店" width="200" />
        <el-table-column prop="reviewCount" label="评价数量" width="120" align="center" />
        <el-table-column label="平均评分" width="200" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.averageRating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="satisfactionRate" label="满意度" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getSatisfactionTag(row.satisfactionRate)" size="small">
              {{ row.satisfactionRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="服务质量" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.serviceQuality"
              :color="getServiceQualityColor(row.serviceQuality)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 时间趋势图 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">评价趋势</span>
          <el-radio-group v-model="trendPeriod" size="small">
            <el-radio-button value="week">最近7天</el-radio-button>
            <el-radio-button value="month">最近30天</el-radio-button>
            <el-radio-button value="quarter">最近3个月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="trend-chart">
        <div class="trend-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background-color: #409eff"></span>
            <span>评价数量</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background-color: #67c23a"></span>
            <span>平均评分</span>
          </div>
        </div>
        <div class="trend-data">
          <div v-for="item in trendData" :key="item.date" class="trend-data-item">
            <div class="trend-date">{{ item.date }}</div>
            <div class="trend-bars">
              <div class="trend-bar-wrapper">
                <div
                  class="trend-bar count-bar"
                  :style="{ height: `${(item.count / maxCount) * 100}%` }"
                >
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              </div>
              <div class="trend-bar-wrapper">
                <div
                  class="trend-bar rating-bar"
                  :style="{ height: `${(item.rating / 5) * 100}%` }"
                >
                  <span class="bar-value">{{ item.rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Document, Star, Picture, ChatDotRound, TrendCharts, Minus } from '@element-plus/icons-vue'

// 总体统计数据
const stats = reactive({
  totalReviews: 1248,
  averageRating: 4.6,
  withImages: 856,
  replyRate: 92,
})

// 评分类型
const ratingType = ref('overall')

// 评分分布数据（Mock）
const ratingDistribution = computed(() => {
  // 根据不同的评分类型返回不同的分布数据
  const distributions: Record<string, any[]> = {
    overall: [
      { rating: 5, count: 720, percentage: 58 },
      { rating: 4, count: 374, percentage: 30 },
      { rating: 3, count: 100, percentage: 8 },
      { rating: 2, count: 37, percentage: 3 },
      { rating: 1, count: 17, percentage: 1 },
    ],
    vehicle: [
      { rating: 5, count: 780, percentage: 62 },
      { rating: 4, count: 350, percentage: 28 },
      { rating: 3, count: 87, percentage: 7 },
      { rating: 2, count: 25, percentage: 2 },
      { rating: 1, count: 6, percentage: 1 },
    ],
    service: [
      { rating: 5, count: 810, percentage: 65 },
      { rating: 4, count: 312, percentage: 25 },
      { rating: 3, count: 87, percentage: 7 },
      { rating: 2, count: 25, percentage: 2 },
      { rating: 1, count: 14, percentage: 1 },
    ],
    cleanliness: [
      { rating: 5, count: 750, percentage: 60 },
      { rating: 4, count: 362, percentage: 29 },
      { rating: 3, count: 100, percentage: 8 },
      { rating: 2, count: 25, percentage: 2 },
      { rating: 1, count: 11, percentage: 1 },
    ],
  }
  return distributions[ratingType.value] || distributions.overall
})

// 按车型统计数据（Mock）
const vehicleStats = ref([
  {
    vehicleName: '奔驰V260',
    reviewCount: 328,
    averageRating: 4.8,
    satisfactionRate: 96,
    trend: 'up',
  },
  {
    vehicleName: '大通V90',
    reviewCount: 285,
    averageRating: 4.6,
    satisfactionRate: 92,
    trend: 'up',
  },
  {
    vehicleName: '福特全顺',
    reviewCount: 256,
    averageRating: 4.5,
    satisfactionRate: 90,
    trend: 'stable',
  },
  {
    vehicleName: '依维柯欧胜',
    reviewCount: 198,
    averageRating: 4.4,
    satisfactionRate: 88,
    trend: 'down',
  },
  {
    vehicleName: '上汽大通RG10',
    reviewCount: 181,
    averageRating: 4.3,
    satisfactionRate: 86,
    trend: 'stable',
  },
])

// 按门店统计数据（Mock）
const storeStats = ref([
  {
    storeName: '北京朝阳门店',
    reviewCount: 412,
    averageRating: 4.7,
    satisfactionRate: 94,
    serviceQuality: 95,
  },
  {
    storeName: '上海浦东门店',
    reviewCount: 385,
    averageRating: 4.6,
    satisfactionRate: 92,
    serviceQuality: 93,
  },
  {
    storeName: '广州天河门店',
    reviewCount: 298,
    averageRating: 4.5,
    satisfactionRate: 90,
    serviceQuality: 91,
  },
  {
    storeName: '深圳南山门店',
    reviewCount: 153,
    averageRating: 4.4,
    satisfactionRate: 88,
    serviceQuality: 89,
  },
])

// 时间趋势周期
const trendPeriod = ref('week')

// 时间趋势数据（Mock）
const trendData = computed(() => {
  const data: Record<string, any[]> = {
    week: [
      { date: '12-16', count: 45, rating: 4.5 },
      { date: '12-17', count: 52, rating: 4.6 },
      { date: '12-18', count: 38, rating: 4.4 },
      { date: '12-19', count: 61, rating: 4.7 },
      { date: '12-20', count: 48, rating: 4.5 },
      { date: '12-21', count: 55, rating: 4.6 },
      { date: '12-22', count: 42, rating: 4.5 },
    ],
    month: [
      { date: '11-23', count: 280, rating: 4.4 },
      { date: '11-30', count: 310, rating: 4.5 },
      { date: '12-07', count: 295, rating: 4.5 },
      { date: '12-14', count: 325, rating: 4.6 },
      { date: '12-21', count: 341, rating: 4.6 },
    ],
    quarter: [
      { date: '10月', count: 1180, rating: 4.4 },
      { date: '11月', count: 1250, rating: 4.5 },
      { date: '12月', count: 1351, rating: 4.6 },
    ],
  }
  return data[trendPeriod.value] || data.week
})

// 计算最大评价数量（用于趋势图高度计算）
const maxCount = computed(() => {
  return Math.max(...trendData.value.map(item => item.count))
})

// 获取进度条颜色
const getProgressColor = (rating: number) => {
  if (rating >= 4) return '#67c23a'
  if (rating >= 3) return '#e6a23c'
  return '#f56c6c'
}

// 获取满意度标签类型
const getSatisfactionTag = (rate: number) => {
  if (rate >= 90) return 'success'
  if (rate >= 80) return 'warning'
  return 'danger'
}

// 获取服务质量颜色
const getServiceQualityColor = (quality: number) => {
  if (quality >= 90) return '#67c23a'
  if (quality >= 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取趋势文本
const getTrendText = (trend: string) => {
  const trendMap: Record<string, string> = {
    up: '上升',
    down: '下降',
    stable: '稳定',
  }
  return trendMap[trend] || '稳定'
}
</script>

<style scoped lang="scss">
.review-stats-container {
  .stats-cards {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-weight: 600;
          font-size: 28px;
          color: #303133;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-weight: 600;
      font-size: 16px;
      color: #303133;
    }
  }

  .rating-distribution {
    padding: 20px 0;

    .rating-item {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .rating-label {
        width: 150px;
        flex-shrink: 0;
      }

      .rating-bar {
        flex: 1;
      }

      .rating-count {
        width: 120px;
        text-align: right;
        color: #606266;
        font-size: 14px;
        flex-shrink: 0;
      }
    }
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .trend-text {
      font-size: 14px;
      color: #606266;
    }
  }

  .trend-chart {
    padding: 20px 0;

    .trend-legend {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 24px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #606266;

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      }
    }

    .trend-data {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 300px;
      padding: 0 20px;
      border-bottom: 2px solid #dcdfe6;

      .trend-data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .trend-date {
          margin-bottom: 8px;
          color: #909399;
          font-size: 12px;
        }

        .trend-bars {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          height: 260px;

          .trend-bar-wrapper {
            width: 40px;
            height: 100%;
            display: flex;
            align-items: flex-end;
          }

          .trend-bar {
            width: 100%;
            border-radius: 4px 4px 0 0;
            position: relative;
            transition: all 0.3s;

            &.count-bar {
              background-color: #409eff;
            }

            &.rating-bar {
              background-color: #67c23a;
            }

            .bar-value {
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #606266;
              white-space: nowrap;
            }

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}

:deep(.el-card__header) {
  padding: 16px 20px;
  background-color: #f5f7fa;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-rate) {
  height: 20px;
}

:deep(.el-progress__text) {
  font-size: 14px !important;
}
</style>
