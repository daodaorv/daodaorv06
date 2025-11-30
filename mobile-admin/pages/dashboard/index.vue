<template>
  <view class="dashboard-container">
    <!-- 数据概览卡片 -->
    <view class="overview-section">
      <view class="section-title">数据概览</view>
      <view class="overview-grid">
        <view class="overview-card" @click="navigateTo('/pages/orders/index')">
          <view class="card-value">{{ overview.todayOrders.total }}</view>
          <view class="card-label">今日订单</view>
          <view class="card-detail">
            <text class="detail-item">待确认: {{ overview.todayOrders.pending }}</text>
          </view>
        </view>

        <view class="overview-card">
          <view class="card-value">{{ overview.activeUsers.total }}</view>
          <view class="card-label">活跃用户</view>
          <view class="card-detail">
            <text class="detail-item">新增: {{ overview.activeUsers.new }}</text>
          </view>
        </view>

        <view class="overview-card">
          <view class="card-value">¥{{ formatMoney(overview.revenue.today) }}</view>
          <view class="card-label">今日收入</view>
          <view class="card-detail">
            <text class="detail-item success">+{{ overview.revenue.growth }}%</text>
          </view>
        </view>

        <view class="overview-card" @click="navigateTo('/pages/vehicles/index')">
          <view class="card-value">{{ overview.vehicles.available }}</view>
          <view class="card-label">可用车辆</view>
          <view class="card-detail">
            <text class="detail-item">总数: {{ overview.vehicles.total }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 待办任务 -->
    <view class="todo-section">
      <view class="section-header">
        <view class="section-title">待办任务</view>
        <view class="section-more" @click="showAllTodos">
          查看全部 <text class="arrow">›</text>
        </view>
      </view>

      <view class="todo-list">
        <view
          v-for="todo in todoList"
          :key="todo.id"
          class="todo-item"
          :class="'priority-' + todo.priority"
        >
          <view class="todo-header">
            <view class="todo-title">{{ todo.title }}</view>
            <uni-tag
              :text="getPriorityText(todo.priority)"
              :type="getPriorityType(todo.priority)"
              size="small"
            />
          </view>
          <view class="todo-desc">{{ todo.description }}</view>
          <view class="todo-footer">
            <text class="todo-time">截止: {{ formatDateTime(todo.deadline) }}</text>
            <view class="todo-actions">
              <button
                class="action-btn"
                size="mini"
                type="primary"
                @click="handleTodo(todo)"
              >
                处理
              </button>
            </view>
          </view>
        </view>

        <view v-if="todoList.length === 0" class="empty-state">
          <text class="empty-text">暂无待办任务</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="section-title">快捷操作</view>
      <view class="action-grid">
        <view
          v-for="action in quickActions"
          :key="action.id"
          class="action-item"
          @click="handleQuickAction(action)"
        >
          <view class="action-icon" :style="{ backgroundColor: action.color }">
            <text class="icon">{{ action.icon }}</text>
          </view>
          <text class="action-label">{{ action.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDashboardOverview, getTodoList } from '@/api/dashboard'
import { formatMoney, formatDateTime } from '@/utils/format'

export default {
  data() {
    return {
      overview: {
        todayOrders: { total: 0, pending: 0, confirmed: 0, completed: 0 },
        activeUsers: { total: 0, new: 0, active: 0 },
        revenue: { today: 0, month: 0, growth: 0 },
        vehicles: { total: 0, available: 0, rented: 0, maintenance: 0 }
      },
      todoList: [],
      quickActions: [
        { id: 1, label: '订单管理', icon: '📋', color: '#3cc51f', path: '/pages/orders/index' },
        { id: 2, label: '车辆管理', icon: '🚗', color: '#ff9500', path: '/pages/vehicles/index' },
        { id: 3, label: '消息通知', icon: '💬', color: '#007aff', path: '/pages/messages/index' },
        { id: 4, label: '数据统计', icon: '📊', color: '#5856d6', path: '/pages/statistics/index' }
      ],
      loading: false
    }
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  methods: {
    formatMoney,
    formatDateTime,

    async loadData() {
      this.loading = true
      try {
        // 加载数据概览
        const overviewData = await getDashboardOverview()
        this.overview = overviewData

        // 加载待办任务（只显示前3条）
        const todoData = await getTodoList({ status: 'pending' })
        this.todoList = todoData.list.slice(0, 3)
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    navigateTo(url) {
      // 判断是否为 tabbar 页面
      const tabbarPages = [
        '/pages/dashboard/index',
        '/pages/orders/index',
        '/pages/vehicles/index',
        '/pages/messages/index',
        '/pages/profile/index'
      ]

      if (tabbarPages.includes(url)) {
        // tabbar 页面使用 switchTab
        uni.switchTab({ url })
      } else {
        // 非 tabbar 页面使用 navigateTo
        uni.navigateTo({ url })
      }
    },

    showAllTodos() {
      // 待办任务列表页面开发中
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    handleTodo(todo) {
      // 根据任务类型跳转到对应页面
      if (todo.type === 'order') {
        this.navigateTo('/pages/orders/index')
      } else if (todo.type === 'vehicle') {
        this.navigateTo('/pages/vehicles/index')
      }
    },

    handleQuickAction(action) {
      if (action.path) {
        this.navigateTo(action.path)
      }
    },

    getPriorityText(priority) {
      const map = {
        high: '紧急',
        medium: '普通',
        low: '低'
      }
      return map[priority] || '普通'
    },

    getPriorityType(priority) {
      const map = {
        high: 'error',
        medium: 'warning',
        low: 'default'
      }
      return map[priority] || 'default'
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
}

/* 数据概览 */
.overview-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  color: #fff;
}

.overview-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.card-label {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 10rpx;
}

.card-detail {
  font-size: 24rpx;
  opacity: 0.8;
}

.detail-item {
  margin-right: 20rpx;
}

.detail-item.success {
  color: #67c23a;
}

/* 待办任务 */
.todo-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-more {
  font-size: 28rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.todo-item {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  border-left: 6rpx solid #3cc51f;
}

.todo-item.priority-high {
  border-left-color: #f56c6c;
}

.todo-item.priority-medium {
  border-left-color: #e6a23c;
}

.todo-item.priority-low {
  border-left-color: #909399;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.todo-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.todo-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-time {
  font-size: 24rpx;
  color: #999;
}

.action-btn {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 快捷操作 */
.quick-actions {
  background: #fff;
  padding: 30rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.action-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}
</style>
