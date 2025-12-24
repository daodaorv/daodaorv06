<template>
  <view class="model-detail-page">
    <!-- 顶部图片轮播 -->
    <view class="image-swiper-container">
      <swiper class="image-swiper" :indicator-dots="true" :autoplay="true" :circular="true">
        <swiper-item v-for="image in model.images" :key="image">
          <image :src="image" class="swiper-image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
      <view class="back-btn" @click="goBack">
        <u-icon name="arrow-left" size="20" color="#FFFFFF"></u-icon>
      </view>
      <view v-if="model.isHot" class="hot-badge">
        <u-icon name="fire" size="14" color="#FFFFFF"></u-icon>
        <text>热门</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="basic-info">
      <view class="info-header">
        <view class="name-section">
          <text class="model-name">{{ model.name }}</text>
          <text class="model-brand">{{ model.brand }}</text>
        </view>
        <view class="share-btn" @click="handleShare">
          <u-icon name="share" size="20" color="#9C27B0"></u-icon>
        </view>
      </view>

      <view class="price-card">
        <view class="price-row main">
          <text class="price-label">车辆购置价</text>
          <view class="price-value">
            <text class="currency">¥</text>
            <text class="amount">{{ (model.purchasePrice / 10000).toFixed(1) }}</text>
            <text class="unit">万</text>
          </view>
        </view>
        <view class="price-tip">
          <u-icon name="info-circle" size="14" color="#FF9800"></u-icon>
          <text>不含税费、上牌等附加费用，需众筹完成后根据实际费用和份额自行缴纳</text>
        </view>
      </view>

      <view class="suggest-card">
        <view class="suggest-header">
          <text class="suggest-title">建议众筹方案</text>
          <text class="suggest-tip">（可自行调整）</text>
        </view>
        <view class="suggest-content">
          <view class="suggest-item">
            <text class="suggest-label">建议份额数</text>
            <text class="suggest-value">{{ model.suggestedShares }}份</text>
          </view>
          <view class="suggest-item">
            <text class="suggest-label">建议单份价格</text>
            <text class="suggest-value primary">¥{{ (model.suggestedPricePerShare / 10000).toFixed(1) }}万</text>
          </view>
        </view>
      </view>

      <view class="return-card">
        <view class="return-item">
          <text class="return-label">预估月收益</text>
          <text class="return-value">¥{{ model.estimatedMonthlyIncome.toLocaleString() }}</text>
        </view>
        <view class="divider"></view>
        <view class="return-item">
          <text class="return-label">预估年化收益率</text>
          <text class="return-value highlight">{{ model.estimatedAnnualReturn }}%</text>
        </view>
      </view>
    </view>

    <!-- 车型参数 -->
    <view class="specs-section">
      <view class="section-title">车型参数</view>
      <view class="specs-grid">
        <view class="spec-item">
          <text class="spec-label">座位数</text>
          <text class="spec-value">{{ model.specifications.seats }}座</text>
        </view>
        <view class="spec-item">
          <text class="spec-label">车身长度</text>
          <text class="spec-value">{{ model.specifications.length }}米</text>
        </view>
        <view class="spec-item">
          <text class="spec-label">车身宽度</text>
          <text class="spec-value">{{ model.specifications.width }}米</text>
        </view>
        <view class="spec-item">
          <text class="spec-label">车身高度</text>
          <text class="spec-value">{{ model.specifications.height }}米</text>
        </view>
        <view class="spec-item">
          <text class="spec-label">核载人数</text>
          <text class="spec-value">{{ model.specifications.capacity }}人</text>
        </view>
        <view class="spec-item">
          <text class="spec-label">燃料类型</text>
          <text class="spec-value">{{ model.specifications.fuelType }}</text>
        </view>
      </view>
    </view>

    <!-- 车型描述 -->
    <view class="description-section">
      <view class="section-title">车型介绍</view>
      <text class="description-text">{{ model.description }}</text>
    </view>

    <!-- 众筹项目 -->
    <view v-if="model.crowdfundingCount > 0" class="projects-section">
      <view class="section-header">
        <text class="section-title">该车型的众筹项目</text>
        <text class="project-count">{{ model.crowdfundingCount }}个</text>
      </view>
      <view class="project-tip">
        <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
        <text>您可以参与现有项目或发起新的众筹</text>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="risk-notice">
      <view class="notice-header">
        <u-icon name="warning" size="18" color="#FF9800"></u-icon>
        <text class="notice-title">重要提示</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">1. 众筹托管为用户自发行为，平台提供服务和监管，不承担法律责任</text>
        <text class="notice-item">2. 车辆购置价格不包含各类税费及上牌等附加费用</text>
        <text class="notice-item">3. 相关费用需用户在众筹完成后根据实际费用和各自份额自行收集缴纳</text>
        <text class="notice-item">4. 叨叨房车可代为监管服务但不承担相应法律责任义务</text>
        <text class="notice-item">5. 投资有风险，参与需谨慎</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="action-btn secondary" @click="viewProjects">
        查看众筹项目
      </button>
      <button class="action-btn primary" @click="startCrowdfunding">
        发起众筹
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCrowdfundingModelDetail } from '@/api/crowdfunding'
import type { CrowdfundingVehicleModel } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const modelId = ref('')
const model = ref<CrowdfundingVehicleModel>({
  id: '',
  name: '',
  brand: '',
  images: [],
  thumbnail: '',
  purchasePrice: 0,
  suggestedShares: 10,
  suggestedPricePerShare: 0,
  estimatedMonthlyIncome: 0,
  estimatedAnnualReturn: 0,
  description: '',
  specifications: {
    seats: 0,
    length: 0,
    width: 0,
    height: 0,
    capacity: 0,
    fuelType: ''
  },
  isHot: false,
  crowdfundingCount: 0
})

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    modelId.value = options.id
    loadModelDetail()
  }
})

