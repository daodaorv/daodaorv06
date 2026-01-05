<template>
  <view class="my-crowdfunding-page">
    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ stats.projectCount }}</text>
          <text class="stat-label">参与项目</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalShares }}</text>
          <text class="stat-label">持有份额</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">¥{{ stats.totalInvestment.toLocaleString() }}</text>
          <text class="stat-label">总投资</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value highlight">¥{{ stats.totalIncome.toLocaleString() }}</text>
          <text class="stat-label">累计收益</text>
        </view>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-nav">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'projects' }"
        @click="switchTab('projects')"
      >
        <text>参与的项目</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'shares' }"
        @click="switchTab('shares')"
      >
        <text>持有的份额</text>
      </view>
    </view>

    <!-- 参与的项目列表 -->
    <view v-if="currentTab === 'projects'" class="projects-list">
      <view
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="goToProjectDetail(project.id)"
      >
        <view class="project-header">
          <image :src="project.model.thumbnail" class="project-img" mode="aspectFill"></image>
          <view class="project-info">
            <text class="project-title">{{ project.title }}</text>
            <view class="project-meta">
              <text class="meta-text">{{ project.model.brand }} {{ project.model.name }}</text>
            </view>
            <view class="project-status">
              <view class="status-badge" :class="'status-' + project.status">
                {{ project.statusText }}
              </view>
            </view>
          </view>
        </view>

        <view class="project-stats">
          <view class="stat-row">
            <text class="stat-label">我的份额</text>
            <text class="stat-value">{{ project.myShares }}份 ({{ ((project.myShares / project.totalShares) * 100).toFixed(2) }}%)</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">投资金额</text>
            <text class="stat-value">¥{{ (project.myShares * project.pricePerShare).toLocaleString() }}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">累计收益</text>
            <text class="stat-value highlight">¥{{ project.myIncome.toLocaleString() }}</text>
          </view>
        </view>

        <view v-if="project.status === 'hosting'" class="project-actions">
          <button class="action-btn secondary" @click.stop="viewIncome(project.id)">
            查看收益
          </button>
          <button class="action-btn primary" @click.stop="sellShare(project.id)">
            出售份额
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="projects.length === 0 && !loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
        <text class="empty-text">暂无参与的项目</text>
        <button class="empty-btn" @click="goToBrowse">
          去浏览项目
        </button>
      </view>
    </view>

    <!-- 持有的份额列表 -->
    <view v-if="currentTab === 'shares'" class="shares-list">
      <view
        v-for="share in shares"
        :key="share.id"
        class="share-card"
      >
        <view class="share-header">
          <image :src="share.project.model.thumbnail" class="share-img" mode="aspectFill"></image>
          <view class="share-info">
            <text class="share-title">{{ share.project.title }}</text>
            <view class="share-meta">
              <text class="meta-text">{{ share.project.model.brand }} {{ share.project.model.name }}</text>
            </view>
          </view>
        </view>

        <view class="share-details">
          <view class="detail-row">
            <text class="detail-label">持有份额</text>
            <text class="detail-value">{{ share.shares }}份</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">持有时长</text>
            <text class="detail-value">{{ share.holdingDays }}天</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">累计收益</text>
            <text class="detail-value highlight">¥{{ share.totalIncome.toLocaleString() }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预估年化</text>
            <text class="detail-value">{{ share.project.estimatedAnnualReturn }}%</text>
          </view>
        </view>

        <view class="share-actions">
          <button class="action-btn secondary" @click="viewShareDetail(share.project.id)">
            查看详情
          </button>
          <button class="action-btn primary" @click="sellShare(share.project.id)">
            出售份额
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="shares.length === 0 && !loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
        <text class="empty-text">暂无持有的份额</text>
        <button class="empty-btn" @click="goToMarket">
          去份额市场
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <u-loading-icon mode="circle"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getMyCrowdfundingProjects, getMyCrowdfundingShares, getCrowdfundingStats } from '@/api/crowdfunding'
import type { CrowdfundingProject, CrowdfundingShare, CrowdfundingStats } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const currentTab = ref<'projects' | 'shares'>('projects')
const projects = ref<CrowdfundingProject[]>([])
const shares = ref<CrowdfundingShare[]>([])
const stats = ref<CrowdfundingStats>({
  projectCount: 0,
  totalShares: 0,
  totalInvestment: 0,
  totalIncome: 0,
  availableIncome: 0
})
const loading = ref(false)

// 页面加载
onLoad(() => {
  loadData()
})

