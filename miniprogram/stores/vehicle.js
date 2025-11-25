import { defineStore } from 'pinia';

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    // 车辆列表数据
    vehicleList: [],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    refreshing: false,
    loadingMore: false,

    // 筛选条件
    filters: {
      brandId: null,
      categoryId: null,
      seats: null,
      minPrice: null,
      maxPrice: null,
      fuelType: null,
      storeId: null,
      sortBy: 'popular',
      features: [],
    },

    // 筛选选项
    brandOptions: [],
    categoryOptions: [],
    featureOptions: [],
    priceRangeOptions: [],
    seatOptions: [2, 3, 4, 5, 6, 7, 8],
    fuelTypeOptions: ['汽油', '柴油', '新能源', '混动'],
    sortOptions: [
      { value: 'popular', label: '热门推荐' },
      { value: 'price_asc', label: '价格从低到高' },
      { value: 'price_desc', label: '价格从高到低' },
      { value: 'rating_desc', label: '好评优先' },
    ],

    // 车辆详情
    currentVehicle: null,
    vehicleImages: [],

    // 收藏相关
    favoriteVehicles: [],

    // 搜索相关
    searchKeyword: '',
    searchSuggestions: [],
    searchHistory: [],

    // 其他数据
    storeInfo: null,
  }),

  getters: {
    // 是否有更多数据
    hasMore: (state) => {
      return state.currentPage * state.pageSize < state.total;
    },

    // 当前筛选条件数量
    activeFiltersCount: (state) => {
      let count = 0;
      if (state.filters.brandId) count++;
      if (state.filters.categoryId) count++;
      if (state.filters.seats) count++;
      if (state.filters.minPrice) count++;
      if (state.filters.maxPrice) count++;
      if (state.filters.fuelType) count++;
      if (state.filters.features.length > 0) count++;
      return count;
    },

    // 格式化的价格区间显示
    priceRangeDisplay: (state) => {
      const { minPrice, maxPrice } = state.filters;
      if (minPrice && maxPrice) {
        return `${minPrice}-${maxPrice}元`;
      } else if (minPrice) {
        return `${minPrice}元以上`;
      } else if (maxPrice) {
        return `${maxPrice}元以下`;
      }
      return '不限';
    },
  },

  actions: {
    // 设置加载状态
    setLoading(loading) {
      this.loading = loading;
    },

    setRefreshing(refreshing) {
      this.refreshing = refreshing;
    },

    setLoadingMore(loadingMore) {
      this.loadingMore = loadingMore;
    },

    // 设置车辆列表
    setVehicleList(vehicles, append = false) {
      if (append) {
        this.vehicleList = [...this.vehicleList, ...vehicles];
      } else {
        this.vehicleList = vehicles;
        this.currentPage = 1;
      }
    },

    // 设置分页信息
    setPagination(page, pageSize, total) {
      this.currentPage = page;
      this.pageSize = pageSize;
      this.total = total;
    },

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        brandId: null,
        categoryId: null,
        seats: null,
        minPrice: null,
        maxPrice: null,
        fuelType: null,
        storeId: null,
        sortBy: 'popular',
        features: [],
      };
    },

    // 设置筛选选项
    setBrandOptions(options) {
      this.brandOptions = options;
    },

    setCategoryOptions(options) {
      this.categoryOptions = options;
    },

    setFeatureOptions(options) {
      this.featureOptions = options;
    },

    setPriceRangeOptions(options) {
      this.priceRangeOptions = options;
    },

    // 设置当前车辆
    setCurrentVehicle(vehicle) {
      this.currentVehicle = vehicle;
    },

    setVehicleImages(images) {
      this.vehicleImages = images;
    },

    // 设置收藏列表
    setFavoriteVehicles(vehicles) {
      this.favoriteVehicles = vehicles;
    },

    // 切换收藏状态
    toggleFavorite(vehicleId) {
      const index = this.favoriteVehicles.findIndex(v => v.id === vehicleId);
      if (index > -1) {
        this.favoriteVehicles.splice(index, 1);
      } else {
        this.favoriteVehicles.push({ id: vehicleId });
      }
    },

    // 检查是否已收藏
    isFavorited(vehicleId) {
      return this.favoriteVehicles.some(v => v.id === vehicleId);
    },

    // 设置搜索关键词
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword;
    },

    // 设置搜索建议
    setSearchSuggestions(suggestions) {
      this.searchSuggestions = suggestions;
    },

    // 添加搜索历史
    addSearchHistory(keyword) {
      if (!keyword || !keyword.trim()) return;

      // 移除重复项
      const index = this.searchHistory.indexOf(keyword);
      if (index > -1) {
        this.searchHistory.splice(index, 1);
      }

      // 添加到开头
      this.searchHistory.unshift(keyword);

      // 限制历史记录数量
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10);
      }

      // 保存到本地存储
      uni.setStorageSync('search_history', this.searchHistory);
    },

    // 清空搜索历史
    clearSearchHistory() {
      this.searchHistory = [];
      uni.removeStorageSync('search_history');
    },

    // 初始化搜索历史
    initSearchHistory() {
      const history = uni.getStorageSync('search_history') || [];
      this.searchHistory = history;
    },

    // 设置门店信息
    setStoreInfo(storeInfo) {
      this.storeInfo = storeInfo;
    },

    // 清空数据
    clearData() {
      this.vehicleList = [];
      this.currentPage = 1;
      this.total = 0;
      this.currentVehicle = null;
      this.vehicleImages = [];
    },
  },

  // 持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'vehicle-store',
        storage: {
          getItem: (key) => uni.getStorageSync(key),
          setItem: (key, value) => uni.setStorageSync(key, value),
        },
        paths: ['searchHistory', 'filters'], // 只持久化搜索历史和筛选条件
      },
    ],
  },
});