<template>
  <div class="price-analysis-container">
    <el-card shadow="never" class="header-card">
      <template #header>
        <div class="card-header">
          <span>价格分析报表</span>
          <el-button type="primary" size="small" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>

      <!-- 关键指标卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #ecf5ff">
              <el-icon color="#409eff" :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">平均价格</div>
              <div class="stat-value">¥{{ stats?.priceStats.average || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #f0f9ff">
              <el-icon color="#67c23a" :size="32"><DataLine /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">中位数</div>
              <div class="stat-value">¥{{ stats?.priceStats.median || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #fef0f0">
              <el-icon color="#f56c6c" :size="32"><Top /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">最高价</div>
              <div class="stat-value">¥{{ stats?.priceStats.max || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: #fdf6ec">
              <el-icon color="#e6a23c" :size="32"><Bottom /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">最低价</div>
              <div class="stat-value">¥{{ stats?.priceStats.min || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 价格分布图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>价格分布</span>
          </template>
          <div ref="priceDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 价格来源分析 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>价格来源分析</span>
          </template>
          <div ref="priceSourceChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 车况评级分析 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>车况评级价格分析</span>
          </template>
          <div ref="conditionGradeChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 收益预测排名 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>收益预测排名</span>
              <el-radio-group v-model="revenueSortBy" size="small" @change="loadRevenueForecast">
                <el-radio-button value="revenue">年收益</el-radio-button>
                <el-radio-button value="roi">投资回报率</el-radio-button>
                <el-radio-button value="payback">回本周期</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="revenueForecastChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 车辆定价分析表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>车辆定价分析</span>
          <el-radio-group v-model="deviationFilter" size="small" @change="loadPricingAnalysis">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="high">偏离度高</el-radio-button>
            <el-radio-button value="normal">正常</el-radio-button>
            <el-radio-button value="low">偏离度低</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="pricingAnalysis" stripe v-loading="tableLoading">
        <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
        <el-table-column prop="modelName" label="车型" width="150" />
        <el-table-column prop="currentPrice" label="当前价格" width="100">
          <template #default="{ row }">
            <span>¥{{ row.currentPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="modelAveragePrice" label="车型均价" width="100">
          <template #default="{ row }">
            <span>¥{{ row.modelAveragePrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviation" label="偏离度" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.deviationLevel === 'high' ? 'danger' : row.deviationLevel === 'low' ? 'warning' : 'success'"
              size="small"
            >
              {{ row.deviation > 0 ? '+' : '' }}{{ row.deviation }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="conditionGrade" label="车况" width="80" />
        <el-table-column prop="expectedPrice" label="预期价格" width="100">
          <template #default="{ row }">
            <span>¥{{ row.expectedPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pricingStatus" label="定价状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.pricingStatus === 'reasonable' ? 'success' : row.pricingStatus === 'overpriced' ? 'danger' : 'warning'"
              size="small"
            >
              {{ getPricingStatusLabel(row.pricingStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="建议" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  TrendCharts,
  DataLine,
  Top,
  Bottom,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getPriceAnalysisStats,
  getVehiclePricingAnalysis,
  getRevenueForecast,
} from '@/api/priceAnalysis'
import type {
  PriceAnalysisStats,
  VehiclePricingAnalysis,
  RevenueForecast,
} from '@/types/system'

// 数据
const stats = ref<PriceAnalysisStats>()
const pricingAnalysis = ref<VehiclePricingAnalysis[]>([])
const revenueForecast = ref<RevenueForecast[]>([])

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)

// 筛选条件
const deviationFilter = ref<'' | 'high' | 'normal' | 'low'>('')
const revenueSortBy = ref<'revenue' | 'roi' | 'payback'>('revenue')

// 图表实例
const priceDistributionChart = ref<HTMLElement>()
const priceSourceChart = ref<HTMLElement>()
const conditionGradeChart = ref<HTMLElement>()
const revenueForecastChart = ref<HTMLElement>()

let priceDistributionChartInstance: ECharts | null = null
let priceSourceChartInstance: ECharts | null = null
let conditionGradeChartInstance: ECharts | null = null
let revenueForecastChartInstance: ECharts | null = null

// 获取定价状态标签
const getPricingStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    reasonable: '合理',
    overpriced: '偏高',
    underpriced: '偏低',
  }
  return labels[status] || '未知'
}

// 加载统计数据
const loadStats = async () => {
  try {
    stats.value = await getPriceAnalysisStats()
    await nextTick()
    initCharts()
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载定价分析
const loadPricingAnalysis = async () => {
  tableLoading.value = true
  try {
    const params = deviationFilter.value ? { deviationLevel: deviationFilter.value } : undefined
    pricingAnalysis.value = await getVehiclePricingAnalysis(params)
  } catch (error) {
    console.error('加载定价分析失败:', error)
    ElMessage.error('加载定价分析失败')
  } finally {
    tableLoading.value = false
  }
}

// 加载收益预测
const loadRevenueForecast = async () => {
  try {
    revenueForecast.value = await getRevenueForecast({ sortBy: revenueSortBy.value })
    await nextTick()
    updateRevenueForecastChart()
  } catch (error) {
    console.error('加载收益预测失败:', error)
    ElMessage.error('加载收益预测失败')
  }
}

// 初始化图表
const initCharts = () => {
  if (!stats.value) return

  // 价格分布图
  if (priceDistributionChart.value) {
    priceDistributionChartInstance = echarts.init(priceDistributionChart.value)
    priceDistributionChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        type: 'category',
        data: stats.value.priceDistribution.map(d => d.range),
      },
      yAxis: {
        type: 'value',
        name: '车辆数量',
      },
      series: [
        {
          name: '车辆数量',
          type: 'bar',
          data: stats.value.priceDistribution.map(d => d.count),
          itemStyle: {
            color: '#409eff',
          },
          label: {
            show: true,
            position: 'top',
          },
        },
      ],
    })
  }

  // 价格来源分析
  if (priceSourceChart.value) {
    priceSourceChartInstance = echarts.init(priceSourceChart.value)
    priceSourceChartInstance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '价格来源',
          type: 'pie',
          radius: '60%',
          data: stats.value.priceSourceAnalysis.map(s => ({
            name: s.sourceName,
            value: s.count,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    })
  }

  // 车况评级分析
  if (conditionGradeChart.value) {
    conditionGradeChartInstance = echarts.init(conditionGradeChart.value)
    conditionGradeChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['平均价格', '预期溢价', '实际溢价'],
      },
      xAxis: {
        type: 'category',
        data: stats.value.conditionGradeAnalysis.map(g => `${g.grade}级`),
      },
      yAxis: [
        {
          type: 'value',
          name: '价格(元)',
        },
        {
          type: 'value',
          name: '溢价系数',
          min: 0,
          max: 1.5,
        },
      ],
      series: [
        {
          name: '平均价格',
          type: 'bar',
          data: stats.value.conditionGradeAnalysis.map(g => g.averagePrice),
          itemStyle: {
            color: '#409eff',
          },
        },
        {
          name: '预期溢价',
          type: 'line',
          yAxisIndex: 1,
          data: stats.value.conditionGradeAnalysis.map(g => g.expectedPremium),
          itemStyle: {
            color: '#67c23a',
          },
        },
        {
          name: '实际溢价',
          type: 'line',
          yAxisIndex: 1,
          data: stats.value.conditionGradeAnalysis.map(g => g.actualPremium),
          itemStyle: {
            color: '#e6a23c',
          },
        },
      ],
    })
  }
}

// 更新收益预测图表
const updateRevenueForecastChart = () => {
  if (!revenueForecastChart.value || revenueForecast.value.length === 0) return

  if (!revenueForecastChartInstance) {
    revenueForecastChartInstance = echarts.init(revenueForecastChart.value)
  }

  const data = revenueForecast.value.slice(0, 10) // 只显示前10名

  let seriesData: number[]
  let yAxisName: string

  if (revenueSortBy.value === 'revenue') {
    seriesData = data.map(d => d.expectedAnnualRevenue)
    yAxisName = '年收益(元)'
  } else if (revenueSortBy.value === 'roi') {
    seriesData = data.map(d => d.expectedROI * 100)
    yAxisName = '投资回报率(%)'
  } else {
    seriesData = data.map(d => d.paybackPeriod)
    yAxisName = '回本周期(年)'
  }

  revenueForecastChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.vehicleNumber),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
    },
    series: [
      {
        name: yAxisName,
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: '#67c23a',
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            if (revenueSortBy.value === 'roi') {
              return `${params.value.toFixed(2)}%`
            } else if (revenueSortBy.value === 'payback') {
              return `${params.value.toFixed(2)}年`
            }
            return params.value
          },
        },
      },
    ],
  })
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadPricingAnalysis(),
      loadRevenueForecast(),
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadPricingAnalysis(),
      loadRevenueForecast(),
    ])
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    loading.value = false
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    priceDistributionChartInstance?.resize()
    priceSourceChartInstance?.resize()
    conditionGradeChartInstance?.resize()
    revenueForecastChartInstance?.resize()
  })
})
</script>

<style scoped lang="scss">
.price-analysis-container {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stats-row {
    margin-bottom: 0;
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 4px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-container {
    width: 100%;
    height: 350px;
  }

  .table-card {
    margin-top: 20px;
  }
}
</style>
