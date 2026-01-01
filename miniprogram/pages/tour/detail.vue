<template>
  <view class="tour-detail">
    <!-- 图片轮播 -->
    <swiper class="image-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
      <swiper-item v-for="(image, index) in tourDetail.images" :key="index">
        <image class="swiper-image" :src="image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 线路基本信息 -->
    <view class="tour-info-section">
      <view class="title-header">
        <text class="tour-title">{{ tourDetail.title }}</text>
        <view v-if="tourDetail.isHot" class="hot-badge">
          <text class="badge-text">热门</text>
        </view>
      </view>

      <!-- 线路标签 -->
      <view class="tour-tags">
        <text class="tag-item" v-for="tag in tourDetail.tags" :key="tag">{{ tag }}</text>
      </view>

      <!-- 行程信息 -->
      <view class="tour-meta">
        <view class="meta-item">
          <u-icon name="calendar" size="16" color="#FF9F29"></u-icon>
          <text class="meta-text">{{ tourDetail.duration }}天{{ tourDetail.duration - 1 }}晚</text>
        </view>
        <view class="meta-item">
          <u-icon name="account-fill" size="16" color="#FF9F29"></u-icon>
          <text class="meta-text">{{ tourDetail.minPeople }}-{{ tourDetail.maxPeople }}人成团</text>
        </view>
        <view class="meta-item">
          <u-icon name="map-fill" size="16" color="#FF9F29"></u-icon>
          <text class="meta-text">{{ tourDetail.destination }}</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="price-main">
          <text class="price-symbol">¥</text>
          <text class="price-amount">{{ tourDetail.pricePerPerson }}</text>
          <text class="price-unit">/人起</text>
        </view>
        <text class="child-price">儿童（12岁以下）¥{{ tourDetail.childPrice }}</text>
      </view>
    </view>

    <!-- 公告栏 -->
    <AnnouncementBar :content="tourDetail.announcement" />

    <!-- 批次选择 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">选择批次</text>
        <text class="title-tip">（请选择出发日期）</text>
      </view>
      <view class="batch-list">
        <view
          v-for="batch in tourDetail.batches"
          :key="batch.id"
          class="batch-item"
          :class="{ selected: selectedBatch === batch.id, disabled: batch.status !== 'recruiting' }"
          @tap="selectBatch(batch)"
        >
          <view class="batch-header">
            <text class="batch-date">{{ formatDate(batch.departureDate) }}</text>
            <view class="batch-status" :class="batch.status">
              {{ getBatchStatusText(batch.status) }}
            </view>
          </view>
          <view class="batch-info">
            <text class="batch-text">已报名{{ batch.currentPeople }}/{{ batch.maxPeople }}人</text>
            <view class="batch-progress">
              <view class="progress-fill" :style="{ width: getProgressWidth(batch) }"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 行程安排 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">行程安排</text>
      </view>
      <view class="itinerary-list">
        <view v-for="(day, index) in tourDetail.itinerary" :key="index" class="itinerary-item">
          <view class="day-header">
            <view class="day-number">D{{ index + 1 }}</view>
            <text class="day-title">{{ day.title }}</text>
          </view>
          <text class="day-content">{{ day.content }}</text>
          <view v-if="day.highlights && day.highlights.length > 0" class="day-highlights">
            <text class="highlight-label">亮点：</text>
            <text class="highlight-text">{{ day.highlights.join('、') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 费用包含 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">费用包含</text>
      </view>
      <view class="include-list">
        <view class="include-item" v-for="item in tourDetail.priceIncludes" :key="item">
          <u-icon name="checkbox-mark" size="18" color="#67C23A"></u-icon>
          <text class="include-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 费用不含 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">费用不含</text>
      </view>
      <view class="exclude-list">
        <view class="exclude-item" v-for="item in tourDetail.priceExcludes" :key="item">
          <u-icon name="close" size="18" color="#F44336"></u-icon>
          <text class="exclude-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 旅游政策 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">旅游政策</text>
      </view>
      <TextExpandable
        :content="tourPolicyText"
        title="旅游政策"
      >
        <template #collapsed>
          <view class="policy-content-collapsed">
            <!-- 预订须知 -->
            <view class="policy-section">
              <text class="policy-section-title">预订须知</text>
              <view class="notice-item" v-for="(notice, index) in tourDetail.bookingNotices" :key="index">
                <text class="notice-number">{{ index + 1 }}.</text>
                <text class="notice-text">{{ notice }}</text>
              </view>
            </view>

            <!-- 取消政策 -->
            <view class="policy-section">
              <text class="policy-section-title">取消政策</text>
              <view class="policy-item" v-for="policy in tourDetail.cancellationPolicy" :key="policy.condition">
                <view class="policy-condition">
                  <u-icon name="info-circle-fill" size="16" color="#FF9F29"></u-icon>
                  <text class="condition-text">{{ policy.condition }}</text>
                </view>
                <text class="policy-result">{{ policy.result }}</text>
              </view>
            </view>
          </view>
        </template>
        <template #full>
          <view class="policy-content-full">
            <!-- 预订须知 -->
            <view class="policy-section">
              <text class="policy-section-title">预订须知</text>
              <view class="notice-item" v-for="(notice, index) in tourDetail.bookingNotices" :key="index">
                <text class="notice-number">{{ index + 1 }}.</text>
                <text class="notice-text">{{ notice }}</text>
              </view>
            </view>

            <!-- 取消政策 -->
            <view class="policy-section">
              <text class="policy-section-title">取消政策</text>
              <view class="policy-item" v-for="policy in tourDetail.cancellationPolicy" :key="policy.condition">
                <view class="policy-condition">
                  <u-icon name="info-circle-fill" size="16" color="#FF9F29"></u-icon>
                  <text class="condition-text">{{ policy.condition }}</text>
                </view>
                <text class="policy-result">{{ policy.result }}</text>
              </view>
            </view>
          </view>
        </template>
      </TextExpandable>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-price">
          <text class="bar-symbol">¥</text>
          <text class="bar-amount">{{ tourDetail.pricePerPerson }}</text>
        </view>
        <text class="bar-tip">/人起</text>
      </view>
      <view class="bar-actions">
        <button class="icon-btn" @tap="handleShare">
          <u-icon name="share-fill" size="18" color="#FF9F29"></u-icon>
        </button>
        <button class="contact-btn" @tap="contactService">
          <u-icon name="chat" size="18" color="#FF9F29"></u-icon>
          <text>咨询</text>
        </button>
        <button class="book-btn" @tap="bookTour" :disabled="!selectedBatch">
          立即报名
        </button>
      </view>
    </view>

    <!-- 分享面板 -->
    <ShareSheet
      v-model:show="showShareSheet"
      @select="handleShareSelect"
    />

    <!-- 海报预览 -->
    <PosterPreview
      v-model:show="showPosterPopup"
      :poster-image="posterImage"
      @save="savePoster"
    />
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { useShare } from '@/composables/useShare';
import { ShareScene } from '@/types/share';
import ShareSheet from '@/components/share/ShareSheet.vue';
import PosterPreview from '@/components/share/PosterPreview.vue';
import AnnouncementBar from '@/components/common/AnnouncementBar.vue';
import TextExpandable from '@/components/common/TextExpandable.vue';
import { mockTourDetail } from '@/mock';

// 获取路由参数
const tourId = ref('');
const selectedBatch = ref('');

// 线路详情数据
const tourDetail = ref<any>({
  id: '',
  title: '',
  images: [],
  tags: [],
  duration: 0,
  minPeople: 0,
  maxPeople: 0,
  destination: '',
  pricePerPerson: 0,
  childPrice: 0,
  isHot: false,
  announcement: '',
  batches: [],
  itinerary: [],
  priceIncludes: [],
  priceExcludes: [],
  bookingNotices: [],
  cancellationPolicy: []
});

// 分享功能
const {
  showShareSheet,
  showPosterPopup,
  posterImage,
  openShareSheet,
  handleShareSelect,
  savePoster,
  getShareContent
} = useShare({
  title: `【叨叨房车】${tourDetail.value.title}`,
  desc: `${tourDetail.value.duration}天${tourDetail.value.duration - 1}晚 | ${tourDetail.value.destination} | ¥${tourDetail.value.pricePerPerson}/人`,
  imageUrl: tourDetail.value.images[0] || '/static/logo.png',
  path: '/pages/tour/detail',
  scene: ShareScene.TOUR,
  businessId: tourId.value || 'demo_tour',
  query: {
    id: tourId.value || 'demo_tour'
  }
});

onLoad((options: any) => {
  tourId.value = options.id || '';
  loadTourDetail();

  // 处理分享来源
  if (options.share_from) {
    logger.info('来自分享', {
      scene: options.share_scene,
      from: options.share_from,
      businessId: options.share_id
    });
  }
});

// 配置微信分享
onShareAppMessage(() => {
  return getShareContent();
});

// 打开分享面板
const handleShare = () => {
  openShareSheet();
};

// 旅游政策文本（合并预订须知和取消政策）
const tourPolicyText = computed(() => {
  const notices = (tourDetail.value.bookingNotices || [])
    .map((notice: string, index: number) => `${index + 1}. ${notice}`)
    .join('\n');

  const policies = (tourDetail.value.cancellationPolicy || [])
    .map((policy: any) => `${policy.condition}\n${policy.result}`)
    .join('\n\n');

  return `预订须知\n${notices}\n\n取消政策\n${policies}`;
});

// 加载线路详情
const loadTourDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // 使用集中管理的Mock数据
    tourDetail.value = { ...mockTourDetail, id: tourId.value };

  } catch (error) {
    logger.error('加载线路详情失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取批次状态文本
const getBatchStatusText = (status: string) => {
  const map: Record<string, string> = {
    recruiting: '招募中',
    confirmed: '已成团',
    departed: '已出发',
    finished: '已结束'
  };
  return map[status] || '未知';
};

// 计算成团进度
const getProgressWidth = (batch: any) => {
  const percentage = (batch.currentPeople / batch.maxPeople) * 100;
  return `${Math.min(percentage, 100)}%`;
};

// 选择批次
const selectBatch = (batch: any) => {
  if (batch.status !== 'recruiting') {
    uni.showToast({
      title: '该批次不可选择',
      icon: 'none'
    });
    return;
  }
  selectedBatch.value = batch.id;
};

// 联系客服
const contactService = () => {
  uni.makePhoneCall({
    phoneNumber: '400-123-4567'
  });
};

// 预订线路
const bookTour = () => {
  if (!selectedBatch.value) {
    uni.showToast({
      title: '请先选择出发批次',
      icon: 'none'
    });
    return;
  }

  // 跳转到预订页面
  uni.navigateTo({
    url: `/pages/tour/booking?tourId=${tourId.value}&batchId=${selectedBatch.value}`
  });
};
</script>

<style scoped lang="scss">
.tour-detail {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: 120rpx;
}

// 图片轮播
.image-swiper {
  width: 100%;
  height: 500rpx;

  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

// 线路基本信息
.tour-info-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .title-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: $uni-spacing-lg;

    .tour-title {
      flex: 1;
      font-size: 36rpx;
      font-weight: 700;
      color: $uni-text-color;
      line-height: 1.4;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: $uni-spacing-lg;

      .hot-badge {
        background: $uni-color-primary-gradient;
        color: $uni-text-color-inverse;
        font-size: $uni-font-size-xs;
        padding: $uni-spacing-xs $uni-spacing-lg;
        border-radius: $uni-radius-btn;

        .badge-text {
          font-weight: 600;
        }
      }

      .share-btn {
        width: 56rpx;
        height: 56rpx;
        border-radius: $uni-radius-circle;
        background-color: $uni-bg-color-grey;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:active {
          background-color: $uni-border-color;
          transform: scale(0.95);
        }
      }
    }
  }

  .tour-tags {
    display: flex;
    gap: $uni-spacing-md;
    margin-bottom: $uni-spacing-xl;
    flex-wrap: wrap;

    .tag-item {
      font-size: $uni-font-size-xs;
      color: $uni-color-primary;
      background-color: rgba($uni-color-primary, 0.1);
      padding: $uni-spacing-sm $uni-spacing-lg;
      border-radius: $uni-radius-md;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.98);
      }
    }
  }

  .tour-meta {
    display: flex;
    flex-wrap: wrap;
    gap: $uni-spacing-xl;
    margin-bottom: $uni-spacing-xl;

    .meta-item {
      display: flex;
      align-items: center;
      gap: $uni-spacing-sm;

      .meta-text {
        font-size: $uni-font-size-base;
        color: $uni-text-color-secondary;
      }
    }
  }

  .price-section {
    .price-main {
      display: flex;
      align-items: baseline;
      margin-bottom: $uni-spacing-md;

      .price-symbol {
        font-size: $uni-font-size-lg;
        color: $uni-color-error;
        font-weight: 600;
      }

      .price-amount {
        font-size: 56rpx;
        color: $uni-color-error;
        font-weight: 700;
        margin: 0 $uni-spacing-sm;
        font-family: 'DIN Alternate', sans-serif;
      }

      .price-unit {
        font-size: $uni-font-size-lg;
        color: $uni-text-color-placeholder;
      }
    }

    .child-price {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
    }
  }
}

