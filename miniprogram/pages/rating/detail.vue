<template>
  <view class="rating-detail-page">
    <!-- 评分概览 -->
    <view class="rating-overview">
      <view class="overall-rating">
        <view class="rating-score">
          <text class="score-number">{{ rating.overallRating }}</text>
          <view class="rating-stars">
            <uni-rate
              :value="rating.overallRating"
              :size="20"
              :readonly="true"
              color="#FFD700"
            ></uni-rate>
          </view>
        </view>
        <text class="rating-label">综合评分</text>
      </view>

      <view class="rating-breakdown">
        <view class="rating-item">
          <text class="item-label">车辆</text>
          <view class="item-rating">
            <text class="item-score">{{ rating.vehicleRating }}</text>
            <uni-rate
              :value="rating.vehicleRating"
              :size="16"
              :readonly="true"
              color="#FFD700"
            ></uni-rate>
          </view>
        </view>
        <view class="rating-item">
          <text class="item-label">服务</text>
          <view class="item-rating">
            <text class="item-score">{{ rating.serviceRating }}</text>
            <uni-rate
              :value="rating.serviceRating"
              :size="16"
              :readonly="true"
              color="#FFD700"
            ></uni-rate>
          </view>
        </view>
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="rating-content">
      <view class="section-title">
        <text class="title-text">评价内容</text>
      </view>
      <view class="content-text">
        {{ rating.content }}
      </view>
    </view>

    <!-- 评价图片 -->
    <view v-if="rating.images && rating.images.length > 0" class="rating-images">
      <view class="section-title">
        <text class="title-text">评价图片</text>
        <text class="image-count">{{ rating.images.length }}张</text>
      </view>
      <view class="image-grid">
        <view
          v-for="(image, index) in rating.images"
          :key="index"
          class="image-item"
          @tap="previewImage(index)"
        >
          <image
            class="rating-image"
            :src="image"
            mode="aspectFill"
          ></image>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info" v-if="rating.order">
      <view class="section-title">
        <text class="title-text">关联订单</text>
      </view>
      <view class="order-card" @tap="viewOrderDetail">
        <image
          class="order-image"
          :src="rating.order.vehicle.images?.[0] || '/static/default-vehicle.png'"
          mode="aspectFill"
        ></image>
        <view class="order-details">
          <text class="order-vehicle">{{ rating.order.vehicle.name }}</text>
          <text class="order-no">订单号：{{ rating.order.orderNo }}</text>
          <view class="order-meta">
            <text class="order-time">{{ formatDateRange(rating.order.pickupTime, rating.order.returnTime) }}</text>
            <text class="order-amount">¥{{ rating.order.actualAmount }}</text>
          </view>
        </view>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="user-info">
      <view class="section-title">
        <text class="title-text">评价用户</text>
      </view>
      <view class="user-card">
        <image
          class="user-avatar"
          :src="rating.user.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <text class="user-name">{{ rating.user.name }}</text>
          <text class="user-phone">{{ maskPhoneNumber(rating.user.phone) }}</text>
        </view>
        <view class="user-status">
          <text class="status-text">已认证</text>
        </view>
      </view>
    </view>

    <!-- 评价时间 -->
    <view class="rating-time">
      <view class="section-title">
        <text class="title-text">评价时间</text>
      </view>
      <text class="time-text">{{ formatDateTime(rating.createdAt) }}</text>
    </view>

    <!-- 商家回复 -->
    <view v-if="rating.merchantReply" class="merchant-reply">
      <view class="section-title">
        <text class="title-text">商家回复</text>
        <view class="reply-badge">官方</view>
      </view>
      <view class="reply-content">
        <text class="reply-text">{{ rating.merchantReply.content }}</text>
        <text class="reply-time">{{ formatDateTime(rating.merchantReply.createdAt) }}</text>
      </view>
    </view>

    <!-- 点赞统计 -->
    <view class="rating-stats">
      <view class="stats-item">
        <uni-icons type="hand-up-filled" size="20" color="#FF9F29"></uni-icons>
        <text class="stats-text">{{ rating.helpfulCount }}人觉得有用</text>
      </view>
      <view class="stats-item" v-if="rating.replyCount > 0">
        <uni-icons type="chat-filled" size="20" color="#1890FF"></uni-icons>
        <text class="stats-text">{{ rating.replyCount }}条回复</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section" v-if="showActions">
      <button class="action-btn secondary" @tap="reportRating">
        举报评价
      </button>
      <button class="action-btn primary" @tap="shareRating">
        分享评价
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  ratingId: {
    type: Number,
    required: true
  }
});

// 状态管理
const rating = ref({});
const showActions = ref(true);

// 页面加载
onMounted(() => {
  loadRatingDetail();
});

// 加载评价详情
const loadRatingDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // 这里应该调用API获取评价详情
    // const response = await ratingApi.getRatingDetail(props.ratingId);
    // rating.value = response.data;

    // 模拟数据
    rating.value = {
      id: props.ratingId,
      overallRating: 4.8,
      vehicleRating: 4.5,
      serviceRating: 5.0,
      content: '车辆非常干净，性能良好，车况很新。服务态度也很好，取车还车都很方便。整体体验非常满意，下次还会选择这家！特别是车辆内部清洁度很高，开着很舒服。',
      images: [
        '/static/rating/vehicle1.jpg',
        '/static/rating/vehicle2.jpg',
        '/static/rating/vehicle3.jpg'
      ],
      user: {
        id: 12345,
        name: '张先生',
        phone: '13812345678',
        avatar: '/static/avatar/user1.jpg'
      },
      order: {
        id: 1001,
        orderNo: 'DD2024112001',
        vehicle: {
          id: 201,
          name: '豪华房车A型',
          images: ['/static/vehicle/luxury-a.jpg']
        },
        pickupTime: '2024-11-20T09:00:00+08:00',
        returnTime: '2024-11-25T18:00:00+08:00',
        actualAmount: 2800
      },
      createdAt: '2024-11-26T10:30:00+08:00',
      helpfulCount: 23,
      replyCount: 2,
      merchantReply: {
        content: '感谢您的好评！很高兴您对我们的车辆和服务都感到满意。我们会继续保持高标准的服务质量，期待您的下次光临！祝您生活愉快！',
        createdAt: '2024-11-26T14:20:00+08:00'
      }
    };

  } catch (error) {
    console.error('加载评价详情失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: rating.value.images,
    current: index
  });
};

