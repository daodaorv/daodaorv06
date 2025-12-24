/**
 * 供应商相关类型定义
 */

// 合作协议类型
export type ContractType = 'electronic' | 'scanned'

// 合作协议状态
export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated'

// 合作协议信息
export interface SupplierContract {
  id: number
  supplierId: number
  type: ContractType // 协议类型
  status: ContractStatus // 协议状态
  contractNo: string // 合同编号
  contractName: string // 合同名称
  signDate: string // 签署日期
  startDate: string // 生效日期
  endDate: string // 到期日期

  // 电子签署相关（君子签）
  jzqFlowId?: string // 君子签流程ID
  jzqContractId?: string // 君子签合同ID
  jzqSignUrl?: string // 签署链接
  jzqPdfUrl?: string // 已签署PDF下载链接

  // 扫描件上传相关
  scannedFileUrl?: string // 扫描件文件URL
  scannedFileName?: string // 扫描件文件名
  scannedFileSize?: number // 文件大小(字节)

  uploadedBy?: number // 上传人ID
  uploadedAt?: string // 上传时间
  remark?: string // 备注
  createdAt: string
  updatedAt: string
}

// 供应商服务项目
export interface SupplierService {
  id: number
  supplierId: number
  serviceName: string // 服务名称
  serviceCode: string // 服务编码
  fixedPrice: number // 固定价格
  unit: string // 单位(次/小时/天等)
  description?: string // 服务描述
  status: 'active' | 'inactive' // 服务状态
  sortOrder: number // 排序
  createdAt: string
  updatedAt: string
}

// 城市信息
export interface City {
  code: string // 城市编码
  name: string // 城市名称
  province: string // 所属省份(用于显示)
  pinyin: string // 拼音
  initial: string // 首字母
}

// 城市列表(按首字母分组)
export interface CityGroup {
  initial: string
  cities: City[]
}

// 合作协议状态文本映射
export const CONTRACT_STATUS_TEXT: Record<ContractStatus, string> = {
  draft: '草稿',
  pending: '待签署',
  signed: '已签署',
  expired: '已过期',
  terminated: '已终止'
}

// 合作协议状态类型映射
export const CONTRACT_STATUS_TYPE: Record<ContractStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'info',
  pending: 'warning',
  signed: 'success',
  expired: 'danger',
  terminated: 'info'
}

// 合作协议类型文本映射
export const CONTRACT_TYPE_TEXT: Record<ContractType, string> = {
  electronic: '电子签署',
  scanned: '扫描件'
}
