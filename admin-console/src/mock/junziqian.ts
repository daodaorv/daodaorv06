/**
 * 君子签电子签署平台 Mock 数据
 */

import type {
  JZQSignRequest,
  JZQSignResponse,
  JZQSignStatusResponse,
  JZQCallback,
  JZQTemplate,
} from '@/types/junziqian'

// 合同模板列表
export const mockTemplates: JZQTemplate[] = [
  {
    id: 'template_001',
    name: '标准服务协议',
    description: '适用于一般服务供应商的标准合作协议模板',
    type: 'standard',
  },
  {
    id: 'template_002',
    name: '维保服务协议',
    description: '适用于房车维修保养服务供应商的专用协议模板',
    type: 'maintenance',
  },
  {
    id: 'template_003',
    name: '保险服务协议',
    description: '适用于保险服务供应商的专用协议模板',
    type: 'insurance',
  },
  {
    id: 'template_004',
    name: '其他服务协议',
    description: '适用于清洗、救援等其他服务供应商的协议模板',
    type: 'other',
  },
]

// Mock API 实现

/**
 * 发起电子签署
 */
export function mockCreateElectronicSign(data: JZQSignRequest): Promise<JZQSignResponse> {
  return new Promise(resolve => {
    setTimeout(() => {
      const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response: JZQSignResponse = {
        flowId,
        contractId,
        signUrl: `https://api.sandbox.junziqian.com/sign/${flowId}`,
        status: 'pending',
        message: '签署流程已发起，请通知签署方进行签署',
      }

      resolve(response)
    }, 500)
  })
}

/**
 * 查询签署状态
 */
export function mockQuerySignStatus(flowId: string): Promise<JZQSignStatusResponse> {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟不同的签署状态
      const statuses: Array<'draft' | 'pending' | 'signed' | 'rejected' | 'expired'> = [
        'pending',
        'signed',
        'signed',
        'signed',
      ]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      const response: JZQSignStatusResponse = {
        flowId,
        contractId: `contract_${flowId.split('_')[1]}`,
        status: randomStatus,
        signedAt: randomStatus === 'signed' ? new Date().toISOString() : undefined,
        pdfUrl:
          randomStatus === 'signed'
            ? `https://example.com/contracts/signed-${flowId}.pdf`
            : undefined,
        signers: [
          {
            name: '供应商代表',
            mobile: '13900139001',
            role: 'supplier',
            status: randomStatus === 'signed' ? 'signed' : 'pending',
            signedAt: randomStatus === 'signed' ? new Date().toISOString() : undefined,
          },
          {
            name: '公司代表',
            mobile: '13900139999',
            role: 'company',
            status: randomStatus === 'signed' ? 'signed' : 'pending',
            signedAt: randomStatus === 'signed' ? new Date().toISOString() : undefined,
          },
        ],
      }

      resolve(response)
    }, 300)
  })
}

/**
 * 模拟签署回调通知
 */
export function mockSignCallback(flowId: string): JZQCallback {
  return {
    flowId,
    contractId: `contract_${flowId.split('_')[1]}`,
    status: 'signed',
    signedAt: new Date().toISOString(),
    pdfUrl: `https://example.com/contracts/signed-${flowId}.pdf`,
  }
}

/**
 * 获取合同模板列表
 */
export function mockGetTemplates(): Promise<JZQTemplate[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockTemplates)
    }, 200)
  })
}

/**
 * 下载已签署合同
 */
export function mockDownloadSignedContract(contractId: string): Promise<Blob> {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟返回一个空的 PDF Blob
      const blob = new Blob(['Mock PDF Content'], { type: 'application/pdf' })
      resolve(blob)
    }, 500)
  })
}
