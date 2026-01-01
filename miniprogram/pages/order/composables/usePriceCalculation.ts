/**
 * 订单价格计算 Composable
 * 负责订单的价格计算逻辑
 */

import { ref, computed } from 'vue';

export interface PriceCalculationOptions {
  dailyPrice: number;
  rentalDays: number;
  insurancePrice: number;
  servicesPrice: number;
  couponDiscount: number;
  isSpecialOffer?: boolean;
  packagePrice?: number;
}

export function usePriceCalculation() {
  // 基础价格
  const dailyPrice = ref(0);
  const rentalDays = ref(1);

  // 保险价格
  const insurancePrice = ref(0);

  // 附加服务价格
  const servicesPrice = ref(0);

  // 优惠券抵扣
  const couponDiscount = ref(0);

  // 特惠套餐
  const isSpecialOffer = ref(false);
  const packagePrice = ref(0);

  /**
   * 计算基础租金
   */
  const basePrice = computed(() => {
    if (isSpecialOffer.value) {
      return packagePrice.value;
    }
    return dailyPrice.value * rentalDays.value;
  });

  /**
   * 计算总价
   */
  const totalPrice = computed(() => {
    const total = basePrice.value +
                  insurancePrice.value +
                  servicesPrice.value -
                  couponDiscount.value;
    return Math.max(total, 0);
  });

  /**
   * 设置价格参数
   */
  const setPriceParams = (options: Partial<PriceCalculationOptions>) => {
    if (options.dailyPrice !== undefined) dailyPrice.value = options.dailyPrice;
    if (options.rentalDays !== undefined) rentalDays.value = options.rentalDays;
    if (options.insurancePrice !== undefined) insurancePrice.value = options.insurancePrice;
    if (options.servicesPrice !== undefined) servicesPrice.value = options.servicesPrice;
    if (options.couponDiscount !== undefined) couponDiscount.value = options.couponDiscount;
    if (options.isSpecialOffer !== undefined) isSpecialOffer.value = options.isSpecialOffer;
    if (options.packagePrice !== undefined) packagePrice.value = options.packagePrice;
  };

  /**
   * 重置价格
   */
  const resetPrice = () => {
    dailyPrice.value = 0;
    rentalDays.value = 1;
    insurancePrice.value = 0;
    servicesPrice.value = 0;
    couponDiscount.value = 0;
    isSpecialOffer.value = false;
    packagePrice.value = 0;
  };

  return {
    // 状态
    dailyPrice,
    rentalDays,
    insurancePrice,
    servicesPrice,
    couponDiscount,
    isSpecialOffer,
    packagePrice,
    // 计算属性
    basePrice,
    totalPrice,
    // 方法
    setPriceParams,
    resetPrice
  };
}
