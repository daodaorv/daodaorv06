/**
 * 车辆管理模块 Mock 数据
 */

// 车型数据类型
export interface VehicleModel {
  id: number
  brandId: number
  brandName: string
  modelName: string
  vehicleType: 'c_type' | 'b_type' | 'trailer'
  seats: number
  beds: number
  length: number
  width: number
  height: number
  fuelCapacity: number
  dailyPrice: number
  vehicleCount: number
  image: string
  description: string
  features: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 品牌数据
export const mockBrands = [
  { id: 1, name: '大通', logo: '', status: 'active' },
  { id: 2, name: '福特', logo: '', status: 'active' },
  { id: 3, name: '依维柯', logo: '', status: 'active' },
  { id: 4, name: '奔驰', logo: '', status: 'active' },
  { id: 5, name: '江铃', logo: '', status: 'active' },
]

// 车型库数据
export const mockVehicleModels: VehicleModel[] = [
  {
    id: 1,
    brandId: 1,
    brandName: '大通',
    modelName: 'RV80 C型房车',
    vehicleType: 'c_type',
    seats: 6,
    beds: 4,
    length: 5.9,
    width: 2.3,
    height: 3.2,
    fuelCapacity: 80,
    dailyPrice: 800,
    vehicleCount: 15,
    image: 'https://via.placeholder.com/300x200?text=RV80+C型',
    description: '大通RV80 C型房车，空间宽敞，配置齐全，适合家庭出游',
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能'],
    status: 'active',
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-11-20 14:30:00',
  },
  {
    id: 2,
    brandId: 2,
    brandName: '福特',
    modelName: '全顺B型房车',
    vehicleType: 'b_type',
    seats: 4,
    beds: 2,
    length: 5.3,
    width: 2.0,
    height: 2.8,
    fuelCapacity: 70,
    dailyPrice: 600,
    vehicleCount: 10,
    image: 'https://via.placeholder.com/300x200?text=全顺+B型',
    description: '福特全顺B型房车，灵活便捷，适合城市出行和短途旅游',
    features: ['空调', '冰箱', '倒车影像', '发电机'],
    status: 'active',
    createdAt: '2024-02-10 14:30:00',
    updatedAt: '2024-11-18 09:15:00',
  },
  {
    id: 3,
    brandId: 3,
    brandName: '依维柯',
    modelName: '欧胜拖挂房车',
    vehicleType: 'trailer',
    seats: 4,
    beds: 3,
    length: 6.5,
    width: 2.5,
    height: 2.9,
    fuelCapacity: 0,
    dailyPrice: 500,
    vehicleCount: 8,
    image: 'https://via.placeholder.com/300x200?text=欧胜+拖挂',
    description: '依维柯欧胜拖挂房车，经济实惠，适合长途旅行',
    features: ['空调', '冰箱', '卫生间', '淋浴'],
    status: 'active',
    createdAt: '2024-03-05 09:15:00',
    updatedAt: '2024-11-15 16:45:00',
  },
  {
    id: 4,
    brandId: 4,
    brandName: '奔驰',
    modelName: 'Sprinter 豪华B型',
    vehicleType: 'b_type',
    seats: 4,
    beds: 2,
    length: 6.0,
    width: 2.1,
    height: 2.9,
    fuelCapacity: 75,
    dailyPrice: 1200,
    vehicleCount: 5,
    image: 'https://via.placeholder.com/300x200?text=Sprinter+豪华',
    description: '奔驰Sprinter豪华B型房车，高端配置，舒适体验',
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能', '发电机', '倒车影像'],
    status: 'active',
    createdAt: '2024-04-20 11:20:00',
    updatedAt: '2024-11-25 10:00:00',
  },
  {
    id: 5,
    brandId: 5,
    brandName: '江铃',
    modelName: '特顺C型房车',
    vehicleType: 'c_type',
    seats: 5,
    beds: 3,
    length: 5.5,
    width: 2.2,
    height: 3.0,
    fuelCapacity: 65,
    dailyPrice: 650,
    vehicleCount: 12,
    image: 'https://via.placeholder.com/300x200?text=特顺+C型',
    description: '江铃特顺C型房车，性价比高，适合中短途旅行',
    features: ['空调', '冰箱', '卫生间', '倒车影像'],
    status: 'active',
    createdAt: '2024-05-10 15:40:00',
    updatedAt: '2024-11-22 13:20:00',
  },
  {
    id: 6,
    brandId: 1,
    brandName: '大通',
    modelName: 'V90 B型房车',
    vehicleType: 'b_type',
    seats: 4,
    beds: 2,
    length: 5.4,
    width: 1.9,
    height: 2.5,
    fuelCapacity: 60,
    dailyPrice: 550,
    vehicleCount: 0,
    image: 'https://via.placeholder.com/300x200?text=V90+B型',
    description: '大通V90 B型房车，紧凑灵活，适合城市周边游',
    features: ['空调', '冰箱'],
    status: 'inactive',
    createdAt: '2024-06-15 08:30:00',
    updatedAt: '2024-11-10 17:00:00',
  },
]

// Mock API 函数

/**
 * 获取车型列表
 */
export const mockGetVehicleModels = (params: {
  page?: number
  pageSize?: number
  brandId?: number | null
  keyword?: string
  vehicleType?: string
  status?: string
}) => {
  const { page = 1, pageSize = 10, brandId, keyword, vehicleType, status } = params

  // 过滤数据
  let filteredData = [...mockVehicleModels]

  if (brandId) {
    filteredData = filteredData.filter(item => item.brandId === brandId)
  }

  if (keyword) {
    filteredData = filteredData.filter(item =>
      item.modelName.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  if (vehicleType) {
    filteredData = filteredData.filter(item => item.vehicleType === vehicleType)
  }

  if (status) {
    filteredData = filteredData.filter(item => item.status === status)
  }

  // 分页
  const total = filteredData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page,
      pageSize,
    },
  })
}

