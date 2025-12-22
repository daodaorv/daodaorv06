<template>
  <view class="campsite-booking">
    <!-- 营地信息卡片 -->
    <view class="campsite-card">
      <view class="campsite-header">
        <text class="campsite-name">{{ campsiteInfo.name }}</text>
        <view class="site-type-badge">
          <text class="badge-text">{{ selectedSiteType.name }}</text>
        </view>
      </view>
      <view class="campsite-meta">
        <view class="meta-item">
          <u-icon name="map-fill" size="14" color="#999"></u-icon>
          <text class="meta-text">{{ campsiteInfo.address }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">面积：</text>
          <text class="meta-value">{{ selectedSiteType.area }}㎡</text>
          <text class="meta-label">容纳：</text>
          <text class="meta-value">{{ selectedSiteType.capacity }}人</text>
        </view>
      </view>
    </view>

    <!-- 预订信息表单 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">预订信息</text>
      </view>

      <!-- 入住日期 -->
      <view class="form-item" @tap="openDatePicker">
        <view class="item-label">
          <text class="label-text">入住日期</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <text class="value-text" :class="{ placeholder: !bookingForm.checkInDate }">
            {{ bookingForm.checkInDate ? formatDisplayDate(bookingForm.checkInDate) : '请选择入住日期' }}
          </text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>

      <!-- 退房日期 -->
      <view class="form-item" @tap="openDatePicker">
        <view class="item-label">
          <text class="label-text">退房日期</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <text class="value-text" :class="{ placeholder: !bookingForm.checkOutDate }">
            {{ bookingForm.checkOutDate ? formatDisplayDate(bookingForm.checkOutDate) : '请选择退房日期' }}
          </text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>

      <view class="date-tip">
        <text class="tip-text">默认14:00后入住，12:00前离店</text>
      </view>

      <!-- 入住天数 -->
      <view class="form-item" v-if="nights > 0">
        <view class="item-label">
          <text class="label-text">入住天数</text>
        </view>
        <view class="item-value">
          <text class="value-text">{{ nights }}晚</text>
        </view>
      </view>

      <!-- 入住人数 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">入住人数</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseGuests" :disabled="bookingForm.guests <= 1">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.guests }}人</text>
            <button class="stepper-btn" @tap="increaseGuests" :disabled="bookingForm.guests >= selectedSiteType.capacity">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系人信息 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">联系人信息</text>
      </view>

      <view class="contact-selector">
        <view class="selector-left">
          <u-icon name="server-man" size="20" color="#FF9F29"></u-icon>
          <text class="selector-label">常用联系人</text>
        </view>
        <view class="selector-action" @tap="openContactSelector">
          <text class="action-text">{{ contactDisplayText }}</text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>
      <view class="contact-helper">
        <text class="helper-link" @tap="goToContactManage">管理常用联系人</text>
        <text class="helper-tip">首次手动填写将自动保存</text>
      </view>

      <!-- 姓名 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">姓名</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactName"
            placeholder="请输入联系人姓名"
            placeholder-class="input-placeholder"
            @input="onContactFieldInput"
          />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">手机号</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.contactPhone"
            name="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
            @input="onContactFieldInput"
          />
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-item textarea-item">
        <view class="item-label">
          <text class="label-text">备注</text>
        </view>
        <view class="item-value full-width">
          <textarea
            class="textarea-field"
            v-model="bookingForm.remark"
            placeholder="请输入特殊需求或备注信息（选填）"
            placeholder-class="input-placeholder"
            maxlength="200"
          />
          <text class="char-count">{{ bookingForm.remark.length }}/200</text>
        </view>
      </view>
    </view>

    <!-- 出行保险 -->
    <view class="selection-section">
      <view class="section-title selection-title">
        <text class="title-text">出行保险</text>
        <text class="title-tip">推荐选择</text>
      </view>
      <view class="option-list">
        <view
          class="option-card"
          v-for="(plan, index) in insurancePlans"
          :key="plan.id"
          :class="{ active: selectedInsurance === index }"
          @tap="selectInsurance(index)"
        >
          <view class="option-header">
            <text class="option-name">{{ plan.name }}</text>
            <text class="option-price">+¥{{ plan.price }}{{ plan.perPerson ? '/人' : '/单' }}</text>
          </view>
          <text class="option-desc">{{ plan.description }}</text>
        </view>
      </view>
    </view>

    <!-- 附加服务 -->
    <view class="selection-section">
      <view class="section-title selection-title">
        <text class="title-text">附加服务</text>
        <text class="title-tip">按需选择</text>
      </view>
      <view class="service-list">
        <view
          class="service-card"
          v-for="(service, index) in additionalServices"
          :key="service.id"
          :class="{ active: service.selected }"
          @tap="toggleService(index)"
        >
          <view class="service-header">
            <text class="service-name">{{ service.name }}</text>
            <text class="service-price">+¥{{ service.price }}{{ service.perPerson ? '/人' : '/单' }}</text>
          </view>
          <text class="service-desc">{{ service.description }}</text>
        </view>
      </view>
    </view>

    <!-- 预订须知 -->
    <view class="notice-section">
      <view class="section-title">
        <text class="title-text">预订须知</text>
      </view>
      <view class="notice-list">
        <view class="notice-item" v-for="(notice, index) in bookingNotices" :key="index">
          <text class="notice-dot">•</text>
          <text class="notice-text">{{ notice }}</text>
        </view>
      </view>
      <view class="agreement-box">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox value="agree" :checked="agreed" color="#FF9F29" />
            <text class="agreement-text">我已阅读并同意</text>
            <text class="agreement-link" @tap.stop="viewAgreement">《营地预订协议》</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @tap="selectCoupon">
      <view class="coupon-row">
        <text class="section-title">优惠券</text>
        <view class="coupon-value">
          <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '请选择' }}</text>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>
      <view v-if="selectedCoupon" class="coupon-tip">
        <text class="savings-text">已减￥{{ couponDiscount }}</text>
        <text class="coupon-desc">{{ formatCouponValidity(selectedCoupon) }}</text>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="section-title">
        <text class="title-text">价格明细</text>
      </view>
      <view class="price-list">
        <view class="price-item">
          <text class="price-label">营位费用</text>
          <text class="price-value">¥{{ selectedSiteType.price }} × {{ nights || 0 }}晚</text>
          <text class="price-amount">¥{{ siteFee }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">清洁费</text>
          <text class="price-value">一次性</text>
          <text class="price-amount">¥{{ cleaningFee }}</text>
        </view>
        <view class="price-item" v-if="selectedInsurancePlan">
          <text class="price-label">保险 - {{ selectedInsurancePlan.name }}</text>
          <text class="price-value">{{ insurancePriceLabel }}</text>
          <text class="price-amount">¥{{ totalInsuranceFee }}</text>
        </view>
        <view class="price-item" v-if="servicesFee > 0">
          <text class="price-label">附加服务</text>
          <text class="price-value">{{ servicesPriceLabel }}</text>
          <text class="price-amount">¥{{ servicesFee }}</text>
        </view>
        <view v-if="couponDiscount > 0" class="price-item discount">
          <text class="price-label">优惠券抵扣</text>
          <text class="price-amount">-¥{{ couponDiscount }}</text>
        </view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-amount highlight">¥{{ payablePrice }}</text>
        </view>
      </view>
    </view>

    <u-action-sheet
      :show="contactSheetVisible"
      :actions="contactActions"
      title="选择常用联系人"
      @select="handleContactSelect"
      @close="contactSheetVisible = false"
    ></u-action-sheet>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <text class="bar-label">总计：</text>
        <view class="bar-price">
          <text class="bar-symbol">¥</text>
          <text class="bar-amount">{{ payablePrice }}</text>
        </view>
      </view>
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit || submitting }"
        @tap="submitBooking"
        :loading="submitting"
      >
        提交预订
      </button>
    </view>

    <RentDatePicker
      ref="rentDatePickerRef"
      title-text="选择入住/离店日期"
      pickup-label="入住"
      return-label="离店"
      duration-unit="晚"
      :show-time-selection="false"
      default-time="14:00"
      @confirm="handleDateConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed, onUnmounted, watch } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import RentDatePicker from '@/components/business/RentDatePicker.vue';
