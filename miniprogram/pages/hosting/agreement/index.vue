<template>
  <view class="hosting-agreement-page">
    <view class="intro-card">
      <text class="title">托管协议摘要</text>
      <text class="desc">
        为保障车主权益，托管协议涵盖车辆交接、收益分配、保险保障以及安全责任等条款。您可以在此快速浏览关键信息，如需查看完整版协议请联系平台客服。
      </text>
    </view>

    <view class="section-card" v-for="section in sections" :key="section.id">
      <view class="section-header">
        <text class="section-title">{{ section.title }}</text>
        <text class="section-tag">{{ section.tag }}</text>
      </view>
      <view class="section-content">
        <view class="section-item" v-for="(item, index) in section.items" :key="index">
          <text class="item-label">{{ item.label }}</text>
          <text class="item-value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <view class="faq-card">
      <view class="faq-header">
        <text class="section-title">常见问题</text>
      </view>
      <view class="faq-item" v-for="faq in faqs" :key="faq.id">
        <text class="faq-question">Q：{{ faq.question }}</text>
        <text class="faq-answer">A：{{ faq.answer }}</text>
      </view>
    </view>

    <view class="contact-card">
      <text class="section-title">联系与反馈</text>
      <view class="contact-row">
        <text class="contact-label">客服热线</text>
        <text class="contact-value">{{ contact.phone }}</text>
      </view>
      <view class="contact-row">
        <text class="contact-label">在线客服</text>
        <text class="contact-value">{{ contact.wechat }}</text>
      </view>
      <view class="contact-row">
        <text class="contact-label">服务时间</text>
        <text class="contact-value">{{ contact.time }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sections: [
        {
          id: 'rights',
          title: '车主权益',
          tag: '收益与保障',
          items: [
            { label: '收益分成', value: '基础收益平台30%，车主70%' },
            { label: '保底补贴', value: '淡季保底 3500 元/月，可叠加活动补贴' },
            { label: '保险责任', value: '车辆全程由平台投保商业险、三者险' }
          ]
        },
        {
          id: 'ops',
          title: '运营规范',
          tag: '车辆交付与维护',
          items: [
            { label: '车辆交接', value: '交车前完成拍照存证、油量/公里数核对' },
            { label: '日常维护', value: '平台负责日常保养，车主可在 App 查看记录' },
            { label: '意外处理', value: '发生事故 30 分钟内通知车主并提供完整报告' }
          ]
        }
      ],
      faqs: [
        {
          id: 'faq1',
          question: '我可以提前取回车辆吗？',
          answer: '可以。请至少提前 5 天在“车主自用”功能提交申请，审核通过后即可取回。'
        },
        {
          id: 'faq2',
          question: '收益何时结算？',
          answer: '每笔订单在用户还车并完成验车后 T+1 日结算至您的托管收益账户。'
        },
        {
          id: 'faq3',
          question: '车辆损伤如何处理？',
          answer: '平台会先行赔付并协助保险报案，定损完成后同步给车主查看。'
        }
      ],
      contact: {
        phone: '400-800-1234',
        wechat: '叨叨房车客服',
        time: '每日 09:00 - 21:00'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.hosting-agreement-page {
  min-height: 100vh;
  background: $uni-bg-color;
  padding: $uni-spacing-xl $uni-spacing-xl 80rpx;
  box-sizing: border-box;
}

.intro-card,
.section-card,
.faq-card,
.contact-card {
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-md;
  display: block;
}

.desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
  line-height: 1.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.section-tag {
  font-size: $uni-font-size-xs;
  color: $uni-color-primary;
  background: rgba($uni-color-primary, 0.1);
  padding: $uni-spacing-xs $uni-spacing-lg;
  border-radius: $uni-radius-btn;
}

.section-item {
  display: flex;
  justify-content: space-between;
  padding: $uni-spacing-lg 0;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
}

.item-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

.item-value {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  width: 60%;
  text-align: right;
}

.faq-card .faq-item {
  margin-bottom: $uni-spacing-xl;

  &:last-child {
    margin-bottom: 0;
  }
}

.faq-question {
  font-size: $uni-font-size-sm;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
  display: block;
}

.faq-answer {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
  line-height: 1.6;
}

.contact-card .contact-row {
  display: flex;
  justify-content: space-between;
  padding: $uni-spacing-md 0;
  font-size: $uni-font-size-sm;
}

.contact-label {
  color: $uni-text-color-placeholder;
}

.contact-value {
  color: $uni-text-color;
  font-weight: 500;
}
</style>
