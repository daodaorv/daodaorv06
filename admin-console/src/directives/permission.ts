import type { DirectiveBinding } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * 权限指令
 * 用法：v-permission="'vehicle:create'"
 * 或：v-permission="['vehicle:create', 'vehicle:update']"
 */
export const permission = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value) {
      throw new Error('权限指令需要提供权限代码');
    }

    // 支持单个权限或权限数组
    const permissions = Array.isArray(value) ? value : [value];

    // 检查是否拥有任意一个权限
    const hasPermission = permissions.some(permission =>
      userStore.hasPermission(permission)
    );

    // 如果没有权限，移除元素
    if (!hasPermission) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 角色指令
 * 用法：v-role="'admin_super'"
 * 或：v-role="['admin_super', 'admin_platform']"
 */
export const role = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const userStore = useUserStore();

    if (!value) {
      throw new Error('角色指令需要提供角色代码');
    }

    // 支持单个角色或角色数组
    const roles = Array.isArray(value) ? value : [value];

    // 检查是否拥有任意一个角色
    const hasRole = roles.some(role =>
      userStore.hasRole(role)
    );

    // 如果没有角色，移除元素
    if (!hasRole) {
      el.parentNode?.removeChild(el);
    }
  },
};