// 页面显示
onShow(() => {
  loadData()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadData()
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载统计数据和列表数据
    const [statsRes, projectsRes, sharesRes] = await Promise.all([
      getCrowdfundingStats(),
      getMyCrowdfundingProjects(),
      getMyCrowdfundingShares()
    ])

    if (statsRes.code === 0) {
      stats.value = statsRes.data
    }

    if (projectsRes.code === 0) {
      projects.value = projectsRes.data || []
    }

    if (sharesRes.code === 0) {
      shares.value = sharesRes.data || []
    }
  } catch (error) {
    logger.error('加载数据失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 切换Tab
const switchTab = (tab: 'projects' | 'shares') => {
  currentTab.value = tab
}

// 跳转到项目详情
const goToProjectDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/project-detail?id=${id}`
  })
}

// 查看收益
const viewIncome = (projectId: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/income-detail?projectId=${projectId}`
  })
}

// 出售份额
const sellShare = (projectId: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/sell-share?projectId=${projectId}`
  })
}

// 查看份额详情
const viewShareDetail = (projectId: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/project-detail?id=${projectId}`
  })
}

// 去浏览项目
const goToBrowse = () => {
  uni.navigateTo({
    url: '/pages/hosting/crowdfunding/projects'
  })
}

// 去份额市场
const goToMarket = () => {
  uni.navigateTo({
    url: '/pages/hosting/crowdfunding/share-market'
  })
}
</script>

<style scoped lang="scss">
.my-crowdfunding-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 40rpx;
}

// 统计卡片
.stats-section {
  padding: 32rpx;
  margin-bottom: 20rpx;

  .stats-card {
    background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(156, 39, 176, 0.3);

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #FFFFFF;
        display: block;
        margin-bottom: 8rpx;

        &.highlight {
          font-size: 36rpx;
        }
      }

      .stat-label {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 60rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

// Tab导航
.tab-nav {
  background: #FFFFFF;
  display: flex;
  padding: 0 32rpx;
  margin-bottom: 20rpx;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;

    text {
      font-size: 28rpx;
      color: #86909C;
      font-weight: 500;
    }

    &.active {
      text {
        color: #2979FF;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #2979FF;
        border-radius: 2rpx;
      }
    }
  }
}

// 项目列表
.projects-list {
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

  .project-header {
    display: flex;
    gap: 20rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #F2F3F5;

    .project-img {
      width: 120rpx;
      height: 90rpx;
      border-radius: 12rpx;
      background: #F0F0F0;
    }

    .project-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .project-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .project-meta {
        .meta-text {
          font-size: 24rpx;
          color: #86909C;
        }
      }

      .project-status {
        .status-badge {
          display: inline-block;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          font-weight: 600;

          &.status-funding {
            background: rgba(156, 39, 176, 0.1);
            color: #2979FF;
          }

          &.status-hosting {
            background: rgba(33, 150, 243, 0.1);
            color: #2196F3;
          }

          &.status-success {
            background: rgba(0, 181, 120, 0.1);
            color: #00B578;
          }
        }
      }
    }
  }

  .project-stats {
    padding: 24rpx;
    background: #F8F9FC;

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .stat-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .stat-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 28rpx;
        }
      }
    }
  }

  .project-actions {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #F2F3F5;

    .action-btn {
      flex: 1;
      height: 72rpx;
      border-radius: 36rpx;
      font-size: 26rpx;
      font-weight: 600;
      border: none;

      &::after {
        border: none;
      }

      &.secondary {
        background: #F8F9FC;
        color: #2979FF;
      }

      &.primary {
        background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
        color: #FFFFFF;
      }
    }
  }
}

// 份额列表
.shares-list {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.share-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .share-header {
    display: flex;
    gap: 20rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #F2F3F5;

    .share-img {
      width: 120rpx;
      height: 90rpx;
      border-radius: 12rpx;
      background: #F0F0F0;
    }

    .share-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8rpx;

      .share-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .share-meta {
        .meta-text {
          font-size: 24rpx;
          color: #86909C;
        }
      }
    }
  }

  .share-details {
    padding: 24rpx;
    background: #F8F9FC;

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .detail-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 28rpx;
        }
      }
    }
  }

  .share-actions {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #F2F3F5;

    .action-btn {
      flex: 1;
      height: 72rpx;
      border-radius: 36rpx;
      font-size: 26rpx;
      font-weight: 600;
      border: none;

      &::after {
        border: none;
      }

      &.secondary {
        background: #F8F9FC;
        color: #2979FF;
      }

      &.primary {
        background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
        color: #FFFFFF;
      }
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
    margin-bottom: 32rpx;
  }

  .empty-btn {
    width: 240rpx;
    height: 72rpx;
    background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
    color: #FFFFFF;
    border-radius: 36rpx;
    font-size: 26rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }
  }
}
</style>
