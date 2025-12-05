<template>
  <view class="tour-booking">
    <!-- 绾胯矾淇℃伅鍗＄墖 -->
    <view class="tour-card">
      <view class="tour-header">
        <text class="tour-title">{{ tourInfo.title }}</text>
      </view>
      <view class="tour-meta">
        <view class="meta-item">
          <u-icon name="calendar" size="14" color="#999"></u-icon>
          <text class="meta-text">{{ tourInfo.duration }}澶﹞{ tourInfo.duration - 1 }}鏅x/text>
        </view>
        <view class="meta-item">
          <u-icon name="flag" size="14" color="#999"></u-icon>
          <text class="meta-text">鍑哄彂鏃ユ湡锛歿{ formatDate(batchInfo.departureDate) }}</text>
        </view>
      </view>
    </view>

    <!-- 鍙傚洟浜哄憳淇℃伅 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">鍙傚洟浜哄憳</text>
        <text class="title-tip">锛堣嚦灏x浜猴級</text>
      </view>

      <!-- 鎴愪汉鏁伴噺 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">鎴愪汉</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseAdults" :disabled="bookingForm.adults <= 1">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.adults }}浜x/text>
            <button class="stepper-btn" @tap="increaseAdults" :disabled="totalPeople >= maxPeople">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
          <text class="price-text">楼{{ tourInfo.pricePerPerson }}/浜x/text>
        </view>
      </view>

      <!-- 鍎跨鏁伴噺 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">鍎跨</text>
          <text class="label-tip">锛x2宀佷互涓嬶級</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseChildren" :disabled="bookingForm.children <= 0">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.children }}浜x/text>
            <button class="stepper-btn" @tap="increaseChildren" :disabled="totalPeople >= maxPeople">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
          <text class="price-text">楼{{ tourInfo.childPrice }}/浜x/text>
        </view>
      </view>

      <!-- 浜烘暟鎻愮ず -->
      <view class="people-tip">
        <text class="tip-text">褰撳墠{{ totalPeople }}浜猴紝鎴愬洟闇€{{ tourInfo.minPeople }}-{{ tourInfo.maxPeople }}浜x/text>
      </view>
    </view>

    <!-- 鑱旂郴浜轰俊鎭x-->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">鑱旂郴浜轰俊鎭x/text>
      </view>

      <!-- 濮撳悕 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">濮撳悕</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactName"
            placeholder="璇疯緭鍏ヨ仈绯讳汉濮撳悕"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 鎵嬫満鍙x-->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">鎵嬫満鍙x/text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactPhone"
            name="number"
            maxlength="11"
            placeholder="璇疯緭鍏ユ墜鏈哄彿"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 韬唤璇佸彿 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">韬唤璇佸彿</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.idCard"
            maxlength="18"
            placeholder="璇疯緭鍏ヨ韩浠借瘉鍙x
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 绱ф€ヨ仈绯讳汉 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">绱ф€ヨ仈绯讳汉</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.emergencyContact"
            placeholder="璇疯緭鍏ョ揣鎬ヨ仈绯讳汉濮撳悕"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 绱ф€ヨ仈绯荤數璇x-->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">绱ф€ヨ仈绯荤數璇x/text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.emergencyPhone"
            name="number"
            maxlength="11"
            placeholder="璇疯緭鍏ョ揣鎬ヨ仈绯荤數璇x
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 澶囨敞 -->
      <view class="form-item textarea-item">
        <view class="item-label">
          <text class="label-text">澶囨敞</text>
        </view>
        <view class="item-value full-width">
          <textarea
            class="textarea-field"
            v-model="bookingForm.remark"
            placeholder="璇疯緭鍏ョ壒娈婇渶姹傛垨澶囨敞淇℃伅锛堥€夊～锛x
            placeholder-class="input-placeholder"
            maxlength="200"
          />
          <text class="char-count">{{ bookingForm.remark.length }}/200</text>
        </view>
      </view>
    </view>

    <!-- 棰勮椤荤煡 -->
    <view class="notice-section">
      <view class="section-title">
        <text class="title-text">棰勮椤荤煡</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="(notice, index) in bookingNotices" :key="index">
          <text class="notice-dot">鈥x/text>
          <text class="notice-text">{{ notice }}</text>
        </view>
      </view>
      <view class="agreement-box">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox value="agree" :checked="agreed" color="#FF9F29" />
            <text class="agreement-text">鎴戝凡闃呰骞跺悓鎰x/text>
            <text class="agreement-link" @tap.stop="viewAgreement">銆婃梾娓告湇鍔″崗璁€x/text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 浠锋牸鏄庣粏 -->
    <view class="price-section">
      <view class="section-title">
        <text class="title-text">浠锋牸鏄庣粏</text>
      </view>
      <view class="price-list">
        <view class="price-item">
          <text class="price-label">鎴愪汉璐圭敤</text>
          <text class="price-value">楼{{ tourInfo.pricePerPerson }} 脳 {{ bookingForm.adults }}浜x/text>
          <text class="price-amount">楼{{ adultFee }}</text>
        </view>
        <view class="price-item" v-if="bookingForm.children > 0">
          <text class="price-label">鍎跨璐圭敤</text>
          <text class="price-value">楼{{ tourInfo.childPrice }} 脳 {{ bookingForm.children }}浜x/text>
          <text class="price-amount">楼{{ childFee }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">淇濋櫓璐圭敤</text>
          <text class="price-value">楼{{ insuranceFee }}/浜x脳 {{ totalPeople }}浜x/text>
          <text class="price-amount">楼{{ totalInsuranceFee }}</text>
        </view>
        <view class="price-item total">
          <text class="price-label">鍚堣</text>
          <text class="price-amount highlight">楼{{ totalPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 搴曢儴鎿嶄綔鏍x-->
    <view class="bottom-bar">
      <view class="bar-left">
        <text class="bar-label">鎬昏锛x/text>
        <view class="bar-price">
          <text class="bar-symbol">楼</text>
          <text class="bar-amount">{{ totalPrice }}</text>
        </view>
      </view>
      <button class="submit-btn" @tap="submitBooking" :disabled="!canSubmit || submitting" :loading="submitting">
        鎻愪氦棰勮
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createTourBooking, type TourBookingParams, type TourBookingResponse } from '@/api/tour';

// 鑾峰彇璺敱鍙傛暟
const tourId = ref('');
const batchId = ref('');

onLoad((options: any) => {
  tourId.value = options.tourId || '';
  batchId.value = options.batchId || '';
  loadBookingData();
});

// 绾胯矾淇℃伅
const tourInfo = ref<any>({
  id: '',
  title: '',
  duration: 0,
  minPeople: 0,
  maxPeople: 0,
  pricePerPerson: 0,
  childPrice: 0
});

// 鎵规淇℃伅
const batchInfo = ref<any>({
  id: '',
  departureDate: '',
  currentPeople: 0,
  maxPeople: 0
});

// 棰勮琛ㄥ崟
const bookingForm = ref({
  adults: 1,
  children: 0,
  contactName: '',
  contactPhone: '',
  idCard: '',
  emergencyContact: '',
  emergencyPhone: '',
  remark: ''
});

const submitting = ref(false);

// 鏄惁鍚屾剰鍗忚
const agreed = ref(false);

// 淇濋櫓璐圭敤锛堟瘡浜猴級
const insuranceFee = ref(50);

// 棰勮椤荤煡
const bookingNotices = ref([
  '鏈嚎璺负鎴愬洟浜у搧锛屾渶灏x浜烘垚鍥紝鍑哄彂鍓x澶╃‘璁ゆ槸鍚︽垚鍥x,
  '楂樺師鍦板尯锛岃鎻愬墠鍋氬ソ韬綋鍑嗗锛屾湁楂樿鍘嬨€佸績鑴忕梾绛夌柧鐥呰€呬笉瀹滃弬鍔x,
  '璇锋惡甯﹁韩浠借瘉銆侀┚椹惰瘉绛夋湁鏁堣瘉浠x,
  '鍎跨浠锋牸閫傜敤浜x2宀佷互涓嬶紝涓嶅崰搴婁綅',
  '琛岀▼涓閬囧ぉ姘斻€佽矾鍐电瓑涓嶅彲鎶楀姏鍥犵礌锛岄闃熸湁鏉冭皟鏁磋绋x,
  '寤鸿璐拱楂樺師鏃呮父淇濋櫓'
]);

// 鏈€澶т汉鏁伴檺鍒xconst maxPeople = computed(() => {
  return batchInfo.value.maxPeople - batchInfo.value.currentPeople;
});

