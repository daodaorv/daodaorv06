<template>
  <view class="profile-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="header-background"></view>

      <!-- 已登录用户信息 -->
      <view v-if="isLoggedIn" class="user-info-container">
        <view class="user-avatar-section" @click="goToProfile">
          <image
            :src="userInfo.avatarUrl || '/static/default-avatar.png'"
            class="user-avatar"
            mode="aspectFill"
          />
          <view v-if="userInfo.isVerified" class="verify-badge">
            <uni-icons type="checkmarkempty" size="12" color="#FFFFFF" />
          </view>
        </view>

        <view class="user-details">
          <text class="user-name">{{ userInfo.nickname || '用户' }}</text>
          <text class="user-phone">{{ userInfo.phone ? maskPhone(userInfo.phone) : '' }}</text>
          <view class="user-stats">
            <view class="stat-item" @click="goToOrders">
              <text class="stat-value">{{ userStats.totalOrders }}</text>
              <text class="stat-label">订单</text>
            </view>
            <view class="stat-item" @click="goToFavorites">
              <text class="stat-value">{{ userStats.favorites }}</text>
              <text class="stat-label">收藏</text>
            </view>
            <view class="stat-item" @click="goToCoupons">
              <text class="stat-value">{{ userStats.availableCoupons }}</text>
              <text class="stat-label">优惠券</text>
            </view>
            <view class="stat-item" @click="goToBalance">
              <text class="stat-value">¥{{ userStats.balance }}</text>
              <text class="stat-label">余额</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 未登录状态 -->
      <view v-else class="login-container" @click="goToLogin">
        <image src="/static/default-avatar.png" class="user-avatar" mode="aspectFill" />
        <view class="login-info">
          <text class="login-text">点击登录</text>
          <text class="login-desc">登录后享受更多服务</text>
        </view>
        <uni-icons type="right" size="20" :color="'#999999'" />
      </view>
    </view>

    <!-- 订单管理面板 -->
    <view class="order-panel">
      <view class="panel-header">
        <text class="panel-title">我的订单</text>
        <view class="more-section" @click="goToOrders">
          <text class="more-text">全部订单</text>
          <uni-icons type="right" size="14" :color="'#999999'" />
        </view>
      </view>

      <view class="order-grid">
        <view class="order-item" @click="goToOrders('pending')">
          <view class="order-icon-wrapper pending">
            <uni-icons type="wallet" size="24" :color="'#FF9F29'" />
          </view>
          <text class="order-label">待付款</text>
          <view v-if="userStats.pendingOrders > 0" class="order-badge">
            {{ formatOrderCount(userStats.pendingOrders) }}
          </view>
        </view>

        <view class="order-item" @click="goToOrders('confirmed')">
          <view class="order-icon-wrapper confirmed">
            <uni-icons type="checkmarkempty" size="24" :color="'#67C23A'" />
          </view>
          <text class="order-label">待确认</text>
        </view>

        <view class="order-item" @click="goToOrders('pickup')">
          <view class="order-icon-wrapper pickup">
            <uni-icons type="calendar" size="24" :color="'#FF9F29'" />
          </view>
          <text class="order-label">待取车</text>
        </view>

        <view class="order-item" @click="goToOrders('service')">
          <view class="order-icon-wrapper service">
            <uni-icons type="help-filled" size="24" :color="'#FF9F29'" />
          </view>
          <text class="order-label">售后</text>
        </view>
      </view>
    </view>

    <!-- 资产面板 -->
    <view class="asset-panel">
      <view class="panel-header">
        <text class="panel-title">我的资产</text>
      </view>

      <view class="asset-grid">
        <view class="asset-item" @click="goToCoupons">
          <view class="asset-icon-wrapper">
            <uni-icons type="coupon-filled" size="20" :color="'#FF9F29'" />
          </view>
          <text class="asset-label">优惠券</text>
          <text class="asset-value">{{ userStats.availableCoupons || 0 }}张</text>
        </view>

        <view class="asset-item" @click="goToBalance">
          <view class="asset-icon-wrapper">
            <uni-icons type="wallet-filled" size="20" :color="'#67C23A'" />
          </view>
          <text class="asset-label">钱包余额</text>
          <text class="asset-value">¥{{ userStats.balance || 0 }}</text>
        </view>

        <view class="asset-item" @click="goToCrowdfundingAssets">
          <view class="asset-icon-wrapper">
            <uni-icons type="home-filled" size="20" :color="'#8860D0'" />
          </view>
          <text class="asset-label">众筹资产</text>
          <text class="asset-value">{{ userStats.crowdfundingAssets || 0 }}份</text>
        </view>

        <view class="asset-item" @click="goToPoints">
          <view class="asset-icon-wrapper">
            <uni-icons type="star-filled" size="20" :color="'#E6A23C'" />
          </view>
          <text class="asset-label">积分</text>
          <text class="asset-value">{{ userStats.points || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 服务入口 -->
    <view class="service-grid-container">
      <ServiceGrid
        :services="serviceList"
        :compact="true"
        @service-click="handleServiceClick"
      />
    </view>

    <!-- PLUS会员推广 -->
    <view class="membership-promo" @click="goToMembership">
      <view class="promo-content">
        <view class="promo-icon">
          <uni-icons type="vip-filled" size="24" :color="'#8860D0'" />
        </view>
        <view class="promo-text">
          <text class="promo-title">开通PLUS会员</text>
          <text class="promo-desc">享受专属权益和优惠</text>
        </view>
        <view class="promo-arrow">
          <uni-icons type="right" size="16" :color="'#999999'" />
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="isLoggedIn" class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
// 导入组件 - 使用easycom自动导入，无需手动引入
// import { ServiceGrid } from '@/components';

// 接口定义
interface UserInfo {
  id: string | number;
  nickname: string;
  phone: string;
  avatarUrl: string;
  isVerified: boolean;
}

interface UserStats {
  totalOrders: number;
  pendingOrders: number;
  availableCoupons: number;
  favorites: number;
  balance: number;
  points: number;
  crowdfundingAssets?: number;
}

interface ServiceItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconType?: 'icon' | 'image';
  iconColor?: string;
  link?: string;
  badge?: string;
  badgeType?: 'primary' | 'danger' | 'warning' | 'success';
}

// 页面状态
const isLoggedIn = ref(false);
const userInfo = ref<UserInfo>({
  id: '',
  nickname: '',
  phone: '',
  avatarUrl: '',
  isVerified: false
});
const userStats = ref<UserStats>({
  totalOrders: 0,
  pendingOrders: 0,
  availableCoupons: 0,
  favorites: 0,
  balance: 0,
  points: 0,
  crowdfundingAssets: 0
});

// 服务列表配置
const serviceList = ref<ServiceItem[]>([
  {
    id: 'crowdfunding',
    title: '众筹资产',
    subtitle: '持仓/委托',
    icon: 'home-filled',
    iconColor: '#8860D0',
    link: '/pages/crowdfunding/index'
  },
  {
    id: 'favorites',
    title: '我的收藏',
    subtitle: '查看',
    icon: 'heart-filled',
    iconColor: '#FF4D4F',
    link: '/pages/favorites/list'
  },
  {
    id: 'contacts',
    title: '常用联系人',
    subtitle: '去完善',
    icon: 'person-filled',
    iconColor: '#909399'
  },
  {
    id: 'service',
    title: '联系客服',
    subtitle: '9:00-21:00',
    icon: 'chatbubble-filled',
    iconColor: '#4B91FF',
    badge: '在线'
  },
  {
    id: 'settings',
    title: '设置',
    subtitle: '通知/隐私',
    icon: 'gear-filled',
    iconColor: '#606266'
  },
  {
    id: 'help',
    title: '帮助中心',
    subtitle: '常见问题',
    icon: 'help-filled',
    iconColor: '#909399'
  }
]);

// 页面生命周期
onMounted(() => {
  checkLoginStatus();
});

onShow(() => {
  if (isLoggedIn.value) {
    loadUserStats();
  }
});

// 检查登录状态
const checkLoginStatus = () => {
  // 检查本地存储的登录状态
  const token = uni.getStorageSync('token');
  const userInfoData = uni.getStorageSync('userInfo');

  isLoggedIn.value = !!token;
  if (isLoggedIn.value && userInfoData) {
    userInfo.value = {
      id: userInfoData.id,
      nickname: userInfoData.nickname || userInfoData.phone,
      phone: userInfoData.phone,
      avatarUrl: userInfoData.avatarUrl || '/static/default-avatar.png',
      isVerified: userInfoData.isVerified || false
    };
    loadUserStats();
  }
};

// 加载用户统计数据
const loadUserStats = async () => {
  try {
    // 模拟API调用 - 替换为实际API调用
    userStats.value = {
      totalOrders: 12,
      pendingOrders: 2,
      availableCoupons: 5,
      favorites: 18,
      balance: 258.50,
      points: 1280,
      crowdfundingAssets: 50
    };
  } catch (error) {
    console.error('加载用户统计数据失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};

// 处理服务点击
const handleServiceClick = (service: ServiceItem, index: number) => {
  switch (service.id) {
    case 'crowdfunding':
      goToCrowdfundingAssets();
      break;
    case 'favorites':
      goToFavorites();
      break;
    case 'contacts':
      goToContacts();
      break;
    case 'service':
      goToService();
      break;
    case 'settings':
      goToSettings();
      break;
    case 'help':
      goToHelp();
      break;
  }
};

// 工具方法：手机号掩码
const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 格式化订单数量
const formatOrderCount = (count: number): string => {
  return count > 99 ? '99+' : count.toString();
};

// 页面跳转方法
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  });
};

const goToProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  });
};

