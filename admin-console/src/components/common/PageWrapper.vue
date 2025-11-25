<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title">
        <el-space>
          <el-button
            type="text"
            @click="$router.back()"
            class="back-button"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <h2>{{ title }}</h2>
        </el-space>
      </div>

      <div class="page-actions">
        <el-space>
          <el-button v-if="showRefresh" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>

          <el-button
            v-if="showExport"
            type="success"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>

          <slot name="actions" />
        </el-space>
      </div>
    </div>

    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Refresh, Download } from '@element-plus/icons-vue'

interface Props {
  title: string
  showRefresh?: boolean
  showExport?: boolean
}

interface Emits {
  (e: 'refresh'): void
  (e: 'export'): void
}

withDefaults(defineProps<Props>(), {
  showRefresh: true,
  showExport: false
})

const emit = defineEmits<Emits>()

const handleRefresh = () => {
  emit('refresh')
}

const handleExport = () => {
  emit('export')
}
</script>

<style scoped lang="scss">
.page-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .page-title {
      .back-button {
        padding: 4px;
        margin-right: 8px;
        border-radius: 4px;

        &:hover {
          background-color: var(--el-fill-color-light);
        }
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .page-actions {
      :deep(.el-space) {
        align-items: center;
      }
    }
  }

  .page-content {
    flex: 1;
    overflow-y: auto;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-wrapper {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .page-actions {
        width: 100%;

        :deep(.el-space) {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>