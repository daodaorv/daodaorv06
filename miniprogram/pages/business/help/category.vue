<template>
  <view class="category-page">
    <view class="category-header">
      <text class="category-title">{{ categoryName }}</text>
      <text class="category-count">共 {{ total }} 篇问题</text>
    </view>

    <view v-if="!articleList.length && !loading" class="empty-state">
      <u-icon name="info-circle" color="#CCCCCC" size="36"></u-icon>
      <text>该分类暂时还没有帮助文档</text>
    </view>

    <view class="article-list" v-else>
      <view
        v-for="article in articleList"
        :key="article.id"
        class="article-item"
        @tap="goDetail(article.id)"
      >
        <text class="article-title">{{ article.title }}</text>
        <text class="article-summary">{{ article.summary }}</text>
        <view class="article-meta">
          <view class="meta-left">
            <u-icon name="eye" size="14" color="#999"></u-icon>
            <text>{{ article.views }}</text>
          </view>
          <text class="meta-time">{{ formatDate(article.createdAt) }}</text>
        </view>
      </view>
      <view v-if="loading" class="loading-text">加载中...</view>
      <view v-else-if="finished" class="loading-text">已经到底啦</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { mockGetHelpArticles, type HelpArticle } from '@/api/help'

const categoryId = ref('')
const categoryName = ref('帮助分类')
const articleList = ref<HelpArticle[]>([])
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

const pager = ref({ page: 1, pageSize: 10 })

const loadArticles = async () => {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const res = await mockGetHelpArticles({
      categoryId: categoryId.value,
      page: pager.value.page,
      pageSize: pager.value.pageSize
    })
    total.value = res.total
    if (pager.value.page === 1) {
      articleList.value = res.list
    } else {
      articleList.value = [...articleList.value, ...res.list]
    }
    finished.value = !res.hasMore
    if (res.hasMore) {
      pager.value.page += 1
    }
  } catch (error) {
    logger.error('加载分类文章失败', error)
    uni.showToast({ title: '加载失败，请稍后再试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/business/help/article?id=${id}` })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

onLoad((options: Record<string, any>) => {
  if (options?.id) {
    categoryId.value = options.id
  }
  if (options?.name) {
    categoryName.value = decodeURIComponent(options.name)
    uni.setNavigationBarTitle({ title: categoryName.value })
  }
  if (!categoryId.value) {
    uni.showToast({ title: '缺少分类信息', icon: 'none' })
    return
  }
  loadArticles()
})

onReachBottom(() => {
  loadArticles()
})
</script>

<style scoped lang="scss">
.category-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: $uni-spacing-xl;
}

.category-header {
  padding: $uni-spacing-xl;
  background-color: $uni-bg-color-card;
  margin: 0 $uni-spacing-xl $uni-spacing-xl;
  border-radius: $uni-radius-lg;
  box-shadow: $uni-shadow-card;

  .category-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $uni-text-color;
  }

  .category-count {
    display: block;
    margin-top: $uni-spacing-md;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

.article-list {
  margin: 0 $uni-spacing-xl;
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: 0 $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.article-item {
  padding: $uni-spacing-xl 0;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.7;
  }

  .article-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-md;
  }

  .article-summary {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
    line-height: 1.6;
  }

  .article-meta {
    margin-top: $uni-spacing-xl;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $uni-font-size-xs;
    color: $uni-text-color-placeholder;

    .meta-left {
      display: flex;
      align-items: center;
      gap: 6rpx;
    }
  }
}

.loading-text {
  text-align: center;
  padding: $uni-spacing-xl 0 $uni-spacing-xl;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

.empty-state {
  margin: 160rpx $uni-spacing-xl;
  padding: 60rpx $uni-spacing-xl;
  border-radius: $uni-radius-lg;
  background-color: $uni-bg-color-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $uni-spacing-xl;
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-sm;
  box-shadow: $uni-shadow-card;
}
</style>
