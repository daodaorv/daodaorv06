<template>
  <view class="income-detail-page">
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

    <!-- 收益统计 -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ project.myShares }}</text>
          <text class="stat-label">持有份额</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value highlight">¥{{ totalIncome.toLocaleString() }}</text>
          <text class="stat-label">累计收益</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">¥{{ availableIncome.toLocaleString() }}</text>
          <text class="stat-label">可提现</text>
        </view>
      </view>

      <button v-if="availableIncome >= 100" class="withdraw-btn" @click="handleWithdraw">
        提现
      </button>
      <view v-else class="withdraw-tip">
        <u-icon name="info-circle" size="14" color="#FF9800"></u-icon>
        <text>满100元可提现</text>
      </view>
    </view>

    <!-- 收益明细 -->
    <view class="income-list-section">
      <view class="section-header">
        <text class="section-title">收益明细</text>
        <view class="filter-btn" @click="showFilterPopup = true">
          <text class="filter-text">{{ currentFilter === 'all' ? '全部' : currentFilter === 'income' ? '收入' : '提现' }}</text>
          <u-icon name="arrow-down" size="14"></u-icon>
        </view>
      </view>

      <view class="income-list">
        <view
          v-for="record in incomeRecords"
          :key="record.id"
          class="income-item"
        >
          <view class="income-info">
            <text class="income-title">{{ record.title }}</text>
            <text class="income-time">{{ formatTime(record.createdAt) }}</text>
          </view>
          <view class="income-amount" :class="record.type === 'income' ? 'income-type' : 'withdraw-type'">
            <text class="amount-text">{{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount.toLocaleString() }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <u-loading-icon mode="circle"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && incomeRecords.length === 0" class="empty-state">
        <image class="empty-icon" src="/static/images/empty-vehicle.png" mode="aspectFit"></image>
        <text class="empty-text">暂无收益记录</text>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <u-popup v-model:show="showFilterPopup" mode="bottom" :round="20">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">筛选类型</text>
          <u-icon name="close" size="20" @click="showFilterPopup = false"></u-icon>
        </view>
        <view class="options-list">
          <view
            v-for="option in filterOptions"
            :key="option.value"
            class="option-item"
            :class="{ active: currentFilter === option.value }"
            @click="selectFilter(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <u-icon v-if="currentFilter === option.value" name="checkbox-mark" size="18" color="#9C27B0"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getCrowdfundingProjectDetail, getCrowdfundingIncome, withdrawCrowdfundingIncome } from '@/api/crowdfunding'
import type { CrowdfundingProject, CrowdfundingIncomeRecord } from '@/types/crowdfunding'
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

const incomeRecords = ref<CrowdfundingIncomeRecord[]>([])
const loading = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const showFilterPopup = ref(false)
const currentFilter = ref<'all' | 'income' | 'withdraw'>('all')

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '收入', value: 'income' },
  { label: '提现', value: 'withdraw' }
]

// 累计收益
const totalIncome = computed(() => {
  return incomeRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
})

// 可提现金额
const availableIncome = computed(() => {
  const income = incomeRecords.value
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  const withdrawn = incomeRecords.value
    .filter(r => r.type === 'withdraw')
    .reduce((sum, r) => sum + r.amount, 0)
  return income - withdrawn
})

// 页面加载
onLoad((options: any) => {
  if (options.projectId) {
    projectId.value = options.projectId
    loadProjectDetail()
    loadIncomeRecords()
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  currentPage.value = 1
  hasMore.value = true
  loadIncomeRecords(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    currentPage.value++
    loadIncomeRecords()
  }
})

// 加载项目详情
const loadProjectDetail = async () => {
  try {
    const res = await getCrowdfundingProjectDetail(projectId.value)
    if (res.code === 0) {
      project.value = res.data
    }
  } catch (error) {
    logger.error('加载项目详情失败', error)
  }
}

// 加载收益记录
const loadIncomeRecords = async (refresh = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getCrowdfundingIncome({
      projectId: projectId.value,
      type: currentFilter.value === 'all' ? undefined : currentFilter.value,
      page: currentPage.value,
      pageSize: 20
    })

    if (res.code === 0 && res.data) {
      if (refresh) {
        incomeRecords.value = res.data.list || []
      } else {
        incomeRecords.value = [...incomeRecords.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.hasMore ?? false
    }
  } catch (error) {
    logger.error('加载收益记录失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 选择筛选
const selectFilter = (value: 'all' | 'income' | 'withdraw') => {
  currentFilter.value = value
  showFilterPopup.value = false
  currentPage.value = 1
  hasMore.value = true
  loadIncomeRecords(true)
}

// 提现
const handleWithdraw = async () => {
  if (availableIncome.value < 100) {
    uni.showToast({
      title: '可提现金额不足100元',
      icon: 'none'
    })
    return
  }

  try {
    // 确认提现
    const confirmRes = await new Promise<boolean>((resolve) => {
      uni.showModal({
        title: '确认提现',
        content: `确认提现 ¥${availableIncome.value.toLocaleString()} 到您的账户？`,
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

    // 调用提现API
    const res = await withdrawCrowdfundingIncome({
      projectId: projectId.value,
      amount: availableIncome.value
    })

    uni.hideLoading()

    if (res.code === 0) {
      uni.showToast({
        title: '提现成功',
        icon: 'success'
      })
      // 刷新数据
      currentPage.value = 1
      hasMore.value = true
      loadIncomeRecords(true)
    }
  } catch (error) {
    uni.hideLoading()
    logger.error('提现失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.income-detail-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 40rpx;
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

// 收益统计
.stats-section {
  padding: 32rpx;
  margin-bottom: 20rpx;

  .stats-card {
    background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(156, 39, 176, 0.3);
    margin-bottom: 24rpx;

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
          font-size: 40rpx;
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

  .withdraw-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #00B578 0%, #00D68F 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(0, 181, 120, 0.3);

    &::after {
      border: none;
    }
  }

  .withdraw-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 20rpx;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 12rpx;

    text {
      font-size: 24rpx;
      color: #FF9800;
    }
  }
}

// 收益明细
.income-list-section {
  background: #FFFFFF;
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 8rpx 16rpx;
      background: #F8F9FC;
      border-radius: 32rpx;

      .filter-text {
        font-size: 24rpx;
        color: #4E5969;
      }
    }
  }

  .income-list {
    display: flex;
    flex-direction: column;
    gap: 0;

    .income-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #F2F3F5;

      &:last-child {
        border-bottom: none;
      }

      .income-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .income-title {
          font-size: 28rpx;
          color: #1D2129;
          font-weight: 500;
        }

        .income-time {
          font-size: 22rpx;
          color: #86909C;
        }
      }

      .income-amount {
        .amount-text {
          font-size: 32rpx;
          font-weight: 700;
        }

        &.income-type .amount-text {
          color: #00B578;
        }

        &.withdraw-type .amount-text {
          color: #86909C;
        }
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
