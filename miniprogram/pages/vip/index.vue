<template>
  <view class="vip-page">
    <!-- 顶部标题区域 -->
    <view class="header-section">
      <view class="vip-background">
        <view class="vip-crown">
          <text class="crown-icon">👑</text>
        </view>
        <view class="vip-title">
          <text class="main-title">PLUS会员中心</text>
          <text class="sub-title">尊享专属特权，超值优惠体验</text>
        </view>
      </view>
    </view>

    <!-- 会员权益区域 -->
    <view class="benefits-section">
      <view class="section-header">
        <text class="section-title">会员专属权益</text>
        <text class="section-subtitle">开通PLUS会员，享受超值特权</text>
      </view>

      <view class="benefits-grid">
        <view class="benefit-card">
          <view class="benefit-icon discount">
            <uni-icons type="wallet" size="24" color="#FFD700"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">95折专属优惠</text>
            <text class="benefit-desc">所有房车订单享95折优惠</text>
          </view>
        </view>

        <view class="benefit-card">
          <view class="benefit-icon birthday">
            <uni-icons type="gift-filled" size="24" color="#FF6B6B"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">生日专属礼券</text>
            <text class="benefit-desc">生日月获赠专属优惠券</text>
          </view>
        </view>

        <view class="benefit-card">
          <view class="benefit-icon service">
            <uni-icons type="headphones" size="24" color="#4CAF50"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">专属客服</text>
            <text class="benefit-desc">24小时专属客服服务</text>
          </view>
        </view>

        <view class="benefit-card">
          <view class="benefit-icon priority">
            <uni-icons type="vip-filled" size="24" color="#9C27B0"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">优先预订</text>
            <text class="benefit-desc">新车型优先预订权</text>
          </view>
        </view>

        <view class="benefit-card">
          <view class="benefit-icon points">
            <uni-icons type="medal" size="24" color="#FF9800"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">积分加速</text>
            <text class="benefit-desc">消费积分双倍累积</text>
          </view>
        </view>

        <view class="benefit-card">
          <view class="benefit-icon insurance">
            <uni-icons type="shield-filled" size="24" color="#2196F3"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">免费保险</text>
            <text class="benefit-desc">每月免费退改险一次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员套餐选择 -->
    <view class="pricing-section">
      <view class="section-header">
        <text class="section-title">选择会员套餐</text>
        <text class="section-subtitle">多种套餐任你选择，超值享受</text>
      </view>

      <view class="pricing-cards">
        <!-- 月卡套餐 -->
        <view class="pricing-card">
          <view class="pricing-header">
            <text class="plan-name">月卡会员</text>
            <view class="popular-badge" v-if="!isVip">推荐</view>
          </view>
          <view class="pricing-content">
            <view class="price-info">
              <text class="price-symbol">¥</text>
              <text class="price-value">29</text>
              <text class="price-unit">/月</text>
            </view>
            <view class="original-price">原价 ¥39/月</view>
          </view>
          <view class="plan-features">
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">95折订单优惠</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">生日礼券</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">专属客服</text>
            </view>
          </view>
          <button class="purchase-btn monthly" @tap="purchasePlan('monthly')">
            立即开通
          </button>
        </view>

        <!-- 年卡套餐 -->
        <view class="pricing-card featured">
          <view class="pricing-header">
            <text class="plan-name">年卡会员</text>
            <view class="popular-badge">超值</view>
          </view>
          <view class="pricing-content">
            <view class="price-info">
              <text class="price-symbol">¥</text>
              <text class="price-value">299</text>
              <text class="price-unit">/年</text>
            </view>
            <view class="original-price">原价 ¥468/年</view>
            <view class="savings-info">立省 ¥169</view>
          </view>
          <view class="plan-features">
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">95折订单优惠</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">生日礼券×2</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">专属客服</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">优先预订</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">积分双倍</text>
            </view>
            <view class="feature-item">
              <uni-icons type="checkmarkempty" size="16" color="#4CAF50"></uni-icons>
              <text class="feature-text">免费保险</text>
            </view>
          </view>
          <button class="purchase-btn yearly" @tap="purchasePlan('yearly')">
            立即开通
          </button>
        </view>
      </view>
    </view>

    <!-- 会员活动区域 -->
    <view class="activities-section">
      <view class="section-header">
        <text class="section-title">会员专属活动</text>
        <text class="section-subtitle">更多精彩活动等你参与</text>
      </view>

      <view class="activity-list">
        <view class="activity-card">
          <image class="activity-image" src="/static/vip-activity-1.jpg" mode="aspectFill"></image>
          <view class="activity-content">
            <text class="activity-title">新会员首单立减50元</text>
            <text class="activity-desc">开通PLUS会员首单立减50元，限前100名</text>
            <view class="activity-footer">
              <text class="activity-time">活动进行中</text>
              <view class="join-btn" @tap="joinActivity('first-order')">
                立即参与
              </view>
            </view>
          </view>
        </view>

        <view class="activity-card">
          <image class="activity-image" src="/static/vip-activity-2.jpg" mode="aspectFill"></image>
          <view class="activity-content">
            <text class="activity-title">会员积分翻倍周</text>
            <text class="activity-desc">每周三、四会员消费积分双倍累积</text>
            <view class="activity-footer">
              <text class="activity-time">每周三-四</text>
              <view class="join-btn" @tap="joinActivity('points-double')">
                查看详情
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- FAQ区域 -->
    <view class="faq-section">
      <view class="section-header">
        <text class="section-title">常见问题</text>
        <text class="section-subtitle">解答您的疑问</text>
      </view>

      <view class="faq-list">
        <view class="faq-item" @tap="toggleFaq(0)">
          <view class="faq-question">
            <text class="question-text">PLUS会员有哪些特权？</text>
            <uni-icons
              :type="expandedFaq === 0 ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>
          <view class="faq-answer" v-if="expandedFaq === 0">
            <text class="answer-text">PLUS会员享有多项特权：95折订单优惠、生日专属礼券、24小时专属客服、新车型优先预订权、消费积分双倍累积、每月免费退改险一次等。</text>
          </view>
        </view>

        <view class="faq-item" @tap="toggleFaq(1)">
          <view class="faq-question">
            <text class="question-text">会员权益何时生效？</text>
            <uni-icons
              :type="expandedFaq === 1 ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>
          <view class="faq-answer" v-if="expandedFaq === 1">
            <text class="answer-text">支付成功后立即生效，生效当天即可享受会员权益。生日礼券会在生日月当天发放到您的账户。</text>
          </view>
        </view>

        <view class="faq-item" @tap="toggleFaq(2)">
          <view class="faq-question">
            <text class="question-text">如何申请退款？</text>
            <uni-icons
              :type="expandedFaq === 2 ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>
          <view class="faq-answer" v-if="expandedFaq === 2">
            <text class="answer-text">会员服务一经购买不支持退款，请在购买前仔细阅读服务条款。如有特殊情况，可联系专属客服咨询。</text>
          </view>
        </view>

        <view class="faq-item" @tap="toggleFaq(3)">
          <view class="faq-question">
            <text class="question-text">会员到期后如何续费？</text>
            <uni-icons
              :type="expandedFaq === 3 ? 'up' : 'down'"
              size="16"
              color="#666"
            ></uni-icons>
          </view>
          <view class="faq-answer" v-if="expandedFaq === 3">
            <text class="answer-text">会员到期前7天我们会发送续费提醒，您可以在会员中心点击续费按钮进行续费，续费成功后权益立即生效。</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系客服 -->
    <view class="contact-section">
      <view class="contact-card" @tap="contactService">
        <view class="contact-icon">
          <uni-icons type="headphones" size="24" color="#FF9F29"></uni-icons>
        </view>
        <view class="contact-content">
          <text class="contact-title">联系专属客服</text>
          <text class="contact-desc">24小时在线，解答您的疑问</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  data() {
    return {
      expandedFaq: -1,
      isVip: false,
      vipLevel: '',
      vipExpireDate: ''
    };
  },
  onMounted() {
    this.loadVipInfo();
  },
  methods: {
    // 加载会员信息
    loadVipInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo && userInfo.vipStatus) {
          this.isVip = userInfo.vipStatus === 'active';
          this.vipLevel = userInfo.vipLevel || 'plus';
          this.vipExpireDate = userInfo.vipExpireDate || '';
        }
      } catch (error) {
        console.log('加载会员信息失败:', error);
      }
    },

    // 购买会员套餐
    purchasePlan(planType) {
      if (this.isVip) {
        uni.showToast({
          title: '您已是PLUS会员',
          icon: 'none'
        });
        return;
      }

      const planName = planType === 'monthly' ? '月卡会员' : '年卡会员';
      const price = planType === 'monthly' ? 29 : 299;

      uni.showModal({
        title: '确认开通',
        content: `确定要开通${planName}吗？费用¥${price}`,
        success: (res) => {
          if (res.confirm) {
            this.processPurchase(planType, planName, price);
          }
        }
      });
    },

    // 处理购买流程
    processPurchase(planType, planName, price) {
      uni.showLoading({
        title: '处理中...'
      });

      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();

        // 模拟购买成功
        this.isVip = true;
        this.vipLevel = 'plus';

        // 计算到期时间
        const now = new Date();
        if (planType === 'monthly') {
          now.setMonth(now.getMonth() + 1);
        } else {
          now.setFullYear(now.getFullYear() + 1);
        }
        this.vipExpireDate = now.toISOString().split('T')[0];

        uni.showToast({
          title: '开通成功',
          icon: 'success'
        });

        // 保存会员信息
        this.saveVipInfo();
      }, 2000);
    },

    // 保存会员信息
    saveVipInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo') || {};
        userInfo.vipStatus = 'active';
        userInfo.vipLevel = this.vipLevel;
        userInfo.vipExpireDate = this.vipExpireDate;
        uni.setStorageSync('userInfo', userInfo);
      } catch (error) {
        console.log('保存会员信息失败:', error);
      }
    },

    // 参与活动
    joinActivity(activityType) {
      if (!this.isVip) {
        uni.showModal({
          title: '需要PLUS会员',
          content: '此活动仅限PLUS会员参与，是否立即开通？',
          success: (res) => {
            if (res.confirm) {
              this.purchasePlan('monthly');
            }
          }
        });
        return;
      }

      switch (activityType) {
        case 'first-order':
          uni.showToast({
            title: '优惠券已发放',
            icon: 'success'
          });
          break;
        case 'points-double':
          uni.showToast({
            title: '积分双倍活动进行中',
            icon: 'none'
          });
          break;
        default:
          break;
      }
    },

    // 切换FAQ展开状态
    toggleFaq(index) {
      this.expandedFaq = this.expandedFaq === index ? -1 : index;
    },

    // 联系客服
    contactService() {
      uni.showToast({
        title: '客服功能开发中',
        icon: 'none'
      });
    }
  }
};
</script>

