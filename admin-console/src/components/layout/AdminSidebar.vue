<template>
  <div class="admin-sidebar">
    <!-- Logo -->
    <div class="logo-container">
      <div class="logo">🚐</div>
      <h1 v-show="!collapsed" class="logo-text">叨叨房车</h1>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :unique-opened="true"
      :router="true"
      background-color="#fff"
      text-color="#303133"
      active-text-color="#409eff"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <el-sub-menu
          v-if="route.children && route.children.length > 0"
          :index="route.path"
        >
          <template #title>
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta?.title }}</span>
          </template>

          <el-menu-item
            v-for="child in route.children.filter(item => !item.meta?.hidden)"
            :key="child.path"
            :index="child.path"
          >
            <el-icon v-if="child.meta?.icon">
              <component :is="child.meta.icon" />
            </el-icon>
            <template #title>{{ child.meta?.title }}</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item v-else :index="route.path">
          <el-icon v-if="route.meta?.icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

interface MenuRoute {
  path: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
  }
  children?: MenuRoute[]
}

const route = useRoute()
const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 菜单路由配置
const menuRoutes = computed<MenuRoute[]>(() => {
  return [
    {
      path: '/dashboard',
      meta: { title: '工作台', icon: 'House' },
    },
    {
      path: '/vehicles',
      meta: { title: '车辆管理', icon: 'Van' },
      children: [
        {
          path: '/vehicles',
          meta: { title: '车辆列表' },
        },
        {
          path: '/vehicles/create',
          meta: { title: '添加车辆', hidden: true },
        },
      ],
    },
    {
      path: '/orders',
      meta: { title: '订单管理', icon: 'List' },
    },
    {
      path: '/users',
      meta: { title: '用户管理', icon: 'User' },
    },
    {
      path: '/payments',
      meta: { title: '财务管理', icon: 'Money' },
    },
    {
      path: '/marketing',
      meta: { title: '营销管理', icon: 'Promotion' },
      children: [
        {
          path: '/coupons',
          meta: { title: '优惠券管理' },
        },
        {
          path: '/reviews',
          meta: { title: '评价管理' },
        },
      ],
    },
    {
      path: '/settings',
      meta: { title: '系统设置', icon: 'Setting' },
    },
  ]
})
</script>

<style scoped lang="scss">
.admin-sidebar {
  height: 100%;
  overflow: hidden;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #e4e7ed;
    padding: 0 20px;

    .logo {
      font-size: 32px;
    }

    .logo-text {
      margin-left: 12px;
      font-size: 18px;
      font-weight: 600;
      color: #1890ff;
      white-space: nowrap;
    }
  }

  .el-menu {
    border-right: none;
    height: calc(100% - 60px);
    overflow-y: auto;

    :deep(.el-menu-item) {
      height: 48px;
      line-height: 48px;
    }

    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
    }
  }
}
</style>