import { createCampsiteBooking, type CampsiteBookingParams, type CampsiteBookingResponse } from '@/api/campsite';
import { registerMockOrder } from '@/api/order';
import { requireLogin, isLoggedIn, buildRedirectUrl } from '@/utils/auth';
import { useContactStore } from '@/stores/contact';

// 获取路由参数
const campsiteId = ref('');
const siteTypeId = ref('');
const pageReady = ref(false);
const redirectUrl = ref('/pages/campsite/booking');
let cachedRouteParams: Record<string, any> | null = null;
let couponListenerRegistered = false;

const setupPage = (options: any) => {
  campsiteId.value = options?.campsiteId || '';
  siteTypeId.value = options?.siteTypeId || '';
  selectedContactId.value = '';
  loadBookingData();
  if (contactList.value.length) {
    tryPrefillFromContacts();
  } else {
    loadContacts();
  }
  if (!couponListenerRegistered) {
    uni.$on('couponSelected', handleCouponSelected);
    couponListenerRegistered = true;
  }
  pageReady.value = true;
};

const ensureAuth = (options: any) => {
  redirectUrl.value = buildRedirectUrl('/pages/campsite/booking', options || {});
  if (isLoggedIn()) {
    return true;
  }
  return requireLogin(redirectUrl.value);
};