<style>
.vip-page {
  min-height: 100vh;
  background: #f5f5f5;
}

// 顶部标题区域
.header-section {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 60rpx 30rpx 80rpx;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400rpx;
    height: 400rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .vip-background {
    position: relative;
    z-index: 1;
    text-align: center;

    .vip-crown {
      margin-bottom: 30rpx;

      .crown-icon {
        font-size: 80rpx;
        filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.2));
      }
    }

    .vip-title  { .main-title { display: block;
        font-size: 48rpx;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 16rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2); }.sub-title { display: block;
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 400; } }
  }
}

// 通用区域样式
.section-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 0 30rpx;

  .section-title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .section-subtitle {
    display: block;
    font-size: 26rpx;
    color: #666666;
  }
}

// 会员权益区域
.benefits-section {
  margin: -40rpx 30rpx 40rpx;
  position: relative;
  z-index: 2;

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

    .benefit-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30rpx 20rpx;
      border-radius: 16rpx;
      background: #F8F9FA;
      transition: all 0.3s ease;

      .active {
        transform: scale(0.98);
        background: #E9ECEF;
      }

      .benefit-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;

        &.discount { background: rgba(255, 215, 0, 0.1); }
        &.birthday { background: rgba(255, 107, 107, 0.1); }
        &.service { background: rgba(76, 175, 80, 0.1); }
        &.priority { background: rgba(156, 39, 176, 0.1); }
        &.points { background: rgba(255, 152, 0, 0.1); }
        &.insurance { background: rgba(33, 150, 243, 0.1); }
      }

      .benefit-content  { .benefit-title { display: block;
          font-size: 26rpx;
          font-weight: 600;
          color: #333333;
          margin-bottom: 8rpx;
          line-height: 1.3; }.benefit-desc { display: block;
          font-size: 22rpx;
          color: #666666;
          line-height: 1.4; } }
    }
  }
}

