<template>
  <view class="filter-page">
    <!-- 筛选头部 -->
    <view class="filter-header">
      <view class="header-content">
        <text class="header-title">筛选</text>
        <text class="reset-btn" @tap="resetAllFilters">重置</text>
      </view>
    </view>

    <!-- 筛选内容 -->
    <scroll-view class="filter-content" scroll-y="true">
      <!-- 品牌筛选 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">品牌</text>
          <view class="selected-count" v-if="selectedBrand">
            <text class="count-text">已选 {{ selectedBrands.length }}</text>
          </view>
        </view>
        <view class="brand-grid">
          <view
            v-for="brand in brandOptions"
            :key="brand.id"
            class="brand-item"
            :class="{ 'selected': selectedBrands.includes(brand.id) }"
            @tap="selectBrand(brand.id)"
          >
            <image
              v-if="brand.logo_url"
              class="brand-logo"
              :src="brand.logo_url"
              mode="aspectFit"
            />
            <text class="brand-name">{{ brand.name }}</text>
          </view>
        </view>
      </view>

      <!-- 房车类型 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">房车类型</text>
        </view>
        <view class="category-grid">
          <view
            v-for="category in categoryOptions"
            :key="category.value"
            class="category-item"
            :class="{ 'selected': filters.categoryId === category.value }"
            @tap="selectCategory(category.value)"
          >
            <text class="category-text">{{ category.label }}</text>
          </view>
        </view>
      </view>

      <!-- 座位数 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">座位数</text>
          <view class="selected-info" v-if="filters.seats">
            <text class="info-text">{{ filters.seats }}座</text>
          </view>
        </view>
        <view class="seat-grid">
          <view
            v-for="seat in seatOptions"
            :key="seat"
            class="seat-item"
            :class="{ 'selected': filters.seats === seat }"
            @tap="selectSeat(seat)"
          >
            <text class="seat-text">{{ seat }}座</text>
          </view>
        </view>
      </view>

      <!-- 价格区间 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">价格区间</text>
          <view class="selected-info" v-if="filters.minPrice || filters.maxPrice">
            <text class="info-text">{{ priceRangeDisplay }}</text>
          </view>
        </view>
        <view class="price-grid">
          <view
            v-for="range in priceRangeOptions"
            :key="range.label"
            class="price-item"
            :class="{ 'selected': isPriceRangeSelected(range) }"
            @tap="selectPriceRange(range)"
          >
            <text class="price-text">{{ range.label }}</text>
          </view>
        </view>

        <!-- 自定义价格 -->
        <view class="custom-price">
          <view class="price-input-row">
            <view class="price-input-wrapper">
              <input
                class="price-input"
                type="digit"
                v-model="customMinPrice"
                placeholder="最低价"
                @input="onCustomPriceChange"
              />
              <text class="price-unit">元</text>
            </view>
            <text class="price-separator">-</text>
            <view class="price-input-wrapper">
              <input
                class="price-input"
                type="digit"
                v-model="customMaxPrice"
                placeholder="最高价"
                @input="onCustomPriceChange"
              />
              <text class="price-unit">元</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 燃料类型 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">燃料类型</text>
          <view class="selected-info" v-if="filters.fuelType">
            <text class="info-text">{{ filters.fuelType }}</text>
          </view>
        </view>
        <view class="fuel-grid">
          <view
            v-for="fuel in fuelTypeOptions"
            :key="fuel"
            class="fuel-item"
            :class="{ 'selected': filters.fuelType === fuel }"
            @tap="selectFuelType(fuel)"
          >
            <text class="fuel-text">{{ fuel }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆特性 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">车辆特性</text>
          <view class="selected-count" v-if="selectedFeatures.length > 0">
            <text class="count-text">已选 {{ selectedFeatures.length }}</text>
          </view>
        </view>
        <view class="features-grid">
          <view
            v-for="(group, groupName) in groupedFeatures"
            :key="groupName"
            class="feature-group"
          >
            <view class="group-title">{{ groupName }}</view>
            <view class="feature-items">
              <view
                v-for="feature in group"
                :key="feature.id"
                class="feature-item"
                :class="{ 'selected': selectedFeatures.includes(feature.id) }"
                @tap="toggleFeature(feature.id)"
              >
                <uni-icons :type="feature.icon || 'star'" size="18" :color="'#FF9F29'"></uni-icons>
                <text class="feature-name">{{ feature.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 排序方式 -->
      <view class="filter-section">
        <view class="section-header">
          <text class="section-title">排序方式</text>
          <view class="selected-info">
            <text class="info-text">{{ getCurrentSortLabel() }}</text>
          </view>
        </view>
        <view class="sort-grid">
          <view
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-item"
            :class="{ 'selected': filters.sortBy === option.value }"
            @tap="selectSort(option.value)"
          >
            <text class="sort-text">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="filter-footer">
      <view class="filter-summary">
        <text class="summary-text">已选择 {{ activeFiltersCount }} 个条件</text>
      </view>
      <view class="footer-buttons">
        <button class="confirm-btn" @tap="applyFilters">确定筛选</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVehicleStore } from '@/stores/vehicle';
import { vehicleApi } from '@/api/vehicle';

const vehicleStore = useVehicleStore();

// 筛选选项数据
const brandOptions = ref([]);
const categoryOptions = ref([
  { value: '自行式A型', label: '自行式A型' },
  { value: '自行式B型', label: '自行式B型' },
  { value: '自行式C型', label: '自行式C型' },
  { value: '拖挂A型', label: '拖挂A型' },
  { value: '拖挂B型', label: '拖挂B型' },
  { value: '拖挂C型', label: '拖挂C型' },
  { value: '房车巴士', label: '房车巴士' },
  { value: '越野房车', label: '越野房车' },
]);
const seatOptions = [2, 3, 4, 5, 6, 7, 8];
const priceRangeOptions = ref([
  { label: '300元以下', min: 0, max: 300 },
  { label: '300-500元', min: 300, max: 500 },
  { label: '500-800元', min: 500, max: 800 },
  { label: '800-1200元', min: 800, max: 1200 },
  { label: '1200元以上', min: 1200, max: null },
]);
const fuelTypeOptions = ['汽油', '柴油', '新能源', '混动'];
const featureOptions = ref([]);
const sortOptions = vehicleStore.sortOptions;

// 筛选状态
const selectedBrands = ref([]);
const selectedFeatures = ref([]);
const customMinPrice = ref('');
const customMaxPrice = ref('');

// 当前筛选条件
const filters = computed(() => ({ ...vehicleStore.filters }));

// 计算属性
const activeFiltersCount = computed(() => vehicleStore.activeFiltersCount);
const priceRangeDisplay = computed(() => vehicleStore.priceRangeDisplay);
const groupedFeatures = computed(() => {
  const grouped = {};
  featureOptions.value.forEach(feature => {
    const type = feature.feature_type || '其他';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(feature);
  });
  return grouped;
});
const selectedBrand = computed(() => filters.value.brandId);

// 页面加载
onMounted(async () => {
  // 初始化筛选条件
  initializeFilters();

  // 加载筛选选项
  await Promise.all([
    loadBrandOptions(),
    loadFeatureOptions(),
  ]);
});

// 初始化筛选条件
const initializeFilters = () => {
  const storeFilters = vehicleStore.filters;

  selectedBrands.value = storeFilters.brandId ? [storeFilters.brandId] : [];
  selectedFeatures.value = storeFilters.features || [];

  if (storeFilters.minPrice || storeFilters.maxPrice) {
    const matchingRange = priceRangeOptions.value.find(range =>
      range.min === storeFilters.minPrice && range.max === storeFilters.maxPrice
    );

    if (!matchingRange) {
      customMinPrice.value = storeFilters.minPrice || '';
      customMaxPrice.value = storeFilters.maxPrice || '';
    }
  }
};

// 加载品牌选项
const loadBrandOptions = async () => {
  try {
    const brands = await vehicleApi.getVehicleBrands();
    brandOptions.value = brands;
  } catch (error) {
    console.error('加载品牌选项失败:', error);
  }
};

// 加载特性选项
const loadFeatureOptions = async () => {
  try {
    const features = await vehicleApi.getVehicleFeatures();
    featureOptions.value = features;
  } catch (error) {
    console.error('加载特性选项失败:', error);
  }
};

// 选择品牌
const selectBrand = (brandId) => {
  const index = selectedBrands.value.indexOf(brandId);
  if (index > -1) {
    selectedBrands.value.splice(index, 1);
  } else {
    selectedBrands.value = [brandId]; // 单选
  }

  const selectedBrandId = selectedBrands.value.length > 0 ? selectedBrands.value[0] : null;
  vehicleStore.setFilters({ brandId: selectedBrandId });
};

// 选择房车类型
const selectCategory = (categoryId) => {
  vehicleStore.setFilters({
    categoryId: filters.value.categoryId === categoryId ? null : categoryId
  });
};

// 选择座位数
const selectSeat = (seats) => {
  vehicleStore.setFilters({
    seats: filters.value.seats === seats ? null : seats
  });
};

// 选择价格区间
const selectPriceRange = (range) => {
  if (isPriceRangeSelected(range)) {
    // 取消选择
    vehicleStore.setFilters({ minPrice: null, maxPrice: null });
    customMinPrice.value = '';
    customMaxPrice.value = '';
  } else {
    vehicleStore.setFilters({ minPrice: range.min, maxPrice: range.max });
    customMinPrice.value = range.min || '';
    customMaxPrice.value = range.max || '';
  }
};

// 检查价格区间是否已选择
const isPriceRangeSelected = (range) => {
  return filters.value.minPrice === range.min && filters.value.maxPrice === range.max;
};

// 自定义价格变化
const onCustomPriceChange = () => {
  const minPrice = customMinPrice.value ? Number(customMinPrice.value) : null;
  const maxPrice = customMaxPrice.value ? Number(customMaxPrice.value) : null;

  vehicleStore.setFilters({ minPrice, maxPrice });
};

// 选择燃料类型
const selectFuelType = (fuelType) => {
  vehicleStore.setFilters({
    fuelType: filters.value.fuelType === fuelType ? null : fuelType
  });
};

// 切换特性选择
const toggleFeature = (featureId) => {
  const index = selectedFeatures.value.indexOf(featureId);
  if (index > -1) {
    selectedFeatures.value.splice(index, 1);
  } else {
    selectedFeatures.value.push(featureId);
  }

  vehicleStore.setFilters({ features: [...selectedFeatures.value] });
};

// 选择排序方式
const selectSort = (sortBy) => {
  vehicleStore.setFilters({ sortBy });
};

// 获取当前排序标签
const getCurrentSortLabel = () => {
  const currentSort = sortOptions.find(option => option.value === filters.value.sortBy);
  return currentSort ? currentSort.label : '热门推荐';
};

// 重置所有筛选
const resetAllFilters = () => {
  vehicleStore.resetFilters();
  selectedBrands.value = [];
  selectedFeatures.value = [];
  customMinPrice.value = '';
  customMaxPrice.value = '';
};

// 应用筛选
const applyFilters = () => {
  uni.navigateBack();
};

// 页面卸载时清理
onUnmounted(() => {
  // 可以在这里进行一些清理工作
});
</script>

<style>
.filter-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

// 筛选头部
.filter-header {
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .reset-btn {
      font-size: 28rpx;
      color: #FF9F29;
    }
  }
}

// 筛选内容
.filter-content {
  flex: 1;
  padding: 0 32rpx;
}

// 通用区块样式
.filter-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .selected-count,
    .selected-info  { .count-text,
      .info-text { font-size: 24rpx;
        color: #FF9F29; } }
  }
}

// 品牌网格
.brand-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx 16rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &.selected {
      border-color: #FF9F29;
      background-color: rgba(255, 159, 41, 0.1);
    }

    .brand-logo {
      width: 60rpx;
      height: 60rpx;
    }

    .brand-name {
      font-size: 24rpx;
      color: rgba(0, 0, 0, 0.8);
      text-align: center;
    }
  }
}

