<template>
  <view class="projects-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showStatusPopup = true">
        <text class="filter-text">{{ statusOptions.find(o => o.value === currentStatus)?.label || '全部状态' }}</text>
        <u-icon name="arrow-down" size="14"></u-icon>
      </view>
      <view class="filter-item" @click="showSortPopup = true">
        <text class="filter-text">{{ sortOptions.find(o => o.value === currentSort)?.label }}</text>
        <u-icon name="arrow-down" size="14"></u-icon>
      </view>
    </view>

    <!-- 项目列表 -->
    <view class="project-list">
      <view
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="goToDetail(project.id)"
      >
        <image :src="project.model.thumbnail" class="project-img" mode="aspectFill"></image>
        <view class="project-status-badge" :class="'status-' + project.status">
          {{ project.statusText }}
        </view>

        <view class="project-info">
          <text class="project-title">{{ project.title }}</text>

          <view class="project-meta">
            <view class="meta-item">
              <u-icon name="car" size="14" color="#86909C"></u-icon>
              <text>{{ project.model.brand }} {{ project.model.name }}</text>
            </view>
            <view class="meta-item">
              <u-icon name="account" size="14" color="#86909C"></u-icon>
              <text>{{ project.initiator.name }}</text>
            </view>
          </view>

          <view class="progress-section">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: project.progress + '%' }"></view>
            </view>
            <view class="progress-info">
              <text class="progress-text">{{ project.progress }}%</text>
              <text class="remaining-text">剩余{{ project.remainingDays }}天</text>
            </view>
          </view>

          <view class="project-stats">
            <view class="stat-item">
              <text class="stat-value">¥{{ (project.pricePerShare / 10000).toFixed(1) }}万</text>
              <text class="stat-label">单份价格</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ project.soldShares }}/{{ project.totalShares }}</text>
              <text class="stat-label">已售份额</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ project.participantCount }}人</text>
              <text class="stat-label">已参与</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value highlight">{{ project.estimatedAnnualReturn }}%</text>
              <text class="stat-label">预估年化</text>
            </view>
          </view>

          <view v-if="project.isParticipated" class="participated-badge">
            <u-icon name="checkmark-circle" size="14" color="#00B578"></u-icon>
            <text>已参与 {{ project.myShares }}份</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <u-loading-icon mode="circle"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-if="!loading && projects.length === 0" class="empty-state">
      <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
      <text class="empty-text">暂无众筹项目</text>
    </view>

    <!-- 状态筛选弹窗 -->
    <u-popup v-model:show="showStatusPopup" mode="bottom" :round="20">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">项目状态</text>
          <u-icon name="close" size="20" @click="showStatusPopup = false"></u-icon>
        </view>
        <view class="options-list">
          <view
            v-for="option in statusOptions"
            :key="option.value"
            class="option-item"
            :class="{ active: currentStatus === option.value }"
            @click="selectStatus(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentStatus === option.value" name="checkbox-mark" size="18" color="#9C27B0"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 排序弹窗 -->
    <u-popup v-model:show="showSortPopup" mode="bottom" :round="20">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">排序方式</text>
          <u-icon name="close" size="20" @click="showSortPopup = false"></u-icon>
        </view>
        <view class="options-list">
          <view
            v-for="option in sortOptions"
            :key="option.value"
            class="option-item"
            :class="{ active: currentSort === option.value }"
            @click="selectSort(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentSort === option.value" name="checkbox-mark" size="18" color="#9C27B0"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getCrowdfundingProjects } from '@/api/crowdfunding'
import type { CrowdfundingProject, CrowdfundingStatus } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const projects = ref<CrowdfundingProject[]>([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showStatusPopup = ref(false)
const showSortPopup = ref(false)
const currentStatus = ref<CrowdfundingStatus | ''>('')
const currentSort = ref('time')

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '众筹中', value: 'funding' },
  { label: '众筹成功', value: 'success' },
  { label: '托管中', value: 'hosting' }
]

