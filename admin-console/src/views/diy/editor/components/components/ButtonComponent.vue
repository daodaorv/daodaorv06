<!--
  按钮组件
-->
<template>
  <div class="button-component">
    <el-button :type="component.props.type || 'primary'" :size="component.props.size || 'default'">
      {{ component.props.text || '按钮' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
}>();
</script>