<!-- 众筹项目卡片组件 - CrowdfundingProjectCard -->
<template>
  <view class="crowdfunding-project-card" @click="handleCardClick">
    <!-- 项目图片 -->
    <view class="project-image-container">
      <image
        :src="project.image"
        class="project-image"
        mode="aspectFill"
        @load="handleImageLoad"
        @error="handleImageError"
      />

      <!-- 状态标签 -->
      <view class="status-badge" :class="`status-${project.status}`">
        <text class="status-text">{{ getStatusText(project.status) }}</text>
      </view>

      <!-- 风险等级 -->
      <view class="risk-badge">
        <text class="risk-text">{{ project.riskLevel }}风险</text>
      </view>
    </view>

    <!-- 项目信息 -->
    <view class="project-info">
      <!-- 项目标题 -->
      <text class="project-title">{{ project.title }}</text>
      <text class="project-desc">{{ project.description }}</text>

      <!-- 收益信息 -->
      <view class="return-info">
        <view class="return-rate">
          <text class="rate-label">年化收益率</text>
          <text class="rate-value">{{ project.annualReturnMin }}-{{ project.annualReturnMax }}%</text>
        </view>
        <view class="share-price">
          <text class="price-label">份额价格</text>
          <text class="price-value">¥{{ project.sharePrice.toLocaleString() }}</text>
        </view>
      </view>

      <!-- 进度信息 -->
      <view class="progress-info">
        <view class="progress-header">
          <text class="progress-label">众筹进度</text>
          <text class="progress-text">{{ project.currentAmount.toLocaleString() }}/{{ project.targetAmount.toLocaleString() }}</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <view class="progress-stats">
          <text class="progress-percent">{{ progressPercent }}%</text>
          <text class="supporter-count">{{ project.supporterCount }}人支持</text>
          <text class="time-left">{{ getTimeLeftText() }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn detail" @click.stop="goToDetail">
          <text class="btn-text">查看详情</text>
        </view>
        <view class="action-btn invest" @click.stop="investNow">
          <text class="btn-text">立即投资</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface CrowdfundingProject {
  id: string | number;
  title: string;
  description: string;
  image: string;
  status: 'active' | 'success' | 'failed';
  currentAmount: number;
  targetAmount: number;
  annualReturnMin: number;
  annualReturnMax: number;
  sharePrice: number;
  riskLevel: string;
  supporterCount: number;
  startTime: string;
  endTime: string;
}

interface CrowdfundingProjectCardEmits {
  (e: 'click', project: CrowdfundingProject): void;
  (e: 'invest', project: CrowdfundingProject): void;
}

interface CrowdfundingProjectCardProps {
  /** 众筹项目数据 */
  project: CrowdfundingProject;
}

const props = defineProps<CrowdfundingProjectCardProps>();
const emit = defineEmits<CrowdfundingProjectCardEmits>();

// 计算进度百分比
const progressPercent = computed(() => {
  return Math.min(Math.round((props.project.currentAmount / props.project.targetAmount) * 100), 100);
});

// 处理卡片点击
const handleCardClick = () => {
  emit('click', props.project);
};

// 处理图片加载
const handleImageLoad = () => {
  // 图片加载成功
};

// 处理图片错误
const handleImageError = () => {
  // 图片加载错误处理
  console.warn('项目图片加载失败:', props.project.image);
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap = {
    active: '众筹中',
    success: '已成功',
    failed: '已失败'
  };
  return statusMap[status] || '未知';
};

// 获取剩余时间文本
const getTimeLeftText = (): string => {
  const now = new Date();
  const endTime = new Date(props.project.endTime);
  const diffTime = endTime.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return '已结束';
  } else if (diffDays === 1) {
    return '剩余1天';
  } else {
    return `剩余${diffDays}天`;
  }
};

// 跳转到详情页
const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/crowdfunding/detail?id=${props.project.id}`
  });
};

// 立即投资
const investNow = () => {
  emit('invest', props.project);
};
</script>

<style>
.crowdfunding-project-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  .active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
}

.project-image-container {
  position: relative;
  width: 100%;
  height: 400rpx;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
  display: block;
}

.status-badge {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 50rpx;

  &.status-active {
    background: rgba(#FF9F29, 0.9);
  }

  &.status-success {
    background: rgba(#67C23A, 0.9);
  }

  &.status-failed {
    background: rgba(#FF4D4F, 0.9);
  }

  .status-text {
    font-size: 20rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}

.risk-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  background: rgba(0, 0, 0, 0.7);
  padding: 8rpx 16rpx;
  border-radius: 50rpx;

  .risk-text {
    font-size: 20rpx;
    color: #FFFFFF;
    font-weight: 500;
  }
}

.project-info {
  padding: 32rpx;
}

.project-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.project-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
  margin-bottom: 32rpx;
  display: block;
}

.return-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #FAFAFA;
  border-radius: 16rpx;

  .return-rate, .share-price {
    text-align: center;
    flex: 1;
  }

  .rate-label, .price-label {
    font-size: 20rpx;
    color: #999999;
    display: block;
    margin-bottom: 8rpx;
  }

  .rate-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #FF9F29;
    display: block;
  }

  .price-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    display: block;
  }
}

.progress-info {
  margin-bottom: 32rpx;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .progress-label {
      font-size: 24rpx;
      color: #666666;
    }

    .progress-text {
      font-size: 24rpx;
      color: #333333;
      font-weight: 500;
    }
  }

  .progress-bar {
    height: 12rpx;
    background: #FAFAFA;
    border-radius: 50rpx;
    overflow: hidden;
    margin-bottom: 16rpx;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF9F29, #FFB366);
      border-radius: 50rpx;
      transition: width 0.3s;
    }
  }

  .progress-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .progress-percent {
      font-size: 24rpx;
      font-weight: 600;
      color: #FF9F29;
    }

    .supporter-count, .time-left {
      font-size: 20rpx;
      color: #999999;
    }
  }
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;

  .action-btn {
    height: 72rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    .active {
      transform: scale(0.95);
    }

    &.detail {
      background: #FAFAFA;
      border: 1px solid #E8E8E8;

      .btn-text {
        color: #666666;
        font-weight: 500;
      }
    }

    &.invest {
      background: #FF9F29;

      .btn-text {
        color: #FFFFFF;
        font-weight: 600;
      }
    }

    .btn-text {
      font-size: 28rpx;
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .project-info {
    padding: 24rpx;
  }

  .project-image-container {
    height: 320rpx;
  }

  .project-title {
    font-size: 28rpx;
  }

  .project-desc {
    font-size: 20rpx;
  }

  .return-info {
    padding: 16rpx;
  }

  .action-buttons {
    gap: 16rpx;

    .action-btn {
      height: 64rpx;
    }
  }
}
</style>