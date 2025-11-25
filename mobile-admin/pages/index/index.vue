<template>
  <view class="dashboard">
    <view class="header">
      <text class="title">叨叨房车移动管理端</text>
      <text class="subtitle">欢迎回来，{{ userInfo.nickname || '管理员' }}</text>
    </view>

    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{ stats.totalUsers }}</text>
        <text class="stat-label">总用户数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.activeUsers }}</text>
        <text class="stat-label">活跃用户</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.todayOrders }}</text>
        <text class="stat-label">今日订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">¥{{ stats.todayRevenue }}</text>
        <text class="stat-label">今日收入</text>
      </view>
    </view>

    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-grid">
        <view class="action-item" @click="navigateTo('/pages/users/users')">
          <uni-icons type="person-filled" size="30" color="#007AFF"></uni-icons>
          <text class="action-label">用户管理</text>
        </view>
        <view class="action-item" @click="navigateToOrders()">
          <uni-icons type="list-filled" size="30" color="#007AFF"></uni-icons>
          <text class="action-label">订单管理</text>
        </view>
        <view class="action-item" @click="navigateToVehicles()">
          <uni-icons type="gear-filled" size="30" color="#007AFF"></uni-icons>
          <text class="action-label">车辆管理</text>
        </view>
        <view class="action-item" @click="handleLogout">
          <uni-icons type="close-filled" size="30" color="#f5222d"></uni-icons>
          <text class="action-label">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '../../api/auth'
import { statsApi } from '../../api/stats'
import { routeGuard, safeLogout } from '../../utils/auth'

const userInfo = ref({})
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  todayOrders: 0,
  todayRevenue: 0
})

const navigateTo = (url) => {
  if (url.includes('/pages/users/users') || url.includes('/pages/orders/orders') || url.includes('/pages/vehicles/vehicles')) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}

const navigateToOrders = () => {
  uni.switchTab({ url: '/pages/orders/orders' })
}

const navigateToVehicles = () => {
  uni.switchTab({ url: '/pages/vehicles/vehicles' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        // 使用安全退出函数
        safeLogout(authApi)
      }
    }
  })
}

const loadUserInfo = async () => {
  try {
    // 尝试从API获取最新用户信息
    const result = await authApi.getCurrentUser()
    userInfo.value = result
    // 更新本地存储
    uni.setStorageSync('mobile_admin_userInfo', result)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果API调用失败，使用本地存储的信息
    userInfo.value = uni.getStorageSync('mobile_admin_userInfo') || {}
  }
}

const loadStats = async () => {
  try {
    // 获取首页统计数据
    const result = await statsApi.getDashboardStats()
    stats.value = {
      totalUsers: result.totalUsers || 0,
      activeUsers: result.activeUsers || 0,
      todayOrders: result.todayOrders || 0,
      todayRevenue: result.todayRevenue || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 如果API调用失败，使用默认数据
    stats.value = {
      totalUsers: 0,
      activeUsers: 0,
      todayOrders: 0,
      todayRevenue: 0
    }
  }
}

onMounted(() => {
  // 权限守卫检查
  if (!routeGuard()) {
    return
  }

  // 加载用户信息
  loadUserInfo()

  // 加载统计数据
  loadStats()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.quick-actions {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.action-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 10rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.action-item:active {
  background: #f5f5f5;
  transform: scale(0.95);
}

.action-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 16rpx;
  font-weight: 500;
}
</style>
