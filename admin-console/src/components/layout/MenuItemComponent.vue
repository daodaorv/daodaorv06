<template>
  <!-- 有子菜单：渲染 el-sub-menu -->
  <el-sub-menu v-if="hasChildren" :index="menuItem.path">
    <template #title>
      <el-icon v-if="menuItem.meta?.icon">
        <component :is="menuItem.meta.icon" />
      </el-icon>
      <span>{{ menuItem.meta?.title }}</span>
    </template>

    <!-- 递归渲染子菜单 -->
    <MenuItemComponent
      v-for="child in menuItem.children"
      :key="child.path"
      :menu-item="child"
    />
  </el-sub-menu>

  <!-- 无子菜单：渲染 el-menu-item -->
  <el-menu-item v-else :index="menuItem.path">
    <el-icon v-if="menuItem.meta?.icon">
      <component :is="menuItem.meta.icon" />
    </el-icon>
    <template #title>{{ menuItem.meta?.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/types/permission'

interface Props {
  menuItem: MenuItem
}

const props = defineProps<Props>()

// 判断是否有子菜单
const hasChildren = computed(() => {
  return props.menuItem.children && props.menuItem.children.length > 0
})
</script>
