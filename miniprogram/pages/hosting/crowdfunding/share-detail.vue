<template>
  <view class="share-detail-page">
    <!-- 项目信息 -->
    <view class="project-section">
      <image :src="share.project.model.thumbnail" class="project-img" mode="aspectFill"></image>
      <view class="project-info">
        <text class="project-title">{{ share.project.title }}</text>
        <view class="project-meta">
          <text class="meta-text">{{ share.project.model.brand }} {{ share.project.model.name }}</text>
        </view>
        <view class="project-status">
          <view class="status-badge" :class="'status-' + share.project.status">
            {{ share.project.statusText }}
          </view>
          <text class="progress-text">众筹进度 {{ share.project.progress }}%</text>
        </view>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="price-section">
      <view class="price-header">
        <text class="section-title">价格信息</text>
        <view v-if="share.priceChange !== 0" class="price-change" :class="share.priceChange > 0 ? 'up' : 'down'">
          <u-icon :name="share.priceChange > 0 ? 'arrow-up' : 'arrow-down'" size="14"></u-icon>
          <text>{{ share.priceChange > 0 ? '高于' : '低于' }}参考价 {{ Math.abs(share.priceChange) }}%</text>
        </view>
      </view>

      <view class="price-card">
        <view class="price-row main">
          <text class="price-label">单份价格</text>
          <view class="price-value">
            <text class="currency">¥</text>
            <text class="amount">{{ share.pricePerShare.toLocaleString() }}</text>
          </view>
        </view>
        <view class="price-row">
          <text class="price-label">参考价格</text>
          <text class="price-value-text">¥{{ share.referencePrice.toLocaleString() }}</text>
        </view>
        <view class="price-row">
          <text class="price-label">出售份额</text>
          <text class="price-value-text">{{ share.shares }}份</text>
        </view>
        <view class="price-row total">
          <text class="price-label">总价</text>
          <view class="price-value">
            <text class="currency">¥</text>
            <text class="amount">{{ (share.shares * share.pricePerShare).toLocaleString() }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 份额详情 -->
    <view class="share-info-section">
      <view class="section-title">份额详情</view>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">持有时长</text>
          <text class="info-value">{{ share.holdingDays }}天</text>
        </view>
        <view class="info-item">
          <text class="info-label">累计收益</text>
          <text class="info-value highlight">¥{{ share.totalIncome.toLocaleString() }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">预估年化</text>
          <text class="info-value">{{ share.project.estimatedAnnualReturn }}%</text>
        </view>
        <view class="info-item">
          <text class="info-label">份额比例</text>
          <text class="info-value">{{ ((share.shares / share.project.totalShares) * 100).toFixed(2) }}%</text>
        </view>
      </view>
    </view>

    <!-- 收益预估 -->
    <view class="income-section">
      <view class="section-title">购买后收益预估</view>
      <view class="income-grid">
        <view class="income-item">
          <text class="income-label">预估月收益</text>
          <text class="income-value">¥{{ estimatedMonthlyIncome.toLocaleString() }}</text>
        </view>
        <view class="income-item">
          <text class="income-label">预估年收益</text>
          <text class="income-value highlight">¥{{ estimatedAnnualIncome.toLocaleString() }}</text>
        </view>
      </view>
      <view class="income-tip">
        <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
        <text>以上为基于当前收益率的预估，实际收益可能存在差异</text>
      </view>
    </view>

    <!-- 卖家信息 -->
    <view class="seller-section">
      <view class="section-title">卖家信息</view>
      <view class="seller-card">
        <image :src="share.seller.avatar" class="seller-avatar" mode="aspectFill"></image>
        <view class="seller-info">
          <text class="seller-name">{{ share.seller.name }}</text>
          <view class="seller-meta">
            <view class="meta-item">
              <u-icon name="clock" size="14" color="#86909C"></u-icon>
              <text>{{ formatTime(share.listedAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 交易说明 -->
    <view class="notice-section">
      <view class="notice-header">
        <u-icon name="info-circle" size="18" color="#2196F3"></u-icon>
        <text class="notice-title">交易说明</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">• 购买后份额权益和收益将立即转移</text>
        <text class="notice-item">• 交易资金由平台监管，确保安全</text>
        <text class="notice-item">• 份额转移后，您将成为该项目的参与者</text>
        <text class="notice-item">• 后续收益将按您的份额比例自动分配</text>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="risk-section">
      <view class="risk-header">
        <u-icon name="warning" size="18" color="#FF9800"></u-icon>
        <text class="risk-title">风险提示</text>
      </view>
      <view class="risk-content">
        <text class="risk-item">• 份额价格由卖家自主定价，可能高于或低于参考价</text>
        <text class="risk-item">• 实际收益受市场环境影响，可能与预估存在差异</text>
        <text class="risk-item">• 投资有风险，购买需谨慎</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="contact-btn" @click="contactSeller">
        <u-icon name="chat" size="24" color="#2979FF"></u-icon>
        <text>联系卖家</text>
      </view>
      <button class="buy-btn" @click="handleBuy">
        立即购买
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getShareDetail, buyShare } from '@/api/crowdfunding'
import type { ShareTransaction } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const shareId = ref('')
const share = ref<ShareTransaction>({
  id: '',
  projectId: '',
  project: {
    id: '',
    title: '',
    model: {
      id: '',
      name: '',
      brand: '',
      thumbnail: ''
    },
    totalShares: 0,
    progress: 0,
    status: 'funding' as any,
    statusText: '',
    estimatedAnnualReturn: 0
  },
  seller: {
    id: '',
    name: '',
    avatar: ''
  },
  shares: 0,
  pricePerShare: 0,
  referencePrice: 0,
  priceChange: 0,
  holdingDays: 0,
  totalIncome: 0,
  status: 'listed' as any,
  listedAt: '',
  createdAt: '',
  updatedAt: ''
})

// 计算预估月收益
const estimatedMonthlyIncome = computed(() => {
  const ratio = share.value.shares / share.value.project.totalShares
  const monthlyIncome = (share.value.pricePerShare * share.value.shares * share.value.project.estimatedAnnualReturn / 100) / 12
  return Math.round(monthlyIncome)
})

// 计算预估年收益
const estimatedAnnualIncome = computed(() => {
  return estimatedMonthlyIncome.value * 12
})

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    shareId.value = options.id
    loadShareDetail()
  }
})

// 加载份额详情
const loadShareDetail = async () => {
  try {
    const res = await getShareDetail(shareId.value)
    if (res.code === 0) {
      share.value = res.data
    }
  } catch (error) {
    logger.error('加载份额详情失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 联系卖家
const contactSeller = () => {
  uni.showToast({
    title: '联系卖家功能开发中',
    icon: 'none'
  })
}

// 购买份额
const handleBuy = async () => {
  try {
    // 确认购买
    const confirmRes = await new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '确认购买',
        content: `确认以 ¥${(share.value.shares * share.value.pricePerShare).toLocaleString()} 购买 ${share.value.shares} 份额？`,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })

    if (!confirmRes) {
      return
    }

    uni.showLoading({
      title: '处理中...'
    })

    // 调用购买API
    const res = await buyShare(shareId.value, 'wechat')

    uni.hideLoading()

    if (res.code === 0) {
      // 调起支付
      const paymentData = res.data
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType,
        paySign: paymentData.paySign,
        success: () => {
          uni.showToast({
            title: '购买成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        },
        fail: (error) => {
          logger.error('支付失败', error)
          uni.showToast({
            title: '支付失败',
            icon: 'none'
          })
        }
      })
    }
  } catch (error) {
    uni.hideLoading()
    logger.error('购买份额失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.share-detail-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 120rpx;
}

// 项目信息
.project-section {
  background: #FFFFFF;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  gap: 20rpx;

  .project-img {
    width: 160rpx;
    height: 120rpx;
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
      display: flex;
      align-items: center;
      gap: 16rpx;

      .status-badge {
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-size: 20rpx;
        font-weight: 600;

        &.status-funding {
          background: rgba(41, 121, 255, 0.1);
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

      .progress-text {
        font-size: 22rpx;
        color: #86909C;
      }
    }
  }
}

// 价格信息
.price-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .price-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }

    .price-change {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 6rpx 12rpx;
      border-radius: 8rpx;
      font-size: 22rpx;
      font-weight: 600;

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

  .price-card {
    background: linear-gradient(135deg, rgba(41, 121, 255, 0.05) 0%, rgba(0, 181, 120, 0.05) 100%);
    border-radius: 16rpx;
    padding: 24rpx;

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

      &:last-child {
        border-bottom: none;
      }

      .price-label {
        font-size: 26rpx;
        color: #86909C;
      }

      .price-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .currency {
          font-size: 24rpx;
          color: #2979FF;
        }

        .amount {
          font-size: 32rpx;
          font-weight: 700;
          color: #2979FF;
        }
      }

      .price-value-text {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }

      &.main {
        padding: 20rpx 0;
        margin-bottom: 8rpx;

        .price-value .amount {
          font-size: 48rpx;
        }
      }

      &.total {
        padding-top: 20rpx;
        margin-top: 8rpx;
        border-top: 1rpx solid rgba(0, 0, 0, 0.1);
        border-bottom: none;

        .price-label {
          font-size: 28rpx;
          color: #1D2129;
          font-weight: 600;
        }

        .price-value .amount {
          font-size: 40rpx;
        }
      }
    }
  }
}

// 份额详情
.share-info-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .info-item {
      background: #F8F9FC;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;

      .info-label {
        font-size: 24rpx;
        color: #86909C;
        display: block;
        margin-bottom: 12rpx;
      }

      .info-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #1D2129;

        &.highlight {
          color: #00B578;
        }
      }
    }
  }
}

