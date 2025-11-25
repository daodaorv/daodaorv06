<template>
  <view class="crowdfunding-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">房车众筹</text>
    </view>

    <!-- 分段切换器 -->
    <uni-segmented-control
      :current="activeTabIndex"
      :values="segmentOptions.map(o => o.label)"
      @clickItem="handleSegmentChange"
    />

    <!-- 众筹项目列表 -->
    <scroll-view
      v-if="activeTab === 'projects'"
      class="content-container"
      scroll-y="true"
      @scrolltolower="loadMoreProjects"
    >
      <!-- 筛选栏 -->
      <view class="filter-bar">
        <view class="filter-item" @click="showFilterModal = true">
          <uni-icons type="list" size="16" :color="'#FF9F29'" />
          <text class="filter-text">{{ currentFilter.name }}</text>
          <uni-icons type="down" size="12" :color="'#999999'" />
        </view>
        <view class="sort-item" @click="toggleSort">
          <uni-icons type="refresh" size="16" :color="'#FF9F29'" />
          <text class="sort-text">{{ currentSort.name }}</text>
        </view>
      </view>

      <!-- 项目列表 -->
      <view class="project-list">
        <CrowdfundingProjectCard
          v-for="project in formattedProjectsList"
          :key="project.id"
          :project="project"
          @click="goToProjectDetail(project.id)"
          @invest="selectShares(project)"
        />
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMoreProjects">
        <uni-load-more :status="'loading'" :contentText="{ contentrefresh: '加载更多...' }" />
      </view>
      <view class="no-more" v-else-if="projectsList.length > 0">
        <uni-empty text="没有更多项目" />
      </view>
    </scroll-view>

    <!-- 交易市场 -->
    <scroll-view
      v-else-if="activeTab === 'market'"
      class="content-container"
      scroll-y="true"
    >
      <!-- 市场概览卡片 -->
      <view class="market-overview-card">
        <!-- 价格信息 -->
        <view class="price-section">
          <view class="price-header">
            <text class="price-label">叨叨房车份额最新价</text>
            <view class="update-time">16:23更新</view>
          </view>
          <view class="price-main">
            <text class="current-price">125.80</text>
            <view class="price-change positive">
              <uni-icons type="up" size="14" :color="'#FF4444'" />
              <text class="change-text">+2.85</text>
              <text class="change-percent">+2.31%</text>
            </view>
          </view>
        </view>

        <!-- K线图占位 -->
        <view class="chart-placeholder">
          <view class="chart-header">
            <text class="chart-title">走势图</text>
            <view class="chart-tabs">
              <text class="chart-tab active">日</text>
              <text class="chart-tab">周</text>
              <text class="chart-tab">月</text>
            </view>
          </view>
          <view class="chart-content">
            <text class="chart-placeholder-text">K线图功能开发中</text>
          </view>
        </view>

        <!-- 市场统计 -->
        <view class="market-stats">
          <view class="stat-item">
            <text class="stat-label">成交量</text>
            <text class="stat-value">1,250份</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">成交额</text>
            <text class="stat-value">15.73万</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">最新价</text>
            <text class="stat-value highlight">125.80</text>
          </view>
        </view>

        <!-- 风险提示 -->
        <view class="risk-notice">
          <uni-icons type="info-filled" size="16" :color="'#E6A23C'" />
          <text class="notice-text">价格异常波动时可能熔断</text>
        </view>
      </view>

      <!-- 交易操作区 -->
      <view class="trading-card">
        <!-- 持仓信息 -->
        <view class="position-info">
          <view class="position-item">
            <text class="position-label">持仓</text>
            <text class="position-value">{{ userData.holdings }}份</text>
          </view>
          <view class="position-item">
            <text class="position-label">委托</text>
            <text class="position-value">{{ userData.orders }}笔</text>
          </view>
          <view class="position-item">
            <text class="position-label">可买</text>
            <text class="position-value">{{ userData.canBuy }}份</text>
          </view>
          <view class="position-item">
            <text class="position-label">可卖</text>
            <text class="position-value">{{ userData.holdings }}份</text>
          </view>
        </view>

        <!-- 交易按钮 -->
        <view class="trading-buttons">
          <view class="trading-button sell" @click="openTradeModal('sell')">
            <text class="button-text">卖</text>
          </view>
          <view class="trading-button buy" @click="openTradeModal('buy')">
            <text class="button-text">买</text>
          </view>
        </view>

        <!-- 快捷链接 -->
        <view class="quick-links">
          <view class="link-item" @click="goToHoldings">
            <text class="link-text">我的持仓</text>
            <uni-icons type="right" size="14" :color="'#999999'" />
          </view>
          <view class="link-divider"></view>
          <view class="link-item" @click="goToOrders">
            <text class="link-text">委托记录</text>
            <uni-icons type="right" size="14" :color="'#999999'" />
          </view>
          <view class="link-divider"></view>
          <view class="link-item" @click="goToHistory">
            <text class="link-text">历史交易</text>
            <uni-icons type="right" size="14" :color="'#999999'" />
          </view>
        </view>
      </view>

      <!-- 交易时间提示 -->
      <view v-if="!isTradingHours" class="notice-card trading-hours-notice">
        <uni-icons type="info-filled" size="20" :color="'#FF4D4F'" />
        <view class="notice-content">
          <text class="notice-title">当前非交易时段</text>
          <text class="notice-desc">交易时间：周一至周五 9:30-15:00</text>
          <text class="notice-desc">法定节假日休市</text>
        </view>
      </view>

      <!-- 手续费说明 -->
      <view class="notice-card fee-notice">
        <uni-icons type="help-filled" size="20" :color="'#FF9F29'" />
        <view class="notice-content">
          <text class="notice-title">交易手续费</text>
          <text class="notice-desc">0.5%（最低1元）</text>
          <text class="notice-desc">卖出资金T+1日到账</text>
        </view>
      </view>
    </scroll-view>

    <!-- 筛选弹窗 -->
    <view class="modal-overlay" v-if="showFilterModal" @click="showFilterModal = false">
      <view class="filter-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选项目</text>
          <view class="modal-close" @click="showFilterModal = false">
            <uni-icons type="close" size="18" :color="'#999999'" />
          </view>
        </view>
        <view class="filter-options">
          <view
            v-for="filter in filterOptions"
            :key="filter.value"
            class="filter-option"
            :class="{ active: currentFilter.value === filter.value }"
            @click="selectFilter(filter)"
          >
            <text class="option-text">{{ filter.name }}</text>
            <uni-icons v-if="currentFilter.value === filter.value" type="checkmarkempty" size="16" :color="'#FF9F29'" />
          </view>
        </view>
      </view>
    </view>

    <!-- 交易弹窗 -->
    <view class="modal-overlay" v-if="showTradeModal" @click="showTradeModal = false">
      <view class="trade-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ tradeType === 'buy' ? '买入' : '卖出' }}份额</text>
          <view class="modal-close" @click="showTradeModal = false">
            <uni-icons type="close" size="18" :color="'#999999'" />
          </view>
        </view>
        <view class="trade-form">
          <view class="form-item">
            <text class="form-label">价格（元/份）</text>
            <input
              class="form-input"
              type="digit"
              v-model="tradeForm.price"
              :placeholder="tradeType === 'buy' ? '当前最优价格' : '当前价格'"
            />
          </view>
          <view class="form-item">
            <text class="form-label">数量（份）</text>
            <input
              class="form-input"
              type="number"
              v-model="tradeForm.quantity"
              :placeholder="'最低' + (tradeType === 'buy' ? '买入' : '卖出') + '1份'"
            />
          </view>
          <view class="form-item">
            <view class="amount-row">
              <text class="form-label">预计金额</text>
              <text class="total-amount">¥{{ calculateTotal() }}</text>
            </view>
          </view>
          <view class="fee-info">
            <text class="fee-text">手续费：¥{{ calculateFee() }}</text>
          </view>
        </view>
        <view class="trade-modal-actions">
          <view class="action-btn cancel" @click="showTradeModal = false">
            <text class="btn-text">取消</text>
          </view>
          <view class="action-btn confirm" @click="submitTrade">
            <text class="btn-text">{{ tradeType === 'buy' ? '买入' : '卖出' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
// 导入组件 - 使用easycom自动导入，无需手动引入
// import { CrowdfundingProjectCard } from '@/components';
import { getCrowdfundingProjects, getMarketData, submitTradeOrder } from '@/api/crowdfunding';

// 接口定义
interface SegmentOption {
  label: string;
  value: string;
}

interface FilterOption {
  name: string;
  value: string;
}

interface TradeForm {
  price: string;
  quantity: string;
}

interface UserData {
  holdings: number;
  orders: number;
  canBuy: number;
}

// 页面状态
const activeTab = ref('projects');
const activeTabIndex = ref(0);
const showFilterModal = ref(false);
const showTradeModal = ref(false);
const tradeType = ref<'buy' | 'sell'>('buy');
const isTradingHours = ref(true);

// 分段选项
const segmentOptions = ref<SegmentOption[]>([
  { label: '众筹项目', value: 'projects' },
  { label: '份额交易市场', value: 'market' }
]);

// 众筹项目数据
const projectsList = ref([]);
const currentFilter = ref<FilterOption>({ name: '全部状态', value: 'all' });
const currentSort = ref({ name: '默认排序', value: 'default' });
const hasMoreProjects = ref(true);

// 用户数据
const userData = ref<UserData>({
  holdings: 50,
  orders: 2,
  canBuy: 125
});

// 交易表单
const tradeForm = ref<TradeForm>({
  price: '',
  quantity: ''
});

// 筛选选项
const filterOptions = ref<FilterOption[]>([
  { name: '全部状态', value: 'all' },
  { name: '众筹中', value: 'active' },
  { name: '已成功', value: 'success' },
  { name: '已失败', value: 'failed' }
]);

// 计算属性：格式化项目列表
const formattedProjectsList = computed(() => {
  return projectsList.value.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description || '高品质房车投资项目',
    image: project.image || '/static/default-vehicle.png',
    status: project.progress >= 100 ? 'success' : 'active',
    currentAmount: parseFloat(project.raisedAmount) || 0,
    targetAmount: parseFloat(project.targetAmount) || 100000,
    annualReturnMin: parseFloat(project.returnRate) || 5,
    annualReturnMax: parseFloat(project.returnRate) + 4 || 15,
    sharePrice: 1000,
    riskLevel: project.riskLevel || '中',
    supporterCount: project.investors || 0,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + (project.daysLeft || 30) * 24 * 60 * 60 * 1000).toISOString()
  }));
});

