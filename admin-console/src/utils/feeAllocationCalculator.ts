/**
 * 费用分配计算工具
 * 根据费用类型和订单信息自动计算费用分配方案
 */

import { calculateStoreDistance } from './distanceCalculator'

// 费用分配规则
export interface FeeAllocationRule {
  partyType: 'platform' | 'pickup_store' | 'return_store' | 'service_store'
  partyId?: number
  partyName?: string
  percentage: number // 分配比例(0-100)
  amount?: number // 实际分配金额(计算后填充)
}

// 特殊费用计算方式
export type SpecialFeeCalculationType = 'fixed' | 'distance'

// 增值费用信息
export interface ExtraFee {
  id: number
  name: string
  type: 'insurance' | 'equipment' | 'service' | 'store_special' | 'special' | 'other'
  price: number
  unit: string
  ownerType: 'platform' | 'store' | 'multi_party'
  storeId?: number
  storeName?: string

  // 门店特色服务配置
  isStoreSpecial?: boolean
  applicableStoreIds?: number[]

  // 特殊费用配置
  calculationType?: SpecialFeeCalculationType
  distanceUnitPrice?: number
  allocationRules?: FeeAllocationRule[]

  // 自动分配配置
  autoAllocate?: boolean
  allocationStrategy?: 'same_store' | 'split_evenly' | 'custom'
}

// 订单信息
export interface Order {
  id: number
  pickupStoreId: number
  pickupStoreName: string
  returnStoreId: number
  returnStoreName: string
}

// 门店信息
export interface Store {
  id: number
  name: string
  latitude: number
  longitude: number
}

// 订单增值费用明细
export interface OrderExtraFee {
  extraFeeId: number
  name: string
  type: string
  price: number
  quantity: number
  unit: string
  totalAmount: number
  ownerType: 'platform' | 'store' | 'multi_party'
  storeId?: number
  storeName?: string

  // 多方分配信息
  allocations?: FeeAllocationRule[]

  // 特殊费用计算信息
  calculationType?: SpecialFeeCalculationType
  distanceKm?: number
  distanceUnitPrice?: number
}

/**
 * 验证分配规则
 * @param rules 分配规则列表
 * @returns 是否有效
 */
export function validateAllocationRules(rules: FeeAllocationRule[]): boolean {
  if (!rules || rules.length === 0) {
    return false
  }

  // 计算总比例
  const totalPercentage = rules.reduce((sum, rule) => sum + rule.percentage, 0)

  // 总比例必须等于100
  if (Math.abs(totalPercentage - 100) > 0.01) {
    console.error(`分配规则总比例必须为100%, 当前为${totalPercentage}%`)
    return false
  }

  // 每个规则的比例必须大于0
  if (rules.some(rule => rule.percentage <= 0)) {
    console.error('分配规则的比例必须大于0')
    return false
  }

  return true
}

/**
 * 计算分配金额
 * @param totalAmount 总金额
 * @param rules 分配规则
 * @returns 带金额的分配规则
 */
function calculateAllocationAmounts(
  totalAmount: number,
  rules: FeeAllocationRule[]
): FeeAllocationRule[] {
  const result: FeeAllocationRule[] = []
  let remainingAmount = totalAmount

  // 计算每个规则的金额
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    let amount: number

    // 最后一个规则使用剩余金额,避免精度问题
    if (i === rules.length - 1) {
      amount = remainingAmount
    } else {
      amount = Math.round(((totalAmount * rule.percentage) / 100) * 100) / 100
      remainingAmount -= amount
    }

    result.push({
      ...rule,
      amount,
    })
  }

  return result
}

/**
 * 计算门店特色服务分配
 * @param extraFee 增值费用
 * @param order 订单信息
 * @returns 订单增值费用明细
 */
function calculateStoreSpecialServiceAllocation(extraFee: ExtraFee, order: Order): OrderExtraFee {
  // 门店特色服务100%归属设置该服务的门店
  const totalAmount = extraFee.price

  return {
    extraFeeId: extraFee.id,
    name: extraFee.name,
    type: extraFee.type,
    price: extraFee.price,
    quantity: 1,
    unit: extraFee.unit,
    totalAmount,
    ownerType: 'store',
    storeId: extraFee.storeId,
    storeName: extraFee.storeName,
    allocations: [
      {
        partyType: 'service_store',
        partyId: extraFee.storeId,
        partyName: extraFee.storeName,
        percentage: 100,
        amount: totalAmount,
      },
    ],
  }
}