onLoad((options: any) => {
  cachedRouteParams = options || {};
  pageReady.value = false;
  if (!ensureAuth(cachedRouteParams)) {
    return;
  }
  setupPage(cachedRouteParams);
});

onShow(() => {
  if (!pageReady.value && cachedRouteParams && isLoggedIn()) {
    setupPage(cachedRouteParams);
  } else if (pageReady.value && isLoggedIn()) {
    loadContacts();
  }
});

// 营地信息
const campsiteInfo = ref<any>({
  id: '',
  name: '',
  address: ''
});

// 选中的营位类型
const selectedSiteType = ref<any>({
  id: '',
  name: '',
  area: 0,
  capacity: 0,
  price: 0
});

// 预订表单
const bookingForm = ref({
  checkInDate: '',
  checkOutDate: '',
  checkInTime: '10:00',
  checkOutTime: '10:00',
  guests: 2,
  contactName: '',
  contactPhone: '',
  remark: ''
});

const contactStore = useContactStore();
const { contactList } = storeToRefs(contactStore);
const selectedContactId = ref('');
const contactSheetVisible = ref(false);
const contactLoading = ref(false);

const submitting = ref(false);

// 是否同意协议
const agreed = ref(false);

// 预订须知
const bookingNotices = ref([
  '入住时间：14:00后，退房时间：12:00前',
  '预订需支付全额费用，不支持到店付款',
  '如需取消，请提前3天申请，否则不予退款',
  '请携带有效身份证件办理入住手续',
  '营地内禁止明火，烧烤请在指定区域进行',
  '请爱护营地环境，垃圾分类投放'
]);

const insurancePlans = ref([
  {
    id: 'basic',
    name: '基础意外险',
    price: 20,
    description: '旅途意外、行李延误、医疗补偿，适合短住露营',
    perPerson: true
  },
  {
    id: 'plus',
    name: '家庭露营险',
    price: 60,
    description: '覆盖家庭成员，包含儿童受伤医疗和营地财物保障',
    perPerson: false
  },
  {
    id: 'extreme',
    name: '极限活动险',
    price: 120,
    description: '增加户外运动、夜间活动的意外赔付，含紧急救援',
    perPerson: true
  }
]);

const selectedInsurance = ref(0);

const additionalServices = ref([
  {
    id: 'bbq',
    name: '营地BBQ套餐',
    price: 188,
    description: '含烤炉、炭火及精选食材，最多4人份',
    perPerson: false,
    selected: false
  },
  {
    id: 'tent',
    name: '高阶帐篷租赁',
    price: 99,
    description: '四季双层帐篷+防潮垫，适合2人使用',
    perPerson: false,
    selected: false
  },
  {
    id: 'coach',
    name: '营地活动教练',
    price: 80,
    description: '专业教练带领徒步或皮划艇体验，按人计费',
    perPerson: true,
    selected: false
  }
]);

// 已选择的优惠券
const selectedCoupon = ref<any | null>(null);

