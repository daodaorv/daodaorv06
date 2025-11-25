<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="logo-container">
      <router-link to="/dashboard" class="logo-link">
        <img
          v-if="!collapse"
          src="@/assets/images/logo.png"
          alt="叨叨房车"
          class="logo-full"
        />
        <img
          src="@/assets/images/logo-mini.png"
          alt="叨叨房车"
          class="logo-mini"
        />
      </router-link>
    </div>

    <!-- 菜单区域 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapse"
      :unique-opened="true"
      :collapse-transition="false"
      mode="vertical"
      class="sidebar-menu"
    >
      <!-- 核心业务管理 -->
      <el-sub-menu index="business">
        <template #title>
          <el-icon><Briefcase /></el-icon>
          <span>核心业务管理</span>
        </template>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item index="/vehicles">
          <el-icon><Truck /></el-icon>
          <span>车辆管理</span>
        </el-menu-item>

        <el-menu-item index="/stores">
          <el-icon><Shop /></el-icon>
          <span>门店管理</span>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>

        <el-menu-item index="/crowdfunding">
          <el-icon><Money /></el-icon>
          <span>众筹管理</span>
        </el-menu-item>

        <el-menu-item index="/cooperation">
          <el-icon><Handshake /></el-icon>
          <span>合作管理</span>
        </el-menu-item>

        <el-menu-item index="/campsites">
          <el-icon><Tent /></el-icon>
          <span>营地管理</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 营销运营管理 -->
      <el-sub-menu index="marketing">
        <template #title>
          <el-icon><Megaphone /></el-icon>
          <span>营销运营管理</span>
        </template>

        <el-menu-item index="/marketing/pricing">
          <el-icon><PriceTag /></el-icon>
          <span>价格策略</span>
        </el-menu-item>

        <el-menu-item index="/marketing/coupons">
          <el-icon><Ticket /></el-icon>
          <span>优惠券</span>
        </el-menu-item>

        <el-menu-item index="/marketing/activities">
          <el-icon><Party /></el-icon>
          <span>营销活动</span>
        </el-menu-item>

        <el-menu-item index="/community">
          <el-icon><ChatDotRound /></el-icon>
          <span>社区管理</span>
        </el-menu-item>

        <el-menu-item index="/customer-service">
          <el-icon><Service /></el-icon>
          <span>客服管理</span>
        </el-menu-item>

        <el-menu-item index="/profit-sharing">
          <el-icon><Wallet /></el-icon>
          <span>分润管理</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 系统管理 -->
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>

        <el-menu-item index="/employees">
          <el-icon><Avatar /></el-icon>
          <span>员工管理</span>
        </el-menu-item>

        <el-menu-item index="/permissions">
          <el-icon><Lock /></el-icon>
          <span>权限管理</span>
        </el-menu-item>

        <el-menu-item index="/system/config">
          <el-icon><Tools /></el-icon>
          <span>系统配置</span>
        </el-menu-item>

        <el-menu-item index="/system/logs">
          <el-icon><Document /></el-icon>
          <span>审计日志</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 数据分析 -->
      <el-sub-menu index="analytics">
        <template #title>
          <el-icon><DataAnalysis /></el-icon>
          <span>数据分析</span>
        </template>

        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <el-menu-item index="/finance">
          <el-icon><Coin /></el-icon>
          <span>财务管理</span>
        </el-menu-item>

        <el-menu-item index="/reports">
          <el-icon><PieChart /></el-icon>
          <span>数据报表</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'

// 图标组件
import {
  Briefcase,
  User,
  Truck,
  Shop,
  Document,
  Money,
  Handshake,
  Tent,
  Megaphone,
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
  DataAnalysis,
  Odometer,
  Coin,
  PieChart
} from '@element-plus/icons-vue'

interface Props {
  collapse: boolean
}

const props = defineProps<Props>()
const route = useRoute()
const permissionStore = usePermissionStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

// 权限检查
const hasPermission = (permission: string) => {
  return permissionStore.hasPermission(permission)
}
</script>

<style scoped lang="scss">
.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--el-border-color-light);

    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;

      .logo-full {
        height: 32px;
        width: auto;
      }

      .logo-mini {
        height: 32px;
        width: auto;
      }
    }
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;

    :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;
    }

    :deep(.el-menu-item) {
      height: 45px;
      line-height: 45px;

      &.is-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: var(--el-color-primary);
        }
      }
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      .el-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }
  }
}

// 折叠状态样式
.sidebar-container :deep(.el-menu--collapse) {
  .el-sub-menu__title {
    padding-left: 20px !important;
  }

  .el-menu-item {
    padding-left: 20px !important;
  }
}
</style>