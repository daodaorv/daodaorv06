import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { ElMessage } from 'element-plus'

// 白名单路由（不需要登录验证的路由）
const whiteList = ['/login', '/403', '/404', '/500']

export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    // 显示进度条
    if (typeof window !== 'undefined') {
      window.$NProgress?.start()
    }

    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 叨叨房车管理系统`
    }

    // 检查是否在白名单中
    if (whiteList.includes(to.path) || to.meta?.noAuth) {
      next()
      return
    }

    // 检查是否已登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }

    // 检查权限
    if (to.meta?.permission) {
      if (!authStore.hasPermission(to.meta.permission)) {
        ElMessage.error('没有权限访问该页面')
        next('/403')
        return
      }
    }

    // 检查角色
    if (to.meta?.roles) {
      if (!authStore.hasRole(to.meta.roles)) {
        ElMessage.error('没有权限访问该页面')
        next('/403')
        return
      }
    }

    // 如果路由未加载，加载路由
    if (permissionStore.permissionRoutes.length === 0) {
      try {
        // 生成路由
        const accessRoutes = await permissionStore.generateRoutes(authStore.userRoles)

        // 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })

        // 添加404路由
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          redirect: '/404',
          meta: {
            hidden: true,
            noAuth: true
          }
        })

        // 重新导航
        next({ ...to, replace: true })
      } catch (error) {
        console.error('路由加载失败:', error)
        ElMessage.error('路由加载失败')
        await authStore.logout()
        next('/login')
      }
    } else {
      next()
    }
  })

  // 全局后置守卫
  router.afterEach((to, from) => {
    // 隐藏进度条
    if (typeof window !== 'undefined') {
      window.$NProgress?.done()
    }

    // 记录路由访问日志
    if (to.path !== from.path && authStore.isAuthenticated) {
      // 这里可以添加访问日志记录逻辑
      console.log(`Route changed: ${from.path} -> ${to.path}`)
    }
  })

  // 全局错误守卫
  router.onError((error) => {
    console.error('Router error:', error)

    if (typeof window !== 'undefined') {
      window.$NProgress?.done()
    }

    ElMessage.error('页面加载失败')
  })
}

/**
 * 检查路由权限
 */
export function checkRoutePermission(to: any, authStore: any): boolean {
  // 检查是否在白名单中
  if (whiteList.includes(to.path) || to.meta?.noAuth) {
    return true
  }

  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    return false
  }

  // 检查权限
  if (to.meta?.permission && !authStore.hasPermission(to.meta.permission)) {
    return false
  }

  // 检查角色
  if (to.meta?.roles && !authStore.hasRole(to.meta.roles)) {
    return false
  }

  return true
}