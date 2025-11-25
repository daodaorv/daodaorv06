<!--
  订单管理主页面
-->
<template>
  <div class="orders-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">订单管理</h1>
        <p class="page-description">管理房车租赁订单、支付和处理流程</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="4" v-for="stat in statsData" :key="stat.key">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :class="stat.color">
                <el-icon size="20"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="订单搜索">
            <el-input
              v-model="filterForm.orderNo"
              placeholder="订单编号、用户姓名、手机号"
              clearable
              @keyup.enter="handleSearch"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 150px">
              <el-option label="待确认" value="pending" />
              <el-option label="已确认" value="confirmed" />
              <el-option label="已支付" value="paid" />
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="争议中" value="disputed" />
            </el-select>
          </el-form-item>
          <el-form-item label="支付状态">
            <el-select v-model="filterForm.paymentStatus" placeholder="请选择" clearable style="width: 120px">
              <el-option label="未支付" value="unpaid" />
              <el-option label="已支付" value="paid" />
              <el-option label="部分支付" value="partial_paid" />
              <el-option label="已退款" value="refunded" />
            </el-select>
          </el-form-item>
          <el-form-item label="预订来源">
            <el-select v-model="filterForm.source" placeholder="请选择" clearable style="width: 120px">
              <el-option label="微信小程序" value="wechat" />
              <el-option label="官网" value="website" />
              <el-option label="电话预订" value="phone" />
              <el-option label="现场预订" value="walkin" />
              <el-option label="后台添加" value="admin" />
            </el-select>
          </el-form-item>
          <el-form-item label="租赁日期">
            <el-date-picker
              v-model="rentalDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleRentalDateChange"
            />
          </el-form-item>
          <el-form-item label="创建日期">
            <el-date-picker
              v-model="createdDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleCreatedDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleResetFilter">重置</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 订单列表 -->
    <div class="orders-table">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>订单列表</span>
            <div class="table-actions">
              <el-dropdown @command="handleBatchAction" v-if="selectedOrders.length > 0">
                <el-button>
                  批量操作 ({{ selectedOrders.length }})
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="confirmed">批量确认</el-dropdown-item>
                    <el-dropdown-item command="cancelled">批量取消</el-dropdown-item>
                    <el-dropdown-item command="notify">批量通知</el-dropdown-item>
                    <el-dropdown-item command="export" divided>批量导出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="orders"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="订单信息" min-width="200">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-no">{{ row.orderNo }}</div>
                <div class="order-meta">
                  <el-tag size="small" :type="getSourceType(row.bookingSource)">
                    {{ getSourceText(row.bookingSource) }}
                  </el-tag>
                  <span class="create-time">{{ formatDate(row.createdAt) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户信息" min-width="150">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-name">{{ row.userInfo.name }}</div>
                <div class="user-phone">{{ row.userInfo.phone }}</div>
                <div class="user-rating" v-if="row.userInfo.rating">
                  <el-rate
                    :model-value="row.userInfo.rating"
                    disabled
                    size="small"
                    text-color="#ff9900"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="车辆信息" min-width="180">
            <template #default="{ row }">
              <div class="vehicle-info">
                <div class="vehicle-name">{{ row.vehicleInfo.brand }} {{ row.vehicleInfo.model }}</div>
                <div class="vehicle-details">
                  <span>{{ row.vehicleInfo.licensePlate }}</span>
                  <span>{{ row.vehicleInfo.year }}年</span>
                </div>
                <div class="vehicle-location">
                  <el-icon><Location /></el-icon>
                  {{ row.vehicleInfo.location }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="租赁时间" min-width="160">
            <template #default="{ row }">
              <div class="rental-info">
                <div class="rental-dates">
                  <div>{{ formatDate(row.rentalInfo.startDate) }}</div>
                  <div class="arrow">↓</div>
                  <div>{{ formatDate(row.rentalInfo.endDate) }}</div>
                </div>
                <div class="rental-days">{{ row.rentalInfo.duration }}天</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="payment.status" label="支付状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getPaymentStatusType(row.payment.status)" size="small">
                {{ getPaymentStatusText(row.payment.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <div class="amount-info">
                <div class="total-amount">¥{{ row.pricing.totalAmount.toLocaleString() }}</div>
                <div class="paid-amount" v-if="row.payment.paidAmount > 0">
                  已付: ¥{{ row.payment.paidAmount.toLocaleString() }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click.stop="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button size="small" @click.stop="handleEdit(row)" v-if="canEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-dropdown trigger="click" @command="(action) => handleAction(action, row)">
                  <el-button size="small" @click.stop>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="payment" v-if="row.payment.status === 'unpaid'">
                        收款
                      </el-dropdown-item>
                      <el-dropdown-item command="refund" v-if="canRefund(row)">
                        退款
                      </el-dropdown-item>
                      <el-dropdown-item command="pickup" v-if="row.status === 'confirmed'">
                        取车
                      </el-dropdown-item>
                      <el-dropdown-item command="return" v-if="row.status === 'active'">
                        还车
                      </el-dropdown-item>
                      <el-dropdown-item command="timeline">时间线</el-dropdown-item>
                      <el-dropdown-item command="documents">文件</el-dropdown-item>
                      <el-dropdown-item command="export">导出</el-dropdown-item>
                      <el-dropdown-item command="cancel" v-if="canCancel(row)" divided>
                        取消
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <el-empty
          v-if="orders.length === 0 && !loading"
          description="暂无订单数据"
        >
          <el-button type="primary" @click="handleCreate">
            创建第一个订单
          </el-button>
        </el-empty>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="90%"
      :destroy-on-close="true"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 这里可以添加订单详情的完整显示 -->
        <div class="detail-loading">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </el-dialog>

    <!-- 时间线对话框 -->
    <el-dialog
      v-model="timelineVisible"
      title="订单时间线"
      width="60%"
      :destroy-on-close="true"
    >
      <div v-if="currentOrder" class="timeline-content">
        <el-timeline>
          <el-timeline-item
            v-for="item in currentOrder.timeline"
            :key="item.id"
            :timestamp="formatDateTime(item.createdAt)"
            placement="top"
          >
            <div class="timeline-item">
              <div class="timeline-header">
                <span class="timeline-title">{{ item.title }}</span>
                <el-tag size="small" :type="getStatusType(item.status)">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="timeline-description" v-if="item.description">
                {{ item.description }}
              </div>
              <div class="timeline-operator">
                {{ item.operatorName }} ({{ getOperatorTypeText(item.operatorType) }})
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  ArrowDown,
  View,
  Edit,
  MoreFilled,
  Location,
  Truck,
  CreditCard,
  User,
  TrendCharts
} from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'
import type { Order, OrderListParams, OrderStats } from '@/types/order'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const orders = ref<Order[]>([])
const total = ref(0)
const statsData = ref<any[]>([])
const detailVisible = ref(false)
const timelineVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const selectedOrders = ref<string[]>([])
const rentalDateRange = ref<[string, string]>(['', ''])
const createdDateRange = ref<[string, string]>(['', ''])

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 筛选表单
const filterForm = reactive<OrderListParams>({
  orderNo: '',
  status: undefined,
  paymentStatus: undefined,
  source: undefined,
  startDate: '',
  endDate: '',
  createdStartDate: '',
  createdEndDate: ''
})

// 统计数据
const stats = ref<OrderStats>({
  total: 0,
  pending: 0,
  confirmed: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
  disputed: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  occupancyRate: 0,
  averageRentalDays: 0,
  revenueByMonth: [],
  popularVehicles: [],
  commonServices: []
})

// 状态映射函数
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    confirmed: 'warning',
    paid: 'success',
    active: 'primary',
    completed: 'success',
    cancelled: 'danger',
    disputed: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    paid: '已支付',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    disputed: '争议中'
  }
  return textMap[status] || '未知'
}

const getPaymentStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    unpaid: 'danger',
    paying: 'warning',
    paid: 'success',
    partial_paid: 'warning',
    refunded: 'info'
  }
  return typeMap[status] || 'info'
}

const getPaymentStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    unpaid: '未支付',
    paying: '支付中',
    paid: '已支付',
    partial_paid: '部分支付',
    refunded: '已退款'
  }
  return textMap[status] || '未知'
}

