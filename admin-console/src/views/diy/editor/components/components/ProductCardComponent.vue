<!--
  商品卡片组件
-->
<template>
  <div class="product-card-component">
    <div class="card-image">
      <div class="image-placeholder">
        <el-icon><Picture /></el-icon>
      </div>
    </div>
    <div class="card-content">
      <div class="product-name">{{ component.props.name || '商品名称' }}</div>
      <div class="product-price">¥{{ component.props.price || '99.00' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue';
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
}>();
</script>

<style lang="scss" scoped>
.product-card-component {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.card-image {
  width: 100%;
  height: 120px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.card-content {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.product-price {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
}
</style>