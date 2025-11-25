<template>
  <view class="vehicles-page">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 头部搜索区域 -->
    <view class="header-section">
      <uni-card :padding="'24rpx'" :margin="'0'">
        <view class="search-container">
          <view class="search-bar" @tap="openSearch">
            <uni-icons type="search" size="22" color="#A0AEC0"></uni-icons>
            <text class="search-placeholder" :class="{ 'has-keyword': searchKeyword }">
              {{ searchKeyword || '搜索品牌、车型或设施' }}
            </text>
          </view>
          <view class="filter-btn" @tap="openFilter" :class="{ 'active': activeFiltersCount > 0 }">
            <uni-icons type="settings" size="22" :color="activeFiltersCount > 0 ? '#FF6B35' : '#718096'"></uni-icons>
            <text class="filter-text">筛选</text>
            <uni-badge v-if="activeFiltersCount > 0" :text="activeFiltersCount.toString()" size="small" />
          </view>
        </view>

        <!-- 快速筛选标签 -->
        <view class="quick-filters">
          <scroll-view scroll-x="true" class="filter-scroll">
            <view class="quick-filter-list">
              <view
                v-for="filter in quickFilters"
                :key="filter.key"
                class="quick-filter-item"
                :class="{ 'active': quickFilterActive === filter.key }"
                @tap="toggleQuickFilter(filter.key)"
              >
                <uni-icons :type="filter.icon" size="16" :color="quickFilterActive === filter.key ? '#FF6B35' : '#718096'"></uni-icons>
                <text class="filter-text">{{ filter.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 筛选条件标签 -->
        <view v-if="activeFiltersCount > 0" class="filter-tags">
          <scroll-view scroll-x="true" class="filter-scroll">
            <view class="filter-tags-list">
              <view class="filter-tag clear-tag" @tap="clearAllFilters">
                <text class="tag-text">清空筛选</text>
                <uni-icons type="close" size="14" color="#FF6B35"></uni-icons>
              </view>
              <!-- 动态筛选标签将在这里显示 -->
            </view>
          </scroll-view>
        </view>
      </uni-card>
    </view>

    <!-- 排序选项 -->
    <view class="sort-section">
      <uni-card :padding="'16rpx 24rpx'" :margin="'0'">
        <scroll-view scroll-x="true" class="sort-scroll">
          <view class="sort-options">
            <view
              v-for="option in sortOptions"
              :key="option.value"
              class="sort-option"
              :class="{ 'active': filters.sortBy === option.value }"
              @tap="changeSort(option.value)"
            >
              <text class="sort-text">{{ option.label }}</text>
              <uni-icons v-if="filters.sortBy === option.value" type="checkmarkempty" size="16" color="#FFFFFF"></uni-icons>
            </view>
          </view>
        </scroll-view>
      </uni-card>
    </view>

    <!-- 车辆列表 -->
    <view class="vehicle-list">
      <!-- 加载中状态 -->
      <view v-if="loading && vehicleList.length === 0" class="loading-container">
        <uni-card v-for="i in 3" :key="i" :margin="'0 0 24rpx 0'" :padding="'0'">
          <VehicleSkeleton />
        </uni-card>
      </view>

      <!-- 车辆卡片 -->
      <view v-else-if="vehicleList.length > 0" class="vehicle-items">
        <VehicleCard
          v-for="vehicle in vehicleList"
          :key="vehicle.id"
          :vehicle="vehicle"
          :is-favorited="isFavorited(vehicle.id)"
          @click="goToVehicleDetail(vehicle.id)"
          @toggle-favorite="toggleFavorite(vehicle)"
          @quick-book="quickBook(vehicle)"
        />
      </view>

      <!-- 空状态 -->
      <uni-card v-else-if="!loading" :margin="'0'" :padding="'64rpx 32rpx'">
        <uni-empty
          image="/static/empty-vehicle.png"
          text="暂无符合条件的车辆"
          :description="'请尝试调整筛选条件或搜索关键词'"
        />
      </uni-card>
    </view>

    <!-- 上拉加载更多 -->
    <view v-if="vehicleList.length > 0" class="load-more">
      <uni-load-more v-if="loadingMore" :status="'loading'" :contentText="{ contentrefresh: '正在加载更多...' }" />
      <view v-else-if="!hasMore" class="no-more">
        <text class="no-more-text">没有更多车辆了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
// 导入组件 - 使用easycom自动导入，无需手动引入
// import VehicleCard from '@/components/business/vehicle/VehicleCard.vue';
// import VehicleSkeleton from '@/components/business/vehicle/VehicleSkeleton.vue';

interface Vehicle {
  id: string | number;
  brand: string;
  model: string;
  mainImage?: string;
  availabilityStatus: string;
  isPopular?: boolean;
  isNew?: boolean;
  discount?: number;
  seats: number;
  fuelType: string;
  categoryName?: string;
  amenities?: string[];
  storeId: string | number;
  distance?: string;
  dailyRate: number;
  monthlyRate?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

interface FilterOption {
  key: string;
  label: string;
  icon: string;
}

interface SortOption {
  value: string;
  label: string;
}

// 页面参数
const searchKeyword = ref('');
const pickupCity = ref('');
const pickupStore = ref('');

// 快速筛选
const quickFilterActive = ref('');
const quickFilters = ref<FilterOption[]>([
  { key: 'available', label: '可租', icon: 'checkmarkempty' },
  { key: 'popular', label: '热门', icon: 'fire-filled' },
  { key: 'new', label: '新车', icon: 'plus-filled' },
  { key: 'discount', label: '特惠', icon: 'star-filled' },
  { key: 'nearby', label: '附近', icon: 'location-filled' }
]);

// 排序选项
const sortOptions = ref<SortOption[]>([
  { value: 'default', label: '综合推荐' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'distance', label: '距离优先' },
  { value: 'rating', label: '评分优先' }
]);

// 数据状态
const vehicleList = ref<Vehicle[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选状态
const filters = ref({
  sortBy: 'default',
  pickupCity: '',
  quickFilter: '',
  keyword: ''
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.pickupCity) count++;
  if (filters.value.quickFilter) count++;
  if (filters.value.keyword) count++;
  return count;
});

// 快速筛选切换
const toggleQuickFilter = (filterKey: string) => {
  if (quickFilterActive.value === filterKey) {
    quickFilterActive.value = '';
    filters.value.quickFilter = '';
  } else {
    quickFilterActive.value = filterKey;
    filters.value.quickFilter = filterKey;
  }
  loadVehicleData(true);
};

// 页面生命周期
onLoad(async () => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  searchKeyword.value = options.keyword || '';
  pickupCity.value = options.pickupCity || '';
  pickupStore.value = options.pickupStore || '';

  // 设置筛选条件
  if (pickupCity.value) {
    filters.value.pickupCity = pickupCity.value;
  }

  // 初始化数据
  await Promise.all([
    loadVehicleData(true),
    loadFilterOptions()
  ]);
});

// 下拉刷新
onPullDownRefresh(async () => {
  await refreshData();
  uni.stopPullDownRefresh();
});

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !loadingMore.value) {
    loadMoreVehicles();
  }
});

