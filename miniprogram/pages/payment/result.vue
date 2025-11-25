<template>
  <view class="payment-result-page">
    <!-- 结果展示区域 -->
    <view class="result-section">
      <view class="result-icon" :class="paymentResult.success ? 'success' : 'error'">
        <uni-icons
          :type="paymentResult.success ? 'checkbox-filled' : 'close'"
          size="80"
          :color="paymentResult.success ? '#52C41A' : '#F5222D'"
        ></uni-icons>
      </view>

      <view class="result-info">
        <text class="result-title" :class="paymentResult.success ? 'success' : 'error'">
          {{ paymentResult.success ? '支付成功' : '支付失败' }}
        </text>
        <text class="result-desc">
          {{ paymentResult.success ? '您的订单支付已成功，感谢您的使用' : '支付失败，请重试或联系客服' }}
        </text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-section" v-if="order">
      <view class="section-title">
        <text class="title-text">订单信息</text>
      </view>
      <view class="order-card">
        <image
          class="order-image"
          :src="order.vehicle.images?.[0] || '/static/default-vehicle.png'"
          mode="aspectFill"
        ></image>
        <view class="order-details">
          <text class="order-name">{{ order.vehicle.name }}</text>
          <text class="order-no">订单号：{{ paymentResult.orderNo || order.orderNo }}</text>
          <view class="order-meta">
            <text class="meta-item">{{ formatDate(order.pickupTime) }} - {{ formatDate(order.returnTime) }}</text>
            <text class="meta-price">¥{{ order.actualAmount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付详情 -->
    <view class="payment-details" v-if="paymentResult.success">
      <view class="section-title">
        <text class="title-text">支付详情</text>
      </view>
      <view class="payment-card">
        <view class="detail-item">
          <text class="detail-label">支付方式</text>
          <text class="detail-value">{{ getPaymentMethodText(paymentResult.paymentMethod) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">交易号</text>
          <text class="detail-value">{{ paymentResult.transactionNo || '暂无' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">支付时间</text>
          <text class="detail-value">{{ formatDateTime(paymentResult.paidAt) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">实付金额</text>
          <text class="detail-amount">¥{{ paymentResult.amount || order.actualAmount }}</text>
        </view>
      </view>
    </view>

    <!-- 失败原因 -->
    <view class="error-section" v-if="!paymentResult.success">
      <view class="section-title">
        <text class="title-text">失败原因</text>
      </view>
      <view class="error-card">
        <text class="error-message">{{ paymentResult.errorMessage || '网络异常，请重试' }}</text>
        <view class="error-code" v-if="paymentResult.errorCode">
          错误码：{{ paymentResult.errorCode }}
        </view>
      </view>
    </view>

    <!-- 建议操作 -->
    <view class="suggestions">
      <view class="suggestion-item" v-if="paymentResult.success">
        <view class="suggestion-icon">
          <uni-icons type="checkmarkempty" size="20" color="#52C41A"></uni-icons>
        </view>
        <text class="suggestion-text">查看订单详情</text>
      </view>

      <view class="suggestion-item" v-if="paymentResult.success">
        <view class="suggestion-icon">
          <uni-icons type="star" size="20" color="#FF9F29"></uni-icons>
        </view>
        <text class="suggestion-text">评价服务</text>
      </view>

      <view class="suggestion-item" v-if="!paymentResult.success">
        <view class="suggestion-icon">
          <uni-icons type="refresh" size="20" color="#1890FF"></uni-icons>
        </view>
        <text class="suggestion-text">重新支付</text>
      </view>

      <view class="suggestion-item" v-if="!paymentResult.success">
        <view class="suggestion-icon">
          <uni-icons type="help" size="20" color="#FF9F29"></uni-icons>
        </view>
        <text class="suggestion-text">联系客服</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button
        class="action-btn primary"
        v-if="paymentResult.success"
        @tap="viewOrderDetail"
      >
        查看订单
      </button>
      <button
        class="action-btn primary"
        v-if="!paymentResult.success"
        @tap="retryPayment"
      >
        重新支付
      </button>
      <button
        class="action-btn secondary"
        @tap="goBack"
      >
        返回
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
});

// 支付结果数据
const paymentResult = ref({
  success: true,
  orderNo: '',
  paymentMethod: 'wechat',
  transactionNo: '',
  amount: 0,
  paidAt: null,
  errorMessage: '',
  errorCode: ''
});

// 订单数据
const order = ref({});

// 页面加载
onMounted(() => {
  // 从路由参数获取支付结果
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];

  if (currentPage.options) {
    const options = currentPage.options;
    paymentResult.value = {
      success: options.success === 'true',
      orderNo: options.orderNo,
      paymentMethod: options.paymentMethod || 'wechat',
      transactionNo: options.transactionNo,
      amount: options.amount,
      paidAt: options.paidAt,
      errorMessage: options.errorMessage,
      errorCode: options.errorCode
    };

    if (options.orderId) {
      loadOrderDetail(options.orderId);
    }
  } else {
    // 模拟数据，实际应该从API获取
    loadOrderDetail(props.orderId);
  }
});

// 加载订单详情
const loadOrderDetail = async (orderId) => {
  try {
    // 这里应该调用API获取订单详情
    // const response = await orderApi.getOrderDetail(orderId);
    // order.value = response.data;

    // 模拟数据
    order.value = {
      id: orderId,
      orderNo: 'DD2024112001',
      vehicle: {
        name: '豪华房车A型',
        images: ['/static/default-vehicle.png']
      },
      pickupTime: '2024-11-20 09:00',
      returnTime: '2024-11-25 18:00',
      actualAmount: 2800
    };

    paymentResult.value.amount = order.value.actualAmount;
  } catch (error) {
    console.error('加载订单详情失败:', error);
  }
};

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methods = {
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付',
    apple: 'Apple Pay'
  };
  return methods[method] || '未知';
};

// 查看订单详情
const viewOrderDetail = () => {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${props.orderId}`
  });
};

// 重新支付
const retryPayment = () => {
  uni.redirectTo({
    url: `/pages/payment/index?orderId=${props.orderId}`
  });
};

// 联系客服
const contactService = () => {
  uni.switchTab({
    url: '/pages/service/index'
  });
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<style>
.payment-result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 结果展示区域
.result-section {
  padding: 80rpx 32rpx;
  text-align: center;

  .result-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32rpx;

    &.success {
      background-color: rgba(82, 196, 26, 0.1);
    }

    &.error {
      background-color: rgba(245, 34, 45, 0.1);
    }
  }

  .result-info {
    .result-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
      display: block;
      margin-bottom: 16rpx;

      &.success {
        color: #52C41A;
      }

      &.error {
        color: #F5222D;
      }
    }

    .result-desc {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;
    }
  }
}

// 通用标题样式
.section-title {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;

  .title-text {
    font-size: 28rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }
}

// 订单信息
.order-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .order-card {
    display: flex;
    gap: 24rpx;
    padding: 32rpx;

    .order-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .order-details {
      flex: 1;

      .order-name {
        font-size: 30rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 12rpx;
        display: block;
      }

      .order-no {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 8rpx;
        display: block;
      }

      .order-meta  { .meta-item,
        .meta-price { font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
          display: block;
          margin-bottom: 4rpx; }.meta-price { font-weight: 600;
          color: #FF4D4F; } }
    }
  }
}

// 支付详情
.payment-details {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .payment-card {
    padding: 32rpx;

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      .last-child {
        border-bottom: none;
      }

      .detail-label {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      .detail-value {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.8);
        text-align: right;
      }

      .detail-amount {
        font-size: 28rpx;
        font-weight: 600;
        color: #FF4D4F;
      }
    }
  }
}

// 失败原因
.error-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .error-card {
    padding: 32rpx;
    background-color: #fff2f0;
    border-radius: 12rpx;
    border-left: 4rpx solid #F5222D;

    .error-message {
      font-size: 28rpx;
      color: #F5222D;
      margin-bottom: 12rpx;
      line-height: 1.4;
    }

    .error-code {
      font-size: 22rpx;
      color: rgba(245, 34, 45, 0.7);
    }
  }
}

// 建议操作
.suggestions {
  background-color: #ffffff;
  margin-bottom: 24rpx;
  padding: 32rpx 0;

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .last-child {
      border-bottom: none;
    }

    .suggestion-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 20rpx;
      background-color: #f8f8f8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 操作按钮
.action-section {
  padding: 32rpx;
  display: flex;
  gap: 24rpx;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;

    &::after {
      border: none;
    }

    &.primary {
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;
    }

    &.secondary {
      background-color: #f8f8f8;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>