/**
 * 获取车型详情
 */
export const mockGetVehicleModelDetail = (id: number) => {
  const model = mockVehicleModels.find(item => item.id === id)

  if (!model) {
    return Promise.reject({
      code: 404,
      message: '车型不存在',
    })
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: model,
  })
}

/**
 * 创建车型
 */
export const mockCreateVehicleModel = (data: Partial<VehicleModel>) => {
  const newModel: VehicleModel = {
    id: mockVehicleModels.length + 1,
    brandId: data.brandId!,
    brandName: mockBrands.find(b => b.id === data.brandId)?.name || '',
    modelName: data.modelName!,
    vehicleType: data.vehicleType!,
    seats: data.seats || 4,
    beds: data.beds || 2,
    length: data.length || 5.0,
    width: data.width || 2.0,
    height: data.height || 2.8,
    fuelCapacity: data.fuelCapacity || 70,
    dailyPrice: data.dailyPrice || 500,
    vehicleCount: 0,
    image: data.image || '',
    description: data.description || '',
    features: data.features || [],
    status: 'active',
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockVehicleModels.unshift(newModel)

  return Promise.resolve({
    code: 200,
    message: '创建成功',
    data: newModel,
  })
}

/**
 * 更新车型
 */
export const mockUpdateVehicleModel = (id: number, data: Partial<VehicleModel>) => {
  const index = mockVehicleModels.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车型不存在',
    })
  }

  const updatedModel = {
    ...mockVehicleModels[index],
    ...data,
    brandName: data.brandId
      ? mockBrands.find(b => b.id === data.brandId)?.name || mockVehicleModels[index].brandName
      : mockVehicleModels[index].brandName,
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockVehicleModels[index] = updatedModel

  return Promise.resolve({
    code: 200,
    message: '更新成功',
    data: updatedModel,
  })
}

/**
 * 删除车型
 */
export const mockDeleteVehicleModel = (id: number) => {
  const index = mockVehicleModels.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车型不存在',
    })
  }

  // 检查是否有关联车辆
  if (mockVehicleModels[index].vehicleCount > 0) {
    return Promise.reject({
      code: 400,
      message: '该车型下还有车辆，无法删除',
    })
  }

  mockVehicleModels.splice(index, 1)

  return Promise.resolve({
    code: 200,
    message: '删除成功',
  })
}

/**
 * 更改车型状态
 */
export const mockChangeVehicleModelStatus = (id: number, status: 'active' | 'inactive') => {
  const index = mockVehicleModels.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车型不存在',
    })
  }

  mockVehicleModels[index].status = status
  mockVehicleModels[index].updatedAt = new Date().toLocaleString('zh-CN')

  return Promise.resolve({
    code: 200,
    message: `${status === 'active' ? '启用' : '禁用'}成功`,
    data: mockVehicleModels[index],
  })
}

/**
 * 获取品牌列表
 */
export const mockGetBrands = () => {
  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: mockBrands,
  })
}

// ==================== 车辆管理 ====================

// 车辆数据类型
export interface Vehicle {
  id: number
  vehicleNumber: string // 车牌号
  modelId: number
  modelName: string
  brandName: string
  vehicleType: 'c_type' | 'b_type' | 'trailer'
  ownershipType: 'platform' | 'hosting' | 'cooperative' // 所有权类型：平台自有/托管/合作
  hostingId?: number // 托管记录ID(托管车辆)
  hostingOwnerName?: string // 车主姓名(托管车辆)
  hostingOwnerPhone?: string // 车主电话(托管车辆)
  cooperativePartnerId?: number // 合作商ID(合作车辆)
  cooperativePartnerName?: string // 合作商名称(合作车辆)
  storeId: number
  storeName: string
  status: 'available' | 'rented' | 'maintenance' | 'repair' | 'retired' // 车辆状态
  purchaseDate: string
  purchasePrice: number
  currentMileage: number // 当前里程
  lastMaintenanceDate: string // 最后保养日期
  nextMaintenanceDate: string // 下次保养日期
  insuranceCompany: string // 保险公司
  insuranceExpireDate: string // 保险到期日期
  annualInspectionDate: string // 年检日期
  location: string // 当前位置
  images: string[]
  features: string[]
  dailyPrice: number
  remark: string
  createdAt: string
  updatedAt: string
}

