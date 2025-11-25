<template>
  <view class="rating-page">
    <!-- 头部筛选 -->
    <view class="header-filter">
      <scroll-view class="filter-scroll" scroll-x="true">
        <view class="filter-list">
          <view
            class="filter-item"
            :class="{ 'active': currentFilter === '' }"
            @tap="setFilter('')"
          >
            <text class="filter-text">全部</text>
          </view>
          <view
            class="filter-item"
            :class="{ 'active': currentFilter === '5' }"
            @tap="setFilter('5')"
          >
            <text class="filter-text">好评</text>
          </view>
          <view
            class="filter-item"
            :class="{ 'active': currentFilter === '3' }"
            @tap="setFilter('3')"
          >
            <text class="filter-text">中评</text>
          </view>
          <view
            class="filter-item"
            :class="{ 'active': currentFilter === '1' }"
            @tap="setFilter('1')"
          >
            <text class="filter-text">差评</text>
          </view>
          <view
            class="filter-item"
            :class="{ 'active': currentFilter === 'images' }"
            @tap="setFilter('images')"
          >
            <text class="filter-text">有图</text>
          </view>
        </view>
      </scroll-view>

      <view class="sort-section">
        <view
          class="sort-item"
          :class="{ 'active': sortType === 'newest' }"
          @tap="setSort('newest')"
        >
          <text class="sort-text">最新</text>
        </view>
        <view
          class="sort-item"
          :class="{ 'active': sortType === 'rating-high' }"
          @tap="setSort('rating-high')"
        >
          <text class="sort-text">评分高</text>
        </view>
        <view
          class="sort-item"
          :class="{ 'active': sortType === 'rating-low' }"
          @tap="setSort('rating-low')"
        >
          <text class="sort-text">评分低</text>
        </view>
      </view>
    </view>

    <!-- 评分统计 -->
    <view class="rating-summary" v-if="vehicleStats">
      <view class="summary-header">
        <view class="overall-rating">
          <text class="rating-number">{{ vehicleStats.overallRating.toFixed(1) }}</text>
          <view class="rating-stars">
            <uni-icons
              v-for="i in 5"
              :key="i"
              :type="i <= Math.round(vehicleStats.overallRating) ? 'star-filled' : 'star'"
              size="16"
              :color="i <= Math.round(vehicleStats.overallRating) ? '#FFB800' : '#E5E5E5'"
            ></uni-icons>
          </view>
        </view>
        <view class="rating-count">
          <text class="count-text">{{ vehicleStats.totalRatings }}条评价</text>
        </view>
      </view>

      <view class="rating-bars">
        <view
          v-for="star in 5"
          :key="star"
          class="rating-bar-item"
        >
          <text class="bar-label">{{ 6 - star }}星</text>
          <view class="bar-track">
            <view
              class="bar-fill"
              :style="{ width: getRatingPercentage(6 - star) + '%' }"
            ></view>
          </view>
          <text class="bar-count">{{ getRatingCount(6 - star) }}</text>
        </view>
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view
      class="rating-list"
      scroll-y="true"
      @scrolltolower="loadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view v-if="ratings.length === 0 && !loading" class="empty-state">
        <image class="empty-image" src="/static/empty-rating.png" mode="aspectFit"></image>
        <text class="empty-text">暂无评价</text>
      </view>

      <!-- 评价项 -->
      <view
        v-for="rating in ratings"
        :key="rating.id"
        class="rating-item"
        @tap="goToRatingDetail(rating.id)"
      >
        <!-- 用户信息 -->
        <view class="rating-header">
          <view class="user-info">
            <image
              class="user-avatar"
              :src="rating.user.avatar || '/static/default-avatar.png'"
              mode="aspectFill"
            ></image>
            <view class="user-details">
              <text class="user-name">{{ rating.user.nickname }}</text>
              <view class="rating-stars-small">
                <uni-icons
                  v-for="i in 5"
                  :key="i"
                  :type="i <= Math.round(rating.overallRating) ? 'star-filled' : 'star'"
                  size="12"
                  :color="i <= Math.round(rating.overallRating) ? '#FFB800' : '#E5E5E5'"
                ></uni-icons>
                <text class="rating-number-small">{{ rating.overallRating.toFixed(1) }}</text>
              </view>
            </view>
          </view>
          <text class="rating-date">{{ formatDate(rating.createdAt) }}</text>
        </view>

        <!-- 评分详情 -->
        <view class="rating-details">
          <view class="rating-item-detail">
            <text class="detail-label">车辆</text>
            <view class="detail-stars">
              <uni-icons
                v-for="i in 5"
                :key="i"
                :type="i <= Math.round(rating.vehicleRating) ? 'star-filled' : 'star'"
                size="12"
                :color="i <= Math.round(rating.vehicleRating) ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
          <view class="rating-item-detail">
            <text class="detail-label">服务</text>
            <view class="detail-stars">
              <uni-icons
                v-for="i in 5"
                :key="i"
                :type="i <= Math.round(rating.serviceRating) ? 'star-filled' : 'star'"
                size="12"
                :color="i <= Math.round(rating.serviceRating) ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
          <view class="rating-item-detail">
            <text class="detail-label">卫生</text>
            <view class="detail-stars">
              <uni-icons
                v-for="i in 5"
                :key="i"
                :type="i <= Math.round(rating.cleanlinessRating) ? 'star-filled' : 'star'"
                size="12"
                :color="i <= Math.round(rating.cleanlinessRating) ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
        </view>

        <!-- 评价内容 -->
        <view class="rating-content" v-if="rating.content">
          <text class="content-text">{{ rating.content }}</text>
        </view>

        <!-- 评价标签 -->
        <view class="rating-tags" v-if="rating.tags && rating.tags.length > 0">
          <text
            v-for="tag in rating.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </text>
        </view>

        <!-- 评价图片 -->
        <view class="rating-images" v-if="rating.images && rating.images.length > 0">
          <image
            v-for="(image, index) in rating.images.slice(0, 4)"
            :key="index"
            class="rating-image"
            :src="image"
            mode="aspectFill"
            @tap.stop="previewImage(rating.images, index)"
          ></image>
          <view
            v-if="rating.images.length > 4"
            class="more-images"
            @tap.stop="previewImage(rating.images, 4)"
          >
            <text class="more-text">+{{ rating.images.length - 4 }}</text>
          </view>
        </view>

        <!-- 操作栏 -->
        <view class="rating-actions">
          <view
            class="action-item"
            :class="{ 'active': rating.likeStatus }"
            @tap.stop="toggleLike(rating)"
          >
            <uni-icons
              :type="rating.likeStatus ? 'hand-up-filled' : 'hand-up'"
              size="16"
              :color="rating.likeStatus ? '#FF4D4F' : '#666666'"
            ></uni-icons>
            <text class="action-text">{{ rating.likeCount || 0 }}</text>
          </view>
          <view class="action-item" @tap.stop="goToRatingDetail(rating.id)">
            <uni-icons type="chat" size="16" color="#666666"></uni-icons>
            <text class="action-text">{{ rating.replyCount || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="!loading && !hasMore && ratings.length > 0">
        <text class="no-more-text">没有更多评价了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ratingApi } from '@/api/rating';

const props = defineProps({
  vehicleId: {
    type: Number,
    required: true
  }
});

// 状态管理
const ratings = ref<any[]>([]);
const vehicleStats = ref<any>(null);
const currentFilter = ref('');
const sortType = ref('newest');
const page = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);