// 计算入住天数
const nights = computed(() => {
  if (!bookingForm.value.checkInDate || !bookingForm.value.checkOutDate) return 0;
  const checkIn = new Date(bookingForm.value.checkInDate);
  const checkOut = new Date(bookingForm.value.checkOutDate);
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// 价格计算
const siteFee = computed(() => {
  return selectedSiteType.value.price * nights.value;
});

const cleaningFee = ref(50);

const selectedInsurancePlan = computed(() => {
  return insurancePlans.value[selectedInsurance.value] || null;
});

const totalInsuranceFee = computed(() => {
  const plan = selectedInsurancePlan.value;
  if (!plan) return 0;
  return plan.perPerson ? plan.price * bookingForm.value.guests : plan.price;
});

const insurancePriceLabel = computed(() => {
  const plan = selectedInsurancePlan.value;
  if (!plan) return '';
  return plan.perPerson ? `¥${plan.price}/人 x ${bookingForm.value.guests}人` : `¥${plan.price}/单`;
});

const servicesFee = computed(() => {
  return additionalServices.value.reduce((total, service) => {
    if (!service.selected) return total;
    return total + (service.perPerson ? service.price * bookingForm.value.guests : service.price);
  }, 0);
});

const servicesPriceLabel = computed(() => {
  const list = additionalServices.value.filter(service => service.selected);
  if (!list.length) return '未选择';
  return list
    .map(service => (service.perPerson ? `${service.name}(${bookingForm.value.guests}人)` : service.name))
    .join('、');
});

const totalPrice = computed(() => {
  return siteFee.value + cleaningFee.value + totalInsuranceFee.value + servicesFee.value;
});

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0;
  const baseAmount = totalPrice.value;
  if (baseAmount <= 0) return 0;
  const coupon = selectedCoupon.value;

  if (typeof coupon.amount === 'number') {
    return Math.min(coupon.amount, baseAmount);
  }
  if (typeof coupon.discount === 'number') {
    return Math.min(coupon.discount, baseAmount);
  }
  if (typeof coupon.discountRate === 'number') {
    const rate = coupon.discountRate;
    let discountValue = 0;
    if (rate > 0 && rate < 1) {
      discountValue = baseAmount * (1 - rate);
    } else if (rate > 1 && rate < 10) {
      discountValue = baseAmount * (1 - rate / 10);
    }
    return Math.max(Math.min(Number(discountValue.toFixed(2)), baseAmount), 0);
  }
  return 0;
});

const payablePrice = computed(() => {
  return Math.max(totalPrice.value - couponDiscount.value, 0);
});

// 是否可以提交
const canSubmit = computed(() => {
  return (
    bookingForm.value.checkInDate &&
    bookingForm.value.checkOutDate &&
    nights.value > 0 &&
    bookingForm.value.guests > 0 &&
    bookingForm.value.contactName.trim() !== '' &&
    /^1[3-9]\d{9}$/.test(bookingForm.value.contactPhone) &&
    agreed.value
  );
});

const contactActions = computed(() => {
  return contactList.value.map((item: any) => ({
    name: item.name || '未命名联系人',
    subname: item.phone || '暂无手机号',
    id: item.id
  }));
});

const formatPhone = (phone?: string) => {
  if (!phone) return '无手机号';
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
};

const contactDisplayText = computed(() => {
  if (contactLoading.value) {
    return '联系人加载中...';
  }
  if (selectedContactId.value) {
    const target = contactList.value.find((item: any) => item.id === selectedContactId.value);
    if (target) {
      return `${target.name || '联系人'} · ${formatPhone(target.phone)}`;
    }
  }
  if (bookingForm.value.contactName || bookingForm.value.contactPhone) {
    return '使用自定义信息';
  }
  return contactList.value.length > 0 ? '请选择联系人' : '暂无联系人';
});

const applyContactToForm = (contact: any) => {
  if (!contact) return;
  bookingForm.value.contactName = contact.name || '';
  bookingForm.value.contactPhone = contact.phone || '';
  selectedContactId.value = contact.id || '';
};

const tryPrefillFromContacts = () => {
  if (
    selectedContactId.value ||
    bookingForm.value.contactName ||
    bookingForm.value.contactPhone ||
    !contactList.value.length
  ) {
    return;
  }
  const defaultContact = contactList.value.find((item: any) => item.isDefault) || contactList.value[0];
  if (defaultContact) {
    applyContactToForm(defaultContact);
  }
};

const loadContacts = async () => {
  contactLoading.value = true;
  try {
    await contactStore.fetchContacts();
    tryPrefillFromContacts();
  } catch (error) {
    logger.error('加载联系人失败:', error);
  } finally {
    contactLoading.value = false;
  }
};

const openContactSelector = () => {
  if (contactLoading.value) {
    return;
  }
  if (!contactList.value.length) {
    uni.showModal({
      title: '提示',
      content: '暂无常用联系人，是否前往管理页面添加？',
      confirmText: '去添加',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          goToContactManage();
        }
      }
    });
    return;
  }
  contactSheetVisible.value = true;
};