const getSourceType = (source: string) => {
  const typeMap: Record<string, string> = {
    wechat: 'success',
    website: 'primary',
    phone: 'warning',
    walkin: 'info',
    admin: 'danger'
  }
  return typeMap[source] || 'info'
}

const getSourceText = (source: string) => {
  const textMap: Record<string, string> = {
    wechat: '微信',
    website: '官网',
    phone: '电话',
    walkin: '现场',
    admin: '后台'
  }
  return textMap[source] || '其他'
}

const getOperatorTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    customer: '客户',
    admin: '管理员',
    staff: '员工',
    system: '系统'
  }
  return typeMap[type] || '未知'
}

// 权限判断函数
const canEdit = (order: Order) => {
  return ['pending', 'confirmed'].includes(order.status)
}

const canCancel = (order: Order) => {
  return ['pending', 'confirmed'].includes(order.status)
}

const canRefund = (order: Order) => {
  return ['paid', 'active', 'completed'].includes(order.status) && order.payment.paidAmount > 0
}

// 日期格式化
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 日期范围变更处理
const handleRentalDateChange = (dates: [string, string]) => {
  if (dates && dates.length === 2) {
    filterForm.startDate = dates[0]
    filterForm.endDate = dates[1]
  } else {
    filterForm.startDate = ''
    filterForm.endDate = ''
  }
}

