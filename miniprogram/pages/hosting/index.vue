<template>
  <view class="hosting-center">
    <!-- 1. 顶部公告栏 (通透设计) -->
    <view class="notice-banner" v-if="notices.length > 0">
      <swiper class="notice-swiper" vertical :autoplay="true" :interval="3000" :circular="true">
        <swiper-item v-for="notice in notices" :key="notice.id">
          <view class="notice-item" @click="handleNoticeClick(notice)">
            <view class="notice-tag">公告</view>
            <text class="notice-text">{{ notice.content }}</text>
            <u-icon name="arrow-right" size="14" color="#CCCCCC"></u-icon>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 2. 我的托管收益卡片 (沉浸式卡片) -->
    <view class="income-section">
      <view class="income-card">
        <!-- 未登录状态 -->
        <view v-if="!isLogin" class="login-prompt">
          <view class="prompt-content">
            <text class="prompt-title">开启托管新生活</text>
            <text class="prompt-subtitle">让闲置房车为您创造持续收益</text>
          </view>
          <button class="start-hosting-btn-glass" @click="scrollToFeatures">立即开启</button>
        </view>

        <!-- 已登录且有托管车辆 -->
        <view v-else-if="hasHostingVehicles" class="income-info">
          <view class="income-header">
            <view class="header-left">
              <text class="header-title">我的托管收益</text>
              <view class="live-tag">
                <view class="live-dot"></view>实时更新
              </view>
            </view>
            <button
              class="withdraw-btn-glass"
              :disabled="incomeData.totalIncome < 100"
              @click="handleWithdraw"
            >
              {{ incomeData.totalIncome < 100 ? '满100提现' : '立即提现' }}
            </button>
          </view>
          
          <view class="income-main">
            <text class="currency-symbol">¥</text>
            <text class="total-amount">{{ incomeData.totalIncome }}</text>
            <text class="label">累计总收益</text>
          </view>

          <view class="income-grid">
            <view class="income-item">
              <text class="item-value">¥{{ incomeData.todayPending }}</text>
              <text class="item-label">今日待结算</text>
            </view>
            <view class="vertical-divider"></view>
            <view class="income-item">
              <text class="item-value">¥{{ incomeData.monthEstimate }}</text>
              <text class="item-label">本月预估</text>
            </view>
          </view>
        </view>

        <!-- 已登录但无托管车辆 -->
        <view v-else class="no-vehicle-prompt">
          <view class="glass-container">
            <image class="prompt-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
            <text class="prompt-text">您还没有托管车辆</text>
            <button class="start-hosting-btn-light" @click="scrollToFeatures">立即托管</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 我的托管车辆 (大卡片布局) -->
    <view v-if="isLogin && hasHostingVehicles" class="my-vehicles">
      <view class="section-header">
        <text class="section-title">托管车辆</text>
        <view v-if="vehicles.length > 3" class="view-all" @click="viewAllVehicles">
          全部 <u-icon name="arrow-right" size="14" color="#888888"></u-icon>
        </view>
      </view>
      <view class="vehicle-list">
        <view
          v-for="vehicle in displayVehicles"
          :key="vehicle.id"
          class="vehicle-card"
          @click="goToVehicleDetail(vehicle.id)"
        >
          <view class="vehicle-image-wrapper">
            <image :src="vehicle.thumbnail" class="vehicle-img" mode="aspectFill"></image>
            <view class="vehicle-status-tag" :class="'status-' + vehicle.status">
              {{ vehicle.statusText }}
            </view>
          </view>
          
          <view class="vehicle-info">
            <view class="vehicle-base">
              <text class="plate-number">{{ vehicle.plateNumber }}</text>
              <button class="action-btn" @click.stop="applySelfUse(vehicle)">自用</button>
            </view>
            
            <view class="vehicle-data-grid">
              <view class="data-item">
                <text class="data-label">今日收益</text>
                <text class="data-value">¥{{ vehicle.todayIncome.toFixed(2) }}</text>
              </view>
              <view class="data-item">
                <text class="data-label">本月收益</text>
                <text class="data-value">¥{{ vehicle.monthIncome.toFixed(2) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 4. 核心功能区 (Idle & New Car) -->
    <view class="feature-section core-features" id="features">
      <view class="section-header">
        <text class="section-title">托管服务</text>
      </view>
      <view class="feature-grid-core">
        <!-- 众筹托管 -->
        <view class="feature-card-core" @click="goToCrowdfunding">
          <view class="core-content">
            <text class="core-title">众筹托管</text>
            <text class="core-subtitle">按份额共享收益</text>
            <view class="core-badge trust-blue">低门槛高回报</view>
          </view>
          <view class="core-icon-wrapper">
            <u-icon name="grid-fill" size="40" color="#2979FF"></u-icon>
          </view>
        </view>

        <!-- 购车托管 -->
        <view class="feature-card-core" @click="goToNewCarHosting">
          <view class="core-content">
            <text class="core-title">购车托管</text>
            <text class="core-subtitle">保底收益+高分成</text>
            <view class="core-badge blue">保底3500/月</view>
          </view>
          <view class="core-icon-wrapper">
            <u-icon name="car-fill" size="40" color="#2979FF"></u-icon>
          </view>
        </view>

        <!-- 自有车托管 -->
        <view class="feature-card-core" @click="goToOldCarHosting">
          <view class="core-content">
            <text class="core-title">闲置托管</text>
            <text class="core-subtitle">自有车入驻赚收益</text>
            <view class="core-badge orange">车主70%分成</view>
          </view>
          <view class="core-icon-wrapper">
            <u-icon name="car" size="40" color="#FF9F29"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 5. 辅助功能区 (Share & Guide) -->
    <view class="feature-section aux-features">
       <view class="feature-grid-aux">
        <!-- 分享 -->
        <view class="feature-card-aux" @click="handleShare">
          <view class="aux-left">
            <view class="aux-icon-wrapper share-icon">
              <u-icon name="share" size="32" color="#FF9F29"></u-icon>
            </view>
            <view class="aux-info">
              <text class="aux-title">分享服务</text>
              <text class="aux-desc">邀请好友推广有奖</text>
            </view>
          </view>
          <u-icon name="arrow-right" size="14" color="#CCCCCC"></u-icon>
        </view>

        <!-- 协议与帮助 -->
        <view class="feature-card-aux" @click="goToAgreement">
           <view class="aux-left">
            <view class="aux-icon-wrapper agreement-icon">
              <u-icon name="file-text" size="32" color="#2196F3"></u-icon>
            </view>
            <view class="aux-info">
              <text class="aux-title">服务指南</text>
              <text class="aux-desc">了解托管协议与帮助</text>
            </view>
          </view>
          <u-icon name="arrow-right" size="14" color="#CCCCCC"></u-icon>
        </view>
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
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app';
import { useShare } from '@/composables/useShare';
import { ShareScene } from '@/types/share';
import { isLoggedIn } from '@/utils/auth';
import ShareSheet from '@/components/share/ShareSheet.vue';
import PosterPreview from '@/components/share/PosterPreview.vue';
import { mockHostingIncome, mockHostingVehicles, mockHostingNotices } from '@/mock';

// 数据定义
const isLogin = ref(false);
const hasHostingVehicles = ref(false);
const notices = ref([
  { id: 1, content: '托管车辆享受平台统保，车主零保险成本' },
  { id: 2, content: '淡季补贴最高1000元/月，让您收益更稳定' },
  { id: 3, content: '新用户托管立享首月额外10%收益加成' }
]);
const incomeData = ref({
  totalIncome: 0,
  todayPending: 0,
  monthEstimate: 0
});
const vehicles = ref<any[]>([]);
const displayVehicles = computed(() => vehicles.value.slice(0, 3));

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
  title: '【叨叨房车】车辆托管服务',
  desc: '专业托管，轻松赚钱，让您的房车为您创造收益',
  imageUrl: '/static/logo.png',
  path: '/pages/hosting/index',
  scene: ShareScene.HOSTING,
  businessId: 'hosting_center',
  query: {}
});