// 车辆Mock数据
export const mockVehicles: Vehicle[] = [
  {
    id: 1,
    vehicleNumber: '京A12345',
    modelId: 1,
    modelName: 'RV80 C型房车',
    brandName: '大通',
    vehicleType: 'c_type',
    ownershipType: 'platform',
    storeId: 1,
    storeName: '北京朝阳店',
    status: 'available',
    purchaseDate: '2024-01-15',
    purchasePrice: 450000,
    currentMileage: 15000,
    lastMaintenanceDate: '2024-11-01',
    nextMaintenanceDate: '2024-12-01',
    insuranceCompany: '中国人保',
    insuranceExpireDate: '2025-01-15',
    annualInspectionDate: '2025-01-15',
    location: '北京市朝阳区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+1'],
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能'],
    dailyPrice: 800,
    remark: '车况良好，配置齐全',
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-11-29 14:30:00',
  },
  {
    id: 2,
    vehicleNumber: '京A12346',
    modelId: 1,
    modelName: 'RV80 C型房车',
    brandName: '大通',
    vehicleType: 'c_type',
    ownershipType: 'hosting',
    hostingId: 1,
    hostingOwnerName: '张三',
    hostingOwnerPhone: '13800138001',
    storeId: 1,
    storeName: '北京朝阳店',
    status: 'rented',
    purchaseDate: '2024-01-20',
    purchasePrice: 450000,
    currentMileage: 18000,
    lastMaintenanceDate: '2024-10-20',
    nextMaintenanceDate: '2024-11-20',
    insuranceCompany: '中国人保',
    insuranceExpireDate: '2025-01-20',
    annualInspectionDate: '2025-01-20',
    location: '北京市海淀区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+2'],
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能'],
    dailyPrice: 800,
    remark: '当前已租出',
    createdAt: '2024-01-20 11:00:00',
    updatedAt: '2024-11-28 09:15:00',
  },
  {
    id: 3,
    vehicleNumber: '京B23456',
    modelId: 2,
    modelName: '全顺B型房车',
    brandName: '福特',
    vehicleType: 'b_type',
    ownershipType: 'platform',
    storeId: 2,
    storeName: '上海浦东店',
    status: 'available',
    purchaseDate: '2024-02-10',
    purchasePrice: 350000,
    currentMileage: 12000,
    lastMaintenanceDate: '2024-11-10',
    nextMaintenanceDate: '2024-12-10',
    insuranceCompany: '平安保险',
    insuranceExpireDate: '2025-02-10',
    annualInspectionDate: '2025-02-10',
    location: '上海市浦东新区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+3'],
    features: ['空调', '冰箱', '倒车影像'],
    dailyPrice: 600,
    remark: '适合城市出行',
    createdAt: '2024-02-10 14:30:00',
    updatedAt: '2024-11-27 16:45:00',
  },
  {
    id: 4,
    vehicleNumber: '沪C34567',
    modelId: 2,
    modelName: '全顺B型房车',
    brandName: '福特',
    vehicleType: 'b_type',
    ownershipType: 'cooperative',
    cooperativePartnerId: 1,
    cooperativePartnerName: '上海合作租车公司',
    storeId: 2,
    storeName: '上海浦东店',
    status: 'maintenance',
    purchaseDate: '2024-02-15',
    purchasePrice: 350000,
    currentMileage: 14000,
    lastMaintenanceDate: '2024-11-15',
    nextMaintenanceDate: '2024-12-15',
    insuranceCompany: '平安保险',
    insuranceExpireDate: '2025-02-15',
    annualInspectionDate: '2025-02-15',
    location: '上海市浦东新区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+4'],
    features: ['空调', '冰箱', '倒车影像'],
    dailyPrice: 600,
    remark: '正在进行定期保养',
    createdAt: '2024-02-15 09:20:00',
    updatedAt: '2024-11-29 10:00:00',
  },
  {
    id: 5,
    vehicleNumber: '粤D45678',
    modelId: 3,
    modelName: '欧胜拖挂房车',
    brandName: '依维柯',
    vehicleType: 'trailer',
    ownershipType: 'hosting',
    hostingId: 2,
    hostingOwnerName: '李四',
    hostingOwnerPhone: '13800138002',
    storeId: 3,
    storeName: '深圳南山店',
    status: 'available',
    purchaseDate: '2024-03-05',
    purchasePrice: 280000,
    currentMileage: 8000,
    lastMaintenanceDate: '2024-11-05',
    nextMaintenanceDate: '2024-12-05',
    insuranceCompany: '太平洋保险',
    insuranceExpireDate: '2025-03-05',
    annualInspectionDate: '2025-03-05',
    location: '深圳市南山区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+5'],
    features: ['空调', '冰箱', '卫生间'],
    dailyPrice: 500,
    remark: '经济实惠型',
    createdAt: '2024-03-05 15:40:00',
    updatedAt: '2024-11-26 11:20:00',
  },
  {
    id: 6,
    vehicleNumber: '京E56789',
    modelId: 4,
    modelName: 'Sprinter 豪华B型',
    brandName: '奔驰',
    vehicleType: 'b_type',
    ownershipType: 'platform',
    storeId: 1,
    storeName: '北京朝阳店',
    status: 'available',
    purchaseDate: '2024-04-20',
    purchasePrice: 850000,
    currentMileage: 5000,
    lastMaintenanceDate: '2024-11-20',
    nextMaintenanceDate: '2024-12-20',
    insuranceCompany: '中国人保',
    insuranceExpireDate: '2025-04-20',
    annualInspectionDate: '2025-04-20',
    location: '北京市朝阳区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+6'],
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能', '发电机', '倒车影像'],
    dailyPrice: 1200,
    remark: '豪华配置，高端体验',
    createdAt: '2024-04-20 11:20:00',
    updatedAt: '2024-11-29 08:30:00',
  },
  {
    id: 7,
    vehicleNumber: '川F67890',
    modelId: 5,
    modelName: '特顺C型房车',
    brandName: '江铃',
    vehicleType: 'c_type',
    ownershipType: 'cooperative',
    cooperativePartnerId: 2,
    cooperativePartnerName: '成都合作租车公司',
    storeId: 4,
    storeName: '成都武侯店',
    status: 'repair',
    purchaseDate: '2024-05-10',
    purchasePrice: 380000,
    currentMileage: 10000,
    lastMaintenanceDate: '2024-10-10',
    nextMaintenanceDate: '2024-11-10',
    insuranceCompany: '中国人寿',
    insuranceExpireDate: '2025-05-10',
    annualInspectionDate: '2025-05-10',
    location: '成都市武侯区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+7'],
    features: ['空调', '冰箱', '卫生间', '倒车影像'],
    dailyPrice: 650,
    remark: '正在维修中',
    createdAt: '2024-05-10 13:50:00',
    updatedAt: '2024-11-29 12:00:00',
  },
  {
    id: 8,
    vehicleNumber: '京A78901',
    modelId: 1,
    modelName: 'RV80 C型房车',
    brandName: '大通',
    vehicleType: 'c_type',
    ownershipType: 'crowdfunding',
    crowdfundingProjectId: 1,
    crowdfundingProjectName: '大通RV80众筹项目一期',
    storeId: 1,
    storeName: '北京朝阳店',
    status: 'available',
    purchaseDate: '2024-06-01',
    purchasePrice: 450000,
    currentMileage: 6000,
    lastMaintenanceDate: '2024-11-01',
    nextMaintenanceDate: '2024-12-01',
    insuranceCompany: '中国人保',
    insuranceExpireDate: '2025-06-01',
    annualInspectionDate: '2025-06-01',
    location: '北京市朝阳区',
    images: ['https://via.placeholder.com/800x600?text=Vehicle+8'],
    features: ['空调', '冰箱', '微波炉', '卫生间', '淋浴', '太阳能'],
    dailyPrice: 800,
    remark: '新车，车况极佳',
    createdAt: '2024-06-01 10:30:00',
    updatedAt: '2024-11-28 15:20:00',
  },
]