// 加载车辆数据
const loadVehicleData = async (refresh = false) => {
  try {
    if (refresh) {
      refreshing.value = true;
    } else {
      loading.value = true;
    }

    const page = refresh ? 1 : currentPage.value;

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        brand: '奔驰',
        model: '威霆',
        mainImage: '/static/placeholder-vehicle.png',
        availabilityStatus: '可用',
        isPopular: true,
        seats: 7,
        fuelType: '汽油',
        categoryName: '豪华房车',
        amenities: ['WiFi', '空调', '厨房'],
        storeId: 1,
        distance: '2.3km',
        dailyRate: 680,
        monthlyRate: 18000,
        ratingAvg: 4.8,
        ratingCount: 126
      },
      {
        id: 2,
        brand: '上汽大通',
        model: 'V80',
        availabilityStatus: '可用',
        isNew: true,
        seats: 6,
        fuelType: '柴油',
        categoryName: '经济房车',
        amenities: ['WiFi', '卫生间'],
        storeId: 2,
        distance: '5.8km',
        dailyRate: 480,
        ratingAvg: 4.6,
        ratingCount: 89
      }
    ];

    if (refresh) {
      vehicleList.value = mockVehicles;
      currentPage.value = 1;
    } else {
      vehicleList.value.push(...mockVehicles);
    }

    hasMore.value = page < 3; // 模拟只有3页数据

  } catch (error) {
    console.error('加载车辆列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 加载更多车辆
const loadMoreVehicles = async () => {
  if (loadingMore.value || !hasMore.value) return;

  try {
    loadingMore.value = true;
    currentPage.value++;

    await loadVehicleData(false);

  } catch (error) {
    console.error('加载更多车辆失败:', error);
    currentPage.value--; // 回滚页码
  } finally {
    loadingMore.value = false;
  }
};

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    loadVehicleData(true),
    loadFilterOptions()
  ]);
};