const handleCreatedDateChange = (dates: [string, string]) => {
  if (dates && dates.length === 2) {
    filterForm.createdStartDate = dates[0]
    filterForm.createdEndDate = dates[1]
  } else {
    filterForm.createdStartDate = ''
    filterForm.createdEndDate = ''
  }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    const response = await orderApi.getOrders(params)
    orders.value = response.data
    total.value = response.meta?.total || 0
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await orderApi.getOrderStats()
    stats.value = response.data

    // 转换为卡片数据
    statsData.value = [
      {
        key: 'total',
        label: '总订单',
        value: stats.value.total,
        icon: 'Truck',
        color: 'blue'
      },
      {
        key: 'pending',
        label: '待确认',
        value: stats.value.pending,
        icon: 'User',
        color: 'orange'
      },
      {
        key: 'active',
        label: '进行中',
        value: stats.value.active,
        icon: 'TrendCharts',
        color: 'green'
      },
      {
        key: 'completed',
        label: '已完成',
        value: stats.value.completed,
        icon: 'CreditCard',
        color: 'success'
      },
      {
        key: 'cancelled',
        label: '已取消',
        value: stats.value.cancelled,
        icon: 'View',
        color: 'red'
      },
      {
        key: 'totalRevenue',
        label: '总收入',
        value: `¥${stats.value.totalRevenue.toLocaleString()}`,
        icon: 'CreditCard',
        color: 'purple'
      }
    ]
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadOrders()
}

// 重置筛选
const handleResetFilter = () => {
  Object.assign(filterForm, {
    orderNo: '',
    status: undefined,
    paymentStatus: undefined,
    source: undefined,
    startDate: '',
    endDate: '',
    createdStartDate: '',
    createdEndDate: ''
  })
  rentalDateRange.value = ['', '']
  createdDateRange.value = ['', '']
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadOrders()
  loadStats()
}