// 加载车型详情
const loadModelDetail = async () => {
  try {
    const res = await getCrowdfundingModelDetail(modelId.value)
    if (res.code === 0) {
      model.value = res.data
    }
  } catch (error) {
    logger.error('加载车型详情失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 分享
const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}

// 查看众筹项目
const viewProjects = () => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/projects?modelId=${modelId.value}`
  })
}

// 发起众筹
const startCrowdfunding = () => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/create?modelId=${modelId.value}`
  })
}
</script>

<style scoped lang="scss">
.model-detail-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 120rpx;
}

// 图片轮播
.image-swiper-container {
  position: relative;
  width: 100%;
  height: 600rpx;

  .image-swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-image {
    width: 100%;
    height: 100%;
  }

  .back-btn {
    position: absolute;
    top: 60rpx;
    left: 32rpx;
    width: 64rpx;
    height: 64rpx;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .hot-badge {
    position: absolute;
    top: 60rpx;
    right: 32rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #FFFFFF;
    font-size: 24rpx;
    padding: 10rpx 20rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
    z-index: 10;
  }
}

// 基本信息
.basic-info {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32rpx;

    .name-section {
      flex: 1;

      .model-name {
        font-size: 40rpx;
        font-weight: 700;
        color: #1D2129;
        display: block;
        margin-bottom: 12rpx;
      }

      .model-brand {
        font-size: 26rpx;
        color: #86909C;
        padding: 6rpx 16rpx;
        background: #F8F9FC;
        border-radius: 8rpx;
      }
    }

    .share-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(156, 39, 176, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .price-card {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%);
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .price-label {
        font-size: 28rpx;
        color: #86909C;
      }

      .price-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .currency {
          font-size: 28rpx;
          color: #9C27B0;
        }

        .amount {
          font-size: 48rpx;
          font-weight: 700;
          color: #9C27B0;
        }

        .unit {
          font-size: 28rpx;
          color: #9C27B0;
        }
      }
    }

    .price-tip {
      display: flex;
      align-items: flex-start;
      gap: 8rpx;
      padding: 16rpx;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 12rpx;

      text {
        flex: 1;
        font-size: 22rpx;
        color: #FF9800;
        line-height: 1.6;
      }
    }
  }

  .suggest-card {
    background: #F8F9FC;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;

    .suggest-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 20rpx;

      .suggest-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }

      .suggest-tip {
        font-size: 22rpx;
        color: #86909C;
      }
    }

    .suggest-content {
      display: flex;
      gap: 32rpx;

      .suggest-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12rpx;

        .suggest-label {
          font-size: 24rpx;
          color: #86909C;
        }

        .suggest-value {
          font-size: 32rpx;
          font-weight: 600;
          color: #1D2129;

          &.primary {
            color: #9C27B0;
          }
        }
      }
    }
  }

  .return-card {
    display: flex;
    align-items: center;
    background: #F8F9FC;
    border-radius: 16rpx;
    padding: 24rpx;

    .return-item {
      flex: 1;
      text-align: center;

      .return-label {
        font-size: 24rpx;
        color: #86909C;
        display: block;
        margin-bottom: 12rpx;
      }

      .return-value {
        font-size: 32rpx;
        font-weight: 600;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 40rpx;
        }
      }
    }

    .divider {
      width: 1rpx;
      height: 60rpx;
      background: #E5E6EB;
    }
  }
}

// 车型参数
.specs-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .specs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      padding: 20rpx;
      background: #F8F9FC;
      border-radius: 12rpx;

      .spec-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .spec-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }
    }
  }
}

// 车型描述
.description-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .description-text {
    font-size: 28rpx;
    color: #4E5969;
    line-height: 1.8;
  }
}

// 众筹项目
.projects-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1D2129;
    }

    .project-count {
      font-size: 24rpx;
      color: #9C27B0;
      padding: 6rpx 16rpx;
      background: rgba(156, 39, 176, 0.1);
      border-radius: 32rpx;
    }
  }

  .project-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 12rpx;

    text {
      font-size: 24rpx;
      color: #2196F3;
    }
  }
}

// 风险提示
.risk-notice {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .notice-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .notice-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FF9800;
    }
  }

  .notice-content {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .notice-item {
      font-size: 24rpx;
      color: #86909C;
      line-height: 1.6;
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 20rpx;
  z-index: 100;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }

    &.secondary {
      background: #F8F9FC;
      color: #9C27B0;
    }

    &.primary {
      background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
      color: #FFFFFF;
    }
  }
}
</style>
