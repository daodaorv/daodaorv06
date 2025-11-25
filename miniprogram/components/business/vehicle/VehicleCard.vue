<!-- 房车卡片组件 -->
<template>
  <uni-card
    class="vehicle-card"
    :padding="0"
    :margin="margin"
    :is-shadow="shadow"
    @click="handleCardClick"
  >
    <view class="vehicle-card__content">
      <!-- 车辆图片区域 -->
      <view class="vehicle-image-container">
        <image
          class="vehicle-image"
          :src="vehicle.mainImage || '/static/placeholder-vehicle.png'"
          mode="aspectFill"
          lazy-load
          @error="handleImageError"
        />

        <!-- 车辆状态标签 -->
        <view class="vehicle-status" :class="getAvailabilityClass(vehicle.availabilityStatus || '可用')">
          <text class="status-text">{{ getAvailabilityText(vehicle.availabilityStatus || '可用') }}</text>
        </view>

        <!-- 车辆特色标签 -->
        <view class="vehicle-badges">
          <view v-if="vehicle.isPopular" class="badge popular">
            <uni-icons type="fire-filled" size="12" color="#FFFFFF"></uni-icons>
            <text class="badge-text">热门</text>
          </view>
          <view v-if="vehicle.isNew" class="badge new">
            <uni-icons type="plus-filled" size="12" color="#FFFFFF"></uni-icons>
            <text class="badge-text">新车</text>
          </view>
          <view v-if="vehicle.discount" class="badge discount">
            <uni-icons type="star-filled" size="12" color="#FFFFFF"></uni-icons>
            <text class="badge-text">{{ vehicle.discount }}折</text>
          </view>
        </view>

        <!-- 收藏按钮 -->
        <view v-if="showFavorite" class="favorite-btn" @click.stop="handleFavoriteClick">
          <uni-icons
            :type="isFavorited ? 'heart-filled' : 'heart'"
            size="20"
            :color="isFavorited ? '#FC8181' : '#FFFFFF'"
          />
        </view>
      </view>

      <!-- 车辆信息区域 -->
      <view class="vehicle-info">
        <!-- 车辆标题和评分 -->
        <view class="vehicle-header">
          <view class="title-section">
            <text class="brand-name">{{ vehicle.brand }}</text>
            <text class="model-name">{{ vehicle.model }}</text>
          </view>
          <view v-if="vehicle.ratingCount && vehicle.ratingCount > 0" class="rating-section">
            <uni-icons type="star-filled" size="16" color="#F6AD55"></uni-icons>
            <text class="rating-score">{{ vehicle.ratingAvg }}</text>
            <text class="rating-count">({{ vehicle.ratingCount }})</text>
          </view>
        </view>

        <!-- 车辆特性 -->
        <view class="vehicle-features">
          <view class="feature-chip">
            <uni-icons type="person-filled" size="14" color="#718096"></uni-icons>
            <text class="feature-text">{{ vehicle.seats }}座</text>
          </view>
          <view class="feature-chip">
            <uni-icons type="navigation" size="14" color="#718096"></uni-icons>
            <text class="feature-text">{{ vehicle.fuelType }}</text>
          </view>
          <view v-if="vehicle.categoryName" class="feature-chip">
            <uni-icons type="home" size="14" color="#718096"></uni-icons>
            <text class="feature-text">{{ vehicle.categoryName }}</text>
          </view>
        </view>

        <!-- 车辆设施 -->
        <view v-if="vehicle.amenities && vehicle.amenities.length > 0" class="vehicle-amenities">
          <view class="amenities-list">
            <view
              v-for="amenity in vehicle.amenities.slice(0, 3)"
              :key="amenity"
              class="amenity-item"
            >
              <uni-icons :type="getAmenityIcon(amenity)" size="14" :color="'#67C23A'"></uni-icons>
              <text class="amenity-text">{{ amenity }}</text>
            </view>
            <view v-if="vehicle.amenities.length > 3" class="more-amenities">
              <text class="more-text">+{{ vehicle.amenities.length - 3 }}项</text>
            </view>
          </view>
        </view>

        <!-- 门店信息 -->
        <view class="store-info">
          <uni-icons type="location-filled" size="14" color="#FF9F29"></uni-icons>
          <text class="store-name">{{ getStoreName(vehicle.storeId) }}</text>
          <view v-if="vehicle.distance" class="distance-badge">
            <uni-icons type="paperplane" size="12" color="#4B91FF"></uni-icons>
            <text class="distance-text">{{ vehicle.distance }}</text>
          </view>
        </view>

        <!-- 价格和预订区域 -->
        <view class="vehicle-footer">
          <view class="price-section">
            <view class="price-main">
              <text class="price-symbol">¥</text>
              <text class="price-amount">{{ vehicle.dailyRate || vehicle.dailyPrice }}</text>
              <text class="price-unit">/天</text>
            </view>
            <view v-if="vehicle.monthlyRate" class="price-info">
              <text class="monthly-price">包月¥{{ vehicle.monthlyRate }}</text>
            </view>
          </view>

          <uni-button
            type="primary"
            size="mini"
            text="快速预订"
            @click.stop="handleQuickBook"
          />
        </view>
      </view>
    </view>
  </uni-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Vehicle {
  id: string | number;
  brand: string;
  model: string;
  mainImage?: string;
  dailyRate?: number;
  dailyPrice?: number;
  monthlyRate?: number;
  availabilityStatus?: string;
  isPopular?: boolean;
  isNew?: boolean;
  discount?: number;
  seats: number;
  fuelType: string;
  categoryName?: string;
  amenities?: string[];
  storeId: string | number;
  distance?: string;
  ratingAvg?: number;
  ratingCount?: number;
}

