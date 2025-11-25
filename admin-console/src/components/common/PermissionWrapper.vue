<template>
  <div v-if="hasAccess" class="permission-wrapper">
    <slot />
  </div>
  <div v-else-if="$slots.fallback" class="permission-fallback">
    <slot name="fallback" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  permission?: string | string[]
  role?: string | string[]
  operator?: 'AND' | 'OR'
  fallback?: boolean
  mode?: 'remove' | 'disable' | 'hide'
}

const props = withDefaults(defineProps<Props>(), {
  operator: 'AND',
  fallback: false,
  mode: 'remove'
})

const authStore = useAuthStore()

const hasAccess = computed(() => {
  const { permission, role, operator } = props

  if (!permission && !role) {
    return true
  }

  let hasPermission = true
  let hasRolePermission = true

  if (permission) {
    if (Array.isArray(permission)) {
      hasPermission = authStore.hasAnyPermission(permission)
    } else {
      hasPermission = authStore.hasPermission(permission)
    }
  }

  if (role) {
    if (Array.isArray(role)) {
      hasRolePermission = authStore.hasAnyRole(role)
    } else {
      hasRolePermission = authStore.hasRole(role)
    }
  }

  if (permission && role) {
    return operator === 'AND' ? hasPermission && hasRolePermission : hasPermission || hasRolePermission
  }

  if (permission) {
    return hasPermission
  }

  if (role) {
    return hasRolePermission
  }

  return true
})
</script>

<style scoped lang="scss">
.permission-wrapper {
  display: contents;
}

.permission-fallback {
  display: contents;
}
</style>