<template>
  <view class="refund-page">
    <!-- 头部信息 -->
    <view class="header-section">
      <view class="order-summary">
        <text class="order-title">申请退款</text>
        <text class="order-no">订单号：{{ order.orderNo }}</text>
      </view>
    </view>

    <!-- 订单基本信息 -->
    <view class="order-info" v-if="order.vehicle">
      <view class="order-card">
        <image
          class="order-image"
          :src="order.vehicle.images?.[0] || '/static/default-vehicle.png'"
          mode="aspectFill"
        ></image>
        <view class="order-details">
          <text class="order-vehicle">{{ order.vehicle.name }}</text>
          <view class="order-meta">
            <text class="meta-text">{{ formatDateRange(order.pickupTime, order.returnTime) }}</text>
            <text class="meta-text">原价：¥{{ order.actualAmount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退款须知 -->
    <view class="notice-section">
      <view class="notice-header">
        <uni-icons type="info" size="20" color="#FF9F29"></uni-icons>
        <text class="notice-title">退款须知</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">• 全额退款：距离取车时间超过24小时可申请全额退款</text>
        <text class="notice-item">• 部分退款：根据使用情况申请部分退款</text>
        <text class="notice-item">• 退款将在1-3个工作日内处理完成</text>
        <text class="notice-item">• 退款将原路返回到您的支付账户</text>
      </view>
    </view>

    <!-- 退款类���选择 -->
    <view class="refund-type-section">
      <view class="section-title">
        <text class="title-text">退款类型</text>
        <text class="required">*</text>
      </view>
      <view class="type-options">
        <view
          class="type-option"
          :class="{ 'active': refundData.refundType === 'full' }"
          @tap="selectRefundType('full')"
        >
          <view class="option-header">
            <view class="option-radio">
              <view
                class="radio-dot"
                :class="{ 'selected': refundData.refundType === 'full' }"
              ></view>
            </view>
            <text class="option-title">全额退款</text>
            <text class="option-amount">¥{{ order.actualAmount }}</text>
          </view>
          <text class="option-desc">全额退还订单费用</text>
        </view>

        <view
          class="type-option"
          :class="{ 'active': refundData.refundType === 'partial' }"
          @tap="selectRefundType('partial')"
        >
          <view class="option-header">
            <view class="option-radio">
              <view
                class="radio-dot"
                :class="{ 'selected': refundData.refundType === 'partial' }"
              ></view>
            </view>
            <text class="option-title">部分退款</text>
            <text class="option-amount">自定义金额</text>
          </view>
          <text class="option-desc">根据实际情况申请部分退款</text>
        </view>
      </view>
    </view>

    <!-- 退款金额 -->
    <view class="refund-amount-section" v-if="refundData.refundType === 'partial'">
      <view class="section-title">
        <text class="title-text">退款金额</text>
        <text class="required">*</text>
      </view>
      <view class="amount-input-group">
        <text class="currency-symbol">¥</text>
        <input
          class="amount-input"
          v-model="refundData.refundAmount"
          type="digit"
          placeholder="请输入退款金额"
          :maxlength="10"
          @input="validateRefundAmount"
        />
      </view>
      <view class="amount-tips">
        <text class="tips-text">最多可退：¥{{ order.actualAmount }}</text>
      </view>
    </view>

    <!-- 退款原因 -->
    <view class="reason-section">
      <view class="section-title">
        <text class="title-text">退款原因</text>
        <text class="required">*</text>
      </view>
      <view class="reason-options">
        <view
          v-for="reason in refundReasons"
          :key="reason.value"
          class="reason-option"
          :class="{ 'active': refundData.refundReason === reason.label }"
          @tap="selectRefundReason(reason.label)"
        >
          <text class="reason-text">{{ reason.label }}</text>
        </view>
      </view>

      <input
        v-if="refundData.refundReason === '其他原因'"
        class="reason-input"
        v-model="customReason"
        placeholder="请输入具体退款原因"
        :maxlength="50"
        @input="onCustomReasonChange"
      />
    </view>

    <!-- 详细说明 -->
    <view class="detail-section">
      <view class="section-title">
        <text class="title-text">详细说明</text>
        <text class="optional">选填</text>
      </view>
      <textarea
        class="detail-textarea"
        v-model="refundData.detailedReason"
        placeholder="请详细说明退款原因，以便我们更好地为您处理"
        :maxlength="500"
        :show-confirm-bar="false"
      ></textarea>
      <view class="char-count">
        <text class="count-text">{{ refundData.detailedReason.length }}/500</text>
      </view>
    </view>

    <!-- 证据上传 -->
    <view class="evidence-section">
      <view class="section-title">
        <text class="title-text">上传证据</text>
        <text class="optional">选填</text>
      </view>
      <view class="evidence-grid">
        <view
          v-for="(image, index) in refundData.evidenceImages"
          :key="index"
          class="evidence-item"
        >
          <image
            class="evidence-image"
            :src="image"
            mode="aspectFill"
            @tap="previewImage(index)"
          ></image>
          <view class="delete-btn" @tap="deleteImage(index)">
            <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
          </view>
        </view>
        <view
          v-if="refundData.evidenceImages.length < 3"
          class="add-evidence"
          @tap="addEvidence"
        >
          <uni-icons type="camera" size="32" color="#cccccc"></uni-icons>
          <text class="add-text">添加图片</text>
        </view>
      </view>
      <text class="evidence-tips">最多可上传3张图片，支持JPG、PNG格式</text>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ 'disabled': !isFormValid || submitting }"
        :disabled="!isFormValid || submitting"
        :loading="submitting"
        @tap="submitRefund"
      >
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { orderApi } from '@/api/order';
import { orderEnhancedApi } from '@/api/orderEnhanced';

const userStore = useUserStore();

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
});

