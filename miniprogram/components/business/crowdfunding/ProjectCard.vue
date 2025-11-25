<!-- 众筹项目卡片组件 -->
<template>
  <uni-card
    class="project-card"
    :padding="0"
    :margin="margin"
    :is-shadow="shadow"
    @click="handleClick"
  >
    <!-- 项目图片 -->
    <view class="project-card__image-wrapper">
      <image
        :src="project.image || defaultImage"
        mode="aspectFill"
        class="project-card__image"
        @error="handleImageError"
      />

      <!-- 项目状态 -->
      <view class="project-card__status">
        <uni-tag
          :type="getStatusType(project.status)"
          :text="getStatusText(project.status)"
          size="small"
        />
      </view>

      <!-- 风险等级 -->
      <view class="project-card__risk">
        <uni-tag
          type="error"
          :text="`风险等级：${project.riskLevel || '中'}`"
          size="small"
        />
      </view>
    </view>

    <!-- 项目信息 -->
    <view class="project-card__content">
      <!-- 项目标题 -->
      <view class="project-card__header">
        <text class="project-title">{{ project.title }}</text>
        <view class="annual-return">
          <text class="return-label">年化收益率</text>
          <text class="return-value">{{ project.annualReturnMin }}%-{{ project.annualReturnMax }}%</text>
        </view>
      </view>

      <!-- 项目描述 -->
      <text class="project-description">{{ project.description }}</text>

      <!-- 项目进度 -->
      <view class="project-progress">
        <view class="progress-header">
          <text class="progress-label">众筹进度</text>
          <text class="progress-text">{{ formatPercent(project.currentAmount, project.targetAmount) }}</text>
        </view>
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }"
          ></view>
        </view>
        <view class="progress-details">
          <text class="current-amount">¥{{ formatAmount(project.currentAmount) }}</text>
          <text class="target-amount">目标 ¥{{ formatAmount(project.targetAmount) }}</text>
        </view>
      </view>

      <!-- 项目信息 -->
      <view class="project-info">
        <view class="info-item">
          <text class="info-label">剩余时间</text>
          <text class="info-value">{{ formatRemainingTime(project.endTime) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">单份价格</text>
          <text class="info-value">¥{{ project.sharePrice }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">支持人数</text>
          <text class="info-value">{{ project.supporterCount }}人</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="project-actions">
        <uni-button
          v-if="project.status === 'active'"
          type="primary"
          size="small"
          :loading="loading"
          @click.stop="handleSupport"
        >
          立即支持
        </uni-button>

        <uni-button
          v-else-if="project.status === 'success'"
          type="default"
          size="small"
          @click.stop="handleViewDetails"
        >
          查看详情
        </uni-button>

        <uni-button
          v-else-if="project.status === 'failed'"
          type="default"
          size="small"
          disabled
        >
          众筹失败
        </uni-button>
      </view>
    </view>
  </uni-card>
</template>

<script setup lang="ts">

interface Project {
  id: string | number;
  title: string;
  description: string;
  image?: string;
  status: 'active' | 'success' | 'failed' | 'ended';
  currentAmount: number;
  targetAmount: number;
  annualReturnMin: number;
  annualReturnMax: number;
  sharePrice: number;
  riskLevel?: string;
  supporterCount: number;
  startTime: string;
  endTime: string;
}

interface ProjectCardProps {
  /** 项目信息 */
  project: Project;
  /** 外边距 */
  margin?: string | number;
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 是否加载中 */
  loading?: boolean;
}

const props = withDefaults(defineProps<ProjectCardProps>(), {
  margin: '0 0 30rpx 0',
  shadow: true,
  loading: false
});

const emit = defineEmits<{
  click: [project: Project];
  support: [project: Project];
  'view-details': [project: Project];
  'image-error': [project: Project, error: Event];
}>();

// 默认图片
const defaultImage = '/static/default-project.png';

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap = {
    active: 'primary',
    success: 'success',
    failed: 'error',
    ended: 'default'
  };
  return typeMap[status as keyof typeof typeMap] || 'default';
};

// 获取状态文字
const getStatusText = (status: string) => {
  const textMap = {
    active: '众筹中',
    success: '已成功',
    failed: '已失败',
    ended: '已结束'
  };
  return textMap[status as keyof typeof textMap] || '未知';
};

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万';
  }
  return amount.toString();
};