// 加载筛选选项
const loadFilterOptions = async () => {
  try {
    // 模拟API调用
    console.log('加载筛选选项...');
  } catch (error) {
    console.error('加载筛选选项失败:', error);
  }
};

// 打开搜索页面
const openSearch = () => {
  uni.navigateTo({
    url: '/pages/vehicles/search'
  });
};

// 打开筛选页面
const openFilter = () => {
  uni.navigateTo({
    url: '/pages/vehicles/filter'
  });
};

// 切换排序方式
const changeSort = (sortBy: string) => {
  if (filters.value.sortBy === sortBy) return;

  filters.value.sortBy = sortBy;
  loadVehicleData(true);
};

// 切换收藏状态
const toggleFavorite = async (vehicle: Vehicle) => {
  try {
    // 模拟收藏操作
    const isFav = isFavorited(vehicle.id);

    if (isFav) {
      uni.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

// 检查是否已收藏
const isFavorited = (vehicleId: string | number) => {
  // 模拟收藏状态
  return false;
};

// 跳转到车辆详情页
const goToVehicleDetail = (vehicleId: string | number) => {
  uni.navigateTo({
    url: `/pages/vehicles/detail?id=${vehicleId}`
  });
};

// 快速预订
const quickBook = (vehicle: Vehicle) => {
  uni.navigateTo({
    url: `/pages/booking/create?vehicleId=${vehicle.id}&pickupCity=${pickupCity.value || ''}&pickupStore=${pickupStore.value || ''}`
  });
};

// 清空所有筛选条件
const clearAllFilters = () => {
  filters.value = {
    sortBy: 'default',
    pickupCity: '',
    quickFilter: '',
    keyword: ''
  };
  quickFilterActive.value = '';
  loadVehicleData(true);
};

// 重置所有筛选条件
const resetAllFilters = () => {
  clearAllFilters();
};
</script>

<style>
/* CSS变量定义 */
page {
  --primary-orange: #FF9F29;
  --success-green: #67C23A;
  --danger-red: #FF4D4F;
  --info-blue: #4B91FF;
  --warning-orange: #F6AD55;
  --text-primary: #1A1A1A;
  --text-secondary: #667085;
  --text-tertiary: #98A1B2;
  --bg-page: #F7F8FA;
  --bg-card: #FFFFFF;
  --border-color: #EEF0F3;
}

.vehicles-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-page) 0%, var(--bg-card) 100%);
}

/* Status Bar */
.status-bar {
  height: var(--status-bar-height);
  background: transparent;
}

/* Header Section */
.header-section {
  padding: 24rpx;
}

.header-section .search-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-section .search-container .search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: linear-gradient(135deg, rgba(255, 159, 41, 0.05) 0%, rgba(255, 159, 41, 0.02) 100%);
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  border: 2rpx solid var(--border-color);
  transition: all 0.3s ease;
}

.header-section .search-container .search-bar:active {
  transform: scale(0.98);
  border-color: var(--primary-orange);
  box-shadow: 0 0 0 16rpx rgba(255, 159, 41, 0.1);
}

.header-section .search-container .search-bar .search-placeholder {
  font-size: 32rpx;
  color: var(--text-tertiary);
  transition: all 0.3s ease;
}

.header-section .search-container .search-bar .search-placeholder.has-keyword {
  color: var(--text-primary);
  font-weight: 500;
}

