<template>
	<view class="model-detail-page">
		<!-- 图片轮播 (沉浸式) -->
		<swiper class="image-swiper"
			:indicator-dots="true"
			:autoplay="false"
			:circular="true"
			indicator-color="rgba(255,255,255,0.6)"
			indicator-active-color="#FF9F29"
			:duration="500"
		>
			<swiper-item v-for="(image, index) in model.images" :key="index">
				<image class="swiper-image" :src="image" mode="aspectFill"></image>
			</swiper-item>
		</swiper>

		<!-- 返回按钮 (悬浮) -->
		<view class="back-btn" :style="{ top: statusBarHeight + 8 + 'px' }" @tap="goBack">
			<u-icon name="arrow-left" size="20" color="#FFFFFF"></u-icon>
		</view>

		<!-- 分享按钮 (悬浮) -->
		<view class="share-btn" :style="{ top: statusBarHeight + 8 + 'px' }">
			<u-icon name="share" size="20" color="#FFFFFF"></u-icon>
		</view>

		<scroll-view scroll-y class="detail-scroll">
			<!-- 内容容器 -->
			<view class="content-container">
				<!-- 基本信息卡片 -->
				<view class="info-card">
					<view class="header-row">
						<view class="title-wrap">
							<text class="model-name">{{ model.name }}</text>
							<view class="brand-tag">
								<text>{{ model.brand }}</text>
							</view>
						</view>
					</view>

					<view class="divider"></view>

					<view class="price-row">
						<view class="price-item">
							<text class="price-label">购车价格</text>
							<view class="price-value">
								<text class="currency">¥</text>
								<text class="price">{{ formatPrice(model.price) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 核心规格 (Grid) -->
				<view class="specs-grid">
					<view class="spec-box">
						<view class="spec-icon bg-blue">
							<u-icon name="account-fill" size="20" color="#2196F3"></u-icon>
						</view>
						<text class="spec-val">{{ model.specs.seats }}座</text>
						<text class="spec-label">座位</text>
					</view>
					<view class="spec-box">
						<view class="spec-icon bg-green">
							<u-icon name="home-fill" size="20" color="#4CAF50"></u-icon>
						</view>
						<text class="spec-val">{{ model.specs.beds }}卧</text>
						<text class="spec-label">床位</text>
					</view>
					<view class="spec-box">
						<view class="spec-icon bg-orange">
							<u-icon name="setting-fill" size="20" color="#FF9800"></u-icon>
						</view>
						<text class="spec-val">{{ model.specs.transmission }}</text>
						<text class="spec-label">排挡</text>
					</view>
					<view class="spec-box">
						<view class="spec-icon bg-purple">
							<u-icon name="car-fill" size="20" color="#9C27B0"></u-icon>
						</view>
						<text class="spec-val">{{ model.specs.length }}mm</text>
						<text class="spec-label">车长</text>
					</view>
				</view>

				<!-- 车辆配置 -->
				<view class="section-card">
					<view class="section-header">
						<text class="section-title">车辆配置</text>
					</view>
					<view class="features-grid">
						<view v-for="(feature, index) in model.detailedFeatures" :key="index" class="feature-item">
							<u-icon name="checkmark-circle-fill" size="16" color="#FF9F29"></u-icon>
							<text class="feature-text">{{ feature }}</text>
						</view>
					</view>
				</view>

				<!-- 托管收益说明 -->
				<view class="section-card hosting-info-card">
					<view class="section-header">
						<text class="section-title">托管收益说明</text>
					</view>
					<view class="hosting-info">
						<view class="info-row">
							<view class="info-item">
								<text class="info-label">保底收益</text>
								<text class="info-value highlight">¥{{ model.hostingInfo.minMonthlyIncome }}/月</text>
							</view>
							<view class="info-item">
								<text class="info-label">超额分成</text>
								<text class="info-value highlight">{{ model.hostingInfo.profitShare }}%</text>
							</view>
						</view>
						<view class="info-row">
							<view class="info-item">
								<text class="info-label">预估年收益</text>
								<text class="info-value">¥{{ formatPrice(model.hostingInfo.estimatedYearlyIncome) }}+</text>
							</view>
						</view>
						<view class="policy-list">
							<view class="policy-item">
								<u-icon name="checkmark-circle" size="16" color="#4CAF50"></u-icon>
								<text>{{ model.hostingInfo.subsidyPolicy }}</text>
							</view>
							<view class="policy-item">
								<u-icon name="checkmark-circle" size="16" color="#4CAF50"></u-icon>
								<text>{{ model.hostingInfo.insurance }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 车辆详情 -->
				<view class="section-card">
					<view class="section-header">
						<text class="section-title">车辆详情</text>
					</view>
					<view class="description">
						<rich-text :nodes="model.description" class="description-text"></rich-text>
					</view>
				</view>

				<!-- 规格参数 -->
				<view class="section-card">
					<view class="section-header">
						<text class="section-title">规格参数</text>
					</view>
					<view class="specs-list">
						<view class="specs-item">
							<text class="specs-label">车身尺寸</text>
							<text class="specs-value">{{ model.specs.length }}×{{ model.specs.width }}×{{ model.specs.height }}mm</text>
						</view>
						<view class="specs-item">
							<text class="specs-label">整备质量</text>
							<text class="specs-value">{{ model.specs.weight }}kg</text>
						</view>
						<view class="specs-item">
							<text class="specs-label">燃油类型</text>
							<text class="specs-value">{{ model.specs.fuelType }}</text>
						</view>
						<view class="specs-item">
							<text class="specs-label">排量</text>
							<text class="specs-value">{{ model.specs.displacement }}</text>
						</view>
						<view class="specs-item">
							<text class="specs-label">变速箱</text>
							<text class="specs-value">{{ model.specs.transmission }}</text>
						</view>
					</view>
				</view>

				<!-- 底部安全区 -->
				<view class="safe-area-bottom"></view>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="bar-left">
				<view class="action-btn">
					<u-icon name="kefu-ermai" size="24" color="#666"></u-icon>
					<text>客服</text>
				</view>
				<view class="action-btn">
					<u-icon name="star-fill" size="24" color="#666"></u-icon>
					<text>收藏</text>
				</view>
			</view>
			<view class="bar-right">
				<button class="booking-btn" @click="showBookingPopup = true">立即预定</button>
			</view>
		</view>

		<!-- 预定弹窗 -->
		<u-popup v-model="showBookingPopup" mode="bottom" :round="20" :closeable="true">
			<view class="booking-popup">
				<view class="popup-header">
					<text class="popup-title">预定购车托管</text>
				</view>

				<view class="popup-model-info">
					<text class="model-name">{{ model.name }}</text>
					<text class="model-price">¥{{ formatPrice(model.price) }}</text>
				</view>

				<view class="popup-form">
					<view class="form-item">
						<text class="form-label">预定人</text>
						<input class="form-input" v-model="bookingForm.name" placeholder="请输入姓名" />
					</view>
					<view class="form-item">
						<text class="form-label">联系电话</text>
						<input class="form-input" v-model="bookingForm.phone" type="number" placeholder="请输入手机号" />
					</view>
					<view class="form-item">
						<text class="form-label">意向城市</text>
						<input class="form-input" v-model="bookingForm.city" placeholder="请选择城市（可选）" />
					</view>
					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea class="form-textarea" v-model="bookingForm.remark" placeholder="其他需求说明（可选）" />
					</view>
				</view>

				<view class="popup-actions">
					<button class="cancel-btn" @click="showBookingPopup = false">取消</button>
					<button class="submit-btn" @click="submitBooking">确认提交</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { logger } from '@/utils/logger';
import { getModelDetail, submitModelBooking } from '@/api/hosting'

export default {
	data() {
		return {
			statusBarHeight: 0,
			modelId: 0,
			model: {
				id: 0,
				name: '',
				brand: '',
				image: '',
				images: [],
				price: 0,
				monthlyPayment: 0,
				description: '',
				specs: {
					length: 0,
					width: 0,
					height: 0,
					weight: 0,
					fuelType: '',
					displacement: '',
					seats: 0,
					beds: 0,
					transmission: ''
				},
				hostingInfo: {
					minMonthlyIncome: 0,
					profitShare: 0,
					estimatedYearlyIncome: 0,
					subsidyPolicy: '',
					insurance: ''
				},
				detailedFeatures: []
			},
			showBookingPopup: false,
			bookingForm: {
				name: '',
				phone: '',
				city: '',
				remark: ''
			}
		}
	},
	onLoad(options) {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 0

		// 获取车型ID
		if (options.id) {
			this.modelId = parseInt(options.id)
			this.loadModelDetail()
		}
	},
	methods: {
		async loadModelDetail() {
			try {
				uni.showLoading({ title: '加载中...' })
				const data = await getModelDetail(this.modelId)
				this.model = data
				uni.hideLoading()
			} catch (error) {
				logger.error('加载车型详情失败:', error)
				uni.hideLoading()
				uni.showToast({ title: '加载失败', icon: 'none' })
			}
		},
		goBack() {
			uni.navigateBack()
		},
		formatPrice(price) {
			return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		},
		async submitBooking() {
			// 表单验证
			if (!this.bookingForm.name) {
				uni.showToast({ title: '请输入姓名', icon: 'none' })
				return
			}

			if (!this.bookingForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return
			}

			if (!/^1[3-9]\d{9}$/.test(this.bookingForm.phone)) {
				uni.showToast({ title: '手机号格式不正确', icon: 'none' })
				return
			}

			try {
				uni.showLoading({ title: '提交中...' })
				const res = await submitModelBooking({
					modelId: this.modelId,
					...this.bookingForm
				})
				uni.hideLoading()

				if (res.success) {
					uni.showToast({
						title: res.message,
						icon: 'success',
						duration: 2000
					})
					this.showBookingPopup = false
					// 重置表单
					this.bookingForm = { name: '', phone: '', city: '', remark: '' }
				}
			} catch (error) {
				logger.error('提交预定失败:', error)
				uni.hideLoading()
				uni.showToast({ title: '提交失败', icon: 'none' })
			}
		}
	}
}
</script>

<style scoped lang="scss">
.model-detail-page {
  min-height: 100vh;
  background: $uni-bg-color;
}

// 图片轮播
.image-swiper {
  width: 100%;
  height: 500rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

// 悬浮按钮
.back-btn,
.share-btn {
  position: fixed;
  width: 64rpx;
  height: 64rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: $uni-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.7);
  }
}

.back-btn {
  left: $uni-spacing-xl;
}

.share-btn {
  right: $uni-spacing-xl;
}

// 滚动容器
.detail-scroll {
  height: calc(100vh - 500rpx - 120rpx);
}

.content-container {
  padding-bottom: $uni-spacing-xl;
}

// 基本信息卡片
.info-card {
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $uni-spacing-xl;
}

.title-wrap {
  flex: 1;
}

.model-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-lg;
}

.brand-tag {
  display: inline-block;
  padding: $uni-spacing-sm $uni-spacing-lg;
  background: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: $uni-font-size-xs;
  border-radius: $uni-radius-sm;
}

.divider {
  height: 1rpx;
  background: $uni-border-color-light;
  margin: $uni-spacing-xl 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
}

.price-item {
  flex: 1;
}

.price-label {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-md;
}

.price-value {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: $uni-font-size-base;
  color: $uni-color-primary;
  margin-right: 4rpx;
}

.price {
  font-size: 40rpx;
  font-weight: 600;
  color: $uni-color-primary;
  font-family: 'DIN Alternate', sans-serif;
}

.unit {
  font-size: $uni-font-size-xs;
  color: $uni-color-primary;
  margin-left: 4rpx;
}

// 核心规格 Grid
.specs-grid {
  display: flex;
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.spec-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spec-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: $uni-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $uni-spacing-lg;

  &.bg-blue {
    background: #E3F2FD;
  }

  &.bg-green {
    background: rgba($uni-color-success, 0.12);
  }

  &.bg-orange {
    background: rgba($uni-color-primary, 0.1);
  }

  &.bg-purple {
    background: #F3E5F5;
  }
}

.spec-val {
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.spec-label {
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
}

// 通用卡片
.section-card {
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-xl;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

// 车辆配置
.features-grid {
  display: flex;
  flex-wrap: wrap;
}

.feature-item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.feature-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  margin-left: $uni-spacing-md;
}

// 托管收益说明
.hosting-info-card {
  background: linear-gradient(135deg, rgba($uni-color-primary, 0.08) 0%, $uni-bg-color-card 100%);
}

.info-row {
  display: flex;
  margin-bottom: $uni-spacing-xl;
}

.info-item {
  flex: 1;
}

.info-label {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-spacing-md;
}

.info-value {
  display: block;
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;

  &.highlight {
    color: $uni-color-primary;
  }
}

.policy-list {
  margin-top: $uni-spacing-lg;
}

.policy-item {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-lg;
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;

  text {
    margin-left: $uni-spacing-md;
  }
}

// 车辆详情
.description-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  line-height: 1.8;
  white-space: pre-wrap;
}

// 规格参数
.specs-item {
  display: flex;
  justify-content: space-between;
  padding: $uni-spacing-xl 0;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
}

.specs-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.specs-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: 500;
}