// 页面生命周期
onLoad(() => {
  loadProjectsList();
  checkTradingHours();
});

onShow(() => {
  checkTradingHours();
});

// 方法
// 处理分段切换
const handleSegmentChange = (e: { currentIndex: number }) => {
  const index = e.currentIndex;
  const option = segmentOptions.value[index];
  activeTabIndex.value = index;
  activeTab.value = option.value;

  if (option.value === 'market') {
    loadMarketData();
  }
};

// 切换标签
const switchTab = (tab: string) => {
  activeTab.value = tab;
  if (tab === 'market') {
    loadMarketData();
  }
};

// 加载项目列表
const loadProjectsList = async () => {
  try {
    // 模拟数据
    const mockProjects = [
      {
        id: 1,
        title: '奔驰威茨房车',
        description: '高端商旅房车项目',
        targetAmount: 1000000,
        raisedAmount: 856000,
        returnRate: 12,
        riskLevel: '中',
        investors: 128,
        daysLeft: 15
      },
      {
        id: 2,
        title: '丰田考斯特房车',
        description: '豪华旅居房车项目',
        targetAmount: 800000,
        raisedAmount: 1200000,
        returnRate: 10,
        riskLevel: '低',
        investors: 89,
        daysLeft: 8
      },
      {
        id: 3,
        title: '福特全顺房车',
        description: '经济实用房车项目',
        targetAmount: 600000,
        raisedAmount: 432000,
        returnRate: 15,
        riskLevel: '中高',
        investors: 67,
        daysLeft: 22
      }
    ];

    projectsList.value = mockProjects;
    hasMoreProjects.value = false;
  } catch (error) {
    console.error('加载项目列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  }
};

// 加载更多项目
const loadMoreProjects = () => {
  if (hasMoreProjects.value) {
    console.log('加载更多项目');
  }
};

// 加载市场数据
const loadMarketData = async () => {
  try {
    console.log('加载市场数据');
    // 这里可以调用实际API
  } catch (error) {
    console.error('加载市场数据失败:', error);
  }
};

// 检查交易时间
const checkTradingHours = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // 周末休市
  if (day === 0 || day === 6) {
    isTradingHours.value = false;
    return;
  }

  // 交易时间：9:30-15:00
  const startTime = 9 * 60 + 30;  // 9:30
  const endTime = 15 * 60;         // 15:00

  isTradingHours.value = currentTime >= startTime && currentTime < endTime;
};

// 显示交易弹窗
const openTradeModal = (type: 'buy' | 'sell') => {
  tradeType.value = type;
  tradeForm.value = {
    price: '125.80',
    quantity: ''
  };
  showTradeModal.value = true;
};

// 计算总金额
const calculateTotal = (): string => {
  if (!tradeForm.value.price || !tradeForm.value.quantity) {
    return '0.00';
  }
  return (parseFloat(tradeForm.value.price) * parseInt(tradeForm.value.quantity)).toFixed(2);
};

// 计算手续费
const calculateFee = (): string => {
  const total = parseFloat(calculateTotal());
  const fee = total * 0.005;
  return fee < 1 ? '1.00' : fee.toFixed(2);
};

// 提交交易
const submitTrade = async () => {
  if (!tradeForm.value.price || !tradeForm.value.quantity) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
    return;
  }

  if (tradeType.value === 'sell' && parseInt(tradeForm.value.quantity) > userData.value.holdings) {
    uni.showToast({
      title: '持仓数量不足',
      icon: 'none'
    });
    return;
  }

  try {
    // 模拟提交
    uni.showToast({
      title: '委托成功',
      icon: 'success'
    });

    showTradeModal.value = false;
  } catch (error) {
    uni.showToast({
      title: '委托失败',
      icon: 'none'
    });
  }
};