// 价格套餐区域
.pricing-section {
  margin: 0 30rpx 40rpx;

  .pricing-cards {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .pricing-card {
      background: #FFFFFF;
      border-radius: 24rpx;
      padding: 30rpx;
      position: relative;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
      border: 2rpx solid transparent;
      transition: all 0.3s ease;

      &.featured {
        border-color: #FFD700;
        box-shadow: 0 8rpx 32rpx rgba(255, 215, 0, 0.2);
      }

      .pricing-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .plan-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333333;
        }

        .popular-badge {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #FFFFFF;
          font-size: 20rpx;
          font-weight: 600;
          padding: 6rpx 16rpx;
          border-radius: 16rpx;
        }
      }

      .pricing-content {
        margin-bottom: 30rpx;

        .price-info {
          display: flex;
          align-items: baseline;
          margin-bottom: 12rpx;

          .price-symbol {
            font-size: 32rpx;
            color: #FF9F29;
            font-weight: 600;
          }

          .price-value {
            font-size: 64rpx;
            color: #FF9F29;
            font-weight: 700;
            margin: 0 4rpx;
          }

          .price-unit {
            font-size: 24rpx;
            color: #666666;
          }
        }

        .original-price {
          font-size: 24rpx;
          color: #999999;
          text-decoration: line-through;
          margin-bottom: 8rpx;
        }

        .savings-info {
          font-size: 24rpx;
          color: #4CAF50;
          font-weight: 600;
        }
      }

      .plan-features {
        margin-bottom: 30rpx;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 16rpx;

          .feature-text {
            font-size: 26rpx;
            color: #333333;
            line-height: 1.4;
          }
        }
      }

      .purchase-btn {
        width: 100%;
        background: linear-gradient(135deg, #FF9F29 0%, #FFD23F 100%);
        color: #FFFFFF;
        border: none;
        border-radius: 16rpx;
        padding: 24rpx 0;
        font-size: 28rpx;
        font-weight: 600;
        box-shadow: 0 4rpx 16rpx rgba(255, 159, 41, 0.3);
        transition: all 0.3s ease;

        &.yearly {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        }

        .active {
          transform: translateY(2rpx);
          box-shadow: 0 2rpx 8rpx rgba(255, 159, 41, 0.2);
        }
      }
    }
  }
}

