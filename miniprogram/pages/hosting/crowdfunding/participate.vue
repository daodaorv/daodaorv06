<template>
  <view class="participate-page">
    <!-- 项目信息卡片 -->
    <view class="project-card">
      <image :src="project.model.thumbnail" class="project-img" mode="aspectFill"></image>
      <view class="project-info">
        <text class="project-title">{{ project.title }}</text>
        <view class="project-meta">
          <text class="meta-text">{{ project.model.brand }} {{ project.model.name }}</text>
        </view>
        <view class="progress-info">
          <text class="progress-text">众筹进度 {{ project.progress }}%</text>
          <text class="remaining-text">剩余{{ project.remainingShares }}份</text>
        </view>
      </view>
    </view>

    <!-- 份额选择 -->
    <view class="share-section">
      <view class="section-title">选择购买份额</view>
      <view class="share-selector">
        <view class="selector-row">
          <text class="selector-label">购买份额数</text>
          <u-number-box
            v-model="selectedShares"
            :min="1"
            :max="project.remainingShares"
            @change="calculateTotal"
          ></u-number-box>
        </view>
        <view class="selector-tip">
          <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
          <text>最多可购买 {{ project.remainingShares }} 份</text>
        </view>
      </view>
    </view>

    <!-- 参与者信息 -->
    <view class="participant-section">
      <view class="section-title">
        <text>参与者信息</text><text class="required-mark">*</text>
      </view>

      <!-- 参与者类型选择 -->
      <view class="type-selector">
        <view
          class="type-option"
          :class="{ active: participantType === 'individual' }"
          @tap="participantType = 'individual'"
        >
          <u-icon
            :name="participantType === 'individual' ? 'checkbox-mark' : 'checkbox'"
            size="20"
            :color="participantType === 'individual' ? '#9C27B0' : '#C0C4CC'"
          ></u-icon>
          <text>个人参与</text>
        </view>
        <view
          class="type-option"
          :class="{ active: participantType === 'company' }"
          @tap="participantType = 'company'"
        >
          <u-icon
            :name="participantType === 'company' ? 'checkbox-mark' : 'checkbox'"
            size="20"
            :color="participantType === 'company' ? '#9C27B0' : '#C0C4CC'"
          ></u-icon>
          <text>企业参与</text>
        </view>
      </view>

      <!-- 个人信息表单 -->
      <view v-if="participantType === 'individual'" class="info-form">
        <view class="form-item">
          <text class="form-label">姓名<text class="required-mark">*</text></text>
          <input
            v-model="individualInfo.name"
            class="form-input"
            placeholder="请输入真实姓名"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">电话号码<text class="required-mark">*</text></text>
          <input
            v-model="individualInfo.phone"
            class="form-input"
            type="number"
            placeholder="请输入手机号码"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">身份证号<text class="required-mark">*</text></text>
          <input
            v-model="individualInfo.idCardNumber"
            class="form-input"
            placeholder="请输入身份证号码"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 身份证照片上传 -->
        <view class="form-item-full">
          <text class="form-label">身份证照片<text class="required-mark">*</text></text>
          <view class="id-card-upload">
            <view class="upload-card" @tap="uploadIdCard('front')">
              <image
                v-if="individualInfo.idCardFrontImage"
                :src="individualInfo.idCardFrontImage"
                class="id-card-image"
                mode="aspectFill"
              ></image>
              <view v-else class="upload-placeholder">
                <u-icon name="camera-fill" size="32" color="#9C27B0"></u-icon>
                <text>点击上传</text>
                <text class="upload-tip">身份证正面</text>
              </view>
            </view>
            <view class="upload-card" @tap="uploadIdCard('back')">
              <image
                v-if="individualInfo.idCardBackImage"
                :src="individualInfo.idCardBackImage"
                class="id-card-image"
                mode="aspectFill"
              ></image>
              <view v-else class="upload-placeholder">
                <u-icon name="camera-fill" size="32" color="#9C27B0"></u-icon>
                <text>点击上传</text>
                <text class="upload-tip">身份证反面</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 企业信息表单 -->
      <view v-if="participantType === 'company'" class="info-form">
        <view class="form-item">
          <text class="form-label">公司名称<text class="required-mark">*</text></text>
          <input
            v-model="companyInfo.name"
            class="form-input"
            placeholder="请输入公司全称"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">联系电话<text class="required-mark">*</text></text>
          <input
            v-model="companyInfo.phone"
            class="form-input"
            type="number"
            placeholder="请输入联系电话"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 营业执照上传 -->
        <view class="form-item-full">
          <text class="form-label">营业执照<text class="required-mark">*</text></text>
          <view class="license-upload">
            <view class="upload-card large" @tap="uploadBusinessLicense">
              <image
                v-if="companyInfo.businessLicenseImage"
                :src="companyInfo.businessLicenseImage"
                class="license-image"
                mode="aspectFill"
              ></image>
              <view v-else class="upload-placeholder">
                <u-icon name="camera-fill" size="40" color="#9C27B0"></u-icon>
                <text>点击上传营业执照</text>
                <text class="upload-tip">请确保照片清晰可辨识</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="cost-section">
      <view class="section-title">费用明细</view>
      <view class="cost-list">
        <view class="cost-item">
          <text class="cost-label">单份价格</text>
          <text class="cost-value">¥{{ project.pricePerShare.toLocaleString() }}</text>
        </view>
        <view class="cost-item">
          <text class="cost-label">购买份额</text>
          <text class="cost-value">{{ selectedShares }}份</text>
        </view>
        <view class="cost-divider"></view>
        <view class="cost-item total">
          <text class="cost-label">应付金额</text>
          <view class="cost-value-wrapper">
            <text class="currency">¥</text>
            <text class="amount">{{ totalAmount.toLocaleString() }}</text>
          </view>
        </view>
      </view>

      <view class="cost-notice">
        <u-icon name="warning" size="14" color="#FF9800"></u-icon>
        <text>车辆购置价格不包含税费、上牌等附加费用，相关费用需众筹完成后根据实际费用和各自份额自行缴纳</text>
      </view>
    </view>

    <!-- 收益预估 -->
    <view class="income-section">
      <view class="section-title">您的收益预估</view>
      <view class="income-grid">
        <view class="income-item">
          <text class="income-label">预估月收益</text>
          <text class="income-value">¥{{ estimatedMonthlyIncome.toLocaleString() }}</text>
        </view>
        <view class="income-item">
          <text class="income-label">预估年化收益率</text>
          <text class="income-value highlight">{{ project.estimatedAnnualReturn }}%</text>
        </view>
      </view>
      <view class="income-tip">
        <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
        <text>以上为整车预估收益，实际收益按您的份额比例（{{ shareRatio }}%）分配</text>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="risk-section">
      <view class="risk-header">
        <u-icon name="warning" size="18" color="#FF9800"></u-icon>
        <text class="risk-title">风险提示</text>
      </view>
      <view class="risk-content">
        <text class="risk-item">• 众筹托管为用户自发行为，平台不承担法律责任</text>
        <text class="risk-item">• 实际收益可能与预估存在差异</text>
        <text class="risk-item">• 投资有风险，参与需谨慎</text>
      </view>
    </view>

    <!-- 协议确认 -->
    <view class="agreement-section">
      <view class="checkbox-row" @click="toggleAgreement">
        <u-checkbox-group v-model="agreeToTerms">
          <u-checkbox :name="true" shape="circle"></u-checkbox>
        </u-checkbox-group>
        <text class="checkbox-text">
          我已阅读并同意
          <text class="link-text" @click.stop="viewAgreement">《众筹托管协议》</text>
        </text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">应付金额</text>
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
        确认参与
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCrowdfundingProjectDetail, participateCrowdfunding } from '@/api/crowdfunding'
import type { CrowdfundingProject } from '@/types/crowdfunding'
import { ParticipantType } from '@/types/crowdfunding'
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
  status: 'funding' as any,
  statusText: '',
  startTime: '',
  endTime: '',
  remainingDays: 0,
  estimatedMonthlyIncome: 0,
  estimatedAnnualReturn: 0,
  description: '',
  images: [],
  agreementUrl: '',
  isParticipated: false,
  myShares: 0,
  createdAt: '',
  updatedAt: ''
})