const goToOrders = (status?: string) => {
  const url = status
    ? `/pages/order/list?status=${status}`
    : '/pages/order/list';
  uni.navigateTo({ url });
};

const goToCoupons = () => {
  uni.navigateTo({
    url: '/pages/coupon/list'
  });
};

const goToFavorites = () => {
  uni.navigateTo({
    url: '/pages/favorites/list'
  });
};

const goToBalance = () => {
  uni.navigateTo({
    url: '/pages/balance/index'
  });
};

const goToPoints = () => {
  uni.navigateTo({
    url: '/pages/points/index'
  });
};

const goToCrowdfundingAssets = () => {
  uni.switchTab({
    url: '/pages/crowdfunding/index'
  });
};

const goToMembership = () => {
  uni.navigateTo({
    url: '/pages/membership/index'
  });
};

const goToService = () => {
  uni.navigateTo({
    url: '/pages/service/index'
  });
};

const goToContacts = () => {
  uni.showToast({
    title: '常用联系人功能开发中',
    icon: 'none'
  });
};

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/index'
  });
};

const goToHelp = () => {
  uni.navigateTo({
    url: '/pages/help/index'
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');

        // 重置状态
        isLoggedIn.value = false;
        userInfo.value = {
          id: '',
          nickname: '',
          phone: '',
          avatarUrl: '',
          isVerified: false
        };
        userStats.value = {
          totalOrders: 0,
          pendingOrders: 0,
          availableCoupons: 0,
          favorites: 0,
          balance: 0,
          points: 0,
          crowdfundingAssets: 0
        };

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        });
      }
    }
  });
};
</script>

