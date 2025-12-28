/**
 * 供应商管理 Mock 数据
 */

import type { SupplierContract, SupplierService } from '@/types/supplier'

// 供应商类型
export type SupplierType = 'maintenance' | 'insurance' | 'other'

// 供应商基础信息
export interface Supplier {
  id: number
  name: string
  type: SupplierType
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string // 城市（仅城市级别）
  serviceScope: string
  priceRange: string
  qualityRating: number // 1-5星
  cooperationStatus: 'active' | 'inactive'
  contractUrl: string // 保留旧字段以兼容
  contracts: SupplierContract[] // 合作协议列表
  currentContract?: SupplierContract // 当前有效协议
  services: SupplierService[] // 服务列表
  serviceCount: number // 服务次数
  totalCost: number // 总成本
  createdAt: string
  updatedAt: string
}

// 供应商列表查询参数
export interface SupplierListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: SupplierType
  cooperationStatus?: string
  city?: string // 城市筛选
}

// 创建供应商参数
export interface CreateSupplierParams {
  name: string
  type: SupplierType
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string // 城市
  serviceScope: string
  priceRange: string
  qualityRating: number
  cooperationStatus: 'active' | 'inactive'
  contractUrl?: string
}

// 更新供应商参数
export interface UpdateSupplierParams extends Partial<CreateSupplierParams> {}

// 供应商统计
export interface SupplierStats {
  totalSuppliers: number
  maintenanceSuppliers: number
  insuranceSuppliers: number
  otherSuppliers: number
  activeSuppliers: number
  totalServiceCount: number
  totalCost: number
  averageRating: number
}

// 生成合作协议 Mock 数据
function generateContracts(supplierId: number, supplierName: string): SupplierContract[] {
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  return [
    {
      id: supplierId * 10 + 1,
      supplierId,
      type: 'electronic',
      status: 'signed',
      contractNo: `HT-${supplierId}-2024-001`,
      contractName: `${supplierName}服务协议`,
      signDate: oneYearAgo.toISOString().split('T')[0],
      startDate: oneYearAgo.toISOString().split('T')[0],
      endDate: oneYearLater.toISOString().split('T')[0],
      jzqFlowId: `flow_${supplierId}_001`,
      jzqContractId: `contract_${supplierId}_001`,
      jzqSignUrl: `https://api.sandbox.junziqian.com/sign/${supplierId}_001`,
      jzqPdfUrl: `https://example.com/contracts/signed-${supplierId}-001.pdf`,
      remark: '当前有效合同',
      createdAt: oneYearAgo.toISOString(),
      updatedAt: oneYearAgo.toISOString(),
    },
  ]
}

