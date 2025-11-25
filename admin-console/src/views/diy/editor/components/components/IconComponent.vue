<!--
  图标组件
-->
<template>
  <div class="icon-component">
    <el-icon :size="component.props.size || 20" :color="component.props.color">
      <component :is="component.props.icon || 'Star'" />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue';
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
}>();
</script>