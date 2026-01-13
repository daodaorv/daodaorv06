<template>
  <view class="tour-booking">
    <!-- 线路信息卡片 -->
    <view class="tour-card">
      <view class="tour-header">
        <text class="tour-title">{{ tourInfo.title }}</text>
      </view>
      <view class="tour-meta">
        <view class="meta-item">
          <u-icon name="calendar" size="14" color="#999"></u-icon>
          <text class="meta-text">{{ tourInfo.duration }}天{{ tourInfo.duration - 1 }}晚</text>
        </view>
        <view class="meta-item">
          <u-icon name="flag" size="14" color="#999"></u-icon>
          <text class="meta-text">出发日期：{{ formatDate(batchInfo.departureDate) }}</text>
        </view>
      </view>
    </view>

    <!-- 参团人员信息 -->
    <view class="form-section">
      <view class="section-title">
        <text class="title-text">参团人员</text>
        <text class="title-tip">（至少1人）</text>
      </view>

      <!-- 成人数量 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">成人</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseAdults" :disabled="bookingForm.adults <= 1">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.adults }}人</text>
            <button class="stepper-btn" @tap="increaseAdults" :disabled="totalPeople >= maxPeople">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
          <text class="price-text">¥{{ tourInfo.pricePerPerson }}/人</text>
        </view>
      </view>

      <!-- 儿童数量 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">儿童</text>
          <text class="label-tip">（12岁以下）</text>
        </view>
        <view class="item-value">
          <view class="stepper">
            <button class="stepper-btn" @tap="decreaseChildren" :disabled="bookingForm.children <= 0">
              <u-icon name="minus" size="16" color="#666"></u-icon>
            </button>
            <text class="stepper-value">{{ bookingForm.children }}人</text>
            <button class="stepper-btn" @tap="increaseChildren" :disabled="totalPeople >= maxPeople">
              <u-icon name="plus" size="16" color="#666"></u-icon>
            </button>
          </view>
          <text class="price-text">¥{{ tourInfo.childPrice }}/人</text>
        </view>
      </view>

      <!-- 人数提示 -->
      <view class="people-tip">
        <text class="tip-text">当前{{ totalPeople }}人，成团需{{ tourInfo.minPeople }}-{{ tourInfo.maxPeople }}人</text>
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
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
            @input="onContactFieldInput"
          />
        </view>
      </view>

      <!-- 身份证号 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">身份证号</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.idCard"
            maxlength="18"
            placeholder="请输入身份证号"
            placeholder-class="input-placeholder"
            @input="onContactFieldInput"
          />
        </view>
      </view>

      <!-- 紧急联系人 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">紧急联系人</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.emergencyContact"
            placeholder="请输入紧急联系人姓名"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 紧急联系电话 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">紧急联系电话</text>
          <text class="required">*</text>
        </view>
        <view class="item-value">
          <input
            class="input-field"
            v-model="bookingForm.emergencyPhone"
            type="number"
            maxlength="11"
            placeholder="请输入紧急联系电话"
            placeholder-class="input-placeholder"
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
        <text class="title-tip">可按需选择</text>
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
            <text class="option-price">+¥{{ plan.price }}{{ plan.perPerson ? '/人' : '/团' }}</text>
          </view>
          <text class="option-desc">{{ plan.description }}</text>
        </view>
      </view>
    </view>

    <!-- 附加服务 -->
    <view class="selection-section">
      <view class="section-title selection-title">
        <text class="title-text">附加服务</text>
        <text class="title-tip">可选</text>
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
            <text class="service-price">+¥{{ service.price }}{{ service.perPerson ? '/人' : '/团' }}</text>
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
            <text class="agreement-link" @tap.stop="viewAgreement">《旅游服务协议》</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @tap="selectCoupon">
      <view class="coupon-row">
        <text class="section-title">优惠券</text>
        <view class="coupon-value">
          <text class="coupon-text">{{ selectedCoupon ? selectedCoupon.name : '请选择可用优惠券' }}</text>
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
          <text class="price-label">成人费用</text>
          <text class="price-value">¥{{ tourInfo.pricePerPerson }} x {{ bookingForm.adults }}人</text>
          <text class="price-amount">¥{{ adultFee }}</text>
        </view>
        <view class="price-item" v-if="bookingForm.children > 0">
          <text class="price-label">儿童费用</text>
          <text class="price-value">¥{{ tourInfo.childPrice }} x {{ bookingForm.children }}人</text>
          <text class="price-amount">¥{{ childFee }}</text>
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
  </view>
