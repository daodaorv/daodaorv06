<template>
  <view class="special-offer-detail">
    <!-- 图片轮播 -->
    <swiper class="image-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
      <swiper-item v-for="(image, index) in offerDetail.vehicle.images" :key="index">
        <image class="swiper-image" :src="image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 套餐基本信息 -->
    <view class="offer-info-section">
      <view class="route-header">
        <view class="route-main">
          <text class="route-text">{{ offerDetail.route.from }} → {{ offerDetail.route.to }}</text>
          <view class="special-badge">
            <text class="badge-text">特惠套餐</text>
          </view>
        </view>
        <view class="rental-days">
          <text class="days-text">{{ offerDetail.rentalDays }}天{{ offerDetail.rentalDays - 1 }}晚</text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="price-main">
          <text class="price-symbol">¥</text>
          <text class="price-amount">{{ offerDetail.packagePrice }}</text>
          <text class="price-unit">/套餐</text>
        </view>
        <view class="price-detail">
          <text class="original-price" v-if="offerDetail.originalPrice">原价¥{{ offerDetail.originalPrice }}</text>
          <text class="save-amount">已省¥{{ offerDetail.originalPrice - offerDetail.packagePrice }}</text>
        </view>
      </view>

      <!-- 名额提示 -->
      <view class="quota-tip" :class="{ warning: offerDetail.remainingQuota <= 5 }">
        <u-icon name="info" size="16" :color="offerDetail.remainingQuota <= 5 ? '#F44336' : '#FF9F29'"></u-icon>
        <text class="tip-text">
          {{ offerDetail.remainingQuota <= 5 ? '名额紧张！' : '' }}
          仅剩{{ offerDetail.remainingQuota }}个名额，先订先得
        </text>
      </view>
    </view>

    <!-- 公告栏 -->
    <AnnouncementBar :content="offerDetail.announcement" />

    <!-- 车辆信息 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">车辆信息</text>
      </view>
      <view class="vehicle-info">
        <text class="vehicle-name">{{ offerDetail.vehicle.name }}</text>
        <view class="vehicle-specs">
          <view class="spec-item" v-for="(spec, index) in offerDetail.vehicle.specifications" :key="`spec-${index}`">
            <text class="spec-label">{{ spec.label }}</text>
            <text class="spec-value">{{ spec.value }}</text>
          </view>
        </view>
        <view class="vehicle-features">
          <text class="feature-tag" v-for="(feature, index) in offerDetail.vehicle.features" :key="`feature-${index}`">
            {{ feature }}
          </text>
        </view>
      </view>
    </view>

    <!-- 行程信息 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">行程安排</text>
        <text class="title-tip">（固定路线，不可更改）</text>
      </view>
      <view class="route-detail">
        <!-- 取车信息 -->
        <view class="route-item">
          <view class="route-icon pickup">
            <u-icon name="map-fill" size="20" color="#FFFFFF"></u-icon>
          </view>
          <view class="route-content">
            <text class="route-label">取车门店</text>
            <text class="route-value">{{ offerDetail.pickupStore.name }}</text>
            <text class="route-address">{{ offerDetail.pickupStore.address }}</text>
          </view>
        </view>

        <!-- 连接线 -->
        <view class="route-line"></view>

        <!-- 还车信息 -->
        <view class="route-item">
          <view class="route-icon return">
            <u-icon name="pushpin-fill" size="20" color="#FFFFFF"></u-icon>
          </view>
          <view class="route-content">
            <text class="route-label">还车门店</text>
            <text class="route-value">{{ offerDetail.returnStore.name }}</text>
            <text class="route-address">{{ offerDetail.returnStore.address }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 可选时间段 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">可选取车时间</text>
      </view>
      <view class="time-range">
        <view class="time-item">
          <u-icon name="calendar" size="18" color="#FF9F29"></u-icon>
          <text class="time-text">{{ formatDate(offerDetail.availableTimeRange.start) }} 至 {{ formatDate(offerDetail.availableTimeRange.end) }}</text>
        </view>
        <text class="time-tip">预订时可在此时间段内选择取车日期</text>
      </view>
    </view>

    <!-- 套餐包含 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">套餐包含</text>
      </view>
      <view class="package-includes">
        <view class="include-item" v-for="item in offerDetail.packageIncludes" :key="item.name">
          <u-icon name="checkbox-mark" size="18" color="#67C23A"></u-icon>
          <text class="include-text">{{ item.name }}</text>
          <text class="include-desc" v-if="item.description">{{ item.description }}</text>
        </view>
      </view>
    </view>

    <!-- 预订须知 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">预订须知</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="(notice, index) in offerDetail.bookingNotices" :key="index">
          <text class="notice-number">{{ index + 1 }}.</text>
          <text class="notice-text">{{ notice }}</text>
        </view>
      </view>
    </view>

    <!-- 取消政策 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-text">取消政策</text>
      </view>
      <view class="policy-list">
        <view class="policy-item" v-for="policy in offerDetail.cancellationPolicy" :key="policy.condition">
          <view class="policy-condition">
            <u-icon name="info-circle-fill" size="16" color="#FF9F29"></u-icon>
            <text class="condition-text">{{ policy.condition }}</text>
          </view>
          <text class="policy-result">{{ policy.result }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-price">
          <text class="bar-symbol">¥</text>
          <text class="bar-amount">{{ offerDetail.packagePrice }}</text>
        </view>
        <text class="bar-tip">套餐价</text>
      </view>
      <view class="bar-actions">
        <button class="icon-btn" @tap="handleShare">
          <u-icon name="share-fill" size="18" color="#FF9F29"></u-icon>
        </button>
        <button class="contact-btn" @tap="contactService">
          <u-icon name="chat" size="18" color="#FF9F29"></u-icon>
          <text>咨询</text>
        </button>
        <button class="book-btn" @tap="bookOffer">
          立即预订
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
import { ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { useShare } from '@/composables/useShare';
import { ShareScene } from '@/types/share';
import ShareSheet from '@/components/share/ShareSheet.vue';
import PosterPreview from '@/components/share/PosterPreview.vue';
import AnnouncementBar from '@/components/common/AnnouncementBar.vue';

// 获取路由参数
const offerId = ref('');

// 套餐详情数据
const offerDetail = ref<any>({
  id: '',
  route: {
    from: '',
    to: ''
  },
  vehicle: {
    name: '',
    images: [],
    specifications: [],
    features: []
  },
  packagePrice: 0,
  originalPrice: 0,
  rentalDays: 0,
  remainingQuota: 0,
  totalQuota: 0,
  pickupStore: {
    name: '',
    address: ''
  },
  returnStore: {
    name: '',
    address: ''
  },
  availableTimeRange: {
    start: '',
    end: ''
  },
  announcement: '',
  packageIncludes: [],
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
  title: `【叨叨房车】${offerDetail.value.route.from}→${offerDetail.value.route.to} 特惠套餐`,
  desc: `¥${offerDetail.value.packagePrice}/${offerDetail.value.rentalDays}天，仅剩${offerDetail.value.remainingQuota}个名额`,
  imageUrl: offerDetail.value.vehicle.images[0] || '/static/logo.png',
  path: '/pages/special-offer/detail',
  scene: ShareScene.SPECIAL_OFFER,
  businessId: offerId.value || 'demo_offer',
  query: {
    id: offerId.value || 'demo_offer'
  }
});

onLoad((options: any) => {
  offerId.value = options.id || '';
  loadOfferDetail();

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

// 加载套餐详情
const loadOfferDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // Mock数据
    const mockDetail = {
      id: offerId.value,
      route: {
        from: '杭州',
        to: '千岛湖'
      },
      vehicle: {
        name: '依维柯欧胜C型房车',
        images: [
          '/static/logo.png',
          '/static/logo.png',
          '/static/logo.png',
          '/static/logo.png'
        ],
        specifications: [
          { label: '车型', value: 'C型房车' },
          { label: '座位数', value: '4-6座' },
          { label: '变速箱', value: '自动挡' },
          { label: '燃料类型', value: '柴油' },
          { label: '车长', value: '5.99米' },
          { label: '核载人数', value: '6人' }
        ],
        features: ['独立卫浴', '太阳能系统', '驻车空调', '智能导航', '倒车影像', '冰箱', '微波炉', '热水器']
      },
      packagePrice: 1280,
      originalPrice: 1680,
      rentalDays: 3,
      remainingQuota: 3,
      totalQuota: 10,
      pickupStore: {
        name: '杭州西湖门店',
        address: '浙江省杭州市西湖区文三路123号'
      },
      returnStore: {
        name: '千岛湖景区门店',
        address: '浙江省杭州市淳安县千岛湖镇环湖路88号'
      },
      availableTimeRange: {
        start: '2025-12-01',
        end: '2025-12-31'
      },
      announcement: '【限时特惠】杭州-千岛湖专线套餐，仅剩3个名额！本套餐为固定路线，不支持更改取还车门店。春节期间（1月25日-2月10日）不可用。预订成功后不可退改，请确认行程后再下单。',
      packageIncludes: [
        { name: '车辆租金', description: '3天2晚固定租期' },
        { name: '基础保险', description: '第三者责任险' },
        { name: '异地还车费', description: '杭州-千岛湖单程' },
        { name: '首箱燃油', description: '满油交付' },
        { name: '不限公里数', description: '无里程限制' },
        { name: '24小时道路救援', description: '全程保障' }
      ],
      bookingNotices: [
        '本套餐为特惠固定套餐，取车门店、还车门店、租期均不可更改',
        '取车时间可在可选时间段内自由选择，系统将自动计算还车时间',
        '必须选择保险方案（基础险/标准险/全险），保险费用另计',
        '可选择附加服务（如儿童座椅、GPS等），费用另计',
        '取车时需支付押金，还车后无违章自动退还',
        '驾驶人需持有效驾驶证满1年以上',
        '名额有限，预订成功后不可退改，请谨慎下单'
      ],
      cancellationPolicy: [
        { condition: '出发前7天以上取消', result: '全额退款' },
        { condition: '出发前3-7天取消', result: '退款70%' },
        { condition: '出发前1-3天取消', result: '退款30%' },
        { condition: '出发当天取消', result: '不予退款' }
      ]
    };

    offerDetail.value = mockDetail;

  } catch (error) {
    logger.error('加载套餐详情失败:', error);
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
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 联系客服
const contactService = () => {
  uni.makePhoneCall({
    phoneNumber: '400-123-4567'
  });
};

// 预订套餐
const bookOffer = () => {
  if (offerDetail.value.remainingQuota <= 0) {
    uni.showToast({
      title: '名额已满',
      icon: 'none'
    });
    return;
  }

  // 跳转到预订页面（复用订单确认页面，传入特惠套餐标识）
  uni.navigateTo({
    url: `/pages/order/confirm?type=special-offer&offerId=${offerId.value}`
  });
};
</script>

<style scoped lang="scss">
.special-offer-detail {
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

// 套餐基本信息
.offer-info-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;

  .route-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .route-main {
      display: flex;
      align-items: center;
      gap: $uni-spacing-xl;

      .route-text {
        font-size: 36rpx;
        font-weight: 700;
        color: $uni-text-color;
      }

      .special-badge {
        background: $uni-color-primary-gradient;
        color: $uni-text-color-inverse;
        font-size: 22rpx;
        padding: 6rpx $uni-spacing-xl;
        border-radius: $uni-radius-btn;

        .badge-text {
          font-weight: 600;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: $uni-spacing-xl;

      .rental-days {
        background-color: rgba(75, 145, 255, 0.1);
        color: #4B91FF;
        padding: $uni-spacing-md $uni-spacing-xl;
        border-radius: $uni-radius-sm;

        .days-text {
          font-size: $uni-font-size-sm;
          font-weight: 500;
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
        transition: all 0.3s;

        &:active {
          background-color: $uni-border-color;
          transform: scale(0.95);
        }
      }
    }
  }

  .price-section {
    margin-bottom: $uni-spacing-xl;

    .price-main {
      display: flex;
      align-items: baseline;
      margin-bottom: $uni-spacing-lg;

      .price-symbol {
        font-size: $uni-font-size-lg;
        color: $uni-color-error;
        font-weight: 600;
      }

      .price-amount {
        font-size: 56rpx;
        color: $uni-color-error;
        font-weight: 700;
        margin: 0 $uni-spacing-md;
      }

      .price-unit {
        font-size: $uni-font-size-base;
        color: $uni-text-color-placeholder;
      }
    }

    .price-detail {
      display: flex;
      align-items: center;
      gap: $uni-spacing-xl;

      .original-price {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
        text-decoration: line-through;
      }

      .save-amount {
        font-size: $uni-font-size-sm;
        color: $uni-color-error;
        background-color: rgba($uni-color-error, 0.1);
        padding: 4rpx $uni-spacing-lg;
        border-radius: $uni-radius-sm;
      }
    }
  }

  .quota-tip {
    display: flex;
    align-items: center;
    gap: $uni-spacing-md;
    background-color: rgba($uni-color-primary, 0.1);
    padding: $uni-spacing-xl;
    border-radius: $uni-radius-lg;

    &.warning {
      background-color: rgba($uni-color-error, 0.1);

      .tip-text {
        color: $uni-color-error;
      }
    }

    .tip-text {
      font-size: $uni-font-size-sm;
      color: $uni-color-primary;
      font-weight: 500;
    }
  }
}

// 通用卡片样式
.section-card {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;

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
      margin-left: $uni-spacing-lg;
    }
  }
}

// 车辆信息
.vehicle-info {
  .vehicle-name {
    display: block;
    font-size: 30rpx;
    font-weight: 500;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-xl;
  }

  .vehicle-specs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $uni-spacing-xl;
    margin-bottom: $uni-spacing-xl;

    .spec-item {
      display: flex;
      justify-content: space-between;
      padding: $uni-spacing-xl;
      background-color: $uni-bg-color-grey;
      border-radius: $uni-radius-sm;

      .spec-label {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
      }

      .spec-value {
        font-size: $uni-font-size-sm;
        color: $uni-text-color;
        font-weight: 500;
      }
    }
  }

  .vehicle-features {
    display: flex;
    flex-wrap: wrap;
    gap: $uni-spacing-lg;

    .feature-tag {
      font-size: $uni-font-size-sm;
      color: $uni-color-primary;
      background-color: rgba($uni-color-primary, 0.1);
      padding: $uni-spacing-md $uni-spacing-xl;
      border-radius: $uni-radius-sm;
    }
  }
}

// 行程信息
.route-detail {
  .route-item {
    display: flex;
    gap: $uni-spacing-xl;

    .route-icon {
      width: 48rpx;
      height: 48rpx;
      border-radius: $uni-radius-circle;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.pickup {
        background: linear-gradient(135deg, $uni-color-success 0%, #66BB6A 100%);
      }

      &.return {
        background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
      }
    }

    .route-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $uni-spacing-md;

      .route-label {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
      }

      .route-value {
        font-size: 30rpx;
        font-weight: 500;
        color: $uni-text-color;
      }

      .route-address {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-secondary;
      }
    }
  }

  .route-line {
    width: 2rpx;
    height: 40rpx;
    background-color: $uni-border-color;
    margin-left: 23rpx;
    margin: $uni-spacing-xl 0 $uni-spacing-xl 23rpx;
  }
}

// 时间范围
.time-range {
  .time-item {
    display: flex;
    align-items: center;
    gap: $uni-spacing-lg;
    margin-bottom: $uni-spacing-xl;

    .time-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      font-weight: 500;
    }
  }

  .time-tip {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

// 套餐包含
.package-includes {
  .include-item {
    display: flex;
    align-items: flex-start;
    gap: $uni-spacing-lg;
    margin-bottom: $uni-spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }

    .include-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      font-weight: 500;
    }

    .include-desc {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
      margin-left: auto;
    }
  }
}

// 预订须知
.notice-list {
  .notice-item {
    display: flex;
    gap: $uni-spacing-lg;
    margin-bottom: $uni-spacing-xl;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    .notice-number {
      font-size: $uni-font-size-sm;
      color: $uni-color-primary;
      font-weight: 600;
      flex-shrink: 0;
    }

    .notice-text {
      flex: 1;
      font-size: $uni-font-size-sm;
      color: $uni-text-color-secondary;
    }
  }
}

// 取消政策
.policy-list {
  .policy-item {
    padding: $uni-spacing-xl;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-radius-lg;
    margin-bottom: $uni-spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }

    .policy-condition {
      display: flex;
      align-items: center;
      gap: $uni-spacing-md;
      margin-bottom: $uni-spacing-lg;

      .condition-text {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        font-weight: 500;
      }
    }

    .policy-result {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-secondary;
      padding-left: 26rpx;
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
  padding: $uni-spacing-xl $uni-spacing-xl;
  padding-bottom: calc(#{$uni-spacing-xl} + env(safe-area-inset-bottom));
  box-shadow: $uni-shadow-card;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;

  .bar-left {
    .bar-price {
      display: flex;
      align-items: baseline;
      margin-bottom: 4rpx;

      .bar-symbol {
        font-size: $uni-font-size-sm;
        color: $uni-color-error;
        font-weight: 600;
      }

      .bar-amount {
        font-size: 40rpx;
        color: $uni-color-error;
        font-weight: 700;
        margin-left: 4rpx;
      }
    }

    .bar-tip {
      font-size: $uni-font-size-xs;
      color: $uni-text-color-placeholder;
    }
  }

  .bar-actions {
    display: flex;
    gap: $uni-spacing-xl;

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
      align-items: center;
      gap: $uni-spacing-md;
      padding: $uni-spacing-xl $uni-spacing-xl;
      background-color: $uni-bg-color-card;
      border: 2rpx solid $uni-color-primary;
      color: $uni-color-primary;
      border-radius: $uni-radius-btn;
      font-size: $uni-font-size-base;
      transition: all 0.2s ease;

      &::after {
        border: none;
      }

      &:active {
        opacity: 0.8;
      }
    }

    .book-btn {
      padding: $uni-spacing-xl 48rpx;
      background: $uni-color-primary-gradient;
      color: $uni-text-color-inverse;
      border-radius: $uni-radius-btn;
      font-size: $uni-font-size-base;
      font-weight: 600;
      border: none;
      box-shadow: $uni-shadow-glow;
      transition: all 0.2s ease;

      &::after {
        border: none;
      }

      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }
}
</style>
