import { get, post } from '@/utils/request'
import { USE_MOCK, mockPopularModels } from '@/mock'
import type {
  OldCarApplicationData,
  NewCarApplicationData,
  SelfUseApplicationData,
  IncomeDetailParams,
  WithdrawData,
  ModelBookingData
} from '@/types/hosting'

/**
 * 托管中心API
 * @status 联调中 - 部分使用Mock数据
 */

// 获取托管收益数据
export const getHostingIncome = () => {
  return get('/hosting/income')
}

// 获取托管车辆列表
export const getHostingVehicles = () => {
  return get('/hosting/vehicles')
}

// 提交自有车托管申请
export const submitOldCarApplication = (data: OldCarApplicationData) => {
  return post('/hosting/old-car/apply', data)
}

// 提交购车托管申请
export const submitNewCarApplication = (data: NewCarApplicationData) => {
  return post('/hosting/new-car/apply', data)
}

// 申请车主自用
export const applySelfUse = (data: SelfUseApplicationData) => {
  return post('/hosting/self-use/apply', data)
}

// 获取收益明细
export const getIncomeDetail = (params: IncomeDetailParams) => {
  return get('/hosting/income/detail', params)
}

// 提现
export const withdrawIncome = (data: WithdrawData) => {
  return post('/hosting/withdraw', data)
}

// 获取车辆详情
export const getVehicleDetail = (id: number) => {
  return get(`/hosting/vehicles/${id}`)
}

// 获取热门车型列表
export const getPopularModels = () => {
  if (USE_MOCK) {
    return Promise.resolve({ code: 0, message: 'success', data: mockPopularModels })
  }
  return get('/hosting/models/popular')
}

// 获取车型详情
export const getModelDetail = (id: number) => {
  if (USE_MOCK) {
    const model = mockPopularModels.find(m => m.id === id) || mockPopularModels[0]
    return Promise.resolve({ code: 0, message: 'success', data: model })
  }
  return get(`/hosting/models/${id}`)
}

// 提交购车预定
export const submitModelBooking = (data: ModelBookingData) => {
  return post('/hosting/models/booking', data)
}

// 获取门店列表
export const getStoreList = () => {
  return get('/hosting/stores')
}

export default {
  getHostingIncome,
  getHostingVehicles,
  submitOldCarApplication,
  submitNewCarApplication,
  applySelfUse,
  getIncomeDetail,
  withdrawIncome,
  getVehicleDetail,
  getPopularModels,
  getModelDetail,
  submitModelBooking,
  getStoreList
}
