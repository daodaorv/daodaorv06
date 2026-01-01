<template>
  <view class="tour-list-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="showDurationFilter">
        <text class="filter-text">{{ currentDuration || '行程天数' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
      <view class="filter-item" @tap="showPriceFilter">
        <text class="filter-text">{{ currentPrice || '价格' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
      <view class="filter-item" @tap="showStatusFilter">
        <text class="filter-text">{{ currentStatus || '状态' }}</text>
        <u-icon name="arrow-down" size="12" color="#666"></u-icon>
      </view>
    </view>

    <!-- 路线列表 -->
    <scroll-view
      class="tour-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 空状态 -->
      <view v-if="tours.length === 0 && !loading" class="empty-state">
        <u-empty mode="list" text="暂无旅游线路">
        </u-empty>
      </view>

      <!-- 线路卡片 -->
      <view v-else>
        <view class="tour-card" v-for="item in tours" :key="item.id" @tap="viewDetail(item)">
          <view class="image-wrapper">
             <u-image :src="item.image" width="100%" height="400rpx" mode="aspectFill" radius="16rpx 16rpx 0 0"></u-image>
             <!-- 状态标签 -->
             <view class="tour-badge-wrapper">
                 <u-tag :text="getStatusText(item.status)" :type="getStatusType(item.status)" shape="checkmark-circle" size="mini"></u-tag>
             </view>
             <!-- 热门标签 -->
             <view v-if="item.isHot" class="hot-tag-wrapper">
                 <u-tag text="热门" type="error" shape="checkmark-circle" size="mini" icon="star-fill"></u-tag>
             </view>
          </view>

          <view class="tour-info">
            <text class="tour-title">{{ item.title }}</text>

            <!-- 线路标签 -->
            <view class="tour-tags">
              <u-tag v-for="tag in item.tags" :key="tag" :text="tag" plain size="mini" type="warning" style="margin-right: 10rpx;"></u-tag>
            </view>

            <view class="tour-details">
              <view class="detail-item">
                <u-icon name="calendar" size="14" color="#999"></u-icon>
                <text class="detail-text">{{ item.days }}天{{ item.days - 1 }}晚</text>
              </view>
              <view class="detail-item">
                <u-icon name="account-fill" size="14" color="#999"></u-icon>
                <text class="detail-text">{{ item.minPeople }}-{{ item.maxPeople }}人成团</text>
              </view>
            </view>

            <!-- 成团进度 -->
            <view class="group-progress" v-if="item.status === 'recruiting'">
              <u-line-progress :percentage="(item.currentPeople / item.maxPeople) * 100" activeColor="#67C23A" height="8"></u-line-progress>
              <text class="progress-text">已报名{{ item.currentPeople }}人/{{ item.maxPeople }}人</text>
            </view>

            <view class="price-row">
              <view class="price-box">
                <text class="price">¥{{ item.price }}</text>
                <text class="unit">/人起</text>
                <text class="child-price" v-if="item.childPrice">儿童¥{{ item.childPrice }}</text>
              </view>
              <u-button 
                :type="getBtnType(item.status)" 
                shape="checkmark-circle" 
                size="small" 
                :text="getActionText(item.status)"
                :disabled="item.status === 'departed' || item.status === 'completed'"
                customStyle="width: 180rpx; height: 64rpx;"
              ></u-button>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <u-loadmore :status="loading ? 'loading' : (hasMore ? 'loadmore' : 'nomore')" />
      
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
            <u-icon v-if="item.value === currentFilterValue" name="checkbox-mark" size="18" color="#FF9F29"></u-icon>
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
import { mockTourList } from '@/mock';

// 状态管理
const tours = ref<any[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);
const page = ref(1);

// 筛选状态
const currentDuration = ref('');
const currentPrice = ref('');
const currentStatus = ref('');
const filterPopup = ref<any>(null);
const filterTitle = ref('');
const filterOptions = ref<any[]>([]);
const currentFilterValue = ref('');
const currentFilterType = ref('');

// 页面加载
onMounted(() => {
  loadTours();
});

// 加载旅游线路列表
const loadTours = async (isRefresh = false) => {
  if (loading.value && !isRefresh) return;

  try {
    loading.value = true;

    // 使用集中管理的Mock数据
    const mockTours = mockTourList;

    if (isRefresh) {
      tours.value = mockTours;
      page.value = 1;
      hasMore.value = false;
    } else {
      tours.value.push(...mockTours);
      hasMore.value = false;
    }

  } catch (error) {
    logger.error('加载旅游线路失败:', error);
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
  loadTours(true);
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++;
    loadTours();
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    recruiting: '招募中',
    confirmed: '已成团',
    departed: '已出发',
    completed: '已结束'
  };
  return map[status] || status;
};

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    recruiting: 'success',
    confirmed: 'warning',
    departed: 'info',
    completed: 'info'
  };
  return map[status] || 'primary';
};

// 获取按钮类型
const getBtnType = (status: string) => {
   const map: Record<string, string> = {
    recruiting: 'primary',
    confirmed: 'warning',
    departed: 'info',
    completed: 'info'
  };
  return map[status] || 'primary';
};

// 获取操作按钮文本
const getActionText = (status: string) => {
  const map: Record<string, string> = {
    recruiting: '立即报名',
    confirmed: '查看详情',
    departed: '已出发',
    completed: '已结束'
  };
  return map[status] || '查看详情';
};

// 计算成团进度宽度
const getProgressWidth = (tour: any) => {
  const percentage = (tour.currentPeople / tour.maxPeople) * 100;
  return `${Math.min(percentage, 100)}%`;
};

// 显示天数筛选
const showDurationFilter = () => {
  filterTitle.value = '行程天数';
  currentFilterType.value = 'duration';
  currentFilterValue.value = currentDuration.value;
  filterOptions.value = [
    { label: '不限', value: '' },
    { label: '3-5天', value: '3-5' },
    { label: '6-8天', value: '6-8' },
    { label: '9天以上', value: '9-' }
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
    { label: '3000元以下', value: '0-3000' },
    { label: '3000-5000元', value: '3000-5000' },
    { label: '5000-7000元', value: '5000-7000' },
    { label: '7000元以上', value: '7000-' }
  ];
  filterPopup.value?.open();
};

// 显示状态筛选
const showStatusFilter = () => {
  filterTitle.value = '线路状态';
  currentFilterType.value = 'status';
  currentFilterValue.value = currentStatus.value;
  filterOptions.value = [
    { label: '全部状态', value: '' },
    { label: '招募中', value: 'recruiting' },
    { label: '已成团', value: 'confirmed' },
    { label: '已出发', value: 'departed' }
  ];
  filterPopup.value?.open();
};

// 选择筛选项
const selectFilter = (item: any) => {
  currentFilterValue.value = item.value;

  if (currentFilterType.value === 'duration') {
    currentDuration.value = item.value ? item.label : '';
  } else if (currentFilterType.value === 'price') {
    currentPrice.value = item.value ? item.label : '';
  } else if (currentFilterType.value === 'status') {
    currentStatus.value = item.value ? item.label : '';
  }

  closeFilter();
  loadTours(true);
};

// 关闭筛选弹窗
const closeFilter = () => {
  filterPopup.value?.close();
};

// 查看详情
const viewDetail = (item: any) => {
  uni.navigateTo({ url: `/pages/tour/detail?id=${item.id}` });
};
</script>

<style scoped lang="scss">
.tour-list-page {
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
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
  }

  .filter-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }
}

