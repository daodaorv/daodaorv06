<!-- 通知横幅组件 - NoticeBanner -->
<template>
  <view class="notice-banner" :class="{ 'notice-banner--compact': compact }">
    <view class="notice-banner__icon">
      <uni-icons type="sound-filled" :size="iconSize" :color="'#FF9F29'" />
    </view>

    <view class="notice-banner__content">
      <swiper
        class="notice-banner__swiper"
        vertical
        circular
        autoplay
        :interval="3000"
        :duration="500"
        v-if="notices.length > 1"
      >
        <swiper-item v-for="(notice, index) in notices" :key="index">
          <text class="notice-banner__text" @click="handleNoticeClick(notice)">
            {{ notice.text }}
          </text>
        </swiper-item>
      </swiper>

      <text
        v-else-if="notices.length === 1"
        class="notice-banner__text"
        @click="handleNoticeClick(notices[0])"
      >
        {{ notices[0].text }}
      </text>

      <text v-else class="notice-banner__text notice-banner__text--placeholder">
        暂无通知公告
      </text>
    </view>

    <view v-if="showMore" class="notice-banner__more" @click="handleMoreClick">
      <uni-icons type="right" size="16" :color="'#999999'" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Notice {
  id: string | number;
  text: string;
  link?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface NoticeBannerProps {
  /** 通知列表 */
  notices?: Notice[];
  /** 是否显示更多按钮 */
  showMore?: boolean;
  /** 是否紧凑模式 */
  compact?: boolean;
}

interface NoticeBannerEmits {
  (e: 'notice-click', notice: Notice): void;
  (e: 'more-click'): void;
}

const props = withDefaults(defineProps<NoticeBannerProps>(), {
  notices: () => [],
  showMore: true,
  compact: false
});

const emit = defineEmits<NoticeBannerEmits>();

// 计算图标大小
const iconSize = computed(() => {
  return props.compact ? 16 : 18;
});

// 处理通知点击
const handleNoticeClick = (notice: Notice) => {
  emit('notice-click', notice);

  if (notice.link) {
    uni.navigateTo({
      url: notice.link
    });
  }
};

// 处理更多点击
const handleMoreClick = () => {
  emit('more-click');
  // 这里可以导航到通知列表页面
  uni.navigateTo({
    url: '/pages/notice/list'
  });
};
</script>

<style>
.notice-banner {
  display: flex;
  align-items: center;
  background-color: #FF9F29-light;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  margin: 0 30rpx 24rpx;

  &--compact {
    padding: 8rpx 16rpx;
    margin: 0 30rpx 16rpx;
  }

  &__icon {
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    height: 40rpx;
    overflow: hidden;
  }

  &__swiper {
    height: 100%;
  }

  &__text {
    font-size: 24rpx;
    color: #FF9F29;
    line-height: 40rpx;
    display: block;

    &--placeholder {
      color: #999999;
    }
  }

  &__more {
    margin-left: 16rpx;
    padding: 8rpx;
    border-radius: 50%;
    transition: all 0.2s;

    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

/* 紧凑模式下的调整 */
.notice-banner--compact  { .notice-banner__text { font-size: 20rpx; } }

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .notice-banner {
    margin: 0 24rpx 24rpx;

    &__text {
      font-size: 20rpx;
    }
  }
}
</style>