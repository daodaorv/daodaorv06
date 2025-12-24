<template>
  <view class="create-page">
    <!-- 进度指示器 -->
    <view class="progress-bar">
      <view class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <view class="step-number">1</view>
        <text class="step-text">车型信息</text>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 1 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <view class="step-number">2</view>
        <text class="step-text">份额设置</text>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 2 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <view class="step-number">3</view>
        <text class="step-text">项目描述</text>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 3 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 4 }">
        <view class="step-number">4</view>
        <text class="step-text">协议确认</text>
      </view>
    </view>

    <!-- 步骤1：车型信息 -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="model-info-card">
        <image :src="model.thumbnail" class="model-img" mode="aspectFill"></image>
        <view class="model-details">
          <text class="model-name">{{ model.name }}</text>
          <text class="model-brand">{{ model.brand }}</text>
          <view class="model-price">
            <text class="price-label">购置价</text>
            <text class="price-value">¥{{ (model.purchasePrice / 10000).toFixed(1) }}万</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">项目标题</view>
        <u-input
          v-model="formData.title"
          placeholder="请输入众筹项目标题（建议包含车型和用途）"
          :maxlength="50"
          :show-word-limit="true"
        ></u-input>
      </view>

      <view class="tip-card">
        <u-icon name="lightbulb" size="16" color="#2196F3"></u-icon>
        <text>建议标题格式：车型名称 + 用途/特点，如"上汽大通RG10 - 川西环线专用车"</text>
      </view>
    </view>

    <!-- 步骤2：份额设置 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="form-section">
        <view class="section-title">总份额数</view>
        <view class="number-input-row">
          <u-number-box
            v-model="formData.totalShares"
            :min="2"
            :max="20"
            @change="calculateShares"
          ></u-number-box>
          <text class="suggest-text">建议：{{ model.suggestedShares }}份</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">单份价格（元）</view>
        <view class="number-input-row">
          <u-input
            v-model="formData.pricePerShare"
            type="number"
            placeholder="请输入单份价格"
            @input="calculateTotal"
          ></u-input>
          <text class="suggest-text">建议：¥{{ model.suggestedPricePerShare.toLocaleString() }}</text>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">众筹期限（天）</view>
        <u-number-box
          v-model="formData.duration"
          :min="7"
          :max="90"
        ></u-number-box>
      </view>

      <view class="preview-card">
        <view class="preview-title">众筹方案预览</view>
        <view class="preview-row">
          <text class="preview-label">总份额</text>
          <text class="preview-value">{{ formData.totalShares }}份</text>
        </view>
        <view class="preview-row">
          <text class="preview-label">单份价格</text>
          <text class="preview-value">¥{{ Number(formData.pricePerShare).toLocaleString() }}</text>
        </view>
        <view class="preview-row">
          <text class="preview-label">众筹总额</text>
          <text class="preview-value primary">¥{{ totalAmount.toLocaleString() }}</text>
        </view>
        <view class="preview-row">
          <text class="preview-label">众筹期限</text>
          <text class="preview-value">{{ formData.duration }}天</text>
        </view>
      </view>

      <view class="warning-card">
        <u-icon name="warning" size="16" color="#FF9800"></u-icon>
        <text>车辆购置价格不包含税费、上牌等附加费用，相关费用需众筹完成后根据实际费用和各自份额自行缴纳</text>
      </view>
    </view>

    <!-- 步骤3：项目描述 -->
    <view v-if="currentStep === 3" class="step-content">
      <view class="form-section">
        <view class="section-title">项目描述</view>
        <u-textarea
          v-model="formData.description"
          placeholder="请详细描述您的众筹计划，包括车辆用途、运营计划、收益预期等"
          :maxlength="500"
          :show-word-limit="true"
          height="300"
        ></u-textarea>
      </view>

      <view class="form-section">
        <view class="section-title">项目图片（最多3张）</view>
        <u-upload
          :file-list="formData.images"
          :max-count="3"
          @afterRead="afterRead"
          @delete="deleteImage"
        ></u-upload>
      </view>

      <view class="form-section">
        <view class="section-title">联系人信息</view>
        <u-input
          v-model="formData.contact.name"
          placeholder="请输入联系人姓名"
          style="margin-bottom: 20rpx"
        ></u-input>
        <u-input
          v-model="formData.contact.phone"
          type="number"
          placeholder="请输入联系电话"
          :maxlength="11"
        ></u-input>
      </view>
    </view>

    <!-- 步骤4：协议确认 -->
    <view v-if="currentStep === 4" class="step-content">
      <view class="agreement-section">
        <view class="agreement-title">众筹托管协议</view>
        <scroll-view class="agreement-content" scroll-y>
          <text class="agreement-text">
【重要提示】

1. 众筹托管为用户自发行为，叨叨房车仅提供服务和监管，不承担法律责任义务

2. 车辆购置价格不包含各类税费及上牌等附加费用

