import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Permission, Role, User } from '@/types/auth'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const permissions = ref<Permission[]>([])
  const roles = ref<Role[]>([])

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  const userPermissions = computed(() => {
    const allPermissions: string[] = []

    // 收集所有角色的权限
    roles.value.forEach(role => {
      role.permissions.forEach(permission => {
        if (!allPermissions.includes(permission.code)) {
          allPermissions.push(permission.code)
        }
      })
    })

    // 添加用户直接权限
    permissions.value.forEach(permission => {
      if (!allPermissions.includes(permission.code)) {
        allPermissions.push(permission.code)
      }
    })

    return allPermissions
  })

  const userRoles = computed(() => roles.value.map(role => role.code))

  const dataScope = computed(() => {
    // ���果有平台管理员角色，返回全部数据权限
    const hasPlatformAdmin = roles.value.some(role => role.code === 'platform_admin')
    if (hasPlatformAdmin) {
      return {
        type: 'all' as const,
        regionIds: [],
        storeIds: []
      }
    }

    // 检查是否有区域经理角色
    const hasRegionManager = roles.value.some(role => role.code === 'region_manager')
    if (hasRegionManager && user.value?.regionIds) {
      return {
        type: 'region' as const,
        regionIds: user.value.regionIds,
        storeIds: []
      }
    }

    // 检查是否��门店经理角色
    const hasStoreManager = roles.value.some(role => role.code === 'store_manager')
    if (hasStoreManager && user.value?.storeIds) {
      return {
        type: 'store' as const,
        regionIds: [],
        storeIds: user.value.storeIds
      }
    }

    // 默认只能访问自己的数据
    return {
      type: 'self' as const,
      regionIds: [],
      storeIds: []
    }
  })

  // 方法
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authApi.login(credentials)

      // 保存用户信息
      user.value = response.data.user
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      // 保存角色和权限
      roles.value = response.data.user.roles || []
      permissions.value = response.data.user.permissions || []

      // 保存到本地存储
      saveToStorage()

      return response
    } catch (error) {
      await logout()
      throw error
    }
  }

  const logout = async () => {
    try {
      // 调用退出登录API
      if (token.value) {
        await authApi.logout().catch(() => {
          // 忽略退出登录API错误
        })
      }
    } catch (error) {
      // 忽略错误，继续清理本地数据
    } finally {
      // 清理状态
      user.value = null
      token.value = ''
      refreshToken.value = ''
      permissions.value = []
      roles.value = []

      // 清理本地存储
      clearStorage()
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authApi.refresh(refreshToken.value)

      token.value = response.data.token

      // 更新用户信息
      if (response.data.user) {
        user.value = response.data.user
        roles.value = response.data.user.roles || []
        permissions.value = response.data.user.permissions || []
      }

      saveToStorage()

      return response.data.token
    } catch (error) {
      await logout()
      throw error
    }
  }

  const updateUserInfo = (newUserInfo: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...newUserInfo }
      saveToStorage()
    }
  }

  const updatePermissions = (newPermissions: Permission[]) => {
    permissions.value = newPermissions
    saveToStorage()
  }

  const updateRoles = (newRoles: Role[]) => {
    roles.value = newRoles
    saveToStorage()
  }

  const hasPermission = (permission: string | string[]): boolean => {
    if (!permission || !isAuthenticated.value) return false

    const permissions = Array.isArray(permission) ? permission : [permission]

    // 检查是否有超级管理员权限
    if (userPermissions.value.includes('*')) {
      return true
    }

    // 检查具体权限
    return permissions.every(p => userPermissions.value.includes(p))
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0 || !isAuthenticated.value) return false

    // 检查是否有超级管理员权限
    if (userPermissions.value.includes('*')) {
      return true
    }

    return permissions.some(p => userPermissions.value.includes(p))
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!role || !isAuthenticated.value) return false

    const roles = Array.isArray(role) ? role : [role]

    // 检查是否有超级管理员角色
    if (userRoles.value.includes('super_admin')) {
      return true
    }

    return roles.every(r => userRoles.value.includes(r))
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!roles || roles.length === 0 || !isAuthenticated.value) return false

    // 检查是否有超级管理员角色
    if (userRoles.value.includes('super_admin')) {
      return true
    }

    return roles.some(r => userRoles.value.includes(r))
  }

  const canAccessData = (dataRegionId?: string, dataStoreId?: string): boolean => {
    const scope = dataScope.value

    switch (scope.type) {
      case 'all':
        return true
      case 'region':
        return !dataRegionId || scope.regionIds.includes(dataRegionId)
      case 'store':
        return !dataStoreId || scope.storeIds.includes(dataStoreId)
      case 'self':
        // 只能访问自己创建的数据
        return false // 需要在具体实现中检查数据的创建者
      default:
        return false
    }
  }

  // 本地存储方法
  const saveToStorage = () => {
    try {
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_refresh_token', refreshToken.value)

      if (user.value) {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }

      if (roles.value.length > 0) {
        localStorage.setItem('auth_roles', JSON.stringify(roles.value))
      }

      if (permissions.value.length > 0) {
        localStorage.setItem('auth_permissions', JSON.stringify(permissions.value))
      }
    } catch (error) {
      console.warn('Failed to save auth data to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedRefreshToken = localStorage.getItem('auth_refresh_token')
      const savedUser = localStorage.getItem('auth_user')
      const savedRoles = localStorage.getItem('auth_roles')
      const savedPermissions = localStorage.getItem('auth_permissions')

      if (savedToken) token.value = savedToken
      if (savedRefreshToken) refreshToken.value = savedRefreshToken
      if (savedUser) user.value = JSON.parse(savedUser)
      if (savedRoles) roles.value = JSON.parse(savedRoles)
      if (savedPermissions) permissions.value = JSON.parse(savedPermissions)
    } catch (error) {
      console.warn('Failed to load auth data from storage:', error)
      clearStorage()
    }
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_roles')
      localStorage.removeItem('auth_permissions')
    } catch (error) {
      console.warn('Failed to clear auth data from storage:', error)
    }
  }

  // 初始化
  const initialize = () => {
    loadFromStorage()
  }

  return {
    // 状态
    user,
    token,
    refreshToken,
    permissions,
    roles,

    // 计算属性
    isAuthenticated,
    userPermissions,
    userRoles,
    dataScope,

    // 方法
    login,
    logout,
    refreshAccessToken,
    updateUserInfo,
    updatePermissions,
    updateRoles,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    canAccessData,
    initialize
  }
})