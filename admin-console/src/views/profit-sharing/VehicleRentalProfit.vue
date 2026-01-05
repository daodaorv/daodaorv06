<template>
  <div class="vehicle-rental-profit-container">
    <!-- 页面标题 -->
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">房车租赁分润管理</span>
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
              <div class="stats-label">总补贴金额</div>
              <div class="stats-value">¥{{ formatNumber(statistics.totalSubsidy) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fef0f0; color: #f56c6c">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">订单数量</div>
              <div class="stats-value">{{ statistics.orderCount }}</div>
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
              <div class="stats-label">平均分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.avgProfitPerOrder) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab切换 -->
    <el-card class="main-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 分润记录 -->
        <el-tab-pane label="分润记录" name="records">
          <!-- 搜索筛选 -->
          <el-form :inline="true" :model="queryForm" class="search-form">
            <el-form-item label="车主">
              <el-input
                v-model="queryForm.ownerId"
                placeholder="请输入车主ID或姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="车辆">
              <el-input
                v-model="queryForm.vehicleId"
                placeholder="请输入车辆ID或名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="托管类型">
              <el-select v-model="queryForm.hostingType" placeholder="请选择" clearable>
                <el-option label="自有车托管" value="own_car" />
                <el-option label="购车托管" value="new_car" />
                <el-option label="众筹托管" value="crowdfunding" />
              </el-select>
            </el-form-item>
            <el-form-item label="分润状态">
              <el-select v-model="queryForm.status" placeholder="请选择" clearable>
                <el-option label="待结算" value="pending" />
                <el-option label="已计算" value="calculated" />
                <el-option label="已支付" value="paid" />
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
          <el-table :data="recordList" v-loading="loading" border stripe style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" width="160" />
            <el-table-column prop="vehicleName" label="车辆" width="150" />
            <el-table-column prop="ownerName" label="车主" width="120" />
            <el-table-column prop="hostingType" label="托管类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getHostingTypeTag(row.hostingType)">
                  {{ getHostingTypeName(row.hostingType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderAmount" label="订单金额" width="120" align="right">
              <template #default="{ row }"> ¥{{ formatNumber(row.orderAmount) }} </template>
            </el-table-column>
            <el-table-column prop="orderProfit" label="订单利润" width="120" align="right">
              <template #default="{ row }"> ¥{{ formatNumber(row.orderProfit) }} </template>
            </el-table-column>
            <el-table-column prop="finalRatio" label="最终比例" width="100" align="right">
              <template #default="{ row }"> {{ row.finalRatio }}% </template>
            </el-table-column>
            <el-table-column prop="profitAmount" label="分润金额" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ formatNumber(row.profitAmount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="subsidyAmount" label="补贴金额" width="120" align="right">
              <template #default="{ row }">
                <span v-if="row.subsidyAmount > 0" style="color: #67c23a">
                  ¥{{ formatNumber(row.subsidyAmount) }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">
                  ¥{{ formatNumber(row.totalAmount) }}
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
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewDetail(row)">
                  详情
                </el-button>
                <el-button
                  v-if="row.status === 'calculated'"
                  link
                  type="success"
                  size="small"
                  @click="handlePay(row)"
                >
                  支付
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            class="pagination"
          />
        </el-tab-pane>

        <!-- 托管配置 -->
        <el-tab-pane label="托管配置" name="config">
          <hosting-config />
        </el-tab-pane>

        <!-- 补贴规则 -->
        <el-tab-pane label="补贴规则" name="subsidy">
          <subsidy-rules />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="分润详情" width="800px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="订单号">{{ currentRecord.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="车辆">{{ currentRecord.vehicleName }}</el-descriptions-item>
        <el-descriptions-item label="车主">{{ currentRecord.ownerName }}</el-descriptions-item>
        <el-descriptions-item label="托管类型">
          {{ getHostingTypeName(currentRecord.hostingType) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          ¥{{ formatNumber(currentRecord.orderAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="直接成本">
          ¥{{ formatNumber(currentRecord.directCost) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单利润">
          ¥{{ formatNumber(currentRecord.orderProfit) }}
        </el-descriptions-item>
        <el-descriptions-item label="基础比例">
          {{ currentRecord.baseRatio }}%
        </el-descriptions-item>
        <el-descriptions-item label="绩效加成">
          {{ currentRecord.performanceBonus }}%
        </el-descriptions-item>
        <el-descriptions-item label="最终比例">
          {{ currentRecord.finalRatio }}%
        </el-descriptions-item>
        <el-descriptions-item label="分润金额">
          <span style="color: #f56c6c; font-weight: bold">
            ¥{{ formatNumber(currentRecord.profitAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="补贴金额">
          <span style="color: #67c23a; font-weight: bold">
            ¥{{ formatNumber(currentRecord.subsidyAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="总金额" :span="2">
          <span style="color: #409eff; font-weight: bold; font-size: 18px">
            ¥{{ formatNumber(currentRecord.totalAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentRecord.status)">
            {{ getStatusName(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentRecord.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间" :span="2">
          {{ currentRecord.paidAt || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Search,
  Refresh,
  Money,
  Coin,
  Document,
  TrendCharts,
} from '@element-plus/icons-vue'
import type { HostingProfitRecord, HostingType, ProfitStatus } from '@/types/profit'
import { getHostingProfitRecords, getHostingProfitStatistics, batchPayProfit } from '@/api/profit'
import { ProductType } from '@/types/profit'
import HostingConfig from './components/HostingConfig.vue'
import SubsidyRules from './components/SubsidyRules.vue'

// 当前激活的Tab
const activeTab = ref('records')

// 加载状态
const loading = ref(false)

// 统计数据
const statistics = ref({
  totalProfit: 0,
  totalSubsidy: 0,
  orderCount: 0,
  avgProfitPerOrder: 0,
  ownCarProfit: 0,
  newCarProfit: 0,
  crowdfundingProfit: 0,
})

// 查询表单
const queryForm = reactive({
  ownerId: '',
  vehicleId: '',
  hostingType: '',
  status: '',
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 记录列表
const recordList = ref<HostingProfitRecord[]>([])

// 当前记录
const currentRecord = ref<HostingProfitRecord | null>(null)

// 详情对话框
const detailDialogVisible = ref(false)

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const params: any = {}
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getHostingProfitStatistics(params)
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取记录列表
const fetchRecords = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.ownerId) {
      params.ownerId = queryForm.ownerId
    }
    if (queryForm.vehicleId) {
      params.vehicleId = queryForm.vehicleId
    }
    if (queryForm.hostingType) {
      params.hostingType = queryForm.hostingType
    }
    if (queryForm.status) {
      params.status = queryForm.status
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getHostingProfitRecords(params)
    recordList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取记录列表失败:', error)
    ElMessage.error('获取记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
  fetchStatistics()
}

// 重置
const handleReset = () => {
  queryForm.ownerId = ''
  queryForm.vehicleId = ''
  queryForm.hostingType = ''
  queryForm.status = ''
  dateRange.value = null
  pagination.page = 1
  fetchRecords()
  fetchStatistics()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  fetchRecords()
}

// 页码改变
const handlePageChange = () => {
  fetchRecords()
}

// Tab切换
const handleTabChange = () => {
  // Tab切换逻辑
}

// 查看详情
const handleViewDetail = (row: HostingProfitRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 支付
const handlePay = async (row: HostingProfitRecord) => {
  try {
    await ElMessageBox.confirm('确认支付该笔分润？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await batchPayProfit({
      recordIds: [row.id],
      productType: ProductType.VEHICLE_RENTAL,
    })
    ElMessage.success('支付成功')
    fetchRecords()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败:', error)
      ElMessage.error('支付失败')
    }
  }
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toFixed(2)
}

// 获取托管类型名称
const getHostingTypeName = (type: HostingType) => {
  const map: Record<HostingType, string> = {
    own_car: '自有车托管',
    new_car: '购车托管',
    crowdfunding: '众筹托管',
  }
  return map[type] || type
}

// 获取托管类型标签
const getHostingTypeTag = (type: HostingType) => {
  const map: Record<HostingType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    own_car: 'primary',
    new_car: 'success',
    crowdfunding: 'warning',
  }
  return map[type] || ''
}

// 获取状态名称
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

// 获取状态标签
const getStatusTag = (status: ProfitStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<ProfitStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'info',
    calculated: 'warning',
    paid: 'success',
    frozen: 'danger',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

// 初始化
onMounted(() => {
  fetchStatistics()
  fetchRecords()
})
</script>

<style scoped lang="scss">
.vehicle-rental-profit-container {
  padding: 20px;

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
