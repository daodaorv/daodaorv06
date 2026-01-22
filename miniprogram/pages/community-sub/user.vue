<template>
	<view class="user-page">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<image :src="userProfile.avatar" class="avatar" mode="aspectFill" />
			<text class="username">{{ userProfile.userName }}</text>
			<text v-if="userProfile.bio" class="bio">{{ userProfile.bio }}</text>

			<!-- 数据统计 -->
			<view class="stats">
				<view class="stat-item">
					<text class="stat-value">{{ userProfile.postCount }}</text>
					<text class="stat-label">发布</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userProfile.followerCount }}</text>
					<text class="stat-label">粉丝</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userProfile.followingCount }}</text>
					<text class="stat-label">关注</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userProfile.likeCount }}</text>
					<text class="stat-label">获赞</text>
				</view>
			</view>

			<!-- 关注按钮 -->
			<button
				class="follow-btn"
				:class="{ following: userProfile.isFollowing }"
				@click="handleFollow"
			>
				{{ userProfile.isFollowing ? '已关注' : '+ 关注' }}
			</button>
		</view>

		<!-- Tab切换 -->
		<view class="tab-bar">
			<view
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: currentTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text class="tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 内容列表 -->
		<view class="content-section">
			<!-- 发布内容 -->
			<view v-if="currentTab === 'posts'" class="post-list">
				<view
					v-for="post in userProfile.posts"
					:key="post.id"
					class="post-item"
					@click="viewPost(post.id)"
				>
					<image
						v-if="post.images && post.images.length > 0"
						:src="post.images[0]"
						class="post-cover"
						mode="aspectFill"
					/>
					<view class="post-info">
						<view class="post-header">
							<view class="type-tag">{{ getTypeLabel(post.type) }}</view>
						</view>
						<text class="post-title">{{ post.title }}</text>
						<view class="post-meta">
							<view class="meta-item">
								<u-icon name="thumb-up" size="14" color="#999999" />
								<text class="meta-text">{{ post.likeCount }}</text>
							</view>
							<view class="meta-item">
								<u-icon name="chat" size="14" color="#999999" />
								<text class="meta-text">{{ post.commentCount }}</text>
							</view>
							<text class="meta-time">{{ formatTime(post.createdAt) }}</text>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="userProfile.posts.length === 0" class="empty-state">
					<u-icon name="edit-pen" size="64" color="#CCCCCC" />
					<text class="empty-text">暂无发布内容</text>
				</view>
			</view>

			<!-- 关注列表 -->
			<view v-if="currentTab === 'following'" class="user-list">
				<view class="empty-state">
					<u-icon name="account-fill" size="64" color="#CCCCCC" />
					<text class="empty-text">暂无关注</text>
				</view>
			</view>

			<!-- 粉丝列表 -->
			<view v-if="currentTab === 'followers'" class="user-list">
				<view class="empty-state">
					<u-icon name="account-fill" size="64" color="#CCCCCC" />
					<text class="empty-text">暂无粉丝</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserProfile, followUser, unfollowUser, type UserProfile } from '@/api/community'

// 用户ID
const userId = ref('')

// 用户资料
const userProfile = ref<UserProfile>({
	id: '',
	userName: '',
	avatar: '',
	bio: '',
	postCount: 0,
	followerCount: 0,
	followingCount: 0,
	likeCount: 0,
	isFollowing: false,
	posts: []
})

// 当前Tab
const currentTab = ref('posts')

// Tab列表
const tabs = [
	{ value: 'posts', label: '发布' },
	{ value: 'following', label: '关注' },
	{ value: 'followers', label: '粉丝' }
]

// 获取类型标签
const getTypeLabel = (type: string) => {
	const typeMap: Record<string, string> = {
		GUIDE: '攻略',
		EXPERIENCE: '体验',
		ACTIVITY: '活动',
		QA: '问答'
	}
	return typeMap[type] || '其他'
}

// 格式化时间
const formatTime = (time: string) => {
	const date = new Date(time)
	const now = new Date()
	const diff = now.getTime() - date.getTime()

	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour

	if (diff < minute) {
		return '刚刚'
	} else if (diff < hour) {
		return `${Math.floor(diff / minute)}分钟前`
	} else if (diff < day) {
		return `${Math.floor(diff / hour)}小时前`
	} else if (diff < 7 * day) {
		return `${Math.floor(diff / day)}天前`
	} else {
		return `${date.getMonth() + 1}-${date.getDate()}`
	}
}

// 切换Tab
const switchTab = (tab: string) => {
	currentTab.value = tab
}

