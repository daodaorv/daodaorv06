<template>
  <view class="share-achievements-page">
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 统计卡片 -->
      <view class="stats-card">
        <view class="stats-header">
          <text class="stats-title">我的分享数据</text>
          <u-icon name="reload" size="20" @click="handleRefresh"></u-icon>
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

      <!-- 成就完成度 -->
      <view class="completion-card">
        <view class="completion-header">
          <text class="completion-title">成就完成度</text>
          <text class="completion-rate">{{ completionRate }}%</text>
        </view>
        <u-line-progress
          :percentage="completionRate"
          :show-percent="false"
          active-color="#FF9F29"
          height="12"
        />
        <view class="completion-info">
          <text>已解锁 {{ unlockedAchievements.length }} / {{ achievements.length }} 个成就</text>
        </view>
      </view>

      <!-- 下一个待解锁成就 -->
      <view v-if="getNextAchievement" class="next-achievement-card">
        <view class="next-achievement-header">
          <u-icon name="star" size="20" color="#FF9F29"></u-icon>
          <text class="next-achievement-title">下一个成就</text>
        </view>
        <view class="achievement-item">
          <text class="achievement-icon">{{ getNextAchievement.icon }}</text>
          <view class="achievement-content">
            <view class="achievement-name">{{ getNextAchievement.name }}</view>
            <view class="achievement-desc">{{ getNextAchievement.description }}</view>
            <view class="achievement-progress">
              <u-line-progress
                :percentage="getProgressPercentage(getNextAchievement)"
                :show-percent="false"
                :active-color="getProgressColor(getNextAchievement)"
                height="8"
              />
              <text class="progress-text">{{ getProgressText(getNextAchievement) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 成就列表 -->
      <view class="achievements-section">
        <!-- 已解锁成就 -->
        <view v-if="unlockedAchievements.length > 0" class="achievement-group">
          <view class="group-header">
            <text class="group-title">已解锁成就</text>
            <u-badge :value="unlockedAchievements.length" type="success"></u-badge>
          </view>
          <view class="achievement-list">
            <view
              v-for="achievement in unlockedAchievements"
              :key="achievement.id"
              class="achievement-item unlocked"
            >
              <text class="achievement-icon">{{ achievement.icon }}</text>
              <view class="achievement-content">
                <view class="achievement-name">
                  {{ achievement.name }}
                  <u-badge dot type="success"></u-badge>
                </view>
                <view class="achievement-desc">{{ achievement.description }}</view>
                <view class="achievement-time">
                  解锁时间：{{ formatTime(achievement.unlockTime) }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 未解锁成就 -->
        <view v-if="lockedAchievements.length > 0" class="achievement-group">
          <view class="group-header">
            <text class="group-title">未解锁成就</text>
            <u-badge :value="lockedAchievements.length" type="info"></u-badge>
          </view>
          <view class="achievement-list">
            <view
              v-for="achievement in lockedAchievements"
              :key="achievement.id"
              class="achievement-item locked"
            >
              <text class="achievement-icon grayscale">{{ achievement.icon }}</text>
              <view class="achievement-content">
                <view class="achievement-name">{{ achievement.name }}</view>
                <view class="achievement-desc">{{ achievement.description }}</view>
                <view class="achievement-progress">
                  <u-line-progress
                    :percentage="getProgressPercentage(achievement)"
                    :show-percent="false"
                    :active-color="getProgressColor(achievement)"
                    height="8"
                  />
                  <text class="progress-text">{{ getProgressText(achievement) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <u-empty
        v-if="!loading && achievements.length === 0"
        mode="data"
        text="暂无成就数据"
      />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <u-loading-icon mode="circle" size="50"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useShareAchievement } from '@/composables/useShareAchievement'
import { logger } from '@/utils/logger'

/**
 * 分享成就页面
 * @description 展示用户的分享成就、统计数据和进度
 */

// 使用分享成就组合式函数
const {
  achievements,
  stats,
  loading,
  unlockedAchievements,
  lockedAchievements,
  completionRate,
  totalShares,
  totalViews,
  totalConversions,
  conversionRate,
  getNextAchievement,
  refresh,
  getProgressPercentage,
  getProgressText,
  getProgressColor
} = useShareAchievement()

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  try {
    await refresh()
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    logger.error('刷新失败', error)
  }
}

/**
 * 格式化时间
 */
const formatTime = (time?: string) => {
  if (!time) return '-'
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.share-achievements-page {
  min-height: 100vh;
  background: $uni-bg-color;
}

.page-content {
  padding: $uni-spacing-xl;
}

.stats-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;

  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .stats-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
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

      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $uni-color-primary;
        margin-bottom: $uni-spacing-md;
      }

      .stat-label {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
      }
    }
  }
}

.completion-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;

  .completion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .completion-title {
      font-size: $uni-font-size-base;
      font-weight: bold;
      color: $uni-text-color;
    }

    .completion-rate {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-color-primary;
    }
  }

  .completion-info {
    margin-top: $uni-spacing-xl;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
    text-align: center;
  }
}

.next-achievement-card {
  background: $uni-color-primary-gradient;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-glow;

  .next-achievement-header {
    display: flex;
    align-items: center;
    margin-bottom: $uni-spacing-xl;

    .next-achievement-title {
      margin-left: $uni-spacing-md;
      font-size: $uni-font-size-base;
      font-weight: bold;
      color: $uni-text-color-inverse;
    }
  }

  .achievement-item {
    background: rgba(255, 255, 255, 0.2);
    border-radius: $uni-radius-lg;
    padding: $uni-spacing-xl;
  }
}

.achievements-section {
  .achievement-group {
    margin-bottom: $uni-spacing-xl;

    .group-header {
      display: flex;
      align-items: center;
      padding: $uni-spacing-xl 0;

      .group-title {
        font-size: $uni-font-size-base;
        font-weight: bold;
        color: $uni-text-color;
        margin-right: $uni-spacing-lg;
      }
    }

    .achievement-list {
      background: $uni-bg-color-card;
      border-radius: $uni-radius-lg;
      overflow: hidden;
      box-shadow: $uni-shadow-card;

      .achievement-item {
        display: flex;
        align-items: flex-start;
        padding: $uni-spacing-xl;
        border-bottom: 1rpx solid $uni-bg-color-grey;
        transition: all 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        .achievement-icon {
          font-size: 60rpx;
          margin-right: $uni-spacing-xl;
          flex-shrink: 0;

          &.grayscale {
            filter: grayscale(100%);
            opacity: 0.5;
          }
        }

        .achievement-content {
          flex: 1;

          .achievement-name {
            font-size: $uni-font-size-base;
            font-weight: bold;
            color: $uni-text-color;
            margin-bottom: $uni-spacing-md;
            display: flex;
            align-items: center;
          }

          .achievement-desc {
            font-size: $uni-font-size-sm;
            color: $uni-text-color-placeholder;
            margin-bottom: $uni-spacing-lg;
          }

          .achievement-time {
            font-size: $uni-font-size-xs;
            color: $uni-text-color-placeholder;
          }

          .achievement-progress {
            display: flex;
            align-items: center;
            gap: $uni-spacing-xl;

            .progress-text {
              font-size: $uni-font-size-sm;
              color: $uni-text-color-secondary;
              white-space: nowrap;
            }
          }
        }

        &.locked {
          opacity: 0.6;
        }
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
    margin-top: $uni-spacing-xl;
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
  }
}
</style>
