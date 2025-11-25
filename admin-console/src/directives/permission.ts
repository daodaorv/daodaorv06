import type { App, Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const permission: Directive = {
  mounted(el: HTMLElement, binding) {
    checkPermission(el, binding)
  },

  updated(el: HTMLElement, binding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el: HTMLElement, binding: any) {
  const { value } = binding
  const authStore = useAuthStore()

  if (!value) {
    return
  }

  let hasPermission = false

  if (Array.isArray(value)) {
    hasPermission = authStore.hasAnyPermission(value)
  } else if (typeof value === 'string') {
    hasPermission = authStore.hasPermission(value)
  } else if (typeof value === 'object') {
    const { permission, role, operator = 'AND' } = value

    if (permission && role) {
      const hasPerm = authStore.hasPermission(permission)
      const hasRolePermission = authStore.hasRole(role)

      if (operator === 'AND') {
        hasPermission = hasPerm && hasRolePermission
      } else if (operator === 'OR') {
        hasPermission = hasPerm || hasRolePermission
      }
    } else if (permission) {
      hasPermission = authStore.hasPermission(permission)
    } else if (role) {
      hasPermission = authStore.hasRole(role)
    }
  }

  if (!hasPermission) {
    // 移除元素
    el.parentNode?.removeChild(el)
    // 或者隐藏元素（根据需求选择）
    // el.style.display = 'none'
    el.setAttribute('aria-hidden', 'true')
    el.classList.add('permission-hidden')
  } else {
    el.style.display = ''
    el.removeAttribute('aria-hidden')
    el.classList.remove('permission-hidden')
  }
}

export function setupPermissionDirective(app: App) {
  app.directive('permission', permission)
}

export default permission