/**
 * 获取车辆列表
 */
export const mockGetVehicles = (params: {
  page?: number
  pageSize?: number
  vehicleNumber?: string
  modelId?: number | null
  storeId?: number | null
  status?: string
  ownershipType?: string
  crowdfundingProjectId?: number | null
}) => {
  const {
    page = 1,
    pageSize = 10,
    vehicleNumber,
    modelId,
    storeId,
    status,
    ownershipType,
    crowdfundingProjectId,
  } = params

  // 过滤数据
  let filteredData = [...mockVehicles]

  if (vehicleNumber) {
    filteredData = filteredData.filter(item =>
      item.vehicleNumber.toLowerCase().includes(vehicleNumber.toLowerCase())
    )
  }

  if (modelId) {
    filteredData = filteredData.filter(item => item.modelId === modelId)
  }

  if (storeId) {
    filteredData = filteredData.filter(item => item.storeId === storeId)
  }

  if (status) {
    filteredData = filteredData.filter(item => item.status === status)
  }

  if (ownershipType) {
    filteredData = filteredData.filter(item => item.ownershipType === ownershipType)
  }

  if (crowdfundingProjectId) {
    filteredData = filteredData.filter(item => item.crowdfundingProjectId === crowdfundingProjectId)
  }

  // 分页
  const total = filteredData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page,
      pageSize,
    },
  })
}

/**
 * 获取车辆详情
 */
export const mockGetVehicleDetail = (id: number) => {
  const vehicle = mockVehicles.find(item => item.id === id)

  if (!vehicle) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: vehicle,
  })
}

/**
 * 创建车辆
 */
