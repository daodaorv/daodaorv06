<template>
  <view class="vehicles-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <uni-search-bar
        v-model="keyword"
        placeholder="搜索车牌号/品牌/型号"
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

    <!-- 添加车辆按钮 -->
    <view class="add-section">
      <button class="add-btn" @click="addVehicle">
        <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        <text>添加车辆</text>
      </button>
    </view>

    <!-- 车辆列表 -->
    <scroll-view class="vehicle-list" scroll-y @scrolltolower="loadMore">
      <view v-for="vehicle in vehicleList" :key="vehicle.id" class="vehicle-item" @click="viewVehicleDetail(vehicle)">
        <view class="vehicle-header">
          <view class="vehicle-basic">
            <view class="vehicle-title">
              <text class="brand-model">{{ vehicle.brand }} {{ vehicle.model }}</text>
              <text class="license-plate">{{ vehicle.license_plate }}</text>
            </view>
            <view :class="['vehicle-status', getStatusClass(vehicle.status)]">
              {{ getStatusText(vehicle.status) }}
            </view>
          </view>
        </view>

        <view class="vehicle-content">
          <view class="info-row">
            <uni-icons type="location" size="16" color="#666"></uni-icons>
            <text class="info-text">{{ vehicle.store?.name || '未分配门店' }}</text>
          </view>

          <view class="info-row">
            <uni-icons type="calendar" size="16" color="#666"></uni-icons>
            <text class="info-text">年份：{{ vehicle.year || '未知' }}</text>
          </view>

          <view class="info-row">
            <uni-icons type="wallet" size="16" color="#666"></uni-icons>
            <text class="info-text">日租金：¥{{ vehicle.daily_rate }}</text>
          </view>

          <view v-if="vehicle.maintenance_status" class="info-row">
            <uni-icons type="settings" size="16" color="#666"></uni-icons>
            <text class="info-text">维护状态：{{ vehicle.maintenance_status }}</text>
          </view>
        </view>

        <view class="vehicle-footer">
          <view class="action-buttons">
            <button v-if="vehicle.status === 'available'"
                    class="action-btn primary"
                    @click.stop="startMaintenance(vehicle.id)">
              维护中
            </button>
            <button v-if="vehicle.status === 'maintenance'"
                    class="action-btn success"
                    @click.stop="endMaintenance(vehicle.id)">
              结束维护
            </button>
            <button v-if="vehicle.status === 'available'"
                    class="action-btn secondary"
                    @click.stop="editVehicle(vehicle)">
              编辑
            </button>
            <button v-if="vehicle.status === 'disabled'"
                    class="action-btn warning"
                    @click.stop="enableVehicle(vehicle.id)">
              启用
            </button>
            <button v-if="vehicle.status !== 'disabled'"
                    class="action-btn danger"
                    @click.stop="disableVehicle(vehicle.id)">
              禁用
            </button>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" :content-text="loadingText" />
      </view>
      <view v-if="!hasMore && vehicleList.length > 0" class="no-more">
        <uni-load-more status="noMore" />
      </view>
      <view v-if="vehicleList.length === 0 && !loading" class="empty-container">
        <uni-empty description="暂无车辆数据" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { vehicleApi } from '../../api/vehicle'

// 响应式数据
const keyword = ref('')
const filterStatus = ref('')
const vehicleList = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 计算属性
const statusOptions = computed(() => [
  { label: '全部', value: '' },
  { label: '可用', value: 'available' },
  { label: '租用中', value: 'rented' },
  { label: '维护中', value: 'maintenance' },
  { label: '已禁用', value: 'disabled' }
])

const loadingText = computed(() => ({
  contentdown: '上拉加载更多',
  contentrefresh: '加载中',
  contentnomore: '没有更多了'
}))

// 方法
const fetchVehicleList = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: 20,
      keyword: keyword.value,
      status: filterStatus.value
    }

    const result = await vehicleApi.getVehicleList(params)

    if (isLoadMore) {
      vehicleList.value = [...vehicleList.value, ...result.list]
    } else {
      vehicleList.value = result.list
    }

    hasMore.value = result.list.length < result.total
  } catch (error) {
    console.error('获取车辆列表失败:', error)
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
  vehicleList.value = []
  fetchVehicleList()
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
  vehicleList.value = []
  fetchVehicleList()
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchVehicleList(true)
}