// 分类网格
.category-grid,
.seat-grid,
.fuel-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .category-item,
  .seat-item,
  .fuel-item {
    padding: 16rpx 24rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 25rpx;
    transition: all 0.3s ease;

    &.selected {
      border-color: #FF9F29;
      background-color: rgba(255, 159, 41, 0.1);
    }

    .category-text,
    .seat-text,
    .fuel-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 价格网格
.price-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .price-item {
    padding: 16rpx 24rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 25rpx;
    transition: all 0.3s ease;

    &.selected {
      border-color: #FF9F29;
      background-color: rgba(255, 159, 41, 0.1);
    }

    .price-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 自定义价格
.custom-price {
  border-top: 2rpx solid #f0f0f0;
  padding-top: 24rpx;

  .price-input-row {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .price-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 16rpx;
      border: 2rpx solid #f0f0f0;
      border-radius: 8rpx;
      gap: 12rpx;

      .price-input {
        flex: 1;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
      }

      .price-unit {
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .price-separator {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

// 特性网格
.features-grid  { .feature-group { margin-bottom: 24rpx;

    .last-child { margin-bottom: 0; }.group-title { font-size: 28rpx;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
      margin-bottom: 16rpx; }.feature-items { display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .feature-item { display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 12rpx 16rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 20rpx;
        transition: all 0.3s ease;

        &.selected { border-color: #FF9F29;
          background-color: rgba(255, 159, 41, 0.1); }.feature-name { font-size: 24rpx;
          color: rgba(0, 0, 0, 0.8); } }
    }
  }
}

// 排序网格
.sort-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;

  .sort-item {
    padding: 20rpx 24rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    text-align: center;
    transition: all 0.3s ease;

    &.selected {
      border-color: #FF9F29;
      background-color: rgba(255, 159, 41, 0.1);
    }

    .sort-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 底部按钮
.filter-footer {
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 24rpx;

  .filter-summary {
    flex: 1;

    .summary-text {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .footer-buttons  { .confirm-btn { background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;
      border-radius: 12rpx;
      padding: 24rpx 48rpx;
      font-size: 32rpx;
      font-weight: 500;
      border: none;

      &::after { border: none; } }
  }
}
</style>