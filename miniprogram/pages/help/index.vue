<template>
  <view class="help-page">
    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box" @tap="goToSearch">
        <uni-icons type="search" size="20" color="#999"></uni-icons>
        <text class="search-placeholder">搜索帮助内容...</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-links" v-if="popularArticles.length > 0">
      <view class="section-title">
        <text class="title-text">热门帮助</text>
        <view class="more-btn" @tap="goToPopular">
          <text class="more-text">查看更多</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>
      <view class="link-grid">
        <view
          v-for="article in popularArticles.slice(0, 6)"
          :key="article.id"
          class="link-item"
          @tap="goToArticle(article.id)"
        >
          <view class="link-icon">
            <uni-icons type="help" size="24" color="#FF9F29"></uni-icons>
          </view>
          <text class="link-text">{{ article.title }}</text>
        </view>
      </view>
    </view>

    <!-- 分类导航 -->
    <view class="categories-section">
      <view class="section-title">
        <text class="title-text">帮助分类</text>
      </view>
      <view class="category-list">
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @tap="goToCategory(category.id, category.name)"
        >
          <view class="category-icon" :style="{ backgroundColor: category.color + '20' }">
            <uni-icons
              :type="category.icon || 'folder'"
              size="28"
              :color="category.color || '#FF9F29'"
            ></uni-icons>
          </view>
          <view class="category-info">
            <text class="category-name">{{ category.name }}</text>
            <text class="category-desc">{{ category.description }}</text>
            <view class="category-meta" v-if="category.articleCount !== undefined">
              <text class="article-count">{{ category.articleCount }}篇文章</text>
            </view>
          </view>
          <view class="category-arrow">
            <uni-icons type="right" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新文章 -->
    <view class="recent-articles" v-if="recentArticles.length > 0">
      <view class="section-title">
        <text class="title-text">最新帮助</text>
        <view class="more-btn" @tap="goToArticleList">
          <text class="more-text">查看更多</text>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>
      <view class="article-list">
        <view
          v-for="article in recentArticles"
          :key="article.id"
          class="article-item"
          @tap="goToArticle(article.id)"
        >
          <view class="article-content">
            <view class="article-header">
              <text class="article-title">{{ article.title }}</text>
              <view class="article-tags" v-if="article.tags && article.tags.length > 0">
                <text
                  v-for="tag in article.tags.slice(0, 2)"
                  :key="tag.id"
                  class="tag"
                  :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                >
                  {{ tag.name }}
                </text>
              </view>
            </view>
            <text class="article-summary" v-if="article.summary">{{ article.summary }}</text>
            <view class="article-meta">
              <text class="meta-item">{{ formatDate(article.createdAt) }}</text>
              <text class="meta-item">{{ article.viewCount }}次阅读</text>
            </view>
          </view>
          <image
            v-if="article.coverImage"
            class="article-image"
            :src="article.coverImage"
            mode="aspectFill"
          ></image>
        </view>
      </view>
    </view>

    <!-- 联系客服 -->
    <view class="contact-section">
      <view class="contact-card">
        <view class="contact-header">
          <uni-icons type="contact" size="32" color="#FF9F29"></uni-icons>
          <text class="contact-title">联系客服</text>
        </view>
        <text class="contact-desc">如果以上内容没有解决您的问题，请联系我们的客服团队</text>
        <view class="contact-buttons">
          <button class="contact-btn primary" @tap="contactOnline">
            <uni-icons type="chat" size="16" color="#fff"></uni-icons>
            <text class="btn-text">在线客服</text>
          </button>
          <button class="contact-btn secondary" @tap="contactPhone">
            <uni-icons type="phone" size="16" color="#FF9F29"></uni-icons>
            <text class="btn-text">电话客服</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { helpApi } from '@/api/help';

// 状态管理
const categories = ref([]);
const popularArticles = ref([]);
const recentArticles = ref([]);

// 页面加载
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadPopularArticles(),
    loadRecentArticles()
  ]);
});

// 加载帮助分类
const loadCategories = async () => {
  try {
    const response = await helpApi.getCategoriesWithStats();
    categories.value = response.data;
  } catch (error) {
    console.error('加载帮助分类失败:', error);
  }
};

// 加载热门文章
const loadPopularArticles = async () => {
  try {
    const response = await helpApi.getPopularArticles(6);
    popularArticles.value = response.data;
  } catch (error) {
    console.error('加载热门文章失败:', error);
  }
};