// 关注/取消关注
const handleFollow = async () => {
	try {
		if (userProfile.value.isFollowing) {
			const result = await unfollowUser(userProfile.value.id)
			userProfile.value.isFollowing = result.isFollowing
			userProfile.value.followerCount = result.followerCount
			uni.showToast({
				title: '已取消关注',
				icon: 'success'
			})
		} else {
			const result = await followUser(userProfile.value.id)
			userProfile.value.isFollowing = result.isFollowing
			userProfile.value.followerCount = result.followerCount
			uni.showToast({
				title: '关注成功',
				icon: 'success'
			})
		}
	} catch (error) {
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 查看帖子详情
const viewPost = (postId: string) => {
	uni.navigateTo({
		url: `/pages/community-sub/detail?id=${postId}`
	})
}

// 加载用户资料
const loadUserProfile = async () => {
	try {
		uni.showLoading({ title: '加载中...' })
		userProfile.value = await getUserProfile(userId.value)
		uni.hideLoading()
	} catch (error) {
		uni.hideLoading()
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

onMounted(() => {
	// 获取页面参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1] as any
	const options = currentPage.options || {}

	userId.value = options.id || 'user_001'
	loadUserProfile()
})
</script>

<style lang="scss" scoped>
.user-page {
	min-height: 100vh;
	background: $uni-bg-color;
}

// 用户信息卡片
.user-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: $uni-spacing-xl $uni-spacing-lg;
	background: $uni-bg-color-card;
	margin-bottom: $uni-spacing-md;
	box-shadow: $uni-shadow-card;

	.avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: $uni-radius-circle;
		margin-bottom: $uni-spacing-lg;
		border: 4rpx solid $uni-bg-color-card;
		box-shadow: $uni-shadow-float;
	}

	.username {
		font-size: $uni-font-size-xxl;
		font-weight: 800;
		color: $uni-text-color;
		margin-bottom: $uni-spacing-sm;
	}

	.bio {
		font-size: $uni-font-size-xs;
		color: $uni-text-color-placeholder;
		text-align: center;
		margin-bottom: $uni-spacing-xl;
		max-width: 80%;
		line-height: 1.5;
	}

	.stats {
		display: flex;
		gap: 64rpx;
		margin-bottom: $uni-spacing-xl;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: $uni-spacing-xs;

			.stat-value {
				font-size: $uni-font-size-lg;
				font-weight: bold;
				color: $uni-text-color;
				font-family: 'DIN Alternate', sans-serif;
			}

			.stat-label {
				font-size: $uni-font-size-xs;
				color: $uni-text-color-placeholder;
			}
		}
	}

	.follow-btn {
		width: 400rpx;
		height: 80rpx;
		background: $uni-color-primary-gradient;
		color: $uni-text-color-inverse;
		font-size: $uni-font-size-base;
		font-weight: 600;
		border-radius: $uni-radius-btn;
		border: none;
		box-shadow: $uni-shadow-glow;
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&::after {
			border: none;
		}

		&.following {
			background: $uni-bg-color-grey;
			color: $uni-text-color-placeholder;
			box-shadow: none;
		}
	}
}

// Tab栏
.tab-bar {
	display: flex;
	background: $uni-bg-color-card;
	margin-bottom: $uni-spacing-md;
	box-shadow: $uni-shadow-sm;

	.tab-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 96rpx;
		position: relative;
		transition: all 0.2s ease;

		.tab-text {
			font-size: $uni-font-size-base;
			color: $uni-text-color-secondary;
			transition: all 0.2s ease;
		}

		&.active {
			.tab-text {
				color: $uni-color-primary;
				font-weight: 600;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 6rpx;
				background: $uni-color-primary;
				border-radius: 3rpx;
			}
		}
	}
}

// 内容区域
.content-section {
	background: $uni-bg-color-card;
	min-height: 400rpx;
}

// 帖子列表
.post-list {
	padding: $uni-spacing-lg;

	.post-item {
		display: flex;
		gap: $uni-spacing-md;
		padding-bottom: $uni-spacing-lg;
		margin-bottom: $uni-spacing-lg;
		border-bottom: 1rpx solid $uni-border-color-light;
		transition: opacity 0.2s ease;

		&:active {
			opacity: 0.8;
		}

		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
		}

		.post-cover {
			width: 200rpx;
			height: 150rpx;
			border-radius: $uni-radius-md;
			flex-shrink: 0;
			background-color: $uni-bg-color-grey;
		}

		.post-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: $uni-spacing-sm;

			.post-header {
				.type-tag {
					display: inline-block;
					padding: 4rpx $uni-spacing-sm;
					background: rgba(76, 175, 80, 0.1);
					color: $uni-color-success;
					font-size: $uni-font-size-xs;
					border-radius: $uni-radius-xs;
					font-weight: 500;
				}
			}

			.post-title {
				font-size: $uni-font-size-base;
				font-weight: 500;
				color: $uni-text-color;
				line-height: 1.5;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.post-meta {
				display: flex;
				align-items: center;
				gap: $uni-spacing-lg;

				.meta-item {
					display: flex;
					align-items: center;
					gap: 4rpx;

					.meta-text {
						font-size: $uni-font-size-xs;
						color: $uni-text-color-placeholder;
					}
				}

				.meta-time {
					margin-left: auto;
					font-size: $uni-font-size-xs;
					color: $uni-border-color;
				}
			}
		}
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
	gap: $uni-spacing-md;

	.empty-text {
		font-size: $uni-font-size-sm;
		color: $uni-text-color-placeholder;
	}
}
</style>
