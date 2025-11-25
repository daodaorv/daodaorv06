<!-- 瀑布流内容卡片组件 -->
<template>
  <view class="waterfall-item" @click="handleClick">
    <!-- 图片区域 -->
    <view class="waterfall-item__image-container">
      <image
        :src="item.image"
        :mode="imageMode"
        class="waterfall-item__image"
        @load="handleImageLoad"
        @error="handleImageError"
        :style="{ 'aspect-ratio': imageAspectRatio }"
      />

      <!-- 内容标签 -->
      <view v-if="showStats && item.tags && item.tags.length > 0" class="waterfall-item__tags">
        <view
          v-for="(tag, index) in item.tags.slice(0, 2)"
          :key="index"
          class="waterfall-item__tag"
        >
          {{ tag }}
        </view>
        <view v-if="item.tags.length > 2" class="waterfall-item__tag waterfall-item__tag--more">
          +{{ item.tags.length - 2 }}
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="waterfall-item__content">
      <!-- 标题 -->
      <view v-if="item.title" class="waterfall-item__title">
        {{ item.title }}
      </view>

      <!-- 描述 -->
      <view v-if="item.description" class="waterfall-item__description">
        {{ item.description }}
      </view>

      <!-- 用户信息 -->
      <view class="waterfall-item__user">
        <image
          :src="item.user.avatar || '/static/default-avatar.png'"
          class="waterfall-item__avatar"
          mode="aspectFill"
        />
        <view class="waterfall-item__user-info">
          <text class="waterfall-item__username">{{ item.user.name }}</text>
          <text class="waterfall-item__time">{{ formatTime(item.user.time) }}</text>
        </view>
      </view>

      <!-- 互动统计 -->
      <view v-if="showStats" class="waterfall-item__stats">
        <view class="waterfall-item__stat waterfall-item__stat--like" @click.stop="handleLike">
          <uni-icons :type="item.isLiked ? 'heart-filled' : 'heart'" size="14" :color="item.isLiked ? '#FF4D4F' : '#999999'" />
          <text class="waterfall-item__stat-text">{{ formatCount(item.stats.likes) }}</text>
        </view>
        <view class="waterfall-item__stat waterfall-item__stat--comment">
          <uni-icons type="chatbubble" size="14" :color="'#999999'" />
          <text class="waterfall-item__stat-text">{{ formatCount(item.stats.comments) }}</text>
        </view>
        <view class="waterfall-item__stat waterfall-item__stat--view">
          <uni-icons type="eye" size="14" :color="'#999999'" />
          <text class="waterfall-item__stat-text">{{ formatCount(item.stats.views) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface WaterfallItemProps {
  /** 内容数据 */
  item: {
    id: string | number;
    title?: string;
    description?: string;
    image: string;
    tags?: string[];
    user: {
      name: string;
      avatar?: string;
      time: string | Date;
    };
    stats?: {
      likes?: number;
      comments?: number;
      views?: number;
    };
    isLiked?: boolean;
  };
  /** 是否显示统计信息 */
  showStats?: boolean;
  /** 图片模式 */
  imageMode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center';
  /** 图片宽高比 */
  imageAspectRatio?: string;
}

interface WaterfallItemEmits {
  (e: 'click', item: any): void;
  (e: 'like', item: any): void;
  (e: 'image-load', item: any): void;
  (e: 'image-error', item: any): void;
}

const props = withDefaults(defineProps<WaterfallItemProps>(), {
  showStats: true,
  imageMode: 'aspectFill',
  imageAspectRatio: '1'
});

const emit = defineEmits<WaterfallItemEmits>();

// 格式化时间
const formatTime = (time: string | Date): string => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return `${Math.floor(diff / month)}个月前`;
  }
};

// 格式化数量
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}w`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// 处理点击
const handleClick = () => {
  emit('click', props.item);
};

// 处理点赞
const handleLike = () => {
  emit('like', props.item);
};

// 处理图片加载
const handleImageLoad = () => {
  emit('image-load', props.item);
};

// 处理图片错误
const handleImageError = () => {
  emit('image-error', props.item);
};
</script>

<style>
.waterfall-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
  transition: all 0.2s;

  .active {
    transform: scale(0.98);
  }

  &__image-container {
    position: relative;
    overflow: hidden;
    background: #FAFAFA;
  }

  &__image {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__tags {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    display: flex;
    gap: 8rpx;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 8rpx 16rpx;
    background: rgba(0, 0, 0, 0.7);
    color: #FFFFFF;
    border-radius: 12rpx;
    font-size: 20rpx;
    backdrop-filter: blur(4px);

    &--more {
      background: rgba(#FFFFFF, 0.9);
      color: #666666;
    }
  }

  &__content {
    padding: 24rpx;
  }

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    line-height: 1.4;
    margin-bottom: 8rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__description {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 24rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  &__avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    border: 2rpx solid #E8E8E8;
  }

  &__user-info {
    flex: 1;
    min-width: 0;
  }

  &__username {
    font-size: 24rpx;
    font-weight: 500;
    color: #333333;
    display: block;
    margin-bottom: 4rpx;
  }

  &__time {
    font-size: 20rpx;
    color: #999999;
  }

  &__stats {
    display: flex;
    gap: 32rpx;
    align-items: center;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 8rpx;
    transition: all 0.2s;

    &--like:active {
      transform: scale(1.1);
    }
  }

  &__stat-text {
    font-size: 20rpx;
    color: #999999;
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .waterfall-item {
    margin-bottom: 16rpx;

    &__content {
      padding: 16rpx;
    }

    &__title {
      font-size: 24rpx;
    }

    &__description {
      font-size: 20rpx;
      margin-bottom: 16rpx;
    }

    &__avatar {
      width: 50rpx;
      height: 50rpx;
    }

    &__username {
      font-size: 20rpx;
    }

    &__stats {
      gap: 24rpx;
    }
  }
}
</style>