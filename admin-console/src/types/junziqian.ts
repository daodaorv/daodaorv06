/**
 * 君子签电子签署平台集成类型定义
 */

// 君子签配置
export interface JZQConfig {
  apiUrl: string // API地址
  appKey: string // 应用Key
  appSecret: string // 应用密钥
  companyName: string // 企业名称
  businessLicense: string // 营业执照号
  email: string // 企业邮箱
}

// 君子签签署请求
export interface JZQSignRequest {
  supplierId: number // 供应商ID
  contractName: string // 合同名称
  contractNo: string // 合同编号
  startDate: string // 生效日期
  endDate: string // 到期日期
  templateId?: string // 模板ID(如果使用模板)
  contractContent?: string // 合同内容(HTML/PDF)
  signers: JZQSigner[] // 签署方
}

// 签署方信息
export interface JZQSigner {
  name: string // 姓名
  mobile: string // 手机号
  email?: string // 邮箱
  idCard?: string // 身份证号
  role: 'supplier' | 'company' // 角色
  signOrder: number // 签署顺序
}

// 君子签签署响应
export interface JZQSignResponse {
  flowId: string // 流程ID
  contractId: string // 合同ID
  signUrl: string // 签署链接
  status: string // 状态
  message: string // 消息
}

// 君子签回调通知
export interface JZQCallback {
  flowId: string // 流程ID
  contractId: string // 合同ID
  status: 'signed' | 'rejected' | 'expired' // 状态
  signedAt?: string // 签署时间
  pdfUrl?: string // 已签署PDF下载链接
}

// 君子签签署状态查询响应
export interface JZQSignStatusResponse {
  flowId: string // 流程ID
  contractId: string // 合同ID
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired' // 状态
  signedAt?: string // 签署时间
  pdfUrl?: string // 已签署PDF下载链接
  signers: JZQSignerStatus[] // 签署方状态
}

// 签署方状态
export interface JZQSignerStatus {
  name: string // 姓名
  mobile: string // 手机号
  role: 'supplier' | 'company' // 角色
  status: 'pending' | 'signed' | 'rejected' // 状态
  signedAt?: string // 签署时间
}

// 君子签合同模板
export interface JZQTemplate {
  id: string // 模板ID
  name: string // 模板名称
  description: string // 模板描述
  type: 'standard' | 'maintenance' | 'insurance' | 'other' // 模板类型
}

// 君子签环境配置
export const JZQ_CONFIG: JZQConfig = {
  apiUrl: import.meta.env.VITE_JZQ_API_URL || 'https://api.sandbox.junziqian.com',
  appKey: import.meta.env.VITE_JZQ_APP_KEY || '25959c33e719e88e',
  appSecret: import.meta.env.VITE_JZQ_APP_SECRET || 'd96a65d025959c33e719e88ee475c1c8',
  companyName: import.meta.env.VITE_JZQ_COMPANY_NAME || '深圳市叨叨网络科技有限公司',
  businessLicense: import.meta.env.VITE_JZQ_BUSINESS_LICENSE || '91440300MA5GU5657U',
  email: import.meta.env.VITE_JZQ_EMAIL || 'szdd@bccto.me'
}
