<template>
  <view class="transfer-pay-page">
    <!-- 订单信息 -->
    <view class="order-section">
      <view class="section-title">订单信息</view>
      <view class="order-info">
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <view class="info-value-box">
            <text class="info-value">{{ orderNo }}</text>
            <text class="copy-btn" @tap="copyText(orderNo)">复制</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">订单类型</text>
          <text class="info-value">{{ orderTypeText }}</text>
        </view>
        <view class="info-row highlight">
          <text class="info-label">应付金额</text>
          <view class="amount-box">
            <text class="currency">¥</text>
            <text class="amount">{{ orderAmount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 转账信息 -->
    <view class="transfer-info-section">
      <view class="section-title">转账信息</view>
      <view class="bank-info">
        <view class="bank-row">
          <text class="bank-label">收款户名</text>
          <view class="bank-value-box">
            <text class="bank-value">叨叨房车租赁有限公司</text>
            <text class="copy-btn" @tap="copyText('叨叨房车租赁有限公司')">复制</text>
          </view>
        </view>
        <view class="bank-row">
          <text class="bank-label">收款账号</text>
          <view class="bank-value-box">
            <text class="bank-value">6228 4800 1234 5678 901</text>
            <text class="copy-btn" @tap="copyText('6228480012345678901')">复制</text>
          </view>
        </view>
        <view class="bank-row">
          <text class="bank-label">开户银行</text>
          <view class="bank-value-box">
            <text class="bank-value">中国工商银行北京分行</text>
            <text class="copy-btn" @tap="copyText('中国工商银行北京分行')">复制</text>
          </view>
        </view>
      </view>
      <view class="transfer-notice">
        <u-icon name="warning" size="16" color="#FF9800"></u-icon>
        <view class="notice-content">
          <text>请务必按照上述金额转账，转账时备注订单号：</text>
          <view class="order-no-highlight">
            <text class="order-no-text">{{ orderNo }}</text>
            <text class="copy-link" @tap.stop="copyText(orderNo)">复制订单号</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 凭证上传 -->
    <view class="upload-section">
      <view class="section-title">
        <text>上传转账凭证</text><text class="required-mark">*</text>
      </view>
      <view class="upload-tip">
        <u-icon name="info-circle" size="14" color="#2196F3"></u-icon>
        <text>请上传转账成功的截图或回单，需清晰可辨识</text>
      </view>
      <view class="upload-grid">
        <view
          class="upload-item"
          v-for="(item, index) in uploadList"
          :key="index">
          <view
            class="upload-card"
            @tap="item.url ? previewImage(index) : chooseImage(index)"
          >
            <image
              v-if="item.url"
              :src="item.url"
              class="upload-image"
              mode="aspectFill"
            ></image>
            <view v-else class="upload-placeholder">
              <u-icon name="camera-fill" size="40" color="#9C27B0"></u-icon>
              <text>点击上传</text>
            </view>
            <view v-if="item.uploading" class="upload-mask">
              <u-loading-icon mode="circle" size="30" color="#FFFFFF"></u-loading-icon>
              <text>上传中...</text>
            </view>
          </view>
          <view class="upload-ops" v-if="item.url">
            <text class="op-link" @tap.stop="previewImage(index)">预览</text>
            <text class="op-link" @tap.stop="chooseImage(index)">重新上传</text>
            <text class="op-link danger" @tap.stop="removeImage(index)">删除</text>
          </view>
        </view>

        <!-- 添加按钮 -->
        <view
          v-if="uploadList.length < maxUploadCount"
          class="upload-item add-btn"
          @tap="addUploadSlot"
        >
          <view class="upload-card">
            <view class="upload-placeholder">
              <u-icon name="plus" size="40" color="#C0C4CC"></u-icon>
              <text>添加图片</text>
            </view>
          </view>
        </view>
      </view>
      <view class="upload-count">
        <text>已上传 {{ uploadedCount }}/{{ maxUploadCount }} 张</text>
      </view>
    </view>

    <!-- 备注说明 -->
    <view class="remark-section">
      <view class="section-title">备注说明（选填）</view>
      <u-textarea
        v-model="remark"
        placeholder="如有特殊说明，请在此填写"
        :maxlength="200"
        count
        height="120"
      ></u-textarea>
    </view>

    <!-- 提示信息 -->
    <view class="tips-section">
      <view class="tips-header">
        <u-icon name="info-circle-fill" size="18" color="#2196F3"></u-icon>
        <text class="tips-title">温馨提示</text>
      </view>
      <view class="tips-content">
        <text class="tip-item">• 上传凭证后，订单状态将变为"待管理端确认"</text>
        <text class="tip-item">• 管理员将在1-3个工作日内审核您的转账凭证</text>
        <text class="tip-item">• 审核通过后，订单将自动进入下一流程</text>
        <text class="tip-item">• 如有疑问，请联系客服：400-123-4567</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <button
        class="save-btn"
        @tap="handleSaveOrder"
      >
        保存订单
      </button>
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        :loading="submitting"
        @tap="handleSubmit"
      >
        提交凭证
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { uploadTransferProof } from '@/api/payment'
import { updateOrderStatus } from '@/api/order'
import { logger } from '@/utils/logger'

// 数据定义
const orderNo = ref('')
const orderAmount = ref(0)
const orderType = ref<'rental' | 'crowdfunding'>('rental')
const projectId = ref('')
const remark = ref('')
const submitting = ref(false)

// 上传列表
const maxUploadCount = 3
const uploadList = ref<Array<{
  url: string
  uploading: boolean
}>>([
  { url: '', uploading: false }
])

// 计算属性
const orderTypeText = computed(() => {
  return orderType.value === 'crowdfunding' ? '众筹托管' : '车辆租赁'
})

const uploadedCount = computed(() => {
  return uploadList.value.filter(item => item.url).length
})

const canSubmit = computed(() => {
  return uploadedCount.value > 0 && !submitting.value
})

// 页面加载
onLoad((options: any) => {
  if (options.orderNo) {
    orderNo.value = options.orderNo
  }
  if (options.amount) {
    orderAmount.value = Number(options.amount)
  }
  if (options.orderType) {
    orderType.value = options.orderType
  }
  if (options.projectId) {
    projectId.value = options.projectId
  }
})

// 复制文本
const copyText = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
}

// 选择图片
const chooseImage = (index: number) => {
  if (uploadList.value[index].uploading) return

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0]
      if (tempPath) {
        uploadList.value[index].url = tempPath
        await uploadImage(index, tempPath)
      }
    }
  })
}

