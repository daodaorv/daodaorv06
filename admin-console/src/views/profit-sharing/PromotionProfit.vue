<template>
  <div class="promotion-profit-container">
    <!-- 页面标题 -->
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">推广分润管理</span>
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
              <div class="stats-label">总推广分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.totalProfit) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f0f9ff; color: #67c23a">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">推广用户数</div>
              <div class="stats-value">{{ statistics.promoterCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fef0f0; color: #f56c6c">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">一级推广分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.level1Profit) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fdf6ec; color: #e6a23c">
              <el-icon :size="24"><Star /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">PLUS会员奖励</div>
              <div class="stats-value">¥{{ formatNumber(statistics.plusMemberReward) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab切换 -->
    <el-card class="main-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 推广分润记录 -->
        <el-tab-pane label="推广分润记录" name="records">
          <!-- 搜索筛选 -->
          <el-form :inline="true" :model="queryForm" class="search-form">
            <el-form-item label="推广者">
              <el-input
                v-model="queryForm.promoterUserId"
                placeholder="请输入推广者ID或姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
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
          <el-table :data="recordList" v-loading="loading" border stripe style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" width="160" />
            <el-table-column prop="productType" label="产品类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getProductTypeTag(row.productType)">
                  {{ getProductTypeName(row.productType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="promoterUserName" label="推广者" width="120" />
            <el-table-column prop="promotionLevel" label="推广级别" width="100">
              <template #default="{ row }">
                <el-tag :type="row.promotionLevel === 1 ? 'success' : 'info'">
                  {{ row.promotionLevel === 1 ? '一级' : '二级' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderAmount" label="订单金额" width="120" align="right">
              <template #default="{ row }"> ¥{{ formatNumber(row.orderAmount) }} </template>
            </el-table-column>
            <el-table-column prop="orderProfit" label="订单利润" width="120" align="right">
              <template #default="{ row }"> ¥{{ formatNumber(row.orderProfit) }} </template>
            </el-table-column>
            <el-table-column prop="profitRatio" label="分润比例" width="100" align="right">
              <template #default="{ row }"> {{ row.profitRatio }}% </template>
            </el-table-column>
            <el-table-column prop="profitAmount" label="分润金额" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ formatNumber(row.profitAmount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="isPlusMemberReward" label="PLUS奖励" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isPlusMemberReward" type="warning">是</el-tag>
                <el-tag v-else type="info">否</el-tag>
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
                <el-button
                  v-if="row.status === 'pending'"
                  link
                  type="danger"
                  size="small"
                  @click="handleFreeze(row)"
                >
                  冻结
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

        <!-- 推广关系管理 -->
        <el-tab-pane label="推广关系管理" name="relations">
          <promotion-relations />
        </el-tab-pane>

        <!-- 推广配置 -->
        <el-tab-pane label="推广配置" name="config">
          <promotion-config />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="推广分润详情" width="800px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="订单号">{{ currentRecord.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="产品类型">
          {{ getProductTypeName(currentRecord.productType) }}
        </el-descriptions-item>
        <el-descriptions-item label="推广者">{{
          currentRecord.promoterUserName
        }}</el-descriptions-item>
        <el-descriptions-item label="推广级别">
          {{ currentRecord.promotionLevel === 1 ? '一级推广' : '二级推广' }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          ¥{{ formatNumber(currentRecord.orderAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单利润">
          ¥{{ formatNumber(currentRecord.orderProfit) }}
        </el-descriptions-item>
        <el-descriptions-item label="分润比例">
          {{ currentRecord.profitRatio }}%
        </el-descriptions-item>
        <el-descriptions-item label="分润金额">
          <span style="color: #f56c6c; font-weight: bold">
            ¥{{ formatNumber(currentRecord.profitAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="PLUS会员奖励">
          {{ currentRecord.isPlusMemberReward ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentRecord.status)">
            {{ getStatusName(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentRecord.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ currentRecord.paidAt || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Search, Refresh, Money, User, TrendCharts, Star } from '@element-plus/icons-vue'
import type { PromotionProfitRecord, ProductType, ProfitStatus } from '@/types/profit'
import {
  getPromotionProfitRecords,
  getPromotionProfitStatistics,
  batchPayProfit,
  freezeProfit,
} from '@/api/profit'
import PromotionRelations from './components/PromotionRelations.vue'
import PromotionConfig from './components/PromotionConfig.vue'

// 当前激活的Tab
const activeTab = ref('records')

// 加载状态
const loading = ref(false)

// 统计数据
const statistics = ref({
  totalProfit: 0,
  promoterCount: 0,
  level1Profit: 0,
  level2Profit: 0,
  plusMemberReward: 0,
  vehicleRentalProfit: 0,
  campsiteProfit: 0,
  tourProfit: 0,
  orderCount: 0,
})

// 查询表单
const queryForm = reactive({
  promoterUserId: '',
  productType: '',
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
const recordList = ref<PromotionProfitRecord[]>([])

// 当前记录
const currentRecord = ref<PromotionProfitRecord | null>(null)

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
    const res = await getPromotionProfitStatistics(params)
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
    if (queryForm.promoterUserId) {
      params.promoterUserId = queryForm.promoterUserId
    }
    if (queryForm.productType) {
      params.productType = queryForm.productType
    }
    if (queryForm.status) {
      params.status = queryForm.status
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getPromotionProfitRecords(params)
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
  queryForm.promoterUserId = ''
  queryForm.productType = ''
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
const handleViewDetail = (row: PromotionProfitRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 支付
const handlePay = async (row: PromotionProfitRecord) => {
  try {
    await ElMessageBox.confirm('确认支付该笔分润？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await batchPayProfit({
      recordIds: [row.id],
      productType: row.productType,
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

// 冻结
const handleFreeze = async (row: PromotionProfitRecord) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入冻结原因', '冻结分润', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入冻结原因',
    })
    await freezeProfit({
      recordIds: [row.id],
      reason,
    })
    ElMessage.success('冻结成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('冻结失败:', error)
      ElMessage.error('冻结失败')
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

// 获取产品类型名称
const getProductTypeName = (type: ProductType) => {
  const map: Record<ProductType, string> = {
    vehicle_rental: '房车租赁',
    campsite: '营地产品',
    tour: '房车旅游',
  }
  return map[type] || type
}

// 获取产品类型标签
const getProductTypeTag = (type: ProductType) => {
  const map: Record<ProductType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    vehicle_rental: 'primary',
    campsite: 'success',
    tour: 'warning',
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
.promotion-profit-container {
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
