<template>
  <view class="balance-page">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="card-header">
        <text class="balance-title">我的余额</text>
        <view class="eye-btn" @tap="toggleBalanceVisible">
          <uni-icons
            :type="balanceVisible ? 'eye-filled' : 'eye-slash-filled'"
            size="24"
            color="#ffffff"
          ></uni-icons>
        </view>
      </view>
      <view class="balance-amount">
        <text class="currency-symbol">¥</text>
        <text class="amount-text">{{ balanceVisible ? userBalance : '***' }}</text>
      </view>
      <view class="balance-actions">
        <button class="action-btn primary" @tap="goToRecharge">
          充值
        </button>
        <button class="action-btn secondary" @tap="goToWithdraw">
          提现
        </button>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-functions">
      <view class="function-item" @tap="goToRecharge">
        <uni-icons type="wallet" size="24" color="#FF9F29"></uni-icons>
        <text class="function-text">余额充值</text>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
      <view class="function-item" @tap="goToWithdraw">
        <uni-icons type="refresh" size="24" color="#52C41A"></uni-icons>
        <text class="function-text">余额提现</text>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
      <view class="function-item" @tap="viewTransactionRecords">
        <uni-icons type="list" size="24" color="#1890FF"></uni-icons>
        <text class="function-text">交易记录</text>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
      <view class="function-item" @tap="viewRechargeRecords">
        <uni-icons type="wallet-filled" size="24" color="#722ED1"></uni-icons>
        <text class="function-text">充值记录</text>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
    </view>

    <!-- 余额说明 -->
    <view class="balance-info">
      <view class="info-header">
        <uni-icons type="info" size="20" color="#FF9F29"></uni-icons>
        <text class="info-title">余额说明</text>
      </view>
      <view class="info-content">
        <text class="info-item">• 余额可用于支付订单、押金等费用</text>
        <text class="info-item">• 充值实时到账，支持多种支付方式</text>
        <text class="info-item">• 提现将在1-3个工作日内处理</text>
        <text class="info-item">• 余额不可转让，仅限本人使用</text>
        <text class="info-item">• 如有疑问请联系客服处理</text>
      </view>
    </view>

    <!-- 最近交易 -->
    <view class="recent-transactions">
      <view class="section-header">
        <text class="section-title">最近交易</text>
        <text class="view-more" @tap="viewTransactionRecords">查看更多</text>
      </view>
      <view class="transaction-list">
        <view
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="transaction-item"
          @tap="viewTransactionDetail(transaction)"
        >
          <view class="transaction-icon" :class="transaction.type">
            <uni-icons
              :type="getTransactionIcon(transaction.type)"
              size="20"
              :color="getTransactionIconColor(transaction.type)"
            ></uni-icons>
          </view>
          <view class="transaction-content">
            <text class="transaction-title">{{ transaction.title }}</text>
            <text class="transaction-time">{{ formatTime(transaction.createdAt) }}</text>
          </view>
          <text class="transaction-amount" :class="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount }}
          </text>
        </view>

        <!-- 空状态 -->
        <view v-if="recentTransactions.length === 0" class="empty-state">
          <uni-icons type="wallet" size="48" color="#cccccc"></uni-icons>
          <text class="empty-text">暂无交易记录</text>
        </view>
      </view>
    </view>

    <!-- 充值优惠活动 -->
    <view class="promotion-banner" @tap="goToRecharge">
      <view class="banner-content">
        <view class="banner-title">限时充值优惠</view>
        <view class="banner-desc">充值满1000元送50元，满2000元送120元</view>
      </view>
      <uni-icons type="right" size="16" color="#ffffff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 状态管理
const balanceVisible = ref(true);
const userBalance = ref('2580.50');
const recentTransactions = ref([]);

// 页面加载
onMounted(() => {
  loadUserBalance();
  loadRecentTransactions();
});

// 切换余额可见性
const toggleBalanceVisible = () => {
  balanceVisible.value = !balanceVisible.value;
};

// 加载用户余额
const loadUserBalance = async () => {
  try {
    // 这里应该调用API获取用户余额
    // const response = await balanceApi.getUserBalance();
    // userBalance.value = response.data.balance;

    // 模拟数据
    userBalance.value = (Math.random() * 10000).toFixed(2);
  } catch (error) {
    console.error('加载用户余额失败:', error);
  }
};