// 活动区域
.activities-section {
  margin: 0 30rpx 40rpx;

  .activity-list  { .activity-card { background: #FFFFFF;
      border-radius: 16rpx;
      overflow: hidden;
      margin-bottom: 20rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

      .activity-image { width: 100%;
        height: 200rpx;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); }.activity-content { padding: 24rpx;

        .activity-title { display: block;
          font-size: 28rpx;
          font-weight: 600;
          color: #333333;
          margin-bottom: 12rpx;
          line-height: 1.4; }.activity-desc { display: block;
          font-size: 24rpx;
          color: #666666;
          margin-bottom: 20rpx;
          line-height: 1.5; }.activity-footer { display: flex;
          align-items: center;
          justify-content: space-between;

          .activity-time { font-size: 22rpx;
            color: #999999; }.join-btn { background: rgba(255, 159, 41, 0.1);
            color: #FF9F29;
            font-size: 24rpx;
            font-weight: 600;
            padding: 8rpx 16rpx;
            border-radius: 12rpx;
            border: 1rpx solid rgba(255, 159, 41, 0.2); } }
      }
    }
  }
}

// FAQ区域
.faq-section {
  margin: 0 30rpx 40rpx;

  .faq-list {
    background: #FFFFFF;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

    .faq-item {
      border-bottom: 1rpx solid #F0F0F0;

      .last-child {
        border-bottom: none;
      }

      .faq-question {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30rpx;
        transition: all 0.3s ease;

        .active {
          background: #F8F9FA;
        }

        .question-text {
          flex: 1;
          font-size: 28rpx;
          font-weight: 500;
          color: #333333;
          line-height: 1.4;
        }
      }

      .faq-answer {
        padding: 0 30rpx 30rpx;
        border-top: 1rpx solid #F8F9FA;

        .answer-text {
          font-size: 26rpx;
          color: #666666;
          line-height: 1.6;
        }
      }
    }
  }
}

// 联系客服区域
.contact-section {
  margin: 0 30rpx 40rpx;

  .contact-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    .active {
      transform: scale(0.98);
      background: #F8F9FA;
    }

    .contact-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(255, 159, 41, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .contact-content {
      flex: 1;

      .contact-title {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 8rpx;
        line-height: 1.4;
      }

      .contact-desc {
        display: block;
        font-size: 24rpx;
        color: #666666;
        line-height: 1.4;
      }
    }
  }
}
</style>