<style>
// 导入统一变量文件
.profile-page {
  min-height: 100vh;
  background: #F8F8F8;
}

// 用户信息头部
.user-header {
  position: relative;
  background: linear-gradient(135deg, rgba(#FF9F29, 0.1) 0%, rgba(#FF9F29, 0.05) 100%);
  padding: 48rpx 30rpx 80rpx;
  overflow: hidden;

  .header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #FF9F29-light 0%, #FFF0D0 100%);
    opacity: 0.3;
    z-index: 0;
  }

  .user-info-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    gap: 32rpx;

    .user-avatar-section {
      position: relative;
      flex-shrink: 0;

      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(#FF9F29, 0.2);
      }

      .verify-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36rpx;
        height: 36rpx;
        background: #67C23A;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3rpx solid #FFFFFF;
      }
    }

    .user-details {
      flex: 1;
      padding-top: 16rpx;

      .user-name {
        font-size: 36rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 8rpx;
        display: block;
      }

      .user-phone {
        font-size: 24rpx;
        color: #666666;
        margin-bottom: 32rpx;
        display: block;
      }

      .user-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24rpx;

        .stat-item {
          text-align: center;
          padding: 16rpx;
          border-radius: 16rpx;
          background: rgba(#FFFFFF, 0.8);
          transition: all 0.2s;

          .active {
            background: #FFFFFF;
            transform: scale(0.95);
          }

          .stat-value {
            font-size: 32rpx;
            font-weight: 600;
            color: #333333;
            display: block;
            margin-bottom: 4rpx;
          }

          .stat-label {
            font-size: 20rpx;
            color: #666666;
            display: block;
          }
        }
      }
    }
  }

  .login-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 32rpx;

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(#FF9F29, 0.2);
    }

    .login-info {
      flex: 1;

      .login-text {
        font-size: 36rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 8rpx;
        display: block;
      }

      .login-desc {
        font-size: 24rpx;
        color: #666666;
        display: block;
      }
    }
  }
}

