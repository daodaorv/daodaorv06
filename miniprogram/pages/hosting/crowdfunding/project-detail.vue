<template>
  <view class="project-detail-page">
    <!-- 顶部图片轮播 -->
    <view class="image-swiper-container">
      <swiper class="image-swiper" :indicator-dots="true" :autoplay="true" :circular="true">
        <swiper-item v-for="(image, index) in project.images" :key="index">
          <image :src="image" class="swiper-image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
      <view class="back-btn" @click="goBack">
        <u-icon name="arrow-left" size="20" color="#FFFFFF"></u-icon>
      </view>
      <view class="status-badge" :class="'status-' + project.status">
        {{ project.statusText }}
      </view>
    </view>

    <!-- 项目基本信息 -->
    <view class="basic-info">
      <text class="project-title">{{ project.title }}</text>

      <view class="model-info">
        <u-icon name="car" size="16" color="#86909C"></u-icon>
        <text>{{ project.model.brand }} {{ project.model.name }}</text>
      </view>

      <!-- 委托方案标识 -->
      <view v-if="project.trusteeshipPlan" class="trusteeship-badge">
        <text class="badge-label">委托方案</text>
        <text class="badge-value" :class="'plan-' + project.trusteeshipPlan">
          {{ trusteeshipPlanName }}
        </text>
      </view>

      <view class="initiator-info">
        <image :src="owner.avatar" class="avatar" mode="aspectFill"></image>
        <view class="initiator-details">
          <text class="initiator-name">{{ owner.name }}</text>
          <text class="initiator-label">发起人</text>
        </view>
      </view>
    </view>

    <!-- 众筹进度 -->
    <view class="progress-section">
      <view class="progress-header">
        <text class="progress-title">众筹进度</text>
        <text class="progress-percent">{{ project.progress }}%</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: project.progress + '%' }"></view>
      </view>
      <view class="progress-stats">
        <view class="stat-item">
          <text class="stat-value">{{ project.soldShares }}</text>
          <text class="stat-label">已售份额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ project.remainingShares }}</text>
          <text class="stat-label">剩余份额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ project.participantCount }}</text>
          <text class="stat-label">参与人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ project.remainingDays }}</text>
          <text class="stat-label">剩余天数</text>
        </view>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="price-section">
      <view class="price-row main">
        <text class="price-label">单份价格</text>
        <view class="price-value">
          <text class="currency">¥</text>
          <text class="amount">{{ (project.pricePerShare / 10000).toFixed(1) }}</text>
          <text class="unit">万</text>
        </view>
      </view>
      <view class="price-row">
        <text class="price-label">车辆购置价</text>
        <text class="price-value-text">¥{{ (project.vehiclePrice / 10000).toFixed(1) }}万</text>
      </view>
      <view class="price-row">
        <text class="price-label">总份额数</text>
        <text class="price-value-text">{{ project.totalShares }}份</text>
      </view>
      <view class="price-tip">
        <u-icon name="info-circle" size="14" color="#FF9800"></u-icon>
        <text>不含税费、上牌等附加费用</text>
      </view>
    </view>

    <!-- 收益预估 -->
    <view class="return-section">
      <view class="section-title">收益预估</view>
      <view class="return-grid">
        <view class="return-item">
          <text class="return-label">预估月收益</text>
          <text class="return-value">¥{{ project.estimatedMonthlyIncome.toLocaleString() }}</text>
        </view>
        <view class="return-item">
          <text class="return-label">预估年化收益率</text>
          <text class="return-value highlight">{{ project.estimatedAnnualReturn }}%</text>
        </view>
      </view>
      <view class="return-tip">
        <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
        <text>以上为整车预估收益，实际收益按份额比例分配</text>
      </view>
    </view>

    <!-- 运营数据面板（托管中显示） -->
    <view v-if="project.status === 'hosting'" class="operation-section">
      <view class="section-title">运营数据</view>
      <view class="operation-grid">
        <view class="operation-item">
          <text class="operation-value">{{ project.operationData?.totalRentDays || 0 }}</text>
          <text class="operation-label">累计出租天数</text>
        </view>
        <view class="operation-item">
          <text class="operation-value">¥{{ (project.operationData?.totalIncome || 0).toLocaleString() }}</text>
          <text class="operation-label">累计收益</text>
        </view>
        <view class="operation-item">
          <text class="operation-value">{{ project.operationData?.maintenanceCount || 0 }}</text>
          <text class="operation-label">维修保养次数</text>
        </view>
        <view class="operation-item">
          <text class="operation-value">{{ project.operationData?.utilizationRate || 0 }}%</text>
          <text class="operation-label">出租率</text>
        </view>
      </view>
    </view>

    <!-- 项目描述 -->
    <view class="description-section">
      <view class="section-title">项目描述</view>
      <text class="description-text">{{ project.description }}</text>
    </view>

    <!-- 车主列表（显示份额占比） -->
    <view v-if="project.participantCount > 0" class="participants-section">
      <view class="section-header">
        <text class="section-title">车主列表</text>
        <text class="participant-count">{{ project.participantCount }}人</text>
      </view>
      <view class="participants-list">
        <view v-for="owner in project.owners" :key="owner.id" class="participant-item">
          <image :src="owner.avatar" class="participant-avatar" mode="aspectFill"></image>
          <view class="participant-info">
            <text class="participant-name">{{ owner.name }}</text>
            <text class="participant-shares">{{ owner.shares }}份 ({{ owner.sharePercent }}%)</text>
          </view>
          <view v-if="owner.isInitiator" class="participant-badge">发起人</view>
        </view>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="risk-notice">
      <view class="notice-header">
        <u-icon name="warning" size="18" color="#FF9800"></u-icon>
        <text class="notice-title">风险提示</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">• 众筹托管为用户自发行为，平台不承担法律责任</text>
        <text class="notice-item">• 实际收益可能与预估存在差异</text>
        <text class="notice-item">• 投资有风险，参与需谨慎</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="share-btn" @click="handleShare">
        <u-icon name="share" size="24" color="#2979FF"></u-icon>
        <text>分享</text>
      </view>
      <button
        v-if="project.status === 'funding' && project.remainingShares > 0"
        class="action-btn primary"
        @click="participate"
      >
        立即参与
      </button>
      <button v-else class="action-btn disabled" disabled>
        {{ project.status === 'success' ? '众筹已完成' : '暂不可参与' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCrowdfundingProjectDetail } from '@/api/crowdfunding'
import type { CrowdfundingProject } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'
import { TRUSTEESHIP_PLANS } from '@/types/trusteeship'

// 数据定义
const projectId = ref('')
const project = ref<CrowdfundingProject>({
  id: '',
  title: '',
  model: {
    id: '',
    name: '',
    brand: '',
    thumbnail: ''
  },
  initiator: {
    id: '',
    name: '',
    avatar: ''
  },
  vehiclePrice: 0,
  totalShares: 0,
  pricePerShare: 0,
  soldShares: 0,
  remainingShares: 0,
  progress: 0,
  participantCount: 0,
  status: 'funding' as any,
  statusText: '',
  startTime: '',
  endTime: '',
  remainingDays: 0,
  estimatedMonthlyIncome: 0,
  estimatedAnnualReturn: 0,
  description: '',
  images: [],
  agreementUrl: '',
  isParticipated: false,
  myShares: 0,
  createdAt: '',
  updatedAt: ''
})

// 计算属性：委托方案名称
const trusteeshipPlanName = computed(() => {
  const plan = TRUSTEESHIP_PLANS.find(p => p.plan === project.value.trusteeshipPlan)
  return plan?.name || '未知方案'
})

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    projectId.value = options.id
    loadProjectDetail()
  }
})

