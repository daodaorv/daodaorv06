<!-- 首页 - 100%还原原型图设计 -->
<template>
  <view class="home-page">
    <!-- 顶部滚动通知栏 -->
    <NoticeBanner
      :notices="notices"
      :show-more="true"
      @notice-click="handleNoticeClick"
      @more-click="handleMoreClick"
    />

    <!-- 应用标题区域 -->
    <view class="app-header">
      <view class="app-title">叨叨房车</view>
      <view class="app-subtitle">让房车生活更美好</view>
      <view class="notification-icon" @click="handleNotificationClick">
        <uni-icons type="bell-filled" size="20" color="#FFFFFF" />
        <view v-if="unreadCount > 0" class="notification-badge">
          <text class="badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
        </view>
      </view>
    </view>

    <!-- 房车轮播图 -->
    <view class="vehicle-banner-section">
      <swiper
        class="vehicle-banner"
        circular
        autoplay
        :interval="4000"
        :duration="500"
        @change="onBannerChange"
      >
        <swiper-item v-for="(banner, index) in vehicleBanners" :key="index">
          <view class="banner-slide" @tap="handleBannerClick(banner)">
            <image class="banner-image" :src="banner.image" mode="aspectFill" />
            <view class="banner-content">
              <text class="banner-title">{{ banner.title }}</text>
              <text class="banner-subtitle">{{ banner.subtitle }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="banner-dots">
        <view
          v-for="(banner, index) in vehicleBanners"
          :key="index"
          class="banner-dot"
          :class="{ active: currentBannerIndex === index }"
        ></view>
      </view>
    </view>

    <!-- 房车预订表单 -->
    <BookingForm
      :model-value="bookingData"
      @update:model-value="bookingData = $event"
      :title="'开启房车之旅'"
      :subtitle="'选择取还车时间和地点'"
      :search-button-text="'查询可用房车'"
      :show-tip="true"
      :tip-text="'平台拥有100+房车型号，覆盖全国50+城市'"
      @city-select="handleCitySelect"
      @store-select="handleStoreSelect"
      @date-select="handleDateSelect"
      @time-select="handleTimeSelect"
      @search="handleSearch"
    />

    <!-- 金刚区功能入口 -->
    <view class="features-section">
      <ServiceGrid
        :services="featureServices"
        :columns="3"
        :compact="false"
        @service-click="handleFeatureClick"
      />
    </view>

    <!-- 营销引导区 -->
    <view class="marketing-section">
      <view class="marketing-cards">
        <!-- 领券中心 -->
        <view class="marketing-card marketing-card--coupon" @click="handleCouponCenter">
          <view class="marketing-card__content">
            <view class="marketing-card__header">
              <uni-icons type="gift-filled" size="24" color="#FF9F29" />
              <text class="marketing-card__title">领券中心</text>
            </view>
            <text class="marketing-card__subtitle">新人专享优惠券</text>
            <view class="marketing-card__action">
              <text class="action-text">立即领取</text>
              <uni-icons type="right" size="16" color="#FF9F29" />
            </view>
          </view>
          <view class="marketing-card__icon">
            <text class="icon-text">券</text>
          </view>
        </view>

        <!-- PLUS会员 -->
        <view class="marketing-card marketing-card--vip" @click="handleVipCenter">
          <view class="marketing-card__content">
            <view class="marketing-card__header">
              <uni-icons type="vip-filled" size="24" color="#8860D0" />
              <text class="marketing-card__title">PLUS会员</text>
            </view>
            <text class="marketing-card__subtitle">尊享专属特权</text>
            <view class="marketing-card__action">
              <text class="action-text">立即开通</text>
              <uni-icons type="right" size="16" color="#8860D0" />
            </view>
          </view>
          <view class="marketing-card__icon">
            <text class="icon-text">VIP</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐内容区 -->
    <view class="recommendation-section">
      <!-- 分段控制器 -->
      <uni-segmented-control
        :current="activeTabIndex"
        :values="tabOptions.map(option => option.label)"
        @clickItem="handleTabChange"
        style-type="text"
        active-color="#FF9F29"
      />

      <!-- 内容区域 -->
      <view class="content-container">
        <!-- 房车推荐 -->
        <view v-if="activeTab === 'vehicles'" class="vehicles-recommendation">
          <view class="recommendation-header">
            <text class="recommendation-title">精选房车</text>
            <text class="recommendation-subtitle">为您推荐优质房车</text>
          </view>
          <view class="vehicles-grid">
            <view
              v-for="vehicle in recommendedVehicles"
              :key="vehicle.id"
              class="vehicle-item"
              @click="handleVehicleClick(vehicle)"
            >
              <image class="vehicle-image" :src="vehicle.image" mode="aspectFill" />
              <view class="vehicle-info">
                <text class="vehicle-name">{{ vehicle.name }}</text>
                <text class="vehicle-price">¥{{ vehicle.price }}/天</text>
              </view>
              <view class="vehicle-tags">
                <text
                  v-for="tag in vehicle.tags"
                  :key="tag"
                  class="vehicle-tag"
                >{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 社区精选 -->
        <view v-if="activeTab === 'community'" class="community-content">
          <view class="recommendation-header">
            <text class="recommendation-title">社区精选</text>
            <text class="recommendation-subtitle">发现精彩房车生活</text>
          </view>
          <view class="waterfall-container">
            <view class="waterfall-column">
              <WaterfallItem
                v-for="post in leftColumnPosts"
                :key="post.id"
                :item="post"
                :show-stats="true"
                :is-liked="false"
                @click="handlePostClick"
              />
            </view>
            <view class="waterfall-column">
              <WaterfallItem
                v-for="post in rightColumnPosts"
                :key="post.id"
                :item="post"
                :show-stats="true"
                :is-liked="false"
                @click="handlePostClick"
              />
            </view>
          </view>
        </view>

        <!-- 旅行攻略 -->
        <view v-if="activeTab === 'guides'" class="guides-content">
          <view class="recommendation-header">
            <text class="recommendation-title">旅行攻略</text>
            <text class="recommendation-subtitle">精选房车路线推荐</text>
          </view>
          <view class="guides-list">
            <view
              v-for="guide in travelGuides"
              :key="guide.id"
              class="guide-item"
              @click="handleGuideClick(guide)"
            >
              <image class="guide-image" :src="guide.image" mode="aspectFill" />
              <view class="guide-info">
                <text class="guide-title">{{ guide.title }}</text>
                <text class="guide-description">{{ guide.description }}</text>
                <view class="guide-meta">
                  <text class="guide-author">{{ guide.author }}</text>
                  <text class="guide-views">{{ guide.views }}次浏览</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app';

// 导入组件 - 使用easycom自动导入，无需手动引入
// import NoticeBanner from '@/components/base/NoticeBanner.vue';
// import BookingForm from '@/components/form/BookingForm.vue';
// import ServiceGrid from '@/components/business/ServiceGrid.vue';
// import WaterfallItem from '@/components/content/WaterfallItem.vue';

// 页面状态
const currentBannerIndex = ref(0);
const activeTab = ref('vehicles');
const activeTabIndex = ref(0);
const unreadCount = ref(3);

// 预订表单数据
const bookingData = ref({
  pickupCity: '',
  pickupStore: '',
  pickupDate: '',
  pickupTime: '',
  returnCity: '',
  returnStore: '',
  returnDate: '',
  returnTime: '',
  differentReturn: false
});

// 通知列表
const notices = ref([
  { id: 1, text: '新用户专享50元优惠券，限时领取！', type: 'info' },
  { id: 2, text: '五一假期房车预订火热进行中', type: 'warning' },
  { id: 3, text: 'PLUS会员享受专属特权优惠', type: 'success' }
]);

// 房车轮播图
const vehicleBanners = ref([
  {
    id: 1,
    title: '豪华房车',
    subtitle: '舒适旅途，品质生活',
    image: '/static/default-vehicle.png',
    link: '/pages/vehicles/index'
  },
  {
    id: 2,
    title: '经济实惠',
    subtitle: '超值价格，畅享自由',
    image: '/static/default-vehicle.png',
    link: '/pages/vehicles/index'
  },
  {
    id: 3,
    title: '家庭出游',
    subtitle: '大空间设计，全家同乐',
    image: '/static/default-vehicle.png',
    link: '/pages/vehicles/index'
  }
]);

// 金刚区功能服务
const featureServices = ref([
  {
    id: 1,
    title: '房车租赁',
    icon: 'car-filled',
    iconColor: '#FF9F29',
    link: '/pages/vehicles/index',
    badge: '热门'
  },
  {
    id: 2,
    title: '营地预订',
    icon: 'home-filled',
    iconColor: '#67C23A',
    link: '/pages/camping/index'
  },
  {
    id: 3,
    title: '旅行攻略',
    icon: 'location-filled',
    iconColor: '#4B91FF',
    link: '/pages/travel/index'
  },
  {
    id: 4,
    title: '房车托管',
    icon: 'shop-filled',
    iconColor: '#8860D0',
    link: '/pages/service/index'
  },
  {
    id: 5,
    title: '种草社区',
    icon: 'person-filled',
    iconColor: '#FF9F29',
    link: '/pages/community/index'
  },
  {
    id: 6,
    title: '会员中心',
    icon: 'vip-filled',
    iconColor: '#8860D0',
    link: '/pages/vip/index'
  }
]);

// 分段控制选项
const tabOptions = ref([
  { label: '房车推荐', value: 'vehicles' },
  { label: '社区精选', value: 'community' },
  { label: '旅行攻略', value: 'guides' }
]);

// 推荐房车
const recommendedVehicles = ref([
  {
    id: 1,
    name: '豪华C型房车',
    image: '/static/default-vehicle.png',
    price: 699,
    tags: ['自动挡', '可睡6人', '热门']
  },
  {
    id: 2,
    name: '经济B型房车',
    image: '/static/default-vehicle.png',
    price: 399,
    tags: ['手动挡', '可睡4人', '性价比']
  },
  {
    id: 3,
    name: '家庭A型房车',
    image: '/static/default-vehicle.png',
    price: 899,
    tags: ['自动挡', '可睡8人', '豪华']
  },
  {
    id: 4,
    name: '情侣迷你房车',
    image: '/static/default-vehicle.png',
    price: 299,
    tags: ['自动挡', '可睡2人', '舒适']
  }
]);

// 社区精选内容
const communityPosts = ref([
  {
    id: 1,
    title: '第一次房车旅行的完美体验',
    description: '分享我第一次房车旅行的精彩经历和注意事项',
    image: '/static/default-article.png',
    tags: ['旅行经验', '新手指南'],
    user: {
      name: '房车达人',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    stats: {
      likes: 128,
      comments: 23,
      views: 856
    }
  },
  {
    id: 2,
    title: '房车改装心得分享',
    description: '如何把普通房车改造成移动的家',
    image: '/static/default-article.png',
    tags: ['改装', 'DIY'],
    user: {
      name: '改装专家',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    stats: {
      likes: 256,
      comments: 45,
      views: 1234
    }
  },
  {
    id: 3,
    title: '最美房车路线推荐',
    description: '这条绝美的房车路线让人流连忘返',
    image: '/static/default-article.png',
    tags: ['路线推荐', '风景'],
    user: {
      name: '旅行家',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    stats: {
      likes: 189,
      comments: 67,
      views: 2341
    }
  },
  {
    id: 4,
    title: '房车露营必备装备清单',
    description: '详细整理房车露营所需的装备和用品',
    image: '/static/default-article.png',
    tags: ['露营', '装备'],
    user: {
      name: '露营达人',
      avatar: '/static/default-avatar.png',
      time: new Date(Date.now() - 48 * 60 * 60 * 1000)
    },
    stats: {
      likes: 342,
      comments: 89,
      views: 3456
    }
  }
]);

// 旅行攻略
const travelGuides = ref([
  {
    id: 1,
    title: '川西环线房车自驾攻略',
    description: '详细规划川西环线路线，包含景点介绍和注意事项',
    image: '/static/default-article.png',
    author: '旅行达人',
    views: 1234
  },
  {
    id: 2,
    title: '新疆房车旅行完全指南',
    description: '新疆地区房车旅行的完整指南，包含路线、住宿、美食推荐',
    image: '/static/default-article.png',
    author: '西部游侠',
    views: 2345
  }
]);

// 瀑布流左右列数据
const leftColumnPosts = computed(() => communityPosts.value.filter((_, i) => i % 2 === 0));
const rightColumnPosts = computed(() => communityPosts.value.filter((_, i) => i % 2 === 1));

// 生命周期
onLoad(() => {
  initDefaultData();
});

onShow(() => {
  loadUnreadCount();
});

onPullDownRefresh(() => {
  setTimeout(() => {
    uni.stopPullDownRefresh();
  }, 1000);
});

// 初始化默认数据
function initDefaultData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  bookingData.value.pickupDate = formatDate(tomorrow);
  bookingData.value.returnDate = formatDate(dayAfter);
  bookingData.value.pickupTime = '10:00';
  bookingData.value.returnTime = '18:00';
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 加载未读消息数量
function loadUnreadCount() {
  // 模拟从服务器获取未读消息数量
  unreadCount.value = Math.floor(Math.random() * 10);
}

// Banner切换
function onBannerChange(e: any) {
  currentBannerIndex.value = e.detail.current;
}

// 事件处理函数
function handleNoticeClick(notice: any) {
  console.log('Notice clicked:', notice);
}

function handleMoreClick() {
  uni.navigateTo({ url: '/pages/notice/list' });
}

function handleNotificationClick() {
  uni.navigateTo({ url: '/pages/notification/list' });
}

function handleBannerClick(banner: any) {
  if (banner.link) {
    uni.navigateTo({ url: banner.link });
  }
}

function handleCitySelect(type: string) {
  // 这里可以打开城市选择页面
  uni.showToast({ title: `选择${type === 'pickup' ? '取车' : '还车'}城市`, icon: 'none' });
}

function handleStoreSelect(type: string) {
  // 这里可以打开门店选择页面
  uni.showToast({ title: `选择${type === 'pickup' ? '取车' : '还车'}门店`, icon: 'none' });
}

function handleDateSelect(type: string) {
  // 这里可以打开日期选择器
  uni.showToast({ title: `选择${type === 'pickup' ? '取车' : '还车'}日期`, icon: 'none' });
}

function handleTimeSelect(type: string) {
  // 这里可以打开时间选择器
  uni.showToast({ title: `选择${type === 'pickup' ? '取车' : '还车'}时间`, icon: 'none' });
}

function handleSearch(data: any) {
  // 跳转到车辆列表页面并传递搜索参数
  uni.setStorageSync('searchParams', data);
  uni.switchTab({ url: '/pages/vehicles/index' });
}

function handleFeatureClick(service: any, index: number) {
  console.log('Feature clicked:', service, index);
}

function handleCouponCenter() {
  uni.navigateTo({ url: '/pages/coupon/list' });
}

function handleVipCenter() {
  uni.navigateTo({ url: '/pages/vip/index' });
}

function handleTabChange(e: any) {
  const index = e.currentIndex;
  activeTabIndex.value = index;
  activeTab.value = tabOptions.value[index].value;
  console.log('Tab changed:', tabOptions.value[index].value, index);
}

function handleVehicleClick(vehicle: any) {
  uni.navigateTo({ url: `/pages/vehicles/detail?id=${vehicle.id}` });
}

function handlePostClick(post: any) {
  uni.navigateTo({ url: `/pages/community/detail?id=${post.id}` });
}

function handleGuideClick(guide: any) {
  uni.navigateTo({ url: `/pages/travel/detail?id=${guide.id}` });
}
</script>

<style>
/* CSS变量定义 */
page {
  --primary-orange: #FF9F29;
  --primary-orange-light: rgba(255, 159, 41, 0.1);
  --member-purple: #8860D0;
  --member-purple-light: rgba(136, 96, 208, 0.1);
  --success-green: #67C23A;
  --error-red: #FF4D4F;
  --info-blue: #4B91FF;
  --warning-yellow: #E6A23C;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-placeholder: #CCCCCC;
  --text-white: #FFFFFF;
  --bg-page: #F8F8F8;
  --bg-card: #FFFFFF;
  --bg-section: #FAFAFA;
  --border-light: #E8E8E8;
  --border-medium: #DDDDDD;
  --border-dark: #CCCCCC;
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --spacing-xl: 48rpx;
  --spacing-xxl: 80rpx;
  --radius-xs: 8rpx;
  --radius-sm: 12rpx;
  --radius-md: 16rpx;
  --radius-lg: 20rpx;
  --radius-xl: 24rpx;
  --radius-round: 50rpx;
  --radius-circle: 50%;
  --shadow-light: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  --shadow-medium: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  --shadow-heavy: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  --shadow-card: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  --font-xs: 20rpx;
  --font-sm: 24rpx;
  --font-md: 28rpx;
  --font-lg: 32rpx;
  --font-xl: 36rpx;
  --font-2xl: 40rpx;
  --font-3xl: 48rpx;
  --weight-light: 300;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-loose: 1.6;
  --container-padding: 30rpx;
  --container-margin: 30rpx;
  --card-padding: 30rpx;
  --safe-area-bottom: calc(120rpx + env(safe-area-inset-bottom));
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
  --transition-slow: 0.4s;
  --ease-out: ease-out;
  --ease-in-out: ease-in-out;
}

.home-page {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding-bottom: var(--safe-area-bottom);
}

.app-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) var(--container-padding) var(--spacing-md);
  background-color: var(--primary-orange);
  color: var(--text-white);
}

.app-header .app-title {
  font-size: var(--font-2xl);
  font-weight: var(--weight-bold);
  margin-bottom: 4rpx;
}

.app-header .app-subtitle {
  font-size: var(--font-sm);
  opacity: 0.9;
}

.app-header .notification-icon {
  position: absolute;
  right: var(--container-padding);
  top: 50%;
  transform: translateY(-50%);
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-circle);
  background-color: rgba(255, 255, 255, 0.2);
}

.app-header .notification-icon:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.app-header .notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--error-red);
  border-radius: var(--radius-round);
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid var(--primary-orange);
}