// 上传图片
const uploadImage = async (index: number, localPath: string) => {
  uploadList.value[index].uploading = true
  uni.showLoading({ title: '上传中...' })

  try {
    // Mock上传实现
    await new Promise(resolve => setTimeout(resolve, 1500))
    const url = `https://mock-cdn.example.com/transfer-proof/${Date.now()}.jpg`
    uploadList.value[index].url = url

    uni.showToast({
      title: '上传成功',
      icon: 'success'
    })
  } catch (error) {
    logger.error('上传转账凭证失败', error)
    uploadList.value[index].url = ''
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    })
  } finally {
    uploadList.value[index].uploading = false
    uni.hideLoading()
  }
}

// 预览图片
const previewImage = (index: number) => {
  const urls = uploadList.value.filter(item => item.url).map(item => item.url)
  const current = uploadList.value[index].url

  uni.previewImage({
    urls,
    current
  })
}

// 删除图片
const removeImage = (index: number) => {
  uni.showModal({
    title: '提示',
    content: '确定删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        uploadList.value[index].url = ''
        uni.showToast({
          title: '已删除',
          icon: 'none'
        })
      }
    }
  })
}

// 添加上传位
const addUploadSlot = () => {
  if (uploadList.value.length < maxUploadCount) {
    uploadList.value.push({ url: '', uploading: false })
  }
}

// 保存订单（不上传凭证）
const handleSaveOrder = async () => {
  try {
    uni.showLoading({ title: '保存中...' })

    // 创建待上传凭证状态的订单
    // Mock实现：实际应该调用API保存订单状态
    await new Promise(resolve => setTimeout(resolve, 1000))

    uni.hideLoading()

    uni.showToast({
      title: '订单已保存',
      icon: 'success',
      duration: 2000
    })

    // 延迟跳转到订单列表
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/order/list'
      })
    }, 2000)
  } catch (error: any) {
    uni.hideLoading()
    logger.error('保存订单失败', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  }
}

