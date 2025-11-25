<template>
  <view class="payment-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
        </view>
        <text class="nav-title">支付订单</text>
        <view class="nav-item"></view>
      </view>
    </view>

    <!-- 支付内容 -->
    <scroll-view class="payment-content" scroll-y="true" v-if="orderInfo">
      <!-- 订单信息 -->
      <view class="order-info-card">
        <view class="card-header">
          <text class="card-title">订单信息</text>
        </view>
        <view class="order-details">
          <view class="order-item">
            <text class="order-label">订单号</text>
            <text class="order-value">{{ orderInfo.orderNo }}</text>
          </view>
          <view class="order-item">
            <text class="order-label">车辆名称</text>
            <text class="order-value">{{ orderInfo.vehicle?.name || '房车租赁' }}</text>
          </view>
          <view class="order-item">
            <text class="order-label">租赁时间</text>
            <text class="order-value">{{ formatDateTime(orderInfo.pickupTime) }} - {{ formatDateTime(orderInfo.returnTime) }}</text>
          </view>
          <view class="order-item total">
            <text class="order-label">订单金额</text>
            <text class="order-value amount">¥{{ orderInfo.totalAmount }}</text>
          </view>
          <view class="order-item deposit" v-if="orderInfo.depositAmount > 0">
            <text class="order-label">押金</text>
            <text class="order-value deposit-amount">¥{{ orderInfo.depositAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 支付方式选择 -->
      <view class="payment-methods-card">
        <view class="card-header">
          <text class="card-title">选择支付方式</text>
        </view>
        <view class="payment-methods">
          <view
            v-for="method in paymentMethods"
            :key="method.code"
            class="payment-method"
            :class="{ 'selected': selectedMethod === method.code }"
            @tap="selectPaymentMethod(method.code)"
          >
            <view class="method-left">
              <image
                class="method-icon"
                :src="method.iconUrl || '/static/payment/default.png'"
                mode="aspectFit"
              ></image>
              <view class="method-info">
                <text class="method-name">{{ method.name }}</text>
                <text class="method-desc" v-if="method.description">{{ method.description }}</text>
              </view>
            </view>
            <view class="method-right">
              <radio
                :checked="selectedMethod === method.code"
                color="#FF9F29"
                :disabled="!method.isEnabled"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 余额信息 -->
      <view class="balance-card" v-if="userBalance && selectedMethod === 'balance'">
        <view class="card-header">
          <text class="card-title">余额信息</text>
        </view>
        <view class="balance-info">
          <view class="balance-item">
            <text class="balance-label">可用余额</text>
            <text class="balance-amount">¥{{ userBalance.availableBalance }}</text>
          </view>
          <view class="balance-warning" v-if="userBalance.availableBalance < totalPayAmount">
            <uni-icons type="info" size="16" color="#FF4D4F"></uni-icons>
            <text class="warning-text">余额不足，请选择其他支付方式</text>
          </view>
        </view>
      </view>

      <!-- 支付倒计时 -->
      <view class="countdown-card" v-if="countdown > 0">
        <view class="countdown-content">
          <uni-icons type="clock" size="20" color="#FF9F29"></uni-icons>
          <text class="countdown-text">请在 {{ formatCountdown(countdown) }} 内完成支付</text>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tips">
        <view class="tips-title">
          <uni-icons type="shield" size="16" color="#67C23A"></uni-icons>
          <text class="tips-text">安全保障</text>
        </view>
        <view class="tips-content">
          <view class="tip-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="tip-text">您的支付信息经过加密传输</text>
          </view>
          <view class="tip-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="tip-text">支持主流银行和支付平台</text>
          </view>
          <view class="tip-item">
            <uni-icons type="checkmarkempty" size="14" color="#67C23A"></uni-icons>
            <text class="tip-text">支付成功后系统自动确认订单</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="payment-info">
        <view class="pay-amount">
          <text class="pay-label">应付：</text>
          <text class="pay-value">¥{{ totalPayAmount }}</text>
        </view>
        <text class="pay-method" v-if="selectedMethod">{{ getSelectedMethodName() }}</text>
      </view>
      <button
        class="pay-btn"
        :class="{ 'disabled': !canPay || paying }"
        :disabled="!canPay || paying"
        :loading="paying"
        @tap="handlePayment"
      >
        {{ paying ? '支付中...' : '立即支付' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { orderApi } from '@/api/order';
import { paymentApi } from '@/api/payment';

const userStore = useUserStore();

// 状态管理
const orderInfo = ref(null);
const paymentMethods = ref([]);
const selectedMethod = ref('wechat'); // 默认选择微信支付
const userBalance = ref(null);
const countdown = ref(1800); // 30分钟倒计时
const paying = ref(false);
const countdownTimer = ref(null);

// 参数
const orderId = ref(null);
const orderNo = ref(null);

// 计算属性
const totalPayAmount = computed(() => {
  if (!orderInfo.value) return 0;
  return orderInfo.value.totalAmount + (orderInfo.value.depositAmount || 0);
});

const canPay = computed(() => {
  if (!selectedMethod.value || !orderInfo.value || paying.value) return false;

  // 检查余额支付时余额是否足够
  if (selectedMethod.value === 'balance' && userBalance.value) {
    return userBalance.value.availableBalance >= totalPayAmount.value;
  }

  return true;
});

// 页面加载
onLoad((options) => {
  orderId.value = parseInt(options.orderId);
  orderNo.value = options.orderNo;

  // 初始化数据
  initData();

  // 启动倒计时
  startCountdown();
});

// 页面卸载时清理
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});

// 初始化数据
const initData = async () => {
  try {
    // 并行加载数据
    await Promise.all([
      loadOrderInfo(),
      loadPaymentMethods(),
      loadUserBalance()
    ]);

    // 设置默认支付方式
    if (paymentMethods.value.length > 0) {
      const wechatMethod = paymentMethods.value.find(m => m.code === 'wechat');
      const balanceMethod = paymentMethods.value.find(m => m.code === 'balance');

      // 优先使用余额支付（如果余额足够）
      if (balanceMethod && userBalance.value?.availableBalance >= totalPayAmount.value) {
        selectedMethod.value = 'balance';
      } else if (wechatMethod) {
        selectedMethod.value = 'wechat';
      } else {
        selectedMethod.value = paymentMethods.value[0].code;
      }
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  }
};

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const order = await orderApi.getOrderDetail(orderId.value);
    orderInfo.value = order;
  } catch (error) {
    console.error('加载订单信息失败:', error);
    throw error;
  }
};

// 加载支付方式
const loadPaymentMethods = async () => {
  try {
    const methods = await paymentApi.getPaymentMethods();
    paymentMethods.value = methods;
  } catch (error) {
    console.error('加载支付方式失败:', error);
    throw error;
  }
};

// 加载用户余额
const loadUserBalance = async () => {
  try {
    // 这里应该调用余额查询API
    // 暂时使用模拟数据
    userBalance.value = {
      availableBalance: 128.50,
      frozenBalance: 0,
      totalRecharge: 200,
      totalConsume: 71.50
    };
  } catch (error) {
    console.error('加载用户余额失败:', error);
    // 余额加载失败不影响支付流程
  }
};

// 启动倒计时
const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownTimer.value);
      handlePaymentTimeout();
    }
  }, 1000);
};

