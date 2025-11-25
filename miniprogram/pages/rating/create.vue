<template>
  <view class="create-rating-page">
    <!-- 订单信息 -->
    <view class="order-info" v-if="orderInfo">
      <view class="vehicle-info">
        <image
          class="vehicle-image"
          :src="orderInfo.vehicle.image || '/static/default-vehicle.png'"
          mode="aspectFill"
        ></image>
        <view class="vehicle-details">
          <text class="vehicle-name">{{ orderInfo.vehicle.name }}</text>
          <text class="order-date">{{ formatDate(orderInfo.startDate) }} - {{ formatDate(orderInfo.endDate) }}</text>
        </view>
      </view>
    </view>

    <!-- 评分表单 -->
    <view class="rating-form">
      <!-- 总体评分 -->
      <view class="rating-section">
        <view class="section-title">
          <text class="title-text">总体评价</text>
          <text class="required">*</text>
        </view>
        <view class="rating-stars-large">
          <view
            v-for="i in 5"
            :key="i"
            class="star-item"
            @tap="setRating('overallRating', i)"
          >
            <uni-icons
              :type="i <= formData.overallRating ? 'star-filled' : 'star'"
              size="48"
              :color="i <= formData.overallRating ? '#FFB800' : '#E5E5E5'"
            ></uni-icons>
          </view>
        </view>
        <text class="rating-desc">{{ getRatingDescription(formData.overallRating) }}</text>
      </view>

      <!-- 详细评分 -->
      <view class="detail-ratings">
        <view class="rating-item">
          <view class="rating-label">
            <text class="label-text">车辆状况</text>
            <text class="required">*</text>
          </view>
          <view class="rating-stars-medium">
            <view
              v-for="i in 5"
              :key="i"
              class="star-item-small"
              @tap="setRating('vehicleRating', i)"
            >
              <uni-icons
                :type="i <= formData.vehicleRating ? 'star-filled' : 'star'"
                size="32"
                :color="i <= formData.vehicleRating ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-label">
            <text class="label-text">服务态度</text>
            <text class="required">*</text>
          </view>
          <view class="rating-stars-medium">
            <view
              v-for="i in 5"
              :key="i"
              class="star-item-small"
              @tap="setRating('serviceRating', i)"
            >
              <uni-icons
                :type="i <= formData.serviceRating ? 'star-filled' : 'star'"
                size="32"
                :color="i <= formData.serviceRating ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-label">
            <text class="label-text">卫生状况</text>
            <text class="required">*</text>
          </view>
          <view class="rating-stars-medium">
            <view
              v-for="i in 5"
              :key="i"
              class="star-item-small"
              @tap="setRating('cleanlinessRating', i)"
            >
              <uni-icons
                :type="i <= formData.cleanlinessRating ? 'star-filled' : 'star'"
                size="32"
                :color="i <= formData.cleanlinessRating ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
        </view>

        <view class="rating-item">
          <view class="rating-label">
            <text class="label-text">描述准确性</text>
            <text class="required">*</text>
          </view>
          <view class="rating-stars-medium">
            <view
              v-for="i in 5"
              :key="i"
              class="star-item-small"
              @tap="setRating('accuracyRating', i)"
            >
              <uni-icons
                :type="i <= formData.accuracyRating ? 'star-filled' : 'star'"
                size="32"
                :color="i <= formData.accuracyRating ? '#FFB800' : '#E5E5E5'"
              ></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 评价内容 -->
      <view class="content-section">
        <view class="section-title">
          <text class="title-text">评价内容</text>
          <text class="optional">选填</text>
        </view>
        <textarea
          class="content-input"
          v-model="formData.content"
          placeholder="分享一下您的使用体验，为其他用户参考..."
          maxlength="1000"
          :show-confirm-bar="false"
        ></textarea>
        <view class="char-count">
          <text class="count-text">{{ formData.content.length }}/1000</text>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="images-section">
        <view class="section-title">
          <text class="title-text">上传图片</text>
          <text class="optional">选填</text>
        </view>
        <view class="images-grid">
          <view
            v-for="(image, index) in formData.images"
            :key="index"
            class="image-item"
          >
            <image
              class="uploaded-image"
              :src="image"
              mode="aspectFill"
              @tap="previewImage(formData.images, index)"
            ></image>
            <view class="delete-btn" @tap="deleteImage(index)">
              <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
            </view>
          </view>
          <view
            v-if="formData.images.length < 6"
            class="add-image"
            @tap="addImage"
          >
            <uni-icons type="camera" size="32" color="#cccccc"></uni-icons>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 标签选择 -->
      <view class="tags-section" v-if="availableTags.length > 0">
        <view class="section-title">
          <text class="title-text">添加标签</text>
          <text class="optional">选填</text>
        </view>
        <view class="tags-list">
          <view
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-item"
            :class="{ 'selected': formData.tags.includes(tag.name) }"
            @tap="toggleTag(tag.name)"
          >
            <text class="tag-text">{{ tag.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ 'disabled': !isFormValid || submitting }"
        :disabled="!isFormValid || submitting"
        :loading="submitting"
        @tap="submitRating"
      >
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { orderApi } from '@/api/order';
import { ratingApi } from '@/api/rating';

const userStore = useUserStore();

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
});

// 状态管理
const orderInfo = ref(null);
const availableTags = ref([]);
const submitting = ref(false);

