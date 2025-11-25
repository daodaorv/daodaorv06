<template>
  <view class="vehicle-detail-page">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 图片轮播区域 -->
    <view class="image-swiper-section">
      <swiper
        class="image-swiper"
        :current="currentImageIndex"
        @change="onSwiperChange"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#FF6B35"
        circular
        autoplay
        interval="4000"
      >
        <swiper-item v-for="(image, index) in vehicleImages" :key="index">
          <view class="swiper-container">
            <image
              class="swiper-image"
              :src="image.url || '/static/placeholder-vehicle.png'"
              mode="aspectFill"
              @tap="previewImage(index)"
              @error="handleImageError"
            >
              <view slot="error" class="image-error">
                <uni-icons type="image" size="32" color="#CBD5E0"></uni-icons>
                <text class="error-text">图片加载失败</text>
              </view>
            </image>
            <view v-if="image.title" class="image-caption">
              <text class="caption-text">{{ image.title }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- 图片指示器 -->
      <view class="image-indicator">
        <text class="indicator-text">{{ currentImageIndex + 1 }} / {{ vehicleImages.length }}</text>
      </view>

      <!-- 浮动操作按钮 -->
      <view class="floating-actions">
        <view class="action-btn back-btn" @tap="goBack">
          <uni-icons type="arrow-left" size="24" color="#FFFFFF"></uni-icons>
        </view>
        <view class="action-btn favorite-btn" @tap="toggleFavorite">
          <uni-icons
            :type="isFavorited ? 'heart-filled' : 'heart'"
            size="24"
            :color="isFavorited ? '#FC8181' : '#FFFFFF'"
          ></uni-icons>
        </view>
        <view class="action-btn share-btn" @tap="shareVehicle">
          <uni-icons type="redo" size="24" color="#FFFFFF"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 车辆基本信息卡片 -->
    <view class="info-card">
      <view class="vehicle-header">
        <view class="title-section">
          <text class="brand-name">{{ vehicle.brand }}</text>
          <text class="model-name">{{ vehicle.model }}</text>
          <view class="vehicle-badges" v-if="vehicle.isPopular || vehicle.isNew">
            <view class="badge popular" v-if="vehicle.isPopular">
              <uni-icons type="fire-filled" size="12" color="#FFFFFF"></uni-icons>
              <text class="badge-text">热门</text>
            </view>
            <view class="badge new" v-if="vehicle.isNew">
              <uni-icons type="plus-filled" size="12" color="#FFFFFF"></uni-icons>
              <text class="badge-text">新车</text>
            </view>
          </view>
        </view>

        <view class="rating-badge" v-if="vehicle.ratingCount > 0">
          <uni-icons type="star-filled" size="18" color="#FF6B35"></uni-icons>
          <text class="rating-text">{{ vehicle.ratingAvg }}</text>
          <text class="rating-count">({{ vehicle.ratingCount }})</text>
        </view>
      </view>

      <!-- 快速规格展示 -->
      <view class="quick-specs">
        <view class="spec-item">
          <view class="spec-icon">
            <uni-icons type="person-filled" size="18" color="#FF6B35"></uni-icons>
          </view>
          <view class="spec-info">
            <text class="spec-value">{{ vehicle.seats }}座{{ vehicle.sleepers }}卧</text>
          </view>
        </view>
        <view class="spec-item">
          <view class="spec-icon">
            <uni-icons type="navigation" size="18" color="#FF6B35"></uni-icons>
          </view>
          <view class="spec-info">
            <text class="spec-value">{{ vehicle.fuelType }} · 自动挡</text>
          </view>
        </view>
        <view class="spec-item" v-if="vehicle.category">
          <view class="spec-icon">
            <uni-icons type="home" size="18" color="#FF6B35"></uni-icons>
          </view>
          <view class="spec-info">
            <text class="spec-value">{{ vehicle.categoryName }}</text>
          </view>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-card">
        <view class="price-main">
          <view class="daily-price">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ vehicle.dailyRate }}</text>
            <text class="price-unit">/天</text>
          </view>
          <view class="discount-tag" v-if="hasDiscount">
            <text class="discount-text">限时优惠</text>
          </view>
        </view>
        <view class="price-details">
          <view class="price-item" v-if="vehicle.weeklyRate">
            <text class="price-label">周租</text>
            <text class="price-value">¥{{ vehicle.weeklyRate }}</text>
          </view>
          <view class="price-item" v-if="vehicle.monthlyRate">
            <text class="price-label">月租</text>
            <text class="price-value">¥{{ vehicle.monthlyRate }}</text>
          </view>
        </view>
        <view class="price-info">
          <view class="info-item">
            <uni-icons type="wallet" size="14" color="#718096"></uni-icons>
            <text class="info-text">押金 ¥{{ vehicle.deposit }}</text>
          </view>
          <view class="info-item">
            <uni-icons type="navigate" size="14" color="#718096"></uni-icons>
            <text class="info-text">每日限{{ vehicle.kilometerLimit }}km</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 车辆特性 -->
    <view class="features-section" v-if="vehicle.features && vehicle.features.length > 0">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="star-filled" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">车辆特色</text>
      </view>
      <view class="features-grid">
        <view
          v-for="feature in vehicle.features"
          :key="feature.id"
          class="feature-item"
        >
          <view class="feature-icon">
            <uni-icons :type="feature.icon || 'star'" size="24" :color="'#FF6B35'"></uni-icons>
          </view>
          <view class="feature-content">
            <text class="feature-name">{{ feature.name }}</text>
            <text v-if="feature.description" class="feature-desc">{{ feature.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 详细参数 -->
    <view class="specs-section">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="list" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">详细参数</text>
      </view>
      <view class="specs-cards">
        <!-- 基础信息卡片 -->
        <view class="specs-card">
          <view class="card-title">
            <uni-icons type="info" size="16" color="#4299E1"></uni-icons>
            <text class="card-title-text">基础信息</text>
          </view>
          <view class="specs-list">
            <view class="spec-row" v-if="vehicle.length">
              <text class="spec-label">车身长度</text>
              <text class="spec-value">{{ vehicle.length }}米</text>
            </view>
            <view class="spec-row" v-if="vehicle.width">
              <text class="spec-label">车身宽度</text>
              <text class="spec-value">{{ vehicle.width }}米</text>
            </view>
            <view class="spec-row" v-if="vehicle.height">
              <text class="spec-label">车身高度</text>
              <text class="spec-value">{{ vehicle.height }}米</text>
            </view>
            <view class="spec-row" v-if="vehicle.displacement">
              <text class="spec-label">发动机排量</text>
              <text class="spec-value">{{ vehicle.displacement }}L</text>
            </view>
          </view>
        </view>

        <!-- 生活设施卡片 -->
        <view class="specs-card">
          <view class="card-title">
            <uni-icons type="home" size="16" color="#48BB78"></uni-icons>
            <text class="card-title-text">生活设施</text>
          </view>
          <view class="specs-list">
            <view class="spec-row" v-if="vehicle.toilet && vehicle.toilet !== '无'">
              <text class="spec-label">卫生间</text>
              <text class="spec-value">{{ vehicle.toilet }}</text>
            </view>
            <view class="spec-row" v-if="vehicle.kitchen && vehicle.kitchen !== '无'">
              <text class="spec-label">厨房</text>
              <text class="spec-value">{{ vehicle.kitchen }}</text>
            </view>
            <view class="spec-row" v-if="vehicle.shower && vehicle.shower !== '无'">
              <text class="spec-label">淋浴</text>
              <text class="spec-value">{{ vehicle.shower }}</text>
            </view>
            <view class="spec-row" v-if="vehicle.waterTank">
              <text class="spec-label">水箱容量</text>
              <text class="spec-value">{{ vehicle.waterTank }}L</text>
            </view>
          </view>
        </view>

        <!-- 租赁条款卡片 -->
        <view class="specs-card">
          <view class="card-title">
            <uni-icons type="calendar" size="16" color="#F6AD55"></uni-icons>
            <text class="card-title-text">租赁条款</text>
          </view>
          <view class="specs-list">
            <view class="spec-row">
              <text class="spec-label">最少租赁天数</text>
              <text class="spec-value">{{ vehicle.minimumRentalDays }}天</text>
            </view>
            <view class="spec-row">
              <text class="spec-label">最多租赁天数</text>
              <text class="spec-value">{{ vehicle.maximumRentalDays }}天</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 车辆描述 -->
    <view class="description-section" v-if="vehicle.description">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="info" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">车辆描述</text>
      </view>
      <view class="description-card">
        <text class="description-text">{{ vehicle.description }}</text>
      </view>
    </view>

    <!-- 租赁须知 -->
    <view class="rules-section" v-if="vehicle.rentalRules">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="help" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">租赁须知</text>
      </view>
      <view class="rules-card">
        <text class="rules-text">{{ vehicle.rentalRules }}</text>
      </view>
    </view>

    <!-- 门店信息 -->
    <view class="store-section">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="location-filled" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">取车门店</text>
      </view>
      <view class="store-card">
        <view class="store-info">
          <view class="store-header">
            <text class="store-name">{{ getStoreName(vehicle.storeId) }}</text>
            <view class="distance-badge">
              <uni-icons type="navigate" size="12" color="#4299E1"></uni-icons>
              <text class="distance-text">约{{ getRandomDistance() }}km</text>
            </view>
          </view>
          <view class="store-details">
            <view class="detail-item">
              <uni-icons type="phone" size="16" color="#718096"></uni-icons>
              <text class="detail-text">400-888-8888</text>
            </view>
            <view class="detail-item">
              <uni-icons type="clock" size="16" color="#718096"></uni-icons>
              <text class="detail-text">营业时间 09:00-18:00</text>
            </view>
          </view>
        </view>
        <view class="map-preview" @tap="openMap">
          <image class="map-image" src="/static/map-preview.png" mode="aspectFill" @error="handleMapError">
            <view slot="error" class="map-error">
              <uni-icons type="map" size="24" color="#CBD5E0"></uni-icons>
            </view>
          </image>
          <view class="map-overlay">
            <uni-icons type="map" size="20" color="#FFFFFF"></uni-icons>
            <text class="map-text">查看地图</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户评价 -->
    <view class="reviews-section">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="chatbubble-filled" size="20" color="#FF6B35"></uni-icons>
        </view>
        <text class="section-title">用户评价</text>
        <text v-if="vehicle.ratingCount > 0" class="review-count">({{ vehicle.ratingCount }})</text>
      </view>

      <view v-if="vehicle.ratingCount === 0" class="no-reviews">
        <view class="empty-icon">
          <uni-icons type="chat" size="48" color="#CBD5E0"></uni-icons>
        </view>
        <text class="no-reviews-text">暂无评价</text>
        <text class="no-reviews-desc">成为第一个评价的用户</text>
      </view>

      <view v-else class="reviews-content">
        <!-- 评价统计 -->
        <view class="rating-summary">
          <view class="overall-rating">
            <text class="rating-score">{{ vehicle.ratingAvg }}</text>
            <view class="rating-stars">
              <uni-icons
                v-for="i in 5"
                :key="i"
                :type="i <= Math.floor(vehicle.ratingAvg) ? 'star-filled' : 'star'"
                size="16"
                :color="i <= Math.floor(vehicle.ratingAvg) ? '#F6AD55' : '#E2E8F0'"
              ></uni-icons>
            </view>
            <text class="rating-total">{{ vehicle.ratingCount }}条评价</text>
          </view>
          <view class="rating-bars">
            <view v-for="star in 5" :key="star" class="rating-bar">
              <text class="bar-label">{{ 6 - star }}星</text>
              <view class="bar-container">
                <view class="bar-fill" :style="{ width: getRatingPercentage(6 - star) + '%' }"></view>
              </view>
              <text class="bar-count">{{ getRatingCount(6 - star) }}</text>
            </view>
          </view>
        </view>

        <!-- 评价列表 -->
        <view class="reviews-list">
          <view
            v-for="review in getMockReviews()"
            :key="review.id"
            class="review-item"
          >
            <view class="review-header">
              <image class="user-avatar" :src="review.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
              <view class="user-info">
                <text class="user-name">{{ review.userName }}</text>
                <text class="review-date">{{ review.date }}</text>
              </view>
              <view class="review-rating">
                <uni-icons
                  v-for="i in 5"
                  :key="i"
                  :type="i <= review.rating ? 'star-filled' : 'star'"
                  size="14"
                  :color="i <= review.rating ? '#F6AD55' : '#E2E8F0'"
                ></uni-icons>
              </view>
            </view>
            <text class="review-content">{{ review.content }}</text>
            <view v-if="review.images && review.images.length > 0" class="review-images">
              <image
                v-for="(img, index) in review.images"
                :key="index"
                class="review-image"
                :src="img"
                mode="aspectFill"
                @tap="previewReviewImage(review.images, index)"
              />
            </view>
          </view>
        </view>

        <view class="more-reviews" @tap="viewAllReviews">
          <text class="more-text">查看全部评价</text>
          <uni-icons type="arrowright" size="16" color="#718096"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 预订卡片 -->
    <view class="reservation-card">
      <view class="card-header">
        <text class="card-title">预订信息</text>
      </view>

      <!-- 取车还车时间选择 -->
      <view class="date-selection">
        <view class="date-item">
          <view class="date-label">
            <uni-icons type="calendar" size="16" color="#718096"></uni-icons>
            <text class="label-text">取车时间</text>
          </view>
          <view class="date-input" @tap="showDatePicker('pickup')">
            <text class="date-value" :class="{ 'placeholder': !pickupDate }">
              {{ pickupDate || '选择取车时间' }}
            </text>
            <uni-icons type="arrowright" size="16" color="#A0AEC0"></uni-icons>
          </view>
        </view>

        <view class="date-item">
          <view class="date-label">
            <uni-icons type="calendar" size="16" color="#718096"></uni-icons>
            <text class="label-text">还车时间</text>
          </view>
          <view class="date-input" @tap="showDatePicker('return')">
            <text class="date-value" :class="{ 'placeholder': !returnDate }">
              {{ returnDate || '选择还车时间' }}
            </text>
            <uni-icons type="arrowright" size="16" color="#A0AEC0"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 取车地点 -->
      <view class="location-section">
        <view class="location-label">
          <uni-icons type="location-filled" size="16" color="#718096"></uni-icons>
          <text class="label-text">取车地点</text>
        </view>
        <view class="location-input" @tap="showLocationPicker">
          <text class="location-value" :class="{ 'placeholder': !selectedLocation }">
            {{ selectedLocation || '选择取车地点' }}
          </text>
          <uni-icons type="arrowright" size="16" color="#A0AEC0"></uni-icons>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="pricing-section" v-if="pickupDate && returnDate">
        <view class="pricing-header">
          <text class="pricing-title">费用明细</text>
        </view>
        <view class="pricing-list">
          <view class="pricing-item">
            <text class="pricing-label">日租金 ({{ rentalDays }}天)</text>
            <text class="pricing-value">¥{{ dailyTotal }}</text>
          </view>
          <view class="pricing-item" v-if="depositAmount > 0">
            <text class="pricing-label">押金</text>
            <text class="pricing-value">¥{{ depositAmount }}</text>
          </view>
          <view class="pricing-divider"></view>
          <view class="pricing-item total">
            <text class="pricing-label">总计</text>
            <text class="pricing-value total-amount">¥{{ totalAmount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 同类车型推荐 -->
    <view class="similar-vehicles">
      <view class="section-header">
        <text class="section-title">同类车型推荐</text>
        <text class="section-subtitle">Similar Models</text>
      </view>
      <view class="similar-grid">
        <view
          v-for="similar in similarVehicles"
          :key="similar.id"
          class="similar-item"
          @tap="goToSimilarVehicle(similar.id)"
        >
          <view class="similar-image-container">
            <image
              class="similar-image"
              :src="similar.mainImage || '/static/placeholder-vehicle.png'"
              mode="aspectFill"
            ></image>
            <view class="similar-price">
              <text class="price-amount">¥{{ similar.dailyRate }}</text>
              <text class="price-unit">/天</text>
            </view>
          </view>
          <view class="similar-info">
            <text class="similar-name">{{ similar.brand }} {{ similar.model }}</text>
            <text class="similar-specs">{{ similar.seats }}座 · {{ similar.fuelType }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部预订栏 -->
    <view class="bottom-booking-bar">
      <view class="favorite-section" @tap="toggleFavorite">
        <uni-icons
          :type="isFavorited ? 'heart-filled' : 'heart'"
          size="24"
          :color="isFavorited ? '#FC8181' : '#718096'"
        ></uni-icons>
        <text class="favorite-text">加入收藏</text>
      </view>
      <view class="action-section">
        <view class="price-display">
          <text class="daily-price">¥{{ vehicle.dailyRate }}</text>
          <text class="price-unit">/天</text>
        </view>
        <button class="reserve-btn" @tap="startBooking" :disabled="!canBook">
          <text class="btn-text">立即预订</text>
        </button>
      </view>
    </view>

    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载车辆详情...</text>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-if="error" class="error-container">
      <view class="error-content">
        <view class="error-icon">
          <uni-icons type="info" size="48" color="#FC8181"></uni-icons>
        </view>
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @tap="loadVehicleDetail">
          <uni-icons type="refresh" size="16" color="#FFFFFF"></uni-icons>
          <text class="btn-text">重新加载</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVehicleStore } from '@/stores/vehicle';
import { vehicleApi } from '@/api/vehicle';
import { useUserStore } from '@/stores/user';

const vehicleStore = useVehicleStore();
const userStore = useUserStore();

// 页面数据
const vehicleId = ref(0);
const vehicle = ref({});
const vehicleImages = ref([]);
const loading = ref(true);
const error = ref('');
const currentImageIndex = ref(0);

// 预订相关数据
const pickupDate = ref('');
const returnDate = ref('');
const selectedLocation = ref('');
const similarVehicles = ref([]);

// 图片加载错误处理
const handleImageError = (e) => {
  console.log('图片加载失败:', e);
};

const handleMapError = (e) => {
  console.log('地图加载失败:', e);
};

// 计算属性
const isFavorited = computed(() => {
  return vehicleStore.isFavorited(vehicleId.value);
});

const hasDiscount = computed(() => {
  // 这里可以根据实际业务逻辑判断是否有折扣
  return false;
});

const canBook = computed(() => {
  return pickupDate.value && returnDate.value && selectedLocation.value &&
         new Date(returnDate.value) > new Date(pickupDate.value);
});

const rentalDays = computed(() => {
  if (!pickupDate.value || !returnDate.value) return 0;
  const pickup = new Date(pickupDate.value);
  const returnDateObj = new Date(returnDate.value);
  const diffTime = Math.abs(returnDateObj - pickup);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const dailyTotal = computed(() => {
  return vehicle.value.dailyRate * rentalDays.value;
});

const depositAmount = computed(() => {
  return vehicle.value.deposit || 0;
});

const totalAmount = computed(() => {
  return dailyTotal.value + depositAmount.value;
});

// 页面加载
onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  vehicleId.value = Number(options.id) || 0;

  if (vehicleId.value > 0) {
    await loadVehicleDetail();
    await loadSimilarVehicles();
  } else {
    error.value = '无效的车辆ID';
    loading.value = false;
  }
});

// 下拉刷新
onPullDownRefresh(async () => {
  await loadVehicleDetail();
  uni.stopPullDownRefresh();
});

// 加载车辆详情
const loadVehicleDetail = async () => {
  try {
    loading.value = true;
    error.value = '';

    const result = await vehicleApi.getVehicleById(vehicleId.value);

    vehicle.value = result;
    vehicleImages.value = result.images || [];

    // 保存到store
    vehicleStore.setCurrentVehicle(result);
    vehicleStore.setVehicleImages(vehicleImages.value);

  } catch (err) {
    console.error('加载车辆详情失败:', err);
    error.value = err.message || '加载失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 轮播图变化
const onSwiperChange = (e) => {
  currentImageIndex.value = e.detail.current;
};

// 预览图片
const previewImage = (index) => {
  const urls = vehicleImages.value.map(img => img.url).filter(Boolean);
  uni.previewImage({
    current: index,
    urls
  });
};

// 预览评价图片
const previewReviewImage = (images, index) => {
  uni.previewImage({
    current: index,
    urls: images
  });
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      });
    }, 1500);
    return;
  }

  try {
    if (isFavorited.value) {
      await vehicleApi.unfavoriteVehicle(vehicleId.value);
      vehicleStore.toggleFavorite(vehicleId.value);
      uni.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      await vehicleApi.favoriteVehicle(vehicleId.value);
      vehicleStore.toggleFavorite(vehicleId.value);
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
  } catch (err) {
    console.error('收藏操作失败:', err);
    uni.showToast({
      title: err.message || '操作失败',
      icon: 'none'
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 开始预订
const startBooking = () => {
  if (!vehicle.value.availabilityStatus || vehicle.value.availabilityStatus !== '可用') {
    uni.showToast({
      title: '该车辆暂不可租',
      icon: 'none'
    });
    return;
  }

  const params = new URLSearchParams({
    vehicleId: vehicleId.value,
    pickupDate: pickupDate.value || '',
    returnDate: returnDate.value || '',
    location: selectedLocation ? encodeURIComponent(selectedLocation) : ''
  });

  uni.navigateTo({
    url: `/pages/booking/create?${params.toString()}`
  });
};

// 打开地图
const openMap = () => {
  // 这里可以集成地图功能
  uni.showToast({
    title: '地图功能开发中',
    icon: 'none'
  });
};

// 查看全部评价
const viewAllReviews = () => {
  uni.navigateTo({
    url: `/pages/vehicles/reviews?vehicleId=${vehicleId.value}`
  });
};

// 获取门店名称
const getStoreName = (storeId) => {
  const storeNames = {
    1: '北京朝阳店',
    2: '上海浦东店',
    3: '广州天河店',
    4: '深圳南山店',
  };
  return storeNames[storeId] || '未知门店';
};

// 获取随机距离
const getRandomDistance = () => {
  return Math.floor(Math.random() * 20) + 1;
};

// 获取评价百分比
const getRatingPercentage = (rating) => {
  // 模拟评价分布
  const percentages = { 5: 65, 4: 25, 3: 8, 2: 2, 1: 0 };
  return percentages[rating] || 0;
};

// 获取评价数量
const getRatingCount = (rating) => {
  if (!vehicle.value.ratingCount) return 0;
  const percentage = getRatingPercentage(rating);
  return Math.floor(vehicle.value.ratingCount * percentage / 100);
};

// 获取模拟评价数据
const getMockReviews = () => {
  return [
    {
      id: 1,
      userName: '张先生',
      avatar: '/static/avatar-1.png',
      rating: 5,
      date: '2024-10-15',
      content: '车辆非常新，内部设施齐全，驾驶体验很好。老板服务态度也很好，下次还会选择这里！',
      images: ['/static/review-1.jpg', '/static/review-2.jpg']
    },
    {
      id: 2,
      userName: '李女士',
      avatar: '/static/avatar-2.png',
      rating: 4,
      date: '2024-09-28',
      content: '整体还不错，空间宽敞，配置齐全。就是GPS导航系统需要更新一下，有些路线不太准确。',
      images: []
    },
    {
      id: 3,
      userName: '王先生',
      avatar: '/static/avatar-3.png',
      rating: 5,
      date: '2024-09-10',
      content: '第一次租房车，体验很棒！车辆保养得很好，各种设备都能正常使用。客服人员很耐心地讲解了使用方法。',
      images: ['/static/review-3.jpg']
    }
  ];
};

// 分享车辆
const shareVehicle = () => {
  uni.showActionSheet({
    itemList: ['分享给微信好友', '分享到朋友圈', '复制链接'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
        case 1:
          uni.share({
            provider: 'weixin',
            type: res.tapIndex === 0 ? 0 : 1, // 0=好友, 1=朋友圈
            title: `${vehicle.value.brand} ${vehicle.value.model}`,
            summary: vehicle.value.description || '优质房车，租赁体验一流',
            imageUrl: vehicle.value.mainImage,
            href: `pages/vehicles/detail?id=${vehicleId.value}`,
            success: () => {
              uni.showToast({ title: '分享成功', icon: 'success' });
            },
            fail: () => {
              uni.showToast({ title: '分享失败', icon: 'none' });
            }
          });
          break;
        case 2:
          uni.setClipboardData({
            data: `https://daodao.com/vehicle/${vehicleId.value}`,
            success: () => {
              uni.showToast({ title: '链接已复制', icon: 'success' });
            }
          });
          break;
      }
    }
  });
};

// 日期选择器
const showDatePicker = (type) => {
  const currentDate = new Date();
  const minDate = currentDate.getTime();
  const maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()).getTime();

  uni.showDatePicker({
    currentDate: type === 'pickup' ? pickupDate.value : returnDate.value,
    startDate: type === 'pickup' ? minDate : new Date(pickupDate.value || minDate).getTime(),
    endDate: maxDate,
    success: (res) => {
      const selectedDate = res.date;
      if (type === 'pickup') {
        pickupDate.value = selectedDate;
        // 如果还车时间早于取车时间，清空还车时间
        if (returnDate.value && new Date(returnDate.value) <= new Date(selectedDate)) {
          returnDate.value = '';
        }
      } else {
        returnDate.value = selectedDate;
      }
    }
  });
};

// 地点选择器
const showLocationPicker = () => {
  uni.showActionSheet({
    itemList: [
      '北京朝阳店 - 北京市朝阳区建国路88号',
      '上海浦东店 - 上海市浦东新区陆家嘴',
      '广州天河店 - 广州市天河区天河路',
      '深圳南山店 - 深圳市南山区科技园'
    ],
    success: (res) => {
      const locations = [
        '北京朝阳店 - 北京市朝阳区建国路88号',
        '上海浦东店 - 上海市浦东新区陆家嘴',
        '广州天河店 - 广州市天河区天河路',
        '深圳南山店 - 深圳市南山区科技园'
      ];
      selectedLocation.value = locations[res.tapIndex];
    }
  });
};

// 加载同类车辆
const loadSimilarVehicles = async () => {
  try {
    // 这里应该调用API获取同类车辆，暂时使用模拟数据
    similarVehicles.value = [
      {
        id: 2,
        brand: '上汽大通',
        model: 'V90 9座商务车',
        dailyRate: 420,
        seats: 9,
        fuelType: '汽油',
        mainImage: '/static/vehicle-2.jpg'
      },
      {
        id: 3,
        brand: '福特',
        model: '全顺12座商用车',
        dailyRate: 380,
        seats: 12,
        fuelType: '柴油',
        mainImage: '/static/vehicle-3.jpg'
      },
      {
        id: 4,
        brand: '丰田',
        model: '考斯特16座',
        dailyRate: 520,
        seats: 16,
        fuelType: '汽油',
        mainImage: '/static/vehicle-4.jpg'
      }
    ];
  } catch (error) {
    console.error('加载同类车辆失败:', error);
  }
};

// 跳转到同类车辆详情页
const goToSimilarVehicle = (vehicleId) => {
  uni.redirectTo({
    url: `/pages/vehicles/detail?id=${vehicleId}`
  });
};

// 联系门店
const contactStore = () => {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888',
    success: () => {
      console.log('拨打电话成功');
    },
    fail: () => {
      uni.showToast({ title: '拨打失败', icon: 'none' });
    }
  });
};
</script>

<style>
// Design System Variables
#FF6B35: #FF6B35;
#FF8F5A: #FF8F5A;
#E55A2B: #E55A2B;
#48BB78: #48BB78;
#68D391: #68D391;
#4299E1: #4299E1;
#F6AD55: #F6AD55;
#FC8181: #FC8181;
#48BB78: #48BB78;

// Neutral Colors
#333333: #2D3748;
#666666: #4A5568;
#999999: #718096;
#CCCCCC: #A0AEC0;
#CCCCCC: #CBD5E0;

// Background Colors
#FFFFFF: #FFFFFF;
#F8F8F8: #F7FAFC;
#EDF2F7: #EDF2F7;
rgba(0, 0, 0, 0.5): rgba(0, 0, 0, 0.5);

// Border Colors
#E8E8E8: #E2E8F0;
#DDDDDD: #CBD5E0;
#CCCCCC: #A0AEC0;

// Spacing Scale
8rpx: 8rpx;
16rpx: 16rpx;
24rpx: 24rpx;
32rpx: 32rpx;
48rpx: 48rpx;
80rpx: 64rpx;

// Border Radius
12rpx: 8rpx;
16rpx: 12rpx;
20rpx: 16rpx;
24rpx: 24rpx;

// Shadows
0 2rpx 8rpx rgba(0, 0, 0, 0.06): 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
0 4rpx 16rpx rgba(0, 0, 0, 0.08): 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
0 8rpx 24rpx rgba(0, 0, 0, 0.12): 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
0 16rpx 48rpx rgba(0, 0, 0, 0.16): 0 16rpx 48rpx rgba(0, 0, 0, 0.16);

// Typography Scale
20rpx: 24rpx;
24rpx: 28rpx;
28rpx: 32rpx;
32rpx: 36rpx;
36rpx: 48rpx;
40rpx: 56rpx;

// Font Weights
300: 300;
400: 400;
500: 500;
600: 600;
700: 700;

// Main Styles
.vehicle-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F8F8 0%, #FFFFFF 100%);
  padding-bottom: 200rpx; // 为底部预订栏预留空间
}

// Image Swiper Section
.image-swiper-section {
  position: relative;
  height: 500rpx;
  background: #000000;

  .image-swiper {
    width: 100%;
    height: 100%;

    .swiper-container {
      width: 100%;
      height: 100%;
      position: relative;

      .swiper-image {
        width: 100%;
        height: 100%;
        background: #EDF2F7;

        .image-error {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F8F8F8;
          gap: 8rpx;

          .error-text {
            font-size: 20rpx;
            color: #999999;
          }
        }
      }

      .image-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        padding: 32rpx;
        backdrop-filter: blur(10rpx);

        .caption-text {
          font-size: 24rpx;
          color: #FFFFFF;
          font-weight: 500;
          text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
        }
      }
    }
  }

  .image-indicator {
    position: absolute;
    top: 32rpx;
    right: 32rpx;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10rpx);
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.2);

    .indicator-text {
      font-size: 20rpx;
      color: #FFFFFF;
      font-weight: 500;
    }
  }

  .floating-actions {
    position: absolute;
    top: 32rpx;
    left: 32rpx;
    display: flex;
    gap: 16rpx;

    .action-btn {
      width: 72rpx;
      height: 72rpx;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20rpx);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2rpx solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.9);
        background: rgba(0, 0, 0, 0.5);
      }
    }
  }
}