export const mockCreateVehicle = (data: Partial<Vehicle>) => {
  const newVehicle: Vehicle = {
    id: mockVehicles.length + 1,
    vehicleNumber: data.vehicleNumber!,
    modelId: data.modelId!,
    modelName: mockVehicleModels.find(m => m.id === data.modelId)?.modelName || '',
    brandName: mockVehicleModels.find(m => m.id === data.modelId)?.brandName || '',
    vehicleType: mockVehicleModels.find(m => m.id === data.modelId)?.vehicleType || 'c_type',
    ownershipType: data.ownershipType || 'crowdfunding',
    crowdfundingProjectId: data.crowdfundingProjectId,
    crowdfundingProjectName: data.crowdfundingProjectName,
    storeId: data.storeId!,
    storeName: data.storeName || '',
    status: 'available',
    purchaseDate: data.purchaseDate!,
    purchasePrice: data.purchasePrice!,
    currentMileage: data.currentMileage || 0,
    lastMaintenanceDate: data.lastMaintenanceDate || '',
    nextMaintenanceDate: data.nextMaintenanceDate || '',
    insuranceCompany: data.insuranceCompany || '',
    insuranceExpireDate: data.insuranceExpireDate || '',
    annualInspectionDate: data.annualInspectionDate || '',
    location: data.location || '',
    images: data.images || [],
    features: data.features || [],
    dailyPrice: data.dailyPrice || 0,
    remark: data.remark || '',
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockVehicles.unshift(newVehicle)

  return Promise.resolve({
    code: 200,
    message: '创建成功',
    data: newVehicle,
  })
}

/**
 * 更新车辆
 */
export const mockUpdateVehicle = (id: number, data: Partial<Vehicle>) => {
  const index = mockVehicles.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  const updatedVehicle = {
    ...mockVehicles[index],
    ...data,
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockVehicles[index] = updatedVehicle

  return Promise.resolve({
    code: 200,
    message: '更新成功',
    data: updatedVehicle,
  })
}

/**
 * 删除车辆
 */
export const mockDeleteVehicle = (id: number) => {
  const index = mockVehicles.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  // 检查车辆状态
  if (mockVehicles[index].status === 'rented') {
    return Promise.reject({
      code: 400,
      message: '车辆正在租用中，无法删除',
    })
  }

  mockVehicles.splice(index, 1)

  return Promise.resolve({
    code: 200,
    message: '删除成功',
  })
}

/**
 * 更改车辆状态
 */
export const mockChangeVehicleStatus = (
  id: number,
  status: 'available' | 'rented' | 'maintenance' | 'repair' | 'retired'
) => {
  const index = mockVehicles.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  mockVehicles[index].status = status
  mockVehicles[index].updatedAt = new Date().toLocaleString('zh-CN')

  return Promise.resolve({
    code: 200,
    message: '状态更新成功',
    data: mockVehicles[index],
  })
}

// ==================== 车辆状态历史 ====================

// 状态历史数据类型
export interface VehicleStatusHistory {
  id: number
  vehicleId: number
  vehicleNumber: string
  oldStatus: 'available' | 'rented' | 'maintenance' | 'repair' | 'retired'
  newStatus: 'available' | 'rented' | 'maintenance' | 'repair' | 'retired'
  reason: string
  remark: string
  operator: string
  operatorId: number
  estimatedRecoveryTime?: string
  createdAt: string
}

// 状态历史Mock数据
export const mockVehicleStatusHistory: VehicleStatusHistory[] = [
  {
    id: 1,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    oldStatus: 'maintenance',
    newStatus: 'available',
    reason: '定期保养完成，车辆已恢复正常',
    remark: '更换了机油、机滤、空气滤芯',
    operator: '张三',
    operatorId: 1,
    createdAt: '2024-11-29 14:30:00',
  },
  {
    id: 2,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    oldStatus: 'available',
    newStatus: 'maintenance',
    reason: '达到保养里程，进行定期保养',
    remark: '里程数：15000km',
    operator: '李四',
    operatorId: 2,
    estimatedRecoveryTime: '2024-11-29 18:00:00',
    createdAt: '2024-11-29 09:00:00',
  },
  {
    id: 3,
    vehicleId: 2,
    vehicleNumber: '京A12346',
    oldStatus: 'available',
    newStatus: 'rented',
    reason: '订单租用',
    remark: '订单号：ORD20241128001',
    operator: '系统',
    operatorId: 0,
    createdAt: '2024-11-28 09:15:00',
  },
  {
    id: 4,
    vehicleId: 4,
    vehicleNumber: '沪C34567',
    oldStatus: 'available',
    newStatus: 'maintenance',
    reason: '定期保养',
    remark: '保养项目：机油、机滤、空滤、空调滤芯',
    operator: '王五',
    operatorId: 3,
    estimatedRecoveryTime: '2024-11-29 16:00:00',
    createdAt: '2024-11-29 10:00:00',
  },
  {
    id: 5,
    vehicleId: 7,
    vehicleNumber: '川F67890',
    oldStatus: 'rented',
    newStatus: 'repair',
    reason: '客户反馈发动机异响，需要检修',
    remark: '已联系维修厂，预计需要3天',
    operator: '赵六',
    operatorId: 4,
    estimatedRecoveryTime: '2024-12-02 18:00:00',
    createdAt: '2024-11-29 12:00:00',
  },
]

/**
 * 获取车辆状态统计
 */
export const mockGetVehicleStatusStats = () => {
  const stats = {
    available: mockVehicles.filter(v => v.status === 'available').length,
    rented: mockVehicles.filter(v => v.status === 'rented').length,
    maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
    repair: mockVehicles.filter(v => v.status === 'repair').length,
    retired: mockVehicles.filter(v => v.status === 'retired').length,
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: stats,
  })
}

/**
 * 获取车辆状态历史
 */
export const mockGetVehicleStatusHistory = (vehicleId: number) => {
  const history = mockVehicleStatusHistory.filter(item => item.vehicleId === vehicleId)

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: history,
  })
}

/**
 * 创建状态变更记录
 */
export const mockCreateStatusHistory = (data: {
  vehicleId: number
  newStatus: 'available' | 'rented' | 'maintenance' | 'repair' | 'retired'
  reason: string
  remark?: string
  estimatedRecoveryTime?: string
}) => {
  const vehicle = mockVehicles.find(v => v.id === data.vehicleId)

  if (!vehicle) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  const newHistory: VehicleStatusHistory = {
    id: mockVehicleStatusHistory.length + 1,
    vehicleId: data.vehicleId,
    vehicleNumber: vehicle.vehicleNumber,
    oldStatus: vehicle.status,
    newStatus: data.newStatus,
    reason: data.reason,
    remark: data.remark || '',
    operator: '当前用户',
    operatorId: 1,
    estimatedRecoveryTime: data.estimatedRecoveryTime,
    createdAt: new Date().toLocaleString('zh-CN'),
  }

  mockVehicleStatusHistory.unshift(newHistory)

  // 更新车辆状态
  vehicle.status = data.newStatus
  vehicle.updatedAt = new Date().toLocaleString('zh-CN')

  return Promise.resolve({
    code: 200,
    message: '状态变更成功',
    data: newHistory,
  })
}

