<template>
  <view class="promotion-center-page">
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 推广数据卡片 -->
      <view class="stats-card">
        <view class="stats-header">
          <view class="header-left">
            <u-icon name="grid-fill" size="24" color="#FFFFFF"></u-icon>
            <text class="header-title">我的推广数据</text>
          </view>
          <u-icon name="reload" size="20" color="#FFFFFF" @click="handleRefresh"></u-icon>
        </view>

        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ totalShares }}</text>
            <text class="stat-label">总分享次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalViews }}</text>
            <text class="stat-label">总访问次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalConversions }}</text>
            <text class="stat-label">总转化次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ conversionRate }}%</text>
            <text class="stat-label">转化率</text>
          </view>
        </view>
      </view>

      <!-- 邀请统计卡片 -->
      <view class="invite-stats-card">
        <view class="card-header">
          <view class="header-left">
            <u-icon name="account-fill" size="24" color="#FF9F29"></u-icon>
            <text class="header-title">邀请统计</text>
          </view>
          <view class="header-right" @click="navigateTo('/pages/share/invite-records')">
            <text class="more-text">查看记录</text>
            <u-icon name="arrow-right" size="14" color="#909399"></u-icon>
          </view>
        </view>

        <view class="invite-grid">
          <view class="invite-item">
            <text class="invite-value">{{ inviteStats.totalInvites }}</text>
            <text class="invite-label">累计邀请</text>
          </view>
          <view class="invite-item">
            <text class="invite-value">{{ inviteStats.successfulRegistrations }}</text>
            <text class="invite-label">成功注册</text>
          </view>
          <view class="invite-item">
            <text class="invite-value">{{ inviteStats.completedFirstOrders }}</text>
            <text class="invite-label">完成首单</text>
          </view>
          <view class="invite-item">
            <text class="invite-value highlight">¥{{ inviteStats.totalRewards }}</text>
            <text class="invite-label">累计奖励</text>
          </view>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="quick-actions-card">
        <view class="card-header">
          <text class="header-title">快捷操作</text>
        </view>

        <view class="actions-grid">
          <view class="action-item" @click="handleInviteFriend">
            <view class="action-icon-box" style="background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);">
              <u-icon name="share" size="28" color="#FFFFFF"></u-icon>
            </view>
            <text class="action-name">邀请好友</text>
          </view>

          <view class="action-item" @click="handleGeneratePoster">
            <view class="action-icon-box" style="background: linear-gradient(135deg, #2979FF 0%, #42A5F5 100%);">
              <u-icon name="photo" size="28" color="#FFFFFF"></u-icon>
            </view>
            <text class="action-name">生成海报</text>
          </view>

          <view class="action-item" @click="navigateTo('/pages/share/achievements')">
            <view class="action-icon-box" style="background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);">
              <u-icon name="star" size="28" color="#FFFFFF"></u-icon>
            </view>
            <text class="action-name">我的成就</text>
          </view>

          <view class="action-item" @click="handleCopyInviteCode">
            <view class="action-icon-box" style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);">
              <u-icon name="file-text" size="28" color="#FFFFFF"></u-icon>
            </view>
            <text class="action-name">复制邀请码</text>
          </view>
        </view>
      </view>

      <!-- 我的邀请码 -->
      <view class="invite-code-card">
        <view class="card-header">
          <text class="header-title">我的邀请码</text>
        </view>

        <view class="invite-code-box">
          <text class="invite-code-text">{{ inviteCode }}</text>
          <u-button
            type="primary"
            size="small"
            @click="handleCopyInviteCode"
          >
            <u-icon name="copy" size="16" style="margin-right: 4rpx"></u-icon>
            复制
          </u-button>
        </view>

        <view class="invite-code-tip">
          <u-icon name="info-circle" size="14" color="#909399"></u-icon>
          <text>好友使用您的邀请码注册，双方都可获得奖励</text>
        </view>
      </view>

      <!-- 奖励规则 -->
      <view class="reward-rules-card">
        <view class="card-header">
          <view class="header-left">
            <u-icon name="gift-fill" size="24" color="#FF9F29"></u-icon>
            <text class="header-title">奖励规则</text>
          </view>
        </view>

        <view class="rules-list">
          <view
            v-for="rule in rewardRules"
            :key="rule.id"
            class="rule-item"
          >
            <text class="rule-icon">{{ rule.icon }}</text>
            <view class="rule-content">
              <text class="rule-title">{{ rule.title }}</text>
              <text class="rule-desc">{{ rule.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 推广记录 -->
      <view class="promotion-records-card">
        <view class="card-header">
          <text class="header-title">最近推广记录</text>
          <view class="header-right" @click="navigateTo('/pages/share/invite-records')">
            <text class="more-text">查看全部</text>
            <u-icon name="arrow-right" size="14" color="#909399"></u-icon>
          </view>
        </view>

        <view class="records-list">
          <view
            v-for="record in recentRecords"
            :key="record.id"
            class="record-item"
          >
            <u-avatar
              :src="record.avatar"
              size="50"
            />
            <view class="record-info">
              <view class="record-name">{{ record.username }}</view>
              <view class="record-time">{{ formatTime(record.registerTime) }}</view>
            </view>
            <view class="record-status">
              <u-tag
                :text="getStatusText(record.status)"
                :type="getStatusType(record.status)"
                size="mini"
              />
            </view>
          </view>

          <!-- 空状态 -->
          <u-empty
            v-if="recentRecords.length === 0"
            mode="list"
            text="暂无推广记录"
            :show="!loading"
          />
        </view>
      </view>
    </view>

    <!-- 邀请面板 -->
    <InviteSheet
      v-model:show="showInviteSheet"
      :invite-code="inviteCode"
      :stats="inviteStats"
      :generating="isGeneratingPoster"
      @copy-code="handleCopyInviteCode"
      @generate-poster="handleGeneratePoster"
      @share-to-friend="handleShareToFriend"
      @view-records="navigateTo('/pages/share/invite-records')"
    />

    <!-- 海报预览 -->
    <PosterPreview
      v-model:show="showPosterPopup"
      :poster-image="posterImage"
      @save="handleSavePoster"
    />

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <u-loading-icon mode="circle" size="50"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 隐藏的Canvas用于生成海报 -->
    <canvas
      id="poster-canvas"
      type="2d"
      style="position: fixed; left: -9999px; top: -9999px; width: 750px; height: 1334px;"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { InviteRecord, InviteStats } from '@/types/share'
import { ShareScene } from '@/types/share'
import { useInvite } from '@/composables/useShare'
import { useShareAchievement } from '@/composables/useShareAchievement'
import { shareApi } from '@/api/share'
import { shareRewardRules } from '@/config/share-config'
import { generatePoster, savePosterToAlbum } from '@/utils/poster'
import { logger } from '@/utils/logger'
import { requireLogin, isLoggedIn, buildRedirectUrl, getCurrentUser } from '@/utils/auth'
import InviteSheet from '@/components/share/InviteSheet.vue'
import PosterPreview from '@/components/share/PosterPreview.vue'

/**
 * 推广中心页面
 * @description 整合所有分享推广功能的中心页面
 */

// 登录状态管理
const pageReady = ref(false)
const redirectUrl = ref('/pages/profile/promotion-center')
let cachedRouteParams: Record<string, any> | null = null

// 状态
const loading = ref(false)
const recentRecords = ref<InviteRecord[]>([])
const showPosterPopup = ref(false)
const posterImage = ref('')
const isGeneratingPoster = ref(false)

// 使用邀请功能
const {
  inviteCode,
  showInviteSheet,
  openInviteSheet,
  generateInviteCode
} = useInvite(getCurrentUser()?.id || 'guest')

// 使用分享成就功能
const {
  stats,
  totalShares,
  totalViews,
  totalConversions,
  conversionRate,
  refresh: refreshStats
} = useShareAchievement()

// 邀请统计
const inviteStats = ref<InviteStats>({
  totalInvites: 0,
  successfulRegistrations: 0,
  completedFirstOrders: 0,
  totalRewards: 0
})

// 奖励规则
const rewardRules = computed(() => shareRewardRules)

/**
 * 加载邀请统计
 */
const loadInviteStats = async () => {
  try {
    const res = await shareApi.getInviteStats()
    inviteStats.value = res.data
  } catch (error) {
    logger.error('加载邀请统计失败', error)
  }
}

/**
 * 加载最近推广记录
 */
const loadRecentRecords = async () => {
  try {
    loading.value = true
    const res = await shareApi.getInviteRecords({
      page: 1,
      pageSize: 5
    })
    recentRecords.value = res.data
  } catch (error) {
    logger.error('加载推广记录失败', error)
  } finally {
    loading.value = false
  }
}

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  try {
    await Promise.all([
      refreshStats(),
      loadInviteStats(),
      loadRecentRecords()
    ])
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    logger.error('刷新失败', error)
  }
}

/**
 * 邀请好友
 */
const handleInviteFriend = () => {
  if (!inviteCode.value) {
    generateInviteCode()
  }
  openInviteSheet()
}

/**
 * 生成海报
 */
const handleGeneratePoster = async () => {
  try {
    isGeneratingPoster.value = true

    // 生成小程序码
    const qrCodeRes = await shareApi.generateMiniProgramCode({
      scene: inviteCode.value,
      page: '/pages/index/index',
      width: 200
    })

    // 生成海报配置
    const posterConfig = {
      scene: ShareScene.INVITE,
      businessId: getCurrentUser()?.id || 'guest',
      mainImage: 'https://picsum.photos/670/500?random=invite',
      title: '邀请好友，共享优惠',
      subtitle: '注册即送新人专享券',
      qrCode: qrCodeRes.data.url,
      inviteCode: inviteCode.value
    }

    // 生成海报
    const imagePath = await generatePoster(posterConfig)
    posterImage.value = imagePath

    // 显示海报预览
    showPosterPopup.value = true

    isGeneratingPoster.value = false
  } catch (error) {
    isGeneratingPoster.value = false
    logger.error('海报生成失败', error)
    uni.showToast({
      title: '海报生成失败',
      icon: 'none'
    })
  }
}

/**
 * 保存海报
 */
const handleSavePoster = async () => {
  try {
    await savePosterToAlbum(posterImage.value)
    showPosterPopup.value = false
  } catch (error) {
    logger.error('保存海报失败', error)
  }
}

/**
 * 分享给朋友
 */
const handleShareToFriend = () => {
  uni.showToast({
    title: '请点击右上角分享',
    icon: 'none',
    duration: 2000
  })
}

/**
 * 复制邀请码
 */
const handleCopyInviteCode = async () => {
  try {
    if (!inviteCode.value) {
      generateInviteCode()
    }

    await uni.setClipboardData({
      data: inviteCode.value
    })

    uni.showToast({
      title: '邀请码已复制',
      icon: 'success'
    })

    logger.info('邀请码已复制', { code: inviteCode.value })
  } catch (error) {
    logger.error('复制邀请码失败', error)
    uni.showToast({
      title: '复制失败',
      icon: 'none'
    })
  }
}

/**
 * 导航到指定页面
 */
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }

  // 超过7天显示日期
  return `${date.getMonth() + 1}-${date.getDate()}`
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  return status === 'registered' ? '已注册' : '已完成首单'
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  return status === 'registered' ? 'info' : 'success'
}

