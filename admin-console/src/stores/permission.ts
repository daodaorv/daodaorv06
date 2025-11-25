import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import { useAuthStore } from './auth'

export interface Menu {
  id: string
  parentId?: string
  name: string
  path: string
  icon?: string
  sort: number
  hidden?: boolean
  children?: Menu[]
}

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref<RouteRecordRaw[]>([])
  const menus = ref<Menu[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])

  // 计算属性
  const permissionRoutes = computed(() => routes.value)
  const permissionMenus = computed(() => menus.value)

  // 方法
  const hasPermission = (permission: string | string[]): boolean => {
    const authStore = useAuthStore()
    return authStore.hasPermission(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    const authStore = useAuthStore()
    return authStore.hasAnyPermission(permissions)
  }

  const hasRole = (role: string | string[]): boolean => {
    const authStore = useAuthStore()
    return authStore.hasRole(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    const authStore = useAuthStore()
    return authStore.hasAnyRole(roles)
  }

  /**
   * 根据角色权限生成可访问的路由
   * @param roles 用户角色
   */
  const generateRoutes = (roles: string[]) => {
    return new Promise<RouteRecordRaw[]>(resolve => {
      let accessedRoutes: RouteRecordRaw[]

      // 如果是超级管理员，显示所有路由
      if (roles.includes('super_admin') || roles.includes('platform_admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        // 根据用户权限过滤路由
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }

      addRoutes.value = accessedRoutes
      routes.value = constantRoutes.concat(accessedRoutes)

      // 生成菜单
      generateMenus(accessedRoutes)

      resolve(accessedRoutes)
    })
  }

  /**
   * 递归过滤异步路由表
   * @param routes 异步路由表
   * @param roles 用户角色
   */
  const filterAsyncRoutes = (routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] => {
    const res: RouteRecordRaw[] = []

    routes.forEach(route => {
      const tmp = { ...route }

      // 检查路由权限
      if (hasRoutePermission(tmp, roles)) {
        // 如果有子路由，递归过滤
        if (tmp.children && tmp.children.length > 0) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
          // 如果子路由过滤后为空，且当前路由不是叶子节点，则不保留该路由
          if (tmp.children.length === 0 && !tmp.meta?.isLeaf) {
            return
          }
        }

        res.push(tmp)
      }
    })

    return res
  }

  /**
   * 检查路由权限
   * @param route 路由对象
   * @param roles 用户角色
   */
  const hasRoutePermission = (route: RouteRecordRaw, roles: string[]): boolean => {
    // 如果路由设置了hidden，直接返回false
    if (route.meta?.hidden) {
      return false
    }

    // 如果路由没有设置权限要求，默认允许访问
    if (!route.meta?.permission && !route.meta?.roles) {
      return true
    }

    // 检查角色权限
    if (route.meta?.roles) {
      const requiredRoles = Array.isArray(route.meta.roles) ? route.meta.roles : [route.meta.roles]
      return requiredRoles.some(role => roles.includes(role))
    }

    // 检查操作权限
    if (route.meta?.permission) {
      const requiredPermissions = Array.isArray(route.meta.permission) ? route.meta.permission : [route.meta.permission]
      return hasAnyPermission(requiredPermissions)
    }

    return true
  }

  /**
   * 生成菜单树
   * @param routes 路由表
   */
  const generateMenus = (routes: RouteRecordRaw[]) => {
    const menuList: Menu[] = []

    routes.forEach(route => {
      if (!route.meta?.hidden && route.meta?.title) {
        const menu: Menu = {
          id: route.path || route.name?.toString() || '',
          name: route.meta.title as string,
          path: route.path || '',
          icon: route.meta?.icon as string,
          sort: route.meta?.sort || 999,
          hidden: route.meta?.hidden
        }

        // 如果有子路由，递归生成子菜单
        if (route.children && route.children.length > 0) {
          const childMenus = generateChildrenMenus(route.children)
          if (childMenus.length > 0) {
            menu.children = childMenus
          }
        }

        // 只有在有子菜单或者当前路由是叶子节点时才添加到菜单列表
        if (menu.children && menu.children.length > 0 || route.meta?.isLeaf) {
          menuList.push(menu)
        }
      }
    })

    // 按sort字段排序
    menuList.sort((a, b) => a.sort - b.sort)
    menuList.forEach(menu => {
      if (menu.children) {
        menu.children.sort((a, b) => a.sort - b.sort)
      }
    })

    menus.value = menuList
  }

  /**
   * 生成子菜单
   * @param routes 子路由表
   */
  const generateChildrenMenus = (routes: RouteRecordRaw[]): Menu[] => {
    const menuList: Menu[] = []

    routes.forEach(route => {
      if (!route.meta?.hidden && route.meta?.title) {
        const menu: Menu = {
          id: route.path || route.name?.toString() || '',
          parentId: route.path?.split('/').slice(0, -1).join('/') || '',
          name: route.meta.title as string,
          path: route.path || '',
          icon: route.meta?.icon as string,
          sort: route.meta?.sort || 999,
          hidden: route.meta?.hidden
        }

        // 如果有子路由，递归生成子菜单
        if (route.children && route.children.length > 0) {
          const childMenus = generateChildrenMenus(route.children)
          if (childMenus.length > 0) {
            menu.children = childMenus
          }
        }

        // 只有在有子菜单或者当前路由是叶子节点时才添加到菜单列表
        if (menu.children && menu.children.length > 0 || route.meta?.isLeaf) {
          menuList.push(menu)
        }
      }
    })

    return menuList
  }

  /**
   * 重置路由和菜单
   */
  const resetRoutes = () => {
    routes.value = []
    addRoutes.value = []
    menus.value = []
  }

  /**
   * 获取面包屑导航
   * @param currentPath 当前路径
   */
  const getBreadcrumb = (currentPath: string): Menu[] => {
    const breadcrumb: Menu[] = []
    const findMenuPath = (menus: Menu[], targetPath: string, path: Menu[] = []): Menu[] | null => {
      for (const menu of menus) {
        const currentPath = [...path, menu]

        if (menu.path === targetPath) {
          return currentPath
        }

        if (menu.children && menu.children.length > 0) {
          const result = findMenuPath(menu.children, targetPath, currentPath)
          if (result) {
            return result
          }
        }
      }
      return null
    }

    const menuPath = findMenuPath(menus.value, currentPath)
    if (menuPath) {
      breadcrumb.push(...menuPath)
    }

    return breadcrumb
  }

  return {
    // 状态
    routes,
    menus,
    addRoutes,

    // 计算属性
    permissionRoutes,
    permissionMenus,

    // 方法
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    generateRoutes,
    resetRoutes,
    getBreadcrumb
  }
})