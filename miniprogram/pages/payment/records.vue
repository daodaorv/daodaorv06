<template>
  <view class="payment-records-page">
    <!-- 头部统计 -->
    <view class="stats-section">
      <view class="stats-card">
        <text class="stats-title">累计消费</text>
        <text class="stats-amount">¥{{ totalAmount }}</text>
      </view>
      <view class="stats-card">
        <text class="stats-title">交易笔数</text>
        <text class="stats-count">{{ totalCount }}</text>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          class="filter-tab"
          :class="{ 'active': activeTab === 'all' }"
          @tap="switchTab('all')"
        >
          全部
        </view>
        <view
          class="filter-tab"
          :class="{ 'active': activeTab === 'payment' }"
          @tap="switchTab('payment')"
        >
          支付
        </view>
        <view
          class="filter-tab"
          :class="{ 'active': activeTab === 'refund' }"
          @tap="switchTab('refund')"
        >
          退款
        </view>
      </view>
    </view>

    <!-- 交易记录列表 -->
    <view class="records-section">
      <view
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-item"
        @tap="viewRecordDetail(record)"
      >
        <view class="record-icon" :class="record.type">
          <uni-icons
            :type="getRecordIcon(record.type)"
            size="24"
            :color="getRecordIconColor(record.type)"
          ></uni-icons>
        </view>

        <view class="record-content">
          <view class="record-header">
            <text class="record-title">{{ getRecordTitle(record.type) }}</text>
            <text class="record-amount" :class="record.type">
              {{ record.type === 'refund' ? '-' : '+' }}¥{{ record.amount }}
            </text>
          </view>
          <text class="record-desc">{{ record.description }}</text>
          <text class="record-time">{{ formatDateTime(record.createdAt) }}</text>
        </view>

        <view class="record-status">
          <text class="status-text" :class="record.status">
            {{ getStatusText(record.status) }}
          </text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <uni-icons type="wallet" size="64" color="#cccccc"></uni-icons>
        <text class="empty-text">暂无交易记录</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && filteredRecords.length > 0" class="load-more">
        <uni-load-more :status="loadStatus"></uni-load-more>
      </view>
    </view>

    <!-- 记录详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">交易详情</text>
          <view class="close-btn" @tap="closeDetailPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>

        <view v-if="selectedRecord" class="detail-content">
          <view class="detail-amount">
            <text class="amount-text" :class="selectedRecord.type">
              {{ selectedRecord.type === 'refund' ? '-' : '+' }}¥{{ selectedRecord.amount }}
            </text>
          </view>

          <view class="detail-info">
            <view class="info-item">
              <text class="info-label">交易类型</text>
              <text class="info-value">{{ getRecordTitle(selectedRecord.type) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">交易状态</text>
              <text class="info-value" :class="selectedRecord.status">
                {{ getStatusText(selectedRecord.status) }}
              </text>
            </view>
            <view class="info-item">
              <text class="info-label">交易时间</text>
              <text class="info-value">{{ formatDateTime(selectedRecord.createdAt) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">交易单号</text>
              <text class="info-value">{{ selectedRecord.transactionNo }}</text>
            </view>
            <view class="info-item" v-if="selectedRecord.orderNo">
              <text class="info-label">关联订单</text>
              <text class="info-value">{{ selectedRecord.orderNo }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">支付方式</text>
              <text class="info-value">{{ getPaymentMethodText(selectedRecord.paymentMethod) }}</text>
            </view>
          </view>

          <view class="detail-actions">
            <button class="action-btn secondary" @tap="copyTransactionNo">
              复制单号
            </button>
            <button
              v-if="selectedRecord.type === 'payment' && selectedRecord.status === 'success'"
              class="action-btn primary"
              @tap="viewOrderDetail"
            >
              查看订单
            </button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 状态管理
const activeTab = ref('all');
const records = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const selectedRecord = ref(null);
const detailPopup = ref(null);

// 计算属性
const filteredRecords = computed(() => {
  if (activeTab.value === 'all') {
    return records.value;
  }
  return records.value.filter(record => record.type === activeTab.value);
});

const totalAmount = computed(() => {
  return records.value
    .filter(record => record.type === 'payment' && record.status === 'success')
    .reduce((sum, record) => sum + parseFloat(record.amount), 0)
    .toFixed(2);
});

const totalCount = computed(() => {
  return records.value.filter(record => record.status === 'success').length;
});

const loadStatus = computed(() => {
  if (loading.value) return 'loading';
  if (!hasMore.value) return 'noMore';
  return 'more';
});

// 页面加载
onMounted(() => {
  loadPaymentRecords();
});

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 加载交易记录
const loadPaymentRecords = async (reset = false) => {
  if (loading.value) return;

  if (reset) {
    page.value = 1;
    records.value = [];
    hasMore.value = true;
  }

  loading.value = true;

  try {
    // 这里应该调用API获取交易记录
    // const response = await paymentApi.getPaymentRecords({
    //   page: page.value,
    //   limit: 20,
    //   type: activeTab.value === 'all' ? undefined : activeTab.value
    // });

    // 模拟数据
    const mockData = generateMockRecords(page.value);

    if (reset) {
      records.value = mockData;
    } else {
      records.value.push(...mockData);
    }

    hasMore.value = mockData.length >= 20;
    page.value++;

  } catch (error) {
    console.error('加载交易记录失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 生成模拟数据
const generateMockRecords = (pageNum) => {
  const types = ['payment', 'refund'];
  const statuses = ['success', 'pending', 'failed'];
  const paymentMethods = ['wechat', 'alipay', 'balance'];
  const descriptions = [
    '订单支付',
    '余额充值',
    '退款申请',
    '订单取消退款',
    '押金支付'
  ];

  const records = [];
  const startId = (pageNum - 1) * 20;

  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    records.push({
      id: startId + i + 1,
      type,
      status,
      amount: (Math.random() * 5000 + 100).toFixed(2),
      description,
      paymentMethod,
      transactionNo: `TXN${Date.now()}${i}`,
      orderNo: `DD${Date.now()}${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return records;
};

// 查看记录详情
const viewRecordDetail = (record) => {
  selectedRecord.value = record;
  detailPopup.value.open();
};

// 关闭详情弹窗
const closeDetailPopup = () => {
  detailPopup.value.close();
  selectedRecord.value = null;
};

// 复制交易单号
const copyTransactionNo = () => {
  if (!selectedRecord.value?.transactionNo) return;

  uni.setClipboardData({
    data: selectedRecord.value.transactionNo,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      });
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      });
    }
  });
};

// 查看订单详情
const viewOrderDetail = () => {
  if (!selectedRecord.value?.orderNo) return;

  uni.navigateTo({
    url: `/pages/order/detail?orderNo=${selectedRecord.value.orderNo}`
  });
  closeDetailPopup();
};

// 工具方法
const getRecordIcon = (type) => {
  return type === 'payment' ? 'wallet-filled' : 'refresh';
};

const getRecordIconColor = (type) => {
  return type === 'payment' ? '#52C41A' : '#FF9F29';
};

const getRecordTitle = (type) => {
  return type === 'payment' ? '支付' : '退款';
};

const getStatusText = (status) => {
  const statusMap = {
    success: '成功',
    pending: '处理中',
    failed: '失败'
  };
  return statusMap[status] || '未知';
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝',
    balance: '余额支付',
    apple: 'Apple Pay'
  };
  return methodMap[method] || '未知';
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 下拉刷新
const onPullDownRefresh = () => {
  loadPaymentRecords(true).then(() => {
    uni.stopPullDownRefresh();
  });
};

// 触底加载更多
const onReachBottom = () => {
  if (hasMore.value && !loading.value) {
    loadPaymentRecords();
  }
};
</script>

<style>
.payment-records-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 头部统计
.stats-section {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .stats-card {
    flex: 1;
    text-align: center;
    padding: 32rpx 24rpx;
    background-color: #fafafa;
    border-radius: 12rpx;

    .stats-title {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.6);
      display: block;
      margin-bottom: 8rpx;
    }

    .stats-amount,
    .stats-count {
      font-size: 36rpx;
      font-weight: 600;
      color: #FF9F29;
      display: block;
    }
  }
}

// 筛选条件
.filter-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .filter-tabs {
    display: flex;
    padding: 0 32rpx;

    .filter-tab {
      padding: 24rpx 32rpx;
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.7);
      position: relative;

      &.active {
        color: #FF9F29;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 32rpx;
          right: 32rpx;
          height: 4rpx;
          background-color: #FF9F29;
          border-radius: 2rpx;
        }
      }
    }
  }
}

// 交易记录列表
.records-section {
  .record-item {
    background-color: #ffffff;
    display: flex;
    align-items: center;
    padding: 32rpx;
    margin-bottom: 2rpx;

    .record-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;

      &.payment {
        background-color: rgba(82, 196, 26, 0.1);
      }

      &.refund {
        background-color: rgba(255, 159, 41, 0.1);
      }
    }

    .record-content {
      flex: 1;

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .record-title {
          font-size: 28rpx;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.9);
        }

        .record-amount {
          font-size: 30rpx;
          font-weight: 600;

          &.payment {
            color: #52C41A;
          }

          &.refund {
            color: #FF9F29;
          }
        }
      }

      .record-desc {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4rpx;
        display: block;
      }

      .record-time {
        font-size: 22rpx;
        color: rgba(0, 0, 0, 0.4);
        display: block;
      }
    }

    .record-status {
      .status-text {
        font-size: 24rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        background-color: #f0f0f0;
        color: rgba(0, 0, 0, 0.6);

        &.success {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52C41A;
        }

        &.pending {
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890FF;
        }

        &.failed {
          background-color: rgba(245, 34, 45, 0.1);
          color: #F5222D;
        }
      }
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;

  .empty-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 24rpx;
    display: block;
  }
}

// 加载更多
.load-more {
  padding: 32rpx;
}

// 详情弹窗
.detail-popup {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .close-btn {
      padding: 8rpx;
    }
  }

  .detail-content {
    padding: 32rpx;

    .detail-amount {
      text-align: center;
      margin-bottom: 48rpx;

      .amount-text {
        font-size: 48rpx;
        font-weight: 600;

        &.payment {
          color: #52C41A;
        }

        &.refund {
          color: #FF9F29;
        }
      }
    }

    .detail-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx 0;
        border-bottom: 2rpx solid #f8f8f8;

        .last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
        }

        .info-value {
          font-size: 26rpx;
          color: rgba(0, 0, 0, 0.8);
          text-align: right;
          flex: 1;
          margin-left: 32rpx;

          &.success {
            color: #52C41A;
          }

          &.pending {
            color: #1890FF;
          }

          &.failed {
            color: #F5222D;
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      gap: 24rpx;
      margin-top: 48rpx;

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
  }
}
</style>