/**
 * 初始化页面数据
 */
const initPageData = () => {
  if (!inviteCode.value) {
    generateInviteCode()
  }
  loadInviteStats()
  loadRecentRecords()
}

/**
 * 页面初始化设置
 */
const setupPromotionCenterPage = (options: any) => {
  pageReady.value = true
  initPageData()
}

/**
 * 确保用户已登录
 */
const ensureAuth = (options: any) => {
  redirectUrl.value = buildRedirectUrl('/pages/profile/promotion-center', options || {})
  if (isLoggedIn()) {
    return true
  }
  return requireLogin(redirectUrl.value)
}

/**
 * 页面加载时检查登录状态
 */
onLoad((options: any) => {
  cachedRouteParams = options || {}
  pageReady.value = false
  if (!ensureAuth(cachedRouteParams)) {
    return
  }
  setupPromotionCenterPage(cachedRouteParams)
})

/**
 * 页面显示时检查登录状态（从登录页返回时）
 */
onShow(() => {
  if (!pageReady.value && cachedRouteParams && isLoggedIn()) {
    setupPromotionCenterPage(cachedRouteParams)
  } else if (pageReady.value && isLoggedIn()) {
    // 页面已初始化且已登录，刷新数据
    handleRefresh()
  }
})

/**
 * 初始化（保留用于其他初始化逻辑）
 */
