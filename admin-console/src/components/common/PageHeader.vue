<template>
  <div class="page-header">
    <div class="page-header-content">
      <el-button
        v-if="showBack"
        link
        type="primary"
        class="back-button"
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div class="page-header-info">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.extra" class="page-header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    showBack?: boolean
  }>(),
  {
    description: '',
    showBack: false,
  }
)

const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .page-header-content {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .back-button {
      margin-top: 4px;
      font-size: 14px;
    }

    .page-header-info {
      flex: 1;

      .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        line-height: 28px;
      }

      .page-description {
        margin: 8px 0 0;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
      }
    }
  }

  .page-header-extra {
    margin-left: 20px;
  }
}
</style>
