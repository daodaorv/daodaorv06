<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">旅游攻略</text>
      <text class="subtitle">房车旅行指南与攻略分享</text>
    </view>

    <!-- 攻略分类标签 -->
    <view class="category-tabs">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: activeCategory === category.id }"
        @tap="switchCategory(category.id)"
      >
        <text class="category-text">{{ category.name }}</text>
      </view>
    </view>

    <!-- 攻略列表 -->
    <view class="travel-list">
      <view
        v-for="travel in filteredTravelList"
        :key="travel.id"
        class="travel-card"
        @tap="goToTravelDetail(travel.id)"
      >
        <image class="travel-image" :src="travel.image || '/static/placeholder-travel.png'" mode="aspectFill"></image>
        <view class="travel-info">
          <view class="travel-header">
            <text class="travel-title">{{ travel.title }}</text>
            <view class="travel-type">
              <text class="type-tag">{{ travel.type }}</text>
            </view>
          </view>

          <view class="travel-meta">
            <view class="author">
              <uni-icons type="person" size="12" color="#999"></uni-icons>
              <text class="author-text">{{ travel.author }}</text>
            </view>
            <view class="views">
              <uni-icons type="eye" size="12" color="#999"></uni-icons>
              <text class="views-text">{{ travel.views }}</text>
            </view>
            <view class="date">
              <uni-icons type="calendar" size="12" color="#999"></uni-icons>
              <text class="date-text">{{ travel.date }}</text>
            </view>
          </view>

          <view class="travel-description">
            <text class="description-text">{{ travel.description }}</text>
          </view>

          <view class="travel-tags">
            <text
              v-for="tag in travel.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </text>
          </view>

          <view class="travel-footer">
            <view class="like-info">
              <uni-icons type="heart" size="16" color="#FF6B6B"></uni-icons>
              <text class="like-count">{{ travel.likes }}</text>
            </view>
            <view class="comment-info">
              <uni-icons type="chat" size="16" color="#4CAF50"></uni-icons>
              <text class="comment-count">{{ travel.comments }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && filteredTravelList.length === 0" class="empty-state">
      <image class="empty-image" src="/static/empty-travel.png" mode="aspectFit"></image>
      <text class="empty-text">暂无相关攻略</text>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  data() {
    return {
      travelList: [],
      categories: [
        { id: 'all', name: '全部' },
        { id: 'route', name: '路线规划' },
        { id: 'experience', name: '体验分享' },
        { id: 'guide', name: '实用攻略' },
        { id: 'camping', name: '露营技巧' }
      ],
      activeCategory: 'all',
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true
    };
  },
  computed: {
    filteredTravelList() {
      if (this.activeCategory === 'all') {
        return this.travelList;
      }
      return this.travelList.filter(travel => travel.category === this.activeCategory);
    }
  },
  onMounted() {
    this.loadTravelList();
  },
  methods: {
    // 加载攻略列表
    async loadTravelList() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        // 这里应该调用API获取攻略数据
        // 暂时使用模拟数据
        const mockData = [
          {
            id: 1,
            title: '江浙沪房车7日游完美路线攻略',
            author: '房车达人小王',
            category: 'route',
            type: '路线规划',
            image: '/static/travel1.jpg',
            views: 2856,
            likes: 156,
            comments: 42,
            date: '2024-03-15',
            description: '详细规划了从杭州出发，经过乌镇、苏州、上海等地的7日房车旅行路线...',
            tags: ['经典路线', '亲子友好', '美食丰富']
          },
          {
            id: 2,
            title: '第一次房车露营必看新手指南',
            author: '露营老司机',
            category: 'guide',
            type: '实用攻略',
            image: '/static/travel2.jpg',
            views: 4523,
            likes: 298,
            comments: 67,
            date: '2024-03-10',
            description: '为房车新手提供全面的露营指南，包括装备选择、营地预订、安全须知...',
            tags: ['新手必看', '安全指南', '装备推荐']
          },
          {
            id: 3,
            title: '云南大理洱海房车露营体验分享',
            author: '旅行爱好者',
            category: 'experience',
            type: '体验分享',
            image: '/static/travel3.jpg',
            views: 3124,
            likes: 187,
            comments: 89,
            date: '2024-03-08',
            description: '在大理洱海边房车露营一周，感受风花雪月的诗意生活...',
            tags: ['风景优美', '浪漫', '摄影圣地']
          }
        ];

        this.travelList = [...this.travelList, ...mockData];

        // 模拟分页逻辑
        this.hasMore = this.page < 3;
        this.page++;

      } catch (error) {
        console.error('加载攻略列表失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 切换分类
    switchCategory(categoryId) {
      this.activeCategory = categoryId;
      this.travelList = [];
      this.page = 1;
      this.hasMore = true;
      this.loadTravelList();
    },

    // 跳转到攻略详情
    goToTravelDetail(id) {
      uni.navigateTo({
        url: `/pages/travel/detail?id=${id}`
      });
    },

    // 下拉刷新
    onPullDownRefresh() {
      this.travelList = [];
      this.page = 1;
      this.hasMore = true;
      this.activeCategory = 'all';
      this.loadTravelList().then(() => {
        uni.stopPullDownRefresh();
      });
    },

    // 上拉加载更多
    onReachBottom() {
      this.loadTravelList();
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #FFFFFF;
    margin-bottom: 16rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.category-tabs {
  display: flex;
  padding: 0 30rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  overflow-x: auto;
  white-space: nowrap;

  .category-tab {
    padding: 30rpx 20rpx;
    position: relative;
    transition: all 0.3s ease;

    &.active {
      .category-text {
        color: #4CAF50;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 4rpx;
        background: #4CAF50;
        border-radius: 2rpx;
      }
    }

    .category-text {
      font-size: 28rpx;
      color: #666666;
      transition: all 0.3s ease;
    }
  }
}

.travel-list {
  padding: 30rpx;

  .travel-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

    .travel-image {
      width: 100%;
      height: 300rpx;
    }

    .travel-info {
      padding: 30rpx;

      .travel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20rpx;

        .travel-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333333;
          flex: 1;
          margin-right: 20rpx;
          line-height: 1.4;
        }

        .travel-type  { .type-tag { padding: 6rpx 12rpx;
            background: #E3F2FD;
            color: #2196F3;
            border-radius: 12rpx;
            font-size: 22rpx; } }
      }

      .travel-meta {
        display: flex;
        gap: 30rpx;
        margin-bottom: 20rpx;
        font-size: 24rpx;
        color: #999999;

        .author,
        .views,
        .date {
          display: flex;
          align-items: center;
          gap: 8rpx;
        }
      }

      .travel-description {
        margin-bottom: 20rpx;
        line-height: 1.6;
        color: #666666;
        font-size: 26rpx;

        .description-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }

      .travel-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 20rpx;

        .tag {
          padding: 8rpx 16rpx;
          background: #FFF3E0;
          color: #FF9800;
          border-radius: 16rpx;
          font-size: 24rpx;
        }
      }

      .travel-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20rpx;
        border-top: 1rpx solid #F0F0F0;

        .like-info,
        .comment-info {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 26rpx;
          color: #666666;

          .like-count,
          .comment-count {
            color: #666666;
          }
        }
      }
    }
  }
}

.loading {
  padding: 60rpx 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>