// 加载项目详情
const loadProjectDetail = async () => {
  try {
    const res = await getCrowdfundingProjectDetail(projectId.value)
    if (res.code === 0) {
      project.value = res.data
    }
  } catch (error) {
    logger.error('加载项目详情失败', error)
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

// 参与众筹
const participate = () => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/participate?projectId=${projectId.value}`
  })
}
</script>

<style scoped lang="scss">
.project-detail-page {
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

  .status-badge {
    position: absolute;
    top: 60rpx;
    right: 32rpx;
    padding: 10rpx 24rpx;
    border-radius: 32rpx;
    font-size: 24rpx;
    font-weight: 600;
    backdrop-filter: blur(10px);
    z-index: 10;

    &.status-funding {
      background: rgba(41, 121, 255, 0.9);
      color: #FFFFFF;
    }

    &.status-success {
      background: rgba(0, 181, 120, 0.9);
      color: #FFFFFF;
    }

    &.status-hosting {
      background: rgba(33, 150, 243, 0.9);
      color: #FFFFFF;
    }
  }
}

// 基本信息
.basic-info {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .project-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #1D2129;
    display: block;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }

  .model-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: #F8F9FC;
    border-radius: 32rpx;
    margin-bottom: 20rpx;
    width: fit-content;

    text {
      font-size: 24rpx;
      color: #86909C;
    }
  }

  .initiator-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    background: #F8F9FC;
    border-radius: 12rpx;

    .avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: #E5E6EB;
    }

    .initiator-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .initiator-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }

      .initiator-label {
        font-size: 22rpx;
        color: #86909C;
      }
    }
  }
}

// 众筹进度
.progress-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .progress-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }

    .progress-percent {
      font-size: 32rpx;
      font-weight: 700;
      color: #2979FF;
    }
  }

  .progress-bar {
    height: 16rpx;
    background: #F2F3F5;
    border-radius: 8rpx;
    overflow: hidden;
    margin-bottom: 24rpx;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2979FF 0%, #00B578 100%);
      border-radius: 8rpx;
      transition: width 0.3s;
    }
  }

  .progress-stats {
    display: flex;
    justify-content: space-around;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 24rpx;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #1D2129;
        display: block;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 22rpx;
        color: #86909C;
      }
    }
  }
}

// 价格信息
.price-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #F2F3F5;

    &:last-of-type {
      border-bottom: none;
    }

    &.main {
      padding: 24rpx;
      background: linear-gradient(135deg, rgba(41, 121, 255, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%);
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      border-bottom: none;

      .price-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .currency {
          font-size: 28rpx;
          color: #2979FF;
        }

        .amount {
          font-size: 48rpx;
          font-weight: 700;
          color: #2979FF;
        }

        .unit {
          font-size: 28rpx;
          color: #2979FF;
        }
      }
    }

    .price-label {
      font-size: 26rpx;
      color: #86909C;
    }

    .price-value-text {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }
  }

  .price-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 12rpx;
    margin-top: 16rpx;

    text {
      font-size: 22rpx;
      color: #FF9800;
    }
  }
}

// 收益预估
.return-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .return-grid {
    display: flex;
    gap: 24rpx;
    margin-bottom: 16rpx;

    .return-item {
      flex: 1;
      background: #F8F9FC;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;

      .return-label {
        font-size: 24rpx;
        color: #86909C;
        display: block;
        margin-bottom: 12rpx;
      }

      .return-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 40rpx;
        }
      }
    }
  }

  .return-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 12rpx;

    text {
      font-size: 22rpx;
      color: #2196F3;
    }
  }
}

// 项目描述
.description-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 20rpx;
  }

  .description-text {
    font-size: 26rpx;
    color: #4E5969;
    line-height: 1.8;
  }
}

// 参与者列表
.participants-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }

    .participant-count {
      font-size: 24rpx;
      color: #2979FF;
      padding: 6rpx 16rpx;
      background: rgba(41, 121, 255, 0.1);
      border-radius: 32rpx;
    }
  }

  .participants-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .participant-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 16rpx;
      background: #F8F9FC;
      border-radius: 12rpx;

      .participant-avatar {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: #E5E6EB;
      }

      .participant-name {
        flex: 1;
        font-size: 26rpx;
        color: #1D2129;
      }

      .participant-badge {
        font-size: 22rpx;
        color: #2979FF;
        padding: 4rpx 12rpx;
        background: rgba(41, 121, 255, 0.1);
        border-radius: 8rpx;
      }
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
    gap: 12rpx;

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

  .share-btn {
    width: 88rpx;
    height: 88rpx;
    background: rgba(41, 121, 255, 0.1);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;

    text {
      font-size: 20rpx;
      color: #2979FF;
    }
  }

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

    &.primary {
      background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
      color: #FFFFFF;
    }

    &.disabled {
      background: #E5E6EB;
      color: #86909C;
    }
  }
}
</style>