// 处理支付超时
const handlePaymentTimeout = () => {
  uni.showModal({
    title: '支付超时',
    content: '支付时间已超时，订单已取消',
    showCancel: false,
    success: () => {
      uni.navigateBack();
    }
  });
};

// 选择支付方式
const selectPaymentMethod = (method) => {
  if (paying.value) return;
  selectedMethod.value = method;
};

// 获取选中的支付方式名称
const getSelectedMethodName = () => {
  const method = paymentMethods.value.find(m => m.code === selectedMethod.value);
  return method ? method.name : '';
};

// 处理支付
const handlePayment = async () => {
  if (!canPay.value) {
    if (selectedMethod.value === 'balance' && userBalance.value?.availableBalance < totalPayAmount.value) {
      uni.showToast({
        title: '余额不足，请选择其他支付方式',
        icon: 'none'
      });
    }
    return;
  }

  paying.value = true;

  try {
    // 创建支付订单
    const paymentData = await paymentApi.createPayment({
      orderId: orderId.value,
      paymentMethod: selectedMethod.value,
      clientIp: '127.0.0.1', // 实际应该获取真实IP
      deviceInfo: 'miniprogram'
    });

    // 根据支付方式处理
    if (selectedMethod.value === 'balance') {
      // 余额支付是同步的，直接显示成功
      await handlePaymentSuccess(paymentData);
    } else if (selectedMethod.value === 'wechat') {
      // 微信支付
      await handleWechatPayment(paymentData);
    } else if (selectedMethod.value === 'alipay') {
      // 支付宝支付
      await handleAlipayPayment(paymentData);
    } else {
      throw new Error('不支持的支付方式');
    }
  } catch (error) {
    console.error('支付失败:', error);
    uni.showToast({
      title: error.message || '支付失败，请重试',
      icon: 'none'
    });
  } finally {
    paying.value = false;
  }
};

// 处理微信支付
const handleWechatPayment = async (paymentData) => {
  try {
    // 调用微信支付
    const paymentResult = await uni.requestPayment({
      timeStamp: paymentData.timeStamp,
      nonceStr: paymentData.nonceStr,
      package: paymentData.package,
      signType: paymentData.signType,
      paySign: paymentData.paySign
    });

    // 支付成功
    await handlePaymentSuccess(paymentData);
  } catch (error) {
    if (error.errMsg !== 'requestPayment:fail cancel') {
      // 用户取消以外的错误
      throw new Error('微信支付失败');
    } else {
      // 用户取消支付
      uni.showToast({
        title: '已取消支付',
        icon: 'none'
      });
    }
  }
};