// 生成服务列表 Mock 数据
function generateServices(supplierId: number, type: SupplierType): SupplierService[] {
  const maintenanceServices = [
    { name: '常规保养', code: 'SRV_M_001', price: 500, unit: '次' },
    { name: '深度保养', code: 'SRV_M_002', price: 1200, unit: '次' },
    { name: '年检服务', code: 'SRV_M_003', price: 800, unit: '次' },
    { name: '故障维修', code: 'SRV_M_004', price: 1500, unit: '次' },
    { name: '零部件更换', code: 'SRV_M_005', price: 2000, unit: '次' },
  ]

  const insuranceServices = [
    { name: '交强险', code: 'SRV_I_001', price: 950, unit: '年' },
    { name: '商业险（基础）', code: 'SRV_I_002', price: 3500, unit: '年' },
    { name: '商业险（全面）', code: 'SRV_I_003', price: 8000, unit: '年' },
    { name: '第三者责任险', code: 'SRV_I_004', price: 1200, unit: '年' },
  ]

  const otherServices = [
    { name: '外观清洗', code: 'SRV_O_001', price: 200, unit: '次' },
    { name: '内饰清洁', code: 'SRV_O_002', price: 300, unit: '次' },
    { name: '深度清洁', code: 'SRV_O_003', price: 600, unit: '次' },
    { name: '道路救援', code: 'SRV_O_004', price: 500, unit: '次' },
    { name: '拖车服务', code: 'SRV_O_005', price: 800, unit: '次' },
  ]

  const services =
    type === 'maintenance'
      ? maintenanceServices
      : type === 'insurance'
        ? insuranceServices
        : otherServices

  return services.slice(0, Math.floor(Math.random() * 2) + 3).map((service, index) => ({
    id: supplierId * 100 + index + 1,
    supplierId,
    serviceName: service.name,
    serviceCode: service.code,
    fixedPrice: service.price,
    unit: service.unit,
    description: `${service.name}服务说明`,
    status: 'active' as const,
    sortOrder: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

// Mock 数据
const mockSuppliers: Supplier[] = [
  // 维保供应商
  (() => {
    const supplier = {
      id: 1,
      name: '鑫达汽车维修厂',
      type: 'maintenance' as const,
      contactPerson: '王师傅',
      phone: '13900139001',
      email: 'wang@xinda.com',
      address: '北京市朝阳区东三环北路88号',
      city: '北京',
      serviceScope: '房车维修、保养、年检',
      priceRange: '500-5000元/次',
      qualityRating: 5,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-1.pdf',
      serviceCount: 156,
      totalCost: 234000,
      createdAt: '2024-01-15T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
  (() => {
    const supplier = {
      id: 2,
      name: '顺通房车维保中心',
      type: 'maintenance' as const,
      contactPerson: '李经理',
      phone: '13900139002',
      email: 'li@shuntong.com',
      address: '上海市浦东新区张江高科技园区',
      city: '上海',
      serviceScope: '房车维修、改装、升级',
      priceRange: '800-8000元/次',
      qualityRating: 4,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-2.pdf',
      serviceCount: 98,
      totalCost: 176400,
      createdAt: '2024-02-10T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
  (() => {
    const supplier = {
      id: 3,
      name: '华通汽修连锁',
      type: 'maintenance' as const,
      contactPerson: '张师傅',
      phone: '13900139003',
      email: 'zhang@huatong.com',
      address: '广州市天河区珠江新城',
      city: '广州',
      serviceScope: '房车维修、保养',
      priceRange: '600-6000元/次',
      qualityRating: 4,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-3.pdf',
      serviceCount: 87,
      totalCost: 130500,
      createdAt: '2024-03-05T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),

  // 保险供应商
  (() => {
    const supplier = {
      id: 4,
      name: '中国人保财险',
      type: 'insurance' as const,
      contactPerson: '赵经理',
      phone: '13900139004',
      email: 'zhao@picc.com',
      address: '北京市西城区金融街28号',
      city: '北京',
      serviceScope: '房车商业险、交强险、第三者责任险',
      priceRange: '3000-15000元/年',
      qualityRating: 5,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-4.pdf',
      serviceCount: 245,
      totalCost: 1960000,
      createdAt: '2024-01-20T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
  (() => {
    const supplier = {
      id: 5,
      name: '平安保险',
      type: 'insurance' as const,
      contactPerson: '刘经理',
      phone: '13900139005',
      email: 'liu@pingan.com',
      address: '深圳市福田区益田路5033号',
      city: '深圳',
      serviceScope: '房车商业险、意外险',
      priceRange: '2800-14000元/年',
      qualityRating: 5,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-5.pdf',
      serviceCount: 198,
      totalCost: 1584000,
      createdAt: '2024-02-15T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
  (() => {
    const supplier = {
      id: 6,
      name: '太平洋保险',
      type: 'insurance' as const,
      contactPerson: '周经理',
      phone: '13900139006',
      email: 'zhou@cpic.com',
      address: '上海市黄浦区中山南路1号',
      city: '上海',
      serviceScope: '房车商业险、交强险',
      priceRange: '3200-16000元/年',
      qualityRating: 4,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-6.pdf',
      serviceCount: 167,
      totalCost: 1336000,
      createdAt: '2024-03-10T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),

  // 其他供应商
  (() => {
    const supplier = {
      id: 7,
      name: '绿洁房车清洗服务',
      type: 'other' as const,
      contactPerson: '吴经理',
      phone: '13900139007',
      email: 'wu@lvjie.com',
      address: '北京市海淀区中关村大街1号',
      city: '北京',
      serviceScope: '房车清洗、消毒、美容',
      priceRange: '200-800元/次',
      qualityRating: 4,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-7.pdf',
      serviceCount: 432,
      totalCost: 172800,
      createdAt: '2024-04-05T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
  (() => {
    const supplier = {
      id: 8,
      name: '安途道路救援',
      type: 'other' as const,
      contactPerson: '郑经理',
      phone: '13900139008',
      email: 'zheng@antu.com',
      address: '成都市武侯区天府大道中段666号',
      city: '成都',
      serviceScope: '道路救援、拖车、应急维修',
      priceRange: '300-2000元/次',
      qualityRating: 5,
      cooperationStatus: 'active' as const,
      contractUrl: 'https://example.com/contracts/supplier-8.pdf',
      serviceCount: 89,
      totalCost: 89000,
      createdAt: '2024-05-12T08:00:00.000Z',
      updatedAt: '2024-12-05T10:00:00.000Z',
    }
    const contracts = generateContracts(supplier.id, supplier.name)
    return {
      ...supplier,
      contracts,
      currentContract: contracts[0],
      services: generateServices(supplier.id, supplier.type),
    }
  })(),
]

// Mock API 实现
export function mockGetSupplierList(
  params: SupplierListParams
): Promise<{ list: Supplier[]; total: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockSuppliers]

      // 类型筛选
      if (params.type) {
        filteredList = filteredList.filter(supplier => supplier.type === params.type)
      }

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(
          supplier =>
            supplier.name.toLowerCase().includes(keyword) ||
            supplier.contactPerson.toLowerCase().includes(keyword) ||
            supplier.phone.includes(keyword)
        )
      }

      // 合作状态筛选
      if (params.cooperationStatus) {
        filteredList = filteredList.filter(
          supplier => supplier.cooperationStatus === params.cooperationStatus
        )
      }

      // 城市筛选
      if (params.city) {
        filteredList = filteredList.filter(supplier => supplier.city === params.city)
      }

      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const list = filteredList.slice(start, end)

      resolve({
        list,
        total: filteredList.length,
      })
    }, 300)
  })
}

export function mockGetSupplierDetail(id: number): Promise<Supplier> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const supplier = mockSuppliers.find(s => s.id === id)
      if (supplier) {
        resolve(supplier)
      } else {
        reject(new Error('供应商不存在'))
      }
    }, 200)
  })
}

export function mockCreateSupplier(data: CreateSupplierParams): Promise<Supplier> {
  return new Promise(resolve => {
    setTimeout(() => {
      const newId = mockSuppliers.length + 1
      const contracts = generateContracts(newId, data.name)
      const newSupplier: Supplier = {
        id: newId,
        ...data,
        contractUrl: data.contractUrl || '',
        contracts,
        currentContract: contracts[0],
        services: generateServices(newId, data.type),
        serviceCount: 0,
        totalCost: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockSuppliers.push(newSupplier)
      resolve(newSupplier)
    }, 300)
  })
}

export function mockUpdateSupplier(id: number, data: UpdateSupplierParams): Promise<Supplier> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSuppliers.findIndex(s => s.id === id)
      if (index !== -1) {
        mockSuppliers[index] = {
          ...mockSuppliers[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        resolve(mockSuppliers[index])
      } else {
        reject(new Error('供应商不存在'))
      }
    }, 300)
  })
}

export function mockDeleteSupplier(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockSuppliers.findIndex(s => s.id === id)
      if (index !== -1) {
        mockSuppliers.splice(index, 1)
        resolve()
      } else {
        reject(new Error('供应商不存在'))
      }
    }, 300)
  })
}

export function mockGetSupplierStats(): Promise<SupplierStats> {
  return new Promise(resolve => {
    setTimeout(() => {
      const stats: SupplierStats = {
        totalSuppliers: mockSuppliers.length,
        maintenanceSuppliers: mockSuppliers.filter(s => s.type === 'maintenance').length,
        insuranceSuppliers: mockSuppliers.filter(s => s.type === 'insurance').length,
        otherSuppliers: mockSuppliers.filter(s => s.type === 'other').length,
        activeSuppliers: mockSuppliers.filter(s => s.cooperationStatus === 'active').length,
        totalServiceCount: mockSuppliers.reduce((sum, s) => sum + s.serviceCount, 0),
        totalCost: mockSuppliers.reduce((sum, s) => sum + s.totalCost, 0),
        averageRating:
          mockSuppliers.reduce((sum, s) => sum + s.qualityRating, 0) / mockSuppliers.length,
      }
      resolve(stats)
    }, 200)
  })
}
