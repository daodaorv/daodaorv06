<template>
  <view class="models-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showSortPopup = true">
        <text class="filter-text">{{ sortOptions.find(o => o.value === currentSort)?.label }}</text>
        <u-icon name="arrow-down" size="14"></u-icon>
      </view>
    </view>

    <!-- 车型列表 -->
    <view class="model-list">
      <view
        v-for="model in models"
        :key="model.id"
        class="model-card"
        @click="goToDetail(model.id)"
      >
        <image :src="model.thumbnail" class="model-img" mode="aspectFill"></image>
        <view v-if="model.isHot" class="hot-badge">
          <u-icon name="fire" size="12" color="#FFFFFF"></u-icon>
          <text>热门</text>
        </view>

        <view class="model-info">
          <view class="model-header">
            <text class="model-name">{{ model.name }}</text>
            <text class="model-brand">{{ model.brand }}</text>
          </view>

          <view class="model-specs">
            <view class="spec-item">
              <u-icon name="account" size="14" color="#86909C"></u-icon>
              <text>{{ model.specifications.seats }}座</text>
            </view>
            <view class="spec-item">
              <u-icon name="car" size="14" color="#86909C"></u-icon>
              <text>{{ model.specifications.fuelType }}</text>
            </view>
          </view>

          <view class="model-price-section">
            <view class="price-row">
              <text class="price-label">购置价</text>
              <view class="price-value">
                <text class="currency">¥</text>
                <text class="amount">{{ (model.purchasePrice / 10000).toFixed(1) }}</text>
                <text class="unit">万</text>
              </view>
            </view>
            <view class="price-row">
              <text class="price-label">建议单份</text>
              <view class="price-value small">
                <text class="amount">{{ (model.suggestedPricePerShare / 10000).toFixed(1) }}</text>
                <text class="unit">万/份</text>
              </view>
            </view>
          </view>

          <view class="model-return">
            <view class="return-item">
              <text class="return-label">预估月收益</text>
              <text class="return-value">¥{{ model.estimatedMonthlyIncome.toLocaleString() }}</text>
            </view>
            <view class="divider"></view>
            <view class="return-item">
              <text class="return-label">预估年化</text>
              <text class="return-value highlight">{{ model.estimatedAnnualReturn }}%</text>
            </view>
          </view>

          <view v-if="model.crowdfundingCount > 0" class="crowdfunding-count">
            已有 <text class="count-num">{{ model.crowdfundingCount }}</text> 个众筹项目
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
    <view v-if="!loading && models.length === 0" class="empty-state">
      <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
      <text class="empty-text">暂无推荐车型</text>
    </view>

    <!-- 排序弹窗 -->
    <u-popup v-model:show="showSortPopup" mode="bottom" :round="20">
      <view class="sort-popup">
        <view class="popup-header">
          <text class="popup-title">排序方式</text>
          <u-icon name="close" size="20" @click="showSortPopup = false"></u-icon>
        </view>
        <view class="sort-options">
          <view
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-option"
            :class="{ active: currentSort === option.value }"
            @click="selectSort(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentSort === option.value" name="checkbox-mark" size="18" color="#9C27B0"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getCrowdfundingModels } from '@/api/crowdfunding'
import type { CrowdfundingVehicleModel } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const models = ref<CrowdfundingVehicleModel[]>([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showSortPopup = ref(false)
const currentSort = ref('hot')

const sortOptions = [
  { label: '热门推荐', value: 'hot' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '收益率从高到低', value: 'return_desc' }
]

// 页面加载
onLoad(() => {
  loadModels()
})

// 下拉刷新
onPullDownRefresh(() => {
  currentPage.value = 1
  hasMore.value = true
  loadModels(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadModels()
  }
})

// 加载车型列表
const loadModels = async (refresh = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getCrowdfundingModels({
      page: currentPage.value,
      pageSize: 10
    })

    if (res.code === 0 && res.data) {
      let list = res.data.list || []

      // 根据排序方式排序
      if (currentSort.value === 'hot') {
        list = list.sort((a, b) => {
          if (a.isHot && !b.isHot) return -1
          if (!a.isHot && b.isHot) return 1
          return b.crowdfundingCount - a.crowdfundingCount
        })
      } else if (currentSort.value === 'price_asc') {
        list = list.sort((a, b) => a.purchasePrice - b.purchasePrice)
      } else if (currentSort.value === 'price_desc') {
        list = list.sort((a, b) => b.purchasePrice - a.purchasePrice)
      } else if (currentSort.value === 'return_desc') {
        list = list.sort((a, b) => b.estimatedAnnualReturn - a.estimatedAnnualReturn)
      }

      if (refresh) {
        models.value = list
      } else {
        models.value = [...models.value, ...list]
      }

      hasMore.value = res.data.hasMore ?? false
    }
  } catch (error) {
    logger.error('加载车型列表失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 选择排序方式
const selectSort = (value: string) => {
  currentSort.value = value
  showSortPopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadModels(true)
}

// 跳转到详情
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/model-detail?id=${id}`
  })
}
</script>

<style scoped lang="scss">
.models-page {
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

// 车型列表
.model-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.model-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  position: relative;

  .model-img {
    width: 100%;
    height: 360rpx;
    background: #F0F0F0;
  }

  .hot-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #FFFFFF;
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  }

  .model-info {
    padding: 24rpx;
  }

  .model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .model-name {
      flex: 1;
      font-size: 32rpx;
      font-weight: 700;
      color: #1D2129;
    }

    .model-brand {
      font-size: 24rpx;
      color: #86909C;
      padding: 4rpx 12rpx;
      background: #F8F9FC;
      border-radius: 8rpx;
    }
  }

  .model-specs {
    display: flex;
    gap: 24rpx;
    margin-bottom: 20rpx;

    .spec-item {
      display: flex;
      align-items: center;
      gap: 6rpx;
      font-size: 24rpx;
      color: #86909C;
    }
  }

  .model-price-section {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%);
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:not(:last-child) {
        margin-bottom: 12rpx;
      }

      .price-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .price-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .currency {
          font-size: 24rpx;
          color: #9C27B0;
        }

        .amount {
          font-size: 36rpx;
          font-weight: 700;
          color: #9C27B0;
        }

        .unit {
          font-size: 24rpx;
          color: #9C27B0;
        }

        &.small {
          .amount {
            font-size: 28rpx;
            font-weight: 600;
          }
        }
      }
    }
  }

  .model-return {
    display: flex;
    align-items: center;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 16rpx 20rpx;
    margin-bottom: 16rpx;

    .return-item {
      flex: 1;
      text-align: center;

      .return-label {
        font-size: 22rpx;
        color: #86909C;
        display: block;
        margin-bottom: 8rpx;
      }

      .return-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 32rpx;
        }
      }
    }

    .divider {
      width: 1rpx;
      height: 40rpx;
      background: #E5E6EB;
    }
  }

  .crowdfunding-count {
    font-size: 24rpx;
    color: #86909C;
    text-align: center;

    .count-num {
      color: #9C27B0;
      font-weight: 600;
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

// 排序弹窗
.sort-popup {
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

  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 0;

    .sort-option {
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
        color: #9C27B0;
        font-weight: 600;
      }
    }
  }
}
</style>
