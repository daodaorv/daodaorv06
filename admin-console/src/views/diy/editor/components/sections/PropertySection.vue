<!--
  属性编辑区域组件
-->
<template>
  <div class="property-section">
    <div class="section-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="section-content">
      <div
        v-for="(property, key) in properties"
        :key="key"
        class="property-item"
      >
        <label>{{ property.title || key }}</label>

        <!-- 文本输入 -->
        <el-input
          v-if="property.type === 'text'"
          :model-value="values[key]"
          :placeholder="property.placeholder"
          @update:model-value="handleChange(key, $event)"
        />

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="property.type === 'number'"
          :model-value="values[key]"
          :min="property.min"
          :max="property.max"
          @update:model-value="handleChange(key, $event)"
        />

        <!-- 颜色选择器 -->
        <el-color-picker
          v-else-if="property.type === 'color'"
          :model-value="values[key]"
          @update:model-value="handleChange(key, $event)"
        />

        <!-- 开关 -->
        <el-switch
          v-else-if="property.type === 'boolean'"
          :model-value="values[key]"
          @update:model-value="handleChange(key, $event)"
        />

        <!-- 选择器 -->
        <el-select
          v-else-if="property.type === 'select'"
          :model-value="values[key]"
          :placeholder="property.placeholder"
          @update:model-value="handleChange(key, $event)"
        >
          <el-option
            v-for="option in property.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <!-- 图片选择器 -->
        <div v-else-if="property.type === 'image'" class="image-picker">
          <el-input
            :model-value="values[key]"
            placeholder="请输入图片URL"
            @update:model-value="handleChange(key, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentProperty } from '@/types/diy';

defineProps<{
  title: string;
  properties: Record<string, ComponentProperty>;
  values: Record<string, any>;
}>();

const emit = defineEmits<{
  change: [key: string, value: any];
}>();

const handleChange = (key: string, value: any) => {
  emit('change', key, value);
};
</script>

<style lang="scss" scoped>
.property-section {
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.property-item {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-bottom: 6px;
  }
}

.image-picker {
  .el-input {
    margin-bottom: 8px;
  }
}
</style>