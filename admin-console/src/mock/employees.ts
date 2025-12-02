/**
 * 员工管理 Mock 数据
 */
import type { Employee, EmployeeListParams, CreateEmployeeParams, UpdateEmployeeParams } from '@/api/employee'

// Mock 员工数据
let mockEmployees: Employee[] = [
  {
    id: 1,
    realName: '张三',
    jobNumber: 'EMP001',
    phone: '13800138000',
    email: 'zhangsan@daodao.com',
    roleId: 1,
    role: '平台管理员',
    storeId: 1,
    storeName: '北京朝阳店',
    department: '技术部',
    status: 'active',
    avatar: '',
    joinDate: '2024-01-15',
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 2,
    realName: '李四',
    jobNumber: 'EMP002',
    phone: '13800138001',
    email: 'lisi@daodao.com',
    roleId: 2,
    role: '区域经理',
    storeId: null,
    storeName: null,
    department: '运营部',
    status: 'active',
    avatar: '',
    joinDate: '2024-02-01',
    createdAt: '2024-02-01T08:00:00.000Z',
  },
  {
    id: 3,
    realName: '王五',
    jobNumber: 'EMP003',
    phone: '13800138002',
    email: 'wangwu@daodao.com',
    roleId: 3,
    role: '门店经理',
    storeId: 1,
    storeName: '北京朝阳店',
    department: '门店管理',
    status: 'active',
    avatar: '',
    joinDate: '2024-03-01',
    createdAt: '2024-03-01T08:00:00.000Z',
  },
]

// Mock 获取员工列表
export const mockGetEmployeeList = (params: EmployeeListParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredEmployees = [...mockEmployees]

      // 关键词搜索
      if (params.keyword) {
        filteredEmployees = filteredEmployees.filter(
          (emp) =>
            emp.realName.includes(params.keyword!) ||
            emp.phone.includes(params.keyword!) ||
            emp.jobNumber.includes(params.keyword!)
        )
      }

      // 门店筛选
      if (params.storeId) {
        filteredEmployees = filteredEmployees.filter((emp) => emp.storeId === params.storeId)
      }

      // 角色筛选
      if (params.roleId) {
        filteredEmployees = filteredEmployees.filter((emp) => emp.roleId === params.roleId)
      }

      // 状态筛选
      if (params.status) {
        filteredEmployees = filteredEmployees.filter((emp) => emp.status === params.status)
      }

      // 分页
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = filteredEmployees.slice(start, end)

      resolve({
        code: 200,
        message: '获取成功',
        data: {
          list,
          total: filteredEmployees.length,
          page,
          pageSize,
        },
      })
    }, 300)
  })
}

// Mock 获取员工详情
export const mockGetEmployeeDetail = (id: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const employee = mockEmployees.find((e) => e.id === id)
      if (employee) {
        resolve({
          code: 200,
          message: '获取成功',
          data: employee,
        })
      } else {
        reject({
          code: 404,
          message: '员工不存在',
        })
      }
    }, 200)
  })
}

// Mock 创建员工
export const mockCreateEmployee = (data: CreateEmployeeParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEmployee: Employee = {
        id: mockEmployees.length + 1,
        realName: data.realName,
        jobNumber: data.jobNumber,
        phone: data.phone,
        email: data.email || '',
        roleId: 0,
        role: '',
        storeId: data.storeId || null,
        storeName: data.storeId ? '北京朝阳店' : null,
        department: data.department || '',
        status: data.status || 'active',
        avatar: '',
        joinDate: data.joinDate,
        createdAt: new Date().toISOString(),
      }
      mockEmployees.push(newEmployee)

      resolve({
        code: 200,
        message: '创建成功',
        data: newEmployee,
      })
    }, 500)
  })
}

// Mock 更新员工
export const mockUpdateEmployee = (data: UpdateEmployeeParams) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex((e) => e.id === data.id)
      if (index > -1) {
        mockEmployees[index] = {
          ...mockEmployees[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        resolve({
          code: 200,
          message: '更新成功',
          data: mockEmployees[index],
        })
      } else {
        reject({
          code: 404,
          message: '员工不存在',
        })
      }
    }, 500)
  })
}

// Mock 更改员工状态
export const mockChangeEmployeeStatus = (id: number, status: 'active' | 'inactive') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex((e) => e.id === id)
      if (index > -1) {
        mockEmployees[index].status = status
        mockEmployees[index].updatedAt = new Date().toISOString()
        resolve({
          code: 200,
          message: '状态更新成功',
        })
      } else {
        reject({
          code: 404,
          message: '员工不存在',
        })
      }
    }, 300)
  })
}

// Mock 分配员工角色
export const mockAssignEmployeeRoles = (id: number, roleIds: number[]) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex((e) => e.id === id)
      if (index > -1) {
        // 这里只是模拟，实际应该保存角色分配
        mockEmployees[index].roleId = roleIds[0] || 0
        mockEmployees[index].updatedAt = new Date().toISOString()
        resolve({
          code: 200,
          message: '角色分配成功',
        })
      } else {
        reject({
          code: 404,
          message: '员工不存在',
        })
      }
    }, 500)
  })
}

// Mock 导出员工列表
export const mockExportEmployees = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '导出成功',
        data: {
          url: '/exports/employees.xlsx',
        },
      })
    }, 1000)
  })
}

// Mock 导入员工数据
export const mockImportEmployees = (file: File) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '导入成功',
        data: {
          successCount: 10,
          failCount: 0,
        },
      })
    }, 2000)
  })
}
