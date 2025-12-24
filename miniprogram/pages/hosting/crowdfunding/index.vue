<template>
  <view class="crowdfunding-page">
    <!-- 顶部Banner -->
    <view class="hero-banner">
      <view class="banner-content">
        <text class="banner-title">众筹托管</text>
        <text class="banner-subtitle">低门槛参与房车投资，共享托管收益</text>
      </view>
      <view class="banner-decoration"></view>
    </view>

    <!-- 风险提示 -->
    <view class="notice-banner warning">
      <u-icon name="info-circle" size="16" color="#FF9800"></u-icon>
      <text class="notice-text">众筹托管为用户自发行为，平台提供服务和监管，不承担法律责任</text>
    </view>

    <!-- Tab导航 -->
    <view class="tab-nav">
      <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
        <view class="tab-wrapper">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: currentTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            <text class="tab-text">{{ tab.label }}</text>
            <view v-if="currentTab === tab.key" class="tab-indicator"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 推荐车型 -->
      <view v-if="currentTab === 'models'" class="tab-content">
        <view class="section-header">
          <text class="section-title">热门推荐</text>
          <view class="view-all" @click="goToModelList">
            查看全部 <u-icon name="arrow-right" size="14"></u-icon>
          </view>
        </view>
        <view class="model-grid">
          <view
            v-for="model in hotModels"
            :key="model.id"
            class="model-card"
            @click="goToModelDetail(model.id)"
          >
            <image :src="model.thumbnail" class="model-img" mode="aspectFill"></image>
            <view v-if="model.isHot" class="hot-badge">热门</view>
            <view class="model-info">
              <text class="model-name">{{ model.name }}</text>
              <view class="model-price">
                <text class="price-label">购置价</text>
                <text class="price-value">¥{{ (model.purchasePrice / 10000).toFixed(1) }}万</text>
              </view>
              <view class="model-return">
                <text class="return-label">预估年化</text>
                <text class="return-value">{{ model.estimatedAnnualReturn }}%</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 众筹项目 -->
      <view v-if="currentTab === 'projects'" class="tab-content">
        <view class="project-list">
          <view
            v-for="project in projects"
            :key="project.id"
            class="project-card"
            @click="goToProjectDetail(project.id)"
          >
            <image :src="project.model.thumbnail" class="project-img" mode="aspectFill"></image>
            <view class="project-info">
              <text class="project-title">{{ project.title }}</text>
              <view class="project-meta">
                <text class="meta-item">{{ project.model.brand }} {{ project.model.name }}</text>
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
                  <text class="stat-value">{{ project.participantCount }}人</text>
                  <text class="stat-label">已参与</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                  <text class="stat-value">{{ project.estimatedAnnualReturn }}%</text>
                  <text class="stat-label">预估年化</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 份额市场 -->
      <view v-if="currentTab === 'market'" class="tab-content">
        <view class="market-list">
          <view
            v-for="transaction in transactions"
            :key="transaction.id"
            class="market-card"
            @click="goToShareDetail(transaction.id)"
          >
            <view class="market-header">
              <text class="market-title">{{ transaction.project.title }}</text>
              <view class="price-change" :class="transaction.priceChange > 0 ? 'up' : 'down'">
                {{ transaction.priceChange > 0 ? '+' : '' }}{{ transaction.priceChange.toFixed(2) }}%
              </view>
            </view>
            <view class="market-info">
              <view class="info-row">
                <text class="info-label">出售价格</text>
                <text class="info-value primary">¥{{ transaction.pricePerShare.toLocaleString() }}/份</text>
              </view>
              <view class="info-row">
                <text class="info-label">参考价格</text>
                <text class="info-value">¥{{ transaction.referencePrice.toLocaleString() }}/份</text>
              </view>
              <view class="info-row">
                <text class="info-label">出售份额</text>
                <text class="info-value">{{ transaction.quantity }}份</text>
              </view>
              <view class="info-row">
                <text class="info-label">累计收益率</text>
                <text class="info-value success">{{ transaction.returnRate }}%</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 我的众筹 -->
      <view v-if="currentTab === 'mine'" class="tab-content">
        <view v-if="!isLogin" class="login-prompt">
          <image class="prompt-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
          <text class="prompt-text">登录后查看我的众筹</text>
          <button class="login-btn" @click="goToLogin">立即登录</button>
        </view>
        <view v-else-if="myShares.length === 0" class="empty-state">
          <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
          <text class="empty-text">暂无众筹份额</text>
          <button class="browse-btn" @click="switchTab('projects')">浏览众筹项目</button>
        </view>
        <view v-else class="my-shares">
          <view class="stats-card">
            <view class="stat-item">
              <text class="stat-value">{{ stats.projectCount }}</text>
              <text class="stat-label">参与项目</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ stats.totalShares }}</text>
              <text class="stat-label">持有份额</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">¥{{ stats.totalInvestment.toLocaleString() }}</text>
              <text class="stat-label">总投资</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">¥{{ stats.totalIncome.toLocaleString() }}</text>
              <text class="stat-label">累计收益</text>
            </view>
          </view>
          <view class="share-list">
            <view
              v-for="share in myShares"
              :key="share.id"
              class="share-card"
              @click="goToShareDetail(share.id)"
            >
              <view class="share-header">
                <text class="share-title">{{ share.project.title }}</text>
                <view class="share-status">{{ share.project.statusText }}</view>
              </view>
              <view class="share-info">
                <view class="info-row">
                  <text class="info-label">持有份额</text>
                  <text class="info-value">{{ share.quantity }}份</text>
                </view>
                <view class="info-row">
                  <text class="info-label">累计收益</text>
                  <text class="info-value success">¥{{ share.totalIncome.toLocaleString() }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">收益率</text>
                  <text class="info-value success">{{ share.returnRate }}%</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/utils/auth'
import { logger } from '@/utils/logger'
import {
  getCrowdfundingModels,
  getCrowdfundingProjects,
  getShareMarket,
  getMyCrowdfundingShares,
  getCrowdfundingStats
} from '@/api/crowdfunding'
import type {
  CrowdfundingVehicleModel,
  CrowdfundingProject,
  ShareTransaction,
  CrowdfundingShare,
  CrowdfundingStats
} from '@/types/crowdfunding'

// 数据定义
const isLogin = ref(false)
const currentTab = ref('models')
const tabs = [
  { key: 'models', label: '推荐车型' },
  { key: 'projects', label: '众筹项目' },
  { key: 'market', label: '份额市场' },
  { key: 'mine', label: '我的众筹' }
]

const hotModels = ref<CrowdfundingVehicleModel[]>([])
const projects = ref<CrowdfundingProject[]>([])
const transactions = ref<ShareTransaction[]>([])
const myShares = ref<CrowdfundingShare[]>([])
const stats = ref<CrowdfundingStats>({
  projectCount: 0,
  totalShares: 0,
  totalInvestment: 0,
  totalIncome: 0,
  averageReturn: 0,
  monthIncome: 0
})

// 页面加载
onLoad(() => {
  checkLoginStatus()
  loadData()
})

onShow(() => {
  checkLoginStatus()
  if (currentTab.value === 'mine' && isLogin.value) {
    loadMyData()
  }
})

// 检查登录状态
const checkLoginStatus = () => {
  isLogin.value = isLoggedIn()
}

// 加载数据
const loadData = async () => {
  try {
    // 加载推荐车型
    const modelsRes = await getCrowdfundingModels({ page: 1, pageSize: 4 })
    if (modelsRes.code === 0 && modelsRes.data?.list) {
      hotModels.value = modelsRes.data.list.filter(m => m.isHot) || []
    }

    // 加载众筹项目
    const projectsRes = await getCrowdfundingProjects({ page: 1, pageSize: 10 })
    if (projectsRes.code === 0 && projectsRes.data?.list) {
      projects.value = projectsRes.data.list || []
    }

    // 加载份额市场
    const marketRes = await getShareMarket({ page: 1, pageSize: 10 })
    if (marketRes.code === 0 && marketRes.data?.list) {
      transactions.value = marketRes.data.list || []
    }
  } catch (error) {
    logger.error('加载数据失败', error)
    // 确保即使出错也有默认值
    hotModels.value = []
    projects.value = []
    transactions.value = []
  }
}

// 加载我的数据
const loadMyData = async () => {
  try {
    const [sharesRes, statsRes] = await Promise.all([
      getMyCrowdfundingShares(),
      getCrowdfundingStats()
    ])

    if (sharesRes.code === 0 && sharesRes.data) {
      myShares.value = Array.isArray(sharesRes.data) ? sharesRes.data : []
    }

    if (statsRes.code === 0 && statsRes.data) {
      stats.value = statsRes.data
    }
  } catch (error) {
    logger.error('加载我的数据失败', error)
    // 确保即使出错也有默认值
    myShares.value = []
  }
}

// 切换Tab
const switchTab = (key: string) => {
  currentTab.value = key
  if (key === 'mine' && isLogin.value) {
    loadMyData()
  }
}

// 跳转到车型列表
const goToModelList = () => {
  uni.navigateTo({
    url: '/pages/hosting/crowdfunding/models'
  })
}

// 跳转到车型详情
const goToModelDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/model-detail?id=${id}`
  })
}

// 跳转到项目详情
const goToProjectDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/project-detail?id=${id}`
  })
}

