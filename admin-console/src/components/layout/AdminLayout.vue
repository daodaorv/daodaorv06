<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="admin-sidebar">
        <AdminSidebar />
      </el-aside>

      <!-- 主体内容 -->
      <el-container>
        <!-- 头部 -->
        <el-header height="60px" class="admin-header">
          <AdminHeader />
        </el-header>

        <!-- 面包屑导航（移除最后一级） -->
        <div class="breadcrumb-container" v-if="breadcrumbItems.length > 0">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbItems"
              :key="item.path"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 页面标题区域（新增） -->
        <div class="page-header-container" v-if="showPageHeader">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
          <p v-if="currentPageDescription" class="page-description">
            {{ currentPageDescription }}
          </p>
        </div>

        <!-- 主要内容区域 -->
        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

const route = useRoute()
const appStore = useAppStore()

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '240px'
})

// 面包屑（移除最后一级）
const breadcrumbItems = computed(() => {
  const items = appStore.breadcrumb
  // 如果有多级，移除最后一级（当前页面）
  return items.length > 1 ? items.slice(0, -1) : []
})

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta?.title as string || ''
})

// 当前页面描述
const currentPageDescription = computed(() => {
  return route.meta?.description as string || ''
})

// 是否显示页面标题
const showPageHeader = computed(() => {
  return !route.meta?.hidePageHeader && currentPageTitle.value
})
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
}

.admin-sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.breadcrumb-container {
  background: #f5f5f5;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;
}

// 新增：页面标题区域样式
.page-header-container {
  background: #fff;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #e4e7ed;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }

  .page-description {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.admin-main {
  background: #f5f5f5;
  padding: 20px;
  min-height: calc(100vh - 60px - 45px - 68px); // 减去header、breadcrumb、page-header
}

@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100% !important;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .breadcrumb-container {
    padding: 8px 10px;
  }

  .page-header-container {
    padding: 16px 10px 12px 10px;

    .page-title {
      font-size: 20px;
    }
  }

  .admin-main {
    padding: 10px;
  }
}
</style>