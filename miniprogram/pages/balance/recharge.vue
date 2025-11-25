<template>
  <view class="recharge-page">
    <!-- 余额显示 -->
    <view class="balance-display">
      <text class="balance-label">当前余额</text>
      <text class="balance-amount">¥{{ currentBalance }}</text>
    </view>

    <!-- 充值金额选择 -->
    <view class="amount-section">
      <view class="section-title">
        <text class="title-text">选择充值金额</text>
        <text class="required">*</text>
      </view>
      <view class="amount-grid">
        <view
          v-for="amount in presetAmounts"
          :key="amount"
          class="amount-item"
          :class="{ 'active': selectedAmount === amount }"
          @tap="selectAmount(amount)"
        >
          <text class="amount-text">¥{{ amount }}</text>
          <view v-if="getBonus(amount)" class="bonus-tag">
            送{{ getBonus(amount) }}元
          </view>
        </view>
      </view>
      <view class="custom-amount">
        <view class="input-group">
          <text class="currency-symbol">¥</text>
          <input
            class="amount-input"
            v-model="customAmount"
            type="digit"
            placeholder="自定义金额"
            :maxlength="8"
            @input="onCustomAmountInput"
          />
        </view>
        <text class="input-tips">最低充值10元，最高充值50000元</text>
      </view>
    </view>

    <!-- 充值优惠活动 -->
    <view class="promotion-section">
      <view class="promotion-header">
        <uni-icons type="gift-filled" size="20" color="#FF9F29"></uni-icons>
        <text class="promotion-title">充值优惠活动</text>
      </view>
      <view class="promotion-list">
        <view class="promotion-item">
          <view class="promotion-condition">满1000元</view>
          <view class="promotion-bonus">送50元</view>
        </view>
        <view class="promotion-item">
          <view class="promotion-condition">满2000元</view>
          <view class="promotion-bonus">送120元</view>
        </view>
        <view class="promotion-item highlight">
          <view class="promotion-condition">满5000元</view>
          <view class="promotion-bonus">送350元</view>
        </view>
      </view>
      <text class="promotion-tips">活动时间：即日起至2024年12月31日</text>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">
        <text class="title-text">支付方式</text>
        <text class="required">*</text>
      </view>
      <view class="payment-methods">
        <view
          v-for="method in paymentMethods"
          :key="method.type"
          class="payment-method"
          :class="{ 'active': selectedPaymentMethod === method.type }"
          @tap="selectPaymentMethod(method.type)"
        >
          <view class="method-info">
            <image class="method-icon" :src="method.icon" mode="aspectFit"></image>
            <text class="method-name">{{ method.name }}</text>
          </view>
          <view class="method-radio">
            <view
              class="radio-dot"
              :class="{ 'selected': selectedPaymentMethod === method.type }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 充值说明 -->
    <view class="recharge-info">
      <view class="info-header">
        <uni-icons type="info" size="20" color="#1890FF"></uni-icons>
        <text class="info-title">充值说明</text>
      </view>
      <view class="info-content">
        <text class="info-item">• 充值金额实时到账，无手续费</text>
        <text class="info-item">• 充值赠送金额将在充值成功后自动发放</text>
        <text class="info-item">• 单笔充值限额10-50000元</text>
        <text class="info-item">• 如遇充值失败，请联系客服处理</text>
        <text class="info-item">• 充值即代表同意相关服务协议</text>
      </view>
    </view>

    <!-- 充值按钮 -->
    <view class="submit-section">
      <view class="submit-info">
        <text class="submit-label">充值金额</text>
        <text class="submit-amount">¥{{ finalAmount }}</text>
      </view>
      <button
        class="submit-btn"
        :class="{ 'disabled': !isFormValid || processing }"
        :disabled="!isFormValid || processing"
        :loading="processing"
        @tap="submitRecharge"
      >
        {{ processing ? '充值中...' : `确认充值¥${finalAmount}` }}
      </button>
      <text class="submit-tips">点击充值即表示同意《充值服务协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 状态管理
const currentBalance = ref('2580.50');
const selectedAmount = ref(0);
const customAmount = ref('');
const selectedPaymentMethod = ref('wechat');
const processing = ref(false);