const selectedShares = ref(1)
const agreeToTerms = ref(false)

// 参与者类型
const participantType = ref<'individual' | 'company'>('individual')

// 个人信息
const individualInfo = ref({
  name: '',
  phone: '',
  idCardNumber: '',
  idCardFrontImage: '',
  idCardBackImage: ''
})

// 企业信息
const companyInfo = ref({
  name: '',
  phone: '',
  businessLicenseImage: ''
})

// 计算总金额
const totalAmount = computed(() => {
  return selectedShares.value * project.value.pricePerShare
})

// 计算预估月收益
const estimatedMonthlyIncome = computed(() => {
  const ratio = selectedShares.value / project.value.totalShares
  return Math.round(project.value.estimatedMonthlyIncome * ratio)
})

// 计算份额比例
const shareRatio = computed(() => {
  const ratio = (selectedShares.value / project.value.totalShares) * 100
  return ratio.toFixed(2)
})

// 验证参与者信息是否完整
const isParticipantInfoValid = computed(() => {
  if (participantType.value === 'individual') {
    return (
      individualInfo.value.name.trim() !== '' &&
      individualInfo.value.phone.trim() !== '' &&
      individualInfo.value.idCardNumber.trim() !== '' &&
      individualInfo.value.idCardFrontImage !== '' &&
      individualInfo.value.idCardBackImage !== ''
    )
  } else {
    return (
      companyInfo.value.name.trim() !== '' &&
      companyInfo.value.phone.trim() !== '' &&
      companyInfo.value.businessLicenseImage !== ''
    )
  }
})