onMounted(() => {
  // 其他初始化逻辑可以放在这里
})
</script>

<style lang="scss" scoped>
.promotion-center-page {
  min-height: 100vh;
  background: $uni-bg-color;
}

.page-content {
  padding: $uni-spacing-lg;
}

// 统计卡片
.stats-card {
  background: $uni-color-primary-gradient;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-glow;

  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .header-left {
      display: flex;
      align-items: center;
      gap: $uni-spacing-md;

      .header-title {
        font-size: $uni-font-size-lg;
        font-weight: bold;
        color: $uni-text-color-inverse;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $uni-spacing-xl;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: $uni-radius-md;
      padding: $uni-spacing-lg;

      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $uni-text-color-inverse;
        margin-bottom: $uni-spacing-sm;
      }

      .stat-label {
        font-size: $uni-font-size-xs;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

// 邀请统计卡片
.invite-stats-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .header-left {
      display: flex;
      align-items: center;
      gap: $uni-spacing-md;

      .header-title {
        font-size: 30rpx;
        font-weight: bold;
        color: $uni-text-color;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 4rpx;
      transition: all 0.2s ease;

      &:active {
        opacity: 0.7;
      }

      .more-text {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-placeholder;
      }
    }
  }

  .invite-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $uni-spacing-xl;

    .invite-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .invite-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $uni-text-color;
        margin-bottom: $uni-spacing-sm;

        &.highlight {
          color: $uni-color-primary;
        }
      }

      .invite-label {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-placeholder;
      }
    }
  }
}

