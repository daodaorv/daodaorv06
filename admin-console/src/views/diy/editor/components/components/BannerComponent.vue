<!--
  轮播图组件
-->
<template>
  <div class="banner-component">
    <el-carousel :height="component.props.height + 'px' || '200px'">
      <el-carousel-item v-for="i in 3" :key="i">
        <div class="banner-placeholder">
          <span>轮播图 {{ i }}</span>
        </div>
      </el-carousel-item>
    </el-carousel>
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

<style lang="scss" scoped>
.banner-component {
  width: 100%;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}
</style>