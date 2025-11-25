<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">营地推荐</text>
      <text class="subtitle">为您精选优质房车营地</text>
    </view>

    <!-- 营地列表 -->
    <view class="camping-list">
      <view
        v-for="camping in campingList"
        :key="camping.id"
        class="camping-card"
        @tap="goToCampingDetail(camping.id)"
      >
        <image class="camping-image" :src="camping.image || '/static/placeholder-camping.png'" mode="aspectFill"></image>
        <view class="camping-info">
          <view class="camping-header">
            <text class="camping-name">{{ camping.name }}</text>
            <view class="rating">
              <uni-icons type="star-filled" size="12" color="#FFD700"></uni-icons>
              <text class="rating-text">{{ camping.rating }}</text>
            </view>
          </view>

          <view class="location">
            <uni-icons type="location" size="12" color="#999"></uni-icons>
            <text class="location-text">{{ camping.location }}</text>
          </view>

          <view class="facilities">
            <text
              v-for="facility in camping.facilities"
              :key="facility"
              class="facility-tag"
            >
              {{ facility }}
            </text>
          </view>

          <view class="camping-footer">
            <view class="price-info">
              <text class="price-label">参考价格</text>
              <view class="price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ camping.price }}</text>
                <text class="price-unit">/晚</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  data() {
    return {
      campingList: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true
    };
  },
  onMounted() {
    this.loadCampingList();
  },
  methods: {
    // 加载营地列表
    async loadCampingList() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        // 这里应该调用API获取营地数据
        // 暂时使用模拟数据
        const mockData = [
          {
            id: 1,
            name: '杭州西湖房车营地',
            location: '杭州市西湖区',
            image: '/static/camping1.jpg',
            rating: 4.8,
            price: 280,
            facilities: ['水电齐全', 'WiFi', '洗浴设施', '停车场']
          },
          {
            id: 2,
            name: '千岛湖星空营地',
            location: '杭州市淳安县',
            image: '/static/camping2.jpg',
            rating: 4.9,
            price: 350,
            facilities: ['全景天窗', '独立卫浴', '烧烤设施', '观景平台']
          },
          {
            id: 3,
            name: '安吉竹海房车营地',
            location: '湖州市安吉县',
            image: '/static/camping3.jpg',
            rating: 4.7,
            price: 320,
            facilities: ['私密庭院', '天然氧吧', '徒步路线', '溪流垂钓']
          }
        ];

        this.campingList = [...this.campingList, ...mockData];

        // 模拟分页逻辑
        this.hasMore = this.page < 3;
        this.page++;

      } catch (error) {
        console.error('加载营地列表失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 跳转到营地详情
    goToCampingDetail(id) {
      uni.navigateTo({
        url: `/pages/camping/detail?id=${id}`
      });
    },

    // 下拉刷新
    onPullDownRefresh() {
      this.campingList = [];
      this.page = 1;
      this.hasMore = true;
      this.loadCampingList().then(() => {
        uni.stopPullDownRefresh();
      });
    },

    // 上拉加载更多
    onReachBottom() {
      this.loadCampingList();
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
  background: linear-gradient(135deg, #FF9F29 0%, #FFD23F 100%);

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

.camping-list {
  padding: 30rpx;

  .camping-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

    .camping-image {
      width: 100%;
      height: 300rpx;
    }

    .camping-info {
      padding: 30rpx;

      .camping-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20rpx;

        .camping-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333333;
          flex: 1;
          margin-right: 20rpx;
          line-height: 1.4;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .rating-text {
            font-size: 24rpx;
            color: #666666;
          }
        }
      }

      .location {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 20rpx;

        .location-text {
          font-size: 26rpx;
          color: #666666;
        }
      }

      .facilities {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 30rpx;

        .facility-tag {
          padding: 8rpx 16rpx;
          background: #F0F9FF;
          color: #1890FF;
          border-radius: 16rpx;
          font-size: 24rpx;
        }
      }

      .camping-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20rpx;
        border-top: 1rpx solid #F0F0F0;

        .price-info  { .price-label { font-size: 24rpx;
            color: #999999;
            margin-bottom: 8rpx; }.price { display: flex;
            align-items: baseline;

            .price-symbol { font-size: 24rpx;
              color: #FF9F29; }.price-value { font-size: 36rpx;
              font-weight: 600;
              color: #FF9F29;
              margin: 0 4rpx; }.price-unit { font-size: 24rpx;
              color: #999999; } }
        }
      }
    }
  }
}

.loading {
  padding: 60rpx 0;
  text-align: center;
}
</style>