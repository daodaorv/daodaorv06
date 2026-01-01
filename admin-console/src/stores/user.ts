import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm } from '@/types/user'
import type { UserRole } from '@/types/permission'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'guest')

  // 角色代码映射到前端 UserRole 枚举值
  const mapRoleToFrontend = (roleCode: string): string => {
    const roleMapping: Record<string, string> = {
      'admin_super': 'platform_admin',
      'admin_platform': 'platform_admin',
      'admin_regional': 'regional_manager',
      'admin_finance': 'platform_admin',
      'admin_service': 'store_staff',
      'admin_store_manager': 'store_manager',
      'admin_store_staff': 'store_staff',
      'admin_preparation': 'store_staff',
      'admin_driver': 'store_staff',
    }
    return roleMapping[roleCode] || 'store_staff'
  }

  // 登录
  const login = async (loginForm: LoginForm) => {
    const response = await authApi.login(loginForm)
    const { token: newToken, user: userData } = response.data

    // 如果后端没有返回 role 字段，从 roles 数组中映射
    if (!userData.role && userData.roles && userData.roles.length > 0) {
      userData.role = mapRoleToFrontend(userData.roles[0].code) as UserRole
    }

    // 如果 role 字段是大写格式（如 PLATFORM_ADMIN），转换为小写格式（platform_admin）
    if (userData.role && typeof userData.role === 'string') {
      userData.role = userData.role.toLowerCase() as UserRole
    }

    token.value = newToken
    user.value = userData

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))

    return response
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await authApi.getUserInfo()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      return response
    } catch (error) {
      logout()
      throw error
    }
  }

  // 初始化用户信息
  const initUserInfo = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)

        // 如果 role 字段是大写格式（如 PLATFORM_ADMIN），转换为小写格式（platform_admin）
        if (userData.role && typeof userData.role === 'string') {
          userData.role = userData.role.toLowerCase() as UserRole
        }

        user.value = userData
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    if (!user.value || !user.value.permissions) {
      return false
    }
    return user.value.permissions.includes(permission)
  }

  // 检查角色（支持多角色系统）
  const hasRole = (roleCode: string) => {
    if (!user.value || !user.value.roles) {
      return false
    }
    return user.value.roles.some(r => r.code === roleCode)
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    getUserInfo,
    initUserInfo,
    hasPermission,
    hasRole,
  }
})