// 通用卡片样式
.section-card {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .section-title {
    display: flex;
    align-items: baseline;
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }

    .title-tip {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
      margin-left: $uni-spacing-md;
    }
  }
}

// 批次选择
.batch-list {
  .batch-item {
    padding: $uni-spacing-xl;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-radius-lg;
    margin-bottom: $uni-spacing-lg;
    border: 2rpx solid transparent;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &.selected {
      background-color: rgba($uni-color-primary, 0.1);
      border-color: $uni-color-primary;
    }

    &.disabled {
      opacity: 0.5;
    }

    &:active:not(.disabled) {
      transform: scale(0.99);
    }

    .batch-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $uni-spacing-lg;

      .batch-date {
        font-size: $uni-font-size-lg;
        font-weight: 600;
        color: $uni-text-color;
      }

      .batch-status {
        font-size: $uni-font-size-xs;
        padding: $uni-spacing-xs $uni-spacing-md;
        border-radius: $uni-radius-md;
        color: $uni-text-color-inverse;

        &.recruiting {
          background-color: $uni-color-success;
        }

        &.confirmed {
          background-color: $uni-color-primary;
        }

        &.departed {
          background-color: $uni-text-color-placeholder;
        }
      }
    }

    .batch-info {
      .batch-text {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-secondary;
        margin-bottom: $uni-spacing-md;
        display: block;
      }

      .batch-progress {
        width: 100%;
        height: 6rpx;
        background-color: $uni-border-color;
        border-radius: 3rpx;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, $uni-color-success 0%, #85CE61 100%);
          border-radius: 3rpx;
          transition: width 0.3s ease;
        }
      }
    }
  }
}

