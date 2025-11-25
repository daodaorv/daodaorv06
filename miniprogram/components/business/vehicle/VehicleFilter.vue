<!-- 车辆筛选组件 -->
<template>
  <uni-card class="vehicle-filter" :margin="margin" padding="24rpx">
    <!-- 筛选头部 -->
    <view class="filter-header">
      <text class="filter-title">车辆筛选</text>
      <uni-button
        type="text"
        size="small"
        text="重置"
        @click="handleReset"
      />
    </view>

    <!-- 价格范围 -->
    <view class="filter-section">
      <text class="section-title">价格区间</text>
      <view class="price-range">
        <view class="price-input">
          <input
            v-model="filters.minPrice"
            type="number"
            placeholder="最低价格"
            class="input-field"
            @input="handleMinPriceChange"
          />
          <text class="price-unit">元/天</text>
        </view>
        <view class="price-separator">-</view>
        <view class="price-input">
          <input
            v-model="filters.maxPrice"
            type="number"
            placeholder="最高价格"
            class="input-field"
            @input="handleMaxPriceChange"
          />
          <text class="price-unit">元/天</text>
        </view>
      </view>
      <!-- 价格快捷选择 -->
      <view class="price-presets">
        <view
          v-for="preset in pricePresets"
          :key="preset.label"
          class="preset-item"
          :class="{ active: isPricePresetActive(preset) }"
          @tap="selectPricePreset(preset)"
        >
          <text class="preset-text">{{ preset.label }}</text>
        </view>
      </view>
    </view>

    <!-- ���型类型 -->
    <view class="filter-section">
      <text class="section-title">车型类型</text>
      <view class="category-grid">
        <view
          v-for="category in vehicleCategories"
          :key="category.value"
          class="category-item"
          :class="{ active: filters.categories.includes(category.value) }"
          @tap="toggleCategory(category.value)"
        >
          <uni-icons :type="category.icon" size="20" :color="getCategoryIconColor(category.value)" />
          <text class="category-text">{{ category.label }}</text>
        </view>
      </view>
    </view>

    <!-- 座位数 -->
    <view class="filter-section">
      <text class="section-title">座位数</text>
      <view class="seat-options">
        <view
          v-for="seat in seatOptions"
          :key="seat.value"
          class="seat-item"
          :class="{ active: filters.seats === seat.value }"
          @tap="selectSeat(seat.value)"
        >
          <text class="seat-text">{{ seat.label }}</text>
          <text class="seat-desc">{{ seat.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 车辆特性 -->
    <view class="filter-section">
      <text class="section-title">车辆特性</text>
      <view class="features-grid">
        <view
          v-for="feature in vehicleFeatures"
          :key="feature.value"
          class="feature-item"
          :class="{ active: filters.features.includes(feature.value) }"
          @tap="toggleFeature(feature.value)"
        >
          <uni-icons :type="feature.icon" size="18" :color="getFeatureIconColor(feature.value)" />
          <text class="feature-text">{{ feature.label }}</text>
        </view>
      </view>
    </view>

    <!-- 燃料类型 -->
    <view class="filter-section">
      <text class="section-title">燃料类型</text>
      <view class="fuel-options">
        <view
          v-for="fuel in fuelTypes"
          :key="fuel.value"
          class="fuel-item"
          :class="{ active: filters.fuelType === fuel.value }"
          @tap="selectFuelType(fuel.value)"
        >
          <text class="fuel-text">{{ fuel.label }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="filter-actions">
      <uni-button
        type="secondary"
        size="large"
        text="清空条件"
        flex="1"
        margin="0 12rpx 0 0"
        @click="handleClear"
      />
      <uni-button
        type="primary"
        size="large"
        text="应用筛选"
        flex="1"
        margin="0 0 0 12rpx"
        @click="handleApply"
      />
    </view>
  </uni-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface FilterData {
  minPrice?: number;
  maxPrice?: number;
  categories: string[];
  seats?: number;
  features: string[];
  fuelType?: string;
}

interface VehicleFilterProps {
  /** 筛选数据 */
  modelValue: FilterData;
  /** 外边距 */
  margin?: string | number;
}

interface VehicleFilterEmits {
  (e: 'update:modelValue', value: FilterData): void;
  (e: 'apply', filters: FilterData): void;
  (e: 'reset'): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<VehicleFilterProps>(), {
  margin: '0 0 24rpx 0'
});

const emit = defineEmits<VehicleFilterEmits>();

// 筛选数据
const filters = ref<FilterData>({
  minPrice: undefined,
  maxPrice: undefined,
  categories: [],
  seats: undefined,
  features: [],
  fuelType: undefined
});

// 价格预设选项
const pricePresets = ref([
  { label: '不限', min: undefined, max: undefined },
  { label: '300元以下', min: undefined, max: 300 },
  { label: '300-500元', min: 300, max: 500 },
  { label: '500-800元', min: 500, max: 800 },
  { label: '800元以上', min: 800, max: undefined }
]);

// 车型类型选项
const vehicleCategories = ref([
  { label: '经济房车', value: 'economy', icon: 'home-filled' },
  { label: '豪华房车', value: 'luxury', icon: 'star-filled' },
  { label: '自行式A型', value: 'type-a', icon: 'car-filled' },
  { label: '自行式B型', value: 'type-b', icon: 'car-filled' },
  { label: '自行式C型', value: 'type-c', icon: 'car-filled' },
  { label: '拖挂式', value: 'trailer', icon: 'loop' }
]);

// 座位数选项
const seatOptions = ref([
  { label: '不限', value: undefined, desc: '全部座位' },
  { label: '2座', value: 2, desc: '适合情侣' },
  { label: '4座', value: 4, desc: '适合家庭' },
  { label: '6座', value: 6, desc: '适合大家庭' },
  { label: '7座以上', value: 7, desc: '适合团队' }
]);

// 车辆特性选项
const vehicleFeatures = ref([
  { label: 'WiFi', value: 'wifi', icon: 'wifi-filled' },
  { label: '空调', value: 'ac', icon: 'gear-filled' },
  { label: '厨房', value: 'kitchen', icon: 'home-filled' },
  { label: '卫生间', value: 'bathroom', icon: 'staff-filled' },
  { label: '电视', value: 'tv', icon: 'phone-filled' },
  { label: '冰箱', value: 'fridge', icon: 'calendar-filled' },
  { label: '淋浴', value: 'shower', icon: 'water-filled' },
  { label: '发电机', value: 'generator', icon: 'flashlight-filled' }
]);

// 燃料类型选项
const fuelTypes = ref([
  { label: '不限', value: undefined },
  { label: '汽油', value: 'gasoline' },
  { label: '柴油', value: 'diesel' },
  { label: '电动', value: 'electric' },
  { label: '混动', value: 'hybrid' }
]);

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  filters.value = { ...filters.value, ...newValue };
}, { immediate: true, deep: true });

// 监听filters变化，同步到父组件
watch(filters, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

// 计算属性
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.minPrice !== undefined || filters.value.maxPrice !== undefined) count++;
  if (filters.value.categories.length > 0) count++;
  if (filters.value.seats !== undefined) count++;
  if (filters.value.features.length > 0) count++;
  if (filters.value.fuelType !== undefined) count++;
  return count;
});

