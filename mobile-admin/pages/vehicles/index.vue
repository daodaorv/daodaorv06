<template>
  <view class="vehicles-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar
        v-model="searchKeyword"
        placeholder="搜索车辆名称/车牌号"
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

    <!-- 车辆列表 -->
    <view class="vehicle-list">
      <view
        v-for="vehicle in vehicleList"
        :key="vehicle.id"
        class="vehicle-card"
        @click="viewDetail(vehicle.id)"
      >
        <!-- 车辆图片 -->
        <view class="vehicle-image">
          <image :src="vehicle.image" mode="aspectFill" />
          <view class="status-badge" :class="'status-' + vehicle.status">
            {{ vehicle.statusText }}
          </view>
        </view>

        <!-- 车辆信息 -->
        <view class="vehicle-info">
          <view class="vehicle-header">
            <text class="vehicle-name">{{ vehicle.name }}</text>
            <text class="vehicle-price">¥{{ vehicle.dailyPrice }}/天</text>
          </view>

          <view class="vehicle-details">
            <view class="detail-item">
              <text class="label">车牌:</text>
              <text class="value">{{ vehicle.plate }}</text>
            </view>
            <view class="detail-item">
              <text class="label">类型:</text>
              <text class="value">{{ vehicle.type }}</text>
            </view>
            <view class="detail-item">
              <text class="label">座位:</text>
              <text class="value">{{ vehicle.seats }}座 / {{ vehicle.beds }}床</text>
            </view>
            <view class="detail-item">
              <text class="label">里程:</text>
              <text class="value">{{ vehicle.mileage }}km</text>
            </view>
            <view class="detail-item">
              <text class="label">位置:</text>
              <text class="value">{{ vehicle.location }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="vehicle-actions">
            <button
              v-if="vehicle.status === 'available'"
              class="action-btn primary"
              size="mini"
              type="primary"
              @click.stop="rentVehicle(vehicle)"
            >
              租用
            </button>
            <button
              v-if="vehicle.status === 'maintenance'"
              class="action-btn"
              size="mini"
              @click.stop="viewMaintenance(vehicle)"
            >
              查看维保
            </button>
            <button
              class="action-btn"
              size="mini"
              @click.stop="updateStatus(vehicle)"
            >
              更新状态
            </button>
            <button
              class="action-btn"
              size="mini"
              @click.stop="viewDetail(vehicle.id)"
            >
              详情
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="vehicleList.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">🚗</text>
        <text class="empty-text">暂无车辆</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <uni-load-more status="loading" />
      </view>
    </view>
  </view>
</template>

<script>
import { getVehicleList, updateVehicleStatus } from '@/api/vehicle'

export default {
  data() {
    return {
      searchKeyword: '',
      currentStatus: 'all',
      statusTabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '可用', value: 'available', count: 0 },
        { label: '租用中', value: 'rented', count: 0 },
        { label: '维护中', value: 'maintenance', count: 0 },
        { label: '禁用', value: 'disabled', count: 0 }
      ],
      vehicleList: [],
      loading: false
    }
  },

  onLoad() {
    this.loadVehicles()
  },

  onPullDownRefresh() {
    this.loadVehicles().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  methods: {
    async loadVehicles() {
      this.loading = true
      try {
        const params = {}
        if (this.currentStatus !== 'all') {
          params.status = this.currentStatus
        }
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }

        const data = await getVehicleList(params)
        this.vehicleList = data.list

        // 更新状态计数
        this.updateStatusCount()
      } catch (error) {
        console.error('加载车辆失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    updateStatusCount() {
      this.statusTabs[1].count = this.vehicleList.filter(v => v.status === 'available').length
      this.statusTabs[2].count = this.vehicleList.filter(v => v.status === 'rented').length
      this.statusTabs[3].count = this.vehicleList.filter(v => v.status === 'maintenance').length
    },

    changeStatus(status) {
      this.currentStatus = status
      this.loadVehicles()
    },

    handleSearch() {
      this.loadVehicles()
    },

    handleClear() {
      this.searchKeyword = ''
      this.loadVehicles()
    },

    viewDetail(id) {
      uni.navigateTo({
        url: `/pages/vehicles/detail?id=${id}`
      })
    },

    rentVehicle(vehicle) {
      uni.navigateTo({
        url: `/pages/orders/create?vehicleId=${vehicle.id}`
      })
    },

    viewMaintenance(vehicle) {
      uni.navigateTo({
        url: `/pages/vehicles/detail?id=${vehicle.id}&tab=maintenance`
      })
    },

    updateStatus(vehicle) {
      const statusOptions = [
        { text: '可用', value: 'available' },
        { text: '租用中', value: 'rented' },
        { text: '维护中', value: 'maintenance' },
        { text: '禁用', value: 'disabled' }
      ]

      uni.showActionSheet({
        itemList: statusOptions.map(s => s.text),
        success: async (res) => {
          const newStatus = statusOptions[res.tapIndex].value
          if (newStatus !== vehicle.status) {
            try {
              await updateVehicleStatus(vehicle.id, newStatus, '')
              uni.showToast({
                title: '状态更新成功',
                icon: 'success'
              })
              this.loadVehicles()
            } catch (error) {
              uni.showToast({
                title: '更新失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.vehicles-container {
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

.vehicle-list {
  padding: 20rpx;
}

.vehicle-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.vehicle-image {
  position: relative;
  width: 100%;
  height: 400rpx;
}

.vehicle-image image {
  width: 100%;
  height: 100%;
}

.status-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
}

.status-badge.status-available {
  background: #67c23a;
}

.status-badge.status-rented {
  background: #409eff;
}

.status-badge.status-maintenance {
  background: #e6a23c;
}

.status-badge.status-disabled {
  background: #909399;
}

.vehicle-info {
  padding: 24rpx;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.vehicle-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.vehicle-price {
  font-size: 28rpx;
  color: #f56c6c;
  font-weight: bold;
}

.vehicle-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.detail-item {
  font-size: 26rpx;
}

.label {
  color: #999;
  margin-right: 8rpx;
}

.value {
  color: #333;
}

.vehicle-actions {
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
