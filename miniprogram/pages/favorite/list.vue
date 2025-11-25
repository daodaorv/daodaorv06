<template>
  <view class="favorite-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="nav-item back-btn" @tap="goBack">
          <uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
        </view>
        <text class="nav-title">我的收藏</text>
        <view class="nav-item" @tap="showCreateFolder">
          <uni-icons type="plus" size="20" color="#333"></uni-icons>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="stats-section">
        <view class="stats-grid">
          <view
            v-for="stat in statsList"
            :key="stat.key"
            class="stat-item"
            :class="{ 'active': currentType === stat.key }"
            @tap="switchType(stat.key)"
          >
            <text class="stat-number">{{ userStats[stat.key] || 0 }}</text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
        </view>
      </view>

      <!-- 收藏夹筛选 -->
      <view class="folder-filter" v-if="folders.length > 1">
        <scroll-view class="filter-scroll" scroll-x="true">
          <view class="filter-list">
            <view
              class="filter-item"
              :class="{ 'active': currentFolder === '' }"
              @tap="setFolder('')"
            >
              <text class="filter-text">全部</text>
            </view>
            <view
              v-for="folder in folders"
              :key="folder.id"
              class="filter-item"
              :class="{ 'active': currentFolder === folder.name }"
              @tap="setFolder(folder.name)"
            >
              <uni-icons
                :type="folder.icon || 'star'"
                size="14"
                :color="currentFolder === folder.name ? folder.color || '#FF9F29' : '#666'"
              ></uni-icons>
              <text class="filter-text">{{ folder.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 收藏列表 -->
    <scroll-view
      class="favorite-list"
      scroll-y="true"
      @scrolltolower="loadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view v-if="favorites.length === 0 && !loading" class="empty-state">
        <image class="empty-image" src="/static/empty-favorite.png" mode="aspectFit"></image>
        <text class="empty-text">暂无{{ currentTypeText }}收藏</text>
        <button class="browse-btn" @tap="goToBrowse">去逛逛</button>
      </view>

      <!-- 收藏项 -->
      <view
        v-for="favorite in favorites"
        :key="favorite.id"
        class="favorite-item"
        @tap="goToDetail(favorite)"
      >
        <!-- 车辆收藏 -->
        <view v-if="favorite.targetType === 'vehicle'" class="vehicle-card">
          <image
            class="vehicle-image"
            :src="favorite.targetImage || '/static/default-vehicle.png'"
            mode="aspectFill"
          ></image>
          <view class="vehicle-info">
            <view class="vehicle-header">
              <text class="vehicle-name">{{ favorite.targetTitle }}</text>
              <view class="favorite-btn" @tap.stop="toggleFavorite(favorite)">
                <uni-icons
                  type="heart-filled"
                  size="20"
                  color="#FF4D4F"
                ></uni-icons>
              </view>
            </view>
            <view class="vehicle-meta">
              <view class="price-info" v-if="favorite.targetPrice">
                <text class="price">¥{{ favorite.targetPrice }}</text>
                <text class="price-unit">/天</text>
              </view>
              <view class="folder-info">
                <uni-icons type="folder" size="14" color="#999"></uni-icons>
                <text class="folder-name">{{ favorite.folderName }}</text>
              </view>
            </view>
            <view class="vehicle-tags" v-if="favorite.tags && favorite.tags.length > 0">
              <text
                v-for="tag in favorite.tags.slice(0, 3)"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </text>
            </view>
            <view class="favorite-note" v-if="favorite.note">
              <text class="note-text">{{ favorite.note }}</text>
            </view>
          </view>
        </view>

        <!-- 文章收藏 -->
        <view v-else-if="favorite.targetType === 'article'" class="article-card">
          <image
            class="article-image"
            :src="favorite.targetImage || '/static/default-article.png'"
            mode="aspectFill"
          ></image>
          <view class="article-info">
            <view class="article-header">
              <text class="article-title">{{ favorite.targetTitle }}</text>
              <view class="favorite-btn" @tap.stop="toggleFavorite(favorite)">
                <uni-icons
                  type="heart-filled"
                  size="20"
                  color="#FF4D4F"
                ></uni-icons>
              </view>
            </view>
            <view class="article-meta">
              <text class="article-type">文章</text>
              <text class="folder-name">{{ favorite.folderName }}</text>
            </view>
          </view>
        </view>

        <!-- 门店收藏 -->
        <view v-else-if="favorite.targetType === 'store'" class="store-card">
          <image
            class="store-image"
            :src="favorite.targetImage || '/static/default-store.png'"
            mode="aspectFill"
          ></image>
          <view class="store-info">
            <view class="store-header">
              <text class="store-name">{{ favorite.targetTitle }}</text>
              <view class="favorite-btn" @tap.stop="toggleFavorite(favorite)">
                <uni-icons
                  type="heart-filled"
                  size="20"
                  color="#FF4D4F"
                ></uni-icons>
              </view>
            </view>
            <view class="store-meta">
              <text class="store-type">门店</text>
              <text class="folder-name">{{ favorite.folderName }}</text>
            </view>
          </view>
        </view>

        <!-- 收藏时间 -->
        <view class="favorite-footer">
          <text class="favorite-date">{{ formatDate(favorite.createdAt) }}</text>
          <view class="action-buttons">
            <view class="action-btn" @tap.stop="showEditFolder(favorite)">
              <uni-icons type="folder-add" size="16" color="#666"></uni-icons>
              <text class="action-text">移动</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="!loading && !hasMore && favorites.length > 0">
        <text class="no-more-text">没有更多收藏了</text>
      </view>
    </scroll-view>

    <!-- 移动到收藏夹弹窗 -->
    <uni-popup ref="folderPopup" type="bottom">
      <view class="folder-popup">
        <view class="popup-header">
          <text class="popup-title">选择收藏夹</text>
          <view class="close-btn" @tap="closeFolderPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="folder-list">
          <view
            v-for="folder in folders"
            :key="folder.id"
            class="folder-option"
            @tap="selectFolder(folder)"
          >
            <uni-icons
              :type="folder.icon || 'star'"
              size="20"
              :color="folder.color || '#FF9F29'"
            ></uni-icons>
            <text class="folder-name-option">{{ folder.name }}</text>
            <view
              v-if="selectedFavorite && selectedFavorite.folderName === folder.name"
              class="selected-icon"
            >
              <uni-icons type="checkmarkempty" size="16" color="#FF9F29"></uni-icons>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="create-folder-btn" @tap="showCreateFolder">
            <uni-icons type="plus" size="16" color="#FF9F29"></uni-icons>
            <text class="btn-text">新建收藏夹</text>
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 创建收藏夹弹窗 -->
    <uni-popup ref="createFolderPopup" type="center">
      <view class="create-folder-popup">
        <view class="popup-header">
          <text class="popup-title">新建收藏夹</text>
          <view class="close-btn" @tap="closeCreateFolderPopup">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">收藏夹名称</text>
            <input
              class="form-input"
              v-model="newFolderName"
              placeholder="请输入收藏夹名称"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="form-label">描述（选填）</text>
            <textarea
              class="form-textarea"
              v-model="newFolderDesc"
              placeholder="请输入收藏夹描述"
              maxlength="100"
            ></textarea>
          </view>
        </view>
        <view class="popup-actions">
          <button class="cancel-btn" @tap="closeCreateFolderPopup">取消</button>
          <button class="confirm-btn" @tap="createFolder">创建</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { favoriteApi } from '@/api/favorite';

const userStore = useUserStore();

// 状态管理
const favorites = ref([]);
const folders = ref([]);
const userStats = ref({
  total: 0,
  vehicle: 0,
  article: 0,
  store: 0
});

const currentType = ref('total');
const currentFolder = ref('');
const page = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);

// 弹窗相关
const folderPopup = ref(null);
const createFolderPopup = ref(null);
const selectedFavorite = ref(null);
const newFolderName = ref('');
const newFolderDesc = ref('');

// 统计列表
const statsList = [
  { key: 'total', label: '全部' },
  { key: 'vehicle', label: '车辆' },
  { key: 'article', label: '文章' },
  { key: 'store', label: '门店' }
];

// 计算属性
const currentTypeText = computed(() => {
  const type = statsList.find(s => s.key === currentType.value);
  return type ? type.label : '';
});

// 页面加载
onMounted(() => {
  loadUserStats();
  loadFolders();
  loadFavorites();
});

// 页面显示时刷新数据
onShow(() => {
  loadUserStats();
  loadFavorites();
});

// 切换类型
const switchType = (type) => {
  currentType.value = type;
  currentFolder.value = '';
  page.value = 1;
  favorites.value = [];
  hasMore.value = true;
  loadFavorites();
};

// 设置收藏夹筛选
const setFolder = (folderName) => {
  currentFolder.value = folderName;
  page.value = 1;
  favorites.value = [];
  hasMore.value = true;
  loadFavorites();
};

// 加载用户收藏统计
const loadUserStats = async () => {
  try {
    const response = await favoriteApi.getUserFavoriteStats();
    userStats.value = response.data;
  } catch (error) {
    console.error('加载收藏统计失败:', error);
  }
};

// 加载收藏夹列表
const loadFolders = async () => {
  try {
    const response = await favoriteApi.getUserFolders();
    folders.value = response.data;
  } catch (error) {
    console.error('加载收藏夹失败:', error);
  }
};

// 加载收藏列表
const loadFavorites = async (isRefresh = false) => {
  if (loading.value && !isRefresh) return;

  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: 10
    };

    if (currentType.value !== 'total') {
      params.targetType = currentType.value;
    }

    if (currentFolder.value) {
      params.folderName = currentFolder.value;
    }

    const response = await favoriteApi.getUserFavorites(params);
    const newFavorites = response.data.favorites;

    if (isRefresh || page.value === 1) {
      favorites.value = newFavorites;
    } else {
      favorites.value.push(...newFavorites);
    }

    hasMore.value = page.value < response.data.pagination.pages;
  } catch (error) {
    console.error('加载收藏列表失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadFavorites();
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  page.value = 1;
  loadFavorites(true);
};

// 取消收藏
const toggleFavorite = async (favorite) => {
  try {
    await favoriteApi.removeFavorite(favorite.targetType, favorite.targetId);

    // 从列表中移除
    const index = favorites.value.findIndex(f => f.id === favorite.id);
    if (index > -1) {
      favorites.value.splice(index, 1);
    }

    // 更新统计
    await loadUserStats();

    uni.showToast({
      title: '已取消收藏',
      icon: 'success'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 显示编辑收藏夹弹窗
const showEditFolder = (favorite) => {
  selectedFavorite.value = favorite;
  folderPopup.value.open();
};

// 关闭收藏夹弹窗
const closeFolderPopup = () => {
  folderPopup.value.close();
  selectedFavorite.value = null;
};

// 选择收藏夹
const selectFolder = async (folder) => {
  if (!selectedFavorite.value) return;

  try {
    await favoriteApi.updateFavorite(selectedFavorite.value.id, {
      folderName: folder.name
    });

    // 更新本地数据
    selectedFavorite.value.folderName = folder.name;

    closeFolderPopup();
    uni.showToast({
      title: '移动成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('移动收藏失败:', error);
    uni.showToast({
      title: '移动失败，请重试',
      icon: 'none'
    });
  }
};

// 显示创建收藏夹弹窗
const showCreateFolder = () => {
  closeFolderPopup();
  newFolderName.value = '';
  newFolderDesc.value = '';
  createFolderPopup.value.open();
};

// 关闭创建收藏夹弹窗
const closeCreateFolderPopup = () => {
  createFolderPopup.value.close();
};

// 创建收藏夹
const createFolder = async () => {
  if (!newFolderName.value.trim()) {
    uni.showToast({
      title: '请输入收藏夹名称',
      icon: 'none'
    });
    return;
  }

  try {
    await favoriteApi.createFolder({
      name: newFolderName.value.trim(),
      description: newFolderDesc.value.trim()
    });

    closeCreateFolderPopup();
    loadFolders();
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('创建收藏夹失败:', error);
    uni.showToast({
      title: error.message || '创建失败，请重试',
      icon: 'none'
    });
  }
};

// 跳转到详情页
const goToDetail = (favorite) => {
  let url = '';

  if (favorite.targetType === 'vehicle') {
    url = `/pages/vehicles/detail?id=${favorite.targetId}`;
  } else if (favorite.targetType === 'article') {
    url = `/pages/article/detail?id=${favorite.targetId}`;
  } else if (favorite.targetType === 'store') {
    url = `/pages/store/detail?id=${favorite.targetId}`;
  }

  if (url) {
    uni.navigateTo({ url });
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 去逛逛
const goToBrowse = () => {
  uni.switchTab({
    url: '/pages/home/index'
  });
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 24 * 60 * 60 * 1000) {
    return '今天';
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  } else {
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }
};
</script>

<style>
.favorite-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 头部
.header {
  background-color: #ffffff;
  padding-bottom: 24rpx;

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    height: 88rpx;

    .nav-item {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  // 统计信息
  .stats-section  { .stats-grid { display: flex;
      padding: 0 32rpx;

      .stat-item { flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;
        padding: 24rpx 0;

        &.active { .stat-number { color: #FF9F29; }.stat-label { color: #FF9F29;
            font-weight: 500; } }

        .stat-number {
          font-size: 36rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.8);
        }

        .stat-label {
          font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  // 收藏夹筛选
  .folder-filter {
    margin-top: 24rpx;
    border-top: 2rpx solid #f8f8f8;
    padding-top: 24rpx;

    .filter-scroll {
      white-space: nowrap;

      .filter-list {
        display: flex;
        padding: 0 32rpx;

        .filter-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8rpx;
          padding: 12rpx 20rpx;
          margin-right: 16rpx;
          background-color: #f8f8f8;
          border-radius: 20rpx;

          .last-child {
            margin-right: 0;
          }

          .filter-text {
            font-size: 24rpx;
            color: rgba(0, 0, 0, 0.6);
          }

          &.active {
            background-color: rgba(255, 159, 41, 0.1);

            .filter-text {
              color: #FF9F29;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

// 收藏列表
.favorite-list {
  height: calc(100vh - 320rpx);
  padding: 24rpx;
}

.favorite-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;

  // 车辆卡片
  .vehicle-card {
    display: flex;
    gap: 24rpx;
    padding: 24rpx;

    .vehicle-image {
      width: 200rpx;
      height: 150rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .vehicle-info {
      flex: 1;

      .vehicle-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;

        .vehicle-name {
          font-size: 30rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          line-height: 1.4;
          flex: 1;
        }

        .favorite-btn {
          padding: 8rpx;
        }
      }

      .vehicle-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .price-info  { .price { font-size: 32rpx;
            font-weight: 600;
            color: #FF4D4F; }.price-unit { font-size: 24rpx;
            color: rgba(0, 0, 0, 0.6); } }

        .folder-info {
          display: flex;
          align-items: center;
          gap: 4rpx;

          .folder-name {
            font-size: 22rpx;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }

      .vehicle-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8rpx;
        margin-bottom: 12rpx;

        .tag {
          padding: 4rpx 12rpx;
          background-color: rgba(255, 159, 41, 0.1);
          color: #FF9F29;
          font-size: 20rpx;
          border-radius: 12rpx;
        }
      }

      .favorite-note  { .note-text { font-size: 24rpx;
          color: rgba(0, 0, 0, 0.6);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden; } }
    }
  }

  // 文章卡片
  .article-card {
    display: flex;
    gap: 24rpx;
    padding: 24rpx;

    .article-image {
      width: 160rpx;
      height: 120rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .article-info {
      flex: 1;

      .article-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;

        .article-title {
          font-size: 28rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          line-height: 1.4;
          flex: 1;
        }

        .favorite-btn {
          padding: 8rpx;
        }
      }

      .article-meta {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .article-type,
        .folder-name {
          font-size: 22rpx;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  // 门店卡片
  .store-card {
    display: flex;
    gap: 24rpx;
    padding: 24rpx;

    .store-image {
      width: 160rpx;
      height: 120rpx;
      border-radius: 12rpx;
      flex-shrink: 0;
    }

    .store-info {
      flex: 1;

      .store-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16rpx;

        .store-name {
          font-size: 28rpx;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          line-height: 1.4;
          flex: 1;
        }

        .favorite-btn {
          padding: 8rpx;
        }
      }

      .store-meta {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .store-type,
        .folder-name {
          font-size: 22rpx;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }

  // 底部信息
  .favorite-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    border-top: 2rpx solid #f8f8f8;

    .favorite-date {
      font-size: 22rpx;
      color: rgba(0, 0, 0, 0.4);
    }

    .action-buttons {
      display: flex;
      gap: 24rpx;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4rpx;

        .action-text {
          font-size: 22rpx;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 48rpx;
  }

  .browse-btn {
    padding: 20rpx 48rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}

// 弹窗样式
.folder-popup {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 2rpx solid #f8f8f8;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .close-btn {
      padding: 8rpx;
    }
  }

  .folder-list {
    max-height: 400rpx;
    overflow-y: auto;

    .folder-option {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 32rpx;
      border-bottom: 2rpx solid #f8f8f8;

      .last-child {
        border-bottom: none;
      }

      .folder-name-option {
        flex: 1;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
      }

      .selected-icon {
        padding: 8rpx;
      }
    }
  }

  .popup-footer {
    padding: 32rpx;
    border-top: 2rpx solid #f8f8f8;

    .create-folder-btn {
      width: 100%;
      height: 88rpx;
      background-color: #fafafa;
      color: #FF9F29;
      border: 2rpx solid #FF9F29;
      border-radius: 44rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;

      &::after {
        border: none;
      }
    }
  }
}

.create-folder-popup {
  background-color: #ffffff;
  border-radius: 16rpx;
  width: 560rpx;
  padding: 32rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }

    .close-btn {
      padding: 8rpx;
    }
  }

  .form-content {
    margin-bottom: 48rpx;

    .form-item {
      margin-bottom: 32rpx;

      .last-child {
        margin-bottom: 0;
      }

      .form-label {
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 16rpx;
        display: block;
      }

      .form-input {
        width: 100%;
        height: 80rpx;
        padding: 0 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        font-size: 28rpx;
        background-color: #fafafa;
      }

      .form-textarea {
        width: 100%;
        min-height: 120rpx;
        padding: 24rpx;
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        font-size: 28rpx;
        background-color: #fafafa;
      }
    }
  }

  .popup-actions {
    display: flex;
    gap: 24rpx;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;

      &::after {
        border: none;
      }
    }

    .cancel-btn {
      background-color: #f8f8f8;
      color: rgba(0, 0, 0, 0.6);
    }

    .confirm-btn {
      background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
      color: #ffffff;
    }
  }
}

// 加载状态
.loading-state,
.no-more {
  text-align: center;
  padding: 40rpx 0;

  .loading-text,
  .no-more-text {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>