// 筛选条件
const filters = computed(() => {
  const filter: any = {
    vehicleId: props.vehicleId
  };

  // 根据当前筛选条件设置过滤
  if (currentFilter.value === '5') {
    filter.minRating = 4.0;
  } else if (currentFilter.value === '3') {
    filter.minRating = 3.0;
    filter.maxRating = 4.0;
  } else if (currentFilter.value === '1') {
    filter.maxRating = 3.0;
  } else if (currentFilter.value === 'images') {
    filter.hasImages = true;
  }

  return filter;
});

// 页面加载
onMounted(() => {
  loadVehicleStats();
  loadRatings();
});

// 设置筛选条件
const setFilter = (filter: string) => {
  currentFilter.value = filter;
  page.value = 1;
  ratings.value = [];
  hasMore.value = true;
  loadRatings();
};

// 设置排序方式
const setSort = (sort: string) => {
  sortType.value = sort;
  page.value = 1;
  ratings.value = [];
  hasMore.value = true;
  loadRatings();
};

// 加载车辆评分统计
const loadVehicleStats = async () => {
  try {
    const stats = await ratingApi.getVehicleRatingStats(props.vehicleId);
    vehicleStats.value = stats.data;
  } catch (error) {
    console.error('加载评分统计失败:', error);
  }
};

