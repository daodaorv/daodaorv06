<template>
  <view class="share-market-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showSortPopup = true">
        <text class="filter-text">{{ sortOptions.find(o => o.value === currentSort)?.label }}</text>
        <u-icon name="arrow-down" size="14"></u-icon>
      </view>
      <view class="filter-item" @click="showPricePopup = true">
        <text class="filter-text">{{ priceFilterText }}</text>
        <u-icon name="arrow-down" size="14"></u-icon>
      </view>
    </view>

    <!-- 份额列表 -->
    <view class="share-list">
      <view
        v-for="share in shares"
        :key="share.id"
        class="share-card"
        @click="goToDetail(share.id)"
      >
        <view class="share-header">
          <image :src="share.project.model.thumbnail" class="share-img" mode="aspectFill"></image>
          <view class="share-info">
            <text class="share-title">{{ share.project.title }}</text>
            <view class="share-meta">
              <text class="meta-text">{{ share.project.model.brand }} {{ share.project.model.name }}</text>
            </view>
            <view class="share-status">
              <view class="status-badge" :class="'status-' + share.project.status">
                {{ share.project.statusText }}
              </view>
            </view>
          </view>
        </view>

        <view class="share-details">
          <view class="detail-row">
            <text class="detail-label">出售份额</text>
            <text class="detail-value">{{ share.shares }}份</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">单份价格</text>
            <view class="price-wrapper">
              <text class="price-value">¥{{ share.pricePerShare.toLocaleString() }}</text>
              <view v-if="share.priceChange !== 0" class="price-change" :class="share.priceChange > 0 ? 'up' : 'down'">
                <u-icon :name="share.priceChange > 0 ? 'arrow-up' : 'arrow-down'" size="12"></u-icon>
                <text>{{ Math.abs(share.priceChange) }}%</text>
              </view>
            </view>
          </view>
          <view class="detail-row">
            <text class="detail-label">参考价格</text>
            <text class="detail-value reference">¥{{ share.referencePrice.toLocaleString() }}</text>
          </view>
        </view>

        <view class="share-stats">
          <view class="stat-item">
            <text class="stat-label">预估年化</text>
            <text class="stat-value highlight">{{ share.project.estimatedAnnualReturn }}%</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">持有时长</text>
            <text class="stat-value">{{ share.holdingDays }}天</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">累计收益</text>
            <text class="stat-value">¥{{ share.totalIncome.toLocaleString() }}</text>
          </view>
        </view>

        <view class="share-footer">
          <view class="seller-info">
            <image :src="share.seller.avatar" class="seller-avatar" mode="aspectFill"></image>
            <text class="seller-name">{{ share.seller.name }}</text>
          </view>
          <view class="total-price">
            <text class="total-label">总价</text>
            <text class="total-value">¥{{ (share.shares * share.pricePerShare).toLocaleString() }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <u-loading-icon mode="circle"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && shares.length === 0" class="empty-state">
      <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
      <text class="empty-text">暂无可交易份额</text>
    </view>

    <!-- 排序弹窗 -->
    <u-popup v-model:show="showSortPopup" mode="bottom" :round="20">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">排序方式</text>
          <u-icon name="close" size="20" @click="showSortPopup = false"></u-icon>
        </view>
        <view class="options-list">
          <view
            v-for="option in sortOptions"
            :key="option.value"
            class="option-item"
            :class="{ active: currentSort === option.value }"
            @click="selectSort(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentSort === option.value" name="checkbox-mark" size="18" color="#2979FF"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 价格筛选弹窗 -->
    <u-popup v-model:show="showPricePopup" mode="bottom" :round="20">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">价格筛选</text>
          <u-icon name="close" size="20" @click="showPricePopup = false"></u-icon>
        </view>
        <view class="options-list">
          <view
            v-for="option in priceOptions"
            :key="option.value"
            class="option-item"
            :class="{ active: currentPriceFilter === option.value }"
            @click="selectPriceFilter(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentPriceFilter === option.value" name="checkbox-mark" size="18" color="#2979FF"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getShareMarket } from '@/api/crowdfunding'
