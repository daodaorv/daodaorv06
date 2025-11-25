<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside
        :width="isCollapse ? '64px' : '240px'"
        class="layout-aside"
      >
        <Sidebar
          :collapse="isCollapse"
          @update:collapse="handleCollapseChange"
        />
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="layout-header">
          <Header
            :collapse="isCollapse"
            @toggle-sidebar="handleToggleSidebar"
          />
        </el-header>

        <!-- 主要内容区 -->
        <el-main class="layout-main">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-container">
            <Breadcrumb />
          </div>

          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Breadcrumb from './components/Breadcrumb.vue'

// 响应式数据
const isCollapse = ref(false)
const route = useRoute()

// 方法
const handleCollapseChange = (collapse: boolean) => {
  isCollapse.value = collapse
}

const handleToggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 监听窗口大小变化
const handleResize = () => {
  if (window.innerWidth < 768) {
    isCollapse.value = true
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化检查
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .el-container {
    height: 100%;
  }

  .layout-aside {
    background-color: var(--el-menu-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    transition: width 0.3s ease;
    overflow-x: hidden;
  }

  .layout-header {
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 0;
    height: 60px;
    line-height: 60px;
  }

  .layout-main {
    background-color: var(--el-bg-color-page);
    padding: 0;
    overflow-y: auto;

    .breadcrumb-container {
      background-color: var(--el-bg-color);
      padding: 12px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .page-content {
      padding: 24px;
      min-height: calc(100vh - 60px - 49px);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .layout-container {
    .layout-main {
      .page-content {
        padding: 16px;
      }
    }
  }
}
</style>