const addVehicle = () => {
  uni.showToast({
    title: '添加车辆功能开发中',
    icon: 'none'
  })
}

const editVehicle = (vehicle) => {
  uni.showModal({
    title: '编辑车辆',
    content: `车辆：${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})\n日租金：¥${vehicle.daily_rate}\n编辑功能开发中...`,
    showCancel: false,
    confirmText: '确定'
  })
}

const updateVehicleStatus = async (vehicleId, newStatus, reason = '') => {
  try {
    await vehicleApi.updateVehicleStatus(vehicleId, newStatus, reason)
    uni.showToast({
      title: '操作成功',
      icon: 'success'
    })
    // 刷新列表
    page.value = 1
    fetchVehicleList()
  } catch (error) {
    console.error('更新车辆状态失败:', error)
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  }
}

const startMaintenance = (vehicleId) => {
  uni.showModal({
    title: '开始维护',
    content: '确定要将此车辆设为维护状态吗？',
    success: (res) => {
      if (res.confirm) {
        updateVehicleStatus(vehicleId, 'maintenance', '开始维护')
      }
    }
  })
}

const endMaintenance = (vehicleId) => {
  uni.showModal({
    title: '结束维护',
    content: '确定要将此车辆设为可用状态吗？',
    success: (res) => {
      if (res.confirm) {
        updateVehicleStatus(vehicleId, 'available', '维护完成')
      }
    }
  })
}

const enableVehicle = (vehicleId) => {
  uni.showModal({
    title: '启用车辆',
    content: '确定要启用此车辆吗？',
    success: (res) => {
      if (res.confirm) {
        updateVehicleStatus(vehicleId, 'available', '管理员启用')
      }
    }
  })
}

const disableVehicle = (vehicleId) => {
  uni.showModal({
    title: '禁用车辆',
    content: '请输入禁用原因',
    editable: true,
    placeholderText: '请输入禁用原因',
    success: (res) => {
      if (res.confirm) {
        updateVehicleStatus(vehicleId, 'disabled', res.content || '管理员禁用')
      }
    }
  })
}

const viewVehicleDetail = (vehicle) => {
  const vehicleInfo = `车牌号：${vehicle.license_plate}\n品牌型号：${vehicle.brand} ${vehicle.model}\n年份：${vehicle.year || '未知'}\n日租金：¥${vehicle.daily_rate}\n门店：${vehicle.store?.name || '未分配'}\n状态：${getStatusText(vehicle.status)}`

  if (vehicle.maintenance_status) {
    vehicleInfo += `\n维护状态：${vehicle.maintenance_status}`
  }

  uni.showModal({
    title: '车辆详情',
    content: vehicleInfo,
    showCancel: false,
    confirmText: '确定'
  })
}

// 工具函数
const getStatusText = (status) => {
  const statusMap = {
    available: '可用',
    rented: '租用中',
    maintenance: '维护中',
    disabled: '已禁用'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    available: 'status-available',
    rented: 'status-rented',
    maintenance: 'status-maintenance',
    disabled: 'status-disabled'
  }
  return classMap[status] || ''
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  const token = uni.getStorageSync('mobile_admin_token')
  if (!token) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }

  fetchVehicleList()
})
</script>

<style scoped>
.vehicles-container {
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

.add-section {
  padding: 20rpx;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.add-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.add-btn:active {
  opacity: 0.8;
}

.vehicle-list {
  flex: 1;
  padding: 20rpx;
}

.vehicle-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.vehicle-header {
  margin-bottom: 20rpx;
}

.vehicle-basic {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.vehicle-title {
  flex: 1;
}

.brand-model {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.license-plate {
  display: block;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.vehicle-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

.status-available {
  background: #f6ffed;
  color: #52c41a;
}

.status-rented {
  background: #e6f7ff;
  color: #1890ff;
}

.status-maintenance {
  background: #fff7e6;
  color: #fa8c16;
}

.status-disabled {
  background: #fff2f0;
  color: #ff4d4f;
}

.vehicle-content {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.vehicle-footer {
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
  line-height: 1;
  min-width: 120rpx;
}

.action-btn.primary {
  background: #007AFF;
  color: #fff;
}

.action-btn.success {
  background: #52c41a;
  color: #fff;
}

.action-btn.warning {
  background: #fa8c16;
  color: #fff;
}

.action-btn.danger {
  background: #ff4d4f;
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