// Info Card
.info-card {
  background: #FFFFFF;
  margin: 32rpx 32rpx 0;
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  position: relative;
  top: -48rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 10;

  .vehicle-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32rpx;

    .title-section {
      flex: 1;

      .brand-name {
        font-size: 36rpx;
        font-weight: 700;
        color: #333333;
        margin-bottom: 8rpx;
        line-height: 1.3;
      }

      .model-name {
        font-size: 28rpx;
        color: #666666;
        font-weight: 500;
        margin-bottom: 16rpx;
        line-height: 1.4;
      }

      .vehicle-badges {
        display: flex;
        gap: 16rpx;
        margin-top: 16rpx;

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4rpx;
          padding: 8rpx 24rpx;
          border-radius: 24rpx;
          backdrop-filter: blur(20rpx);
          border: 1rpx solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);

          .badge-text {
            font-size: 20rpx * 0.8;
            font-weight: 700;
            color: #FFFFFF;
            line-height: 1.2;
          }

          &.popular {
            background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
          }

          &.new {
            background: linear-gradient(135deg, #48BB78 0%, #68D391 100%);
          }
        }
      }

      .nickname {
        font-size: 24rpx;
        color: #FF6B35;
        font-weight: 500;
      }
    }

    .rating-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: linear-gradient(135deg, rgba(#F6AD55, 0.1) 0%, rgba(#F6AD55, 0.05) 100%);
      padding: 16rpx 24rpx;
      border-radius: 24rpx;
      border: 1rpx solid rgba(#F6AD55, 0.2);

      .rating-text {
        font-size: 28rpx;
        font-weight: 700;
        color: #F6AD55;
      }

      .rating-count {
        font-size: 20rpx;
        color: #F6AD55;
        opacity: 0.8;
      }
    }
  }

  .quick-specs {
    display: flex;
    gap: 24rpx;
    margin-bottom: 32rpx;
    padding: 48rpx 0;
    border-top: 1rpx solid rgba(#E8E8E8, 0.6);
    border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

    .spec-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 24rpx;

      .spec-icon {
        width: 64rpx;
        height: 64rpx;
        background: linear-gradient(135deg, rgba(#FF6B35, 0.1) 0%, rgba(#FF8F5A, 0.05) 100%);
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1rpx solid rgba(#FF6B35, 0.15);
      }

      .spec-info   .spec-value { font-size: 24rpx;
          font-weight: 600;
          color: #333333;
          line-height: 1.4; }
    }
  }

  .price-card {
    background: linear-gradient(135deg, rgba(#FF6B35, 0.08) 0%, rgba(#FF8F5A, 0.15) 100%);
    border-radius: 24rpx;
    padding: 48rpx;
    border: 2rpx solid rgba(#FF6B35, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200rpx;
      height: 200rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      z-index: 0;
    }

    .price-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .daily-price {
        display: flex;
        align-items: baseline;
        gap: 2rpx;

        .price-symbol {
          font-size: 28rpx;
          color: #FF6B35;
          font-weight: 600;
        }

        .price-amount {
          font-size: 40rpx;
          color: #FF6B35;
          font-weight: 700;
        }

        .price-unit {
          font-size: 24rpx;
          color: #666666;
          font-weight: 400;
        }
      }

      .discount-tag {
        background: linear-gradient(135deg, #FC8181 0%, #F56565 100%);
        padding: 8rpx 16rpx;
        border-radius: 12rpx;
        animation: pulse 2s infinite;

        .discount-text {
          font-size: 20rpx * 0.8;
          color: #FFFFFF;
          font-weight: 700;
        }
      }
    }

    .price-details {
      display: flex;
      gap: 32rpx;
      margin-bottom: 24rpx;

      .price-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .price-label {
          font-size: 20rpx;
          color: #999999;
        }

        .price-value {
          font-size: 24rpx;
          color: #333333;
          font-weight: 500;
        }
      }
    }

    .price-info {
      display: flex;
      gap: 32rpx;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .info-text {
          font-size: 20rpx;
          color: #666666;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

// Section Headers
.features-section,
.specs-section,
.description-section,
.rules-section,
.store-section,
.reviews-section {
  margin: 32rpx 32rpx;

  .section-header {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 48rpx;

    .section-icon {
      width: 72rpx;
      height: 72rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 16rpx rgba(#FF6B35, 0.2);
    }

    .section-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      line-height: 1.3;
    }

    .review-count {
      font-size: 24rpx;
      color: #999999;
      margin-left: 8rpx;
    }
  }
}

// Features Grid
.features-section  { .features-grid { display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32rpx;

    .feature-item { background: #FFFFFF;
      border-radius: 24rpx;
      padding: 48rpx;
      display: flex;
      align-items: flex-start;
      gap: 32rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1rpx solid rgba(0, 0, 0, 0.05);

      .active { transform: scale(0.98);
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12); }.feature-icon { width: 80rpx;
        height: 80rpx;
        background: rgba(#FF6B35, 0.1);
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2rpx 8rpx rgba(#FF6B35, 0.1); }.feature-content { flex: 1;

        .feature-name { font-size: 28rpx;
          font-weight: 600;
          color: #333333;
          margin-bottom: 8rpx;
          line-height: 1.4; }.feature-desc { font-size: 20rpx;
          color: #999999;
          line-height: 1.5;
          font-weight: 400; } }
    }
  }
}

// Specs Cards
.specs-section   .specs-cards { display: flex;
    flex-direction: column;
    gap: 32rpx;

    .specs-card { background: #FFFFFF;
      border-radius: 24rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      border: 1rpx solid rgba(0, 0, 0, 0.05);

      .card-title { display: flex;
        align-items: center;
        gap: 24rpx;
        padding: 48rpx 32rpx;
        background: linear-gradient(135deg, rgba(#FF6B35, 0.05) 0%, rgba(#FF8F5A, 0.1) 100%);
        border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

        .card-title-text { font-size: 32rpx;
          font-weight: 600;
          color: #333333;
          line-height: 1.3; }

      .specs-list {
        padding: 32rpx;

        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32rpx 0;
          border-bottom: 1rpx solid rgba(#E8E8E8, 0.6);

          .last-child {
            border-bottom: none;
          }

          .spec-label {
            font-size: 24rpx;
            color: #666666;
            font-weight: 400;
            line-height: 1.4;
          }

          .spec-value {
            font-size: 24rpx;
            color: #333333;
            font-weight: 500;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

// Description Card
.description-section   .description-card { background: #FFFFFF;
    border-radius: 20rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .description-text { font-size: 24rpx;
      color: #666666;
      line-height: 1.8; }
}

// Rules Card
.rules-section   .rules-card { background: #FFFFFF;
    border-radius: 20rpx;
    padding: 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    border-left: 8rpx solid #F6AD55;

    .rules-text { font-size: 24rpx;
      color: #666666;
      line-height: 1.8; }
}

// Store Card
.store-section  { .store-card { background: #FFFFFF;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .store-info { padding: 32rpx;

      .store-header { display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .store-name { font-size: 28rpx;
          font-weight: 600;
          color: #333333; }.distance-badge { display: flex;
          align-items: center;
          gap: 8rpx;
          background: rgba(#4299E1, 0.1);
          padding: 8rpx 16rpx;
          border-radius: 12rpx;
          border: 2rpx solid rgba(#4299E1, 0.2);

          .distance-text { font-size: 20rpx * 0.8;
            color: #4299E1;
            font-weight: 500; } }
      }

      .store-details {
        margin-bottom: 32rpx;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 16rpx;
          margin-bottom: 8rpx;

          .detail-text {
            font-size: 24rpx;
            color: #666666;
          }
        }
      }
    }

    .map-preview {
      position: relative;
      height: 200rpx;

      .map-image {
        width: 100%;
        height: 100%;
        background: #EDF2F7;

        .map-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8F8F8;
        }
      }

      .map-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10rpx);
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 16rpx 32rpx;
        border-radius: 20rpx;
        transition: all 0.3s ease;

        .active {
          transform: translate(-50%, -50%) scale(0.95);
        }

        .map-text {
          font-size: 24rpx;
          color: #FFFFFF;
          font-weight: 500;
        }
      }
    }
  }
}

// Reviews Section
.reviews-section  { .no-reviews { background: #FFFFFF;
    border-radius: 20rpx;
    padding: 80rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .empty-icon { width: 120rpx;
      height: 120rpx;
      background: rgba(#CCCCCC, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32rpx; }.no-reviews-text { font-size: 28rpx;
      font-weight: 600;
      color: #666666;
      margin-bottom: 16rpx; }.no-reviews-desc { font-size: 24rpx;
      color: #999999; } }

  .reviews-content  { .rating-summary { background: #FFFFFF;
      border-radius: 20rpx;
      padding: 32rpx;
      margin-bottom: 32rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

      .overall-rating { display: flex;
        align-items: center;
        gap: 24rpx;
        margin-bottom: 32rpx;

        .rating-score { font-size: 40rpx;
          font-weight: 700;
          color: #333333; }.rating-stars { display: flex;
          align-items: center; }.rating-total { font-size: 24rpx;
          color: #999999; } }

      .rating-bars  { .rating-bar { display: flex;
          align-items: center;
          gap: 24rpx;
          margin-bottom: 8rpx;

          .bar-label { width: 80rpx;
            font-size: 20rpx;
            color: #666666; }.bar-container { flex: 1;
            height: 12rpx;
            background: #EDF2F7;
            border-radius: 6rpx;
            overflow: hidden;

            .bar-fill { height: 100%;
              background: linear-gradient(90deg, #F6AD55 0%, #FBD38D 100%);
              transition: width 0.8s ease; } }

          .bar-count {
            width: 60rpx;
            font-size: 20rpx;
            color: #999999;
            text-align: right;
          }
        }
      }
    }

    .reviews-list  { .review-item { background: #FFFFFF;
        border-radius: 20rpx;
        padding: 32rpx;
        margin-bottom: 32rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

        .review-header { display: flex;
          align-items: center;
          gap: 24rpx;
          margin-bottom: 24rpx;

          .user-avatar { width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            background: #EDF2F7; }.user-info { flex: 1;

            .user-name { font-size: 28rpx;
              font-weight: 600;
              color: #333333;
              margin-bottom: 8rpx; }.review-date { font-size: 20rpx;
              color: #999999; } }

          .review-rating {
            display: flex;
            align-items: center;
          }
        }

        .review-content {
          font-size: 24rpx;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 24rpx;
        }

        .review-images {
          display: flex;
          gap: 16rpx;
          overflow-x: auto;

          .review-image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 16rpx;
            background: #EDF2F7;
            flex-shrink: 0;
          }
        }
      }
    }

    .more-reviews {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 32rpx;
      background: #FFFFFF;
      border-radius: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.98);
      }

      .more-text {
        font-size: 24rpx;
        color: #666666;
        font-weight: 500;
      }
    }
  }
}

// Reservation Card
.reservation-card {
  background: #FFFFFF;
  margin: 32rpx 32rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .card-header {
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 2rpx solid #E8E8E8;

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }
  }

  .date-selection   .date-item { margin-bottom: 32rpx;

      .date-label { display: flex;
        align-items: center;
        gap: 8rpx;
        margin-bottom: 16rpx;

        .label-text { font-size: 24rpx;
          color: #666666;
          font-weight: 500; }

      .date-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx 32rpx;
        background: #F8F8F8;
        border: 2rpx solid #E8E8E8;
        border-radius: 16rpx;
        transition: all 0.3s ease;

        .active {
          border-color: #FF6B35;
          box-shadow: 0 0 0 4rpx rgba(#FF6B35, 0.1);
        }

        .date-value {
          font-size: 24rpx;
          color: #333333;
          font-weight: 500;

          &.placeholder {
            color: #CCCCCC;
          }
        }
      }
    }
  }

  .location-section {
    margin-bottom: 32rpx;
    padding-top: 32rpx;
    border-top: 2rpx solid #E8E8E8;

    .location-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 16rpx;

      .label-text {
        font-size: 24rpx;
        color: #666666;
        font-weight: 500;
      }
    }

    .location-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 32rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 16rpx;
      transition: all 0.3s ease;

      .active {
        border-color: #FF6B35;
        box-shadow: 0 0 0 4rpx rgba(#FF6B35, 0.1);
      }

      .location-value {
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        flex: 1;

        &.placeholder {
          color: #CCCCCC;
        }
      }
    }
  }

  .pricing-section {
    background: linear-gradient(135deg, rgba(#FF6B35, 0.05) 0%, rgba(#FF8F5A, 0.1) 100%);
    border-radius: 20rpx;
    padding: 32rpx;
    border: 2rpx solid rgba(#FF6B35, 0.1);

    .pricing-header {
      margin-bottom: 24rpx;

      .pricing-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333333;
      }
    }

    .pricing-list  { .pricing-item { display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx 0;

        .pricing-label { font-size: 24rpx;
          color: #666666; }.pricing-value { font-size: 24rpx;
          color: #333333;
          font-weight: 500;

          &.total-amount { font-size: 32rpx;
            color: #FF6B35;
            font-weight: 700; } }
      }

      .pricing-divider {
        height: 2rpx;
        background: #E8E8E8;
        margin: 24rpx 0;
      }

      .pricing-item.total   .pricing-label { font-weight: 600;
          color: #333333; }
    }
  }
}

// Similar Vehicles
.similar-vehicles {
  margin: 32rpx 32rpx;

  .section-header {
    margin-bottom: 32rpx;
    text-align: center;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8rpx;
    }

    .section-subtitle {
      font-size: 24rpx;
      color: #999999;
      font-style: italic;
    }
  }

  .similar-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;

    .similar-item {
      background: #FFFFFF;
      border-radius: 20rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.95);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      }

      .similar-image-container {
        position: relative;
        width: 100%;
        height: 120rpx;

        .similar-image {
          width: 100%;
          height: 100%;
          background: #EDF2F7;
        }

        .similar-price {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 8rpx;

          .price-amount {
            font-size: 20rpx;
            color: #FFFFFF;
            font-weight: 700;
          }

          .price-unit {
            font-size: 20rpx * 0.8;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }

      .similar-info {
        padding: 16rpx;

        .similar-name {
          font-size: 20rpx;
          color: #333333;
          font-weight: 500;
          margin-bottom: 8rpx;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .similar-specs {
          font-size: 20rpx * 0.8;
          color: #999999;
          display: block;
        }
      }
    }
  }
}

// Bottom Booking Bar
.bottom-booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 32rpx;
  border-top: 2rpx solid #E8E8E8;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  gap: 32rpx;
  z-index: 100;

  .favorite-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 24rpx;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    .active {
      background: #F8F8F8;
      transform: scale(0.95);
    }

    .favorite-text {
      font-size: 20rpx;
      color: #999999;
    }
  }

  .action-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32rpx;

    .price-display {
      display: flex;
      align-items: baseline;
      gap: 2rpx;

      .daily-price {
        font-size: 36rpx;
        font-weight: 700;
        color: #FF6B35;
      }

      .price-unit {
        font-size: 24rpx;
        color: #666666;
      }
    }

    .reserve-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 20rpx;
      padding: 24rpx 0;
      font-size: 28rpx;
      font-weight: 600;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      }

      .disabled {
        background: #EDF2F7;
        color: #CCCCCC;
        box-shadow: none;
        transform: none;

        .active {
          transform: none;
        }
      }

      &::after {
        border: none;
      }
    }
  }
}

// Old Booking Bar (keeping for compatibility)
.booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 48rpx 32rpx;
  border-top: 1rpx solid rgba(#E8E8E8, 0.6);
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 32rpx;
  z-index: 100;

  .price-info {
    flex: 1;

    .price-current {
      display: flex;
      align-items: baseline;
      gap: 2rpx;
      margin-bottom: 8rpx;

      .current-price {
        font-size: 36rpx;
        font-weight: 700;
        color: #FF6B35;
      }

      .price-unit {
        font-size: 24rpx;
        color: #666666;
      }
    }

    .price-note {
      font-size: 20rpx;
      color: #999999;
    }
  }

  .booking-actions {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .contact-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 24rpx 32rpx;
      background: rgba(#FF6B35, 0.1);
      border-radius: 20rpx;
      border: 2rpx solid #FF6B35;
      transition: all 0.3s ease;

      .active {
        transform: scale(0.95);
        background: rgba(#FF6B35, 0.2);
      }

      .contact-text {
        font-size: 24rpx;
        color: #FF6B35;
        font-weight: 500;
      }
    }

    .booking-btn {
      display: flex;
      align-items: center;
      gap: 24rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 24rpx;
      padding: 48rpx 80rpx;
      font-size: 28rpx;
      font-weight: 600;
      box-shadow: 0 8rpx 24rpx rgba(#FF6B35, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
      }

      .active::before {
        left: 100%;
      }

      .active {
        transform: translateY(2rpx);
        box-shadow: 0 4rpx 16rpx rgba(#FF6B35, 0.25);
      }

      &::after {
        border: none;
      }

      .btn-text {
        font-weight: 600;
        letter-spacing: 1rpx;
      }
    }
  }
}

// Loading and Error States
.loading-container,
.error-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content,
  .error-content {
    text-align: center;
    padding: 80rpx;

    .loading-spinner {
      width: 64rpx;
      height: 64rpx;
      border: 6rpx solid #E8E8E8;
      border-top: 6rpx solid #FF6B35;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 32rpx;
    }

    .loading-text {
      font-size: 28rpx;
      color: #666666;
      font-weight: 500;
    }

    .error-icon {
      width: 120rpx;
      height: 120rpx;
      background: rgba(#FC8181, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32rpx;
    }

    .error-text {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 48rpx;
      line-height: 1.5;
    }

    .retry-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 20rpx;
      padding: 24rpx 48rpx;
      font-size: 24rpx;
      font-weight: 500;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      .active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
      }

      &::after {
        border: none;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