// ==================== 维保管理 ====================

// 维保记录数据类型
export interface MaintenanceRecord {
  id: number
  vehicleId: number
  vehicleNumber: string
  modelName: string
  type: 'maintenance' | 'repair' // 类型：保养/维修
  category: string // 类别：定期保养、故障维修、事故维修等
  mileage: number // 维保时里程
  maintenanceDate: string // 维保日期
  completionDate?: string // 完成日期
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' // 状态
  serviceProvider: string // 服务商
  serviceLocation: string // 服务地点
  items: MaintenanceItem[] // 维保项目
  totalCost: number // 总费用
  laborCost: number // 工时费
  partsCost: number // 配件费
  description: string // 问题描述
  solution: string // 解决方案
  technician: string // 技师
  inspector: string // 检验人
  remark: string // 备注
  attachments: string[] // 附件
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 维保项目
export interface MaintenanceItem {
  id: number
  name: string // 项目名称
  category: string // 项目类别
  quantity: number // 数量
  unit: string // 单位
  unitPrice: number // 单价
  totalPrice: number // 总价
  remark: string // 备注
}

// 维保计划数据类型
export interface MaintenancePlan {
  id: number
  vehicleId: number
  vehicleNumber: string
  modelName: string
  planType: 'mileage' | 'time' // 计划类型：里程/时间
  triggerMileage?: number // 触发里程
  triggerDate?: string // 触发日期
  items: string[] // 计划项目
  estimatedCost: number // 预计费用
  status: 'active' | 'completed' | 'cancelled' // 状态
  nextMaintenanceDate?: string // 下次保养日期
  nextMaintenanceMileage?: number // 下次保养里程
  remark: string
  createdAt: string
  updatedAt: string
}

// 维保记录Mock数据
export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    modelName: 'RV80 C型房车',
    type: 'maintenance',
    category: '定期保养',
    mileage: 15000,
    maintenanceDate: '2024-11-29',
    completionDate: '2024-11-29',
    status: 'completed',
    serviceProvider: '大通4S店',
    serviceLocation: '北京市朝阳区',
    items: [
      {
        id: 1,
        name: '更换机油',
        category: '润滑系统',
        quantity: 1,
        unit: '次',
        unitPrice: 300,
        totalPrice: 300,
        remark: '使用全合成机油',
      },
      {
        id: 2,
        name: '更换机滤',
        category: '润滑系统',
        quantity: 1,
        unit: '个',
        unitPrice: 80,
        totalPrice: 80,
        remark: '',
      },
      {
        id: 3,
        name: '更换空气滤芯',
        category: '进气系统',
        quantity: 1,
        unit: '个',
        unitPrice: 120,
        totalPrice: 120,
        remark: '',
      },
      {
        id: 4,
        name: '更换空调滤芯',
        category: '空调系统',
        quantity: 1,
        unit: '个',
        unitPrice: 150,
        totalPrice: 150,
        remark: '',
      },
    ],
    totalCost: 850,
    laborCost: 200,
    partsCost: 650,
    description: '达到15000公里保养里程，进行定期保养',
    solution: '更换机油、机滤、空气滤芯、空调滤芯，检查各系统运行正常',
    technician: '张师傅',
    inspector: '李主管',
    remark: '车况良好',
    attachments: [],
    createdBy: '系统',
    createdAt: '2024-11-29 09:00:00',
    updatedAt: '2024-11-29 14:30:00',
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleNumber: '京A12346',
    modelName: 'RV80 C型房车',
    type: 'repair',
    category: '故障维修',
    mileage: 18000,
    maintenanceDate: '2024-11-28',
    completionDate: '2024-11-28',
    status: 'completed',
    serviceProvider: '大通4S店',
    serviceLocation: '北京市朝阳区',
    items: [
      {
        id: 1,
        name: '更换刹车片',
        category: '制动系统',
        quantity: 4,
        unit: '片',
        unitPrice: 200,
        totalPrice: 800,
        remark: '前后刹车片',
      },
      {
        id: 2,
        name: '更换刹车油',
        category: '制动系统',
        quantity: 1,
        unit: '升',
        unitPrice: 150,
        totalPrice: 150,
        remark: '',
      },
    ],
    totalCost: 1250,
    laborCost: 300,
    partsCost: 950,
    description: '客户反馈刹车异响，刹车距离变长',
    solution: '检查发现刹车片磨损严重，更换前后刹车片和刹车油',
    technician: '王师傅',
    inspector: '李主管',
    remark: '建议客户注意刹车保养',
    attachments: [],
    createdBy: '张三',
    createdAt: '2024-11-28 10:00:00',
    updatedAt: '2024-11-28 16:00:00',
  },
  {
    id: 3,
    vehicleId: 7,
    vehicleNumber: '川F67890',
    modelName: '特顺C型房车',
    type: 'repair',
    category: '故障维修',
    mileage: 10000,
    maintenanceDate: '2024-11-29',
    status: 'in_progress',
    serviceProvider: '江铃维修厂',
    serviceLocation: '成都市武侯区',
    items: [
      {
        id: 1,
        name: '发动机检修',
        category: '动力系统',
        quantity: 1,
        unit: '次',
        unitPrice: 1500,
        totalPrice: 1500,
        remark: '发动机异响检修',
      },
    ],
    totalCost: 1500,
    laborCost: 800,
    partsCost: 700,
    description: '客户反馈发动机异响，需要检修',
    solution: '正在检修中',
    technician: '赵师傅',
    inspector: '',
    remark: '预计需要3天',
    attachments: [],
    createdBy: '赵六',
    createdAt: '2024-11-29 12:00:00',
    updatedAt: '2024-11-29 12:00:00',
  },
  {
    id: 4,
    vehicleId: 3,
    vehicleNumber: '京B23456',
    modelName: '全顺B型房车',
    type: 'maintenance',
    category: '定期保养',
    mileage: 12000,
    maintenanceDate: '2024-11-27',
    completionDate: '2024-11-27',
    status: 'completed',
    serviceProvider: '福特4S店',
    serviceLocation: '上海市浦东新区',
    items: [
      {
        id: 1,
        name: '更换机油',
        category: '润滑系统',
        quantity: 1,
        unit: '次',
        unitPrice: 280,
        totalPrice: 280,
        remark: '',
      },
      {
        id: 2,
        name: '更换机滤',
        category: '润滑系统',
        quantity: 1,
        unit: '个',
        unitPrice: 70,
        totalPrice: 70,
        remark: '',
      },
    ],
    totalCost: 500,
    laborCost: 150,
    partsCost: 350,
    description: '定期保养',
    solution: '更换机油机滤，检查各系统正常',
    technician: '孙师傅',
    inspector: '周主管',
    remark: '',
    attachments: [],
    createdBy: '系统',
    createdAt: '2024-11-27 09:00:00',
    updatedAt: '2024-11-27 15:00:00',
  },
  {
    id: 5,
    vehicleId: 4,
    vehicleNumber: '沪C34567',
    modelName: '全顺B型房车',
    type: 'maintenance',
    category: '定期保养',
    mileage: 14000,
    maintenanceDate: '2024-11-29',
    status: 'in_progress',
    serviceProvider: '福特4S店',
    serviceLocation: '上海市浦东新区',
    items: [
      {
        id: 1,
        name: '更换机油',
        category: '润滑系统',
        quantity: 1,
        unit: '次',
        unitPrice: 280,
        totalPrice: 280,
        remark: '',
      },
      {
        id: 2,
        name: '更换机滤',
        category: '润滑系统',
        quantity: 1,
        unit: '个',
        unitPrice: 70,
        totalPrice: 70,
        remark: '',
      },
      {
        id: 3,
        name: '更换空滤',
        category: '进气系统',
        quantity: 1,
        unit: '个',
        unitPrice: 100,
        totalPrice: 100,
        remark: '',
      },
      {
        id: 4,
        name: '更换空调滤芯',
        category: '空调系统',
        quantity: 1,
        unit: '个',
        unitPrice: 130,
        totalPrice: 130,
        remark: '',
      },
    ],
    totalCost: 730,
    laborCost: 150,
    partsCost: 580,
    description: '定期保养',
    solution: '正在保养中',
    technician: '吴师傅',
    inspector: '',
    remark: '',
    attachments: [],
    createdBy: '王五',
    createdAt: '2024-11-29 10:00:00',
    updatedAt: '2024-11-29 10:00:00',
  },
]

