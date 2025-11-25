<!-- 社区页面 - 瀑布流布局，100%还原原型图 -->
<template>
  <view class="community-page">
    <!-- 页面标题区域 -->
    <view class="page-header">
      <view class="header-content">
        <text class="page-title">种草社区</text>
        <text class="page-subtitle">发现精彩房车生活</text>
      </view>
      <view class="search-icon" @click="handleSearchClick">
        <uni-icons type="search" size="20" color="#FFFFFF" />
      </view>
    </view>

    <!-- 业务推荐区 -->
    <view class="business-recommendations">
      <!-- 营地推荐 -->
      <view class="recommendation-card recommendation-card--camp" @click="handleCampClick">
        <view class="card-content">
          <view class="card-header">
            <uni-icons type="home-filled" size="24" color="#67C23A" />
            <text class="card-title">营地预订</text>
          </view>
          <text class="card-subtitle">附近热门营地 · 立即预订</text>
          <view class="card-action">
            <text class="action-text">立即预订</text>
            <uni-icons type="right" size="16" color="#67C23A" />
          </view>
        </view>
        <view class="card-icon card-icon--camp">
          <text class="icon-text">营</text>
        </view>
      </view>

      <!-- 房车旅游 -->
      <view class="recommendation-card recommendation-card--tour" @click="handleTourClick">
        <view class="card-content">
          <view class="card-header">
            <uni-icons type="location-filled" size="24" color="#4B91FF" />
            <text class="card-title">房车旅游</text>
          </view>
          <text class="card-subtitle">精选线路 · 限时优惠</text>
          <view class="card-action">
            <text class="action-text">查看线路</text>
            <uni-icons type="right" size="16" color="#4B91FF" />
          </view>
        </view>
        <view class="card-icon card-icon--tour">
          <text class="icon-text">游</text>
        </view>
      </view>
    </view>

    <!-- 内容筛选标签 -->
    <view class="content-filters">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-list">
          <view
            v-for="filter in contentFilters"
            :key="filter.value"
            class="filter-item"
            :class="{ 'filter-item--active': activeFilter === filter.value }"
            @click="handleFilterChange(filter.value)"
          >
            <text class="filter-text">{{ filter.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 瀑布流内容区域 -->
    <view class="waterfall-container">
      <view class="waterfall-column">
        <WaterfallItem
          v-for="post in leftColumnPosts"
          :key="post.id"
          :item="post"
          :show-stats="true"
          :is-liked="post.isLiked"
          @click="handlePostClick"
          @like="handlePostLike"
        />
      </view>
      <view class="waterfall-column">
        <WaterfallItem
          v-for="post in rightColumnPosts"
          :key="post.id"
          :item="post"
          :show-stats="true"
          :is-liked="post.isLiked"
          @click="handlePostClick"
          @like="handlePostLike"
        />
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="load-more-section">
      <view v-if="loading" class="loading-state">
        <uni-icons type="spinner-cycle" size="20" color="#CCCCCC" />
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="hasMore" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
      <view v-else-if="postList.length > 0" class="no-more">
        <text class="no-more-text">没有更多内容了</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && postList.length === 0" class="empty-state">
      <uni-empty
        :icon="'info'"
        text="暂无内容"
        :description="'快来分享你的房车生活吧'"
      />
    </view>

    <!-- 发布按钮 -->
    <view class="publish-button" @click="handlePublishClick">
      <uni-icons type="plus" size="24" color="#FFFFFF" />
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';

// 导入组件 - 使用easycom自动导入，无需手动引入
// import WaterfallItem from '@/components/content/WaterfallItem.vue';

interface PostItem {
  id: string | number;
  title: string;
  description?: string;
  image: string;
  tags: string[];
  user: {
    name: string;
    avatar?: string;
    time: string | Date;
  };
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  isLiked: boolean;
}

interface FilterOption {
  label: string;
  value: string;
}

// 页面状态
const postList = ref<PostItem[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const activeFilter = ref('all');

// 内容筛选选项
const contentFilters = ref<FilterOption[]>([
  { label: '推荐', value: 'all' },
  { label: '最新', value: 'latest' },
  { label: '营地', value: 'camp' },
  { label: '攻略', value: 'guide' },
  { label: '改装', value: 'diy' },
  { label: '旅行', value: 'travel' }
]);

// 模拟数据
const mockPosts: PostItem[] = [
  {
    id: 1,
    title: '第一次房车旅行的完美体验，这些地方的风景简直太美了！',
    description: '分享我第一次房车旅行的精彩经历和注意事项，营地设施很全，晚上看星空超赞！',
    image: '/static/default-article.png',
    tags: ['旅行经验', '新手指南', '营地推荐'],
    user: {
      name: '房车达人',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    stats: {
      likes: 128,
      comments: 23,
      views: 856
    },
    isLiked: false
  },
  {
    id: 2,
    title: '房车改装心得分享',
    description: '如何把普通房车改造成移动的家，详细步骤和材料清单都在这里',
    image: '/static/default-article.png',
    tags: ['改装', 'DIY', '经验分享'],
    user: {
      name: '改装专家',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    stats: {
      likes: 256,
      comments: 45,
      views: 1234
    },
    isLiked: true
  },
  {
    id: 3,
    title: '最美房车路线推荐',
    description: '这条绝美的房车路线让人流连忘返，沿途风景让人窒息',
    image: '/static/default-article.png',
    tags: ['路线推荐', '风景', '自驾游'],
    user: {
      name: '旅行家',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    stats: {
      likes: 189,
      comments: 67,
      views: 2341
    },
    isLiked: false
  },
  {
    id: 4,
    title: '房车露营必备装备清单',
    description: '详细整理房车露营所需的装备和用品，新手必备指南',
    image: '/static/default-article.png',
    tags: ['露营', '装备', '新手指南'],
    user: {
      name: '露营达人',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 48 * 60 * 60 * 1000)
    },
    stats: {
      likes: 342,
      comments: 89,
      views: 3456
    },
    isLiked: false
  },
  {
    id: 5,
    title: '川西环线房车自驾攻略',
    description: '详细规划川西环线路线，包含景点介绍、注意事项和费用预算',
    image: '/static/default-article.png',
    tags: ['川西', '攻略', '自驾游'],
    user: {
      name: '西部游侠',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 72 * 60 * 60 * 1000)
    },
    stats: {
      likes: 421,
      comments: 156,
      views: 5678
    },
    isLiked: true
  },
  {
    id: 6,
    title: '房车电池续航实测分享',
    description: '真实测试不同品牌房车电池的续航表现，为选购提供参考',
    image: '/static/default-article.png',
    tags: ['电池', '测评', '选购指南'],
    user: {
      name: '技术控',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 96 * 60 * 60 * 1000)
    },
    stats: {
      likes: 198,
      comments: 78,
      views: 2134
    },
    isLiked: false
  }
];

// 瀑布流左右列数据
const leftColumnPosts = computed(() => postList.value.filter((_, i) => i % 2 === 0));
const rightColumnPosts = computed(() => postList.value.filter((_, i) => i % 2 === 1));

// 生命周期
onLoad(() => {
  loadPosts();
});

onShow(() => {
  // 可以在这里检查登录状态等
});

onPullDownRefresh(() => {
  refreshPosts();
});

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadMore();
  }
});