3. 相关费用需用户在众筹完成后根据实际费用和各自份额自行收集缴纳

4. 叨叨房车可代为监管服务但不承担相应法律责任义务

5. 投资有风险，参与需谨慎

【众筹规则】

1. 众筹项目需经平台审核后方可发布

2. 众筹期限内未达到目标金额，项目自动失败，资金原路退回

3. 众筹成功后，平台将统一代购车辆

4. 车辆购置完成后，参与者需指定托管代表签署托管协议

5. 车辆托管运营期间，收益按份额比例自动分配

【风险提示】

1. 房车托管收益受市场环境、季节因素等影响，实际收益可能与预估存在差异

2. 车辆运营过程中可能产生维修、保养等费用，将按份额比例分摊

3. 份额交易价格由市场决定，可能存在溢价或折价

4. 请理性投资，不要超出自身承受能力
          </text>
        </scroll-view>
      </view>

      <view class="checkbox-row">
        <u-checkbox-group v-model="formData.agreeToTerms">
          <u-checkbox :name="true" shape="circle"></u-checkbox>
        </u-checkbox-group>
        <text class="checkbox-text">我已阅读并同意《众筹托管协议》</text>
      </view>

      <view class="final-preview">
        <view class="preview-title">最终确认</view>
        <view class="preview-item">
          <text class="item-label">项目标题</text>
          <text class="item-value">{{ formData.title }}</text>
        </view>
        <view class="preview-item">
          <text class="item-label">总份额</text>
          <text class="item-value">{{ formData.totalShares }}份</text>
        </view>
        <view class="preview-item">
          <text class="item-label">单份价格</text>
          <text class="item-value">¥{{ Number(formData.pricePerShare).toLocaleString() }}</text>
        </view>
        <view class="preview-item">
          <text class="item-label">众筹总额</text>
          <text class="item-value primary">¥{{ totalAmount.toLocaleString() }}</text>
        </view>
        <view class="preview-item">
          <text class="item-label">联系人</text>
          <text class="item-value">{{ formData.contact.name }} {{ formData.contact.phone }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button v-if="currentStep > 1" class="action-btn secondary" @click="prevStep">
        上一步
      </button>
      <button v-if="currentStep < 4" class="action-btn primary" @click="nextStep">
        下一步
      </button>
      <button v-if="currentStep === 4" class="action-btn primary" :disabled="!canSubmit" @click="submit">
        提交审核
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCrowdfundingModelDetail, createCrowdfundingProject } from '@/api/crowdfunding'
import type { CrowdfundingVehicleModel } from '@/types/crowdfunding'
import { logger } from '@/utils/logger'

// 数据定义
const currentStep = ref(1)
const modelId = ref('')
const model = ref<CrowdfundingVehicleModel>({
  id: '',
  name: '',
  brand: '',
  images: [],
  thumbnail: '',
  purchasePrice: 0,
  suggestedShares: 10,
  suggestedPricePerShare: 0,
  estimatedMonthlyIncome: 0,
  estimatedAnnualReturn: 0,
  description: '',
  specifications: {
    seats: 0,
    length: 0,
    width: 0,
    height: 0,
    capacity: 0,
    fuelType: ''
  },
  isHot: false,
  crowdfundingCount: 0
})

const formData = ref({
  title: '',
  totalShares: 10,
  pricePerShare: 0,
  duration: 30,
  description: '',
  images: [] as any[],
  contact: {
    name: '',
    phone: '',
    email: ''
  },
  agreeToTerms: false
})

// 计算总金额
const totalAmount = computed(() => {
  return formData.value.totalShares * Number(formData.value.pricePerShare)
})

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.agreeToTerms &&
    formData.value.title &&
    formData.value.contact.name &&
    formData.value.contact.phone
})

// 页面加载
onLoad((options: any) => {
  if (options.modelId) {
    modelId.value = options.modelId
    loadModelDetail()
  }
})

// 加载车型详情
const loadModelDetail = async () => {
  try {
    const res = await getCrowdfundingModelDetail(modelId.value)
    if (res.code === 0) {
      model.value = res.data
      // 设置默认值
      formData.value.totalShares = model.value.suggestedShares
      formData.value.pricePerShare = model.value.suggestedPricePerShare
      formData.value.title = `${model.value.brand}${model.value.name} 众筹计划`
    }
  } catch (error) {
    logger.error('加载车型详情失败', error)
  }
}

// 计算份额
const calculateShares = () => {
  if (model.value.purchasePrice > 0) {
    formData.value.pricePerShare = Math.round(model.value.purchasePrice / formData.value.totalShares)
  }
}

// 计算总额
const calculateTotal = () => {
  // 触发计算
}

// 上传图片
const afterRead = (event: any) => {
  const file = Array.isArray(event.file) ? event.file[0] : event.file
  formData.value.images.push({
    url: file.url,
    status: 'success'
  })
}