// 维保计划Mock数据
export const mockMaintenancePlans: MaintenancePlan[] = [
  {
    id: 1,
    vehicleId: 1,
    vehicleNumber: '京A12345',
    modelName: 'RV80 C型房车',
    planType: 'mileage',
    triggerMileage: 20000,
    items: ['更换机油', '更换机滤', '更换空气滤芯', '更换空调滤芯', '检查刹车系统'],
    estimatedCost: 1000,
    status: 'active',
    nextMaintenanceDate: '2025-01-15',
    nextMaintenanceMileage: 20000,
    remark: '下次保养里程20000公里',
    createdAt: '2024-11-29 14:30:00',
    updatedAt: '2024-11-29 14:30:00',
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleNumber: '京A12346',
    modelName: 'RV80 C型房车',
    planType: 'mileage',
    triggerMileage: 23000,
    items: ['更换机油', '更换机滤', '检查刹车系统'],
    estimatedCost: 800,
    status: 'active',
    nextMaintenanceDate: '2025-02-01',
    nextMaintenanceMileage: 23000,
    remark: '',
    createdAt: '2024-11-28 16:00:00',
    updatedAt: '2024-11-28 16:00:00',
  },
  {
    id: 3,
    vehicleId: 3,
    vehicleNumber: '京B23456',
    modelName: '全顺B型房车',
    planType: 'time',
    triggerDate: '2025-02-27',
    items: ['更换机油', '更换机滤', '更换空气滤芯'],
    estimatedCost: 600,
    status: 'active',
    nextMaintenanceDate: '2025-02-27',
    remark: '3个月定期保养',
    createdAt: '2024-11-27 15:00:00',
    updatedAt: '2024-11-27 15:00:00',
  },
]

