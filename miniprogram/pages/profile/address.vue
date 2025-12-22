<template>
  <view class="address-page">
    <view class="address-list" v-if="addressList.length">
      <view class="address-card" v-for="item in addressList" :key="item.id">
        <view class="card-header">
          <view class="name">{{ item.name }}</view>
          <text class="tag" v-if="item.tag">{{ item.tag }}</text>
          <text class="default-tag" v-if="item.isDefault">默认</text>
        </view>
        <text class="phone">{{ item.phone }}</text>
        <text class="full-address">{{ formatAddress(item) }}</text>
        <view class="card-actions">
          <view class="action" @tap="handleEdit(item)">
            <u-icon name="edit-pen" size="18" color="#666" />
            <text>编辑</text>
          </view>
          <view class="action delete" @tap="handleDelete(item)">
            <u-icon name="trash" size="18" color="#F56C6C" />
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else-if="!loading">
      <image class="empty-image" src="/static/empty-contacts.png" mode="aspectFit" />
      <text class="empty-text">暂未保存收货地址</text>
    </view>

    <view class="footer-btn">
      <button class="add-btn" @tap="handleAdd">新增地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAddressStore } from '@/stores/address'
import { requireLogin, isLoggedIn, buildRedirectUrl } from '@/utils/auth'

const addressStore = useAddressStore()
const addressList = ref<any[]>([])
const loading = ref(true)
const pageReady = ref(false)
const redirectUrl = ref('/pages/profile/address')
let cachedRouteParams: Record<string, any> | null = null

const loadAddresses = async () => {
  // 检查登录状态
  if (!isLoggedIn()) {
    addressList.value = []
    return
  }

  loading.value = true
  const res = await addressStore.fetchAddresses()
  if (res) {
    addressList.value = res
  }
  loading.value = false
}

// 页面初始化设置
const setupAddressPage = (options: any) => {
  pageReady.value = true
  loadAddresses()
}

// 确保用户已登录
const ensureAuth = (options: any) => {
  redirectUrl.value = buildRedirectUrl('/pages/profile/address', options || {})
  if (isLoggedIn()) {
    return true
  }
  return requireLogin(redirectUrl.value)
}

// 页面加载时检查登录状态
onLoad((options: any) => {
  cachedRouteParams = options || {}
  pageReady.value = false
  if (!ensureAuth(cachedRouteParams)) {
    return
  }
  setupAddressPage(cachedRouteParams)
})

// 页面显示时检查登录状态（从登录页返回时）
onShow(() => {
  if (!pageReady.value && cachedRouteParams && isLoggedIn()) {
    setupAddressPage(cachedRouteParams)
  } else if (pageReady.value && isLoggedIn()) {
    // 页面已初始化且已登录，刷新数据
    loadAddresses()
  }
})

const handleAdd = () => {
  uni.navigateTo({
    url: '/pages/profile/address-edit'
  })
}

const handleEdit = (address: any) => {
  uni.navigateTo({
    url: `/pages/profile/address-edit?id=${address.id}`
  })
}

const handleDelete = (address: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        const success = await addressStore.removeAddress(address.id)
        if (success) {
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadAddresses()
        } else {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const formatAddress = (address: any) => {
  return `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || ''}`
}
</script>

<style scoped lang="scss">
.address-page {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: 120rpx;
}

.address-list {
  padding: $uni-spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-xl;
}

.address-card {
  background-color: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  box-shadow: $uni-shadow-card;
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-md;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: $uni-spacing-md;
}

.name {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.tag {
  font-size: 20rpx;
  color: $uni-color-primary;
  background-color: rgba($uni-color-primary, 0.12);
  padding: 4rpx $uni-spacing-md;
  border-radius: $uni-radius-md;
}

.default-tag {
  font-size: 20rpx;
  color: $uni-text-color-inverse;
  background-color: $uni-color-primary;
  padding: 4rpx $uni-spacing-md;
  border-radius: $uni-radius-md;
}

.phone {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.full-address {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: $uni-spacing-xl;
  margin-top: $uni-spacing-md;
}

.action {
  display: flex;
  align-items: center;
  gap: $uni-spacing-sm;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
  }

  &.delete {
    color: $uni-color-error;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  gap: $uni-spacing-xl;
}

.empty-image {
  width: 320rpx;
  height: 320rpx;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

.footer-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $uni-spacing-xl $uni-spacing-xl;
  padding-bottom: calc(#{$uni-spacing-xl} + env(safe-area-inset-bottom));
  background-color: $uni-bg-color-card;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.add-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  border-radius: $uni-radius-btn;
  height: 88rpx;
  line-height: 88rpx;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &::after {
    border: none;
  }
}
</style>