// 删除图片
const deleteImage = (event: any) => {
  formData.value.images.splice(event.index, 1)
}

// 下一步
const nextStep = () => {
  if (currentStep.value === 1) {
    if (!formData.value.title) {
      uni.showToast({
        title: '请输入项目标题',
        icon: 'none'
      })
      return
    }
  } else if (currentStep.value === 2) {
    if (formData.value.pricePerShare < 1000) {
      uni.showToast({
        title: '单份价格不能低于1000元',
        icon: 'none'
      })
      return
    }
  } else if (currentStep.value === 3) {
    if (!formData.value.description) {
      uni.showToast({
        title: '请输入项目描述',
        icon: 'none'
      })
      return
    }
    if (!formData.value.contact.name || !formData.value.contact.phone) {
      uni.showToast({
        title: '请填写联系人信息',
        icon: 'none'
      })
      return
    }
  }

  currentStep.value++
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 提交
const submit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请阅读并同意协议',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '提交中...'
    })

    const res = await createCrowdfundingProject({
      modelId: modelId.value,
      title: formData.value.title,
      totalShares: formData.value.totalShares,
      pricePerShare: Number(formData.value.pricePerShare),
      duration: formData.value.duration,
      description: formData.value.description,
      images: formData.value.images.map(img => img.url),
      contact: formData.value.contact,
      agreeToTerms: formData.value.agreeToTerms
    })

    uni.hideLoading()

    if (res.code === 0) {
      uni.showToast({
        title: '提交成功，等待审核',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    uni.hideLoading()
    logger.error('提交众筹项目失败', error)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.create-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 120rpx;
}

// 进度指示器
.progress-bar {
  background: #FFFFFF;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;

    .step-number {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: #E5E6EB;
      color: #86909C;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: 600;
      transition: all 0.3s;
    }

    .step-text {
      font-size: 22rpx;
      color: #86909C;
      transition: all 0.3s;
    }

    &.active {
      .step-number {
        background: #9C27B0;
        color: #FFFFFF;
      }

      .step-text {
        color: #9C27B0;
        font-weight: 600;
      }
    }

    &.completed {
      .step-number {
        background: #00B578;
        color: #FFFFFF;
      }
    }
  }

  .progress-line {
    flex: 1;
    height: 2rpx;
    background: #E5E6EB;
    margin: 0 16rpx;
    transition: all 0.3s;

    &.active {
      background: #9C27B0;
    }
  }
}

// 步骤内容
.step-content {
  padding: 0 32rpx;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 车型信息卡片
.model-info-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 20rpx;

  .model-img {
    width: 160rpx;
    height: 120rpx;
    border-radius: 12rpx;
    background: #F0F0F0;
  }

  .model-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .model-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;
    }

    .model-brand {
      font-size: 22rpx;
      color: #86909C;
    }

    .model-price {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-label {
        font-size: 22rpx;
        color: #86909C;
      }

      .price-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #9C27B0;
      }
    }
  }
}

// 表单区域
.form-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 20rpx;
  }

  .number-input-row {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .suggest-text {
      font-size: 24rpx;
      color: #86909C;
    }
  }
}

// 提示卡片
.tip-card {
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;

  text {
    flex: 1;
    font-size: 24rpx;
    color: #2196F3;
    line-height: 1.6;
  }
}

// 预览卡片
.preview-card {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .preview-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 20rpx;
  }

  .preview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .preview-label {
      font-size: 26rpx;
      color: #86909C;
    }

    .preview-value {
      font-size: 28rpx;
      font-weight: 600;
      color: #1D2129;

      &.primary {
        font-size: 32rpx;
        color: #9C27B0;
      }
    }
  }
}

// 警告卡片
.warning-card {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;

  text {
    flex: 1;
    font-size: 24rpx;
    color: #FF9800;
    line-height: 1.6;
  }
}

// 协议区域
.agreement-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .agreement-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 20rpx;
  }

  .agreement-content {
    height: 600rpx;
    padding: 20rpx;
    background: #F8F9FC;
    border-radius: 12rpx;

    .agreement-text {
      font-size: 24rpx;
      color: #4E5969;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}

// 复选框行
.checkbox-row {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;

  .checkbox-text {
    font-size: 26rpx;
    color: #1D2129;
  }
}

// 最终预览
.final-preview {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .preview-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 20rpx;
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #F2F3F5;

    &:last-child {
      border-bottom: none;
    }

    .item-label {
      font-size: 26rpx;
      color: #86909C;
    }

    .item-value {
      font-size: 26rpx;
      font-weight: 600;
      color: #1D2129;

      &.primary {
        color: #9C27B0;
        font-size: 30rpx;
      }
    }
  }
}

// 底部按钮
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

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }

    &.secondary {
      background: #F8F9FC;
      color: #9C27B0;
    }

    &.primary {
      background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
      color: #FFFFFF;

      &[disabled] {
        opacity: 0.5;
      }
    }
  }
}
</style>