// 收益预估
.income-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .income-grid {
    display: flex;
    gap: 24rpx;
    margin-bottom: 16rpx;

    .income-item {
      flex: 1;
      background: #F8F9FC;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;

      .income-label {
        font-size: 24rpx;
        color: #86909C;
        display: block;
        margin-bottom: 12rpx;
      }

      .income-value {
        font-size: 32rpx;
        font-weight: 700;
        color: #1D2129;

        &.highlight {
          color: #00B578;
          font-size: 40rpx;
        }
      }
    }
  }

  .income-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 12rpx;

    text {
      flex: 1;
      font-size: 22rpx;
      color: #2196F3;
      line-height: 1.6;
    }
  }
}

// 卖家信息
.seller-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .seller-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx;
    background: #F8F9FC;
    border-radius: 12rpx;

    .seller-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #E5E6EB;
    }

    .seller-info {
      flex: 1;

      .seller-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
        display: block;
        margin-bottom: 8rpx;
      }

      .seller-meta {
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;
          font-size: 24rpx;
          color: #86909C;
        }
      }
    }
  }
}

// 交易说明
.notice-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .notice-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .notice-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #2196F3;
    }
  }

  .notice-content {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .notice-item {
      font-size: 24rpx;
      color: #86909C;
      line-height: 1.6;
    }
  }
}

// 风险提示
.risk-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .risk-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .risk-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FF9800;
    }
  }

  .risk-content {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .risk-item {
      font-size: 24rpx;
      color: #86909C;
      line-height: 1.6;
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 20rpx;
  z-index: 100;

  .contact-btn {
    width: 88rpx;
    height: 88rpx;
    background: rgba(41, 121, 255, 0.1);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;

    text {
      font-size: 20rpx;
      color: #2979FF;
    }
  }

  .buy-btn {
    flex: 1;
    height: 88rpx;
    background: linear-gradient(135deg, #2979FF 0%, #00B578 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      border: none;
    }
  }
}
</style>