// 加载最近交易记录
const loadRecentTransactions = async () => {
  try {
    // 这里应该调用API获取最近交易记录
    // const response = await balanceApi.getRecentTransactions();
    // recentTransactions.value = response.data;

    // 模拟数据
    recentTransactions.value = [
      {
        id: 1,
        type: 'income',
        title: '余额充值',
        amount: '500.00',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'expense',
        title: '订单支付',
        amount: '280.00',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'income',
        title: '退款到账',
        amount: '150.00',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        type: 'expense',
        title: '押金支付',
        amount: '500.00',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  } catch (error) {
    console.error('加载交易记录失败:', error);
  }
};

// 跳转到充值页面
const goToRecharge = () => {
  uni.navigateTo({
    url: '/pages/balance/recharge'
  });
};

// 跳转到提现页面
const goToWithdraw = () => {
  uni.showToast({
    title: '提现功能开发中',
    icon: 'none'
  });
};

// 查看交易记录
const viewTransactionRecords = () => {
  uni.navigateTo({
    url: '/pages/payment/records'
  });
};

// 查看充值记录
const viewRechargeRecords = () => {
  uni.showToast({
    title: '充值记录功能开发中',
    icon: 'none'
  });
};

// 查看交易详情
const viewTransactionDetail = (transaction) => {
  uni.showModal({
    title: '交易详情',
    content: `交易类型：${transaction.title}\n交易金额：¥${transaction.amount}\n交易时间：${formatDateTime(transaction.createdAt)}`,
    showCancel: false,
    confirmText: '确定'
  });
};

// 工具方法
const getTransactionIcon = (type) => {
  return type === 'income' ? 'wallet-filled' : 'wallet';
};

const getTransactionIconColor = (type) => {
  return type === 'income' ? '#52C41A' : '#FF4D4F';
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    return '刚刚';
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDateTime(dateStr);
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}-${day} ${hours}:${minutes}`;
};
</script>

<style>
.balance-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 余额卡片
.balance-card {
  background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
  padding: 48rpx 32rpx;
  margin: 24rpx;
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .balance-title {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
    }

    .eye-btn {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 24rpx;
    }
  }

  .balance-amount {
    display: flex;
    align-items: baseline;
    margin-bottom: 48rpx;

    .currency-symbol {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-right: 8rpx;
    }

    .amount-text {
      font-size: 56rpx;
      font-weight: 600;
      color: #ffffff;
    }
  }

  .balance-actions {
    display: flex;
    gap: 24rpx;

    .action-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: 500;
      border: none;

      &::after {
        border: none;
      }

      &.primary {
        background-color: #ffffff;
        color: #FF9F29;
      }

      &.secondary {
        background-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }
    }
  }
}

// 快捷功能
.quick-functions {
  background-color: #ffffff;
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;

  .function-item {
    display: flex;
    align-items: center;
    padding: 32rpx;
    border-bottom: 2rpx solid #f8f8f8;

    .last-child {
      border-bottom: none;
    }

    .function-text {
      flex: 1;
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
      margin-left: 16rpx;
    }
  }
}

// 余额说明
.balance-info {
  background-color: #fff7e6;
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #FF9F29;

  .info-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .info-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FF9F29;
    }
  }

  .info-content  { .info-item { font-size: 24rpx;
      color: rgba(0, 0, 0, 0.7);
      line-height: 1.6;
      display: block;
      margin-bottom: 8rpx; } }
}

// 最近交易
.recent-transactions {
  margin: 0 24rpx 24rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .view-more {
      font-size: 26rpx;
      color: #FF9F29;
    }
  }

  .transaction-list {
    background-color: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;

    .transaction-item {
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      .transaction-icon {
        width: 64rpx;
        height: 64rpx;
        border-radius: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;

        &.income {
          background-color: rgba(82, 196, 26, 0.1);
        }

        &.expense {
          background-color: rgba(255, 77, 79, 0.1);
        }
      }

      .transaction-content {
        flex: 1;

        .transaction-title {
          font-size: 28rpx;
          color: rgba(0, 0, 0, 0.8);
          display: block;
          margin-bottom: 8rpx;
        }

        .transaction-time {
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.4);
          display: block;
        }
      }

      .transaction-amount {
        font-size: 28rpx;
        font-weight: 600;

        &.income {
          color: #52C41A;
        }

        &.expense {
          color: #FF4D4F;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 80rpx 32rpx;

      .empty-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 16rpx;
        display: block;
      }
    }
  }
}

// 充值优惠活动
.promotion-banner {
  background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
  margin: 0 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .banner-content {
    flex: 1;

    .banner-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #ffffff;
      display: block;
      margin-bottom: 8rpx;
    }

    .banner-desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
      display: block;
    }
  }
}
</style>