// 预设金额
const presetAmounts = [50, 100, 200, 500, 1000, 2000, 5000];

// 支付方式
const paymentMethods = [
  {
    type: 'wechat',
    name: '微信支付',
    icon: '/static/payment/wechat.png'
  },
  {
    type: 'alipay',
    name: '支付宝',
    icon: '/static/payment/alipay.png'
  },
  {
    type: 'apple',
    name: 'Apple Pay',
    icon: '/static/payment/apple.png'
  }
];

// 计算属性
const finalAmount = computed(() => {
  const amount = selectedAmount.value || parseFloat(customAmount.value) || 0;
  const bonus = getBonus(amount);
  return (amount + bonus).toFixed(2);
});

const isFormValid = computed(() => {
  const amount = selectedAmount.value || parseFloat(customAmount.value) || 0;
  return amount >= 10 && amount <= 50000 && selectedPaymentMethod.value;
});

// 页面加载
onMounted(() => {
  loadUserBalance();
});

// 加载用户余额
const loadUserBalance = async () => {
  try {
    // 这里应该调用API获取用户余额
    // const response = await balanceApi.getUserBalance();
    // currentBalance.value = response.data.balance;
  } catch (error) {
    console.error('加载用户余额失败:', error);
  }
};

// 选择预设金额
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  customAmount.value = '';
};

// 自定义金额输入
const onCustomAmountInput = () => {
  selectedAmount.value = 0;

  // 限制输入范围
  const amount = parseFloat(customAmount.value);
  if (amount > 50000) {
    customAmount.value = '50000';
  } else if (amount < 10 && customAmount.value !== '') {
    customAmount.value = '10';
  }
};

// 选择支付方式
const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method;
};

// 获取赠送金额
const getBonus = (amount) => {
  if (amount >= 5000) return 350;
  if (amount >= 2000) return 120;
  if (amount >= 1000) return 50;
  return 0;
};

// 提交充值
const submitRecharge = async () => {
  if (!isFormValid.value || processing.value) return;

  const amount = selectedAmount.value || parseFloat(customAmount.value);
  const bonus = getBonus(amount);
  const totalAmount = amount + bonus;

  processing.value = true;

  try {
    // 创建充值订单
    const rechargeData = {
      amount,
      bonus,
      totalAmount,
      paymentMethod: selectedPaymentMethod.value,
      description: `余额充值${bonus > 0 ? `（赠送${bonus}元）` : ''}`
    };

    // 这里应该调用API创建充值订单
    // const response = await balanceApi.createRechargeOrder(rechargeData);
    // const orderInfo = response.data;

    // 模拟支付流程
    await simulatePayment({
      ...rechargeData,
      orderNo: `RC${Date.now()}`
    });

    // 支付成功
    uni.showToast({
      title: '充值成功',
      icon: 'success'
    });

    // 更新余额
    const newBalance = (parseFloat(currentBalance.value) + totalAmount).toFixed(2);
    currentBalance.value = newBalance;

    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);

  } catch (error) {
    console.error('充值失败:', error);
    uni.showToast({
      title: error.message || '充值失败，请重试',
      icon: 'none'
    });
  } finally {
    processing.value = false;
  }
};

// 模拟支付流程
const simulatePayment = async (orderInfo) => {
  // 显示支付确认
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '确认支付',
      content: `充值金额：¥${orderInfo.amount}${orderInfo.bonus > 0 ? `\n赠送金额：¥${orderInfo.bonus}` : ''}\n实付金额：¥${orderInfo.amount}\n支付方式：${getPaymentMethodName(orderInfo.paymentMethod)}`,
      confirmText: '确认支付',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 模拟支付处理时间
          setTimeout(() => {
            // 模拟支付成功率90%
            if (Math.random() > 0.1) {
              resolve(orderInfo);
            } else {
              reject(new Error('支付失败，请重试'));
            }
          }, 2000);
        } else {
          reject(new Error('用户取消支付'));
        }
      },
      fail: () => {
        reject(new Error('支付确认失败'));
      }
    });
  });
};

// 工具方法
const getPaymentMethodName = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    apple: 'Apple Pay'
  };
  return methodMap[method] || '未知';
};
</script>