// 页面跳转
const goToProjectDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/crowdfunding/detail?id=${id}`
  });
};

const selectShares = (project: any) => {
  console.log('选择份额:', project);
};

const goToHoldings = () => {
  uni.navigateTo({
    url: '/pages/crowdfunding/holdings'
  });
};

const goToOrders = () => {
  uni.navigateTo({
    url: '/pages/crowdfunding/orders'
  });
};

const goToHistory = () => {
  uni.navigateTo({
    url: '/pages/crowdfunding/history'
  });
};

const toggleSort = () => {
  console.log('切换排序');
};

const selectFilter = (filter: FilterOption) => {
  currentFilter.value = filter;
  showFilterModal.value = false;
  loadProjectsList();
};
</script>

<style>
// 导入统一变量文件
.crowdfunding-page {
  min-height: 100vh;
  background: #F8F8F8;
}

// 顶部导航栏
.nav-bar {
  height: 88rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #E8E8E8;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

// 内容容器
.content-container {
  flex: 1;
  padding: 0 30rpx;
}

// 筛选栏
.filter-bar {
  display: flex;
  gap: 24rpx;
  margin: 32rpx 0;
}

.filter-item, .sort-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 20rpx;
  padding: 0 24rpx;
  gap: 8rpx;
  transition: all 0.2s;

  .active {
    transform: scale(0.98);
    border-color: #FF9F29;
  }
}

.filter-text, .sort-text {
  font-size: 24rpx;
  color: #333333;
}

// 项目列表
.project-list {
  margin-bottom: 48rpx;
}

// 市场概览卡片
.market-overview-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  .price-section {
    margin-bottom: 48rpx;

    .price-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .price-label {
        font-size: 28rpx;
        color: #666666;
      }

      .update-time {
        font-size: 20rpx;
        color: #999999;
      }
    }

    .price-main {
      display: flex;
      align-items: baseline;
      gap: 24rpx;

      .current-price {
        font-size: 56rpx;
        font-weight: 700;
        color: #333333;
      }

      .price-change {
        display: flex;
        align-items: center;
        gap: 4rpx;

        &.positive  { .change-text, .change-percent { color: #FF4D4F; } }

        &.negative  { .change-text, .change-percent { color: #67C23A; } }

        .change-text {
          font-size: 32rpx;
          font-weight: 600;
        }

        .change-percent {
          font-size: 28rpx;
        }
      }
    }
  }

  .chart-placeholder {
    margin-bottom: 48rpx;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .chart-title {
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
      }

      .chart-tabs {
        display: flex;
        gap: 16rpx;

        .chart-tab {
          padding: 8rpx 16rpx;
          font-size: 20rpx;
          color: #666666;
          border-radius: 12rpx;
          transition: all 0.2s;

          &.active {
            background: rgba(#FF9F29, 0.1);
            color: #FF9F29;
            font-weight: 500;
          }
        }
      }
    }

    .chart-content {
      height: 300rpx;
      background: #FAFAFA;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .chart-placeholder-text {
        font-size: 28rpx;
        color: #999999;
      }
    }
  }

  .market-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 32rpx;
    padding: 32rpx 0;
    border-top: 1px solid #E8E8E8;
    border-bottom: 1px solid #E8E8E8;

    .stat-item {
      text-align: center;

      .stat-label {
        font-size: 24rpx;
        color: #666666;
        display: block;
        margin-bottom: 8rpx;
      }

      .stat-value {
        font-size: 32rpx;
        color: #333333;
        font-weight: 600;

        &.highlight {
          color: #FF9F29;
        }
      }
    }

    .stat-divider {
      width: 1px;
      background: #E8E8E8;
    }
  }

  .risk-notice {
    display: flex;
    align-items: center;
    background: rgba(#E6A23C, 0.1);
    padding: 24rpx;
    border-radius: 16rpx;

    .notice-text {
      font-size: 24rpx;
      color: #E6A23C;
      margin-left: 16rpx;
    }
  }
}

// 交易卡片
.trading-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  .position-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32rpx;
    margin-bottom: 48rpx;

    .position-item {
      text-align: center;

      .position-label {
        font-size: 24rpx;
        color: #666666;
        display: block;
        margin-bottom: 8rpx;
      }

      .position-value {
        font-size: 36rpx;
        color: #333333;
        font-weight: 600;
      }
    }
  }

  .trading-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32rpx;
    margin-bottom: 48rpx;

    .trading-button {
      height: 88rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      .active {
        transform: scale(0.98);
      }

      &.sell {
        background: #67C23A;

        .button-text {
          color: #FFFFFF;
          font-weight: 600;
        }
      }

      &.buy {
        background: #FF4D4F;

        .button-text {
          color: #FFFFFF;
          font-weight: 600;
        }
      }
    }
  }

  .quick-links {
    border-top: 1px solid #E8E8E8;
    padding-top: 32rpx;

    .link-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      transition: all 0.2s;

      .active {
        background: #FAFAFA;
        margin: 0 (-32rpx);
        padding: 24rpx 32rpx;
        border-radius: 16rpx;
      }

      .link-text {
        font-size: 28rpx;
        color: #333333;
      }
    }

    .link-divider {
      height: 1px;
      background: #E8E8E8;
      margin: 0 (-32rpx);
    }
  }
}

// 通知卡片
.notice-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &.trading-hours-notice {
    border-left: 8rpx solid #FF4D4F;

    .notice-title {
      color: #FF4D4F;
      font-weight: 600;
    }
  }

  &.fee-notice {
    border-left: 8rpx solid #FF9F29;

    .notice-title {
      color: #FF9F29;
      font-weight: 600;
    }
  }

  .notice-content {
    flex: 1;

    .notice-title {
      font-size: 28rpx;
      display: block;
      margin-bottom: 8rpx;
    }

    .notice-desc {
      font-size: 24rpx;
      color: #666666;
      display: block;
      margin-bottom: 4rpx;
    }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 48rpx;
}

.filter-modal, .trade-modal {
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx;
  border-bottom: 1px solid #E8E8E8;

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
  }

  .modal-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #FAFAFA;
    transition: all 0.2s;

    .active {
      background: #E8E8E8;
      transform: scale(0.95);
    }
  }
}

.filter-options {
  padding: 48rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  transition: all 0.2s;

  .active {
    background: #FAFAFA;
  }

  &.active {
    background: rgba(#FF9F29, 0.1);
    border: 1px solid rgba(#FF9F29, 0.3);

    .option-text {
      color: #FF9F29;
      font-weight: 500;
    }
  }

  .option-text {
    font-size: 28rpx;
    color: #333333;
  }
}

.trade-form {
  padding: 48rpx;

  .form-item {
    margin-bottom: 48rpx;

    .form-label {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 24rpx;
      display: block;
    }

    .form-input {
      width: 100%;
      height: 88rpx;
      background: #FAFAFA;
      border: 1px solid #E8E8E8;
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      transition: all 0.2s;

      .focus {
        border-color: #FF9F29;
        background: #FFFFFF;
      }
    }

    .amount-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .total-amount {
        font-size: 36rpx;
        font-weight: 700;
        color: #FF9F29;
      }
    }
  }

  .fee-info {
    margin-top: 24rpx;
    padding: 24rpx;
    background: #FAFAFA;
    border-radius: 16rpx;

    .fee-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.trade-modal-actions {
  display: flex;
  padding: 48rpx;
  gap: 32rpx;
  border-top: 1px solid #E8E8E8;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    .active {
      transform: scale(0.98);
    }

    &.cancel {
      background: #FAFAFA;

      .btn-text {
        color: #666666;
        font-weight: 500;
      }
    }

    &.confirm {
      background: #FF9F29;

      .btn-text {
        color: #FFFFFF;
        font-weight: 600;
      }
    }
  }
}

// 加载更多和空状态
.load-more, .no-more {
  text-align: center;
  padding: 48rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .content-container {
    padding: 0 24rpx;
  }

  .filter-bar {
    margin: 24rpx 0;
    gap: 16rpx;
  }

  .filter-item, .sort-item {
    height: 56rpx;
    padding: 0 16rpx;

    .filter-text, .sort-text {
      font-size: 20rpx;
    }
  }

  .market-overview-card {
    padding: 32rpx;

    .price-section .price-main .current-price {
      font-size: 48rpx;
    }

    .chart-placeholder  { .chart-content { height: 240rpx; } }
  }

  .trading-card {
    padding: 32rpx;

    .position-info {
      gap: 24rpx;
    }
  }
}
</style>