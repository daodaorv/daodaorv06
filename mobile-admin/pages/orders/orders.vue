<template>
  <view class="orders-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <uni-search-bar
        v-model="keyword"
        placeholder="搜索订单号/用户手机号"
        @input="onSearchInput"
        @confirm="handleSearch"
        @clear="handleClear"
        focus-color="#007AFF"
        bg-color="#f5f5f5"
      />

      <!-- 筛选栏 -->
      <view class="filter-bar">
        <scroll-view scroll-x class="filter-scroll">
          <view class="filter-item"
                :class="{ active: filterStatus === item.value }"
                v-for="item in statusOptions"
                :key="item.value"
                @click="handleFilter(item.value)">
            {{ item.label }}
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
      <view v-for="order in orderList" :key="order.id" class="order-item" @click="viewOrderDetail(order)">
        <view class="order-header">
          <view class="order-info">
            <text class="order-number">订单号：{{ order.order_number }}</text>
            <text class="order-time">{{ formatTime(order.created_at) }}</text>
          </view>
          <view :class="['order-status', getStatusClass(order.status)]">
            {{ getStatusText(order.status) }}
          </view>
        </view>

        <view class="order-content">
          <view class="user-info">
            <uni-icons type="person" size="16" color="#666"></uni-icons>
            <text class="user-name">{{ order.user?.nickname || order.user?.phone }}</text>
          </view>

          <view class="vehicle-info">
            <uni-icons type="car" size="16" color="#666"></uni-icons>
            <text class="vehicle-name">{{ order.vehicle?.brand }} {{ order.vehicle?.model }}</text>
          </view>

          <view class="rental-info">
            <view class="rental-date">
              <uni-icons type="calendar" size="16" color="#666"></uni-icons>
              <text class="date-text">{{ formatDate(order.start_date) }} - {{ formatDate(order.end_date) }}</text>
            </view>
            <text class="rental-days">{{ order.rental_days }}天</text>
          </view>
        </view>

        <view class="order-footer">
          <view class="price-info">
            <text class="price-label">租金：</text>
            <text class="price-value">¥{{ order.total_amount }}</text>
          </view>

          <view class="action-buttons">
            <button v-if="order.status === 'pending'"
                    class="action-btn approve"
                    @click.stop="updateOrderStatus(order.id, 'confirmed')">
              确认
            </button>
            <button v-if="order.status === 'pending'"
                    class="action-btn reject"
                    @click.stop="cancelOrder(order.id)">
              取消
            </button>
            <button v-if="order.status === 'confirmed'"
                    class="action-btn primary"
                    @click.stop="updateOrderStatus(order.id, 'rented')">
              开始租用
            </button>
            <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">
              详情
            </button>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" :content-text="loadingText" />
      </view>
      <view v-if="!hasMore && orderList.length > 0" class="no-more">
        <uni-load-more status="noMore" />
      </view>
      <view v-if="orderList.length === 0 && !loading" class="empty-container">
        <uni-empty description="暂无订单数据" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { orderApi } from '../../api/order'

// 响应式数据
const keyword = ref('')
const filterStatus = ref('')
const orderList = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 计算属性
const statusOptions = computed(() => [
  { label: '全部', value: '' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '租用中', value: 'rented' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

const loadingText = computed(() => ({
  contentdown: '上拉加载更多',
  contentrefresh: '加载中',
  contentnomore: '没有更多了'
}))

// 方法
const fetchOrderList = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: 20,
      keyword: keyword.value,
      status: filterStatus.value
    }

    const result = await orderApi.getOrderList(params)

    if (isLoadMore) {
      orderList.value = [...orderList.value, ...result.list]
    } else {
      orderList.value = result.list
    }

    hasMore.value = result.list.length < result.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    uni.showToast({
      title: error.message || '获取失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  hasMore.value = true
  orderList.value = []
  fetchOrderList()
}

const handleClear = () => {
  keyword.value = ''
  handleSearch()
}

const onSearchInput = (value) => {
  keyword.value = value
}

const handleFilter = (status) => {
  filterStatus.value = status
  page.value = 1
  hasMore.value = true
  orderList.value = []
  fetchOrderList()
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchOrderList(true)
}

const updateOrderStatus = async (orderId, newStatus) => {
  uni.showModal({
    title: '确认操作',
    content: `确定要${getStatusText(newStatus)}这个订单吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderApi.updateOrderStatus(orderId, newStatus)
          uni.showToast({
            title: '操作成功',
            icon: 'success'
          })
          // 刷新列表
          page.value = 1
          fetchOrderList()
        } catch (error) {
          console.error('更新订单状态失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const cancelOrder = async (orderId) => {
  uni.showModal({
    title: '取消订单',
    content: '请输入取消原因',
    editable: true,
    placeholderText: '请输入取消原因',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderApi.cancelOrder(orderId, res.content || '管理员取消')
          uni.showToast({
            title: '取消成功',
            icon: 'success'
          })
          // 刷新列表
          page.value = 1
          fetchOrderList()
        } catch (error) {
          console.error('取消订单失败:', error)
          uni.showToast({
            title: error.message || '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const viewOrderDetail = (order) => {
  const orderInfo = `订单号：${order.order_number}\n用户：${order.user?.nickname || order.user?.phone}\n车辆：${order.vehicle?.brand} ${order.vehicle?.model}\n租期：${formatDate(order.start_date)} - ${formatDate(order.end_date)}\n租金：¥${order.total_amount}\n状态：${getStatusText(order.status)}`

  uni.showModal({
    title: '订单详情',
    content: orderInfo,
    showCancel: false,
    confirmText: '确定'
  })
}

// 工具函数
const getStatusText = (status) => {
  const statusMap = {
    pending: '待确认',
    confirmed: '已确认',
    rented: '租用中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    rented: 'status-rented',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || ''
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.substring(5) // MM-DD
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  const token = uni.getStorageSync('mobile_admin_token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }

  fetchOrderList()
})
</script>

<style scoped>
.orders-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-section {
  background: #fff;
  padding: 20rpx;
  border-bottom: 1px solid #e0e0e0;
}

.filter-bar {
  margin-top: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  margin-right: 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s ease;
}

.filter-item.active {
  background: #007AFF;
  color: #fff;
}

.order-list {
  flex: 1;
  padding: 20rpx;
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.order-info {
  flex: 1;
}

.order-number {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-confirmed {
  background: #e6f7ff;
  color: #1890ff;
}

.status-rented {
  background: #f6ffed;
  color: #52c41a;
}

.status-completed {
  background: #f0f0f0;
  color: #666;
}

.status-cancelled {
  background: #fff2f0;
  color: #ff4d4f;
}

.order-content {
  margin-bottom: 20rpx;
}

.user-info,
.vehicle-info {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.user-name,
.vehicle-name {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.rental-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rental-date {
  display: flex;
  align-items: center;
}

.date-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.rental-days {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 26rpx;
  color: #666;
}

.price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
  line-height: 1;
}

.action-btn.approve {
  background: #52c41a;
  color: #fff;
}

.action-btn.reject {
  background: #ff4d4f;
  color: #fff;
}

.action-btn.primary {
  background: #007AFF;
  color: #fff;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #666;
}

.action-btn:active {
  opacity: 0.8;
}

.loading-container,
.no-more,
.empty-container {
  padding: 40rpx;
  text-align: center;
}
</style>