// 状态管理
const order = ref({});
const submitting = ref(false);
const customReason = ref('');

// 退款数据
const refundData = ref({
  refundType: 'full',
  refundAmount: '',
  refundReason: '',
  detailedReason: '',
  evidenceImages: []
});

// 退款原因选项
const refundReasons = [
  { label: '行程取消', value: 'trip_cancelled' },
  { label: '时间冲突', value: 'time_conflict' },
  { label: '车辆问题', value: 'vehicle_issue' },
  { label: '服务问题', value: 'service_issue' },
  { label: '其他原因', value: 'other' }
];

// 计算属性
const isFormValid = computed(() => {
  if (!refundData.value.refundType) return false;
  if (refundData.value.refundType === 'partial' && !refundData.value.refundAmount) return false;
  if (!refundData.value.refundReason) return false;

  // 验证退款金额
  if (refundData.value.refundType === 'partial') {
    const amount = parseFloat(refundData.value.refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > order.value.actualAmount) return false;
  }

  return true;
});

// 页面加载
onMounted(() => {
  loadOrderDetail();
});

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' });
    const response = await orderApi.getOrderDetail(props.orderId);
    order.value = response.data;

    // 根据订单状态和取车时间设置默认退款类型
    const now = new Date();
    const pickupTime = new Date(order.value.pickupTime);
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup < 24) {
      refundData.value.refundType = 'partial';
    }

  } catch (error) {
    console.error('加载订单详情失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 选择退款类型
const selectRefundType = (type) => {
  refundData.value.refundType = type;
  if (type === 'full') {
    refundData.value.refundAmount = order.value.actualAmount.toString();
  } else {
    refundData.value.refundAmount = '';
  }
};

// 验证退款金额
const validateRefundAmount = () => {
  const amount = parseFloat(refundData.value.refundAmount);
  const maxAmount = order.value.actualAmount;

  if (amount > maxAmount) {
    refundData.value.refundAmount = maxAmount.toString();
    uni.showToast({
      title: `退款金额不能超过¥${maxAmount}`,
      icon: 'none'
    });
  }
};

// 选择退款原因
const selectRefundReason = (reason) => {
  refundData.value.refundReason = reason;
  if (reason !== '其他原因') {
    customReason.value = '';
  }
};

// 自定义原因输入
const onCustomReasonChange = () => {
  refundData.value.refundReason = customReason.value;
};

// 添加证据图片
const addEvidence = () => {
  uni.chooseImage({
    count: 3 - refundData.value.evidenceImages.length,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      refundData.value.evidenceImages.push(...res.tempFilePaths);
    },
    fail: (error) => {
      console.error('选择图片失败:', error);
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      });
    }
  });
};

// 删除证据图片
const deleteImage = (index) => {
  refundData.value.evidenceImages.splice(index, 1);
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: refundData.value.evidenceImages,
    current: index
  });
};

// 提交退款申请
const submitRefund = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请完善退款信息',
      icon: 'none'
    });
    return;
  }

  submitting.value = true;

  try {
    const data = {
      refundType: refundData.value.refundType,
      refundAmount: refundData.value.refundAmount || order.value.actualAmount,
      refundReason: refundData.value.refundReason,
      detailedReason: refundData.value.detailedReason,
      evidenceImages: refundData.value.evidenceImages
    };

    await orderEnhancedApi.requestRefund(props.orderId, data);

    uni.showToast({
      title: '退款申请提交成功',
      icon: 'success'
    });

    // 延迟跳转到订单详情
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('提交退款申请失败:', error);
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};

