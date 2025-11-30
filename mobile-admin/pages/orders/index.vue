<template>
  <view class="orders-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar
        v-model="searchKeyword"
        placeholder="搜索订单号/客户/车牌"
        @confirm="handleSearch"
        @clear="handleClear"
      />
    </view>

    <!-- 状态筛选 -->
    <view class="filter-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @click="changeStatus(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="viewDetail(order.id)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-no">订单号: {{ order.orderNo }}</view>
          <uni-tag
            :text="order.statusText"
            :type="getStatusType(order.status)"
          />
        </view>

        <!-- 订单信息 -->
        <view class="order-info">
          <view class="info-row">
            <text class="label">客户:</text>
            <text class="value">{{ order.customerName }}</text>
            <text class="phone" @click.stop="callCustomer(order.customerPhone)">📞</text>
          </view>
          <view class="info-row">
            <text class="label">车辆:</text>
            <text class="value">{{ order.vehicleName }} ({{ order.vehiclePlate }})</text>
          </view>
          <view class="info-row">
            <text class="label">租期:</text>
            <text class="value">{{ order.startDate }} 至 {{ order.endDate }} ({{ order.days }}天)</text>
          </view>
          <view class="info-row">
            <text class="label">金额:</text>
            <text class="value price">¥{{ order.totalAmount }}</text>
          </view>
        </view>

        <!-- 订单操作 -->
        <view class="order-actions">
          <button
            v-if="order.status === 'pending'"
            class="action-btn primary"
            size="mini"
            type="primary"
            @click.stop="confirmOrder(order)"
          >
            确认订单
          </button>
          <button
            v-if="order.status === 'pending'"
            class="action-btn"
            size="mini"
            @click.stop="cancelOrder(order)"
          >
            取消订单
          </button>
          <button
            v-if="order.status === 'confirmed'"
            class="action-btn primary"
            size="mini"
            type="primary"
            @click.stop="startOrder(order)"
          >
            开始用车
          </button>
          <button
            v-if="order.status === 'in_use'"
            class="action-btn primary"
            size="mini"
            type="primary"
            @click.stop="completeOrder(order)"
          >
            完成订单
          </button>
          <button
            class="action-btn"
            size="mini"
            @click.stop="viewDetail(order.id)"
          >
            查看详情
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="orderList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <uni-load-more status="loading" />
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderList, updateOrderStatus, confirmOrder as confirmOrderApi, cancelOrder as cancelOrderApi } from '@/api/order'

export default {
  data() {
    return {
      searchKeyword: '',
      currentStatus: 'all',
      statusTabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '待确认', value: 'pending', count: 0 },
        { label: '已确认', value: 'confirmed', count: 0 },
        { label: '使用中', value: 'in_use', count: 0 },
        { label: '已完成', value: 'completed', count: 0 }
      ],
      orderList: [],
      loading: false
    }
  },

  onLoad() {
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  methods: {
    async loadOrders() {
      this.loading = true
      try {
        const params = {}
        if (this.currentStatus !== 'all') {
          params.status = this.currentStatus
        }
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }

        const data = await getOrderList(params)
        this.orderList = data.list

        // 更新状态计数
        this.updateStatusCount()
      } catch (error) {
        console.error('加载订单失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    updateStatusCount() {
      // 这里应该从API获取各状态的数量，暂时使用模拟数据
      this.statusTabs[1].count = this.orderList.filter(o => o.status === 'pending').length
      this.statusTabs[2].count = this.orderList.filter(o => o.status === 'confirmed').length
      this.statusTabs[3].count = this.orderList.filter(o => o.status === 'in_use').length
    },

    changeStatus(status) {
      this.currentStatus = status
      this.loadOrders()
    },

    handleSearch() {
      this.loadOrders()
    },

    handleClear() {
      this.searchKeyword = ''
      this.loadOrders()
    },

    viewDetail(id) {
      uni.navigateTo({
        url: `/pages/orders/detail?id=${id}`
      })
    },

    callCustomer(phone) {
      uni.makePhoneCall({
        phoneNumber: phone
      })
    },

    confirmOrder(order) {
      uni.showModal({
        title: '确认订单',
        content: `确认订单 ${order.orderNo}？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await confirmOrderApi(order.id, {})
              uni.showToast({
                title: '订单已确认',
                icon: 'success'
              })
              this.loadOrders()
            } catch (error) {
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    cancelOrder(order) {
      uni.showModal({
        title: '取消订单',
        content: `确认取消订单 ${order.orderNo}？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await cancelOrderApi(order.id, '客户取消')
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              this.loadOrders()
            } catch (error) {
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    startOrder(order) {
      uni.navigateTo({
        url: `/pages/orders/detail?id=${order.id}&action=start`
      })
    },

    completeOrder(order) {
      uni.navigateTo({
        url: `/pages/orders/detail?id=${order.id}&action=complete`
      })
    },

    getStatusType(status) {
      const map = {
        pending: 'warning',
        confirmed: 'primary',
        in_use: 'success',
        completed: 'default',
        cancelled: 'error'
      }
      return map[status] || 'default'
    }
  }
}
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background: #fff;
  padding: 20rpx;
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.tab-item {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  position: relative;
}

.tab-item.active {
  background: #3cc51f;
  color: #fff;
}

.tab-text {
  font-size: 28rpx;
}

.tab-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #f56c6c;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.order-no {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.order-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 26rpx;
}

.label {
  color: #999;
  width: 120rpx;
}

.value {
  flex: 1;
  color: #333;
}

.phone {
  font-size: 32rpx;
  margin-left: 20rpx;
}

.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 30rpx;
}

.order-actions {
  display: flex;
  gap: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-state {
  padding: 40rpx 0;
}
</style>