// 加载最新文章
const loadRecentArticles = async () => {
  try {
    const response = await helpApi.getArticles(1, 5);
    recentArticles.value = response.data.articles;
  } catch (error) {
    console.error('加载最新文章失败:', error);
  }
};

// 跳转到搜索页面
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/help/search'
  });
};

// 跳转到分类页面
const goToCategory = (categoryId, categoryName) => {
  uni.navigateTo({
    url: `/pages/help/category?id=${categoryId}&name=${encodeURIComponent(categoryName)}`
  });
};

// 跳转到文章详情
const goToArticle = (articleId) => {
  uni.navigateTo({
    url: `/pages/help/article?id=${articleId}`
  });
};

// 跳转到热门文章
const goToPopular = () => {
  uni.navigateTo({
    url: '/pages/help/popular'
  });
};

// 跳转到文章列表
const goToArticleList = () => {
  uni.navigateTo({
    url: '/pages/help/list'
  });
};

// 联系在线客服
const contactOnline = () => {
  uni.switchTab({
    url: '/pages/service/index'
  });
};

// 联系电话客服
const contactPhone = () => {
  uni.makePhoneCall({
    phoneNumber: '400-123-4567' // 这里应该从配置中获取
  });
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
.help-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 搜索区域
.search-section {
  background-color: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .search-box {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx 32rpx;
    background-color: #f8f8f8;
    border-radius: 50rpx;

    .search-placeholder {
      font-size: 28rpx;
      color: #999;
    }
  }
}

// 通用标题样式
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx 24rpx;

  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  .more-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;

    .more-text {
      font-size: 26rpx;
      color: #999;
    }
  }
}

// 快捷入口
.quick-links {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .link-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32rpx;
    padding: 32rpx;

    .link-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
      padding: 32rpx 16rpx;
      background-color: #fafafa;
      border-radius: 16rpx;
      transition: all 0.3s ease;

      .active {
        transform: scale(0.95);
        background-color: #f0f0f0;
      }

      .link-icon {
        width: 64rpx;
        height: 64rpx;
        background-color: rgba(255, 159, 41, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .link-text {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.8);
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}

// 分类导航
.categories-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .category-list {
    padding: 0 32rpx 32rpx;

    .category-item {
      display: flex;
      align-items: center;
      gap: 24rpx;
      padding: 32rpx 0;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      .category-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .category-info {
        flex: 1;

        .category-name {
          font-size: 30rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          margin-bottom: 8rpx;
          display: block;
        }

        .category-desc {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
          line-height: 1.4;
          margin-bottom: 8rpx;
          display: block;
        }

        .category-meta  { .article-count { font-size: 22rpx;
            color: #999; } }
      }

      .category-arrow {
        padding: 8rpx;
      }
    }
  }
}

// 最新文章
.recent-articles {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .article-list {
    padding: 0 32rpx 32rpx;

    .article-item {
      display: flex;
      gap: 24rpx;
      padding: 32rpx 0;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      .article-content {
        flex: 1;

        .article-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12rpx;

          .article-title {
            font-size: 30rpx;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9);
            line-height: 1.4;
            flex: 1;
            margin-bottom: 8rpx;
          }

          .article-tags {
            display: flex;
            flex-direction: column;
            gap: 8rpx;
            margin-left: 16rpx;

            .tag {
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
              font-size: 20rpx;
              white-space: nowrap;
            }
          }
        }

        .article-summary {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
          line-height: 1.5;
          margin-bottom: 16rpx;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .article-meta {
          display: flex;
          gap: 24rpx;

          .meta-item {
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .article-image {
        width: 160rpx;
        height: 120rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
      }
    }
  }
}

// 联系客服
.contact-section {
  padding: 0 32rpx;

  .contact-card {
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    border-radius: 20rpx;
    padding: 40rpx 32rpx;

    .contact-header {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .contact-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #ffffff;
      }
    }

    .contact-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      margin-bottom: 32rpx;
    }

    .contact-buttons {
      display: flex;
      gap: 24rpx;

      .contact-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        border: none;

        &::after {
          border: none;
        }

        &.primary {
          background-color: #ffffff;
          color: #FF9F29;

          .btn-text {
            color: #FF9F29;
          }
        }

        &.secondary {
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;

          .btn-text {
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>