// 工具方法
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
</script>

<style>
.refund-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

// 头部信息
.header-section {
  background-color: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .order-summary {
    text-align: center;

    .order-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
      display: block;
      margin-bottom: 16rpx;
    }

    .order-no {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

// 订单基本信息
.order-info {
  background-color: #ffffff;
  padding: 0 32rpx 32rpx;
  margin-bottom: 24rpx;

  .order-card {
    display: flex;
    gap: 24rpx;
    padding: 24rpx 0;

    .order-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .order-details {
      flex: 1;

      .order-vehicle {
        font-size: 30rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 12rpx;
        display: block;
      }

      .order-meta  { .meta-text { font-size: 26rpx;
          color: rgba(0, 0, 0, 0.6);
          display: block;
          margin-bottom: 4rpx; } }
    }
  }
}

// 退款须知
.notice-section {
  background-color: #fff7e6;
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #FF9F29;

  .notice-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .notice-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FF9F29;
    }
  }

  .notice-content  { .notice-item { font-size: 24rpx;
      color: rgba(0, 0, 0, 0.7);
      line-height: 1.6;
      display: block;
      margin-bottom: 8rpx; } }
}

// 通用标题样式
.section-title {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 24rpx 32rpx 16rpx;

  .title-text {
    font-size: 30rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  .required {
    color: #FF4D4F;
    font-size: 28rpx;
  }

  .optional {
    font-size: 24rpx;
    color: rgba(0, 0, 0, 0.4);
  }
}

// 退款类型选择
.refund-type-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .type-options {
    padding: 0 32rpx 32rpx;

    .type-option {
      padding: 24rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 12rpx;

      .last-child {
        margin-bottom: 0;
      }

      &.active {
        border-color: #FF9F29;
        background-color: rgba(255, 159, 41, 0.05);
      }

      .option-header {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 12rpx;

        .option-radio  { .radio-dot { width: 20rpx;
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

        .option-title {
          flex: 1;
          font-size: 28rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
        }

        .option-amount {
          font-size: 28rpx;
          font-weight: 600;
          color: #FF9F29;
        }
      }

      .option-desc {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        margin-left: 36rpx;
      }
    }
  }
}

// 退款金额
.refund-amount-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .amount-input-group {
    display: flex;
    align-items: center;
    padding: 0 32rpx 16rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .currency-symbol {
      font-size: 36rpx;
      font-weight: 600;
      color: #FF9F29;
      margin-right: 16rpx;
    }

    .amount-input {
      flex: 1;
      height: 80rpx;
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  .amount-tips {
    padding: 0 32rpx 32rpx;

    .tips-text {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

// 退款原因
.reason-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .reason-options {
    padding: 0 32rpx 24rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .reason-option {
      padding: 16rpx 24rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 25rpx;
      background-color: #fafafa;

      &.active {
        border-color: #FF9F29;
        background-color: rgba(255, 159, 41, 0.1);

        .reason-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .reason-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .reason-input {
    width: calc(100% - 64rpx);
    height: 80rpx;
    padding: 0 32rpx;
    margin: 0 32rpx 32rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    font-size: 28rpx;
    background-color: #fafafa;
  }
}

// 详细说明
.detail-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .detail-textarea {
    width: calc(100% - 64rpx);
    min-height: 200rpx;
    padding: 24rpx 32rpx;
    margin: 0 32rpx 16rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    font-size: 28rpx;
    line-height: 1.6;
    background-color: #fafafa;
  }

  .char-count {
    text-align: right;
    padding: 0 32rpx 32rpx;

    .count-text {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }
}

// 证据上传
.evidence-section {
  background-color: #ffffff;
  margin-bottom: 24rpx;

  .evidence-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    padding: 0 32rpx 24rpx;

    .evidence-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;

      .evidence-image {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }

      .delete-btn {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: #FF4D4F;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .add-evidence {
      width: 160rpx;
      height: 160rpx;
      border: 2rpx dashed #cccccc;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      background-color: #fafafa;

      .add-text {
        font-size: 24rpx;
        color: #cccccc;
      }
    }
  }

  .evidence-tips {
    font-size: 22rpx;
    color: rgba(0, 0, 0, 0.4);
    text-align: center;
    padding: 0 32rpx 32rpx;
  }
}

// 提交按钮
.submit-section {
  padding: 32rpx;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;

    &.disabled {
      background-color: #cccccc;
      color: #999999;
    }

    &::after {
      border: none;
    }
  }
}
</style>