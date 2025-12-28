/**
 * 供应商管理 API
 */
import {
  mockGetSupplierList,
  mockGetSupplierDetail,
  mockCreateSupplier,
  mockUpdateSupplier,
  mockDeleteSupplier,
  mockGetSupplierStats,
  type Supplier,
  type SupplierListParams,
  type CreateSupplierParams,
  type UpdateSupplierParams,
  type SupplierStats,
} from '@/mock/suppliers'
import type { SupplierContract, SupplierService } from '@/types/supplier'

// 导出类型
export type {
  Supplier,
  SupplierListParams,
  CreateSupplierParams,
  UpdateSupplierParams,
  SupplierStats,
  SupplierContract,
  SupplierService,
}

/**
 * 获取供应商列表
 */
export const getSupplierList = (params: SupplierListParams) => {
  // return request.get('/suppliers', { params })
  return mockGetSupplierList(params)
}

/**
 * 获取供应商详情
 */
export const getSupplierDetail = (id: number) => {
  // return request.get(`/suppliers/${id}`)
  return mockGetSupplierDetail(id)
}

/**
 * 创建供应商
 */
export const createSupplier = (data: CreateSupplierParams) => {
  // return request.post('/suppliers', data)
  return mockCreateSupplier(data)
}

/**
 * 更新供应商
 */
export const updateSupplier = (id: number, data: UpdateSupplierParams) => {
  // return request.put(`/suppliers/${id}`, data)
  return mockUpdateSupplier(id, data)
}

/**
 * 删除供应商
 */
export const deleteSupplier = (id: number) => {
  // return request.delete(`/suppliers/${id}`)
  return mockDeleteSupplier(id)
}

/**
 * 获取供应商统计
 */
export const getSupplierStats = () => {
  // return request.get('/suppliers/stats')
  return mockGetSupplierStats()
}

// ==================== 合作协议管理 API ====================

/**
 * 获取供应商合作协议列表
 */
export const getSupplierContracts = (supplierId: number): Promise<SupplierContract[]> => {
  // return request.get(`/suppliers/${supplierId}/contracts`)
  return new Promise(resolve => {
    setTimeout(() => {
      // 从供应商详情中获取合作协议列表
      mockGetSupplierDetail(supplierId).then(supplier => {
        resolve(supplier.contracts || [])
      })
    }, 200)
  })
}

/**
 * 获取合作协议详情
 */
export const getContractDetail = (contractId: number): Promise<SupplierContract> => {
  // return request.get(`/supplier-contracts/${contractId}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟从所有供应商中查找合作协议
      mockGetSupplierList({ page: 1, pageSize: 100 }).then(({ list }) => {
        for (const supplier of list) {
          const contract = supplier.contracts?.find(c => c.id === contractId)
          if (contract) {
            resolve(contract)
            return
          }
        }
        reject(new Error('合作协议不存在'))
      })
    }, 200)
  })
}

/**
 * 创建电子签署合同
 */