// 行程安排
.itinerary-list {
  .itinerary-item {
    padding-bottom: $uni-spacing-xl;
    margin-bottom: $uni-spacing-xl;
    border-bottom: 2rpx solid $uni-border-color-light;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: $uni-spacing-lg;
      margin-bottom: $uni-spacing-lg;

      .day-number {
        width: 56rpx;
        height: 56rpx;
        background: $uni-color-primary-gradient;
        color: $uni-text-color-inverse;
        border-radius: $uni-radius-circle;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $uni-font-size-sm;
        font-weight: 600;
        flex-shrink: 0;
      }

      .day-title {
        flex: 1;
        font-size: $uni-font-size-lg;
        font-weight: 600;
        color: $uni-text-color;
      }
    }

    .day-content {
      font-size: $uni-font-size-lg;
      color: $uni-text-color-secondary;
      line-height: 1.8;
      margin-bottom: $uni-spacing-lg;
      display: block;
    }

    .day-highlights {
      display: flex;
      gap: $uni-spacing-sm;
      flex-wrap: wrap;

      .highlight-label {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
      }

      .highlight-text {
        font-size: $uni-font-size-sm;
        color: $uni-color-primary;
      }
    }
  }
}

// 费用包含
.include-list {
  .include-item {
    display: flex;
    align-items: flex-start;
    gap: $uni-spacing-md;
    margin-bottom: $uni-spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }

    .include-text {
      flex: 1;
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      line-height: 1.6;
    }
  }
}