// 面板通用样式
.order-panel, .asset-panel {
  background: #FFFFFF;
  margin: 32rpx 30rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .panel-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }

    .more-section {
      display: flex;
      align-items: center;
      gap: 8rpx;
      transition: all 0.2s;

      .active {
        opacity: 0.7;
      }

      .more-text {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}

// 订单网格
.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;

  .order-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    transition: all 0.2s;

    .active {
      transform: scale(0.95);
    }

    .order-icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      transition: all 0.2s;

      &.pending {
        background: rgba(#FF9F29, 0.1);
      }

      &.confirmed {
        background: rgba(#67C23A, 0.1);
      }

      &.pickup {
        background: rgba(#FF9F29, 0.1);
      }

      &.service {
        background: rgba(#FF9F29, 0.1);
      }
    }

    .order-label {
      font-size: 24rpx;
      color: #666666;
      text-align: center;
    }

    .order-badge {
      position: absolute;
      top: -4rpx;
      right: -4rpx;
      background: #FF4D4F;
      color: #FFFFFF;
      font-size: 20rpx;
      min-width: 32rpx;
      height: 32rpx;
      border-radius: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6rpx;
      font-weight: 500;
    }
  }
}

// 资产网格
.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;

  .asset-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx;
    border-radius: 16rpx;
    background: #FAFAFA;
    transition: all 0.2s;

    .active {
      transform: scale(0.95);
      background: #E8E8E8;
    }

    .asset-icon-wrapper {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(#FF9F29, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
    }

    .asset-label {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 8rpx;
      text-align: center;
    }

    .asset-value {
      font-size: 28rpx;
      font-weight: 600;
      color: #333333;
      text-align: center;
    }
  }
}

// 服务网格容器
.service-grid-container {
  margin: 32rpx 30rpx;
}

// PLUS会员推广
.membership-promo {
  margin: 32rpx 30rpx;
  background: linear-gradient(135deg, rgba(#8860D0, 0.1) 0%, rgba(#8860D0, 0.05) 100%);
  border: 1px solid rgba(#8860D0, 0.2);
  border-radius: 20rpx;
  padding: 32rpx;
  transition: all 0.2s;

  .active {
    transform: scale(0.98);
    background: linear-gradient(135deg, rgba(#8860D0, 0.15) 0%, rgba(#8860D0, 0.08) 100%);
  }

  .promo-content {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .promo-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: rgba(#8860D0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .promo-text {
      flex: 1;

      .promo-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #8860D0;
        margin-bottom: 8rpx;
        display: block;
      }

      .promo-desc {
        font-size: 24rpx;
        color: #666666;
        display: block;
      }
    }

    .promo-arrow {
      flex-shrink: 0;
    }
  }
}

// 退出登录区域
.logout-section {
  margin: 48rpx 30rpx 80rpx;

  .logout-btn {
    height: 88rpx;
    background: #FFFFFF;
    border: 1px solid #E8E8E8;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    .active {
      transform: scale(0.98);
      background: #FAFAFA;
      border-color: #DDDDDD;
    }

    .logout-text {
      font-size: 28rpx;
      color: #666666;
      font-weight: 500;
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .user-header {
    padding: 32rpx 24rpx 48rpx;

    .user-info-container {
      gap: 24rpx;

      .user-avatar-section .user-avatar {
        width: 100rpx;
        height: 100rpx;
      }

      .user-details  { .user-name { font-size: 32rpx; }.user-stats { gap: 16rpx;

          .stat-item { padding: 8rpx;

            .stat-value { font-size: 28rpx; } }
        }
      }
    }

    .login-container .user-avatar {
      width: 100rpx;
      height: 100rpx;
    }
  }

  .order-panel, .asset-panel {
    margin: 24rpx;
    padding: 24rpx;

    .order-grid .order-item .order-icon-wrapper {
      width: 70rpx;
      height: 70rpx;
    }

    .asset-grid .asset-item {
      padding: 24rpx;

      .asset-icon-wrapper {
        width: 50rpx;
        height: 50rpx;
      }
    }
  }

  .membership-promo {
    margin: 24rpx;

    .promo-content .promo-icon {
      width: 70rpx;
      height: 70rpx;
    }
  }

  .logout-section {
    margin: 32rpx 24rpx 48rpx;
  }
}
</style>