const handleContactSelect = (action: any) => {
  const selected = contactList.value.find((item: any) => item.id === action.id);
  if (selected) {
    applyContactToForm(selected);
  }
  contactSheetVisible.value = false;
};

const goToContactManage = () => {
  uni.navigateTo({
    url: '/pages/profile/contacts'
  });
};

const onContactFieldInput = () => {
  if (selectedContactId.value) {
    selectedContactId.value = '';
  }
};

watch(contactList, () => {
  tryPrefillFromContacts();
});

const selectInsurance = (index: number) => {
  if (index < 0 || index >= insurancePlans.value.length) {
    return;
  }
  selectedInsurance.value = index;
};

const toggleService = (index: number) => {
  if (index < 0 || index >= additionalServices.value.length) {
    return;
  }
  additionalServices.value[index].selected = !additionalServices.value[index].selected;
};

// 加载预订数据
const loadBookingData = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // Mock数据
    const mockCampsite = {
      id: campsiteId.value,
      name: '千岛湖房车营地',
      address: '浙江省杭州市淳安县千岛湖镇环湖路88号'
    };

    const mockSiteTypes = [
      {
        id: '1',
        name: '标准营位',
        area: 50,
        capacity: 4,
        price: 280
      },
      {
        id: '2',
        name: '豪华营位A',
        area: 80,
        capacity: 6,
        price: 380
      },
      {
        id: '3',
        name: '豪华营位B',
        area: 120,
        capacity: 8,
        price: 580
      }
    ];

    campsiteInfo.value = mockCampsite;
    selectedSiteType.value = mockSiteTypes.find(t => t.id === siteTypeId.value) || mockSiteTypes[0];

  } catch (error) {
    logger.error('加载预订数据失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

onUnmounted(() => {
  if (couponListenerRegistered) {
    uni.$off('couponSelected', handleCouponSelected);
    couponListenerRegistered = false;
  }
});

const rentDatePickerRef = ref();
const openDatePicker = () => {
  rentDatePickerRef.value?.open(
    bookingForm.value.checkInDate,
    bookingForm.value.checkOutDate,
    bookingForm.value.checkInTime || '10:00'
  );
};

const handleDateConfirm = (data: any) => {
  bookingForm.value.checkInDate = data.pickupDate;
  bookingForm.value.checkOutDate = data.returnDate;
  bookingForm.value.checkInTime = data.time;
  bookingForm.value.checkOutTime = data.time;
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 减少人数
const decreaseGuests = () => {
  if (bookingForm.value.guests > 1) {
    bookingForm.value.guests--;
  }
};

// 增加人数
const increaseGuests = () => {
  if (bookingForm.value.guests < selectedSiteType.value.capacity) {
    bookingForm.value.guests++;
  }
};

const selectCoupon = () => {
  if (nights.value <= 0) {
    uni.showToast({
      title: '请先选择入住/离店日期',
      icon: 'none'
    });
    return;
  }
  uni.navigateTo({
    url: `/pages/order/select-coupon?amount=${totalPrice.value}&selectedId=${selectedCoupon.value?.id || ''}&productType=campsite`
  });
};

const formatCouponValidity = (coupon: any) => {
  if (!coupon) return '';
  const end = coupon.validTo || coupon.validEnd;
  if (end) {
    const date = new Date(end);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `有效期至 ${year}.${month}.${day}`;
  }
  if (coupon.description) {
    return coupon.description;
  }
  return '已选择优惠券';
};

const handleCouponSelected = (coupon: any) => {
  selectedCoupon.value = coupon || null;
};

const buildCheckDateTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr) {
    return new Date().toISOString();
  }
  const [hour = '12', minute = '00'] = (timeStr || '12:00').split(':');
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toISOString();
};

const cacheCampsiteOrder = (bookingResult: CampsiteBookingResponse) => {
  const checkInISO = buildCheckDateTime(bookingForm.value.checkInDate, bookingForm.value.checkInTime);
  const checkOutISO = buildCheckDateTime(bookingForm.value.checkOutDate, bookingForm.value.checkOutTime);

  registerMockOrder({
    id: bookingResult.orderId,
    orderNo: bookingResult.orderNo,
    statusId: 1,
    status: { code: 'pending_payment', name: '待支付' },
    orderType: 'campsite',
    pickupTime: checkInISO,
    returnTime: checkOutISO,
    pickupStore: {
      name: campsiteInfo.value.name || '营地',
      address: campsiteInfo.value.address || '营地地址待定'
    },
    returnStore: {
      name: campsiteInfo.value.name || '营地',
      address: campsiteInfo.value.address || '营地地址待定'
    },
    totalAmount: payablePrice.value,
    actualAmount: payablePrice.value,
    guests: bookingForm.value.guests,
    pickupContactName: bookingForm.value.contactName,
    pickupContactPhone: bookingForm.value.contactPhone,
    // 营地订单的费用明细
    campsiteFeeDetails: {
      siteFee: siteFee.value,
      cleaningFee: cleaningFee.value,
      insuranceFee: totalInsuranceFee.value,
      servicesFee: servicesFee.value,
      couponDiscount: couponDiscount.value,
      nights: nights.value
    },
    vehicle: {
      id: selectedSiteType.value.id || 'site',
      name: selectedSiteType.value.name,
      brand: '营地类型',
      model: `${selectedSiteType.value.area}㎡ / 容纳${selectedSiteType.value.capacity}人`,
      images: ['/static/logo.png'],
      features: [
        `营位面积 ${selectedSiteType.value.area}㎡`,
        `最多 ${selectedSiteType.value.capacity} 人`,
        `出行保险：${selectedInsurancePlan.value?.name || '未选择'}`
      ].concat(servicesPriceLabel.value !== '未选择' ? [`附加服务：${servicesPriceLabel.value}`] : [])
    }
  });
};

// 协议变化
const onAgreementChange = (e: any) => {
  agreed.value = e.detail.value.includes('agree');
};

// 查看协议
const viewAgreement = () => {
  uni.showModal({
    title: '营地预订协议',
    content: '这里是营地预订协议的详细内容...',
    showCancel: false
  });
};

// 提交预订
const submitBooking = async () => {
  if (!isLoggedIn()) {
    requireLogin(redirectUrl.value);
    return;
  }

  if (!canSubmit.value || submitting.value) {
    if (!canSubmit.value) {
      uni.showToast({
        title: '请完善预订信息',
        icon: 'none'
      });
    }
    return;
  }

  submitting.value = true;

  try {
    uni.showLoading({ title: '提交中...' });

    const payload: CampsiteBookingParams = {
      campsiteId: campsiteInfo.value.id || campsiteId.value,
      siteTypeId: selectedSiteType.value.id || siteTypeId.value,
      checkInDate: bookingForm.value.checkInDate,
      checkOutDate: bookingForm.value.checkOutDate,
      guests: bookingForm.value.guests,
      contactName: bookingForm.value.contactName.trim(),
      contactPhone: bookingForm.value.contactPhone,
      remark: bookingForm.value.remark?.trim() || '',
      couponId: selectedCoupon.value?.id,
      contactId: selectedContactId.value || undefined,
      insurancePlanId: selectedInsurancePlan.value?.id,
      insurancePlanName: selectedInsurancePlan.value?.name,
      additionalServices: additionalServices.value
        .filter(service => service.selected)
        .map(service => ({
          id: service.id,
          name: service.name,
          quantity: service.perPerson ? bookingForm.value.guests : 1,
          perPerson: service.perPerson,
          price: service.price
        }))
    };

    let bookingResult: CampsiteBookingResponse | null = null;

    try {
      const response = await createCampsiteBooking(payload);
      if (response.code === 0 && response.data) {
        bookingResult = response.data;
        cacheCampsiteOrder(bookingResult);
      } else {
        throw new Error(response.message || '预订失败');
      }
    } catch (apiError) {
      logger.warn('创建营地预订接口暂不可用，使用Mock数据回退', apiError);
      const now = Date.now();
      bookingResult = {
        orderId: `mock-${now}`,
        orderNo: `CS${now}`,
        status: 'PENDING_PAYMENT',
        totalPrice: payablePrice.value,
        paymentDeadline: new Date(now + 15 * 60 * 1000).toISOString()
      };
      cacheCampsiteOrder(bookingResult);
    }

    if (!bookingResult) {
      throw new Error('未获取到有效的订单信息');
    }

    uni.navigateTo({
      url: `/pages/order/pay?orderNo=${bookingResult.orderNo}&amount=${bookingResult.totalPrice}`
    });
  } catch (error) {
    logger.error('提交预订失败:', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.campsite-booking {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: 140rpx;
}

// 营地信息卡片
.campsite-card {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .campsite-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $uni-spacing-lg;

    .campsite-name {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }

    .site-type-badge {
      background-color: rgba($uni-color-primary, 0.1);
      color: $uni-color-primary;
      font-size: $uni-font-size-sm;
      padding: $uni-spacing-sm $uni-spacing-lg;
      border-radius: $uni-radius-md;

      .badge-text {
        font-weight: 500;
      }
    }
  }

  .campsite-meta {
    .meta-item {
      display: flex;
      align-items: center;
      gap: $uni-spacing-sm;
      margin-bottom: $uni-spacing-md;

      &:last-child {
        margin-bottom: 0;
      }

      .meta-text {
        flex: 1;
        font-size: $uni-font-size-base;
        color: $uni-text-color-secondary;
      }

      .meta-label {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
      }

      .meta-value {
        font-size: $uni-font-size-sm;
        color: $uni-text-color;
        font-weight: 500;
        margin-right: $uni-spacing-xl;
      }
    }
  }
}

// 表单区域
.form-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .section-title {
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }
  }

  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $uni-spacing-xl 0;
    border-bottom: 2rpx solid $uni-border-color-light;
    transition: all 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: $uni-bg-color-grey;
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
        font-size: $uni-font-size-lg;
        color: $uni-text-color;
      }

      .required {
        color: $uni-color-error;
        font-size: $uni-font-size-lg;
      }
    }

    .item-value {
      display: flex;
      align-items: center;
      gap: $uni-spacing-sm;

      &.full-width {
        width: 100%;
        margin-top: $uni-spacing-lg;
        flex-direction: column;
        align-items: flex-end;
      }

      .value-text {
        font-size: $uni-font-size-lg;
        color: $uni-text-color;

        &.placeholder {
          color: $uni-text-color-placeholder;
        }
      }

      .input-field {
        flex: 1;
        font-size: $uni-font-size-lg;
        color: $uni-text-color;
        text-align: right;
      }

      .input-placeholder {
        color: $uni-text-color-placeholder;
      }

      .textarea-field {
        width: 100%;
        min-height: 160rpx;
        font-size: $uni-font-size-lg;
        color: $uni-text-color;
        padding: $uni-spacing-lg;
        background-color: $uni-bg-color-grey;
        border-radius: $uni-radius-md;
      }

      .char-count {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
        margin-top: $uni-spacing-sm;
      }

      .stepper {
        display: flex;
        align-items: center;
        gap: $uni-spacing-xl;

        .stepper-btn {
          width: 56rpx;
          height: 56rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: $uni-bg-color-grey;
          border-radius: $uni-radius-md;
          border: none;
          padding: 0;
          transition: all 0.2s ease;

          &::after {
            border: none;
          }

          &:active:not(:disabled) {
            background-color: $uni-border-color;
            transform: scale(0.95);
          }

          &:disabled {
            opacity: 0.5;
          }
        }

        .stepper-value {
          font-size: $uni-font-size-lg;
          color: $uni-text-color;
          font-weight: 500;
          min-width: 80rpx;
          text-align: center;
        }
      }
    }
  }

  .date-tip {
    margin-top: $uni-spacing-md;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
  }
}

