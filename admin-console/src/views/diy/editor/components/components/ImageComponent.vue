<!--
  图片组件
-->
<template>
  <div class="image-component" :style="computedStyles">
    <img
      v-if="component.props.src"
      :src="component.props.src"
      :alt="component.props.alt || ''"
      :style="imageStyles"
    />
    <div v-else class="image-placeholder">
      <el-icon size="32">
        <Picture />
      </el-icon>
      <span>点击上传图片</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';
import type { BaseComponent } from '@/types/diy';

defineProps<{
  component: BaseComponent;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  update: [updates: Partial<BaseComponent>];
}>();

const computedStyles = computed(() => ({
  display: 'block',
  width: '100px',
  height: '100px'
}));

const imageStyles = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}));
</script>

<style lang="scss" scoped>
.image-component {
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
  font-size: 12px;

  .el-icon {
    margin-bottom: 8px;
  }
}
</style>