// 是否可以提交
const canSubmit = computed(() => {
  return (
    selectedShares.value > 0 &&
    selectedShares.value <= project.value.remainingShares &&
    isParticipantInfoValid.value &&
    agreeToTerms.value
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

// 切换协议同意状态
const toggleAgreement = () => {
  agreeToTerms.value = !agreeToTerms.value
}

// 查看协议
const viewAgreement = () => {
  uni.navigateTo({
    url: `/pages/common/webview?url=${encodeURIComponent(project.value.agreementUrl)}`
  })
}

// 上传身份证照片
const uploadIdCard = (type: 'front' | 'back') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0]
      if (tempPath) {
        uni.showLoading({ title: '上传中...' })
        try {
          // Mock上传实现
          await new Promise(resolve => setTimeout(resolve, 1500))
          const url = `https://mock-cdn.example.com/id-card/${type}/${Date.now()}.jpg`

          if (type === 'front') {
            individualInfo.value.idCardFrontImage = url
          } else {
            individualInfo.value.idCardBackImage = url
          }

          uni.hideLoading()
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } catch (error) {
          uni.hideLoading()
          logger.error('上传身份证照片失败', error)
          uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 上传营业执照
const uploadBusinessLicense = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0]
      if (tempPath) {
        uni.showLoading({ title: '上传中...' })
        try {
          // Mock上传实现
          await new Promise(resolve => setTimeout(resolve, 1500))
          const url = `https://mock-cdn.example.com/business-license/${Date.now()}.jpg`

          companyInfo.value.businessLicenseImage = url

          uni.hideLoading()
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } catch (error) {
          uni.hideLoading()
          logger.error('上传营业执照失败', error)
          uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 验证手机号格式
const validatePhone = (phone: string): boolean => {
  const phoneReg = /^1[3-9]\d{9}$/
  return phoneReg.test(phone)
}

// 验证身份证号格式
const validateIdCard = (idCard: string): boolean => {
  const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardReg.test(idCard)
}

// 提交参与
const handleSubmit = async () => {
  if (!canSubmit.value) {
    return
  }

  // 验证参与者信息
  if (participantType.value === 'individual') {
    if (!validatePhone(individualInfo.value.phone)) {
      uni.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    if (!validateIdCard(individualInfo.value.idCardNumber)) {
      uni.showToast({
        title: '请输入正确的身份证号码',
        icon: 'none'
      })
      return
    }
  } else {
    if (!validatePhone(companyInfo.value.phone)) {
      uni.showToast({
        title: '请输入正确的联系电话',
        icon: 'none'
      })
      return
    }
  }

  try {
    uni.showLoading({
      title: '处理中...'
    })

    // 调用参与众筹API，创建订单
    const res = await participateCrowdfunding({
      projectId: projectId.value,
      shares: selectedShares.value,
      paymentMethod: 'wechat', // 默认值，实际支付方式在支付页面选择
      participantType: participantType.value === 'individual' ? ParticipantType.INDIVIDUAL : ParticipantType.COMPANY,
      individualInfo: participantType.value === 'individual' ? individualInfo.value : undefined,
      companyInfo: participantType.value === 'company' ? companyInfo.value : undefined
    })

    uni.hideLoading()

    if (res.code === 0) {
      // 获取订单信息
      const orderData = res.data

      // 跳转到统一支付页面
      uni.redirectTo({
        url: `/pages/order/pay?orderNo=${orderData.orderNo}&amount=${totalAmount.value}&orderType=crowdfunding&projectId=${projectId.value}`
      })
    } else {
      throw new Error(res.message || '操作失败')
    }
  } catch (error: any) {
    uni.hideLoading()
    logger.error('参与众筹失败', error)
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.participate-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 160rpx;
}

// 项目信息卡片
.project-card {
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

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .progress-text {
        font-size: 24rpx;
        font-weight: 600;
        color: #9C27B0;
      }

      .remaining-text {
        font-size: 22rpx;
        color: #86909C;
      }
    }
  }
}

// 通用样式
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 24rpx;

  .required-mark {
    color: #F53F3F;
    margin-left: 4rpx;
  }
}

// 份额选择
.share-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .share-selector {
    .selector-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .selector-label {
        font-size: 26rpx;
        color: #4E5969;
      }
    }

    .selector-tip {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 16rpx;
      background: rgba(33, 150, 243, 0.1);
      border-radius: 12rpx;

      text {
        font-size: 24rpx;
        color: #2196F3;
      }
    }
  }
}

// 参与者信息
.participant-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .type-selector {
    display: flex;
    gap: 24rpx;
    margin-bottom: 24rpx;

    .type-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      padding: 20rpx;
      background: #F8F9FC;
      border-radius: 12rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      text {
        font-size: 26rpx;
        color: #4E5969;
      }

      &.active {
        background: rgba(156, 39, 176, 0.1);
        border-color: #9C27B0;

        text {
          color: #9C27B0;
          font-weight: 600;
        }
      }
    }
  }

  .info-form {
    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #E5E6EB;

      .form-label {
        font-size: 26rpx;
        color: #1D2129;
        width: 160rpx;
        flex-shrink: 0;

        .required-mark {
          color: #F53F3F;
          margin-left: 4rpx;
        }
      }

      .form-input {
        flex: 1;
        font-size: 26rpx;
        color: #1D2129;
        text-align: right;

        .input-placeholder {
          color: #C0C4CC;
        }
      }
    }

    .form-item-full {
      padding: 24rpx 0;
      border-bottom: 1rpx solid #E5E6EB;

      .form-label {
        font-size: 26rpx;
        color: #1D2129;
        display: block;
        margin-bottom: 20rpx;

        .required-mark {
          color: #F53F3F;
          margin-left: 4rpx;
        }
      }

      .id-card-upload {
        display: flex;
        gap: 20rpx;

        .upload-card {
          flex: 1;
          position: relative;
          padding-bottom: 60%;
          border-radius: 12rpx;
          overflow: hidden;
          background: #F8F9FC;

          .id-card-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .upload-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8rpx;
            border: 2rpx dashed #9C27B0;

            text {
              font-size: 22rpx;
              color: #9C27B0;

              &.upload-tip {
                font-size: 20rpx;
                color: #86909C;
              }
            }
          }
        }
      }

      .license-upload {
        .upload-card {
          position: relative;
          width: 100%;
          padding-bottom: 60%;
          border-radius: 12rpx;
          overflow: hidden;
          background: #F8F9FC;

          &.large {
            padding-bottom: 70%;
          }

          .license-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .upload-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12rpx;
            border: 2rpx dashed #9C27B0;

            text {
              font-size: 24rpx;
              color: #9C27B0;

              &.upload-tip {
                font-size: 20rpx;
                color: #86909C;
              }
            }
          }
        }
      }
    }
  }
}

// 费用明细
.cost-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1D2129;
    margin-bottom: 24rpx;
  }

  .cost-list {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .cost-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .cost-label {
        font-size: 26rpx;
        color: #86909C;
      }

      .cost-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }

      &.total {
        padding-top: 16rpx;

        .cost-label {
          font-size: 28rpx;
          color: #1D2129;
          font-weight: 600;
        }

        .cost-value-wrapper {
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

    .cost-divider {
      height: 1rpx;
      background: #E5E6EB;
      margin: 16rpx 0;
    }
  }

  .cost-notice {
    display: flex;
    align-items: flex-start;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 12rpx;

    text {
      flex: 1;
      font-size: 22rpx;
      color: #FF9800;
      line-height: 1.6;
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

// 协议确认
.agreement-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .checkbox-text {
      font-size: 26rpx;
      color: #1D2129;

      .link-text {
        color: #9C27B0;
        text-decoration: underline;
      }
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
