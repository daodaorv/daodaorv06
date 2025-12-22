<template>
  <view class="favorites-page">
    <view class="vehicle-list" v-if="favorites.length">
      <view
        class="fav-card"
        v-for="vehicle in favorites"
        :key="vehicle.id"
        @click="handleVehicleClick(vehicle)"
      >
        <!-- 1. 顶部大图 -->
        <view class="card-image-wrapper">
          <image 
            :src="vehicle.image || '/static/placeholder.png'" 
            mode="aspectFill" 
            class="vehicle-image"
          ></image>
          <!-- 收藏按钮 (悬浮) -->
          <view class="fav-action-btn" @click.stop="handleFavoriteChange(vehicle, false)">
            <u-icon name="heart-fill" color="#FF4D4F" size="20"></u-icon>
          </view>
          <!-- 状态标签 (可选) -->
          <view class="status-tag" v-if="vehicle.statusText">
            {{ vehicle.statusText }}
          </view>
        </view>

        <!-- 2. 内容区域 -->
        <view class="card-content">
          <!-- 标题与价格 -->
          <view class="header-row">
            <text class="title u-line-1">{{ vehicle.name }}</text>
            <view class="price-box">
              <text class="currency">¥</text>
              <text class="price">{{ vehicle.price }}</text>
              <text class="unit">/日</text>
            </view>
          </view>

          <!-- 标签展示 (最多3个) -->
          <view class="tags-row">
            <text 
              class="tag" 
              v-for="(tag, index) in (vehicle.tags || []).slice(0, 3)" 
              :key="index"
            >{{ tag }}</text>
          </view>

          <!-- 核心参数 -->
          <view class="specs-row">
            <view class="spec-item">
              <u-icon name="car" size="14" color="#909399"></u-icon>
              <text class="spec-text">{{ vehicle.type || '房车' }}</text>
            </view>
            <view class="spec-divider"></view>
            <view class="spec-item">
              <u-icon name="account" size="14" color="#909399"></u-icon>
              <text class="spec-text">{{ vehicle.seats }}座</text>
            </view>
            <view class="spec-divider"></view>
            <view class="spec-item">
              <u-icon name="setting" size="14" color="#909399"></u-icon>
              <text class="spec-text">{{ vehicle.transmission || '自动挡' }}</text>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more :status="loadMoreStatus"></uni-load-more>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <image class="empty-image" src="/static/empty-favorites.png" mode="aspectFit"></image>
      <text class="empty-text">暂无收藏的房车</text>
      <button class="browse-btn" @tap="goHome">去逛逛</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useVehicleStore } from '@/stores/vehicle'
import type { VehicleCardData } from '@/components/business/vehicle/VehicleCard.vue'

// 扩展类型定义
type FavoriteVehicle = VehicleCardData & { 
  isFavorite: boolean; 
  favoritedAt?: string;
  statusText?: string;
}

