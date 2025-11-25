<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-input-container">
        <view class="search-input-wrapper">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <input
            class="search-input"
            type="text"
            v-model="keyword"
            placeholder="搜索品牌、车型"
            confirm-type="search"
            @confirm="handleSearch"
            @input="onInputChange"
            focus
          />
          <view v-if="keyword" class="clear-btn" @tap="clearKeyword">
            <uni-icons type="clear" size="16" color="#999"></uni-icons>
          </view>
        </view>
        <text class="cancel-btn" @tap="goBack">取消</text>
      </view>

      <!-- 搜索建议 -->
      <view v-if="showSuggestions && searchSuggestions.length > 0" class="suggestions-section">
        <view
          v-for="(suggestion, index) in searchSuggestions"
          :key="index"
          class="suggestion-item"
          @tap="selectSuggestion(suggestion)"
        >
          <uni-icons type="search" size="16" color="#999"></uni-icons>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!searchResults.length && searchHistory.length > 0" class="history-section">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="clear-history" @tap="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @tap="selectHistory(item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view v-if="!searchResults.length" class="popular-section">
      <view class="popular-header">
        <text class="popular-title">热门搜索</text>
      </view>
      <view class="popular-tags">
        <view
          v-for="(tag, index) in popularSearches"
          :key="index"
          class="popular-tag"
          @tap="selectPopular(tag)"
        >
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="searchResults.length > 0" class="results-section">
      <view class="results-header">
        <text class="results-count">找到 {{ totalCount }} 个结果</text>
        <text class="clear-results" @tap="clearResults">清空</text>
      </view>

      <view class="vehicle-list">
        <view
          v-for="vehicle in searchResults"
          :key="vehicle.id"
          class="vehicle-item"
          @tap="goToVehicleDetail(vehicle.id)"
        >
          <image
            class="vehicle-image"
            :src="vehicle.mainImage || '/static/placeholder-vehicle.png'"
            mode="aspectFill"
            lazy-load
          ></image>

          <view class="vehicle-info">
            <view class="vehicle-header">
              <text class="brand-name">{{ vehicle.brand }}</text>
              <text class="model-name">{{ vehicle.model }}</text>
            </view>

            <view class="vehicle-specs">
              <text class="spec-text">{{ vehicle.seats }}座{{ vehicle.sleepers }}卧</text>
              <text class="spec-text">{{ vehicle.categoryName }}</text>
            </view>

            <view class="vehicle-price">
              <text class="price-amount">¥{{ vehicle.dailyRate }}</text>
              <text class="price-unit">/天</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <text class="load-more-text">加载更多...</text>
      </view>
    </view>

    <!-- 无结果 -->
    <view v-if="searched && searchResults.length === 0" class="no-results">
      <uni-icons type="search" size="80" color="#ddd"></uni-icons>
      <text class="no-results-title">未找到相关车辆</text>
      <text class="no-results-desc">请尝试其他关键词</text>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <uni-icons type="spinner-cycle" size="24" color="#FF9F29"></uni-icons>
      <text class="loading-text">搜索中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVehicleStore } from '@/stores/vehicle';
import { vehicleApi } from '@/api/vehicle';

const vehicleStore = useVehicleStore();

// 页面数据
const keyword = ref('');
const searchResults = ref([]);
const searchSuggestions = ref([]);
const searchHistory = ref([]);
const popularSearches = ref(['奔驰', '福特全顺', '依维柯', '大众T6.1', '丰田海狮', 'C型房车', 'B型房车', '豪华房车']);
const loading = ref(false);
const showSuggestions = ref(false);
const searched = ref(false);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const hasMore = ref(false);

// 页面加载
onMounted(() => {
  // 初始化搜索历史
  vehicleStore.initSearchHistory();
  searchHistory.value = vehicleStore.searchHistory;
});

// 输入变化
const onInputChange = async () => {
  if (keyword.value.trim().length > 0) {
    showSuggestions.value = true;
    await getSearchSuggestions();
  } else {
    showSuggestions.value = false;
    searchSuggestions.value = [];
  }
};

// 获取搜索建议
const getSearchSuggestions = async () => {
  try {
    const suggestions = await vehicleApi.getSearchSuggestions(keyword.value.trim(), 5);
    searchSuggestions.value = suggestions;
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    searchSuggestions.value = [];
  }
};

// 执行搜索
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    });
    return;
  }

  await performSearch();
};

