<template>
  <view class="agreement-page">
    <!-- 头部 -->
    <view class="agreement-header">
      <text class="agreement-title">{{ pageTitle }}</text>
      <text class="update-time">更新日期：{{ updateDate }}</text>
    </view>

    <!-- 内容 -->
    <scroll-view class="agreement-content" scroll-y="true">
      <!-- 用户协议内容 -->
      <view v-if="type === 'user'" class="content-sections">
        <view class="content-section">
          <text class="section-title">1. 服务条款的确认和接纳</text>
          <text class="section-content">
            欢迎使用叨叨房车平台！叨叨房车平台（以下简称"本平台"）由叨叨房车科技有限公司运营，提供房车租赁相关服务。

            请您在使用本平台服务前，仔细阅读并充分理解本用户协议（以下简称"本协议"）的全部内容。如果您不同意本协议的任何条款，请立即停止使用本平台服务。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">2. 服务说明</text>
          <text class="section-content">
            2.1 本平台提供房车租赁信息展示、在线预订、支付结算、评价等相关服务。

            2.2 本平台仅作为信息展示和交易撮合平台，不直接提供房车租赁服务，实际的租赁服务由合作的房车车主或租赁公司提供。

            2.3 本平台保留随时修改、中止或终止服务的权利，并会尽可能提前通知用户。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">3. 用户注册与账户</text>
          <text class="section-content">
            3.1 您在使用本平台服务前需要注册账户，注册时应当提供真实、准确、完整的个人信息。

            3.2 您有责任维护账户信息的保密性，并对您账户下的所有活动承担责任。

            3.3 如发现他人未经授权使用您的账户，请立即通知本平台。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">4. 预订与支付</text>
          <text class="section-content">
            4.1 通过本平台预订房车服务，即表示您同意向房车车主或租赁公司支付相应的费用。

            4.2 支付方式包括但不限于微信支付、支付宝等第三方支付平台。

            4.3 预订成功后，您将收到电子订单确认信息，请仔细核对订单详情。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">5. 用户责任</text>
          <text class="section-content">
            5.1 您承诺在使用本平台服务时遵守相关法律法规，不利用平台从事违法活动。

            5.2 您应当提供真实、准确的身份信息和联系方式，确保能够顺利完成交易。

            5.3 您应当爱护租赁的房车及相关设备，如发生损坏需承担相应责任。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">6. 隐私保护</text>
          <text class="section-content">
            6.1 本平台重视用户隐私保护，将按照相关法律法规和本平台隐私政策处理您的个人信息。

            6.2 本平台不会向任何第三方出售、转让或分享您的个人信息，除非获得您的明确同意或法律法规要求。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">7. 知识产权</text>
          <text class="section-content">
            7.1 本平台的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等均受法律保护。

            7.2 未经本平台书面许可，任何人不得擅自使用、复制、修改、传播上述内容。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">8. 免责声明</text>
          <text class="section-content">
            8.1 本平台不对房车车主或租赁公司提供的服务质量承担责任，仅提供信息展示和交易撮合服务。

            8.2 因不可抗力、网络故障、系统维护等原因导致的服务中断，本平台不承担责任。

            8.3 用户通过本平台进行的交易产生的任何争议，由用户与房车车主或租赁公司自行协商解决。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">9. 争议解决</text>
          <text class="section-content">
            9.1 本协议的解释和争议解决适用中华人民共和国法律。

            9.2 如发生争议，双方应友好协商解决；协商不成的，任何一方可向本平台运营方所在地人民法院提起诉讼。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">10. 联系我们</text>
          <text class="section-content">
            如您对本协议有任何疑问或建议，请通过以下方式联系我们：

            客服电话：400-123-4567
            客服邮箱：service@daodaorv.com
            公司地址：深圳市南山区科技园
          </text>
        </view>
      </view>

      <!-- 隐私政策内容 -->
      <view v-else class="content-sections">
        <view class="content-section">
          <text class="section-title">1. 引言</text>
          <text class="section-content">
            叨叨房车平台（以下简称"我们"或"本平台"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。

            我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">2. 我们如何收集和使用您的个人信息</text>
          <text class="section-content">
            2.1 我们仅收集实现产品功能所必需的信息，包括：

            • 账户信息：手机号码、微信授权信息等
            • 身份信息：姓名、身份证号、驾驶证信息等
            • 联系信息：地址、邮箱等
            • 支付信息：银行卡信息、第三方支付账户等
            • 位置信息：取还车位置、GPS轨迹等
            • 设备信息：设备型号、操作系统、IP地址等

            2.2 我们使用您的个人信息用于：

            • 提供基本的房车租赁服务
            • 处理订单和支付
            • 进行身份验证和信用评估
            • 提供客户服务和支持
            • 发送服务通知和营销信息
            • 改进产品和服务质量
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">3. 我们如何使用Cookie和同类技术</text>
          <text class="section-content">
            3.1 我们使用Cookie来改善您的使用体验，记住您的偏好设置。

            3.2 您可以通过浏览器设置拒绝或管理Cookie，但这可能影响部分功能的正常使用。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">4. 我们如何共享、转让、公开披露您的个人信息</text>
          <text class="section-content">
            4.1 共享原则：未经您同意，我们不会与本公司以外的任何公司、组织和个人分享您的个人信息。

            4.2 在以下情况下，我们会共享您的个人信息：

            • 与房车车主或租赁公司共享必要信息以完成服务
            • 与第三方支付机构共享支付相关信息
            • 与物流服务提供商共享配送信息
            • 获得明确授权的情况下

            4.3 转让：除非获得您的明确同意，我们不会将您的个人信息转让给任何公司、组织或个人。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">5. 我们如何保护您的个人信息</text>
          <text class="section-content">
            5.1 我们已使用符合业界标准的安全防护技术保护您的个人信息。

            5.2 我们建立专门的管理制度、流程和组织保障信息安全。

            5.3 如发生个人信息泄露事件，我们会立即启动应急预案，并按照法律法规要求及时告知您。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">6. 您的权利</text>
          <text class="section-content">
            6.1 访问您的个人信息：您有权访问您的个人信息。

            6.2 更正您的个人信息：当您发现信息不准确时，有权更正。

            6.3 删除您的个人信息：在特定情形下，您可以要求删除个人信息。

            6.4 改变授权范围：您可以随时选择取消授权。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">7. 本政策如何更新</text>
          <text class="section-content">
            我们的隐私政策可能变更。未经您的明确同意，我们不会削减您按照本隐私政策所应享有的权利。

            我们会在本页面上发布对本政策所做的任何变更，并通过适当方式通知您。
          </text>
        </view>

        <view class="content-section">
          <text class="section-title">8. 如何联系我们</text>
          <text class="section-content">
            如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：

            客服电话：400-123-4567
            隐私邮箱：privacy@daodaorv.com
            公司地址：深圳市南山区科技园

            我们会尽快审核所涉问题，并在验证您的用户身份后及时予以回复。
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 接收参数
const props = defineProps({
  type: {
    type: String,
    default: 'user' // 'user' or 'privacy'
  }
});

// 计算属性
const pageTitle = computed(() => {
  return props.type === 'user' ? '用户协议' : '隐私政策';
});

const updateDate = computed(() => {
  return '2024年11月15日';
});

// 页面加载
onMounted(() => {
  // 可以从URL参数获取类型
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.type) {
    // 更新类型
    console.log('页面类型:', options.type);
  }
});
</script>

<style>
.agreement-page {
  min-height: 100vh;
  background-color: #ffffff;
}

// 头部
.agreement-header {
  padding: 48rpx 32rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 2rpx solid #f0f0f0;
  text-align: center;

  .agreement-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
    margin-bottom: 12rpx;
  }

  .update-time {
    font-size: 26rpx;
    color: rgba(0, 0, 0, 0.6);
  }
}

// 内容
.agreement-content {
  height: calc(100vh - 160rpx);
  padding: 32rpx;
}

.content-sections  { .content-section { margin-bottom: 48rpx;

    .last-child { margin-bottom: 0; }.section-title { display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
      margin-bottom: 16rpx;
      line-height: 1.4; }.section-content { font-size: 28rpx;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.8;
      white-space: pre-wrap; } }
}
</style>