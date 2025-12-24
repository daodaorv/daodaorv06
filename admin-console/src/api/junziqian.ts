/**
 * 君子签电子签署平台 API
 */
import {
  mockCreateElectronicSign,
  mockQuerySignStatus,
  mockGetTemplates,
  mockDownloadSignedContract
} from '@/mock/junziqian'
import type {
  JZQSignRequest,
  JZQSignResponse,
  JZQSignStatusResponse,
  JZQTemplate
} from '@/types/junziqian'

// 导出类型
export type { JZQSignRequest, JZQSignResponse, JZQSignStatusResponse, JZQTemplate }

/**
 * 发起电子签署
 */
export const createElectronicSign = (data: JZQSignRequest): Promise<JZQSignResponse> => {
  // return request.post('/junziqian/sign', data)
  return mockCreateElectronicSign(data)
}

/**
 * 查询签署状态
 */
export const querySignStatus = (flowId: string): Promise<JZQSignStatusResponse> => {
  // return request.get(`/junziqian/sign-status/${flowId}`)
  return mockQuerySignStatus(flowId)
}

/**
 * 获取合同模板列表
 */
export const getTemplates = (): Promise<JZQTemplate[]> => {
  // return request.get('/junziqian/templates')
  return mockGetTemplates()
}

/**
 * 下载已签署合同
 */
export const downloadSignedContract = (contractId: string): Promise<Blob> => {
  // return request.get(`/junziqian/contracts/${contractId}/download`, { responseType: 'blob' })
  return mockDownloadSignedContract(contractId)
}
