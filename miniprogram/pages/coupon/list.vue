<template>
  <view class="coupon-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
        </view>
        <text class="nav-title">优惠券</text>
        <view class="nav-item"></view>
      </view>

      <!-- 标签页 -->
      <view class="tabs">
        <view
          class="tab-item"
          :class="{ 'active': currentTab === 'available' }"
          @tap="switchTab('available')"
        >
          <text class="tab-text">可领取</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'active': currentTab === 'my' }"
          @tap="switchTab('my')"
        >
          <text class="tab-text">我的优惠券</text>
          <view class="tab-badge" v-if="myStats.unused > 0">
            {{ myStats.unused }}
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y="true">
      <!-- 可领取优惠券 -->
      <view v-if="currentTab === 'available'" class="available-coupons">
        <!-- 空状态 -->
        <view v-if="availableCoupons.length === 0 && !loading" class="empty-state">
          <image class="empty-image" src="/static/empty-coupon.png" mode="aspectFit"></image>
          <text class="empty-text">暂无可领取的优惠券</text>
          <button class="browse-btn" @tap="goToHome">去逛逛</button>
        </view>

        <!-- 优惠券列表 -->
        <view v-else class="coupon-list">
          <view
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-item"
            :class="{ 'disabled': !coupon.canClaim }"
          >
            <!-- 优惠券头部 -->
            <view class="coupon-header">
              <view class="coupon-value">
                <text class="value-number" v-if="coupon.type === 'fixed'">
                  ¥{{ coupon.discount }}
                </text>
                <text class="value-number" v-else>
                  {{ coupon.discount }}折
                </text>
                <text class="value-unit" v-if="coupon.type === 'fixed'">元</text>
              </view>
              <view class="coupon-condition" v-if="coupon.minAmount > 0">
                满{{ coupon.minAmount }}元可用
              </view>
            </view>

            <!-- 优惠券主体 -->
            <view class="coupon-body">
              <view class="coupon-info">
                <text class="coupon-name">{{ coupon.name }}</text>
                <text class="coupon-desc">{{ coupon.description }}</text>
                <view class="coupon-tags" v-if="getCouponTags(coupon).length > 0">
                  <text
                    v-for="tag in getCouponTags(coupon)"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </text>
                </view>
              </view>
              <view class="coupon-action">
                <text class="remaining-text" v-if="coupon.remainingQuantity >= 0">
                  剩余 {{ coupon.remainingQuantity }}张
                </text>
                <text class="remaining-text" v-else>
                  限量{{ coupon.perUserLimit }}张
                </text>
                <button
                  class="claim-btn"
                  :class="{ 'disabled': !coupon.canClaim }"
                  :disabled="!coupon.canClaim || claiming"
                  :loading="claiming"
                  @tap="claimCoupon(coupon)"
                >
                  {{ coupon.isClaimed ? '已领取' : '立即领取' }}
                </button>
              </view>
            </view>

            <!-- 优惠券底部 -->
            <view class="coupon-footer">
              <text class="validity-text">
                有效期至 {{ formatDate(coupon.validUntil || '') }}
              </text>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text class="loading-text">加载中...</text>
        </view>
      </view>

      <!-- 我的优惠券 -->
      <view v-else class="my-coupons">
        <!-- 统计信息 -->
        <view class="stats-section">
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-number">{{ myStats.total }}</text>
              <text class="stat-label">总优惠券</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ myStats.unused }}</text>
              <text class="stat-label">未使用</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ myStats.used }}</text>
              <text class="stat-label">已使用</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ myStats.expired }}</text>
              <text class="stat-label">已过期</text>
            </view>
          </view>
        </view>

        <!-- 状态筛选 -->
        <view class="status-filter">
          <scroll-view class="filter-scroll" scroll-x="true">
            <view
              v-for="status in statusOptions"
              :key="status.value"
              class="filter-item"
              :class="{ 'active': currentStatus === status.value }"
              @tap="filterByStatus(status.value)"
            >
              <text class="filter-text">{{ status.label }}</text>
              <view class="filter-count" v-if="getStatusCount(status.value) > 0">
                {{ getStatusCount(status.value) }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 我的优惠券列表 -->
        <view class="coupon-list">
          <!-- 空状态 -->
          <view v-if="myCoupons.length === 0 && !loading" class="empty-state">
            <image class="empty-image" src="/static/empty-coupon.png" mode="aspectFit"></image>
            <text class="empty-text">暂无{{ currentStatusText }}优惠券</text>
            <button class="browse-btn" @tap="switchTab('available')">去领取</button>
          </view>

          <!-- 优惠券卡片 -->
          <view
            v-for="userCoupon in myCoupons"
            :key="userCoupon.id"
            class="my-coupon-item"
            :class="getCouponStatusClass(userCoupon.status)"
          >
            <!-- 优惠券头部 -->
            <view class="coupon-header">
              <view class="coupon-value">
                <text class="value-number" v-if="userCoupon.coupon.type === 'fixed'">
                  ¥{{ userCoupon.coupon.discount }}
                </text>
                <text class="value-number" v-else>
                  {{ userCoupon.coupon.discount }}折
                </text>
                <text class="value-unit" v-if="userCoupon.coupon.type === 'fixed'">元</text>
              </view>
              <view class="status-tag">
                {{ getStatusText(userCoupon.status) }}
              </view>
            </view>

            <!-- 优惠券主体 -->
            <view class="coupon-body">
              <view class="coupon-info">
                <text class="coupon-name">{{ userCoupon.coupon.name }}</text>
                <text class="coupon-desc">{{ userCoupon.coupon.description }}</text>
                <view class="coupon-tags" v-if="getCouponTags(userCoupon.coupon).length > 0">
                  <text
                    v-for="tag in getCouponTags(userCoupon.coupon)"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </text>
                </view>
              </view>
              <view class="coupon-action">
                <text class="validity-text">
                  {{ formatDate(userCoupon.validUntil) }}
                </text>
                <button
                  v-if="userCoupon.status === 'unused'"
                  class="use-btn"
                  @tap="useCoupon(userCoupon)"
                >
                  立即使用
                </button>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { couponApi } from '@/api/coupon';

const userStore = useUserStore();

// 状态管理
const currentTab = ref('available'); // 'available' | 'my'
const currentStatus = ref(''); // '' | 'unused' | 'used' | 'expired' | 'cancelled'
const availableCoupons = ref([]);
const myCoupons = ref([]);
const myStats = ref({
  total: 0,
  unused: 0,
  used: 0,
  expired: 0
});
const loading = ref(false);
const claiming = ref(false);

const statusOptions = [
  { label: '全部', value: '' },
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
  { label: '已取消', value: 'cancelled' }
];

// 计算属性
const currentStatusText = computed(() => {
  const status = statusOptions.find(s => s.value === currentStatus.value);
  return status ? status.label : '';
});

const getStatusCount = computed(() => {
  return (status) => {
    if (status === '') return myStats.value.total;
    return myStats.value[status] || 0;
  };
});

// 页面加载
onMounted(() => {
  if (userStore.isLoggedIn) {
    loadMyStats();
  }
  loadAvailableCoupons();
  loadMyCoupons();
});

// 页面显示时刷新数据
onShow(() => {
  if (userStore.isLoggedIn) {
    loadMyStats();
    loadMyCoupons();
  }
});

// 切换标签页
const switchTab = (tab) => {
  currentTab.value = tab;
  if (tab === 'my' && userStore.isLoggedIn) {
    loadMyCoupons();
  }
};

// 筛选状态
const filterByStatus = (status) => {
  currentStatus.value = status;
  loadMyCoupons();
};

// 加载可领取优惠券
const loadAvailableCoupons = async () => {
  if (currentTab.value !== 'available') return;

  loading.value = true;
  try {
    const coupons = await couponApi.getAvailableCoupons();
    availableCoupons.value = coupons;
  } catch (error) {
    console.error('加载可领取优惠券失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载我的优惠券
const loadMyCoupons = async () => {
  if (currentTab.value !== 'my') return;

  loading.value = true;
  try {
    const params = {};
    if (currentStatus.value) {
      params.status = currentStatus.value;
    }
    const response = await couponApi.getUserCoupons(params);
    myCoupons.value = response.coupons;
  } catch (error) {
    console.error('加载我的优惠券失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载统计信息
const loadMyStats = async () => {
  try {
    const stats = await couponApi.getCouponStats();
    myStats.value = stats;
  } catch (error) {
    console.error('加载统计信息失败:', error);
  }
};

// 领取优惠券
const claimCoupon = async (coupon) => {
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

  if (!coupon.canClaim) {
    uni.showToast({
      title: '优惠券不可领取',
      icon: 'none'
    });
    return;
  }

  claiming.value = true;
  try {
    await couponApi.claimCoupon(coupon.id);

    uni.showToast({
      title: '领取成功',
      icon: 'success'
    });

    // 更新列表状态
    const index = availableCoupons.value.findIndex(c => c.id === coupon.id);
    if (index > -1) {
      availableCoupons.value[index].isClaimed = true;
      availableCoupons.value[index].canClaim = false;
    }

    // 刷新统计信息
    await loadMyStats();
  } catch (error) {
    console.error('领取优惠券失败:', error);
    uni.showToast({
      title: error.message || '领取失败，请重试',
      icon: 'none'
    });
  } finally {
    claiming.value = false;
  }
};

// 使用优惠券
const useCoupon = (userCoupon) => {
  uni.showModal({
    title: '使用优惠券',
    content: '确定要在下单时使用这张优惠券吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 这里应该跳转到订单页面并传递优惠券信息
          uni.showToast({
            title: '请在下单时选择使用',
            icon: 'none'
          });
        } catch (error) {
          console.error('使用优惠券失败:', error);
        }
      }
    }
  });
};

// 获取优惠券标签
const getCouponTags = (coupon) => {
  const tags = [];
  if (coupon.perUserLimit > 1) {
    tags.push(`限领${coupon.perUserLimit}张`);
  }
  if (coupon.type === 'percentage') {
    tags.push('折扣券');
  }
  return tags;
};

// 获取优惠券状态类
const getCouponStatusClass = (status) => {
  return {
    'unused': 'available',
    'used': 'used',
    'expired': 'expired',
    'cancelled': 'cancelled'
  }[status] || '';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'unused': '未使用',
    'used': '已使用',
    'expired': '已过期',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 去首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/home/index'
  });
};
</script>

<style>
.coupon-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 头部
.header {
  background-color: #ffffff;

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    height: 88rpx;

    .nav-item {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  // 标签页
  .tabs {
    display: flex;
    padding: 0 32rpx;
    background-color: #ffffff;
    border-bottom: 2rpx solid #f0f0f0;

    .tab-item {
      position: relative;
      flex: 1;
      text-align: center;
      padding: 32rpx 0;

      .tab-text {
        font-size: 30rpx;
        color: rgba(0, 0, 0, 0.6);
        position: relative;
      }

      .tab-badge {
        position: absolute;
        top: 20rpx;
        right: 50%;
        transform: translateX(16rpx);
        background-color: #FF4D4F;
        color: #ffffff;
        font-size: 20rpx;
        padding: 4rpx 8rpx;
        border-radius: 10rpx;
        min-width: 20rpx;
        line-height: 1.2;
      }

      &.active {
        .tab-text {
          color: #FF9F29;
          font-weight: 500;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60rpx;
          height: 4rpx;
          background: #FF9F29;
          border-radius: 2rpx;
        }
      }
    }
  }
}

// 内容区域
.content {
  height: calc(100vh - 176rpx);
  padding: 24rpx;
}

// 通用优惠券卡片样式
.coupon-list {
  .coupon-item {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 8rpx;
      height: 100%;
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    }

    &.disabled::before {
      background: #cccccc;
    }

    .coupon-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 32rpx 16rpx 40rpx;
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;

      .coupon-value  { .value-number { font-size: 48rpx;
          font-weight: 600;
          line-height: 1; }.value-unit { font-size: 24rpx;
          margin-left: 4rpx; }.coupon-condition { font-size: 22rpx;
          opacity: 0.9; } }

      .status-tag {
        padding: 6rpx 12rpx;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 12rpx;
        font-size: 22rpx;
      }
    }

    .coupon-body {
      padding: 24rpx 32rpx 24rpx 40rpx;

      .coupon-info {
        flex: 1;

        .coupon-name {
          display: block;
          font-size: 32rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          margin-bottom: 8rpx;
        }

        .coupon-desc {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
          margin-bottom: 16rpx;
          line-height: 1.4;
        }

        .coupon-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8rpx;

          .tag {
            padding: 4rpx 8rpx;
            background-color: rgba(255, 159, 41, 0.1);
            color: #FF9F29;
            font-size: 20rpx;
            border-radius: 4rpx;
          }
        }
      }

      .coupon-action {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 16rpx;

        .remaining-text {
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
        }

        .claim-btn {
          background-color: #FF9F29;
          color: #ffffff;
          border: none;
          border-radius: 25rpx;
          padding: 12rpx 32rpx;
          font-size: 26rpx;
          font-weight: 500;

          &.disabled {
            background-color: #cccccc;
          }

          &::after {
            border: none;
          }
        }
      }
    }

    .coupon-footer {
      padding: 16rpx 32rpx 24rpx 40rpx;
      border-top: 2rpx dashed #f0f0f0;

      .validity-text {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
}

// 可领取优惠券特殊样式
.available-coupons  { .coupon-item { border: 2rpx solid transparent;
    transition: all 0.3s ease;

    .active { transform: scale(0.98); } }
}

// 我的优惠券状态样式
.my-coupon-item {
  &.used {
    opacity: 0.7;
    &::before {
      background: #67C23A;
    }

    .coupon-header {
      background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
    }
  }

  &.expired {
    opacity: 0.5;
    &::before {
      background: #909399;
    }

    .coupon-header {
      background: linear-gradient(135deg, #909399 0%, #C0C4CC 100%);
    }
  }

  &.cancelled {
    opacity: 0.5;
    &::before {
      background: #F56C6C;
    }

    .coupon-header {
      background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
    }
  }
}

// 统计区域
.stats-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .stats-grid {
    display: flex;
    justify-content: space-around;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .stat-number {
        font-size: 36rpx;
        font-weight: 600;
        color: #FF9F29;
      }

      .stat-label {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
}

// 状态筛选
.status-filter {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .filter-scroll {
    white-space: nowrap;

    .filter-item {
      display: inline-block;
      padding: 16rpx 24rpx;
      margin-right: 16rpx;
      background-color: #f8f8f8;
      border-radius: 25rpx;
      position: relative;

      .last-child {
        margin-right: 0;
      }

      .filter-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      .filter-count {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        background-color: #FF4D4F;
        color: #ffffff;
        font-size: 20rpx;
        padding: 2rpx 6rpx;
        border-radius: 10rpx;
        min-width: 20rpx;
        text-align: center;
      }

      &.active {
        background-color: rgba(255, 159, 41, 0.1);

        .filter-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }
    }
  }
}

// 我的优惠券特殊样式
.my-coupons {
  .my-coupon-item {
    border-left: 4rpx solid #FF9F29;

    &.used {
      border-left-color: #67C23A;
    }

    &.expired {
      border-left-color: #909399;
    }

    &.cancelled {
      border-left-color: #F56C6C;
    }

    .coupon-action  { .use-btn { background-color: #67C23A;
        color: #ffffff;
        border: none;
        border-radius: 25rpx;
        padding: 12rpx 32rpx;
        font-size: 26rpx;

        &::after { border: none; } }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 48rpx;
  }

  .browse-btn {
    padding: 20rpx 48rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}

// 加载状态
.loading-state {
  text-align: center;
  padding: 60rpx 0;

  .loading-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>