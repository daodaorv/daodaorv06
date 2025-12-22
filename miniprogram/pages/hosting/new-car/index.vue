<template>
  <view class="new-car-hosting">
    <view class="banner">
      <text class="title">购车托管</text>
      <text class="desc">保底3500元/月 + 超额70%分成</text>
    </view>

    <!-- 热门车型 -->
    <view class="models-section">
      <view class="section-header">
        <view class="section-title">热门车型</view>
        <view class="more-btn" @click="goToModelList">
          <text>更多</text>
          <text class="arrow">›</text>
        </view>
      </view>
      <view class="model-list">
        <view v-for="model in models" :key="model.id" class="model-card" @click="selectModel(model)">
          <image :src="model.image" class="model-img" mode="aspectFill"></image>
          <view class="model-info">
            <text class="model-name">{{ model.name }}</text>
            <text class="model-price">月供参考：¥{{ model.monthlyPayment }}/月</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 申请表单 -->
    <view class="form-section">
      <input class="input" v-model="form.name" placeholder="姓名" />
      <input class="input" v-model="form.phone" name="number" placeholder="联系电话" />
    </view>

    <button class="submit-btn" @click="submit">提交申请</button>
  </view>
</template>

<script>
import { logger } from '@/utils/logger';
import { getPopularModels } from '@/api/hosting'

export default {
  data() {
    return {
      models: [],
      form: { name: '', phone: '' }
    }
  },
  onLoad() {
    this.loadModels()
  },
  methods: {
    async loadModels() {
      try {
        const data = await getPopularModels()
        this.models = data
      } catch (error) {
        logger.error('加载车型失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    selectModel(model) {
      uni.navigateTo({
        url: `/pages/hosting/model-detail/index?id=${model.id}`
      })
    },
    goToModelList() {
      uni.navigateTo({
        url: '/pages/hosting/model-list/index'
      })
    },
    submit() {
      if (!this.form.name || !this.form.phone) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      uni.showModal({
        title: '提交成功',
        content: '我们将在24小时内联系您',
        showCancel: false,
        success: () => uni.navigateBack()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.new-car-hosting {
  min-height: 100vh;
  background: $uni-bg-color;
  padding-bottom: 40rpx;
}

.banner {
  background: $uni-color-primary-gradient;
  padding: 48rpx $uni-spacing-xl;
  text-align: center;
  color: $uni-text-color-inverse;

  .title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: $uni-spacing-lg;
  }

  .desc {
    display: block;
    font-size: $uni-font-size-xs;
    opacity: 0.9;
  }
}

.models-section,
.form-section {
  margin: $uni-spacing-xl $uni-spacing-xl;
  background: $uni-bg-color-card;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
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

.more-btn {
  display: flex;
  align-items: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
  }

  .arrow {
    font-size: 36rpx;
    margin-left: 4rpx;
  }
}

.model-card {
  display: flex;
  margin-bottom: $uni-spacing-xl;
  border: 1rpx solid $uni-border-color-light;
  border-radius: $uni-radius-md;
  overflow: hidden;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
    background-color: $uni-bg-color-grey;
  }
}

.model-img {
  width: 200rpx;
  height: 150rpx;
}

.model-info {
  flex: 1;
  padding: $uni-spacing-xl;
}

.model-name {
  display: block;
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-sm;
}

.model-price {
  display: block;
  font-size: $uni-font-size-xs;
  color: $uni-color-primary;
}

.input {
  height: 88rpx;
  background: $uni-bg-color-grey;
  border-radius: $uni-radius-md;
  padding: 0 $uni-spacing-xl;
  margin-bottom: $uni-spacing-xl;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.submit-btn {
  width: calc(100% - 64rpx);
  height: 88rpx;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  border-radius: $uni-radius-btn;
  font-size: $uni-font-size-lg;
  font-weight: 600;
  border: none;
  margin: 0 $uni-spacing-xl;
  box-shadow: $uni-shadow-glow;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
