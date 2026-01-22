<template>
  <view class="campsite-list-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: currentDistance }"
        @click="showDistanceFilter"
      >
        <text>{{ currentDistance || '距离' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
      <view
        class="filter-item"
        :class="{ active: currentPrice }"
        @click="showPriceFilter"
      >
        <text>{{ currentPrice || '价格' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
      <view
        class="filter-item"
        :class="{ active: currentType }"
        @click="showTypeFilter"
      >
        <text>{{ currentType || '类型' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
    </view>

    <!-- 营地列表 -->
    <scroll-view
      class="campsite-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 空状态 -->
      <view v-if="campsites.length === 0 && !loading" class="empty-state">
        <u-icon name="map-fill" size="80" color="#DDD"></u-icon>
        <text class="empty-text">暂无营地信息</text>
        <text class="empty-tip">敬请期待更多营地</text>
      </view>

      <!-- 营地卡片 -->
      <view v-else>
        <view
          class="campsite-card"
          v-for="item in campsites"
          :key="item.id"
          @click="viewDetail(item)"
        >
          <image class="campsite-image" :src="item.image" mode="aspectFill"></image>

          <!-- 热门标签 -->
          <view v-if="item.isHot" class="hot-badge">
            <text class="hot-text">热门</text>
          </view>

          <view class="campsite-info">
            <text class="campsite-name">{{ item.name }}</text>

            <view class="campsite-tags">
              <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
            </view>

            <view class="campsite-meta">
              <view class="rating">
                <u-icon name="star-fill" size="14" color="#FF9F29"></u-icon>
                <text class="rating-text">{{ item.rating }}</text>
                <text class="review-count">({{ item.reviewCount }}条评价)</text>
              </view>
            </view>

            <view class="location-info">
              <u-icon name="map-fill" size="14" color="#999"></u-icon>
              <text class="distance">距离{{ item.distance }}km</text>
            </view>

            <view class="price-box">
              <view class="price-main">
                <text class="price">¥{{ item.price }}</text>
                <text class="unit">/晚起</text>
              </view>
              <view class="site-count">
                <text class="count-text">剩余{{ item.availableSites }}个营位</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="loading">
        <text class="load-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="!loading && !hasMore && campsites.length > 0">
        <text class="no-more-text">没有更多营地了</text>
      </view>
    </scroll-view>

    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">{{ filterTitle }}</text>
          <u-icon name="close" size="20" color="#666" @tap="closeFilter"></u-icon>
        </view>
        <view class="popup-content">
          <view
            v-for="item in filterOptions"
            :key="item.value"
            class="filter-option"
            :class="{ active: item.value === currentFilterValue }"
            @tap="selectFilter(item)"
          >
            <text class="option-text">{{ item.label }}</text>
            <u-icon
              v-if="item.value === currentFilterValue"
              name="checkbox-mark"
              size="18"
              color="#FF9F29"
            ></u-icon>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, onMounted } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { mockCampsiteList } from '@/mock';

// 状态管理
const campsites = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);
const page = ref(1);

// 筛选状态
const currentDistance = ref('');
const currentPrice = ref('');
const currentType = ref('');
const filterPopup = ref<any>(null);
const filterTitle = ref('');
const filterOptions = ref<any[]>([]);
const currentFilterValue = ref('');
const currentFilterType = ref('');

// 页面加载
onMounted(() => {
  loadCampsites();
});

// 加载营地列表
const loadCampsites = async (isRefresh = false) => {
  if (loading.value && !isRefresh) return;

  try {
    loading.value = true;

    // Mock数据 - 扩展到6个营地
    // 使用统一的Mock数据
    const mockCampsites = mockCampsiteList;

    if (isRefresh) {
      campsites.value = mockCampsites;
      page.value = 1;
      hasMore.value = false; // Mock数据只有一页
    } else {
      campsites.value.push(...mockCampsites);
      hasMore.value = false;
    }

  } catch (error) {
    logger.error('加载营地列表失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  loadCampsites(true);
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++;
    loadCampsites();
  }
};

// 显示距离筛选
const showDistanceFilter = () => {
  filterTitle.value = '选择距离';
  currentFilterType.value = 'distance';
  currentFilterValue.value = currentDistance.value;
  filterOptions.value = [
    { label: '不限', value: '' },
    { label: '5km以内', value: '0-5' },
    { label: '5-10km', value: '5-10' },
    { label: '10-20km', value: '10-20' },
    { label: '20km以上', value: '20-' }
  ];
  filterPopup.value?.open();
};

// 显示价格筛选
const showPriceFilter = () => {
  filterTitle.value = '价格区间';
  currentFilterType.value = 'price';
  currentFilterValue.value = currentPrice.value;
  filterOptions.value = [
    { label: '不限', value: '' },
    { label: '200元以下', value: '0-200' },
    { label: '200-300元', value: '200-300' },
    { label: '300-400元', value: '300-400' },
    { label: '400元以上', value: '400-' }
  ];
  filterPopup.value?.open();
};

// 显示类型筛选
const showTypeFilter = () => {
  filterTitle.value = '营地类型';
  currentFilterType.value = 'type';
  currentFilterValue.value = currentType.value;
  filterOptions.value = [
    { label: '不限', value: '' },
    { label: '湖景营地', value: 'lake' },
    { label: '山景营地', value: 'mountain' },
    { label: '海景营地', value: 'sea' },
    { label: '森林营地', value: 'forest' }
  ];
  filterPopup.value?.open();
};

// 选择筛选项
const selectFilter = (item: any) => {
  currentFilterValue.value = item.value;

  if (currentFilterType.value === 'distance') {
    currentDistance.value = item.value ? item.label : '';
  } else if (currentFilterType.value === 'price') {
    currentPrice.value = item.value ? item.label : '';
  } else if (currentFilterType.value === 'type') {
    currentType.value = item.value ? item.label : '';
  }

  closeFilter();
  // 重新加载数据
  loadCampsites(true);
};

// 关闭筛选弹窗
const closeFilter = () => {
  filterPopup.value?.close();
};

// 查看详情
const viewDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages/business/campsite/detail?id=${item.id}`
  });
};
</script>

<style scoped lang="scss">
.campsite-list-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

// 筛选栏
.filter-bar {
  background-color: $uni-bg-color-card;
  display: flex;
  padding: $uni-spacing-lg $uni-spacing-xl;
  gap: $uni-spacing-xl;
  box-shadow: $uni-shadow-sm;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: $uni-spacing-sm;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  transition: all 0.2s ease;

  &.active {
    color: $uni-color-primary;
  }

  &:active {
    opacity: 0.7;
  }
}

// 营地列表
.campsite-list {
  flex: 1;
  padding: $uni-spacing-lg;
  width: 100%;
  box-sizing: border-box;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: $uni-spacing-xl;
    opacity: 0.6;
  }

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-secondary;
    margin-bottom: $uni-spacing-sm;
  }

  .empty-tip {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

// 营地卡片
.campsite-card {
  position: relative;
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  overflow: hidden;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.99);
  }
}

.campsite-image {
  width: 100%;
  height: 350rpx;
}

// 热门标签
.hot-badge {
  position: absolute;
  top: $uni-spacing-lg;
  left: 0;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  padding: $uni-spacing-sm $uni-spacing-lg $uni-spacing-sm $uni-spacing-md;
  border-radius: 0 $uni-radius-md $uni-radius-md 0;

  .hot-text {
    font-size: $uni-font-size-xs;
    font-weight: 600;
  }
}

.campsite-info {
  padding: $uni-spacing-lg;
}

.campsite-name {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-md;
  display: block;
}

.campsite-tags {
  display: flex;
  gap: $uni-spacing-md;
  margin-bottom: $uni-spacing-md;
  flex-wrap: wrap;
}

.tag {
  padding: $uni-spacing-xs $uni-spacing-md;
  background-color: rgba(255, 159, 41, 0.1);
  color: $uni-color-primary;
  font-size: $uni-font-size-xs;
  border-radius: $uni-radius-xs;
}

.campsite-meta {
  margin-bottom: $uni-spacing-md;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4rpx;

  .rating-text {
    font-size: $uni-font-size-sm;
    color: $uni-text-color;
    font-weight: 500;
  }

  .review-count {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
    margin-left: $uni-spacing-sm;
  }
}

.location-info {
  display: flex;
  align-items: center;
  gap: $uni-spacing-sm;
  margin-bottom: $uni-spacing-md;

  .distance {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

.price-box {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .price-main {
    display: flex;
    align-items: baseline;

    .price {
      font-size: 36rpx;
      font-weight: bold;
      color: $uni-color-error;
      font-family: 'DIN Alternate', sans-serif;
    }

    .unit {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
      margin-left: 4rpx;
    }
  }

  .site-count {
    .count-text {
      font-size: $uni-font-size-sm;
      color: $uni-color-success;
    }
  }
}

// 加载状态
.load-more {
  text-align: center;
  padding: $uni-spacing-xl 0;

  .load-text {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-secondary;
  }
}

// 没有更多
.no-more {
  text-align: center;
  padding: $uni-spacing-xl 0;

  .no-more-text {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

// 筛选弹窗
.filter-popup {
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg $uni-radius-lg 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $uni-spacing-xl;
    border-bottom: 2rpx solid $uni-border-color-light;

    .popup-title {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }
  }

  .popup-content {
    max-height: 600rpx;
    overflow-y: auto;

    .filter-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $uni-spacing-xl;
      border-bottom: 2rpx solid $uni-bg-color-grey;
      transition: all 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: $uni-bg-color-grey;
      }

      .option-text {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
      }

      &.active {
        .option-text {
          color: $uni-color-primary;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