</template>

<script setup lang="ts">
import { logger } from '@/utils/logger';
import { ref, computed, onUnmounted, watch } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import { createTourBooking, type TourBookingParams, type TourBookingResponse } from '@/api/tour';
import { requireLogin, isLoggedIn, buildRedirectUrl } from '@/utils/auth';
import { registerMockOrder } from '@/api/order';
import { useContactStore } from '@/stores/contact';
import { mockTourBooking, mockTourBatch } from '@/mock';
import { BackendOrderStatus, getStatusName } from '@/utils/orderStatus';

// 获取路由参数
const tourId = ref('');
const batchId = ref('');
const pageReady = ref(false);
const redirectUrl = ref('/pages/tour/booking');
let cachedRouteParams: Record<string, any> | null = null;
let couponListenerRegistered = false;

const setupPage = (options: any) => {
  tourId.value = options?.tourId || '';
  batchId.value = options?.batchId || '';
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
  redirectUrl.value = buildRedirectUrl('/pages/tour/booking', options || {});
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

// 线路信息
const tourInfo = ref<any>({
  id: '',
  title: '',
  duration: 0,
  minPeople: 0,
  maxPeople: 0,
  pricePerPerson: 0,
  childPrice: 0
});

// 批次信息
const batchInfo = ref<any>({
  id: '',
  departureDate: '',
  currentPeople: 0,
  maxPeople: 0
});

// 预订表单
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

const contactStore = useContactStore();
const { contactList } = storeToRefs(contactStore);
const selectedContactId = ref('');
const contactSheetVisible = ref(false);
const contactLoading = ref(false);

const submitting = ref(false);
const selectedCoupon = ref<any | null>(null);

// 是否同意协议
const agreed = ref(false);

const insurancePlans = ref([
  {
    id: 'basic',
    name: '基础出行险',
    price: 50,
    description: '含旅途意外、延误及医疗保障，适合日常出行',
    perPerson: true
  },
  {
    id: 'standard',
    name: '全面尊享险',
    price: 120,
    description: '额外覆盖财物损失与航班延误，提供24小时救援',
    perPerson: true
  },
  {
    id: 'premium',
    name: '高原无忧险',
    price: 260,
    description: '包含高原特别保障与紧急撤离服务，适合川藏长线',
    perPerson: true
  }
]);

const selectedInsurance = ref(0);

const additionalServices = ref([
  {
    id: 'camp_dinner',
    name: '营地围炉晚餐',
    price: 199,
    description: '提供川味烧烤、火锅等营地暖心晚餐',
    perPerson: false,
    selected: false
  },
  {
    id: 'airport_transfer',
    name: '机场/酒店接送',
    price: 299,
    description: '成都双流机场或市区酒店单程接送至集合地',
    perPerson: false,
    selected: false
  },
  {
    id: 'oxygen_pack',
    name: '高反应急包',
    price: 80,
    description: '包含便携氧气瓶、红景天及常用止痛药',
    perPerson: true,
    selected: false
  }
]);

// 预订须知
const bookingNotices = ref([
  '本线路为成团产品，最少5人成团，出发前3天确认是否成团',
  '高原地区，请提前做好身体准备，有高血压、心脏病等疾病者不宜参加',
  '请携带身份证、驾驶证等有效证件',
  '儿童价格适用于12岁以下，不占床位',
  '行程中如遇天气、路况等不可抗力因素，领队有权调整行程',
  '建议购买高原旅游保险'
]);

// 最大人数限制
const maxPeople = computed(() => {
  return batchInfo.value.maxPeople - batchInfo.value.currentPeople;
});

// 总人数
const totalPeople = computed(() => {
  return bookingForm.value.adults + bookingForm.value.children;
});

// 成人费用
const adultFee = computed(() => {
  return tourInfo.value.pricePerPerson * bookingForm.value.adults;
});

// 儿童费用
const childFee = computed(() => {
  return tourInfo.value.childPrice * bookingForm.value.children;
});

const selectedInsurancePlan = computed(() => {
  return insurancePlans.value[selectedInsurance.value] || null;
});

const totalInsuranceFee = computed(() => {
  const plan = selectedInsurancePlan.value;
  if (!plan) return 0;
  return plan.perPerson ? plan.price * totalPeople.value : plan.price;
});

const insurancePriceLabel = computed(() => {
  const plan = selectedInsurancePlan.value;
  if (!plan) return '';
  return plan.perPerson
    ? `¥${plan.price}/人 x ${totalPeople.value}人`
    : `¥${plan.price}/团`;
});

const servicesFee = computed(() => {
  return additionalServices.value.reduce((total, service) => {
    if (!service.selected) {
      return total;
    }
    return total + (service.perPerson ? service.price * totalPeople.value : service.price);
  }, 0);
});

const servicesPriceLabel = computed(() => {
  const selected = additionalServices.value.filter((service) => service.selected);
  if (!selected.length) {
    return '未选择';
  }
  return selected
    .map((service) => (service.perPerson ? `${service.name}(${totalPeople.value}人)` : service.name))
    .join('、');
});

// 总价格
const totalPrice = computed(() => {
  return adultFee.value + childFee.value + totalInsuranceFee.value + servicesFee.value;
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
  bookingForm.value.idCard = contact.idCard || '';
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

// 加载预订数据
const loadBookingData = async () => {
  try {
    uni.showLoading({ title: '加载中...' });

    // 使用集中管理的Mock数据
    tourInfo.value = { ...mockTourBooking, id: tourId.value };
    batchInfo.value = { ...mockTourBatch, id: batchId.value };

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

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 增加成人数量
const increaseAdults = () => {
  if (totalPeople.value < maxPeople.value) {
    bookingForm.value.adults++;
  }
};

// 减少成人数量
const decreaseAdults = () => {
  if (bookingForm.value.adults > 1) {
    bookingForm.value.adults--;
  }
};

// 增加儿童数量
const increaseChildren = () => {
  if (totalPeople.value < maxPeople.value) {
    bookingForm.value.children++;
  }
};

// 减少儿童数量
const decreaseChildren = () => {
  if (bookingForm.value.children > 0) {
    bookingForm.value.children--;
  }
};

onUnmounted(() => {
  if (couponListenerRegistered) {
    uni.$off('couponSelected', handleCouponSelected);
    couponListenerRegistered = false;
  }
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

const selectCoupon = () => {
  if (totalPrice.value <= 0) {
    uni.showToast({
      title: '请先完善预订信息',
      icon: 'none'
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/order/select-coupon?amount=${totalPrice.value}&selectedId=${selectedCoupon.value?.id || ''}&productType=tour`
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

const buildISODateTime = (dateStr?: string, hour: number = 9) => {
  if (!dateStr) {
    return new Date().toISOString();
  }
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const cacheTourOrder = (bookingResult: TourBookingResponse) => {
  const departureISO = buildISODateTime(batchInfo.value.departureDate, 9);
  const returnDate = new Date(departureISO);
  if (tourInfo.value.duration > 0) {
    returnDate.setDate(returnDate.getDate() + tourInfo.value.duration - 1);
  }

  registerMockOrder({
    id: bookingResult.orderId,
    orderNo: bookingResult.orderNo,
    statusId: 1,
    status: { code: BackendOrderStatus.PENDING, name: getStatusName(BackendOrderStatus.PENDING) },
    orderType: 'tour',
    pickupTime: departureISO,
    returnTime: returnDate.toISOString(),
    pickupStore: {
      name: '集合地点',
      address: '具体集合地点以出行通知为准'
    },
    returnStore: {
      name: '行程结束',
      address: '具体地点以出行通知为准'
    },
    totalAmount: payablePrice.value,
    actualAmount: payablePrice.value,
    passengers: totalPeople.value,
    pickupContactName: bookingForm.value.contactName,
    pickupContactPhone: bookingForm.value.contactPhone,
    vehicle: {
      id: tourInfo.value.id,
      name: tourInfo.value.title,
      brand: '旅游线路',
      model: `${tourInfo.value.duration}日游`,
      plateNumber: '线路',
      images: tourInfo.value.images || ['/static/logo.png'],
      features: [
        `成团人数 ${tourInfo.value.minPeople}-${tourInfo.value.maxPeople}`,
        `成人 ¥${tourInfo.value.pricePerPerson}`,
        `儿童 ¥${tourInfo.value.childPrice}`,
        `出行保险：${selectedInsurancePlan.value?.name || '未选择'}`
      ].concat(
        servicesPriceLabel.value !== '未选择' ? [`附加服务：${servicesPriceLabel.value}`] : []
      )
    }
  });
};

const navigateToPayPage = (orderNo: string, amount: number) => {
  const payUrl = `/pages/order/pay?orderNo=${orderNo}&amount=${amount}`;
  const openPayPage = () => {
    uni.navigateTo({
      url: payUrl,
      fail: navError => {
        logger.error('收银台 navigateTo 失败:', navError);
        uni.redirectTo({
          url: payUrl,
          fail: redirectError => {
            logger.error('收银台 redirectTo 失败:', redirectError);
            uni.showToast({
              title: '跳转支付页面失败，请前往订单列表完成支付',
              icon: 'none'
            });
            uni.reLaunch({
              url: '/pages/order/list'
            });
          }
        });
      }
    });
  };

  uni.showToast({
    title: '订单已创建，正在跳转支付',
    icon: 'none',
    duration: 1500
  });

  openPayPage();
};

// 协议变化
const onAgreementChange = (e: any) => {
  agreed.value = e.detail.value.includes('agree');
};

// 查看协议
const viewAgreement = () => {
  uni.showModal({
    title: '旅游服务协议',
    content: '这里是旅游服务协议的详细内容...',
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

    const payload: TourBookingParams = {
      tourId: tourInfo.value.id || tourId.value,
      batchId: batchInfo.value.id || batchId.value,
      adults: bookingForm.value.adults,
      children: bookingForm.value.children,
      contactName: bookingForm.value.contactName.trim(),
      contactPhone: bookingForm.value.contactPhone,
      idCard: bookingForm.value.idCard,
      emergencyContact: bookingForm.value.emergencyContact.trim(),
      emergencyPhone: bookingForm.value.emergencyPhone,
      remark: bookingForm.value.remark?.trim() || '',
      couponId: selectedCoupon.value?.id,
      insurancePlanId: selectedInsurancePlan.value?.id,
      insurancePlanName: selectedInsurancePlan.value?.name,
      additionalServices: additionalServices.value
        .filter((service) => service.selected)
        .map((service) => ({
          id: service.id,
          name: service.name,
          quantity: service.perPerson ? totalPeople.value : 1,
          perPerson: service.perPerson,
          price: service.price
        }))
    };

    let bookingResult: TourBookingResponse | null = null;

    try {
      const response = await createTourBooking(payload);
      if (response.code === 0 && response.data) {
        bookingResult = response.data;
        cacheTourOrder(bookingResult);
      } else {
        throw new Error(response.message || '预订失败');
      }
    } catch (apiError) {
      logger.warn('创建旅游预订接口暂不可用，使用Mock数据回退', apiError);
      const now = Date.now();
      bookingResult = {
        orderId: `mock-${now}`,
        orderNo: `TR${now}`,
        status: 'PENDING_PAYMENT',
        totalPrice: payablePrice.value,
        paymentDeadline: new Date(now + 15 * 60 * 1000).toISOString()
      };
      cacheTourOrder(bookingResult);
    }

    if (!bookingResult) {
      throw new Error('未获取到有效的订单信息');
    }

    uni.hideLoading();
    navigateToPayPage(bookingResult.orderNo, bookingResult.totalPrice);
  } catch (error) {
    logger.error('提交预订失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.tour-booking {
  min-height: 100vh;
  background-color: $uni-bg-color;
  padding-bottom: 140rpx;
}

// 线路信息卡片
.tour-card {
  background-color: $uni-bg-color-card;
  padding: $uni-spacing-xl;
  margin-bottom: $uni-spacing-lg;
  box-shadow: $uni-shadow-card;

  .tour-header {
    margin-bottom: $uni-spacing-lg;

    .tour-title {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
      line-height: 1.4;
    }
  }

  .tour-meta {
    display: flex;
    flex-wrap: wrap;
    gap: $uni-spacing-xl;

    .meta-item {
      display: flex;
      align-items: center;
      gap: $uni-spacing-sm;

      .meta-text {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-secondary;
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
    display: flex;
    align-items: baseline;
    margin-bottom: $uni-spacing-xl;

    .title-text {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: $uni-text-color;
    }

    .title-tip {
      font-size: $uni-font-size-xs;
      color: $uni-text-color-placeholder;
      margin-left: $uni-spacing-md;
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
        font-size: $uni-font-size-base;
        color: $uni-text-color;
      }

      .label-tip {
        font-size: $uni-font-size-xs;
        color: $uni-text-color-placeholder;
      }

      .required {
        color: $uni-color-error;
        font-size: $uni-font-size-base;
      }
    }

    .item-value {
      display: flex;
      align-items: center;
      gap: $uni-spacing-lg;

      &.full-width {
        width: 100%;
        margin-top: $uni-spacing-lg;
        flex-direction: column;
        align-items: flex-end;
      }

      .input-field {
        flex: 1;
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        text-align: right;
        min-width: 200rpx;
      }

      .input-placeholder {
        color: $uni-text-color-placeholder;
      }

      .textarea-field {
        width: 100%;
        min-height: 160rpx;
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        padding: $uni-spacing-lg;
        background-color: $uni-bg-color-grey;
        border-radius: $uni-radius-md;
      }

      .char-count {
        font-size: $uni-font-size-xs;
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
          font-size: $uni-font-size-base;
          color: $uni-text-color;
          font-weight: 500;
          min-width: 80rpx;
          text-align: center;
        }
      }

      .price-text {
        font-size: $uni-font-size-xs;
        color: $uni-color-primary;
      }
    }
  }

  .people-tip {
    padding: $uni-spacing-lg;
    background-color: rgba($uni-color-primary, 0.1);
    border-radius: $uni-radius-md;
    margin-top: $uni-spacing-lg;

    .tip-text {
      font-size: $uni-font-size-xs;
      color: $uni-color-primary;
    }
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
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      font-weight: 500;
    }
  }

  .selector-action {
    display: flex;
    align-items: center;
    gap: $uni-spacing-sm;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-secondary;
  }
}

.contact-helper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: $uni-spacing-lg 0 $uni-spacing-sm;
  font-size: $uni-font-size-xs;
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
      font-size: $uni-font-size-xs;
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
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: 600;
  }

  .option-price,
  .service-price {
    font-size: $uni-font-size-sm;
    color: $uni-color-primary;
  }
}

.option-desc,
.service-desc {
  font-size: $uni-font-size-xs;
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
        min-width: 120rpx;
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
        .price-label,
        .price-amount {
          color: $uni-color-success;
          font-weight: 600;
        }
      }
    }
  }
}

// 优惠券区域
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
