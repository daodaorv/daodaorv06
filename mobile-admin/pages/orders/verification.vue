<template>
  <view class="verification-container">
    <!-- 加载状态 -->
    <LoadingSpinner v-if="loading" fullscreen text="加载中..." />

    <!-- 核验表单 -->
    <view v-else class="verification-form">
      <!-- 订单信息 -->
      <view class="info-section">
        <view class="section-title">订单信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">订单号</text>
            <text class="value">{{ order.orderNo }}</text>
          </view>
          <view class="info-item">
            <text class="label">客户姓名</text>
            <text class="value">{{ order.customerName }}</text>
          </view>
          <view class="info-item">
            <text class="label">车辆信息</text>
            <text class="value">{{ order.vehicleName }} {{ order.vehiclePlate }}</text>
          </view>
          <view class="info-item">
            <text class="label">核验类型</text>
            <text class="value">{{ verificationType === 'pickup' ? '取车核验' : '还车核验' }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆外观检查 -->
      <view class="form-section">
        <view class="section-title">车辆外观检查</view>
        <view class="check-list">
          <view
            v-for="item in appearanceChecks"
            :key="item.key"
            class="check-item"
            @click="toggleCheck('appearance', item.key)"
          >
            <view class="check-box" :class="{ checked: formData.appearance[item.key] }">
              <text v-if="formData.appearance[item.key]" class="check-icon">✓</text>
            </view>
            <text class="check-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆内饰检查 -->
      <view class="form-section">
        <view class="section-title">车辆内饰检查</view>
        <view class="check-list">
          <view
            v-for="item in interiorChecks"
            :key="item.key"
            class="check-item"
            @click="toggleCheck('interior', item.key)"
          >
            <view class="check-box" :class="{ checked: formData.interior[item.key] }">
              <text v-if="formData.interior[item.key]" class="check-icon">✓</text>
            </view>
            <text class="check-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 车辆功能检查 -->
      <view class="form-section">
        <view class="section-title">车辆功能检查</view>
        <view class="check-list">
          <view
            v-for="item in functionChecks"
            :key="item.key"
            class="check-item"
            @click="toggleCheck('function', item.key)"
          >
            <view class="check-box" :class="{ checked: formData.function[item.key] }">
              <text v-if="formData.function[item.key]" class="check-icon">✓</text>
            </view>
            <text class="check-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 油量/电量 -->
      <view class="form-section">
        <view class="section-title">油量/电量</view>
        <view class="fuel-selector">
          <view
            v-for="level in fuelLevels"
            :key="level.value"
            class="fuel-item"
            :class="{ active: formData.fuelLevel === level.value }"
            @click="formData.fuelLevel = level.value"
          >
            <text class="fuel-text">{{ level.label }}</text>
          </view>
        </view>
      </view>

      <!-- 里程数 -->
      <view class="form-section">
        <view class="section-title">当前里程数（km）</view>
        <input
          v-model.number="formData.mileage"
          type="number"
          class="input-field"
          placeholder="请输入当前里程数"
        />
      </view>

      <!-- 车辆照片 -->
      <view class="form-section">
        <view class="section-title">车辆照片</view>
        <view class="photo-tip">请拍摄车辆前、后、左、右四个角度的照片</view>
        <ImageUploader
          v-model="formData.photos"
          :max-count="8"
          add-text="拍摄照片"
          tip="建议拍摄：车头、车尾、左侧、右侧、仪表盘、内饰"
          @change="handlePhotosChange"
        />
      </view>

      <!-- 问题描述 -->
      <view class="form-section">
        <view class="section-title">问题描述（选填）</view>
        <textarea
          v-model="formData.issues"
          class="textarea-field"
          placeholder="如有车辆损伤、故障或其他问题，请详细描述"
          maxlength="500"
        />
        <view class="char-count">{{ formData.issues.length }}/500</view>
      </view>

      <!-- 客户签名 -->
      <view class="form-section">
        <view class="section-title">客户签名</view>
        <view class="signature-box" @click="showSignature">
          <image v-if="formData.signature" :src="formData.signature" class="signature-image" mode="aspectFit" />
          <view v-else class="signature-placeholder">
            <text class="placeholder-icon">✍️</text>
            <text class="placeholder-text">点击签名</text>
          </view>
        </view>
      </view>

      <!-- 核验人员 -->
      <view class="form-section">
        <view class="section-title">核验人员</view>
        <input
          v-model="formData.verifier"
          class="input-field"
          placeholder="请输入核验人员姓名"
        />
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button class="action-btn" @click="handleCancel">
          取消
        </button>
        <button class="action-btn primary" type="primary" @click="handleSubmit">
          提交核验
        </button>
      </view>
    </view>

    <!-- 签名弹窗 -->
    <uni-popup ref="signaturePopup" type="bottom">
      <view class="signature-popup">
        <view class="popup-header">
          <text class="popup-title">客户签名</text>
          <button class="clear-btn" size="mini" @click="clearSignature">清除</button>
        </view>
        <canvas
          canvas-id="signatureCanvas"
          class="signature-canvas"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        ></canvas>
        <view class="popup-actions">
          <button class="popup-btn" @click="closeSignature">取消</button>
          <button class="popup-btn primary" type="primary" @click="confirmSignature">确认</button>
        </view>
      </view>
    </uni-popup>

    <!-- 确认对话框 -->
    <ConfirmDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :message="dialogMessage"
      :type="dialogType"
      @confirm="handleDialogConfirm"
    />
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/order'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

export default {
  components: {
    LoadingSpinner,
    ImageUploader,
    ConfirmDialog
  },

  data() {
    return {
      orderId: null,
      verificationType: 'pickup', // pickup: 取车核验, return: 还车核验
      order: {},
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      dialogMessage: '',
      dialogType: 'default',

      // 表单数据
      formData: {
        appearance: {
          front: false,
          rear: false,
          left: false,
          right: false,
          roof: false,
          wheels: false
        },
        interior: {
          seats: false,
          dashboard: false,
          carpet: false,
          windows: false,
          doors: false
        },
        function: {
          engine: false,
          lights: false,
          aircon: false,
          audio: false,
          navigation: false
        },
        fuelLevel: 100,
        mileage: 0,
        photos: [],
        issues: '',
        signature: '',
        verifier: ''
      },

      // 检查项配置
      appearanceChecks: [
        { key: 'front', label: '车头外观完好' },
        { key: 'rear', label: '车尾外观完好' },
        { key: 'left', label: '左侧外观完好' },
        { key: 'right', label: '右侧外观完好' },
        { key: 'roof', label: '车顶外观完好' },
        { key: 'wheels', label: '轮胎状况良好' }
      ],
      interiorChecks: [
        { key: 'seats', label: '座椅清洁完好' },
        { key: 'dashboard', label: '仪表台完好' },
        { key: 'carpet', label: '地毯清洁' },
        { key: 'windows', label: '车窗完好' },
        { key: 'doors', label: '车门功能正常' }
      ],
      functionChecks: [
        { key: 'engine', label: '发动机正常' },
        { key: 'lights', label: '灯光系统正常' },
        { key: 'aircon', label: '空调系统正常' },
        { key: 'audio', label: '音响系统正常' },
        { key: 'navigation', label: '导航系统正常' }
      ],
      fuelLevels: [
        { value: 100, label: '满' },
        { value: 75, label: '3/4' },
        { value: 50, label: '1/2' },
        { value: 25, label: '1/4' },
        { value: 0, label: '空' }
      ],

      // 签名相关
      canvasContext: null,
      isDrawing: false,
      lastPoint: null
    }
  },

  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      this.verificationType = options.type || 'pickup'
      this.loadOrderDetail()
    }

    // 初始化签名画布
    this.$nextTick(() => {
      this.initCanvas()
    })
  },

  methods: {
    async loadOrderDetail() {
      this.loading = true
      try {
        const data = await getOrderDetail(this.orderId)
        this.order = data

        // 如果是还车核验，预填取车时的里程数
        if (this.verificationType === 'return' && data.pickupMileage) {
          this.formData.mileage = data.pickupMileage
        }
      } catch (error) {
        console.error('加载订单详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    toggleCheck(category, key) {
      this.formData[category][key] = !this.formData[category][key]
    },

    handlePhotosChange(urls) {
      console.log('照片列表变化:', urls)
    },

    // 初始化签名画布
    initCanvas() {
      this.canvasContext = uni.createCanvasContext('signatureCanvas', this)
      this.canvasContext.setStrokeStyle('#000000')
      this.canvasContext.setLineWidth(3)
      this.canvasContext.setLineCap('round')
      this.canvasContext.setLineJoin('round')
    },

    showSignature() {
      this.$refs.signaturePopup.open()
    },

    closeSignature() {
      this.$refs.signaturePopup.close()
    },

    clearSignature() {
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, 750, 400)
        this.canvasContext.draw()
      }
      this.formData.signature = ''
    },

    confirmSignature() {
      // 将画布内容转为图片
      uni.canvasToTempFilePath({
        canvasId: 'signatureCanvas',
        success: (res) => {
          this.formData.signature = res.tempFilePath
          this.closeSignature()
          uni.showToast({
            title: '签名成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('保存签名失败:', err)
          uni.showToast({
            title: '保存签名失败',
            icon: 'none'
          })
        }
      }, this)
    },

    handleTouchStart(e) {
      this.isDrawing = true
      const touch = e.touches[0]
      this.lastPoint = { x: touch.x, y: touch.y }
    },

    handleTouchMove(e) {
      if (!this.isDrawing) return

      const touch = e.touches[0]
      const currentPoint = { x: touch.x, y: touch.y }

      this.canvasContext.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.canvasContext.lineTo(currentPoint.x, currentPoint.y)
      this.canvasContext.stroke()
      this.canvasContext.draw(true)

      this.lastPoint = currentPoint
    },

    handleTouchEnd() {
      this.isDrawing = false
    },

    handleCancel() {
      this.dialogTitle = '取消核验'
      this.dialogMessage = '确定要取消核验吗？已填写的内容将不会保存。'
      this.dialogType = 'default'
      this.dialogVisible = true
    },

    handleSubmit() {
      // 验证必填项
      if (!this.validateForm()) {
        return
      }

      this.dialogTitle = '提交核验'
      this.dialogMessage = '确认提交核验记录吗？提交后将无法修改。'
      this.dialogType = 'default'
      this.dialogVisible = true
    },

    validateForm() {
      // 检查照片
      if (this.formData.photos.length === 0) {
        uni.showToast({
          title: '请至少上传一张车辆照片',
          icon: 'none'
        })
        return false
      }

      // 检查里程数
      if (!this.formData.mileage || this.formData.mileage <= 0) {
        uni.showToast({
          title: '请输入当前里程数',
          icon: 'none'
        })
        return false
      }

      // 检查签名
      if (!this.formData.signature) {
        uni.showToast({
          title: '请客户签名确认',
          icon: 'none'
        })
        return false
      }

      // 检查核验人员
      if (!this.formData.verifier) {
        uni.showToast({
          title: '请输入核验人员姓名',
          icon: 'none'
        })
        return false
      }

      return true
    },

    async handleDialogConfirm() {
      if (this.dialogTitle === '取消核验') {
        uni.navigateBack()
      } else if (this.dialogTitle === '提交核验') {
        await this.submitVerification()
      }
    },

    async submitVerification() {
      try {
        uni.showLoading({
          title: '提交中...'
        })

        // TODO: 调用API提交核验数据
        // await submitVerification(this.orderId, this.verificationType, this.formData)

        // Mock延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        uni.hideLoading()

        uni.showToast({
          title: '核验提交成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('提交核验失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.verification-form {
  padding: 20rpx;
}

/* 信息区块 */
.info-section,
.form-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.label {
  color: #999;
}

.value {
  color: #333;
  font-weight: 500;
}

/* 检查列表 */
.check-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.check-box {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.check-box.checked {
  background: #3cc51f;
  border-color: #3cc51f;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.check-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 油量选择器 */
.fuel-selector {
  display: flex;
  gap: 20rpx;
}

.fuel-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.fuel-item.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.fuel-text {
  font-size: 28rpx;
  color: #333;
}

.fuel-item.active .fuel-text {
  color: #1890ff;
  font-weight: bold;
}

/* 输入框 */
.input-field {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.textarea-field {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 照片提示 */
.photo-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
  line-height: 1.6;
}

/* 签名框 */
.signature-box {
  width: 100%;
  height: 300rpx;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  overflow: hidden;
}

.signature-image {
  width: 100%;
  height: 100%;
}

.signature-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: #fafafa;
}

.placeholder-icon {
  font-size: 60rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

/* 签名弹窗 */
.signature-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.clear-btn {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
}

.signature-canvas {
  width: 670rpx;
  height: 400rpx;
  background: #fafafa;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
}
</style>
