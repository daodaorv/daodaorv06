<template>
  <view class="vehicle-detail">
    <image :src="vehicle.image" class="header-img" mode="aspectFill"></image>

    <view class="info-section">
      <text class="vehicle-name">{{ vehicle.name }}</text>
      <text class="plate">{{ vehicle.plate }}</text>
      <view class="status-badge" :class="vehicle.status">{{ vehicle.statusText }}</view>
    </view>

    <view class="data-section">
      <view class="data-item">
        <text class="data-label">今日收益</text>
        <text class="data-value">¥{{ vehicle.todayIncome }}</text>
      </view>
      <view class="data-item">
        <text class="data-label">本月收益</text>
        <text class="data-value">¥{{ vehicle.monthIncome }}</text>
      </view>
      <view class="data-item">
        <text class="data-label">累计收益</text>
        <text class="data-value">¥{{ vehicle.totalIncome }}</text>
      </view>
    </view>

    <view class="detail-section">
      <view class="detail-item">
        <text class="label">当前位置</text>
        <text class="value">{{ vehicle.location }}</text>
      </view>
      <view class="detail-item">
        <text class="label">保险状态</text>
        <text class="value">{{ vehicle.insurance }}</text>
      </view>
      <view class="detail-item">
        <text class="label">下次维保</text>
        <text class="value">{{ vehicle.nextMaintenance }}</text>
      </view>
    </view>

    <button class="action-btn" @click="applySelfUse">申请自用</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { logger } from '@/utils/logger';
import { getVehicleDetail } from '@/api/hosting';

// 车辆数据
const vehicle = ref<any>({
  name: '',
  plate: '',
  image: '/static/logo.png',
  status: '',
  statusText: '',
  todayIncome: 0,
  monthIncome: 0,
  totalIncome: 0,
  location: '',
  insurance: '',
  nextMaintenance: ''
});

const loading = ref(false);
const vehicleId = ref('');

// 加载车辆详情
const loadVehicleDetail = async (id: string) => {
  loading.value = true;
  try {
    const res: any = await getVehicleDetail(Number(id));

    // 数据校验
    if (!res || res.code !== 0 || !res.data) {
      throw new Error('车辆数据格式错误');
    }

    const data = res.data;

    // 数据校验：检查必要字段
    if (!data.id || !data.name) {
      throw new Error('车辆数据不完整');
    }

    vehicle.value = {
      id: data.id,
      name: data.name,
      plate: data.plate || '未知车牌',
      image: data.image || '/static/logo.png',
      status: data.status || 'idle',
      statusText: data.statusText || '空闲中',
      todayIncome: data.todayIncome || 0,
      monthIncome: data.monthIncome || 0,
      totalIncome: data.totalIncome || 0,
      location: data.location || '未知位置',
      insurance: data.insurance || '未投保',
      nextMaintenance: data.nextMaintenance || '未设置'
    };

    logger.debug('成功加载车辆详情:', id, vehicle.value);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载失败';
    logger.error('加载车辆详情失败:', error);
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } finally {
    loading.value = false;
  }
};

// 申请自用
const applySelfUse = () => {
  if (!vehicle.value.id) {
    uni.showToast({
      title: '车辆信息不完整',
      icon: 'none'
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/hosting/self-use/index?vehicleId=${vehicle.value.id}`
  });
};

// 页面加载
onLoad(async (options: any) => {
  const id = options?.id;

  // 数据校验：必须提供车辆ID
  if (!id) {
    logger.error('缺少车辆ID参数');
    uni.showToast({
      title: '车辆参数错误',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    return;
  }

  vehicleId.value = id;
  await loadVehicleDetail(id);
});
</script>

<style scoped lang="scss">
.vehicle-detail {
  min-height: 100vh;
  background: $uni-bg-color;
  padding-bottom: 120rpx;
}

.header-img {
  width: 100%;
  height: 400rpx;
}

.info-section {
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.vehicle-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.plate {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-lg;
}

.status-badge {
  display: inline-block;
  padding: $uni-spacing-sm $uni-spacing-xl;
  border-radius: $uni-radius-sm;
  font-size: $uni-font-size-xs;

  &.renting {
    background: rgba($uni-color-success, 0.12);
    color: $uni-color-success;
  }
}

.data-section {
  display: flex;
  background: $uni-bg-color-card;
  margin-top: $uni-spacing-xl;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.data-item {
  flex: 1;
  text-align: center;
}

.data-label {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-lg;
}

.data-value {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-color-primary;
  font-family: 'DIN Alternate', sans-serif;
}

.detail-section {
  background: $uni-bg-color-card;
  margin-top: $uni-spacing-xl;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: $uni-spacing-xl 0;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.value {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.action-btn {
  position: fixed;
  bottom: $uni-spacing-xl;
  left: $uni-spacing-xl;
  right: $uni-spacing-xl;
  height: 88rpx;
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-lg;
  font-weight: 600;
  border: none;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