.app-header .notification-badge .badge-text {
  font-size: var(--font-xs);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.vehicle-banner-section {
  margin: var(--spacing-lg) var(--container-padding);
  position: relative;
}

.vehicle-banner-section .vehicle-banner {
  height: 320rpx;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.vehicle-banner-section .banner-slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.vehicle-banner-section .banner-slide .banner-image {
  width: 100%;
  height: 100%;
}

.vehicle-banner-section .banner-slide .banner-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: var(--spacing-lg);
  color: var(--text-white);
}

.vehicle-banner-section .banner-slide .banner-content .banner-title {
  display: block;
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  margin-bottom: 4rpx;
}

.vehicle-banner-section .banner-slide .banner-content .banner-subtitle {
  font-size: var(--font-sm);
  opacity: 0.9;
}

.vehicle-banner-section .banner-dots {
  position: absolute;
  bottom: var(--spacing-md);
  right: var(--spacing-lg);
  display: flex;
  gap: 8rpx;
}

.vehicle-banner-section .banner-dots .banner-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: var(--radius-circle);
  background-color: rgba(255, 255, 255, 0.5);
  transition: all var(--transition-fast);
}

.vehicle-banner-section .banner-dots .banner-dot.active {
  width: 40rpx;
  border-radius: var(--radius-round);
  background-color: var(--primary-orange);
}