// 方法
const handleMinPriceChange = (e: any) => {
  const value = e.detail.value;
  filters.value.minPrice = value ? Number(value) : undefined;
};

const handleMaxPriceChange = (e: any) => {
  const value = e.detail.value;
  filters.value.maxPrice = value ? Number(value) : undefined;
};

const selectPricePreset = (preset: any) => {
  filters.value.minPrice = preset.min;
  filters.value.maxPrice = preset.max;
};

const isPricePresetActive = (preset: any) => {
  return filters.value.minPrice === preset.min && filters.value.maxPrice === preset.max;
};

const toggleCategory = (category: string) => {
  const index = filters.value.categories.indexOf(category);
  if (index > -1) {
    filters.value.categories.splice(index, 1);
  } else {
    filters.value.categories.push(category);
  }
};

const selectSeat = (seats: number | undefined) => {
  filters.value.seats = seats;
};

const toggleFeature = (feature: string) => {
  const index = filters.value.features.indexOf(feature);
  if (index > -1) {
    filters.value.features.splice(index, 1);
  } else {
    filters.value.features.push(feature);
  }
};

const selectFuelType = (fuelType: string | undefined) => {
  filters.value.fuelType = fuelType;
};

const getCategoryIconColor = (category: string) => {
  const isActive = filters.value.categories.includes(category);
  return isActive ? '#FF9F29' : '#999999';
};