// 提交凭证
const handleSubmit = async () => {
  if (!canSubmit.value) return

  // 验证至少上传一张图片
  if (uploadedCount.value === 0) {
    uni.showToast({
      title: '请至少上传一张转账凭证',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    uni.showLoading({ title: '提交中...' })

    // 收集已上传的图片URL
    const proofUrls = uploadList.value
      .filter(item => item.url)
      .map(item => item.url)

    // 调用API提交转账凭证
    const res: any = await uploadTransferProof({
      orderNo: orderNo.value,
      proofImages: proofUrls,
      remark: remark.value,
      orderType: orderType.value,
      projectId: projectId.value
    })

    uni.hideLoading()

    if (res.code === 0) {
      // 更新订单状态为"待管理端确认"
      await updateOrderStatus(orderNo.value, 'pending_admin_confirm')

      uni.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟跳转
      setTimeout(() => {
        if (orderType.value === 'crowdfunding') {
          // 众筹订单跳转到众筹详情
          uni.redirectTo({
            url: `/pages/hosting-sub/crowdfunding/detail?projectId=${projectId.value}`
          })
        } else {
          // 租赁订单跳转到订单详情
          uni.redirectTo({
            url: `/pages/order/detail?orderNo=${orderNo.value}`
          })
        }
      }, 2000)
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (error: any) {
    uni.hideLoading()
    logger.error('提交转账凭证失败', error)
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.transfer-pay-page {
  min-height: 100vh;
  background-color: #F8F9FC;
  padding-bottom: 160rpx;
}

// 通用区块样式
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

// 订单信息
.order-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .order-info {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 24rpx;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      &.highlight {
        padding-top: 16rpx;
        border-top: 1rpx solid #E5E6EB;
      }

      .info-label {
        font-size: 26rpx;
        color: #86909C;
      }

      .info-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #1D2129;
      }

      .info-value-box {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .info-value {
          font-size: 28rpx;
          font-weight: 600;
          color: #1D2129;
        }

        .copy-btn {
          font-size: 24rpx;
          color: #9C27B0;
          padding: 6rpx 16rpx;
          background: rgba(156, 39, 176, 0.1);
          border-radius: 8rpx;
        }
      }

      .amount-box {
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

// 转账信息
.transfer-info-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .bank-info {
    background: #F8F9FC;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .bank-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .bank-label {
        font-size: 26rpx;
        color: #86909C;
        width: 140rpx;
        flex-shrink: 0;
      }

      .bank-value-box {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16rpx;

        .bank-value {
          flex: 1;
          font-size: 28rpx;
          font-weight: 600;
          color: #1D2129;
          word-break: break-all;
        }

        .copy-btn {
          font-size: 24rpx;
          color: #9C27B0;
          padding: 8rpx 16rpx;
          background: rgba(156, 39, 176, 0.1);
          border-radius: 8rpx;
          flex-shrink: 0;
        }
      }
    }
  }

  .transfer-notice {
    display: flex;
    align-items: flex-start;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 12rpx;

    .notice-content {
      flex: 1;

      text {
        font-size: 24rpx;
        color: #FF9800;
        line-height: 1.6;
        display: block;
        margin-bottom: 8rpx;
      }

      .order-no-highlight {
        display: flex;
        align-items: center;
        gap: 12rpx;
        padding: 12rpx;
        background: rgba(255, 152, 0, 0.15);
        border-radius: 8rpx;
        margin-top: 8rpx;

        .order-no-text {
          flex: 1;
          font-size: 26rpx;
          font-weight: 600;
          color: #FF9800;
          word-break: break-all;
        }

        .copy-link {
          font-size: 24rpx;
          color: #9C27B0;
          padding: 6rpx 16rpx;
          background: rgba(156, 39, 176, 0.2);
          border-radius: 8rpx;
          flex-shrink: 0;
        }
      }
    }
  }
}

// 凭证上传
.upload-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .upload-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 12rpx;
    margin-bottom: 24rpx;

    text {
      flex: 1;
      font-size: 24rpx;
      color: #2196F3;
      line-height: 1.6;
    }
  }

  .upload-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    margin-bottom: 16rpx;

    .upload-item {
      &.add-btn {
        .upload-placeholder {
          border: 2rpx dashed #C0C4CC;
          background: #F8F9FC;

          text {
            color: #C0C4CC;
          }
        }
      }

      .upload-card {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        border-radius: 12rpx;
        overflow: hidden;

        .upload-image {
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
          background: rgba(156, 39, 176, 0.05);
          border: 2rpx dashed #9C27B0;

          text {
            font-size: 22rpx;
            color: #9C27B0;
          }
        }

        .upload-mask {
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
          background: rgba(0, 0, 0, 0.6);

          text {
            font-size: 22rpx;
            color: #FFFFFF;
          }
        }
      }

      .upload-ops {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-top: 8rpx;

        .op-link {
          font-size: 22rpx;
          color: #9C27B0;

          &.danger {
            color: #F53F3F;
          }
        }
      }
    }
  }

  .upload-count {
    text-align: center;

    text {
      font-size: 24rpx;
      color: #86909C;
    }
  }
}

// 备注说明
.remark-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

// 提示信息
.tips-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;

  .tips-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .tips-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #2196F3;
    }
  }

  .tips-content {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .tip-item {
      font-size: 24rpx;
      color: #86909C;
      line-height: 1.6;
    }
  }
}

// 底部提交栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
  display: flex;
  gap: 20rpx;

  .save-btn {
    flex: 1;
    height: 88rpx;
    background: #FFFFFF;
    color: #9C27B0;
    border: 2rpx solid #9C27B0;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      border: none;
    }
  }

  .submit-btn {
    flex: 1;
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