// 处理支付宝支付
const handleAlipayPayment = async (paymentData) => {
  try {
    // 这里应该调用支付宝支付插件
    // 暂时模拟支付流程
    await new Promise(resolve => setTimeout(resolve, 2000));
    await handlePaymentSuccess(paymentData);
  } catch (error) {
    throw new Error('支付宝支付失败');
  }
};

// 处理支付成功
const handlePaymentSuccess = async (paymentData) => {
  // 清除倒计时
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  // 显示支付成功提示
  uni.showToast({
    title: '支付成功',
    icon: 'success',
    duration: 1500
  });

  // 跳转到支付结果页面
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages/payment/result?orderId=${orderId.value}&paymentNo=${paymentData.paymentNo}&status=success`
    });
  }, 1500);
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}月${day}日 ${hours}:${minutes}`;
};

// 格式化倒计时
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
};

// 返回
const goBack = () => {
  if (paying.value) {
    uni.showToast({
      title: '支付中，请稍候',
      icon: 'none'
    });
    return;
  }

  uni.showModal({
    title: '确认返回',
    content: '返回后支付进度将会丢失，确定要返回吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};
</script>

<style>
.payment-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
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
}

// 支付内容
.payment-content {
  height: calc(100vh - 160rpx);
}

// 通用卡片样式
.order-info-card,
.payment-methods-card,
.balance-card,
.countdown-card {
  margin: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}

// 订单信息卡片
.order-info-card {
  .order-details {
    padding: 32rpx;

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;

      .not(:last-child) {
        border-bottom: 2rpx solid #f8f8f8;
      }

      &.total {
        padding-top: 24rpx;
        border-top: 2rpx solid #f0f0f0;
        margin-top: 8rpx;

        .order-value {
          font-size: 36rpx;
          font-weight: 600;
          color: #FF9F29;
        }
      }

      &.deposit  { .deposit-amount { color: #4B91FF;
          font-weight: 500; } }

      .order-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      .order-value {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
        font-weight: 500;
      }
    }
  }
}

// 支付方式卡片
.payment-methods-card {
  .payment-methods {
    padding: 0 32rpx;

    .payment-method {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx 0;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      &.selected {
        background-color: rgba(255, 159, 41, 0.05);
        margin: 0 -32rpx;
        padding-left: 32rpx;
        padding-right: 32rpx;
      }

      .method-left {
        display: flex;
        align-items: center;
        gap: 24rpx;
        flex: 1;

        .method-icon {
          width: 60rpx;
          height: 60rpx;
          border-radius: 12rpx;
          background-color: #f8f8f8;
        }

        .method-info {
          flex: 1;

          .method-name {
            display: block;
            font-size: 32rpx;
            color: rgba(0, 0, 0, 0.9);
            font-weight: 500;
            margin-bottom: 8rpx;
          }

          .method-desc {
            font-size: 24rpx;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }

      .method-right {
        display: flex;
        align-items: center;
      }
    }
  }
}

// 余额信息卡片
.balance-card  { .balance-info { padding: 32rpx;

    .balance-item { display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .balance-label { font-size: 28rpx;
        color: rgba(0, 0, 0, 0.6); }.balance-amount { font-size: 36rpx;
        font-weight: 600;
        color: #67C23A; } }

    .balance-warning {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 24rpx;
      background-color: rgba(255, 77, 79, 0.1);
      border-radius: 12rpx;

      .warning-text {
        font-size: 26rpx;
        color: #FF4D4F;
      }
    }
  }
}

// 倒计时卡片
.countdown-card  { .countdown-content { display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    padding: 24rpx 32rpx;

    .countdown-text { font-size: 28rpx;
      color: #FF9F29;
      font-weight: 500; } }
}

// 安全提示
.security-tips {
  margin: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;

  .tips-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .tips-text {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  .tips-content  { .tip-item { display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .last-child { margin-bottom: 0; }.tip-text { font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.5; } }
  }
}

// 底部占位
.bottom-placeholder {
  height: 160rpx;
}

// 底部支付栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 144rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  z-index: 100;

  .payment-info {
    flex: 1;

    .pay-amount {
      display: flex;
      align-items: baseline;
      gap: 8rpx;
      margin-bottom: 8rpx;

      .pay-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      .pay-value {
        font-size: 40rpx;
        font-weight: 600;
        color: #FF9F29;
      }
    }

    .pay-method {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .pay-btn {
    width: 240rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(255, 159, 41, 0.3);

    &.disabled {
      background: linear-gradient(135deg, #ccc 0%, #999 100%);
      box-shadow: none;
    }

    &::after {
      border: none;
    }
  }
}
</style>