const getFeatureIconColor = (feature: string) => {
  const isActive = filters.value.features.includes(feature);
  return isActive ? '#FF9F29' : '#999999';
};

const handleApply = () => {
  emit('apply', filters.value);
};

const handleReset = () => {
  filters.value = {
    minPrice: undefined,
    maxPrice: undefined,
    categories: [],
    seats: undefined,
    features: [],
    fuelType: undefined
  };
  emit('reset');
};

const handleClear = () => {
  filters.value = {
    minPrice: undefined,
    maxPrice: undefined,
    categories: [],
    seats: undefined,
    features: [],
    fuelType: undefined
  };
  emit('clear');
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

.vehicle-filter {
  // 筛选头部
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .filter-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }
  }

  // 筛选区块
  .filter-section {
    margin-bottom: 32rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 16rpx;
      display: block;
    }
  }

  // 价格范围
  .price-range {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;

    .price-input {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 12rpx;

      .input-field {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        background: transparent;
        border: none;
        outline: none;
      }

      .price-unit {
        font-size: 24rpx;
        color: #666666;
        white-space: nowrap;
      }
    }

    .price-separator {
      font-size: 28rpx;
      color: #999999;
      margin: 0 8rpx;
    }
  }

  // 价格快捷选择
  .price-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .preset-item {
      padding: 12rpx 20rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 20rpx;
      transition: all 0.3s ease;

      &.active {
        background: rgba(#FF9F29, 0.1);
        border-color: #FF9F29;

        .preset-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .preset-text {
        font-size: 26rpx;
        color: #666666;
        transition: all 0.3s ease;
      }
    }
  }

  // 分类网格
  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 16rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 12rpx;
      transition: all 0.3s ease;

      &.active {
        background: rgba(#FF9F29, 0.1);
        border-color: #FF9F29;

        .category-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .category-text {
        font-size: 24rpx;
        color: #666666;
        margin-top: 8rpx;
        transition: all 0.3s ease;
        text-align: center;
      }
    }
  }

  // 座位选项
  .seat-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .seat-item {
      padding: 16rpx 24rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 20rpx;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 120rpx;
      text-align: center;

      &.active {
        background: rgba(#FF9F29, 0.1);
        border-color: #FF9F29;

        .seat-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .seat-text {
        font-size: 26rpx;
        color: #333333;
        font-weight: 500;
      }

      .seat-desc {
        font-size: 22rpx;
        color: #999999;
        margin-top: 4rpx;
      }
    }
  }

  // 特性网格
  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 12rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 12rpx;
      transition: all 0.3s ease;

      &.active {
        background: rgba(#FF9F29, 0.1);
        border-color: #FF9F29;

        .feature-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .feature-text {
        font-size: 22rpx;
        color: #666666;
        margin-top: 6rpx;
        transition: all 0.3s ease;
        text-align: center;
      }
    }
  }

  // 燃料类型选项
  .fuel-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .fuel-item {
      padding: 12rpx 20rpx;
      background: #F8F8F8;
      border: 2rpx solid #E8E8E8;
      border-radius: 20rpx;
      transition: all 0.3s ease;
      min-width: 100rpx;
      text-align: center;

      &.active {
        background: rgba(#FF9F29, 0.1);
        border-color: #FF9F29;

        .fuel-text {
          color: #FF9F29;
          font-weight: 500;
        }
      }

      .fuel-text {
        font-size: 26rpx;
        color: #666666;
        transition: all 0.3s ease;
      }
    }
  }

  // 操作按钮
  .filter-actions {
    display: flex;
    gap: 0;
    margin-top: 32rpx;
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .vehicle-filter  { .category-grid { grid-template-columns: repeat(2, 1fr); }.features-grid { grid-template-columns: repeat(3, 1fr); }.seat-options { .seat-item { min-width: 100rpx; } }
  }
}
</style>