// 表单数据
const formData = ref({
  orderId: props.orderId,
  userId: 0,
  vehicleId: 0,
  ownerId: 0,
  overallRating: 5,
  vehicleRating: 5,
  serviceRating: 5,
  cleanlinessRating: 5,
  accuracyRating: 5,
  content: '',
  images: [],
  tags: []
});

// 计算属性
const isFormValid = computed(() => {
  return (
    formData.value.overallRating > 0 &&
    formData.value.vehicleRating > 0 &&
    formData.value.serviceRating > 0 &&
    formData.value.cleanlinessRating > 0 &&
    formData.value.accuracyRating > 0
  );
});

// 页面加载
onMounted(async () => {
  await Promise.all([
    loadOrderInfo(),
    loadRatingTags()
  ]);

  if (orderInfo.value) {
    formData.value.userId = userStore.userInfo.id;
    formData.value.vehicleId = orderInfo.value.vehicle.id;
    formData.value.ownerId = orderInfo.value.vehicle.ownerId;
  }
});

// 加载订单信息
const loadOrderInfo = async () => {
  try {
    const response = await orderApi.getOrderDetail(props.orderId);
    orderInfo.value = response.data;
  } catch (error) {
    console.error('加载订单信息失败:', error);
    uni.showToast({
      title: '加载订单信息失败',
      icon: 'none'
    });
  }
};

// 加载评价标签
const loadRatingTags = async () => {
  try {
    const response = await ratingApi.getRatingTags();
    availableTags.value = response.data.slice(0, 10); // 显示前10个标签
  } catch (error) {
    console.error('加载评价标签失败:', error);
  }
};

// 设置评分
const setRating = (field, value) => {
  formData.value[field] = value;
};

// 获取评分描述
const getRatingDescription = (rating) => {
  const descriptions = {
    1: '非常不满意',
    2: '不满意',
    3: '一般',
    4: '满意',
    5: '非常满意'
  };
  return descriptions[rating] || '';
};

// 添加图片
const addImage = () => {
  uni.chooseImage({
    count: 6 - formData.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      formData.value.images.push(...res.tempFilePaths);
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

// 删除图片
const deleteImage = (index) => {
  formData.value.images.splice(index, 1);
};

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current
  });
};

// 切换标签选择
const toggleTag = (tagName) => {
  const index = formData.value.tags.indexOf(tagName);
  if (index > -1) {
    formData.value.tags.splice(index, 1);
  } else {
    if (formData.value.tags.length < 5) {
      formData.value.tags.push(tagName);
    } else {
      uni.showToast({
        title: '最多选择5个标签',
        icon: 'none'
      });
    }
  }
};

// 提交评价
const submitRating = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请完成所有必填项',
      icon: 'none'
    });
    return;
  }

  submitting.value = true;

  try {
    // 这里应该先上传图片到服务器，获取图片URL
    // 暂时使用本地路径作为演示
    const imageUrls = [...formData.value.images];

    await ratingApi.createRating({
      ...formData.value,
      images: imageUrls
    });

    uni.showToast({
      title: '评价提交成功',
      icon: 'success'
    });

    // 延迟跳转到订单列表
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/order/list'
      });
    }, 1500);
  } catch (error) {
    console.error('提交评价失败:', error);
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}-${date.getDate()}`;
};
</script>

<style>
.create-rating-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

// 订单信息
.order-info {
  background-color: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .vehicle-info {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .vehicle-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
    }

    .vehicle-details {
      flex: 1;

      .vehicle-name {
        font-size: 32rpx;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        margin-bottom: 12rpx;
        display: block;
      }

      .order-date {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
}

// 评价表单
.rating-form {
  background-color: #ffffff;
  padding: 32rpx;
}

// 评分区域
.rating-section {
  margin-bottom: 48rpx;
  text-align: center;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-bottom: 32rpx;

    .title-text {
      font-size: 32rpx;
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

  .rating-stars-large {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .star-item {
      cursor: pointer;
      transition: transform 0.2s ease;

      .active {
        transform: scale(0.9);
      }
    }
  }

  .rating-desc {
    font-size: 28rpx;
    color: #FF9F29;
    font-weight: 500;
  }
}

// 详细评分
.detail-ratings {
  margin-bottom: 48rpx;

  .rating-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;

    .rating-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      width: 160rpx;

      .label-text {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
      }

      .required {
        color: #FF4D4F;
        font-size: 24rpx;
      }
    }

    .rating-stars-medium {
      display: flex;
      gap: 12rpx;

      .star-item-small {
        cursor: pointer;
        transition: transform 0.2s ease;

        .active {
          transform: scale(0.9);
        }
      }
    }
  }
}

// 内容区域
.content-section {
  margin-bottom: 48rpx;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 30rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .optional {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }

  .content-input {
    width: 100%;
    min-height: 200rpx;
    padding: 24rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.8);
    line-height: 1.6;
    background-color: #fafafa;
  }

  .char-count {
    text-align: right;
    margin-top: 16rpx;

    .count-text {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }
}

// 图片区域
.images-section {
  margin-bottom: 48rpx;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 30rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .optional {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }

  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .image-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;

      .uploaded-image {
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

    .add-image {
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
}

// 标签区域
.tags-section {
  margin-bottom: 48rpx;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 30rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .optional {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.4);
    }
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .tag-item {
      padding: 16rpx 24rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 25rpx;
      background-color: #fafafa;

      .tag-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.6);
      }

      &.selected {
        border-color: #FF9F29;
        background-color: rgba(255, 159, 41, 0.1);

        .tag-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }
    }
  }
}

// 提交区域
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 32rpx;
  border-top: 2rpx solid #f0f0f0;

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