<style>
.recharge-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 余额显示
.balance-display {
  background-color: #ffffff;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 24rpx;

  .balance-label {
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.6);
    display: block;
    margin-bottom: 8rpx;
  }

  .balance-amount {
    font-size: 48rpx;
    font-weight: 600;
    color: #FF9F29;
  }
}

// 通用标题样式
.section-title {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 32rpx 32rpx 16rpx;

  .title-text {
    font-size: 30rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  .required {
    color: #FF4D4F;
    font-size: 28rpx;
  }
}

// 充值金额选择
.amount-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .amount-grid {
    padding: 0 32rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .amount-item {
      position: relative;
      width: calc(33.33% - 11rpx);
      padding: 24rpx 16rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 12rpx;
      text-align: center;

      &.active {
        border-color: #FF9F29;
        background-color: rgba(255, 159, 41, 0.05);
      }

      .amount-text {
        font-size: 28rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
      }

      .bonus-tag {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
        color: #ffffff;
        font-size: 20rpx;
        padding: 4rpx 8rpx;
        border-radius: 8rpx;
        line-height: 1;
      }
    }
  }

  .custom-amount {
    padding: 32rpx;

    .input-group {
      display: flex;
      align-items: center;
      height: 88rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 12rpx;
      padding: 0 24rpx;
      margin-bottom: 16rpx;

      .currency-symbol {
        font-size: 32rpx;
        font-weight: 600;
        color: #FF9F29;
        margin-right: 16rpx;
      }

      .amount-input {
        flex: 1;
        font-size: 32rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
      }
    }

    .input-tips {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

// 充值优惠活动
.promotion-section {
  background-color: #fff7e6;
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #FF9F29;

  .promotion-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;

    .promotion-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FF9F29;
    }
  }

  .promotion-list {
    .promotion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 2rpx solid rgba(255, 159, 41, 0.2);

      .last-child {
        border-bottom: none;
      }

      &.highlight {
        background-color: rgba(255, 159, 41, 0.1);
        margin: 0 -24rpx;
        padding: 20rpx 24rpx;
        border-radius: 8rpx;
        border-bottom: none;

        .promotion-bonus {
          color: #FF4D4F;
          font-weight: 600;
        }
      }

      .promotion-condition {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.7);
      }

      .promotion-bonus {
        font-size: 26rpx;
        color: #FF9F29;
        font-weight: 500;
      }
    }
  }

  .promotion-tips {
    font-size: 22rpx;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 16rpx;
    display: block;
  }
}

// 支付方式
.payment-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .payment-methods {
    padding: 0 32rpx 32rpx;

    .payment-method {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      &.active  { .method-name { color: #FF9F29; } }

      .method-info {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .method-icon {
          width: 48rpx;
          height: 48rpx;
        }

        .method-name {
          font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8);
        }
      }

      .method-radio  { .radio-dot { width: 20rpx;
          height: 20rpx;
          border-radius: 50%;
          border: 2rpx solid #ddd;
          position: relative;

          &.selected { border-color: #FF9F29;

            &::after { content: '';
              position: absolute;
              top: 4rpx;
              left: 4rpx;
              width: 8rpx;
              height: 8rpx;
              border-radius: 50%;
              background-color: #FF9F29; } }
        }
      }
    }
  }
}

// 充值说明
.recharge-info {
  background-color: #e6f7ff;
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #1890FF;

  .info-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .info-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1890FF;
    }
  }

  .info-content  { .info-item { font-size: 24rpx;
      color: rgba(0, 0, 0, 0.7);
      line-height: 1.6;
      display: block;
      margin-bottom: 8rpx; } }
}

// 提交按钮
.submit-section {
  padding: 32rpx;

  .submit-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .submit-label {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
    }

    .submit-amount {
      font-size: 32rpx;
      font-weight: 600;
      color: #FF9F29;
    }
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    margin-bottom: 24rpx;

    &.disabled {
      background-color: #cccccc;
      color: #999999;
    }

    &::after {
      border: none;
    }
  }

  .submit-tips {
    font-size: 24rpx;
    color: rgba(0, 0, 0, 0.6);
    text-align: center;
    display: block;
  }
}
</style>