// 鎬讳汉鏁xconst totalPeople = computed(() => {
  return bookingForm.value.adults + bookingForm.value.children;
});

// 鎴愪汉璐圭敤
const adultFee = computed(() => {
  return tourInfo.value.pricePerPerson * bookingForm.value.adults;
});

// 鍎跨璐圭敤
const childFee = computed(() => {
  return tourInfo.value.childPrice * bookingForm.value.children;
});

// 鎬讳繚闄╄垂鐢xconst totalInsuranceFee = computed(() => {
  return insuranceFee.value * totalPeople.value;
});

// 鎬讳环鏍xconst totalPrice = computed(() => {
  return adultFee.value + childFee.value + totalInsuranceFee.value;
});

// 鏄惁鍙互鎻愪氦
const canSubmit = computed(() => {
  return (
    bookingForm.value.adults >= 1 &&
    totalPeople.value <= maxPeople.value &&
    bookingForm.value.contactName.trim() !== '' &&
    /^1[3-9]\d{9}$/.test(bookingForm.value.contactPhone) &&
    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(bookingForm.value.idCard) &&
    bookingForm.value.emergencyContact.trim() !== '' &&
    /^1[3-9]\d{9}$/.test(bookingForm.value.emergencyPhone) &&
    agreed.value
  );
});