// 查看订单详情
const viewOrderDetail = () => {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${rating.value.order.id}`
  });
};

// 举报评价
const reportRating = () => {
  uni.showActionSheet({
    itemList: ['内容不实', '恶意评价', '广告信息', '其他'],
    success: (res) => {
      const reasons = ['内容不实', '恶意评价', '广告信息', '其他'];
      const reason = reasons[res.tapIndex];

      uni.showModal({
        title: '举报评价',
        content: `确定要举报这条评价吗？\n举报原因：${reason}`,
        success: (modalRes) => {
          if (modalRes.confirm) {
            submitReport(reason);
          }
        }
      });
    }
  });
};

// 提交举报
const submitReport = async (reason) => {
  try {
    uni.showLoading({ title: '提交中...' });

    // 这里应该调用API提交举报
    // await ratingApi.reportRating(rating.value.id, { reason });

    uni.hideLoading();
    uni.showToast({
      title: '举报已提交',
      icon: 'success'
    });

  } catch (error) {
    uni.hideLoading();
    console.error('举报失败:', error);
    uni.showToast({
      title: '举报失败，请重试',
      icon: 'none'
    });
  }
};

// 分享评价
const shareRating = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: `https://daodaorv.com/rating/${rating.value.id}`,
    title: '房车租赁评价分享',
    summary: rating.value.content,
    imageUrl: rating.value.images?.[0] || '/static/share-default.jpg'
  });
};

// 工具方法
const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const formatDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return '';

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();

  return `${startMonth}.${startDay} - ${endMonth}.${endDay}`;
};

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
.rating-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 评分概览
.rating-overview {
  background-color: #ffffff;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 48rpx;

  .overall-rating {
    text-align: center;

    .rating-score {
      margin-bottom: 16rpx;

      .score-number {
        font-size: 64rpx;
        font-weight: 600;
        color: #FF9F29;
        display: block;
        margin-bottom: 16rpx;
      }
    }

    .rating-label {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .rating-breakdown {
    flex: 1;

    .rating-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      .item-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
      }

      .item-rating {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .item-score {
          font-size: 32rpx;
          font-weight: 600;
          color: #FF9F29;
        }
      }
    }
  }
}

// 通用标题样式
.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 32rpx 32rpx 16rpx;

  .title-text {
    font-size: 30rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  .image-count,
  .reply-badge {
    font-size: 22rpx;
    color: rgba(0, 0, 0, 0.6);
    background-color: #f0f0f0;
    padding: 4rpx 8rpx;
    border-radius: 8rpx;
  }

  .reply-badge {
    background-color: #FF9F29;
    color: #ffffff;
  }
}

// 评价内容
.rating-content {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .content-text {
    padding: 0 32rpx 32rpx;
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.8);
    line-height: 1.6;
  }
}

// 评价图片
.rating-images {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    padding: 0 32rpx 32rpx;

    .image-item {
      width: 200rpx;
      height: 200rpx;
      border-radius: 12rpx;
      overflow: hidden;

      .rating-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

// 订单信息
.order-info {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .order-card {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx 32rpx;
    gap: 24rpx;

    .order-image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 8rpx;
      flex-shrink: 0;
    }

    .order-details {
      flex: 1;

      .order-vehicle {
        font-size: 28rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        display: block;
        margin-bottom: 8rpx;
      }

      .order-no {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        display: block;
        margin-bottom: 8rpx;
      }

      .order-meta  { .order-time,
        .order-amount { font-size: 22rpx;
          color: rgba(0, 0, 0, 0.6);
          display: block;
          margin-bottom: 4rpx; }.order-amount { color: #FF9F29;
          font-weight: 500; } }
    }
  }
}

// 用户信息
.user-info {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .user-card {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx 32rpx;
    gap: 24rpx;

    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;

      .user-name {
        font-size: 28rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        display: block;
        margin-bottom: 8rpx;
      }

      .user-phone {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        display: block;
      }
    }

    .user-status   .status-text { font-size: 22rpx;
        color: #52C41A;
        background-color: rgba(82, 196, 26, 0.1);
        padding: 8rpx 16rpx;
        border-radius: 20rpx; }
  }
}

// 评价时间
.rating-time {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .time-text {
    padding: 24rpx 32rpx 32rpx;
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}

// 商家回复
.merchant-reply {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .reply-content {
    background-color: #f8f8f8;
    padding: 24rpx;
    margin: 0 32rpx 32rpx;
    border-radius: 12rpx;
    border-left: 4rpx solid #FF9F29;

    .reply-text {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.6;
      display: block;
      margin-bottom: 16rpx;
    }

    .reply-time {
      font-size: 22rpx;
      color: rgba(0, 0, 0, 0.6);
      display: block;
      text-align: right;
    }
  }
}

// 点赞统计
.rating-stats {
  background-color: #ffffff;
  margin-bottom: 24rpx;
  padding: 32rpx;

  .stats-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .last-child {
      margin-bottom: 0;
    }

    .stats-text {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.6);
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