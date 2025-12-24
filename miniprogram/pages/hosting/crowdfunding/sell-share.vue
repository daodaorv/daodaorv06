<template>
  <view class="sell-share-page">
    <!-- 项目信息 -->
    <view class="project-section">
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

    <!-- 持有信息 -->
    <view class="holding-section">
      <view class="section-title">我的持有</view>
      <view class="holding-grid">
        <view class="holding-item">
          <text class="holding-label">持有份额</text>
          <text class="holding-value">{{ project.myShares }}份</text>
        </view>
        <view class="holding-item">
          <text class="holding-label">持有时长</text>
          <text class="holding-value">{{ holdingDays }}天</text>
        </view>
        <view class="holding-item">
          <text class="holding-label">累计收益</text>
          <text class="holding-value highlight">¥{{ project.myIncome.toLocaleString() }}</text>
        </view>
        <view class="holding-item">
          <text class="holding-label">份额比例</text>
          <text class="holding-value">{{ ((project.myShares / project.totalShares) * 100).toFixed(2) }}%</text>
        </view>
      </view>
    </view>

    <!-- 出售设置 -->
    <view class="sell-section">
      <view class="section-title">出售设置</view>

      <view class="form-item">
        <text class="form-label">出售份额数</text>
        <u-number-box
          v-model="sellShares"
          :min="1"
          :max="project.myShares"
          @change="calculateTotal"
        ></u-number-box>
      </view>

      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">单份价格（元）</text>
          <text class="reference-text">参考价：¥{{ referencePrice.toLocaleString() }}</text>
        </view>
        <u-input
          v-model="pricePerShare"
          type="number"
          placeholder="请输入单份价格"
          @input="calculateTotal"
        ></u-input>
      </view>

      <view class="price-comparison">
        <view class="comparison-item">
          <text class="comparison-label">参考价格</text>
          <text class="comparison-value">¥{{ referencePrice.toLocaleString() }}</text>
        </view>
        <view class="comparison-item">
          <text class="comparison-label">您的定价</text>
          <text class="comparison-value" :class="priceChangeClass">
            ¥{{ Number(pricePerShare || 0).toLocaleString() }}
            <text v-if="priceChange !== 0" class="change-text">
              ({{ priceChange > 0 ? '+' : '' }}{{ priceChange }}%)
            </text>
          </text>
        </view>
      </view>

      <view class="total-card">
        <view class="total-row">
          <text class="total-label">预计收入</text>
          <view class="total-value">
            <text class="currency">¥</text>
            <text class="amount">{{ totalAmount.toLocaleString() }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 定价建议 -->
    <view class="suggestion-section">
      <view class="suggestion-header">
        <u-icon name="lightbulb" size="18" color="#2196F3"></u-icon>
        <text class="suggestion-title">定价建议</text>
      </view>
      <view class="suggestion-content">
        <text class="suggestion-item">• 参考价格基于当前收益率和市场行情计算</text>
        <text class="suggestion-item">• 定价过高可能导致长时间无人购买</text>
        <text class="suggestion-item">• 定价过低可能造成您的损失</text>
        <text class="suggestion-item">• 建议在参考价±10%范围内定价</text>
      </view>
    </view>

    <!-- 交易说明 -->
    <view class="notice-section">
      <view class="notice-header">
        <u-icon name="info-circle" size="18" color="#2196F3"></u-icon>
        <text class="notice-title">交易说明</text>
      </view>
      <view class="notice-content">
        <text class="notice-item">• 份额挂出后将进入交易市场</text>
        <text class="notice-item">• 挂单期间份额将被锁定，无法再次出售</text>
        <text class="notice-item">• 成交后资金将自动转入您的账户</text>
        <text class="notice-item">• 您可以随时取消挂单</text>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="risk-section">
      <view class="risk-header">
        <u-icon name="warning" size="18" color="#FF9800"></u-icon>
        <text class="risk-title">风险提示</text>
      </view>
      <view class="risk-content">
        <text class="risk-item">• 份额出售后，您将失去该部分的收益权</text>
        <text class="risk-item">• 市场价格波动可能影响成交速度</text>
        <text class="risk-item">• 请谨慎设置价格，避免损失</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">预计收入</text>
        <view class="total-amount">
          <text class="currency">¥</text>
          <text class="amount">{{ totalAmount.toLocaleString() }}</text>
        </view>
      </view>
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确认出售
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCrowdfundingProjectDetail, listShareForSale } from '@/api/crowdfunding'
import type { CrowdfundingProject } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const projectId = ref('')
const project = ref<CrowdfundingProject>({
  id: '',
  title: '',
  model: {
    id: '',
    name: '',
    brand: '',
    thumbnail: ''
  },
  initiator: {
    id: '',
    name: '',
    avatar: ''
  },
  vehiclePrice: 0,
  totalShares: 0,
  pricePerShare: 0,
  soldShares: 0,
  remainingShares: 0,
  progress: 0,
  participantCount: 0,
  status: 'hosting' as any,
  statusText: '',
  startTime: '',
  endTime: '',
  remainingDays: 0,
  estimatedMonthlyIncome: 0,
  estimatedAnnualReturn: 0,
  description: '',
  images: [],
  agreementUrl: '',
  isParticipated: true,
  myShares: 0,
  myIncome: 0,
  createdAt: '',
  updatedAt: ''
})