/**
 * 计算特殊费用分配(按距离)
 * @param extraFee 增值费用
 * @param order 订单信息
 * @param stores 门店列表
 * @returns 订单增值费用明细
 */
function calculateSpecialFeeAllocation(
  extraFee: ExtraFee,
  order: Order,
  stores: Store[]
): OrderExtraFee {
  // 计算距离
  const distanceResult = calculateStoreDistance(order.pickupStoreId, order.returnStoreId, stores)
  const distanceKm = distanceResult.distance

  // 计算总金额
  const unitPrice = extraFee.distanceUnitPrice || 0
  const totalAmount = Math.round(distanceKm * unitPrice * 100) / 100

  // 使用配置的分配规则
  const rules = extraFee.allocationRules || []

  // 验证分配规则
  if (!validateAllocationRules(rules)) {
    throw new Error('特殊费用的分配规则无效')
  }

  // 计算分配金额
  const allocations = calculateAllocationAmounts(totalAmount, rules)

  // 填充门店信息
  const allocationsWithStoreInfo = allocations.map(rule => {
    let partyId = rule.partyId
    let partyName = rule.partyName

    if (rule.partyType === 'pickup_store') {
      partyId = order.pickupStoreId
      partyName = order.pickupStoreName
    } else if (rule.partyType === 'return_store') {
      partyId = order.returnStoreId
      partyName = order.returnStoreName
    }

    return {
      ...rule,
      partyId,
      partyName,
    }
  })

  return {
    extraFeeId: extraFee.id,
    name: extraFee.name,
    type: extraFee.type,
    price: unitPrice,
    quantity: distanceKm,
    unit: '公里',
    totalAmount,
    ownerType: 'multi_party',
    allocations: allocationsWithStoreInfo,
    calculationType: 'distance',
    distanceKm,
    distanceUnitPrice: unitPrice,
  }
}

/**
 * 计算常规费用分配
 * @param extraFee 增值费用
 * @param order 订单信息
 * @returns 订单增值费用明细
 */
function calculateRegularFeeAllocation(extraFee: ExtraFee, order: Order): OrderExtraFee {
  const totalAmount = extraFee.price

  // 如果是同一门店,100%归该店
  if (order.pickupStoreId === order.returnStoreId) {
    return {
      extraFeeId: extraFee.id,
      name: extraFee.name,
      type: extraFee.type,
      price: extraFee.price,
      quantity: 1,
      unit: extraFee.unit,
      totalAmount,
      ownerType: 'store',
      storeId: order.pickupStoreId,
      storeName: order.pickupStoreName,
      allocations: [
        {
          partyType: 'pickup_store',
          partyId: order.pickupStoreId,
          partyName: order.pickupStoreName,
          percentage: 100,
          amount: totalAmount,
        },
      ],
    }
  }

  // 不同门店,根据策略分配
  const strategy = extraFee.allocationStrategy || 'split_evenly'

  let allocations: FeeAllocationRule[] = []

  if (strategy === 'split_evenly') {
    // 平均分配
    allocations = [
      {
        partyType: 'pickup_store',
        partyId: order.pickupStoreId,
        partyName: order.pickupStoreName,
        percentage: 50,
        amount: totalAmount / 2,
      },
      {
        partyType: 'return_store',
        partyId: order.returnStoreId,
        partyName: order.returnStoreName,
        percentage: 50,
        amount: totalAmount / 2,
      },
    ]
  } else if (strategy === 'custom' && extraFee.allocationRules) {
    // 自定义分配
    if (!validateAllocationRules(extraFee.allocationRules)) {
      throw new Error('自定义分配规则无效')
    }
    allocations = calculateAllocationAmounts(totalAmount, extraFee.allocationRules)
  } else {
    // 默认平均分配
    allocations = [
      {
        partyType: 'pickup_store',
        partyId: order.pickupStoreId,
        partyName: order.pickupStoreName,
        percentage: 50,
        amount: totalAmount / 2,
      },
      {
        partyType: 'return_store',
        partyId: order.returnStoreId,
        partyName: order.returnStoreName,
        percentage: 50,
        amount: totalAmount / 2,
      },
    ]
  }

  return {
    extraFeeId: extraFee.id,
    name: extraFee.name,
    type: extraFee.type,
    price: extraFee.price,
    quantity: 1,
    unit: extraFee.unit,
    totalAmount,
    ownerType: 'multi_party',
    allocations,
  }
}