.header-section .search-container .filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: var(--bg-page);
  border-radius: 16rpx;
  border: 2rpx solid var(--border-color);
  position: relative;
  transition: all 0.3s ease;
}

.header-section .search-container .filter-btn:active {
  transform: scale(0.95);
}

.header-section .search-container .filter-btn.active {
  background: linear-gradient(135deg, rgba(255, 159, 41, 0.1) 0%, rgba(255, 159, 41, 0.05) 100%);
  border-color: var(--primary-orange);
  box-shadow: 0 0 0 8rpx rgba(255, 159, 41, 0.1);
}

.header-section .search-container .filter-btn .filter-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 快速筛选 */
.header-section .quick-filters {
  margin-top: 24rpx;
}

.header-section .quick-filters .filter-scroll {
  white-space: nowrap;
}

.header-section .quick-filters .quick-filter-list {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
}

.header-section .quick-filters .quick-filter-list .quick-filter-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  background: var(--bg-page);
  border-radius: 24rpx;
  border: 2rpx solid var(--border-color);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.header-section .quick-filters .quick-filter-list .quick-filter-item:active {
  transform: scale(0.95);
}

.header-section .quick-filters .quick-filter-list .quick-filter-item.active {
  background: linear-gradient(135deg, var(--primary-orange) 0%, #F6AD55 100%);
  border-color: var(--primary-orange);
  box-shadow: 0 4rpx 16rpx rgba(255, 159, 41, 0.2);
}

.header-section .quick-filters .quick-filter-list .quick-filter-item.active .filter-text {
  color: #FFFFFF;
  font-weight: 600;
}

.header-section .quick-filters .quick-filter-list .quick-filter-item .filter-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-section .filter-tags {
  margin-top: 24rpx;
}

.header-section .filter-tags .filter-scroll {
  white-space: nowrap;
}

.header-section .filter-tags .filter-tags-list {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 0;
}

.header-section .filter-tags .filter-tags-list .filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 159, 41, 0.1);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 159, 41, 0.2);
  transition: all 0.3s ease;
}

.header-section .filter-tags .filter-tags-list .filter-tag:active {
  transform: scale(0.95);
}

.header-section .filter-tags .filter-tags-list .filter-tag.clear-tag {
  background: rgba(255, 77, 79, 0.1);
  border-color: rgba(255, 77, 79, 0.2);
}

.header-section .filter-tags .filter-tags-list .filter-tag.clear-tag .tag-text {
  color: var(--danger-red);
}

.header-section .filter-tags .filter-tags-list .filter-tag .tag-text {
  font-size: 28rpx;
  color: var(--primary-orange);
  font-weight: 500;
  white-space: nowrap;
}

/* Sort Section */
.sort-section {
  margin-bottom: 24rpx;
  padding: 0 24rpx;
}

.sort-section .sort-scroll {
  white-space: nowrap;
}

.sort-section .sort-options {
  display: flex;
  padding: 16rpx 0;
  gap: 16rpx;
}

.sort-section .sort-options .sort-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  background: var(--bg-page);
  border: 2rpx solid var(--border-color);
  white-space: nowrap;
  transition: all 0.3s ease;
}

.sort-section .sort-options .sort-option:active {
  transform: scale(0.95);
}

.sort-section .sort-options .sort-option .sort-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.sort-section .sort-options .sort-option.active {
  background: linear-gradient(135deg, var(--primary-orange) 0%, #F6AD55 100%);
  border-color: var(--primary-orange);
  box-shadow: 0 4rpx 16rpx rgba(255, 159, 41, 0.2);
}

.sort-section .sort-options .sort-option.active .sort-text {
  color: #FFFFFF;
  font-weight: 600;
}

/* Vehicle List */
.vehicle-list {
  padding: 0 24rpx;
}

.vehicle-list .loading-container .skeleton-card {
  margin-bottom: 24rpx;
}

.vehicle-list .vehicle-items .vehicle-card {
  margin-bottom: 32rpx;
}

/* Load More */
.load-more {
  padding: 48rpx 24rpx;
}

.load-more .no-more {
  text-align: center;
}

.load-more .no-more .no-more-text {
  font-size: 28rpx;
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>