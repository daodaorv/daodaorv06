<script>
import { useUserStore } from '@/stores/user';
import { checkAndUpdateLoginStatus } from '@/utils/auth';
import { logger } from '@/utils/logger';

	export default {
		async onLaunch() {
			const userStore = useUserStore();
			userStore.init();

			// 异步检查登录状态，不阻塞启动流程
			checkAndUpdateLoginStatus().catch((error) => {
				logger.error('检查登录状态失败', error);
			});

			logger.info('App Launch');

			// #ifdef MP-WEIXIN
			// 仅在开发环境输出系统信息
			if (process.env.NODE_ENV === 'development') {
				const deviceInfo = uni.getDeviceInfo();
				const windowInfo = uni.getWindowInfo();
				const appBaseInfo = uni.getAppBaseInfo();

				logger.debug('系统信息检查', {
					device: {
						platform: deviceInfo.platform,
						system: deviceInfo.system
					},
					app: {
						version: appBaseInfo.version,
						SDKVersion: appBaseInfo.SDKVersion
					},
					window: {
						screenWidth: windowInfo.screenWidth,
						screenHeight: windowInfo.screenHeight
					}
				});
			}
			// #endif

			// #ifndef MP-WEIXIN
			// 非微信小程序环境使用旧 API
			if (process.env.NODE_ENV === 'development') {
				uni.getSystemInfo({
					success: (res) => {
						logger.debug('系统信息', {
							platform: res.platform,
							system: res.system
						});
					}
				});
			}
			// #endif
		},
		onShow: function() {
			logger.debug('App Show');
		},
		onHide: function() {
			logger.debug('App Hide');
		}
	}
</script>

<style lang="scss">
	/* 按照 uview-plus 官方文档要求，第一行导入 uview-plus 样式 */
	@import "uview-plus/index.scss";

	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	/* 强制加载 uView Plus 本地字体 - 使用相对路径 */
	@font-face {
		font-family: 'uicon-iconfont';
		src: url('~@/static/uicon-iconfont.ttf') format('truetype');
		font-display: swap; /* 优化字体加载性能 */
	}
	/* #endif */

	// 设置整个项目的背景色（与 uni.scss 中 $uni-bg-color 保持一致）
	page {
		background-color: #F8F9FC;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
	}

	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