.contact-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $uni-spacing-lg;
  border-bottom: 2rpx solid $uni-border-color-light;
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
  }

  .selector-left {
    display: flex;
    align-items: center;
    gap: $uni-spacing-md;

    .selector-label {
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      font-weight: 500;
    }
  }

  .selector-action {
    display: flex;
    align-items: center;
    gap: $uni-spacing-sm;
    font-size: $uni-font-size-base;
    color: $uni-text-color-secondary;
  }
}

.contact-helper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: $uni-spacing-lg 0 $uni-spacing-sm;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;

  .helper-link {
    color: $uni-color-primary;
  }
}

.selection-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .selection-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }

    .title-tip {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
    }
  }
}

.option-list,
.service-list {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-lg;
}

.option-card,
.service-card {
  border: 2rpx solid $uni-border-color-light;
  border-radius: $uni-radius-lg;
  padding: $uni-spacing-xl;
  background-color: $uni-bg-color-card;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.99);
  }

  &.active {
    border-color: $uni-color-primary;
    background-color: rgba($uni-color-primary, 0.08);
  }
}

.option-header,
.service-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $uni-spacing-md;

  .option-name,
  .service-name {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    font-weight: 600;
  }

  .option-price,
  .service-price {
    font-size: $uni-font-size-base;
    color: $uni-color-primary;
  }
}

