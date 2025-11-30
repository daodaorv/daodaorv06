<template>
  <view class="pickup-container">
    <!-- 顶部进度条 -->
    <view class="progress-bar">
      <view class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <view class="step-number">1</view>
        <view class="step-label">订单确认</view>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 1 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <view class="step-number">2</view>
        <view class="step-label">车辆检查</view>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 2 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <view class="step-number">3</view>
        <view class="step-label">拍照存证</view>
      </view>
      <view class="progress-line" :class="{ active: currentStep > 3 }"></view>
      <view class="progress-step" :class="{ active: currentStep >= 4 }">
        <view class="step-number">4</view>
        <view class="step-label">完成取车</view>
      </view>
    </view>

    <!-- 步骤1: 订单确认 -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="section-title">订单信息确认</view>
      <view class="order-info-card">
        <view class="info-row">
          <text class="label">订单号：</text>
          <text class="value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="label">客户姓名：</text>
          <text class="value">{{ orderInfo.customerName }}</text>
        </view>
        <view class="info-row">
          <text class="label">联系电话：</text>
          <text class="value">{{ orderInfo.customerPhone }}</text>
        </view>
        <view class="info-row">
          <text class="label">车辆信息：</text>
          <text class="value">{{ orderInfo.vehicleName }} ({{ orderInfo.vehiclePlate }})</text>
        </view>
        <view class="info-row">
          <text class="label">租期：</text>
          <text class="value">{{ orderInfo.startDate }} 至 {{ orderInfo.endDate }}</text>
        </view>
        <view class="info-row">
          <text class="label">押金状态：</text>
          <text class="value" :class="depositPaid ? 'success' : 'warning'">
            {{ depositPaid ? '已支付' : '未支付' }}
          </text>
        </view>
      </view>

      <view class="section-title">证件验证</view>
      <view class="document-upload">
        <view class="upload-item">
          <view class="upload-label">身份证</view>
          <view class="upload-box" @click="uploadDocument('idCard')">
            <image v-if="documents.idCard" :src="documents.idCard" mode="aspectFill" class="uploaded-image"></image>
            <view v-else class="upload-placeholder">
              <text class="icon">📷</text>
              <text class="text">拍照上传</text>
            </view>
          </view>
        </view>
        <view class="upload-item">
          <view class="upload-label">驾驶证</view>
          <view class="upload-box" @click="uploadDocument('driverLicense')">
            <image v-if="documents.driverLicense" :src="documents.driverLicense" mode="aspectFill" class="uploaded-image"></image>
            <view v-else class="upload-placeholder">
              <text class="icon">📷</text>
              <text class="text">拍照上传</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button class="btn btn-primary" @click="nextStep" :disabled="!canProceedStep1">下一步</button>
      </view>
    </view>

    <!-- 步骤2: 车辆检查 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="section-title">车辆检查清单</view>

      <view class="checklist-section">
        <view class="checklist-header">外观检查</view>
        <view class="checklist-items">
          <view v-for="item in checklist.exterior" :key="item.id" class="checklist-item" @click="toggleCheckItem(item)">
            <view class="checkbox" :class="{ checked: item.checked }">
              <text v-if="item.checked" class="checkmark">✓</text>
            </view>
            <text class="item-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <view class="checklist-section">
        <view class="checklist-header">内饰检查</view>
        <view class="checklist-items">
          <view v-for="item in checklist.interior" :key="item.id" class="checklist-item" @click="toggleCheckItem(item)">
            <view class="checkbox" :class="{ checked: item.checked }">
              <text v-if="item.checked" class="checkmark">✓</text>
            </view>
            <text class="item-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <view class="checklist-section">
        <view class="checklist-header">功能检查</view>
        <view class="checklist-items">
          <view v-for="item in checklist.functions" :key="item.id" class="checklist-item" @click="toggleCheckItem(item)">
            <view class="checkbox" :class="{ checked: item.checked }">
              <text v-if="item.checked" class="checkmark">✓</text>
            </view>
            <text class="item-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <view class="meter-input-section">
        <view class="input-row">
          <text class="input-label">当前里程（公里）：</text>
          <input class="input-field" type="number" v-model="vehicleData.mileage" placeholder="请输入当前里程" />
        </view>
        <view class="input-row">
          <text class="input-label">当前油量（格）：</text>
          <input class="input-field" type="number" v-model="vehicleData.fuelLevel" placeholder="请输入当前油量" />
        </view>
      </view>

      <view class="action-buttons">
        <button class="btn btn-secondary" @click="prevStep">上一步</button>
        <button class="btn btn-primary" @click="nextStep" :disabled="!canProceedStep2">下一步</button>
      </view>
    </view>

    <!-- 步骤3: 拍照存证 -->
    <view v-if="currentStep === 3" class="step-content">
      <view class="section-title">车辆拍照存证</view>

      <view class="photo-section">
        <view class="photo-category-title">外观照片（必拍）</view>
        <view class="photo-grid">
          <view v-for="position in photoPositions.exterior" :key="position.key" class="photo-item">
            <view class="photo-label">{{ position.label }}</view>
            <view class="photo-box" @click="takePhoto('exterior', position.key)">
              <image v-if="photos.exterior[position.key]" :src="photos.exterior[position.key]" mode="aspectFill" class="photo-image"></image>
              <view v-else class="photo-placeholder">
                <text class="icon">📷</text>
                <text class="text">拍照</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="photo-section">
        <view class="photo-category-title">内饰照片（必拍）</view>
        <view class="photo-grid">
          <view v-for="position in photoPositions.interior" :key="position.key" class="photo-item">
            <view class="photo-label">{{ position.label }}</view>
            <view class="photo-box" @click="takePhoto('interior', position.key)">
              <image v-if="photos.interior[position.key]" :src="photos.interior[position.key]" mode="aspectFill" class="photo-image"></image>
              <view v-else class="photo-placeholder">
                <text class="icon">📷</text>
                <text class="text">拍照</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button class="btn btn-secondary" @click="prevStep">上一步</button>
        <button class="btn btn-primary" @click="nextStep" :disabled="!canProceedStep3">下一步</button>
      </view>
    </view>

    <!-- 步骤4: 完成取车 -->
    <view v-if="currentStep === 4" class="step-content">
      <view class="section-title">确认信息</view>

      <view class="summary-card">
        <view class="summary-item">
          <text class="summary-label">检查项完成：</text>
          <text class="summary-value">{{ completedCheckItems }}/{{ totalCheckItems }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">照片已拍摄：</text>
          <text class="summary-value">{{ completedPhotos }}/{{ totalPhotos }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">当前里程：</text>
          <text class="summary-value">{{ vehicleData.mileage }} 公里</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">当前油量：</text>
          <text class="summary-value">{{ vehicleData.fuelLevel }} 格</text>
        </view>
      </view>

      <view class="section-title">客户签名确认</view>
      <view class="signature-section">
        <canvas canvas-id="signatureCanvas" class="signature-canvas" @touchstart="signatureStart" @touchmove="signatureMove" @touchend="signatureEnd"></canvas>
        <button class="btn-clear-signature" @click="clearSignature">清除签名</button>
      </view>

      <view class="agreement-section">
        <checkbox-group @change="agreementChange">
          <label class="agreement-label">
            <checkbox value="agree" :checked="agreed" />
            <text>我已确认车辆状况，同意租赁协议条款</text>
          </label>
        </checkbox-group>
      </view>

      <view class="action-buttons">
        <button class="btn btn-secondary" @click="prevStep">上一步</button>
        <button class="btn btn-primary" @click="completePickup" :disabled="!canComplete" :loading="submitting">完成取车</button>
      </view>
    </view>
  </view>
</template>

<script>
import { startPickup, submitPickupInspection, uploadPickupPhotos, completePickup } from '@/api/order'

export default {
  data() {
    return {
      orderId: '',
      currentStep: 1,
      orderInfo: {},
      depositPaid: true,
      documents: {
        idCard: '',
        driverLicense: ''
      },
      checklist: {
        exterior: [],
        interior: [],
        functions: []
      },
      vehicleData: {
        mileage: '',
        fuelLevel: ''
      },
      photoPositions: {
        exterior: [
          { key: 'front', label: '车辆前部' },
          { key: 'back', label: '车辆后部' },
          { key: 'left', label: '车辆左侧' },
          { key: 'right', label: '车辆右侧' }
        ],
        interior: [
          { key: 'dashboard', label: '仪表盘' },
          { key: 'cabin', label: '驾驶舱' }
        ]
      },
      photos: {
        exterior: {},
        interior: {}
      },
      signatureData: '',
      agreed: false,
      submitting: false,
      signatureContext: null
    }
  },
  computed: {
    canProceedStep1() {
      return this.depositPaid && this.documents.idCard && this.documents.driverLicense
    },
    canProceedStep2() {
      const allChecked = [...this.checklist.exterior, ...this.checklist.interior, ...this.checklist.functions].every(item => item.checked)
      return allChecked && this.vehicleData.mileage && this.vehicleData.fuelLevel
    },
    canProceedStep3() {
      const exteriorComplete = this.photoPositions.exterior.every(pos => this.photos.exterior[pos.key])
      const interiorComplete = this.photoPositions.interior.every(pos => this.photos.interior[pos.key])
      return exteriorComplete && interiorComplete
    },
    canComplete() {
      return this.agreed && this.signatureData && !this.submitting
    },
    completedCheckItems() {
      return [...this.checklist.exterior, ...this.checklist.interior, ...this.checklist.functions].filter(item => item.checked).length
    },
    totalCheckItems() {
      return this.checklist.exterior.length + this.checklist.interior.length + this.checklist.functions.length
    },
    completedPhotos() {
      return Object.keys(this.photos.exterior).length + Object.keys(this.photos.interior).length
    },
    totalPhotos() {
      return this.photoPositions.exterior.length + this.photoPositions.interior.length
    }
  },
  onLoad(options) {
    this.orderId = options.id
    this.loadOrderInfo()
    this.initPickupFlow()
  },
  onReady() {
    this.initSignatureCanvas()
  },
  methods: {
    async loadOrderInfo() {
      // 这里应该调用获取订单详情的API
      this.orderInfo = {
        orderNo: '20231129001',
        customerName: '张三',
        customerPhone: '13800138000',
        vehicleName: '大通V90房车',
        vehiclePlate: '京A12345',
        startDate: '2025-12-01',
        endDate: '2025-12-05'
      }
    },
    async initPickupFlow() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await startPickup(this.orderId)
        this.checklist = res.checklistTemplate
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    uploadDocument(type) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          this.documents[type] = res.tempFilePaths[0]
        }
      })
    },
    toggleCheckItem(item) {
      item.checked = !item.checked
    },
    takePhoto(category, position) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          this.$set(this.photos[category], position, res.tempFilePaths[0])
        }
      })
    },
    initSignatureCanvas() {
      this.signatureContext = uni.createCanvasContext('signatureCanvas', this)
      this.signatureContext.setStrokeStyle('#000000')
      this.signatureContext.setLineWidth(3)
      this.signatureContext.setLineCap('round')
      this.signatureContext.setLineJoin('round')
    },
    signatureStart(e) {
      const touch = e.touches[0]
      this.signatureContext.beginPath()
      this.signatureContext.moveTo(touch.x, touch.y)
    },
    signatureMove(e) {
      const touch = e.touches[0]
      this.signatureContext.lineTo(touch.x, touch.y)
      this.signatureContext.stroke()
      this.signatureContext.draw(true)
    },
    signatureEnd() {
      uni.canvasToTempFilePath({
        canvasId: 'signatureCanvas',
        success: (res) => {
          this.signatureData = res.tempFilePath
        }
      }, this)
    },
    clearSignature() {
      this.signatureContext.clearRect(0, 0, 300, 150)
      this.signatureContext.draw()
      this.signatureData = ''
    },
    agreementChange(e) {
      this.agreed = e.detail.value.includes('agree')
    },
    nextStep() {
      if (this.currentStep < 4) {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    async completePickup() {
      if (!this.canComplete) return

      try {
        this.submitting = true
        uni.showLoading({ title: '提交中...' })

        // 提交检查数据
        await submitPickupInspection(this.orderId, {
          checklist: this.checklist,
          vehicleData: this.vehicleData
        })

        // 上传照片
        const allPhotos = [
          ...Object.values(this.photos.exterior),
          ...Object.values(this.photos.interior)
        ]
        await uploadPickupPhotos(this.orderId, allPhotos)

        // 完成取车
        await completePickup(this.orderId, {
          documents: this.documents,
          signature: this.signatureData,
          agreed: this.agreed
        })

        uni.hideLoading()
        uni.showToast({ title: '取车完成', icon: 'success' })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error.message || '提交失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pickup-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  .step-number {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .step-label {
    font-size: 24rpx;
    color: #999;
  }

  &.active .step-number {
    background-color: #1890ff;
    color: #fff;
  }

  &.active .step-label {
    color: #1890ff;
  }

  &.completed .step-number {
    background-color: #52c41a;
    color: #fff;
  }
}

.progress-line {
  flex: 1;
  height: 4rpx;
  background-color: #e0e0e0;
  margin: 0 10rpx;
  margin-bottom: 40rpx;

  &.active {
    background-color: #52c41a;
  }
}

.step-content {
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.order-info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 28rpx;
    color: #666;
    width: 180rpx;
  }

  .value {
    font-size: 28rpx;
    color: #333;
    flex: 1;

    &.success {
      color: #52c41a;
    }

    &.warning {
      color: #ff4d4f;
    }
  }
}

.document-upload {
  display: flex;
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.upload-item {
  flex: 1;
}

.upload-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.upload-box {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #fff;
  border: 2rpx dashed #d9d9d9;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    font-size: 60rpx;
    margin-bottom: 10rpx;
  }

  .text {
    font-size: 24rpx;
    color: #999;
  }
}

.checklist-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.checklist-header {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checklist-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;

  &.checked {
    background-color: #1890ff;
    border-color: #1890ff;
  }

  .checkmark {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.item-name {
  font-size: 28rpx;
  color: #333;
}

.meter-input-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;

  .input-label {
    font-size: 28rpx;
    color: #333;
    width: 240rpx;
  }

  .input-field {
    flex: 1;
    height: 70rpx;
    padding: 0 20rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
  }
}

.photo-section {
  margin-bottom: 30rpx;
}

.photo-category-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.photo-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.photo-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.photo-box {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  border: 2rpx dashed #d9d9d9;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    font-size: 50rpx;
    margin-bottom: 10rpx;
  }

  .text {
    font-size: 24rpx;
    color: #999;
  }
}

.summary-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .summary-label {
    font-size: 28rpx;
    color: #666;
  }

  .summary-value {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
}

.signature-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.signature-canvas {
  width: 100%;
  height: 300rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 12rpx;
  background-color: #fff;
}

.btn-clear-signature {
  margin-top: 20rpx;
  width: 100%;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}

.agreement-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.agreement-label {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;

  checkbox {
    margin-right: 15rpx;
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;

  &.btn-primary {
    background-color: #1890ff;
    color: #fff;

    &:disabled {
      background-color: #d9d9d9;
      color: #999;
    }
  }

  &.btn-secondary {
    background-color: #fff;
    color: #666;
    border: 2rpx solid #d9d9d9;
  }
}
</style>