interface VehicleCardProps {
  /** 车辆信息 */
  vehicle: Vehicle;
  /** 是否已收藏 */
  isFavorited?: boolean;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
  /** 外边距 */
  margin?: string | number;
  /** 是否显示阴影 */
  shadow?: boolean;
}

interface VehicleCardEmits {
  (e: 'click', vehicle: Vehicle): void;
  (e: 'toggle-favorite', vehicle: Vehicle): void;
  (e: 'quick-book', vehicle: Vehicle): void;
  (e: 'image-error', vehicle: Vehicle, error: Event): void;
}

const props = withDefaults(defineProps<VehicleCardProps>(), {
  isFavorited: false,
  showFavorite: true,
  margin: '0 0 32rpx 0',
  shadow: true
});

const emit = defineEmits<VehicleCardEmits>();

// 计算属性
const vehicle = computed(() => props.vehicle);

// 事件处理
const handleCardClick = () => {
  emit('click', vehicle.value);
};

const handleFavoriteClick = () => {
  emit('toggle-favorite', vehicle.value);
};

const handleQuickBook = () => {
  emit('quick-book', vehicle.value);
};

const handleImageError = (error: Event) => {
  emit('image-error', vehicle.value, error);
};

// 工具方法
const getAvailabilityText = (status: string) => {
  const statusMap: Record<string, string> = {
    '可用': '可租',
    '已预定': '已预定',
    '使用中': '使用中',
    '维护中': '维护中',
    '不可用': '不可用'
  };
  return statusMap[status] || status;
};

const getAvailabilityClass = (status: string) => {
  const classMap: Record<string, string> = {
    '可用': 'available',
    '已预定': 'reserved',
    '使用中': 'in-use',
    '维护中': 'maintenance',
    '不可用': 'unavailable'
  };
  return classMap[status] || '';
};

const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, string> = {
    'WiFi': 'wifi-filled',
    '空调': 'gear-filled',
    '厨房': 'home-filled',
    '卫生间': 'staff-filled',
    '电视': 'phone-filled',
    '冰箱': 'calendar-filled',
    '淋浴': 'water-filled'
  };
  return iconMap[amenity] || 'checkmarkempty';
};

const getStoreName = (storeId: string | number) => {
  const storeNames: Record<string, string> = {
    '1': '北京朝阳店',
    '2': '上海浦东店',
    '3': '广州天河店',
    '4': '深圳南山店'
  };
  return storeNames[String(storeId)] || '未知门店';
};
</script>

<style>
// 色彩系统
#FF9F29: #FF9F29;
#67C23A: #67C23A;
#FF4D4F: #FF4D4F;
#4B91FF: #4B91FF;
#F6AD55: #F6AD55;
#333333: #1A1A1A;
#666666: #667085;
#999999: #98A1B2;
#F8F8F8: #F7F8FA;
#FFFFFF: #FFFFFF;
#E8E8E8: #EEF0F3;

