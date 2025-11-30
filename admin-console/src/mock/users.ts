/**
 * 用户管理 Mock 数据
 */
import type { UserInfo, UserListResponse } from '@/api/user'

// Mock 用户列表数据
export const mockUserList: UserInfo[] = [
  {
    id: 1,
    username: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    userType: 'customer',
    status: 'active',
    realName: '张三',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T10:30:00.000Z',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-11-29T10:30:00.000Z',
  },
  {
    id: 2,
    username: '李四',
    phone: '13800138001',
    email: 'lisi@example.com',
    userType: 'customer',
    status: 'active',
    realName: '李四',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-28T15:20:00.000Z',
    createdAt: '2024-02-10T09:00:00.000Z',
    updatedAt: '2024-11-28T15:20:00.000Z',
  },
  {
    id: 3,
    username: '王五',
    phone: '13800138002',
    email: 'wangwu@example.com',
    userType: 'customer',
    status: 'inactive',
    realName: '王五',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-20T12:00:00.000Z',
    createdAt: '2024-03-05T10:00:00.000Z',
    updatedAt: '2024-11-20T12:00:00.000Z',
  },
  {
    id: 4,
    username: '赵六',
    phone: '13800138003',
    email: 'zhaoliu@example.com',
    userType: 'mobile_admin',
    status: 'active',
    realName: '赵六',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T09:00:00.000Z',
    createdAt: '2024-04-01T08:00:00.000Z',
    updatedAt: '2024-11-29T09:00:00.000Z',
  },
  {
    id: 5,
    username: '孙七',
    phone: '13800138004',
    email: 'sunqi@example.com',
    userType: 'pc_admin',
    status: 'active',
    realName: '孙七',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T11:00:00.000Z',
    createdAt: '2024-05-10T08:00:00.000Z',
    updatedAt: '2024-11-29T11:00:00.000Z',
  },
  {
    id: 6,
    username: '周八',
    phone: '13800138005',
    email: 'zhouba@example.com',
    userType: 'customer',
    status: 'banned',
    realName: '周八',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-15T14:00:00.000Z',
    createdAt: '2024-06-01T08:00:00.000Z',
    updatedAt: '2024-11-25T10:00:00.000Z',
  },
  {
    id: 7,
    username: '吴九',
    phone: '13800138006',
    email: 'wujiu@example.com',
    userType: 'customer',
    status: 'active',
    realName: '吴九',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T08:30:00.000Z',
    createdAt: '2024-07-15T08:00:00.000Z',
    updatedAt: '2024-11-29T08:30:00.000Z',
  },
  {
    id: 8,
    username: '郑十',
    phone: '13800138007',
    email: 'zhengshi@example.com',
    userType: 'customer',
    status: 'active',
    realName: '郑十',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-28T16:00:00.000Z',
    createdAt: '2024-08-20T08:00:00.000Z',
    updatedAt: '2024-11-28T16:00:00.000Z',
  },
  {
    id: 9,
    username: '陈十一',
    phone: '13900139000',
    email: 'chenshiyi@example.com',
    userType: 'customer',
    status: 'active',
    realName: '陈十一',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T14:00:00.000Z',
    createdAt: '2024-09-01T08:00:00.000Z',
    updatedAt: '2024-11-29T14:00:00.000Z',
  },
  {
    id: 10,
    username: '林十二',
    phone: '13900139001',
    email: 'linshier@example.com',
    userType: 'mobile_admin',
    status: 'active',
    realName: '林十二',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T13:00:00.000Z',
    createdAt: '2024-09-15T08:00:00.000Z',
    updatedAt: '2024-11-29T13:00:00.000Z',
  },
  {
    id: 11,
    username: '黄十三',
    phone: '13900139002',
    email: 'huangshisan@example.com',
    userType: 'customer',
    status: 'inactive',
    realName: '黄十三',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-10T10:00:00.000Z',
    createdAt: '2024-10-01T08:00:00.000Z',
    updatedAt: '2024-11-10T10:00:00.000Z',
  },
  {
    id: 12,
    username: '刘十四',
    phone: '13900139003',
    email: 'liushisi@example.com',
    userType: 'pc_admin',
    status: 'active',
    realName: '刘十四',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    lastLoginAt: '2024-11-29T12:00:00.000Z',
    createdAt: '2024-10-15T08:00:00.000Z',
    updatedAt: '2024-11-29T12:00:00.000Z',
  },
]

// Mock 获取用户列表
export const mockGetUserList = (params: {
  page?: number
  pageSize?: number
  phone?: string
  username?: string
  userType?: string
  status?: string
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, phone, username, userType, status } = params

      // 过滤数据
      let filteredList = [...mockUserList]

      if (phone) {
        filteredList = filteredList.filter(user => user.phone.includes(phone))
      }

      if (username) {
        filteredList = filteredList.filter(user => user.username.includes(username))
      }

      if (userType) {
        filteredList = filteredList.filter(user => user.userType === userType)
      }

      if (status) {
        filteredList = filteredList.filter(user => user.status === status)
      }

      // 分页
      const total = filteredList.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = filteredList.slice(start, end)

      const response: UserListResponse = {
        list,
        total,
        page,
        pageSize,
      }

      resolve({
        code: 200,
        message: '获取成功',
        data: response,
      })
    }, 300)
  })
}

// Mock 获取用户详情
export const mockGetUserDetail = (id: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUserList.find(u => u.id === id)

      if (!user) {
        reject({
          code: 404,
          message: '用户不存在',
        })
        return
      }

      resolve({
        code: 200,
        message: '获取成功',
        data: user,
      })
    }, 200)
  })
}

// Mock 创建用户
export const mockCreateUser = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: UserInfo = {
        id: mockUserList.length + 1,
        username: data.username,
        phone: data.phone,
        email: data.email,
        userType: data.userType,
        status: 'active',
        realName: data.realName,
        avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockUserList.push(newUser)

      resolve({
        code: 200,
        message: '创建成功',
        data: newUser,
      })
    }, 500)
  })
}

// Mock 更新用户
export const mockUpdateUser = (data: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUserList.findIndex(u => u.id === data.id)

      if (index === -1) {
        reject({
          code: 404,
          message: '用户不存在',
        })
        return
      }

      mockUserList[index] = {
        ...mockUserList[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      resolve({
        code: 200,
        message: '更新成功',
        data: mockUserList[index],
      })
    }, 500)
  })
}

// Mock 删除用户
export const mockDeleteUser = (id: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUserList.findIndex(u => u.id === id)

      if (index === -1) {
        reject({
          code: 404,
          message: '用户不存在',
        })
        return
      }

      mockUserList.splice(index, 1)

      resolve({
        code: 200,
        message: '删除成功',
      })
    }, 500)
  })
}

// Mock 更改用户状态
export const mockChangeUserStatus = (id: number, status: 'active' | 'inactive' | 'banned') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUserList.find(u => u.id === id)

      if (!user) {
        reject({
          code: 404,
          message: '用户不存在',
        })
        return
      }

      user.status = status
      user.updatedAt = new Date().toISOString()

      resolve({
        code: 200,
        message: '状态更新成功',
      })
    }, 300)
  })
}