// 导出
const handleExport = async () => {
  try {
    const response = await orderApi.exportOrders({
      ...filterForm,
      format: 'excel'
    })
    // 创建下载链接
    const blob = new Blob([response])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadOrders()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadOrders()
}

// 选择变更
const handleSelectionChange = (selected: Order[]) => {
  selectedOrders.value = selected.map(item => item.id)
}

// 行点击
const handleRowClick = (row: Order) => {
  handleView(row)
}

// 创建订单
const handleCreate = () => {
  router.push('/orders/create')
}

// 查看订单
const handleView = (order: Order) => {
  currentOrder.value = order
  detailVisible.value = true
}

// 编辑订单
const handleEdit = (order: Order) => {
  router.push(`/orders/${order.id}/edit`)
}

// 批量操作
const handleBatchAction = async (action: string) => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要操作的订单')
    return
  }

  try {
    switch (action) {
      case 'confirmed':
        await orderApi.batchUpdateStatus(selectedOrders.value, 'confirmed')
        ElMessage.success('批量确认成功')
        break
      case 'cancelled':
        await ElMessageBox.confirm('确定要取消选中的订单吗？', '确认取消', {
          type: 'warning'
        })
        await orderApi.batchCancel(selectedOrders.value, '批量取消')
        ElMessage.success('批量取消成功')
        break
      case 'notify':
        // TODO: 实现批量通知
        ElMessage.info('功能开发中')
        break
      case 'export':
        await orderApi.exportOrders({
          orderIds: selectedOrders.value,
          format: 'excel'
        })
        ElMessage.success('批量导出成功')
        break
    }
    loadOrders()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
    }
  }
}

// 单个操作
const handleAction = async (action: string, order: Order) => {
  switch (action) {
    case 'payment':
      router.push(`/orders/${order.id}/payment`)
      break
    case 'refund':
      router.push(`/orders/${order.id}/refund`)
      break
    case 'pickup':
      router.push(`/orders/${order.id}/pickup`)
      break
    case 'return':
      router.push(`/orders/${order.id}/return`)
      break
    case 'timeline':
      currentOrder.value = order
      timelineVisible.value = true
      break
    case 'documents':
      router.push(`/orders/${order.id}/documents`)
      break
    case 'export':
      try {
        await orderApi.exportOrder(order.id)
        ElMessage.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
      }
      break
    case 'cancel':
      try {
        const { value: reason } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea'
        })
        await orderApi.cancelOrder(order.id, reason)
        ElMessage.success('订单取消成功')
        loadOrders()
        loadStats()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订单失败:', error)
          ElMessage.error('取消订单失败')
        }
      }
      break
  }
}

// 生命周期
onMounted(() => {
  loadOrders()
  loadStats()
})
</script>

<style lang="scss" scoped>
.orders-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-content {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .page-description {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          &.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          &.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
          &.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          &.red { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
          &.purple { background: linear-gradient(135deg, #8e44ad 0%, #c0392b 100%); }
          &.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            line-height: 1;
          }

          .stat-label {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
          }
        }
      }
    }
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .orders-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .order-info {
      .order-no {
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .order-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        .create-time {
          color: var(--el-text-color-placeholder);
        }
      }
    }

    .user-info {
      .user-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 2px;
      }

      .user-phone {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 2px;
      }

      .user-rating {
        margin-top: 4px;
      }
    }

    .vehicle-info {
      .vehicle-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 2px;
      }

      .vehicle-details {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;

        span {
          margin-right: 8px;
        }
      }

      .vehicle-location {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .rental-info {
      .rental-dates {
        font-size: 13px;
        margin-bottom: 4px;

        .arrow {
          text-align: center;
          color: var(--el-text-color-placeholder);
        }
      }

      .rental-days {
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }

    .amount-info {
      .total-amount {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .paid-amount {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .order-detail {
    .detail-loading {
      padding: 20px 0;
    }
  }

  .timeline-content {
    .timeline-item {
      .timeline-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .timeline-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .timeline-description {
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .timeline-operator {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>