const sortOptions = [
  { label: '最新发布', value: 'time' },
  { label: '进度最高', value: 'progress' },
  { label: '收益率最高', value: 'return' }
]

// 页面加载
onLoad((options: any) => {
  if (options.modelId) {
    // 如果有车型ID，只显示该车型的众筹项目
  }
  loadProjects()
})

// 下拉刷新
onPullDownRefresh(() => {
  currentPage.value = 1
  hasMore.value = true
  loadProjects(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadProjects()
  }
})

// 加载项目列表
const loadProjects = async (refresh = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getCrowdfundingProjects({
      status: currentStatus.value || undefined,
      sortBy: currentSort.value as any,
      page: currentPage.value,
      pageSize: 10
    })

    if (res.code === 0 && res.data) {
      if (refresh) {
        projects.value = res.data.list || []
      } else {
        projects.value = [...projects.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasMore ?? false
    }
  } catch (error) {
    logger.error('加载项目列表失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 选择状态
const selectStatus = (value: any) => {
  currentStatus.value = value
  showStatusPopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadProjects(true)
}

// 选择排序
const selectSort = (value: string) => {
  currentSort.value = value
  showSortPopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadProjects(true)
}

// 跳转到详情
const goToDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/project-detail?id=${id}`
  })
}
</script>

<style scoped lang="scss">
.projects-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 40rpx;
}

// 筛选栏
.filter-bar {
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background: #F8F9FC;
    border-radius: 32rpx;

    .filter-text {
      font-size: 26rpx;
      color: #1D2129;
    }
  }
}

// 项目列表
.project-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.project-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  position: relative;

  .project-img {
    width: 100%;
    height: 300rpx;
    background: #F0F0F0;
  }

  .project-status-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 32rpx;
    font-size: 22rpx;
    font-weight: 600;
    backdrop-filter: blur(10px);

    &.status-funding {
      background: rgba(156, 39, 176, 0.9);
      color: #FFFFFF;
    }

    &.status-success {
      background: rgba(0, 181, 120, 0.9);
      color: #FFFFFF;
    }

    &.status-hosting {
      background: rgba(33, 150, 243, 0.9);
      color: #FFFFFF;
    }
  }

  .project-info {
    padding: 24rpx;
  }

  .project-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1D2129;
    display: block;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-meta {
    display: flex;
    gap: 24rpx;
    margin-bottom: 20rpx;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6rpx;
      font-size: 24rpx;
      color: #86909C;
    }
  }

  .progress-section {
    margin-bottom: 20rpx;
  }

  .progress-bar {
    height: 12rpx;
    background: #F2F3F5;
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 12rpx;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%);
      border-radius: 6rpx;
      transition: width 0.3s;
    }
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .progress-text {
      font-size: 24rpx;
      font-weight: 600;
      color: #9C27B0;
    }

    .remaining-text {
      font-size: 22rpx;
      color: #86909C;
    }
  }

  .project-stats {
    display: flex;
    align-items: center;
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-bottom: 16rpx;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;
        display: block;
        margin-bottom: 4rpx;

        &.highlight {
          color: #00B578;
        }
      }

      .stat-label {
        font-size: 20rpx;
        color: #86909C;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background: #E5E6EB;
    }
  }

  .participated-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 12rpx;
    background: rgba(0, 181, 120, 0.1);
    border-radius: 12rpx;

    text {
      font-size: 24rpx;
      color: #00B578;
      font-weight: 600;
    }
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  gap: 20rpx;

  .loading-text {
    font-size: 24rpx;
    color: #86909C;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #86909C;
  }
}

// 弹窗
.popup-content {
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  padding: 32rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1D2129;
    }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 0;

    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #F2F3F5;

      &:last-child {
        border-bottom: none;
      }

      .option-text {
        font-size: 28rpx;
        color: #1D2129;
      }

      &.active .option-text {
        color: #9C27B0;
        font-weight: 600;
      }
    }
  }
}
</style>