// 底部安全区
.safe-area-bottom {
  height: 120rpx;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: $uni-bg-color-card;
  border-top: 1rpx solid $uni-border-color-light;
  display: flex;
  align-items: center;
  padding: 0 $uni-spacing-xl;
  z-index: 100;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.bar-left {
  display: flex;
  gap: 48rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20rpx;
  color: $uni-text-color-secondary;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
  }

  text {
    margin-top: $uni-spacing-sm;
  }
}

.bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.booking-btn {
  width: 240rpx;
  height: 72rpx;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-base;
  font-weight: 600;
  border: none;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

// 预定弹窗
.booking-popup {
  background: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  border-radius: $uni-radius-lg $uni-radius-lg 0 0;
}

.popup-header {
  text-align: center;
  margin-bottom: $uni-spacing-xl;
}

.popup-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.popup-model-info {
  background: $uni-bg-color-grey;
  padding: $uni-spacing-xl;
  border-radius: $uni-radius-md;
  margin-bottom: $uni-spacing-xl;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .model-name {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: 500;
    margin-bottom: 0;
  }

  .model-price {
    font-size: $uni-font-size-base;
    color: $uni-color-primary;
    font-weight: 600;
  }
}

.popup-form {
  margin-bottom: $uni-spacing-xl;
}

.form-item {
  margin-bottom: $uni-spacing-xl;
}

.form-label {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-md;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: $uni-spacing-xl;
  background: $uni-bg-color-grey;
  border-radius: $uni-radius-md;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  border: none;
  box-sizing: border-box;
}

.form-textarea {
  height: 160rpx;
}

.popup-actions {
  display: flex;
  gap: $uni-spacing-xl;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-base;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.cancel-btn {
  background: $uni-bg-color-grey;
  color: $uni-text-color-secondary;
}

.submit-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  box-shadow: $uni-shadow-glow;
}
</style>
