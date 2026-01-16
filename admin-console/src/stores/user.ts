import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm } from '@/types/user'
import type { UserRole } from '@/types/permission'
import type { Role } from '@/types/permission'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const userRoles = ref<Role[]>([])  // 新增：用户角色列表

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const isPlusMember = computed(() => userRoles.value.some(role => role.code === 'plus'))  // 新增：PLUS会员判断

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

    // 字段映射：后端返回 nickname，前端使用 username
    if ((userData as any).nickname && !userData.username) {
      userData.username = (userData as any).nickname
    }

    // 字段映射：后端返回 avatar，前端使用 avatar
    if ((userData as any).avatar && !userData.avatar) {
      userData.avatar = (userData as any).avatar
    }

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
    userRoles.value = userData.roles || []  // 保存角色列表

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('userRoles', JSON.stringify(userData.roles || []))  // 保存角色列表到本地存储

    return response
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    userRoles.value = []  // 清空角色列表
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRoles')  // 清除角色列表
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await authApi.getUserInfo()
      const userData = response.data

      // 字段映射：后端返回 nickname，前端使用 username
      if ((userData as any).nickname && !userData.username) {
        userData.username = (userData as any).nickname
      }

      // 字段映射：后端返回 avatar，前端使用 avatar
      if ((userData as any).avatar && !userData.avatar) {
        userData.avatar = (userData as any).avatar
      }

      user.value = userData
      userRoles.value = userData.roles || []  // 更新角色列表
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userRoles', JSON.stringify(userData.roles || []))  // 保存角色列表
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

        // 恢复角色列表
        const savedRoles = localStorage.getItem('userRoles')
        if (savedRoles) {
          try {
            userRoles.value = JSON.parse(savedRoles)
          } catch (error) {
            console.error('解析角色列表失败:', error)
            userRoles.value = []
          }
        }
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
    userRoles,  // 导出角色列表
    isAuthenticated,
    userRole,
    isPlusMember,  // 导出PLUS会员判断
    login,
    logout,
    getUserInfo,
    initUserInfo,
    hasPermission,
    hasRole,
  }
})