import type { ShareTransaction } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const shares = ref<ShareTransaction[]>([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showSortPopup = ref(false)
const showPricePopup = ref(false)
const currentSort = ref('time')
const currentPriceFilter = ref('all')

const sortOptions = [
  { label: '最新发布', value: 'time' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '收益率最高', value: 'return_desc' }
]

const priceOptions = [
  { label: '全部价格', value: 'all' },
  { label: '低于参考价', value: 'below' },
  { label: '等于参考价', value: 'equal' },
  { label: '高于参考价', value: 'above' }
]

// 价格筛选文本
const priceFilterText = computed(() => {
  return priceOptions.find(o => o.value === currentPriceFilter.value)?.label || '全部价格'
})

// 页面加载
onLoad(() => {
  loadShares()
})

// 下拉刷新
onPullDownRefresh(() => {
  currentPage.value = 1
  hasMore.value = true
  loadShares(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadShares()
  }
})

// 加载份额列表
const loadShares = async (refresh = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getShareMarket({
      sortBy: currentSort.value as any,
      priceFilter: currentPriceFilter.value as any,
      page: currentPage.value,
      pageSize: 10
    })

    if (res.code === 0 && res.data) {
      if (refresh) {
        shares.value = res.data.list || []
      } else {
        shares.value = [...shares.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasMore ?? false
    }
  } catch (error) {
    logger.error('加载份额列表失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 选择排序
const selectSort = (value: string) => {
  currentSort.value = value
  showSortPopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadShares(true)
}

// 选择价格筛选
const selectPriceFilter = (value: string) => {
  currentPriceFilter.value = value
  showPricePopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadShares(true)
}

// 跳转到详情
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/share-detail?id=${id}`
  })
}
</script>

<style scoped lang="scss">
.share-market-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 40rpx;
}

// 筛选栏
.filter-bar {
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background: #F8F9FC;
    border-radius: 32rpx;

    .filter-text {
      font-size: 26rpx;
      color: #1D2129;
    }
  }
}

// 份额列表
.share-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.share-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .share-header {
    display: flex;
    gap: 20rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #F2F3F5;

    .share-img {
      width: 120rpx;
      height: 90rpx;
      border-radius: 12rpx;
      background: #F0F0F0;
    }

    .share-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .share-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .share-meta {
        .meta-text {
          font-size: 24rpx;
          color: #86909C;
        }
      }

      .share-status {
        .status-badge {
          display: inline-block;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          font-weight: 600;

          &.status-funding {
            background: rgba(156, 39, 176, 0.1);
            color: #2979FF;
          }

          &.status-hosting {
            background: rgba(33, 150, 243, 0.1);
            color: #2196F3;
          }

          &.status-success {
            background: rgba(0, 181, 120, 0.1);
            color: #00B578;
          }
        }
      }
    }
  }

  .share-details {
    padding: 24rpx;
    background: #F8F9FC;

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .detail-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;

        &.reference {
          color: #86909C;
          font-weight: 400;
        }
      }

      .price-wrapper {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .price-value {
          font-size: 28rpx;
          font-weight: 700;
          color: #2979FF;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 4rpx;
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          font-weight: 600;

          &.up {
            background: rgba(255, 107, 107, 0.1);
            color: #FF6B6B;
          }

          &.down {
            background: rgba(0, 181, 120, 0.1);
            color: #00B578;
          }
        }
      }
    }
  }

  .share-stats {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #F2F3F5;
    border-bottom: 1rpx solid #F2F3F5;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-label {
        font-size: 22rpx;
        color: #86909C;
        display: block;
        margin-bottom: 8rpx;
      }

      .stat-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 28rpx;
        }
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background: #E5E6EB;
    }
  }

  .share-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;

    .seller-info {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .seller-avatar {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: #E5E6EB;
      }

      .seller-name {
        font-size: 24rpx;
        color: #4E5969;
      }
    }

    .total-price {
      text-align: right;

      .total-label {
        font-size: 22rpx;
        color: #86909C;
        display: block;
        margin-bottom: 4rpx;
      }

      .total-value {
        font-size: 28rpx;
        font-weight: 700;
        color: #2979FF;
      }
    }
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  gap: 20rpx;

  .loading-text {
    font-size: 24rpx;
    color: #86909C;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #86909C;
  }
}

// 弹窗
.popup-content {
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  padding: 32rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1D2129;
    }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 0;

    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #F2F3F5;

      &:last-child {
        border-bottom: none;
      }

      .option-text {
        font-size: 28rpx;
        color: #1D2129;
      }

      &.active .option-text {
        color: #2979FF;
        font-weight: 600;
      }
    }
  }
}
</style>