// 执行搜索
const performSearch = async (searchKeyword = keyword.value, append = false) => {
  try {
    loading.value = true;
    searched.value = true;
    showSuggestions.value = false;

    const page = append ? currentPage.value + 1 : 1;

    const params = {
      keyword: searchKeyword.trim(),
      page,
      pageSize: pageSize.value,
    };

    const result = await vehicleApi.getVehicles(params);

    if (append) {
      searchResults.value = [...searchResults.value, ...result.list];
    } else {
      searchResults.value = result.list;
      currentPage.value = 1;
    }

    totalCount.value = result.pagination.total;
    hasMore.value = page < result.pagination.pages;

    // 添加到搜索历史
    if (!append) {
      vehicleStore.addSearchHistory(searchKeyword.trim());
      searchHistory.value = vehicleStore.searchHistory;
    }

  } catch (error) {
    console.error('搜索失败:', error);
    uni.showToast({
      title: error.message || '搜索失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  keyword.value = suggestion;
  showSuggestions.value = false;
  performSearch(suggestion);
};

// 选择历史记录
const selectHistory = (item) => {
  keyword.value = item;
  performSearch(item);
};

// 选择热门搜索
const selectPopular = (tag) => {
  keyword.value = tag;
  performSearch(tag);
};

// 清空关键词
const clearKeyword = () => {
  keyword.value = '';
  showSuggestions.value = false;
  searchSuggestions.value = [];
  searched.value = false;
  searchResults.value = [];
};

// 清空搜索结果
const clearResults = () => {
  keyword.value = '';
  searched.value = false;
  searchResults.value = [];
  totalCount.value = 0;
};

// 清空历史记录
const clearHistory = () => {
  vehicleStore.clearSearchHistory();
  searchHistory.value = [];
  uni.showToast({
    title: '历史记录已清空',
    icon: 'success'
  });
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 跳转到车辆详情
const goToVehicleDetail = (vehicleId) => {
  uni.navigateTo({
    url: `/pages/vehicles/detail?id=${vehicleId}`
  });
};
</script>

<style>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 搜索头部
.search-header {
  background-color: #ffffff;
  position: relative;
  z-index: 100;

  .search-input-container {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    gap: 24rpx;

    .search-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 20rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 50rpx;

      .search-input {
        flex: 1;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.9);
      }

      .clear-btn {
        padding: 8rpx;
      }
    }

    .cancel-btn {
      font-size: 28rpx;
      color: #666;
      padding: 16rpx 0;
    }
  }

  // 搜索建议
  .suggestions-section {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    border-bottom: 2rpx solid #f0f0f0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    z-index: 101;

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 24rpx 32rpx;
      border-bottom: 2rpx solid #f5f5f5;

      .last-child {
        border-bottom: none;
      }

      .suggestion-text {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
      }
    }
  }
}

// 搜索历史
.history-section {
  background-color: #ffffff;
  margin-top: 16rpx;
  padding: 32rpx;

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .history-title {
      font-size: 30rpx;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 500;
    }

    .clear-history {
      font-size: 26rpx;
      color: #999;
    }
  }

  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .history-tag {
      padding: 16rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 25rpx;

      .tag-text {
        font-size: 26rpx;
        color: rgba(0, 0, 0, 0.8);
      }
    }
  }
}

// 热门搜索
.popular-section {
  background-color: #ffffff;
  margin-top: 16rpx;
  padding: 32rpx;

  .popular-header {
    margin-bottom: 24rpx;

    .popular-title {
      font-size: 30rpx;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 500;
    }
  }

  .popular-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .popular-tag {
      padding: 16rpx 24rpx;
      background-color: #fff5f5;
      border: 2rpx solid #ffccc7;
      border-radius: 25rpx;

      .tag-text {
        font-size: 26rpx;
        color: #FF9F29;
      }
    }
  }
}

// 搜索结果
.results-section {
  background-color: #ffffff;
  margin-top: 16rpx;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .results-count {
      font-size: 28rpx;
      color: rgba(0, 0, 0, 0.9);
    }

    .clear-results {
      font-size: 26rpx;
      color: #999;
    }
  }

  .vehicle-list {
    padding: 24rpx 32rpx;

    .vehicle-item {
      display: flex;
      margin-bottom: 24rpx;
      padding-bottom: 24rpx;
      border-bottom: 2rpx solid #f0f0f0;

      .last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .vehicle-image {
        width: 200rpx;
        height: 150rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
        background-color: #f0f0f0;
      }

      .vehicle-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .vehicle-header  { .brand-name { font-size: 30rpx;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9);
            margin-right: 8rpx; }.model-name { font-size: 26rpx;
            color: rgba(0, 0, 0, 0.7); } }

        .vehicle-specs {
          margin: 12rpx 0;

          .spec-text {
            font-size: 24rpx;
            color: rgba(0, 0, 0, 0.6);
            margin-right: 16rpx;
          }
        }

        .vehicle-price  { .price-amount { font-size: 32rpx;
            font-weight: 600;
            color: #FF9F29; }.price-unit { font-size: 24rpx;
            color: rgba(0, 0, 0, 0.6); } }
      }
    }
  }

  .load-more {
    padding: 24rpx;
    text-align: center;

    .load-more-text {
      font-size: 26rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

// 无结果
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;

  .no-results-title {
    font-size: 32rpx;
    color: rgba(0, 0, 0, 0.6);
    margin: 32rpx 0 16rpx;
  }

  .no-results-desc {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.4);
  }
}

// 加载中
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  gap: 16rpx;

  .loading-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>