// 费用不含
.exclude-list {
  .exclude-item {
    display: flex;
    align-items: flex-start;
    gap: $uni-spacing-md;
    margin-bottom: $uni-spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }

    .exclude-text {
      flex: 1;
      font-size: $uni-font-size-lg;
      color: $uni-text-color-secondary;
      line-height: 1.6;
    }
  }
}

// 旅游政策（合并预订须知和取消政策）
.policy-content-collapsed,
.policy-content-full {
  .policy-section {
    margin-bottom: $uni-spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }

    .policy-section-title {
      display: block;
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-lg;
    }

    // 预订须知样式
    .notice-item {
      display: flex;
      gap: $uni-spacing-md;
      margin-bottom: $uni-spacing-lg;
      line-height: 1.6;
      width: 100%;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-number {
        font-size: $uni-font-size-base;
        color: $uni-color-primary;
        font-weight: 600;
        flex-shrink: 0;
      }

      .notice-text {
        flex: 1;
        font-size: $uni-font-size-base;
        color: $uni-text-color-secondary;
        word-wrap: break-word;
        word-break: break-word;
        min-width: 0;
      }
    }

    // 取消政策样式
    .policy-item {
      padding: $uni-spacing-lg;
      background-color: $uni-bg-color-grey;
      border-radius: $uni-radius-lg;
      margin-bottom: $uni-spacing-lg;
      width: 100%;
      box-sizing: border-box;

      &:last-child {
        margin-bottom: 0;
      }

      .policy-condition {
        display: flex;
        align-items: center;
        gap: $uni-spacing-sm;
        margin-bottom: $uni-spacing-md;
        width: 100%;

        .condition-text {
          flex: 1;
          font-size: $uni-font-size-lg;
          color: $uni-text-color;
          font-weight: 500;
          word-wrap: break-word;
          word-break: break-word;
          min-width: 0;
        }
      }

      .policy-result {
        font-size: $uni-font-size-base;
        color: $uni-text-color-secondary;
        padding-left: 26rpx;
        word-wrap: break-word;
        word-break: break-word;
        display: block;
      }
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color-card;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-spacing-lg $uni-spacing-xl;
  padding-bottom: calc(#{$uni-spacing-lg} + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .bar-left {
    display: flex;
    align-items: baseline;

    .bar-price {
      display: flex;
      align-items: baseline;

      .bar-symbol {
        font-size: $uni-font-size-lg;
        color: $uni-color-error;
        font-weight: 600;
      }

      .bar-amount {
        font-size: 44rpx;
        color: $uni-color-error;
        font-weight: 700;
        margin: 0 4rpx;
        font-family: 'DIN Alternate', sans-serif;
      }
    }

    .bar-tip {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
      margin-left: 4rpx;
    }
  }

  .bar-actions {
    display: flex;
    align-items: center;
    gap: $uni-spacing-lg;

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      height: 60rpx;
      background: none;
      border: none;
      padding: 0;
      transition: all 0.2s ease;

      &::after {
        border: none;
      }

      &:active {
        opacity: 0.7;
        transform: scale(0.95);
      }
    }

    .contact-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: none;
      padding: 0 $uni-spacing-lg;
      line-height: 1.2;
      transition: all 0.2s ease;

      &::after { border: none; }

      &:active {
        opacity: 0.7;
      }

      text {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-secondary;
        margin-top: 4rpx;
      }
    }

    .book-btn {
      background: $uni-color-primary-gradient;
      color: $uni-text-color-inverse;
      font-size: $uni-font-size-lg;
      font-weight: 600;
      padding: 0 $uni-spacing-xl;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: $uni-radius-btn;
      margin: 0;
      box-shadow: $uni-shadow-glow;
      transition: all 0.2s ease;

      &::after { border: none; }

      &:disabled {
        background: $uni-bg-color-grey;
        color: $uni-text-color-placeholder;
        box-shadow: none;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }
}
</style>