.vehicle-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  .active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
  }

  &__content {
    position: relative;
  }

  // 车辆图片容器
  .vehicle-image-container {
    position: relative;
    width: 100%;
    height: 320rpx;

    .vehicle-image {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #F2F4F6 0%, #E5E7EB 100%);
    }

    // 车辆状态标签
    .vehicle-status {
      position: absolute;
      top: 24rpx;
      left: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      backdrop-filter: blur(20rpx);
      border: 1rpx solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

      .status-text {
        font-size: 20rpx;
        font-weight: 600;
        color: #FFFFFF;
        line-height: 1.2;
      }

      &.available {
        background: linear-gradient(135deg, #67C23A 0%, #68D391 100%);
      }

      &.reserved {
        background: linear-gradient(135deg, #F6AD55 0%, #F6AD55 100%);
      }

      &.in-use {
        background: linear-gradient(135deg, #FF4D4F 0%, #FC8181 100%);
      }

      &.maintenance,
      &.unavailable {
        background: linear-gradient(135deg, #999999 0%, #718096 100%);
      }
    }

    // 车辆特色标签
    .vehicle-badges {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .badge {
        display: flex;
        align-items: center;
        gap: 4rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        backdrop-filter: blur(20rpx);
        border: 1rpx solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

        .badge-text {
          font-size: 20rpx;
          font-weight: 600;
          color: #FFFFFF;
          line-height: 1.2;
        }

        &.popular {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8F5A 100%);
        }

        &.new {
          background: linear-gradient(135deg, #67C23A 0%, #68D391 100%);
        }

        &.discount {
          background: linear-gradient(135deg, #E53E3E 0%, #FC8181 100%);
        }
      }
    }

    // 收藏按钮
    .favorite-btn {
      position: absolute;
      bottom: 24rpx;
      right: 24rpx;
      width: 80rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20rpx);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      border: 2rpx solid rgba(0, 0, 0, 0.05);

      .active {
        transform: scale(0.9);
        background: #FFFFFF;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
      }
    }
  }

  // 车辆信息
  .vehicle-info {
    padding: 32rpx;
  }

  // 车辆头部
  .vehicle-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;

    .title-section {
      flex: 1;

      .brand-name {
        font-size: 36rpx;
        font-weight: 700;
        color: #333333;
        margin-bottom: 8rpx;
        display: block;
        line-height: 1.3;
      }

      .model-name {
        font-size: 28rpx;
        color: #666666;
        display: block;
        line-height: 1.4;
        margin-bottom: 12rpx;
      }
    }

    .rating-section {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: linear-gradient(135deg, rgba(#F6AD55, 0.1) 0%, rgba(#F6AD55, 0.05) 100%);
      padding: 12rpx 16rpx;
      border-radius: 20rpx;
      border: 1rpx solid rgba(#F6AD55, 0.2);

      .rating-score {
        font-size: 28rpx;
        color: #F6AD55;
        font-weight: 600;
      }

      .rating-count {
        font-size: 20rpx;
        color: #F6AD55;
        opacity: 0.8;
      }
    }
  }

  // 车辆特性
  .vehicle-features {
    display: flex;
    gap: 12rpx;
    margin-bottom: 24rpx;
    flex-wrap: wrap;

    .feature-chip {
      display: flex;
      align-items: center;
      gap: 4rpx;
      padding: 12rpx 16rpx;
      background: linear-gradient(135deg, rgba(#FF9F29, 0.08) 0%, rgba(#FF9F29, 0.04) 100%);
      border: 1rpx solid rgba(#FF9F29, 0.15);
      border-radius: 20rpx;
      transition: all 0.3s ease;

      .feature-text {
        font-size: 20rpx;
        color: #FF9F29;
        font-weight: 500;
        line-height: 1.3;
      }
    }
  }

  // 车辆设施
  .vehicle-amenities {
    margin-bottom: 24rpx;

    .amenities-list {
      display: flex;
      gap: 16rpx;
      align-items: center;
      flex-wrap: wrap;

      .amenity-item {
        display: flex;
        align-items: center;
        gap: 4rpx;
        padding: 8rpx 12rpx;
        background: rgba(#67C23A, 0.08);
        border: 1rpx solid rgba(#67C23A, 0.15);
        border-radius: 8rpx;

        .amenity-text {
          font-size: 20rpx;
          color: #67C23A;
          font-weight: 500;
        }
      }

      .more-amenities  { .more-text { font-size: 20rpx;
          color: #999999;
          font-weight: 500; } }
    }
  }

  // 门店信息
  .store-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
    padding: 24rpx;
    background: linear-gradient(135deg, rgba(#FF9F29, 0.05) 0%, rgba(#FF9F29, 0.02) 100%);
    border-radius: 12rpx;
    border: 1rpx solid rgba(#FF9F29, 0.1);

    .store-name {
      font-size: 24rpx;
      color: #666666;
      flex: 1;
      line-height: 1.4;
      font-weight: 500;
    }

    .distance-badge {
      display: flex;
      align-items: center;
      gap: 4rpx;
      background: rgba(#4B91FF, 0.1);
      padding: 8rpx 12rpx;
      border-radius: 8rpx;
      border: 1rpx solid rgba(#4B91FF, 0.2);

      .distance-text {
        font-size: 20rpx;
        color: #4B91FF;
        font-weight: 500;
      }
    }
  }

  // 价格和预订区域
  .vehicle-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;
    border-top: 2rpx solid rgba(#E8E8E8, 0.8);

    .price-section  { .price-main { display: flex;
        align-items: baseline;
        gap: 2rpx;
        margin-bottom: 8rpx;

        .price-symbol { font-size: 28rpx;
          color: #FF9F29;
          font-weight: 600; }.price-amount { font-size: 40rpx;
          color: #FF9F29;
          font-weight: 700;
          line-height: 1.2; }.price-unit { font-size: 24rpx;
          color: #666666;
          font-weight: 400; } }

      .price-info  { .monthly-price { font-size: 20rpx;
          color: #67C23A;
          font-weight: 500;
          background: rgba(#67C23A, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 8rpx; } }
    }
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .vehicle-card  { .vehicle-image-container { height: 280rpx; }.vehicle-info { padding: 24rpx; }.vehicle-header { .title-section { .brand-name { font-size: 32rpx; }.model-name { font-size: 26rpx; } }
    }

    .vehicle-features  { .feature-chip { padding: 10rpx 14rpx;

        .feature-text { font-size: 18rpx; } }
    }
  }
}
</style>