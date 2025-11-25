<template>
  <view class="service-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">客服中心</text>
      <text class="page-desc">随时为您提供帮助</text>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
      <view class="section-title">
        <uni-icons type="phone" size="20" color="#FF9F29"></uni-icons>
        <text class="title-text">联系我们</text>
      </view>

      <view class="contact-list">
        <view class="contact-item" @tap="makePhoneCall">
          <view class="contact-info">
            <text class="contact-name">客服热线</text>
            <text class="contact-value">400-888-9999</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>

        <view class="contact-item" @tap="openWechat">
          <view class="contact-info">
            <text class="contact-name">微信客服</text>
            <text class="contact-value">daodao_service</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>

        <view class="contact-item" @tap="sendEmail">
          <view class="contact-info">
            <text class="contact-name">邮箱客服</text>
            <text class="contact-value">service@daodaorv.com</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 服务时间 -->
    <view class="service-time-section">
      <view class="section-title">
        <uni-icons type="calendar" size="20" color="#FF9F29"></uni-icons>
        <text class="title-text">服务时间</text>
      </view>

      <view class="time-card">
        <view class="time-item">
          <text class="time-label">周一至周五</text>
          <text class="time-value">9:00 - 21:00</text>
        </view>
        <view class="time-item">
          <text class="time-label">周六至周日</text>
          <text class="time-value">10:00 - 18:00</text>
        </view>
        <view class="time-item">
          <text class="time-label">法定节假日</text>
          <text class="time-value">10:00 - 17:00</text>
        </view>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="faq-section">
      <view class="section-title">
        <uni-icons type="help" size="20" color="#FF9F29"></uni-icons>
        <text class="title-text">常见问题</text>
      </view>

      <view class="faq-list">
        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @tap="toggleFAQ(index)">
          <view class="faq-question">
            <text class="question-text">{{ item.question }}</text>
            <uni-icons :type="item.expanded ? 'up' : 'down'" size="16" color="#ccc"></uni-icons>
          </view>
          <view v-if="item.expanded" class="faq-answer">
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 在线客服 -->
    <view class="online-service">
      <view class="online-service-content" @tap="startOnlineService">
        <uni-icons type="chatbubble" size="24" color="#FFFFFF"></uni-icons>
        <text class="online-service-text">在线客服</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 常见问题列表
const faqList = ref([
  {
    question: '如何预订房车？',
    answer: '您可以在小程序首页选择取车时间和地点，浏览可用的房车，选择心仪的车辆后点击预订，按照提示完成订单即可。',
    expanded: false
  },
  {
    question: '预订需要什么证件？',
    answer: '预订房车需要提供身份证和驾驶证。取车时请务必携带原件，年龄需满21岁且驾龄满1年。',
    expanded: false
  },
  {
    question: '可以取消预订吗？',
    answer: '可以取消预订。取车前48小时取消可全额退款，24-48小时内取消收取20%手续费，24小时内取消不予退款。',
    expanded: false
  },
  {
    question: '房车包含哪些设施？',
    answer: '所有房车均包含基本生活设施，如床铺、厨房、卫生间、空调等。具体设施详情请查看车辆说明。',
    expanded: false
  },
  {
    question: '如何支付订单？',
    answer: '我们支持微信支付、支付宝、银行卡等多种支付方式。您可以在订单确认页面选择合适的支付方式。',
    expanded: false
  }
]);

// 拨打电话
const makePhoneCall = () => {
  uni.makePhoneCall({
    phoneNumber: '4008889999',
    fail: () => {
      uni.showToast({
        title: '拨号失败',
        icon: 'none'
      });
    }
  });
};

// 打开微信
const openWechat = () => {
  uni.setClipboardData({
    data: 'daodao_service',
    success: () => {
      uni.showToast({
        title: '微信号已复制',
        icon: 'success'
      });
    }
  });
};

// 发送邮件
const sendEmail = () => {
  uni.setClipboardData({
    data: 'service@daodaorv.com',
    success: () => {
      uni.showToast({
        title: '邮箱地址已复制',
        icon: 'success'
      });
    }
  });
};

// 展开/收起FAQ
const toggleFAQ = (index) => {
  faqList.value[index].expanded = !faqList.value[index].expanded;
};

// 开始在线客服
const startOnlineService = () => {
  uni.showToast({
    title: '在线客服功能开发中',
    icon: 'none'
  });
};
</script>

<style>
// 色彩系统
#FF9F29: #FF9F29;
#333333: #1A1A1A;
#666666: #667085;
#999999: #94A3B8;
#F8F8F8: #F7F8FA;
#FFFFFF: #FFFFFF;
#E8E8E8: #EEF0F3;

.service-page {
  min-height: 100vh;
  background: #F8F8F8;
  padding-bottom: 80px; // 为在线客服按钮留出空间
}

// 页面标题
.page-header {
  background: linear-gradient(135deg, #FF9F29, #FFB755);
  padding: 30px 20px 40px;
  text-align: center;
  color: white;

  .page-title {
    display: block;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .page-desc {
    font-size: 14px;
    opacity: 0.9;
  }
}

// 板块标题
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 16px 12px;

  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }
}

// 联系方式
.contact-section {
  .contact-list {
    background: #FFFFFF;
    margin: 0 16px;
    border-radius: 12px;
    overflow: hidden;

    .contact-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #E8E8E8;

      .last-child {
        border-bottom: none;
      }

      .active {
        background: #F7F8FA;
      }

      .contact-info {
        flex: 1;

        .contact-name {
          display: block;
          font-size: 14px;
          color: #333333;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .contact-value {
          display: block;
          font-size: 13px;
          color: #666666;
        }
      }
    }
  }
}

// 服务时间
.service-time-section  { .time-card { background: #FFFFFF;
    margin: 0 16px;
    border-radius: 12px;
    padding: 16px;

    .time-item { display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #E8E8E8;

      .last-child { border-bottom: none; }.time-label { font-size: 14px;
        color: #333333; }.time-value { font-size: 14px;
        color: #FF9F29;
        font-weight: 500; } }
  }
}

// 常见问题
.faq-section  { .faq-list { background: #FFFFFF;
    margin: 0 16px;
    border-radius: 12px;
    overflow: hidden;

    .faq-item { border-bottom: 1px solid #E8E8E8;

      .last-child { border-bottom: none; }.faq-question { display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;

        .active { background: #F7F8FA; }.question-text { flex: 1;
          font-size: 14px;
          color: #333333;
          font-weight: 500;
          margin-right: 16px; } }

      .faq-answer {
        padding: 0 16px 16px;
        border-top: 1px solid #E8E8E8;

        .answer-text {
          font-size: 13px;
          color: #666666;
          line-height: 1.6;
        }
      }
    }
  }
}

// 在线客服按钮
.online-service {
  position: fixed;
  bottom: 100px; // 避开tabBar
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;

  .online-service-content {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FF9F29;
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(255, 159, 41, 0.3);

    .active {
      transform: scale(0.95);
    }

    .online-service-text {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>

