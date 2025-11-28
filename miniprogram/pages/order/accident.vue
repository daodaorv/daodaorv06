<template>
  <view class="accident-page">
    <view class="form-section">
      <view class="section-title">事故/故障信息</view>
      
      <view class="form-group">
        <text class="label">发生时间</text>
        <picker mode="time" :value="time" @change="bindTimeChange">
          <view class="picker-value">{{ time || '请选择时间' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">发生地点</text>
        <view class="location-picker" @tap="chooseLocation">
          <text class="address">{{ address || '点击选择位置' }}</text>
          <uni-icons type="location" size="20" color="#FF9F29"></uni-icons>
        </view>
      </view>

      <view class="form-group vertical">
        <text class="label">现场照片 (最多9张)</text>
        <uni-file-picker 
          v-model="imageValue" 
          fileMediatype="image" 
          mode="grid" 
          :limit="9"
          @select="select" 
          @progress="progress" 
          @success="success" 
          @fail="fail" 
        />
      </view>

      <view class="form-group vertical">
        <text class="label">情况描述</text>
        <textarea 
          class="desc-input" 
          placeholder="请详细描述事故/故障发生经过及车辆受损情况..." 
          v-model="description"
          maxlength="500"
        ></textarea>
        <text class="word-count">{{ description.length }}/500</text>
      </view>
    </view>

    <view class="tips-section">
      <view class="tips-title">温馨提示：</view>
      <view class="tip-item">1. 发生事故请优先确保人员安全，并开启双闪警示灯。</view>
      <view class="tip-item">2. 如遇人员受伤，请立即拨打120急救电话。</view>
      <view class="tip-item">3. 交通事故请拨打122报警电话。</view>
      <view class="tip-item">4. 请拍摄车辆受损部位、相对位置、车牌号等照片。</view>
    </view>

    <view class="bottom-btn">
      <button class="submit-btn" @tap="submitReport">提交申报</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const orderId = ref(null);
const time = ref('');
const address = ref('');
const description = ref('');
const imageValue = ref([]);

onLoad((options) => {
  if (options.orderId) {
    orderId.value = parseInt(options.orderId);
  }
  // Set default time to now
  const now = new Date();
  time.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
});

const bindTimeChange = (e) => {
  time.value = e.detail.value;
};

const chooseLocation = () => {
  uni.chooseLocation({
    success: function (res) {
      address.value = res.address;
    }
  });
};

const select = (e) => {
  console.log('select', e);
};

const progress = (e) => {
  console.log('progress', e);
};

const success = (e) => {
  console.log('success', e);
};

const fail = (e) => {
  console.log('fail', e);
};

const submitReport = () => {
  if (!address.value) {
    uni.showToast({ title: '请选择发生地点', icon: 'none' });
    return;
  }
  if (!description.value) {
    uni.showToast({ title: '请填写情况描述', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '提交中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '申报已提交，客服将尽快联系您',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  }, 1000);
};
</script>

<style lang="scss" scoped>
.accident-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  padding-left: 16rpx;
  border-left: 8rpx solid #f5222d;
}

.form-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
  
  &:last-child {
    border-bottom: none;
  }

  &.vertical {
    flex-direction: column;
    align-items: flex-start;
    
    .label {
      margin-bottom: 20rpx;
    }
  }
}

.label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.picker-value, .address {
  font-size: 28rpx;
  color: #666;
}

.location-picker {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.desc-input {
  width: 100%;
  height: 200rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.word-count {
  align-self: flex-end;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.tips-section {
  padding: 30rpx;
  background-color: #fffbe6;
  border-radius: 12rpx;
  border: 1rpx solid #ffe58f;
  
  .tips-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #faad14;
    margin-bottom: 16rpx;
  }
  
  .tip-item {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 8rpx;
  }
}

.bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

  .submit-btn {
    background-color: #f5222d;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
