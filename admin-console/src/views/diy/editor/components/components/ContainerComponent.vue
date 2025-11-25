<!--
  容器组件
-->
<template>
  <div class="container-component">
    <div class="container-content">
      <!-- 子组件渲染 -->
      <ComponentRenderer
        v-for="(child, index) in component.children"
        :key="child.id"
        :component="child"
        :selected="false"
        :is-preview="isPreview"
        @select="$emit('selectChild', $event)"
        @update="$emit('updateChild', $event.id, $event.updates)"
        @delete="$emit('deleteChild', $event)"
        @add-child="$emit('addChild', $event.component, $event.index)"
      />

      <!-- 空状态 -->
      <div v-if="!component.children || component.children.length === 0" class="empty-state">
        <span>拖拽组件到这里</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ComponentRenderer from '../ComponentRenderer.vue';
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
  selectChild: [child: BaseComponent];
  updateChild: [childId: string, updates: Partial<BaseComponent>];
  deleteChild: [childId: string];
  addChild: [child: BaseComponent, index?: number];
}>();
</script>

<style lang="scss" scoped>
.container-component {
  min-height: 100px;
  border: 2px dashed var(--el-border-color-light);
  border-radius: 6px;
  padding: 8px;
}

.container-content {
  min-height: 84px;
}

.empty-state {
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>