const vehicleStore = useVehicleStore()
const favorites = ref<FavoriteVehicle[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more')
const totalCount = ref(0)

// 数据标准化
const normalizeFavoriteVehicle = (item: any): FavoriteVehicle => {
  const source = item?.vehicle || item || {}
  const seats = source.seats ?? source.specs?.seats ?? source.capacity?.seats ?? 4
  const beds = source.beds ?? source.specs?.beds ?? source.capacity?.beds ?? 2
  const images = source.images || source.gallery || []
  const price = source.price ?? source.pricePerDay ?? source.dailyPrice ?? 0

  return {
    id: source.id || item?.vehicleId || `favorite-${Date.now()}`,
    name: source.name || source.title || '精选房车',
    image: source.image || source.cover || images[0] || '',
    images,
    type: source.type || source.vehicleType,
    seats,
    beds,
    transmission: source.transmission || source.specs?.transmission,
    specs: source.specs,
    tags: source.tags || source.features || ['自动挡', '倒车影像'], // Mock defaults if empty
    price,
    brand: source.brand,
    isFavorite: true,
    statusText: source.status === 'renting' ? '出租中' : ''
  }
}

const parseFavoriteResponse = (res: any) => {
  const list = res?.list || res?.data?.list || res?.records || []
  const pagination = res?.pagination || res?.data?.pagination || {}
  const total = pagination.total ?? res?.total ?? list.length
  return { list, total }
}

const loadFavorites = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    hasMore.value = true
    loadMoreStatus.value = 'loading'
  }

  if (!hasMore.value && !refresh) return
  loadMoreStatus.value = 'loading'

  try {
    const response = await vehicleStore.fetchFavoriteVehicles({
      page: page.value,
      limit: pageSize
    })

    if (response) {
      const { list, total } = parseFavoriteResponse(response)
      totalCount.value = total
      const mapped = list.map(normalizeFavoriteVehicle)
      favorites.value = refresh ? mapped : [...favorites.value, ...mapped]

      if (favorites.value.length >= totalCount.value || mapped.length < pageSize) {
        hasMore.value = false
        loadMoreStatus.value = 'noMore'
      } else {
        page.value += 1
        loadMoreStatus.value = 'more'
      }
    } else {
      loadMoreStatus.value = 'more'
    }
  } catch (e) {
    // Error handling
    loadMoreStatus.value = 'more'
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

onShow(() => {
  loadFavorites(true)
})

onPullDownRefresh(() => {
  loadFavorites(true)
})

onReachBottom(() => {
  loadFavorites()
})

const handleVehicleClick = (vehicle: FavoriteVehicle) => {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.id}`
  })
}

const handleFavoriteChange = async (vehicle: FavoriteVehicle, nextState: boolean) => {
  const previous = vehicle.isFavorite
  // Optimistic update
  vehicle.isFavorite = nextState
  
  // Actually calling toggle
  const result = await vehicleStore.toggleFavorite(vehicle.id)

  // In this page, usually clicking the heart means "Remove"
  if (!nextState) {
    uni.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
           // Remove from list
           favorites.value = favorites.value.filter(v => v.id !== vehicle.id)
           uni.showToast({ title: '已取消', icon: 'none' })
        } else {
           // Revert
           vehicle.isFavorite = true
        }
      }
    })
  }
}

const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}
</script>

<style scoped lang="scss">
// Tokens
$card-radius: 24rpx;
$primary-color: #FF9F29;
$text-main: #1D2129;
$text-sub: #86909C;

.favorites-page {
  min-height: 100vh;
  background-color: #F7F8FA;
  padding: 24rpx;
  box-sizing: border-box;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.fav-card {
  background: #FFFFFF;
  border-radius: $card-radius;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.1s;

  &:active {
    transform: scale(0.99);
  }
}

// 1. Image Area
.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 360rpx; // Tall image height
  background: #F2F3F5;
}

.vehicle-image {
  width: 100%;
  height: 100%;
}

.fav-action-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  z-index: 2;
  
  &:active {
    transform: scale(0.9);
  }
}

.status-tag {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

// 2. Content Area
.card-content {
  padding: 24rpx;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: $text-main;
  margin-right: 16rpx;
}

.price-box {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  color: #F53F3F; // Price red
}

.currency {
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 4rpx;
}

.price {
  font-size: 40rpx;
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 600;
  line-height: 1;
}

.unit {
  font-size: 22rpx;
  color: $text-sub;
  margin-left: 4rpx;
}

// Tags
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  font-size: 20rpx;
  color: #4E5969;
  background: #F7F8FA;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

// Specs
.specs-row {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #F2F3F5;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.spec-text {
  font-size: 22rpx;
  color: $text-sub;
}

.spec-divider {
  width: 1rpx;
  height: 20rpx;
  background: #E5E6EB;
  margin: 0 16rpx;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-image {
    width: 320rpx;
    height: 320rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $text-sub;
    margin-bottom: 48rpx;
  }

  .browse-btn {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    font-size: 28rpx;
    border-radius: 40rpx;
    font-weight: 600;
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>