// 加载评价列表
const loadRatings = async (isRefresh: boolean = false) => {
  if (loading.value && !isRefresh) return;

  loading.value = true;

  try {
    const params = {
      ...filters.value,
      page: page.value,
      limit: 10
    };

    const response = await ratingApi.getRatings(params);
    const newRatings = response.data.ratings;

    if (isRefresh || page.value === 1) {
      ratings.value = newRatings;
    } else {
      ratings.value.push(...newRatings);
    }

    hasMore.value = page.value < response.data.pagination.pages;
  } catch (error) {
    console.error('加载评价列表失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadRatings();
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  page.value = 1;
  loadRatings(true);
};

// 点赞/取消点赞
const toggleLike = async (rating: any) => {
  try {
    const result = await ratingApi.likeRating(rating.id);
    rating.likeStatus = result.data.isLiked;
    rating.likeCount = (rating.likeCount || 0) + (result.data.isLiked ? 1 : -1);
  } catch (error) {
    console.error('点赞操作失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 预览图片
const previewImage = (images: string[], current: number) => {
  uni.previewImage({
    urls: images,
    current
  });
};

// 跳转到评价详情
const goToRatingDetail = (ratingId: number) => {
  uni.navigateTo({
    url: `/pages/rating/detail?id=${ratingId}`
  });
};

// 获取评分百分比
const getRatingPercentage = (star: string) => {
  if (!vehicleStats.value?.ratingDistribution) return 0;
  const total = vehicleStats.value.totalRatings;
  const count = vehicleStats.value.ratingDistribution[star + '星'] || 0;
  return total > 0 ? (count / total) * 100 : 0;
};

// 获取评分数量
const getRatingCount = (star) => {
  if (!vehicleStats.value?.ratingDistribution) return 0;
  return vehicleStats.value.ratingDistribution[star + '星'] || 0;
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 24 * 60 * 60 * 1000) {
    return '今天';
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  } else {
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};
</script>

<style>
.rating-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 头部筛选
.header-filter {
  background-color: #ffffff;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;

  .filter-scroll {
    white-space: nowrap;

    .filter-list {
      display: flex;
      padding: 0 32rpx;

      .filter-item {
        flex-shrink: 0;
        padding: 16rpx 32rpx;
        margin-right: 24rpx;
        background-color: #f8f8f8;
        border-radius: 25rpx;

        .last-child {
          margin-right: 0;
        }

        .filter-text {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
        }

        &.active {
          background-color: rgba(255, 159, 41, 0.1);

          .filter-text {
            color: #FF9F29;
            font-weight: 500;
          }
        }
      }
    }
  }

  .sort-section {
    display: flex;
    justify-content: space-around;
    padding: 24rpx 32rpx 0;
    border-top: 2rpx solid #f8f8f8;
    margin-top: 24rpx;

    .sort-item {
      padding: 12rpx 24rpx;

      .sort-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      &.active  { .sort-text { color: #FF9F29;
          font-weight: 500; } }
    }
  }
}

// 评分统计
.rating-summary {
  background-color: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;

    .overall-rating {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .rating-number {
        font-size: 48rpx;
        font-weight: 600;
        color: #FF9F29;
      }

      .rating-stars {
        display: flex;
        align-items: center;
        gap: 4rpx;
      }
    }

    .rating-count  { .count-text { font-size: 28rpx;
        color: rgba(0, 0, 0, 0.6); } }
  }

  .rating-bars  { .rating-bar-item { display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .last-child { margin-bottom: 0; }.bar-label { font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        width: 60rpx; }.bar-track { flex: 1;
        height: 8rpx;
        background-color: #f0f0f0;
        border-radius: 4rpx;
        overflow: hidden;

        .bar-fill { height: 100%;
          background-color: #FFB800;
          border-radius: 4rpx;
          transition: width 0.3s ease; } }

      .bar-count {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        width: 60rpx;
        text-align: right;
      }
    }
  }
}

// 评价列表
.rating-list {
  height: calc(100vh - 300rpx);
  padding: 0 24rpx;
}

.rating-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .rating-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .user-info {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .user-avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
      }

      .user-details  { .user-name { font-size: 28rpx;
          color: rgba(0, 0, 0, 0.9);
          font-weight: 500;
          margin-bottom: 4rpx;
          display: block; }.rating-stars-small { display: flex;
          align-items: center;
          gap: 8rpx;

          .rating-number-small { font-size: 24rpx;
            color: #FFB800;
            font-weight: 500; } }
      }
    }

    .rating-date {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }

  .rating-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .rating-item-detail {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .detail-label {
        font-size: 22rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      .detail-stars {
        display: flex;
        align-items: center;
        gap: 2rpx;
      }
    }
  }

  .rating-content {
    margin-bottom: 24rpx;

    .content-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.6;
    }
  }

  .rating-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .tag {
      padding: 8rpx 16rpx;
      background-color: rgba(255, 159, 41, 0.1);
      color: #FF9F29;
      font-size: 22rpx;
      border-radius: 20rpx;
    }
  }

  .rating-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .rating-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
    }

    .more-images {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;

      .more-text {
        color: #ffffff;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
  }

  .rating-actions {
    display: flex;
    gap: 48rpx;
    padding-top: 24rpx;
    border-top: 2rpx solid #f8f8f8;

    .action-item {
      display: flex;
      align-items: center;
      gap: 8rpx;

      &.active  { .action-text { color: #FF4D4F; } }

      .action-text {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
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
    margin-bottom: 32rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}

// 加载状态
.loading-state,
.no-more {
  text-align: center;
  padding: 40rpx 0;

  .loading-text,
  .no-more-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>