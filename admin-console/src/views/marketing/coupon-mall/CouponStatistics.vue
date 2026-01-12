<template>
  <div class="page-container">
    <!-- 查询条件 -->
    <el-card class="query-card" shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="选择产品">
          <el-select
            v-model="queryForm.product_id"
            placeholder="请选择产品（不选则查询全部）"
            style="width: 300px"
            clearable
            filterable
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.product_title"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 销售概览 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <span>销售概览</span>
      </template>
      <el-row :gutter="20" v-loading="overviewLoading">
        <el-col :span="6">
          <el-statistic title="总销售额" :value="overview.total_sales_amount" :precision="2">
            <template #prefix>
              <span style="font-size: 14px">¥</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="总积分消耗" :value="overview.total_points_spent">
            <template #suffix>
              <span style="font-size: 14px">分</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="总销售数量" :value="overview.total_sales_count">
            <template #suffix>
              <span style="font-size: 14px">张</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="转化率" :value="overview.conversion_rate" :precision="2">
            <template #suffix>
              <span style="font-size: 14px">%</span>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <!-- 获取方式销售统计 -->
    <el-card class="method-stats-card" shadow="never">
      <template #header>
        <span>获取方式销售统计</span>
      </template>
      <el-table :data="methodStats" :loading="methodStatsLoading" border>
        <el-table-column prop="method_type" label="获取方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getMethodTypeTag(row.method_type)" size="small">
              {{ getMethodTypeLabel(row.method_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sales_count" label="销售数量" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold">{{ row.sales_count }}张</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales_amount" label="销售额" width="150">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.sales_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="points_spent" label="积分消耗" width="150">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: bold">{{ row.points_spent }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="conversion_rate" label="转化率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.conversion_rate"
              :color="getProgressColor(row.conversion_rate)"
            />
          </template>
        </el-table-column>
        <el-table-column label="占比" width="200">
          <template #default="{ row }">
            <div class="ratio-info">
              <div>销售额占比: {{ calculateRatio(row.sales_amount, overview.total_sales_amount) }}%</div>
              <div>数量占比: {{ calculateRatio(row.sales_count, overview.total_sales_count) }}%</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import {
  getCouponProductList,
  getSalesOverview,
  getMethodSalesStats,
  type CouponProduct,
  type SalesOverview,
  type MethodSalesStats,
  type MethodType,
} from '@/api/coupon-mall'
import { useErrorHandler } from '@/composables'

const { handleApiError } = useErrorHandler()

// 产品列表
const productList = ref<CouponProduct[]>([])

// 查询表单
const queryForm = reactive({
  product_id: undefined as number | undefined,
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 销售概览
const overview = ref<SalesOverview>({
  total_sales_amount: 0,
  total_points_spent: 0,
  total_sales_count: 0,
  conversion_rate: 0,
})
const overviewLoading = ref(false)

// 获取方式销售统计
const methodStats = ref<MethodSalesStats[]>([])
const methodStatsLoading = ref(false)

// 加载产品列表
const loadProductList = async () => {
  try {
    const res = (await getCouponProductList({ page: 1, pageSize: 100 })) as any
    productList.value = res.data.list
  } catch (error) {
    handleApiError(error, '加载产品列表失败')
  }
}

// 加载销售概览
const loadSalesOverview = async () => {
  overviewLoading.value = true
  try {
    const params: any = {}
    if (queryForm.product_id) {
      params.product_id = queryForm.product_id
    }
    if (dateRange.value) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = (await getSalesOverview(params)) as any
    overview.value = res.data
  } catch (error) {
    handleApiError(error, '加载销售概览失败')
  } finally {
    overviewLoading.value = false
  }
}

// 加载获取方式销售统计
const loadMethodSalesStats = async () => {
  methodStatsLoading.value = true
  try {
    const params: any = {}
    if (queryForm.product_id) {
      params.product_id = queryForm.product_id
    }
    if (dateRange.value) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = (await getMethodSalesStats(params)) as any
    methodStats.value = res.data
  } catch (error) {
    handleApiError(error, '加载获取方式销售统计失败')
  } finally {
    methodStatsLoading.value = false
  }
}

// 查询
const handleQuery = () => {
  loadSalesOverview()
  loadMethodSalesStats()
}

// 重置
const handleReset = () => {
  queryForm.product_id = undefined
  dateRange.value = null
  handleQuery()
}

// 获取获取方式类型标签类型
const getMethodTypeTag = (type: MethodType) => {
  const tagMap: Record<MethodType, string> = {
    free: 'success',
    points: 'warning',
    cash: 'danger',
    combo: 'primary',
    share: 'info',
    invite: 'success',
  }
  return tagMap[type] || 'info'
}

// 获取获取方式类型标签文本
const getMethodTypeLabel = (type: MethodType) => {
  const labelMap: Record<MethodType, string> = {
    free: '免费领取',
    points: '积分兑换',
    cash: '现金购买',
    combo: '组合支付',
    share: '分享获取',
    invite: '邀请获取',
  }
  return labelMap[type] || type
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#f56c6c'
  if (percentage < 60) return '#e6a23c'
  return '#67c23a'
}

// 计算占比
const calculateRatio = (value: number, total: number) => {
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(2)
}

// 页面加载
onMounted(() => {
  loadProductList()
  handleQuery()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.query-card,
.overview-card,
.method-stats-card {
  margin-bottom: 20px;
}

.ratio-info {
  font-size: 12px;
  line-height: 1.8;

  div {
    color: #606266;
  }
}
</style>