.features-section {
  margin: var(--spacing-xl) 0;
}

.marketing-section {
  margin: var(--spacing-xl) var(--container-padding);
}

.marketing-section .marketing-cards {
  display: flex;
  gap: var(--spacing-md);
}

.marketing-section .marketing-cards .marketing-card {
  flex: 1;
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 2rpx solid var(--border-light);
  transition: all var(--transition-fast);
}

.marketing-section .marketing-cards .marketing-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-medium);
}

.marketing-section .marketing-cards .marketing-card--coupon {
  border-color: rgba(255, 159, 41, 0.3);
}

.marketing-section .marketing-cards .marketing-card--coupon .marketing-card__icon {
  background: linear-gradient(135deg, var(--primary-orange), #FFB84D);
}

.marketing-section .marketing-cards .marketing-card--vip {
  border-color: rgba(136, 96, 208, 0.3);
}

.marketing-section .marketing-cards .marketing-card--vip .marketing-card__icon {
  background: linear-gradient(135deg, var(--member-purple), #A78BDB);
}

.marketing-section .marketing-cards .marketing-card__content {
  position: relative;
  z-index: 2;
}

.marketing-section .marketing-cards .marketing-card__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.marketing-section .marketing-cards .marketing-card__title {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.marketing-section .marketing-cards .marketing-card__subtitle {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  display: block;
}

.marketing-section .marketing-cards .marketing-card__action {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.marketing-section .marketing-cards .marketing-card .action-text {
  font-size: var(--font-sm);
  color: inherit;
  font-weight: var(--weight-medium);
}

.marketing-section .marketing-cards .marketing-card__icon {
  position: absolute;
  top: calc(-1 * var(--spacing-md));
  right: calc(-1 * var(--spacing-md));
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.marketing-section .marketing-cards .marketing-card__icon .icon-text {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--text-white);
}

.recommendation-section {
  margin: var(--spacing-xl) 0;
}

.recommendation-section .content-container {
  margin-top: var(--spacing-lg);
}

.recommendation-section .recommendation-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--container-padding);
}

.recommendation-section .recommendation-header .recommendation-title {
  display: block;
  font-size: var(--font-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.recommendation-section .recommendation-header .recommendation-subtitle {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.recommendation-section .vehicles-recommendation .vehicles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: 0 var(--container-padding);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-light);
  transition: all var(--transition-fast);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-medium);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-image {
  width: 100%;
  height: 200rpx;
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-info {
  padding: var(--spacing-sm);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-info .vehicle-name {
  display: block;
  font-size: var(--font-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-info .vehicle-price {
  font-size: var(--font-lg);
  font-weight: var(--weight-bold);
  color: var(--primary-orange);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-tags {
  display: flex;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm) var(--spacing-sm);
}

.recommendation-section .vehicles-recommendation .vehicles-grid .vehicle-item .vehicle-tags .vehicle-tag {
  font-size: var(--font-xs);
  color: var(--primary-orange);
  background-color: var(--primary-orange-light);
  padding: 2rpx 8rpx;
  border-radius: var(--radius-round);
}

.recommendation-section .community-content .waterfall-container {
  display: flex;
  gap: var(--spacing-md);
  padding: 0 var(--container-padding);
}

.recommendation-section .community-content .waterfall-container .waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recommendation-section .guides-content .guides-list {
  padding: 0 var(--container-padding);
}

.recommendation-section .guides-content .guides-list .guide-item {
  display: flex;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-light);
  transition: all var(--transition-fast);
}

.recommendation-section .guides-content .guides-list .guide-item:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-medium);
}

.recommendation-section .guides-content .guides-list .guide-item .guide-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: var(--radius-md);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info {
  flex: 1;
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info .guide-title {
  display: block;
  font-size: var(--font-md);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  margin-bottom: 4rpx;
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info .guide-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  display: block;
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info .guide-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info .guide-meta .guide-author {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.recommendation-section .guides-content .guides-list .guide-item .guide-info .guide-meta .guide-views {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
}

.safe-bottom {
  height: var(--spacing-lg);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .marketing-section .marketing-cards {
    flex-direction: column;
  }

  .recommendation-section .vehicles-recommendation .vehicles-grid {
    grid-template-columns: 1fr;
  }
}
</style>