// 鍔犺浇棰勮鏁版嵁
const loadBookingData = async () => {
  try {
    uni.showLoading({ title: '鍔犺浇涓x..' });

    // Mock鏁版嵁
    const mockTour = {
      id: tourId.value,
      title: '宸濊タ绉樺路绋诲煄浜氫竵鎴胯溅娣卞害娓x,
      duration: 7,
      minPeople: 5,
      maxPeople: 12,
      pricePerPerson: 4980,
      childPrice: 2490
    };

    const mockBatch = {
      id: batchId.value,
      departureDate: '2025-12-15',
      currentPeople: 8,
      maxPeople: 12
    };

    tourInfo.value = mockTour;
    batchInfo.value = mockBatch;

  } catch (error) {
    console.error('鍔犺浇棰勮鏁版嵁澶辫触:', error);
    uni.showToast({
      title: '鍔犺浇澶辫触',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 鏍煎紡鍖栨棩鏈xconst formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}骞x{date.getMonth() + 1}鏈x{date.getDate()}鏃;
};

// 澧炲姞鎴愪汉鏁伴噺
const increaseAdults = () => {
  if (totalPeople.value < maxPeople.value) {
    bookingForm.value.adults++;
  }
};

// 鍑忓皯鎴愪汉鏁伴噺
const decreaseAdults = () => {
  if (bookingForm.value.adults > 1) {
    bookingForm.value.adults--;
  }
};

// 澧炲姞鍎跨鏁伴噺
const increaseChildren = () => {
  if (totalPeople.value < maxPeople.value) {
    bookingForm.value.children++;
  }
};

// 鍑忓皯鍎跨鏁伴噺
const decreaseChildren = () => {
  if (bookingForm.value.children > 0) {
    bookingForm.value.children--;
  }
};

// 鍗忚鍙樺寲
const onAgreementChange = (e: any) => {
  agreed.value = e.detail.value.includes('agree');
};

// 鏌ョ湅鍗忚
const viewAgreement = () => {
  uni.showModal({
    title: '鏃呮父鏈嶅姟鍗忚',
    content: '杩欓噷鏄梾娓告湇鍔″崗璁殑璇︾粏鍐呭...',
    showCancel: false
  });
};

// 鎻愪氦棰勮
const submitBooking = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '璇峰畬鍠勯璁俊鎭x,
      icon: 'none'
    });
    return;
  }

  try {
    uni.showLoading({ title: '鎻愪氦涓x..' });

    // Mock鎻愪氦
    await new Promise(resolve => setTimeout(resolve, 1000));

    uni.hideLoading();
    uni.showModal({
      title: '棰勮鎴愬姛',
      content: `鎮ㄥ凡鎴愬姛棰勮${bookingForm.value.adults + bookingForm.value.children}涓悕棰濓紝璇峰墠寰€璁㈠崟椤甸潰鏌ョ湅璇︽儏骞跺畬鎴愭敮浠榒,
      showCancel: false,
      success: () => {
        uni.navigateBack({ delta: 2 });
      }
    });

  } catch (error) {
    console.error('鎻愪氦棰勮澶辫触:', error);
    uni.showToast({
      title: '鎻愪氦澶辫触锛岃閲嶈瘯',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style scoped lang="scss">
.tour-booking {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 140rpx;
}

// 绾胯矾淇℃伅鍗＄墖
.tour-card {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .tour-header {
    margin-bottom: 16rpx;

    .tour-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
    }
  }

  .tour-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .meta-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

// 琛ㄥ崟鍖哄煙
.form-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    display: flex;
    align-items: baseline;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .title-tip {
      font-size: 24rpx;
      color: #999;
      margin-left: 12rpx;
    }
  }

  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F0F0F0;

    &:last-child {
      border-bottom: none;
    }

    &.textarea-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .item-label {
      display: flex;
      align-items: center;
      gap: 4rpx;

      .label-text {
        font-size: 28rpx;
        color: #333;
      }

      .label-tip {
        font-size: 22rpx;
        color: #999;
      }

      .required {
        color: #F44336;
        font-size: 28rpx;
      }
    }

    .item-value {
      display: flex;
      align-items: center;
      gap: 16rpx;

      &.full-width {
        width: 100%;
        margin-top: 16rpx;
        flex-direction: column;
        align-items: flex-end;
      }

      .input-field {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
        min-width: 200rpx;
      }

      .input-placeholder {
        color: #999;
      }

      .textarea-field {
        width: 100%;
        min-height: 160rpx;
        font-size: 28rpx;
        color: #333;
        padding: 16rpx;
        background-color: #F8F8F8;
        border-radius: 8rpx;
      }

      .char-count {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }

      .stepper {
        display: flex;
        align-items: center;
        gap: 24rpx;

        .stepper-btn {
          width: 56rpx;
          height: 56rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F8F8;
          border-radius: 8rpx;
          border: none;
          padding: 0;

          &::after {
            border: none;
          }

          &:disabled {
            opacity: 0.5;
          }
        }

        .stepper-value {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          min-width: 80rpx;
          text-align: center;
        }
      }

      .price-text {
        font-size: 24rpx;
        color: #FF9F29;
      }
    }
  }

  .people-tip {
    padding: 16rpx;
    background-color: rgba(255, 159, 41, 0.1);
    border-radius: 8rpx;
    margin-top: 16rpx;

    .tip-text {
      font-size: 24rpx;
      color: #FF9F29;
    }
  }
}

// 棰勮椤荤煡
.notice-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .notice-list {
    margin-bottom: 24rpx;

    .notice-item {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-dot {
        font-size: 26rpx;
        color: #FF9F29;
        flex-shrink: 0;
      }

      .notice-text {
        flex: 1;
        font-size: 26rpx;
        color: #666;
      }
    }
  }

  .agreement-box {
    padding-top: 24rpx;
    border-top: 2rpx solid #F0F0F0;

    .agreement-label {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .agreement-text {
        font-size: 26rpx;
        color: #666;
      }

      .agreement-link {
        font-size: 26rpx;
        color: #FF9F29;
      }
    }
  }
}

// 浠锋牸鏄庣粏
.price-section {
  background-color: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .price-list {
    .price-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #F0F0F0;

      &:last-child {
        border-bottom: none;
      }

      &.total {
        padding-top: 24rpx;
        margin-top: 8rpx;
        border-top: 2rpx solid #E0E0E0;

        .price-label {
          font-size: 30rpx;
          font-weight: 600;
        }

        .price-amount {
          font-size: 36rpx;
        }
      }

      .price-label {
        font-size: 28rpx;
        color: #333;
        min-width: 120rpx;
      }

      .price-value {
        flex: 1;
        font-size: 24rpx;
        color: #999;
        text-align: center;
      }

      .price-amount {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;

        &.highlight {
          color: #F44336;
          font-weight: 700;
        }
      }
    }
  }
}

// 搴曢儴鎿嶄綔鏍x.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;

  .bar-left {
    display: flex;
    align-items: baseline;
    gap: 8rpx;

    .bar-label {
      font-size: 26rpx;
      color: #666;
    }

    .bar-price {
      display: flex;
      align-items: baseline;

      .bar-symbol {
        font-size: 24rpx;
        color: #F44336;
        font-weight: 600;
      }

      .bar-amount {
        font-size: 40rpx;
        color: #F44336;
        font-weight: 700;
        margin-left: 4rpx;
      }
    }
  }

  .submit-btn {
    padding: 20rpx 64rpx;
    background: linear-gradient(135deg, #FF9F29 0%, #FFB84D 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: 600;
    border: none;

    &::after {
      border: none;
    }

    &:disabled {
      background: #E0E0E0;
      color: #999;
    }
  }
}
</style>