/**
 * 计算费用分配
 * @param extraFee 增值费用
 * @param order 订单信息
 * @param stores 门店列表
 * @returns 订单增值费用明细
 */
export function calculateFeeAllocation(
  extraFee: ExtraFee,
  order: Order,
  stores: Store[]
): OrderExtraFee {
  // 门店特色服务
  if (extraFee.type === 'store_special' || extraFee.isStoreSpecial) {
    return calculateStoreSpecialServiceAllocation(extraFee, order)
  }

  // 特殊费用(按距离计算)
  if (extraFee.type === 'special' && extraFee.calculationType === 'distance') {
    return calculateSpecialFeeAllocation(extraFee, order, stores)
  }

  // 平台归属
  if (extraFee.ownerType === 'platform') {
    return {
      extraFeeId: extraFee.id,
      name: extraFee.name,
      type: extraFee.type,
      price: extraFee.price,
      quantity: 1,
      unit: extraFee.unit,
      totalAmount: extraFee.price,
      ownerType: 'platform',
      allocations: [
        {
          partyType: 'platform',
          percentage: 100,
          amount: extraFee.price,
        },
      ],
    }
  }

  // 单一门店归属
  if (extraFee.ownerType === 'store' && extraFee.storeId) {
    return {
      extraFeeId: extraFee.id,
      name: extraFee.name,
      type: extraFee.type,
      price: extraFee.price,
      quantity: 1,
      unit: extraFee.unit,
      totalAmount: extraFee.price,
      ownerType: 'store',
      storeId: extraFee.storeId,
      storeName: extraFee.storeName,
      allocations: [
        {
          partyType: 'service_store',
          partyId: extraFee.storeId,
          partyName: extraFee.storeName,
          percentage: 100,
          amount: extraFee.price,
        },
      ],
    }
  }

  // 常规费用(自动分配)
  if (extraFee.autoAllocate) {
    return calculateRegularFeeAllocation(extraFee, order)
  }

  // 默认返回基础信息
  return {
    extraFeeId: extraFee.id,
    name: extraFee.name,
    type: extraFee.type,
    price: extraFee.price,
    quantity: 1,
    unit: extraFee.unit,
    totalAmount: extraFee.price,
    ownerType: extraFee.ownerType,
  }
}

/**
 * 批量计算订单的所有增值费用分配
 * @param extraFees 增值费用列表
 * @param order 订单信息
 * @param stores 门店列表
 * @returns 订单增值费用明细列表
 */
export function calculateOrderExtraFees(
  extraFees: ExtraFee[],
  order: Order,
  stores: Store[]
): OrderExtraFee[] {
  return extraFees.map(fee => calculateFeeAllocation(fee, order, stores))
}

/**
 * 计算订单增值费用总额
 * @param orderExtraFees 订单增值费用明细列表
 * @returns 总金额
 */
export function calculateTotalExtraFeesAmount(orderExtraFees: OrderExtraFee[]): number {
  return orderExtraFees.reduce((sum, fee) => sum + fee.totalAmount, 0)
}

/**
 * 按归属方统计费用
 * @param orderExtraFees 订单增值费用明细列表
 * @returns 归属方统计 { partyType-partyId: amount }
 */
export function calculateFeesByParty(
  orderExtraFees: OrderExtraFee[]
): Record<string, { partyType: string; partyId?: number; partyName?: string; amount: number }> {
  const result: Record<
    string,
    { partyType: string; partyId?: number; partyName?: string; amount: number }
  > = {}

  orderExtraFees.forEach(fee => {
    if (fee.allocations) {
      fee.allocations.forEach(allocation => {
        const key = allocation.partyId
          ? `${allocation.partyType}-${allocation.partyId}`
          : allocation.partyType

        if (!result[key]) {
          result[key] = {
            partyType: allocation.partyType,
            partyId: allocation.partyId,
            partyName: allocation.partyName,
            amount: 0,
          }
        }

        result[key].amount += allocation.amount || 0
      })
    }
  })

  return result
}