// 快捷操作卡片
.quick-actions-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .card-header {
    margin-bottom: $uni-spacing-xl;

    .header-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $uni-text-color;
    }
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $uni-spacing-lg;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $uni-spacing-md;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
      }

      .action-icon-box {
        width: 100rpx;
        height: 100rpx;
        border-radius: $uni-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: $uni-shadow-card;
      }

      .action-name {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-secondary;
      }
    }
  }
}

// 邀请码卡片
.invite-code-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .card-header {
    margin-bottom: $uni-spacing-lg;

    .header-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $uni-text-color;
    }
  }

  .invite-code-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $uni-spacing-xl $uni-spacing-xl;
    background: $uni-color-primary-gradient;
    border-radius: $uni-radius-lg;
    margin-bottom: $uni-spacing-lg;
    box-shadow: $uni-shadow-glow;

    .invite-code-text {
      font-size: 40rpx;
      font-weight: bold;
      color: $uni-text-color-inverse;
      letter-spacing: 4rpx;
    }
  }

  .invite-code-tip {
    display: flex;
    align-items: center;
    gap: $uni-spacing-sm;
    font-size: $uni-font-size-xs;
    color: $uni-text-color-placeholder;
  }
}

// 奖励规则卡片
.reward-rules-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .card-header {
    margin-bottom: $uni-spacing-lg;

    .header-left {
      display: flex;
      align-items: center;
      gap: $uni-spacing-md;

      .header-title {
        font-size: 30rpx;
        font-weight: bold;
        color: $uni-text-color;
      }
    }
  }

  .rules-list {
    .rule-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: $uni-spacing-lg;

      &:last-child {
        margin-bottom: 0;
      }

      .rule-icon {
        font-size: $uni-font-size-lg;
        margin-right: $uni-spacing-lg;
        flex-shrink: 0;
      }

      .rule-content {
        flex: 1;
        display: flex;
        flex-direction: column;

        .rule-title {
          font-size: $uni-font-size-base;
          color: $uni-text-color;
          margin-bottom: 4rpx;
        }

        .rule-desc {
          font-size: $uni-font-size-xs;
          color: $uni-text-color-placeholder;
        }
      }
    }
  }
}

// 推广记录卡片
.promotion-records-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-lg;

    .header-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $uni-text-color;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 4rpx;
      transition: all 0.2s ease;

      &:active {
        opacity: 0.7;
      }

      .more-text {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-placeholder;
      }
    }
  }

  .records-list {
    .record-item {
      display: flex;
      align-items: center;
      padding: $uni-spacing-lg 0;
      border-bottom: 1rpx solid $uni-border-color-light;
      transition: all 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        opacity: 0.7;
      }

      .record-info {
        flex: 1;
        margin-left: $uni-spacing-lg;

        .record-name {
          font-size: $uni-font-size-base;
          color: $uni-text-color;
          margin-bottom: $uni-spacing-sm;
        }

        .record-time {
          font-size: $uni-font-size-xs;
          color: $uni-text-color-placeholder;
        }
      }

      .record-status {
        flex-shrink: 0;
      }
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;

  .loading-text {
    margin-top: $uni-spacing-lg;
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
  }
}
</style>