// 格式化百分比
const formatPercent = (current: number, target: number) => {
  if (target === 0) return '0%';
  return Math.round((current / target) * 100) + '%';
};

// 格式化剩余时间
const formatRemainingTime = (endTime: string) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return '已结束';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `剩余${days}天`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `剩余${hours}小时`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `剩余${minutes}分钟`;
};

// 处理点击
const handleClick = () => {
  emit('click', props.project);
};

// 处理支持
const handleSupport = () => {
  emit('support', props.project);
};

// 处理查看详情
const handleViewDetails = () => {
  emit('view-details', props.project);
};

// 处理图片错误
const handleImageError = (error: Event) => {
  emit('image-error', props.project, error);
};
</script>

<style>
.project-card {
  cursor: pointer;
  transition: all 0.3s ease;

  .hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
  }

  // 图片区域
  &__image-wrapper {
    position: relative;
    width: 100%;
    height: 320rpx;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .hover &__image {
    transform: scale(1.05);
  }

  // 状态标签
  &__status {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    z-index: 2;
  }

  &__risk {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    z-index: 2;
  }

  // 内容区域
  &__content {
    padding: 30rpx;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
  }

  .project-title {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--text-primary, #000000);
    line-height: 1.4;
    flex: 1;
    margin-right: 16rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .annual-return {
    text-align: right;
    flex-shrink: 0;
  }

  .return-label {
    display: block;
    font-size: 22rpx;
    color: var(--text-secondary, #666666);
    margin-bottom: 4rpx;
  }

  .return-value {
    font-size: 32rpx;
    font-weight: 700;
    color: var(--error-color, #FF4D4F);
  }

  .project-description {
    font-size: 26rpx;
    color: var(--text-secondary, #666666);
    line-height: 1.5;
    margin-bottom: 24rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  // 进度条
  .project-progress {
    margin-bottom: 24rpx;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
  }

  .progress-label {
    font-size: 26rpx;
    color: var(--text-regular, #333333);
  }

  .progress-text {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--primary-color, #FF9F29);
  }

  .progress-bar {
    height: 12rpx;
    background-color: var(--bg-color-light, #f0f0f0);
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 8rpx;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color, #FF9F29) 0%, #FFB84D 100%);
    border-radius: 6rpx;
    transition: width 0.6s ease;
  }

  .progress-details {
    display: flex;
    justify-content: space-between;
    font-size: 24rpx;
  }

  .current-amount {
    color: var(--text-primary, #000000);
    font-weight: 600;
  }

  .target-amount {
    color: var(--text-placeholder, #999999);
  }

  // 项目信息
  .project-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30rpx;
    padding: 20rpx;
    background-color: var(--bg-color-light, #f8f8f8);
    border-radius: 12rpx;
  }

  .info-item {
    text-align: center;
    flex: 1;
  }

  .info-label {
    display: block;
    font-size: 22rpx;
    color: var(--text-placeholder, #999999);
    margin-bottom: 4rpx;
  }

  .info-value {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--text-primary, #000000);
  }

  // 操作按钮
  .project-actions {
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .project-card {
    &__image-wrapper {
      height: 280rpx;
    }

    &__content {
      padding: 24rpx;
    }

    .project-title {
      font-size: 32rpx;
    }

    .project-description {
      font-size: 24rpx;
      margin-bottom: 20rpx;
    }

    .return-value {
      font-size: 28rpx;
    }

    .project-info {
      padding: 16rpx;
      margin-bottom: 24rpx;
    }

    .info-label {
      font-size: 20rpx;
    }

    .info-value {
      font-size: 24rpx;
    }
  }
}
</style>