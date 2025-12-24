<template>
  <div class="profit-records-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">分润记录查询</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </template>
    </el-page-header>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #ecf5ff; color: #409eff">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">总分润金额</div>
              <div class="stats-value">¥{{ formatNumber(statistics.totalProfit) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f0f9ff; color: #67c23a">
              <el-icon :size="24"><Coin /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">平台利润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.platformAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fef0f0; color: #f56c6c">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">车主分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.ownerAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fdf6ec; color: #e6a23c">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">推广分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.promoterAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card">
      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="产品类型">
          <el-select v-model="queryForm.productType" placeholder="请选择" clearable>
            <el-option label="房车租赁" value="vehicle_rental" />
            <el-option label="营地产品" value="campsite" />
            <el-option label="房车旅游" value="tour" />
          </el-select>
        </el-form-item>
        <el-form-item label="分润状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable>
            <el-option label="待结算" value="pending" />
            <el-option label="已计算" value="calculated" />
            <el-option label="已支付" value="paid" />
            <el-option label="已冻结" value="frozen" />
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
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="recordList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="productType" label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getProductTypeTag(row.productType)">
              {{ getProductTypeName(row.productType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beneficiaryName" label="收益方" width="120" />
        <el-table-column prop="profitAmount" label="分润金额" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ formatNumber(row.profitAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  Search,
  Refresh,
  Money,
  Coin,
  User,
  TrendCharts,
} from '@element-plus/icons-vue'
import type { ProductType, ProfitStatus } from '@/types/profit'
import { getProfitStatistics } from '@/api/profit'

const loading = ref(false)

const statistics = ref({
  totalProfit: 125680,
  platformAmount: 45230,
  ownerAmount: 58450,
  promoterAmount: 12000,
  storeAmount: 10000,
})

const queryForm = reactive({
  productType: '',
  status: '',
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const recordList = ref<any[]>([])

const fetchStatistics = async () => {
  try {
    const params: any = {}
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getProfitStatistics(params)
    if (res.data && res.data.length > 0) {
      const latest = res.data[0]
      statistics.value = {
        totalProfit: latest.totalProfit,
        platformAmount: latest.platformAmount || 0,
        ownerAmount: latest.ownerAmount || 0,
        promoterAmount: latest.promoterAmount || 0,
        storeAmount: latest.storeAmount || 0,
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchStatistics()
}

const handleReset = () => {
  queryForm.productType = ''
  queryForm.status = ''
  dateRange.value = null
  pagination.page = 1
  fetchStatistics()
}

const handleSizeChange = () => {
  pagination.page = 1
}

const handlePageChange = () => {
  // 分页逻辑
}

const handleViewDetail = (row: any) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const formatNumber = (num: number) => num.toFixed(2)

const getProductTypeName = (type: ProductType) => {
  const map: Record<ProductType, string> = {
    vehicle_rental: '房车租赁',
    campsite: '营地产品',
    tour: '房车旅游',
  }
  return map[type] || type
}

const getProductTypeTag = (type: ProductType) => {
  const map: Record<ProductType, string> = {
    vehicle_rental: 'primary',
    campsite: 'success',
    tour: 'warning',
  }
  return map[type] || ''
}

const getStatusName = (status: ProfitStatus) => {
  const map: Record<ProfitStatus, string> = {
    pending: '待结算',
    calculated: '已计算',
    paid: '已支付',
    frozen: '已冻结',
    cancelled: '已取消',
  }
  return map[status] || status
}

const getStatusTag = (status: ProfitStatus) => {
  const map: Record<ProfitStatus, string> = {
    pending: 'info',
    calculated: 'warning',
    paid: 'success',
    frozen: 'danger',
    cancelled: 'info',
  }
  return map[status] || ''
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped lang="scss">
.profit-records-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stats-card {
      .stats-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stats-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-info {
          flex: 1;

          .stats-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stats-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }

  .main-card {
    .search-form {
      margin-bottom: 20px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