export const createElectronicContract = (data: {
  supplierId: number
  contractName: string
  contractNo: string
  startDate: string
  endDate: string
  templateId?: string
  signers: Array<{
    name: string
    mobile: string
    email?: string
    role: 'supplier' | 'company'
    signOrder: number
  }>
}): Promise<SupplierContract> => {
  // return request.post('/supplier-contracts/electronic', data)
  return new Promise(resolve => {
    setTimeout(() => {
      const newContract: SupplierContract = {
        id: Date.now(),
        supplierId: data.supplierId,
        type: 'electronic',
        status: 'pending',
        contractNo: data.contractNo,
        contractName: data.contractName,
        signDate: new Date().toISOString().split('T')[0],
        startDate: data.startDate,
        endDate: data.endDate,
        jzqFlowId: `flow_${Date.now()}`,
        jzqContractId: `contract_${Date.now()}`,
        jzqSignUrl: `https://api.sandbox.junziqian.com/sign/${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      resolve(newContract)
    }, 500)
  })
}

/**
 * 上传扫描件合同
 */
export const uploadScannedContract = (
  supplierId: number,
  data: {
    contractName: string
    contractNo: string
    signDate: string
    startDate: string
    endDate: string
    scannedFileUrl: string
    scannedFileName: string
    scannedFileSize: number
    remark?: string
  }
): Promise<SupplierContract> => {
  // return request.post(`/suppliers/${supplierId}/contracts/scanned`, data)
  return new Promise(resolve => {
    setTimeout(() => {
      const newContract: SupplierContract = {
        id: Date.now(),
        supplierId,
        type: 'scanned',
        status: 'signed',
        contractNo: data.contractNo,
        contractName: data.contractName,
        signDate: data.signDate,
        startDate: data.startDate,
        endDate: data.endDate,
        scannedFileUrl: data.scannedFileUrl,
        scannedFileName: data.scannedFileName,
        scannedFileSize: data.scannedFileSize,
        remark: data.remark,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      resolve(newContract)
    }, 500)
  })
}

/**
 * 更新合作协议
 */
export const updateContract = (
  contractId: number,
  data: Partial<SupplierContract>
): Promise<SupplierContract> => {
  // return request.put(`/supplier-contracts/${contractId}`, data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      getContractDetail(contractId)
        .then(contract => {
          const updatedContract = {
            ...contract,
            ...data,
            updatedAt: new Date().toISOString(),
          }
          resolve(updatedContract)
        })
        .catch(reject)
    }, 300)
  })
}

/**
 * 删除合作协议
 */
export const deleteContract = (contractId: number): Promise<void> => {
  // return request.delete(`/supplier-contracts/${contractId}`)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}

/**
 * 下载合作协议
 */
export const downloadContract = (contractId: number): Promise<Blob> => {
  // return request.get(`/supplier-contracts/${contractId}/download`, { responseType: 'blob' })
  return new Promise(resolve => {
    setTimeout(() => {
      const blob = new Blob(['Mock PDF Content'], { type: 'application/pdf' })
      resolve(blob)
    }, 500)
  })
}

/**
 * 查询君子签签署状态
 */
export const queryJZQSignStatus = (
  flowId: string
): Promise<{
  flowId: string
  contractId: string
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired'
  signedAt?: string
  pdfUrl?: string
}> => {
  // return request.get(`/junziqian/sign-status/${flowId}`)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        flowId,
        contractId: `contract_${flowId.split('_')[1]}`,
        status: 'signed',
        signedAt: new Date().toISOString(),
        pdfUrl: `https://example.com/contracts/signed-${flowId}.pdf`,
      })
    }, 300)
  })
}

// ==================== 供应商服务列表 API ====================

/**
 * 获取供应商服务列表
 */
export const getSupplierServices = (supplierId: number): Promise<SupplierService[]> => {
  // return request.get(`/suppliers/${supplierId}/services`)
  return new Promise(resolve => {
    setTimeout(() => {
      mockGetSupplierDetail(supplierId).then(supplier => {
        resolve(supplier.services || [])
      })
    }, 200)
  })
}

/**
 * 创建供应商服务
 */
export const createSupplierService = (
  supplierId: number,
  data: {
    serviceName: string
    serviceCode: string
    fixedPrice: number
    unit: string
    description?: string
    status: 'active' | 'inactive'
  }
): Promise<SupplierService> => {
  // return request.post(`/suppliers/${supplierId}/services`, data)
  return new Promise(resolve => {
    setTimeout(() => {
      const newService: SupplierService = {
        id: Date.now(),
        supplierId,
        ...data,
        sortOrder: 999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      resolve(newService)
    }, 300)
  })
}

/**
 * 更新供应商服务
 */
export const updateSupplierService = (
  serviceId: number,
  data: Partial<SupplierService>
): Promise<SupplierService> => {
  // return request.put(`/supplier-services/${serviceId}`, data)
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedService: SupplierService = {
        id: serviceId,
        supplierId: 1,
        serviceName: data.serviceName || '',
        serviceCode: data.serviceCode || '',
        fixedPrice: data.fixedPrice || 0,
        unit: data.unit || '次',
        description: data.description,
        status: data.status || 'active',
        sortOrder: data.sortOrder || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      resolve(updatedService)
    }, 300)
  })
}

/**
 * 删除供应商服务
 */
export const deleteSupplierService = (serviceId: number): Promise<void> => {
  // return request.delete(`/supplier-services/${serviceId}`)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}

/**
 * 批量更新服务排序
 */
export const updateServicesOrder = (supplierId: number, serviceIds: number[]): Promise<void> => {
  // return request.put(`/suppliers/${supplierId}/services/order`, { serviceIds })
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}
