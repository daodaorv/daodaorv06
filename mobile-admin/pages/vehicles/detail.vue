<template>
  <view class="vehicle-detail-container">
    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" fullscreen text="加载中..." />

    <!-- 车辆内容 -->
    <view v-else-if="vehicle" class="vehicle-content">
      <!-- 车辆图片轮播 -->
      <view class="vehicle-gallery">
        <swiper class="gallery-swiper" indicator-dots :autoplay="true" :interval="3000">
          <swiper-item v-for="(image, index) in vehicle.images" :key="index">
            <image :src="image" mode="aspectFill" class="gallery-image" />
          </swiper-item>
        </swiper>
        <view class="status-badge" :class="'status-' + vehicle.status">
          {{ vehicle.statusText }}
        </view>
      </view>

      <!-- 车辆基本信息 -->
      <view class="info-section">
        <view class="vehicle-header">
          <text class="vehicle-name">{{ vehicle.name }}</text>
          <text class="vehicle-price">¥{{ vehicle.dailyPrice }}/天</text>
        </view>
        <view class="vehicle-meta">
          <text class="meta-item">{{ vehicle.brand }} {{ vehicle.model }}</text>
          <text class="meta-item">{{ vehicle.type }}</text>
        </view>
      </view>

      <!-- 车辆详细信息 -->
      <view class="info-section">
        <view class="section-title">车辆信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">车牌号</text>
            <text class="value">{{ vehicle.plate }}</text>
          </view>
          <view class="info-item">
            <text class="label">座位数</text>
            <text class="value">{{ vehicle.seats }}座</text>
          </view>
          <view class="info-item">
            <text class="label">床位数</text>
            <text class="value">{{ vehicle.beds }}床</text>
          </view>
          <view class="info-item">
            <text class="label">里程数</text>
            <text class="value">{{ vehicle.mileage }}km</text>
          </view>
          <view class="info-item">
            <text class="label">所在位置</text>
            <text class="value">{{ vehicle.location }}</text>
          </view>
          <view class="info-item">
            <text class="label">保险类型</text>
            <text class="value">{{ vehicle.insurance }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆配置 -->
      <view v-if="vehicle.features && vehicle.features.length > 0" class="info-section">
        <view class="section-title">车辆配置</view>
        <view class="features-grid">
          <view v-for="feature in vehicle.features" :key="feature" class="feature-item">
            <text class="feature-icon">✓</text>
            <text class="feature-text">{{ feature }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆描述 -->
      <view v-if="vehicle.description" class="info-section">
        <view class="section-title">车辆描述</view>
        <view class="description-content">
          <text>{{ vehicle.description }}</text>
        </view>
      </view>

      <!-- 维保记录 -->
      <view class="info-section">
        <view class="section-header">
          <text class="section-title">维保记录</text>
          <button class="add-button" size="mini" type="primary" @click="addMaintenance">
            添加记录
          </button>
        </view>
        <view v-if="maintenanceRecords.length > 0" class="maintenance-list">
          <view v-for="record in maintenanceRecords" :key="record.id" class="maintenance-item">
            <view class="maintenance-header">
              <text class="maintenance-type">{{ record.type }}</text>
              <text class="maintenance-cost">¥{{ record.cost }}</text>
            </view>
            <view class="maintenance-info">
              <text class="info-text">日期: {{ record.date }}</text>
              <text class="info-text">里程: {{ record.mileage }}km</text>
            </view>
            <view class="maintenance-items">
              <text v-for="item in record.items" :key="item" class="item-tag">{{ item }}</text>
            </view>
            <view class="maintenance-footer">
              <text class="operator">操作人: {{ record.operator }}</text>
              <text v-if="record.remark" class="remark">{{ record.remark }}</text>
            </view>
          </view>
        </view>
        <EmptyState
          v-else
          icon="🔧"
          title="暂无维保记录"
          description="该车辆还没有维保记录"
        />
      </view>

      <!-- 相关文档 -->
      <view v-if="vehicle.documents && vehicle.documents.length > 0" class="info-section">
        <view class="section-title">相关文档</view>
        <view class="documents-list">
          <view v-for="doc in vehicle.documents" :key="doc.name" class="document-item" @click="viewDocument(doc)">
            <text class="doc-icon">📄</text>
            <text class="doc-name">{{ doc.name }}</text>
            <text class="doc-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button class="action-btn" @click="updateStatus">
          更新状态
        </button>
        <button class="action-btn primary" type="primary" @click="rentVehicle">
          创建订单
        </button>
      </view>
    </view>

    <!-- 空状态 -->
    <EmptyState
      v-else
      icon="🚗"
      title="车辆不存在"
      description="该车辆可能已被删除或不存在"
      buttonText="返回列表"
      @click="goBack"
    />

    <!-- 状态更新对话框 -->
    <uni-popup ref="statusPopup" type="bottom">
      <view class="status-popup">
        <view class="popup-title">更新车辆状态</view>
        <view class="status-options">
          <view
            v-for="option in statusOptions"
            :key="option.value"
            class="status-option"
            @click="handleStatusChange(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <text v-if="vehicle.status === option.value" class="option-check">✓</text>
          </view>
        </view>
        <button class="cancel-button" @click="closeStatusPopup">取消</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getVehicleDetail, updateVehicleStatus, getMaintenanceRecords } from '@/api/vehicle'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  components: {
    LoadingSpinner,
    EmptyState
  },

  data() {
    return {
      vehicleId: null,
      vehicle: null,
      maintenanceRecords: [],
      loading: false,
      statusOptions: [
        { label: '可用', value: 'available' },
        { label: '租用中', value: 'rented' },
        { label: '维护中', value: 'maintenance' },
        { label: '禁用', value: 'disabled' }
      ]
    }
  },

  onLoad(options) {
    if (options.id) {
      this.vehicleId = options.id
      this.loadVehicleDetail()
      this.loadMaintenanceRecords()
    }
  },

  methods: {
    async loadVehicleDetail() {
      this.loading = true
      try {
        const data = await getVehicleDetail(this.vehicleId)
        this.vehicle = data
      } catch (error) {
        console.error('加载车辆详情失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    async loadMaintenanceRecords() {
      try {
        const data = await getMaintenanceRecords(this.vehicleId)
        this.maintenanceRecords = data.list || []
      } catch (error) {
        console.error('加载维保记录失败:', error)
      }
    },

    updateStatus() {
      this.$refs.statusPopup.open()
    },

    closeStatusPopup() {
      this.$refs.statusPopup.close()
    },

    async handleStatusChange(newStatus) {
      if (newStatus === this.vehicle.status) {
        this.closeStatusPopup()
        return
      }

      try {
        await updateVehicleStatus(this.vehicleId, newStatus, '')
        uni.showToast({
          title: '状态更新成功',
          icon: 'success'
        })
        this.closeStatusPopup()

        // 重新加载车辆详情
        setTimeout(() => {
          this.loadVehicleDetail()
        }, 1000)
      } catch (error) {
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    },

    addMaintenance() {
      uni.showToast({
        title: '添加维保记录功能开发中',
        icon: 'none'
      })
    },

    viewDocument(doc) {
      uni.showToast({
        title: '查看文档功能开发中',
        icon: 'none'
      })
    },

    rentVehicle() {
      uni.navigateTo({
        url: `/pages/orders/create?vehicleId=${this.vehicleId}`
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.vehicle-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 图片轮播 */
.vehicle-gallery {
  position: relative;
  width: 100%;
  height: 500rpx;
}

.gallery-swiper {
  width: 100%;
  height: 100%;
}

.gallery-image {
  width: 100%;
  height: 100%;
}

.status-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10rpx);
}

.status-badge.status-available {
  background: rgba(103, 194, 58, 0.9);
}

.status-badge.status-rented {
  background: rgba(64, 158, 255, 0.9);
}

.status-badge.status-maintenance {
  background: rgba(230, 162, 60, 0.9);
}

.status-badge.status-disabled {
  background: rgba(144, 147, 153, 0.9);
}

/* 信息区块 */
.info-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.vehicle-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.vehicle-price {
  font-size: 32rpx;
  color: #f56c6c;
  font-weight: bold;
}

.vehicle-meta {
  display: flex;
  gap: 20rpx;
  font-size: 26rpx;
  color: #999;
}

.meta-item {
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.add-button {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.label {
  color: #999;
  min-width: 160rpx;
}

.value {
  color: #333;
  flex: 1;
  text-align: right;
}

/* 车辆配置 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.feature-icon {
  color: #3cc51f;
  font-weight: bold;
}

.feature-text {
  color: #666;
}

/* 车辆描述 */
.description-content {
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 维保记录 */
.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.maintenance-item {
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.maintenance-type {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.maintenance-cost {
  font-size: 28rpx;
  color: #f56c6c;
  font-weight: bold;
}

.maintenance-info {
  display: flex;
  gap: 30rpx;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.maintenance-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.item-tag {
  padding: 8rpx 16rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.maintenance-footer {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-top: 16rpx;
  border-top: 1px solid #e0e0e0;
  font-size: 24rpx;
  color: #999;
}

.operator {
  color: #666;
}

.remark {
  color: #999;
}

/* 文档列表 */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.doc-icon {
  font-size: 40rpx;
}

.doc-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.doc-arrow {
  font-size: 40rpx;
  color: #ccc;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
}

/* 状态弹窗 */
.status-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.status-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.option-text {
  color: #333;
}

.option-check {
  color: #3cc51f;
  font-size: 32rpx;
  font-weight: bold;
}

.cancel-button {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
}

.cancel-button::after {
  border: none;
}
</style>