.option-desc,
.service-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
  line-height: 1.5;
}

// 预订须知
.notice-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .section-title {
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }
  }

  .notice-list {
    margin-bottom: $uni-spacing-xl;

    .notice-item {
      display: flex;
      gap: $uni-spacing-md;
      margin-bottom: $uni-spacing-lg;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-dot {
        font-size: $uni-font-size-sm;
        color: $uni-color-primary;
        flex-shrink: 0;
      }

      .notice-text {
        flex: 1;
        font-size: $uni-font-size-sm;
        color: $uni-text-color-secondary;
      }
    }
  }

  .agreement-box {
    padding-top: $uni-spacing-xl;
    border-top: 2rpx solid $uni-border-color-light;

    .agreement-label {
      display: flex;
      align-items: center;
      gap: $uni-spacing-md;

      .agreement-text {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-secondary;
      }

      .agreement-link {
        font-size: $uni-font-size-sm;
        color: $uni-color-primary;
      }
    }
  }
}

// 优惠券
.coupon-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;
  transition: all 0.2s ease;

  &:active {
    background-color: $uni-bg-color-grey;
  }

  .coupon-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .coupon-value {
      display: flex;
      align-items: center;
      gap: $uni-spacing-sm;

      .coupon-text {
        font-size: $uni-font-size-sm;
        color: $uni-text-color;
      }
    }
  }

  .coupon-tip {
    display: flex;
    flex-direction: column;
    gap: $uni-spacing-xs;

    .savings-text {
      font-size: $uni-font-size-sm;
      color: $uni-color-success;
      font-weight: 500;
    }

    .coupon-desc {
      font-size: $uni-font-size-xs;
      color: $uni-text-color-placeholder;
    }
  }
}