const sellShares = ref(1)
const pricePerShare = ref('')
const holdingDays = ref(0)

// 参考价格（基于当前收益率计算）
const referencePrice = computed(() => {
  // 简化计算：原价 + 累计收益 / 份额
  const basePrice = project.value.pricePerShare
  const incomePerShare = project.value.myIncome / project.value.myShares
  return Math.round(basePrice + incomePerShare)
})

// 价格变化百分比
const priceChange = computed(() => {
  const price = Number(pricePerShare.value)
  if (!price || !referencePrice.value) return 0
  return Math.round(((price - referencePrice.value) / referencePrice.value) * 100)
})

// 价格变化样式类
const priceChangeClass = computed(() => {
  if (priceChange.value > 0) return 'price-up'
  if (priceChange.value < 0) return 'price-down'
  return ''
})

// 总金额
const totalAmount = computed(() => {
  return sellShares.value * Number(pricePerShare.value || 0)
})

// 是否可以提交
const canSubmit = computed(() => {
  return (
    sellShares.value > 0 &&
    sellShares.value <= project.value.myShares &&
    Number(pricePerShare.value) > 0
  )
})

// 页面加载
onLoad((options: any) => {
  if (options.projectId) {
    projectId.value = options.projectId
    loadProjectDetail()
  }
})

// 加载项目详情
const loadProjectDetail = async () => {
  try {
    const res = await getCrowdfundingProjectDetail(projectId.value)
    if (res.code === 0) {
      project.value = res.data
      // 设置默认出售份额为1
      sellShares.value = 1
      // 设置默认价格为参考价
      pricePerShare.value = referencePrice.value.toString()
      // 计算持有天数（模拟）
      holdingDays.value = Math.floor(Math.random() * 180) + 30
    }
  } catch (error) {
    logger.error('加载项目详情失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 计算总额
const calculateTotal = () => {
  // 触发计算
}

// 提交出售
const handleSubmit = async () => {
  if (!canSubmit.value) {
    return
  }

  // 价格偏离警告
  if (Math.abs(priceChange.value) > 20) {
    const confirmRes = await new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '价格提示',
        content: `您的定价${priceChange.value > 0 ? '高于' : '低于'}参考价${Math.abs(priceChange.value)}%，确认继续？`,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })

    if (!confirmRes) {
      return
    }
  }

  try {
    uni.showLoading({
      title: '提交中...'
    })

    // 调用挂单API
    const res = await listShareForSale({
      projectId: projectId.value,
      shares: sellShares.value,
      pricePerShare: Number(pricePerShare.value)
    })

    uni.hideLoading()

    if (res.code === 0) {
      uni.showToast({
        title: '挂单成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    uni.hideLoading()
    logger.error('挂单失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.sell-share-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 160rpx;
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
      .status-badge {
        display: inline-block;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-size: 20rpx;
        font-weight: 600;

        &.status-hosting {
          background: rgba(33, 150, 243, 0.1);
          color: #2196F3;
        }
      }
    }
  }
}

// 持有信息
.holding-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .holding-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .holding-item {
      background: #F8F9FC;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;

      .holding-label {
        font-size: 24rpx;
        color: #86909C;
        display: block;
        margin-bottom: 12rpx;
      }

      .holding-value {
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

// 出售设置
.sell-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .form-item {
    margin-bottom: 24rpx;

    .form-label {
      font-size: 26rpx;
      color: #4E5969;
      display: block;
      margin-bottom: 16rpx;
    }

    .form-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .form-label {
        margin-bottom: 0;
      }

      .reference-text {
        font-size: 24rpx;
        color: #9C27B0;
      }
    }
  }

  .price-comparison {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;

    .comparison-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .comparison-label {
        font-size: 26rpx;
        color: #86909C;
      }

      .comparison-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;

        &.price-up {
          color: #FF6B6B;
        }

        &.price-down {
          color: #00B578;
        }

        .change-text {
          font-size: 22rpx;
          margin-left: 8rpx;
        }
      }
    }
  }

  .total-card {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%);
    border-radius: 12rpx;
    padding: 24rpx;

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .total-label {
        font-size: 28rpx;
        color: #86909C;
      }

      .total-value {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .currency {
          font-size: 28rpx;
          color: #9C27B0;
        }

        .amount {
          font-size: 40rpx;
          font-weight: 700;
          color: #9C27B0;
        }
      }
    }
  }
}

// 定价建议
.suggestion-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .suggestion-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .suggestion-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #2196F3;
    }
  }

  .suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .suggestion-item {
      font-size: 24rpx;
      color: #86909C;
      line-height: 1.6;
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
  align-items: center;
  gap: 24rpx;
  z-index: 100;

  .total-info {
    flex: 1;

    .total-label {
      font-size: 24rpx;
      color: #86909C;
      display: block;
      margin-bottom: 4rpx;
    }

    .total-amount {
      display: flex;
      align-items: baseline;
      gap: 4rpx;

      .currency {
        font-size: 24rpx;
        color: #9C27B0;
      }

      .amount {
        font-size: 36rpx;
        font-weight: 700;
        color: #9C27B0;
      }
    }
  }

  .submit-btn {
    width: 240rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
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

    &.disabled {
      opacity: 0.5;
    }
  }
}
</style>