// 加载帖子列表
const loadPosts = async (isRefresh = false) => {
  if (loading.value) return;

  loading.value = true;

  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isRefresh) {
      postList.value = [];
      page.value = 1;
      hasMore.value = true;
    }

    // 根据筛选条件过滤数据
    let filteredPosts = mockPosts;
    if (activeFilter.value !== 'all') {
      // 这里可以根据筛选条件过滤数据
      filteredPosts = mockPosts.filter(post =>
        post.tags.some(tag =>
          (activeFilter.value === 'camp' && tag.includes('营地')) ||
          (activeFilter.value === 'guide' && tag.includes('攻略')) ||
          (activeFilter.value === 'diy' && tag.includes('改装')) ||
          (activeFilter.value === 'travel' && tag.includes('旅行'))
        )
      );
    }

    // 模拟分页加载
    const pageSize = 6;
    const start = (page.value - 1) * pageSize;
    const end = start + pageSize;
    const pagePosts = filteredPosts.slice(start, end);

    if (isRefresh) {
      postList.value = pagePosts;
    } else {
      postList.value = [...postList.value, ...pagePosts];
    }

    hasMore.value = page.value < 3; // 模拟最多3页数据
    page.value++;

  } catch (error) {
    console.error('加载失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

// 刷新帖子列表
const refreshPosts = () => {
  loadPosts(true);
};

// 加载更多
const loadMore = () => {
  loadPosts();
};

// 处理筛选条件变化
const handleFilterChange = (filterValue: string) => {
  activeFilter.value = filterValue;
  refreshPosts();
};

// 处理帖子点击
const handlePostClick = (post: PostItem) => {
  uni.navigateTo({
    url: `/pages/community/detail?id=${post.id}`
  });
};

// 处理点赞
const handlePostLike = (post: PostItem) => {
  const postIndex = postList.value.findIndex(p => p.id === post.id);
  if (postIndex !== -1) {
    postList.value[postIndex].isLiked = !postList.value[postIndex].isLiked;
    if (postList.value[postIndex].isLiked) {
      postList.value[postIndex].stats.likes++;
    } else {
      postList.value[postIndex].stats.likes--;
    }
  }
};

// 处理搜索点击
const handleSearchClick = () => {
  uni.navigateTo({
    url: '/pages/community/search'
  });
};

// 处理营地推荐点击
const handleCampClick = () => {
  uni.navigateTo({
    url: '/pages/camping/index'
  });
};

// 处理旅游推荐点击
const handleTourClick = () => {
  uni.navigateTo({
    url: '/pages/travel/index'
  });
};

// 处理发布点击
const handlePublishClick = () => {
  // 检查登录状态
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再发布内容',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/index'
          });
        }
      }
    });
    return;
  }

  uni.navigateTo({
    url: '/pages/community/publish'
  });
};
</script>

