<script>
	export default {
		onLaunch: function() {
			console.log('App Launch - 叨叨房车')

			// 检查登录状态
			const token = uni.getStorageSync('token')
			if (token) {
				console.log('User is logged in')
			} else {
				console.log('User is not logged in')
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式重置 */
	page {
		background-color: #F8F8F8;
		color: #333333;
		font-size: 28rpx;
		line-height: 1.4;
	}

	/* 重置按钮样式 */
	button {
		border: none;
		outline: none;
	}

	button::after {
		border: none;
	}

	/* 统一字体 */
	view, text, button, input {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	}

	/* ===========================================
	   通用安全区域处理 - Safe Area Handling
	   =========================================== */

	.safe-area-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.safe-area-top {
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
	}

	/* ===========================================
	   导航栏自定义样式 - Custom Navigation Bar Styles
	   =========================================== */

	.navbar-custom {
		background-color: #FFFFFF;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
	}

	/* ===========================================
	   TabBar 自定义样式 - Custom TabBar Styles
	   =========================================== */

	.tabbar-custom {
		background-color: #FFFFFF;
		border-top: 2rpx solid #E8E8E8;
		box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
	}

	/* ===========================================
	   设计令牌 - Design Tokens (CSS Variables)
	   =========================================== */

	/* 品牌色 */
	:root {
		--primary-orange: #FF9F29;
		--primary-orange-light: rgba(255, 159, 41, 0.1);
		--member-purple: #8860D0;
		--member-purple-light: rgba(136, 96, 208, 0.1);

		/* 功能色 */
		--success-green: #67C23A;
		--error-red: #FF4D4F;
		--info-blue: #4B91FF;
		--warning-yellow: #E6A23C;

		/* 文本色 */
		--text-primary: #333333;
		--text-secondary: #666666;
		--text-tertiary: #999999;
		--text-placeholder: #CCCCCC;
		--text-white: #FFFFFF;

		/* 背景色 */
		--bg-page: #F8F8F8;
		--bg-card: #FFFFFF;
		--bg-section: #FAFAFA;

		/* 边框色 */
		--border-light: #E8E8E8;
		--border-medium: #DDDDDD;
		--border-dark: #CCCCCC;

		/* 间距 */
		--spacing-xs: 8rpx;
		--spacing-sm: 16rpx;
		--spacing-md: 24rpx;
		--spacing-lg: 32rpx;
		--spacing-xl: 48rpx;
		--spacing-xxl: 80rpx;

		/* 圆角 */
		--radius-xs: 8rpx;
		--radius-sm: 12rpx;
		--radius-md: 16rpx;
		--radius-lg: 20rpx;
		--radius-xl: 24rpx;
		--radius-round: 50rpx;

		/* 阴影 */
		--shadow-light: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		--shadow-medium: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		--shadow-heavy: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		--shadow-card: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	}
</style>