// 线路列表
.tour-list {
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
    margin-bottom: $uni-spacing-md;
  }

  .empty-tip {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

// 线路卡片
.tour-card {
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  overflow: hidden;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;
  position: relative;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.99);
  }
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 400rpx;
}

// 状态标签
.tour-badge-wrapper {
  position: absolute;
  top: $uni-spacing-lg;
  right: $uni-spacing-lg;
  z-index: 1;
}

// 热门标签
.hot-tag-wrapper {
  position: absolute;
  top: $uni-spacing-lg;
  left: 0;
  z-index: 1;
}

.tour-info {
  padding: $uni-spacing-lg;
}

.tour-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-md;
  display: block;
  line-height: 1.4;
}

// 线路标签
.tour-tags {
  display: flex;
  gap: $uni-spacing-md;
  margin-bottom: $uni-spacing-md;
  flex-wrap: wrap;

  .tag-item {
    font-size: $uni-font-size-xs;
    color: $uni-color-primary;
    background-color: rgba(255, 159, 41, 0.1);
    padding: $uni-spacing-xs $uni-spacing-md;
    border-radius: $uni-radius-xs;
  }
}

.tour-details {
  display: flex;
  gap: $uni-spacing-lg;
  margin-bottom: $uni-spacing-md;

  .detail-item {
    display: flex;
    align-items: center;
    gap: $uni-spacing-sm;

    .detail-text {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
    }
  }
}

// 成团进度
.group-progress {
  margin-bottom: $uni-spacing-lg;

  .progress-bar {
    width: 100%;
    height: 8rpx;
    background-color: $uni-border-color-light;
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: $uni-spacing-md;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $uni-color-success 0%, #85CE61 100%);
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }

  .progress-text {
    font-size: $uni-font-size-sm;
    color: $uni-color-success;
  }
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price-box {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-sm;

  .price {
    font-size: 48rpx;
    font-weight: 700;
    color: $uni-color-error;
    font-family: 'DIN Alternate', sans-serif;
  }

  .unit {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
    margin-left: 4rpx;
  }

  .child-price {
    font-size: $uni-font-size-xs;
    color: $uni-text-color-placeholder;
  }
}

.action-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  padding: $uni-spacing-lg $uni-spacing-xl;
  border-radius: $uni-radius-btn;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &.disabled {
    background: $uni-bg-color-grey;
    color: $uni-text-color-placeholder;
  }

  .btn-text {
    font-size: $uni-font-size-base;
    font-weight: 500;
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
