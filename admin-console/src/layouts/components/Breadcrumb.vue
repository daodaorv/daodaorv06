<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item
      v-for="item in breadcrumbList"
      :key="item.path"
      :to="item.path ? { path: item.path } : undefined"
      :class="{ 'no-link': !item.path }"
    >
      <el-icon v-if="item.icon" class="breadcrumb-icon">
        <component :is="item.icon" />
      </el-icon>
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'

// 图标组件
import {
  House,
  User,
  Truck,
  Shop,
  Document,
  Money,
  Handshake,
  Tent,
  PriceTag,
  Ticket,
  Party,
  ChatDotRound,
  Service,
  Wallet,
  Setting,
  Avatar,
  Lock,
  Tools,
  Odometer,
  Coin,
  PieChart
} from '@element-plus/icons-vue'

interface BreadcrumbItem {
  title: string
  path?: string
  icon?: any
}

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

// 图标映射
const iconMap: Record<string, any> = {
  dashboard: House,
  users: User,
  vehicles: Truck,
  stores: Shop,
  orders: Document,
  crowdfunding: Money,
  cooperation: Handshake,
  campsites: Tent,
  marketing: Megaphone,
  pricing: PriceTag,
  coupons: Ticket,
  activities: Party,
  community: ChatDotRound,
  'customer-service': Service,
  'profit-sharing': Wallet,
  employees: Avatar,
  permissions: Lock,
  'system-config': Tools,
  finance: Coin,
  reports: PieChart
}

// 面包屑导航列表
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  const breadcrumbs: BreadcrumbItem[] = []

  // 添加首页
  breadcrumbs.push({
    title: '首页',
    path: '/dashboard',
    icon: House
  })

  // 解析当前路由路径
  const pathSegments = route.path.split('/').filter(Boolean)
  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // 查找匹配的路由配置
    const matchedRoute = router.getRoutes().find(r => r.path === currentPath)

    if (matchedRoute && matchedRoute.meta?.title) {
      const title = matchedRoute.meta.title as string

      // 检查权限
      if (matchedRoute.meta?.permission) {
        if (!permissionStore.hasPermission(matchedRoute.meta.permission as string)) {
          return
        }
      }

      breadcrumbs.push({
        title,
        path: index === pathSegments.length - 1 ? undefined : currentPath,
        icon: iconMap[segment]
      })
    } else {
      // 如果没有找到路由配置，尝试从路径名称推断
      const inferredTitle = getInferredTitle(segment)
      if (inferredTitle) {
        breadcrumbs.push({
          title: inferredTitle,
          path: index === pathSegments.length - 1 ? undefined : currentPath
        })
      }
    }
  })

  return breadcrumbs
})

// 从路径推断标题
const getInferredTitle = (segment: string): string | null => {
  const titleMap: Record<string, string> = {
    create: '新建',
    edit: '编辑',
    detail: '详情',
    list: '列表',
    settings: '设置',
    profile: '个人中心',
    'price-strategy': '价格策略',
    'marketing-activities': '营销活动'
  }

  return titleMap[segment] || null
}
</script>

<style scoped lang="scss">
.breadcrumb {
  .el-breadcrumb-item {
    .breadcrumb-icon {
      margin-right: 4px;
      font-size: 14px;
    }

    &:not(.no-link) {
      &:hover {
        color: var(--el-color-primary);
        cursor: pointer;
      }
    }

    &.no-link {
      cursor: default;
      font-weight: 500;
    }

    // 最后一项样式
    &:last-child {
      .el-breadcrumb__inner {
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
    }
  }

  // 面包屑分隔符样式
  :deep(.el-breadcrumb__separator) {
    color: var(--el-text-color-placeholder);
    margin: 0 8px;
  }
}
</style>