/**
 * 页面加载时初始化
 */
onLoad((options: any) => {
  // 检查登录状态（不强制登录）
  checkLoginStatus();

  // 如果已登录，加载托管数据
  if (isLogin.value) {
    loadHostingData();
  }

  // 处理分享来源
  if (options.share_from) {
    logger.info('来自分享', {
      scene: options.share_scene,
      from: options.share_from,
      businessId: options.share_id
    });
  }
});

/**
 * 页面显示时刷新登录状态
 */
onShow(() => {
  // 刷新登录状态
  checkLoginStatus();

  // 如果已登录，刷新托管数据
  if (isLogin.value) {
    loadHostingData();
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

// 方法定义
const checkLoginStatus = () => {
  // 检查真实登录状态
  isLogin.value = isLoggedIn();

  // Mock数据：模拟托管车辆状态（实际应该从API获取）
  if (isLogin.value) {
    hasHostingVehicles.value = true;
  } else {
    hasHostingVehicles.value = false;
  }
};

const loadHostingData = () => {
  // 使用集中管理的Mock数据
  incomeData.value = mockHostingIncome;
  vehicles.value = mockHostingVehicles;
};

// 平滑滚动到功能区
const scrollToFeatures = () => {
  uni.pageScrollTo({
    selector: '#features',
    duration: 300
  });
};

// 提现
const handleWithdraw = () => {
  if (incomeData.value.totalIncome < 100) {
    uni.showToast({
      title: '满100元可提现',
      icon: 'none'
    });
    return;
  }
  uni.navigateTo({
    url: '/pages/hosting/income/index?action=withdraw'
  });
};

// 查看全部车辆
const viewAllVehicles = () => {
  uni.navigateTo({
    url: '/pages/hosting/vehicle-list/index'
  });
};

// 车主自用申请
const applySelfUse = (vehicle: any) => {
  uni.navigateTo({
    url: `/pages/hosting/self-use/index?vehicleId=${vehicle.id}`
  });
};

// 跳转到车辆详情
const goToVehicleDetail = (vehicleId: number) => {
  uni.navigateTo({
    url: `/pages/hosting/vehicle-detail/index?id=${vehicleId}`
  });
};

// 跳转到托管协议
const goToAgreement = () => {
  uni.navigateTo({
    url: '/pages/hosting/agreement/index'
  });
};

// 跳转到自有车托管
const goToOldCarHosting = () => {
  uni.navigateTo({
    url: '/pages/hosting/old-car/index'
  });
};

// 跳转到购车托管
const goToNewCarHosting = () => {
  uni.navigateTo({
    url: '/pages/hosting/new-car/index'
  });
};

// 跳转到众筹托管
const goToCrowdfunding = () => {
  uni.navigateTo({
    url: '/pages/hosting/crowdfunding/index'
  });
};

// 公告点击
const handleNoticeClick = (notice: any) => {
  logger.debug('点击公告:', notice);
};
</script>

<style scoped lang="scss">
// Design Tokens - Modern Journey Theme
$hosting-bg-color: #F8F9FC;
$card-bg-color: #FFFFFF;
$primary-gradient: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
$shadow-sm: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
$shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
$shadow-glow: 0 12rpx 32rpx rgba(255, 159, 41, 0.15);
$font-family-num: 'DIN Alternate', -apple-system, sans-serif;

.hosting-center {
  min-height: 100vh;
  background-color: $hosting-bg-color;
  padding-bottom: 60rpx;
}

// 1. 公告栏
.notice-banner {
  height: 80rpx;
  background: rgba(255, 159, 41, 0.08);
  margin: 20rpx 32rpx;
  border-radius: 40rpx; // 全圆角
  overflow: hidden;
}

.notice-swiper {
  height: 100%;
}

.notice-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24rpx;
}

.notice-tag {
  background: #FF9F29;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.notice-text {
  font-size: 24rpx;
  color: #555;
  flex: 1;
  width: 0; // 配合 text-ellipsis
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-arrow {
  color: #ccc;
  font-size: 32rpx;
  margin-left: 16rpx;
}

// 2. 收益卡片区
.income-section {
  padding: 0 32rpx;
  margin-bottom: 40rpx;
}

.income-card {
  position: relative;
  background: $primary-gradient;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: $shadow-glow;
  color: #fff;
  overflow: hidden;
  
  // 装饰纹理
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

// 未登录引导
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20rpx 0;
}

.prompt-content {
  margin-bottom: 40rpx;
}

.prompt-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}

.prompt-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
  display: block;
}

.start-hosting-btn-glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.35);
  }
}