/**
 * 获取维保记录列表
 */
export const mockGetMaintenanceRecords = (params: {
  page?: number
  pageSize?: number
  vehicleId?: number | null
  vehicleNumber?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}) => {
  const {
    page = 1,
    pageSize = 10,
    vehicleId,
    vehicleNumber,
    type,
    status,
    startDate,
    endDate,
  } = params

  // 过滤数据
  let filteredData = [...mockMaintenanceRecords]

  if (vehicleId) {
    filteredData = filteredData.filter(item => item.vehicleId === vehicleId)
  }

  if (vehicleNumber) {
    filteredData = filteredData.filter(item =>
      item.vehicleNumber.toLowerCase().includes(vehicleNumber.toLowerCase())
    )
  }

  if (type) {
    filteredData = filteredData.filter(item => item.type === type)
  }

  if (status) {
    filteredData = filteredData.filter(item => item.status === status)
  }

  if (startDate) {
    filteredData = filteredData.filter(item => item.maintenanceDate >= startDate)
  }

  if (endDate) {
    filteredData = filteredData.filter(item => item.maintenanceDate <= endDate)
  }

  // 分页
  const total = filteredData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page,
      pageSize,
    },
  })
}

/**
 * 获取维保记录详情
 */
export const mockGetMaintenanceRecordDetail = (id: number) => {
  const record = mockMaintenanceRecords.find(item => item.id === id)

  if (!record) {
    return Promise.reject({
      code: 404,
      message: '维保记录不存在',
    })
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: record,
  })
}

/**
 * 创建维保记录
 */
export const mockCreateMaintenanceRecord = (data: Partial<MaintenanceRecord>) => {
  const vehicle = mockVehicles.find(v => v.id === data.vehicleId)

  if (!vehicle) {
    return Promise.reject({
      code: 404,
      message: '车辆不存在',
    })
  }

  const newRecord: MaintenanceRecord = {
    id: mockMaintenanceRecords.length + 1,
    vehicleId: data.vehicleId!,
    vehicleNumber: vehicle.vehicleNumber,
    modelName: vehicle.modelName,
    type: data.type!,
    category: data.category!,
    mileage: data.mileage!,
    maintenanceDate: data.maintenanceDate!,
    completionDate: data.completionDate,
    status: data.status || 'pending',
    serviceProvider: data.serviceProvider!,
    serviceLocation: data.serviceLocation!,
    items: data.items || [],
    totalCost: data.totalCost || 0,
    laborCost: data.laborCost || 0,
    partsCost: data.partsCost || 0,
    description: data.description || '',
    solution: data.solution || '',
    technician: data.technician || '',
    inspector: data.inspector || '',
    remark: data.remark || '',
    attachments: data.attachments || [],
    createdBy: '当前用户',
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockMaintenanceRecords.unshift(newRecord)

  return Promise.resolve({
    code: 200,
    message: '创建成功',
    data: newRecord,
  })
}

/**
 * 更新维保记录
 */
export const mockUpdateMaintenanceRecord = (id: number, data: Partial<MaintenanceRecord>) => {
  const index = mockMaintenanceRecords.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '维保记录不存在',
    })
  }

  const updatedRecord = {
    ...mockMaintenanceRecords[index],
    ...data,
    updatedAt: new Date().toLocaleString('zh-CN'),
  }

  mockMaintenanceRecords[index] = updatedRecord

  return Promise.resolve({
    code: 200,
    message: '更新成功',
    data: updatedRecord,
  })
}

/**
 * 删除维保记录
 */
export const mockDeleteMaintenanceRecord = (id: number) => {
  const index = mockMaintenanceRecords.findIndex(item => item.id === id)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '维保记录不存在',
    })
  }

  mockMaintenanceRecords.splice(index, 1)

  return Promise.resolve({
    code: 200,
    message: '删除成功',
  })
}

/**
 * 获取维保计划列表
 */
export const mockGetMaintenancePlans = (params: {
  page?: number
  pageSize?: number
  vehicleId?: number | null
  status?: string
}) => {
  const { page = 1, pageSize = 10, vehicleId, status } = params

  // 过滤数据
  let filteredData = [...mockMaintenancePlans]

  if (vehicleId) {
    filteredData = filteredData.filter(item => item.vehicleId === vehicleId)
  }

  if (status) {
    filteredData = filteredData.filter(item => item.status === status)
  }

  // 分页
  const total = filteredData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page,
      pageSize,
    },
  })
}

/**
 * 获取维保统计
 */
export const mockGetMaintenanceStats = () => {
  const stats = {
    totalRecords: mockMaintenanceRecords.length,
    pendingRecords: mockMaintenanceRecords.filter(r => r.status === 'pending').length,
    inProgressRecords: mockMaintenanceRecords.filter(r => r.status === 'in_progress').length,
    completedRecords: mockMaintenanceRecords.filter(r => r.status === 'completed').length,
    totalCost: mockMaintenanceRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalCost, 0),
    maintenanceCount: mockMaintenanceRecords.filter(r => r.type === 'maintenance').length,
    repairCount: mockMaintenanceRecords.filter(r => r.type === 'repair').length,
  }

  return Promise.resolve({
    code: 200,
    message: '获取成功',
    data: stats,
  })
}