// 价格明细
.price-section {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .section-title {
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }
  }

  .price-list {
    .price-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $uni-spacing-lg 0;
      border-bottom: 2rpx solid $uni-border-color-light;

      &:last-child {
        border-bottom: none;
      }

      &.total {
        padding-top: $uni-spacing-xl;
        margin-top: $uni-spacing-sm;
        border-top: 2rpx solid $uni-border-color;

        .price-label {
          font-size: $uni-font-size-lg;
          font-weight: 600;
        }

        .price-amount {
          font-size: 36rpx;
        }
      }

      .price-label {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
      }

      .price-value {
        flex: 1;
        font-size: $uni-font-size-xs;
        color: $uni-text-color-placeholder;
        text-align: center;
      }

      .price-amount {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        font-weight: 500;

        &.highlight {
          color: $uni-color-error;
          font-weight: 700;
        }
      }

      &.discount {
        .price-label {
          color: $uni-color-success;
        }

        .price-amount {
          color: $uni-color-success;
        }
      }
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-lg $uni-spacing-xl;
  padding-bottom: calc(#{$uni-spacing-lg} + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;

  .bar-left {
    display: flex;
    align-items: baseline;
    gap: $uni-spacing-sm;

    .bar-label {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-secondary;
    }

    .bar-price {
      display: flex;
      align-items: baseline;

      .bar-symbol {
        font-size: $uni-font-size-xs;
        color: $uni-color-error;
        font-weight: 600;
      }

      .bar-amount {
        font-size: 44rpx;
        color: $uni-color-error;
        font-weight: 700;
        margin-left: 4rpx;
        font-family: 'DIN Alternate', sans-serif;
      }
    }
  }

  .submit-btn {
    padding: $uni-spacing-lg $uni-spacing-xl;
    background: $uni-color-primary-gradient;
    color: $uni-text-color-inverse;
    border-radius: $uni-radius-btn;
    font-size: $uni-font-size-base;
    font-weight: 600;
    border: none;
    box-shadow: $uni-shadow-glow;
    transition: all 0.2s ease;

    &::after {
      border: none;
    }

    &:active:not(.disabled) {
      transform: scale(0.98);
      opacity: 0.9;
    }

    &.disabled {
      background: $uni-bg-color-grey;
      color: $uni-text-color-placeholder;
      box-shadow: none;
    }
  }
}
</style>