.glass-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.start-hosting-btn-light {
  background: #fff;
  color: #FF9F29;
  font-size: 30rpx;
  font-weight: 600;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  margin-top: 32rpx;
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

// 收益详情
.income-info {
  position: relative;
  z-index: 1;
}

.income-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;

  .header-title {
    font-size: 32rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 8rpx;
  }

  .live-tag {
    display: flex;
    align-items: center;
    font-size: 20rpx;
    opacity: 0.8;
    
    .live-dot {
      width: 10rpx;
      height: 10rpx;
      background: #fff; 
      border-radius: 50%;
      margin-right: 8rpx;
      animation: blink 2s infinite;
    }
  }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.withdraw-btn-glass {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 28rpx;
  margin: 0;

  &[disabled] {
    opacity: 0.6;
  }
}

.income-main {
  text-align: center;
  margin-bottom: 48rpx;
  
  .currency-symbol {
    font-size: 40rpx;
    font-family: $font-family-num;
    margin-right: 8rpx;
  }
  
  .total-amount {
    font-size: 80rpx;
    font-family: $font-family-num;
    line-height: 1;
    font-weight: 700;
    text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  }
  
  .label {
    display: block;
    font-size: 24rpx;
    opacity: 0.8;
    margin-top: 16rpx;
  }
}

.income-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(0,0,0,0.05);
  border-radius: 24rpx;
  padding: 24rpx;

  .income-item {
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .item-value {
    font-size: 36rpx;
    font-family: $font-family-num;
    font-weight: 600;
    margin-bottom: 8rpx;
  }

  .item-label {
    font-size: 22rpx;
    opacity: 0.8;
  }

  .vertical-divider {
    width: 2rpx;
    height: 40rpx;
    background: rgba(255,255,255,0.2);
  }
}

.no-vehicle-prompt .prompt-icon {
  width: 240rpx;
  height: 240rpx;
  opacity: 0.9;
  margin-bottom: 24rpx;
}

// 3. 车辆列表
.my-vehicles {
  padding: 0 32rpx;
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.view-all {
  font-size: 26rpx;
  color: #888;
  display: flex;
  align-items: center;
  
  .arrow {
    margin-left: 8rpx;
    font-size: 32rpx;
    margin-top: -4rpx;
  }
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.vehicle-card {
  background: $card-bg-color;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: transform 0.1s;
  
  &:active {
    transform: scale(0.99);
  }
}

// 大卡片样式
.vehicle-image-wrapper {
  position: relative;
  width: 100%;
  height: 300rpx; // 大图展示
  background: #f0f0f0;
}

.vehicle-img {
  width: 100%;
  height: 100%;
}

.vehicle-status-tag {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  backdrop-filter: blur(4px);
  
  &.status-renting {
    background: rgba(0, 181, 120, 0.9);
    color: #fff;
  }
  
  &.status-idle {
    background: rgba(25, 118, 210, 0.9);
    color: #fff;
  }
  
  &.status-maintenance {
    background: rgba(255, 125, 0, 0.9);
    color: #fff;
  }
}

.vehicle-info {
  padding: 24rpx;
}

.vehicle-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  
  .plate-number {
    font-size: 32rpx;
    font-weight: 700;
    color: #1A1A1A;
  }
  
  .action-btn {
    margin: 0;
    font-size: 24rpx;
    background: #F2F3F5;
    color: #4E5969;
    padding: 0 24rpx;
    height: 52rpx;
    line-height: 52rpx;
    border-radius: 26rpx;
    &::after { border: none; }
  }
}

.vehicle-data-grid {
  display: flex;
  background: #F8F9FC;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  
  .data-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    &:first-child {
      border-right: 1rpx solid #E5E6EB;
    }
    
    &:last-child {
      padding-left: 32rpx;
    }
  }
  
  .data-label {
    font-size: 22rpx;
    color: #86909C;
    margin-bottom: 4rpx;
  }
  
  .data-value {
    font-size: 30rpx;
    font-family: $font-family-num;
    font-weight: 600;
    color: #FF9F29;
  }
}

// 4. 服务网格 (Core & Aux)
.feature-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.feature-grid-core {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.feature-card-core {
  background: $card-bg-color;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  height: 220rpx;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-md; // Elevated for core
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:active {
    transform: scale(0.98);
  }
  
  // 核心图标
  .core-icon {
    position: absolute;
    right: -10rpx;
    bottom: -10rpx;
    width: 140rpx;
    height: 140rpx;
    opacity: 0.15;
    transform: rotate(-10deg);
  }

  .core-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .core-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1D2129;
    margin-bottom: 8rpx;
  }

  .core-subtitle {
    font-size: 22rpx;
    color: #86909C;
    margin-bottom: 24rpx;
    line-height: 1.3;
  }

  .core-badge {
    font-size: 20rpx;
    padding: 6rpx 16rpx;
    border-radius: 100rpx;
    font-weight: 600;

    &.orange {
      background: rgba(255, 159, 41, 0.15);
      color: #FF9F29;
    }

    &.blue {
      background: rgba(33, 150, 243, 0.15);
      color: #2196F3;
    }

    &.trust-blue {
      background: rgba(41, 121, 255, 0.15);
      color: #2979FF;
    }
  }
}

// 辅助功能
.feature-grid-aux {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.feature-card-aux {
  background: #FFF;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: $shadow-sm; // Lower elevation
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:active {
    background: #F7F8FA;
  }
  
  .aux-left {
    display: flex;
    align-items: center;
  }

  .aux-icon-wrapper {
    width: 64rpx;
    height: 64rpx;
    margin-right: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;

    &.share-icon {
      background: rgba(255, 159, 41, 0.1);
    }

    &.agreement-icon {
      background: rgba(33, 150, 243, 0.1);
    }
  }

  .aux-info {
    display: flex;
    flex-direction: column;
  }
  
  .aux-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 4rpx;
  }
  
  .aux-desc {
    font-size: 20rpx;
    color: #C9CDD4;
  }
  
  .aux-arrow {
    font-size: 32rpx;
    color: #E5E6EB;
  }
}
</style>