// 跳转到份额详情
const goToShareDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/hosting/crowdfunding/share-detail?id=${id}`
  })
}

// 跳转到登录
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/auth/login'
  })
}
</script>

<style scoped lang="scss">
.crowdfunding-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 40rpx;
}

// 顶部Banner
.hero-banner {
  position: relative;
  background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
  padding: 60rpx 32rpx 40rpx;
  overflow: hidden;

  .banner-content {
    position: relative;
    z-index: 2;
  }

  .banner-title {
    font-size: 48rpx;
    font-weight: 700;
    color: #FFFFFF;
    display: block;
    margin-bottom: 12rpx;
  }

  .banner-subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
    display: block;
  }

  .banner-decoration {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
}

// 风险提示
.notice-banner {
  margin: 24rpx 32rpx;
  padding: 20rpx 24rpx;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;

  .notice-text {
    flex: 1;
    font-size: 24rpx;
    color: #FF9800;
    line-height: 1.5;
  }
}

// Tab导航
.tab-nav {
  background: #FFFFFF;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.tab-scroll {
  width: 100%;
}

.tab-wrapper {
  display: flex;
  gap: 40rpx;
}

.tab-item {
  position: relative;
  padding: 24rpx 0;
  white-space: nowrap;

  .tab-text {
    font-size: 28rpx;
    color: #86909C;
    transition: all 0.3s;
  }

  &.active .tab-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #9C27B0;
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 6rpx;
    background: #9C27B0;
    border-radius: 3rpx;
  }
}

// 内容区域
.content-area {
  padding: 0 32rpx;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 推荐车型
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1D2129;
  }

  .view-all {
    font-size: 24rpx;
    color: #86909C;
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.model-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  position: relative;

  .model-img {
    width: 100%;
    height: 240rpx;
    background: #F0F0F0;
  }

  .hot-badge {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #FFFFFF;
    font-size: 20rpx;
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
  }

  .model-info {
    padding: 20rpx;
  }

  .model-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    display: block;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .model-price,
  .model-return {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .price-label,
  .return-label {
    font-size: 22rpx;
    color: #86909C;
  }

  .price-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #9C27B0;
  }

  .return-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #00B578;
  }
}

// 众筹项目
.project-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.project-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .project-img {
    width: 100%;
    height: 300rpx;
    background: #F0F0F0;
  }

  .project-info {
    padding: 24rpx;
  }

  .project-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1D2129;
    display: block;
    margin-bottom: 12rpx;
  }

  .project-meta {
    margin-bottom: 20rpx;

    .meta-item {
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

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        display: block;
        margin-bottom: 4rpx;
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
}

// 份额市场
.market-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.market-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .market-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .market-title {
      flex: 1;
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price-change {
      font-size: 24rpx;
      font-weight: 600;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;

      &.up {
        background: rgba(255, 107, 107, 0.1);
        color: #FF6B6B;
      }

      &.down {
        background: rgba(0, 181, 120, 0.1);
        color: #00B578;
      }
    }
  }

  .market-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-label {
        font-size: 24rpx;
        color: #86909C;
      }

      .info-value {
        font-size: 26rpx;
        font-weight: 600;
        color: #1D2129;

        &.primary {
          color: #9C27B0;
          font-size: 30rpx;
        }

        &.success {
          color: #00B578;
        }
      }
    }
  }
}

// 我的众筹
.login-prompt,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .prompt-icon,
  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }

  .prompt-text,
  .empty-text {
    font-size: 28rpx;
    color: #86909C;
    margin-bottom: 40rpx;
  }

  .login-btn,
  .browse-btn {
    background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
    color: #FFFFFF;
    font-size: 28rpx;
    padding: 0 60rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}

.my-shares {
  .stats-card {
    background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #FFFFFF;
        display: block;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .share-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .share-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

    .share-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .share-title {
        flex: 1;
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .share-status {
        font-size: 22rpx;
        color: #00B578;
        padding: 4rpx 12rpx;
        background: rgba(0, 181, 120, 0.1);
        border-radius: 8rpx;
      }
    }

    .share-info {
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .info-label {
          font-size: 24rpx;
          color: #86909C;
        }

        .info-value {
          font-size: 26rpx;
          font-weight: 600;
          color: #1D2129;

          &.success {
            color: #00B578;
          }
        }
      }
    }
  }
}
</style>
