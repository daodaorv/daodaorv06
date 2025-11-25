<!--
  文本组件
  在编辑器中渲染文本内容
-->
<template>
  <div class="text-component" :style="computedStyles">
    {{ component.props.content || '文本内容' }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
}>();

const computedStyles = computed(() => ({
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.5',
  textAlign: 'left'
}));
</script>

<style lang="scss" scoped>
.text-component {
  display: inline-block;
  word-wrap: break-word;
  min-height: 20px;
}
</style>