<style>
.community-page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 30rpx 24rpx;
  background-color: #FF9F29;
  color: #FFFFFF;

  .header-content {
    text-align: center;
  }

  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    margin-bottom: 4rpx;
  }

  .page-subtitle {
    font-size: 24rpx;
    opacity: 0.9;
  }

  .search-icon {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);

    .active {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

.business-recommendations {
  margin: 32rpx 30rpx;
  display: flex;
  gap: 24rpx;

  .recommendation-card {
    flex: 1;
    background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
    border-radius: 20rpx;
    padding: 32rpx;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    border: 2rpx solid #E8E8E8;
    transition: all 0.2s;

    .active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    }

    &--camp {
      border-color: rgba(#67C23A, 0.3);

      .card-icon--camp {
        background: linear-gradient(135deg, #67C23A, #85CE61);
      }
    }

    &--tour {
      border-color: rgba(#4B91FF, 0.3);

      .card-icon--tour {
        background: linear-gradient(135deg, #4B91FF, #73ADFF);
      }
    }

    .card-content {
      position: relative;
      z-index: 2;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 8rpx;
    }

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }

    .card-subtitle {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 24rpx;
      display: block;
    }

    .card-action {
      display: flex;
      align-items: center;
      gap: 4rpx;
    }

    .action-text {
      font-size: 24rpx;
      color: inherit;
      font-weight: 500;
    }
  }

  .card-icon {
    position: absolute;
    top: -24rpx;
    right: -24rpx;
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.9;

    .icon-text {
      font-size: 36rpx;
      font-weight: 700;
      color: #FFFFFF;
    }
  }
}

.content-filters {
  margin: 32rpx 30rpx;

  .filter-scroll {
    white-space: nowrap;
  }

  .filter-list {
    display: flex;
    gap: 16rpx;
  }

  .filter-item {
    flex-shrink: 0;
    padding: 16rpx 32rpx;
    background-color: #FFFFFF;
    border-radius: 50rpx;
    border: 2rpx solid #E8E8E8;
    transition: all 0.2s;

    &--active {
      background-color: #FF9F29;
      border-color: #FF9F29;

      .filter-text {
        color: #FFFFFF;
      }
    }

    .filter-text {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
    }
  }
}

.waterfall-container {
  display: flex;
  gap: 24rpx;
  padding: 0 30rpx;
  margin: 48rpx 0;

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
}

.load-more-section {
  padding: 32rpx 30rpx;
  text-align: center;

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;

    .loading-text {
      font-size: 24rpx;
      color: #999999;
    }
  }

  .load-more  { .load-more-text { font-size: 28rpx;
      color: #FF9F29;
      font-weight: 500; } }

  .no-more  { .no-more-text { font-size: 24rpx;
      color: #999999; } }
}

.empty-state {
  padding: 80rpx 30rpx;
}

.publish-button {
  position: fixed;
  right: 30rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background-color: #FF9F29;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 159, 41, 0.3);
  z-index: 999;
  transition: all 0.2s;

  .active {
    transform: scale(0.9);
    box-shadow: 0 4rpx 12rpx rgba(255, 159, 41, 0.4);
  }
}

.safe-bottom {
  height: 32rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .business-recommendations {
    flex-direction: column;
    margin: 24rpx 24rpx;

    .recommendation-card {
      width: 100%;
    }
  }

  .content-filters {
    margin: 24rpx 24rpx;
  }

  .waterfall-container {
    padding: 0 24rpx;
    margin: 32rpx 0;
  }

  .load-more-section {
    padding: 24rpx 24rpx;
  }

  .publish-button {
    right: 24rpx;
    width: 96rpx;
    height: 96rpx;
  }
}
</style>