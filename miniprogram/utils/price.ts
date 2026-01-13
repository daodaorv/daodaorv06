/**
 * 价格计算工具
 * 统一管理所有价格计算逻辑,避免重复代码和计算错误
 */

/**
 * 费用明细接口
 */
export interface FeeDetails {
  rentalFee?: number;      // 租赁费
  serviceFee?: number;     // 服务费
  discountAmount?: number; // 优惠金额
  totalAmount: number;     // 总金额
  actualAmount: number;    // 实付金额
}

/**
 * 计算优惠后的实付金额
 * @param totalAmount 总金额
 * @param discountAmount 优惠金额
 * @returns 实付金额
 */
export function calculateActualAmount(totalAmount: number, discountAmount: number = 0): number {
  return Math.max(totalAmount - discountAmount, 0);
}

/**
 * 计算房车订单费用明细
 * @param totalAmount 总金额
 * @param actualAmount 实付金额
 * @param serviceFee 服务费(默认160)
 * @returns 费用明细
 */
export function calculateVehicleFeeDetails(
  totalAmount: number,
  actualAmount: number,
  serviceFee: number = 160
): FeeDetails {
  const discountAmount = totalAmount - actualAmount;
  const rentalFee = totalAmount - serviceFee;

  return {
    rentalFee,
    serviceFee,
    discountAmount,
    totalAmount,
    actualAmount
  };
}

/**
 * 格式化价格显示
 * @param price 价格
 * @param showSymbol 是否显示货币符号(默认true)
 * @param decimals 小数位数(默认2)
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number, showSymbol: boolean = true, decimals: number = 2): string {
  const formattedPrice = price.toFixed(decimals);
  return showSymbol ? `¥${formattedPrice}` : formattedPrice;
}
