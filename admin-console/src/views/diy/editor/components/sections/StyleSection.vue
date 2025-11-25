<!--
  样式编辑区域组件
-->
<template>
  <div class="style-section">
    <div class="section-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="section-content">
      <!-- 布局样式 -->
      <div class="style-group">
        <h5>布局</h5>
        <div class="style-row">
          <div class="style-item">
            <label>显示方式</label>
            <el-select
              :model-value="styles.display"
              placeholder="默认"
              @update:model-value="handleChange('display', $event)"
            >
              <el-option label="块级" value="block" />
              <el-option label="内联" value="inline" />
              <el-option label="内联块" value="inline-block" />
              <el-option label="弹性" value="flex" />
              <el-option label="无" value="none" />
            </el-select>
          </div>

          <div class="style-item">
            <label>定位方式</label>
            <el-select
              :model-value="styles.position"
              placeholder="默认"
              @update:model-value="handleChange('position', $event)"
            >
              <el-option label="默认" value="static" />
              <el-option label="相对" value="relative" />
              <el-option label="绝对" value="absolute" />
              <el-option label="固定" value="fixed" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 尺寸样式 -->
      <div class="style-group">
        <h5>尺寸</h5>
        <div class="style-row">
          <div class="style-item">
            <label>宽度</label>
            <el-input
              :model-value="styles.width"
              placeholder="auto"
              @update:model-value="handleChange('width', $event)"
            />
          </div>

          <div class="style-item">
            <label>高度</label>
            <el-input
              :model-value="styles.height"
              placeholder="auto"
              @update:model-value="handleChange('height', $event)"
            />
          </div>
        </div>

        <div v-if="styles.position === 'absolute'" class="style-row">
          <div class="style-item">
            <label>左边距</label>
            <el-input
              :model-value="styles.left"
              placeholder="auto"
              @update:model-value="handleChange('left', $event)"
            />
          </div>

          <div class="style-item">
            <label>上边距</label>
            <el-input
              :model-value="styles.top"
              placeholder="auto"
              @update:model-value="handleChange('top', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 外边距 -->
      <div class="style-group">
        <h5>外边距</h5>
        <div class="style-row">
          <div class="style-item">
            <label>上边距</label>
            <el-input-number
              :model-value="parseValue(styles.marginTop || styles.margin)"
              :min="0"
              @update:model-value="handleMarginChange('marginTop', $event)"
            />
          </div>

          <div class="style-item">
            <label>右边距</label>
            <el-input-number
              :model-value="parseValue(styles.marginRight || styles.margin)"
              :min="0"
              @update:model-value="handleMarginChange('marginRight', $event)"
            />
          </div>

          <div class="style-item">
            <label>下边距</label>
            <el-input-number
              :model-value="parseValue(styles.marginBottom || styles.margin)"
              :min="0"
              @update:model-value="handleMarginChange('marginBottom', $event)"
            />
          </div>

          <div class="style-item">
            <label>左边距</label>
            <el-input-number
              :model-value="parseValue(styles.marginLeft || styles.margin)"
              :min="0"
              @update:model-value="handleMarginChange('marginLeft', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 内边距 -->
      <div class="style-group">
        <h5>内边距</h5>
        <div class="style-row">
          <div class="style-item">
            <label>上内边距</label>
            <el-input-number
              :model-value="parseValue(styles.paddingTop || styles.padding)"
              :min="0"
              @update:model-value="handlePaddingChange('paddingTop', $event)"
            />
          </div>

          <div class="style-item">
            <label>右内边距</label>
            <el-input-number
              :model-value="parseValue(styles.paddingRight || styles.padding)"
              :min="0"
              @update:model-value="handlePaddingChange('paddingRight', $event)"
            />
          </div>

          <div class="style-item">
            <label>下内边距</label>
            <el-input-number
              :model-value="parseValue(styles.paddingBottom || styles.padding)"
              :min="0"
              @update:model-value="handlePaddingChange('paddingBottom', $event)"
            />
          </div>

          <div class="style-item">
            <label>左内边距</label>
            <el-input-number
              :model-value="parseValue(styles.paddingLeft || styles.padding)"
              :min="0"
              @update:model-value="handlePaddingChange('paddingLeft', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 文本样式 -->
      <div v-if="componentType === 'text' || componentType === 'button'" class="style-group">
        <h5>文本</h5>
        <div class="style-row">
          <div class="style-item">
            <label>字体大小</label>
            <el-input-number
              :model-value="parseValue(styles.fontSize)"
              :min="8"
              :max="100"
              @update:model-value="handleChange('fontSize', $event + 'px')"
            />
          </div>

          <div class="style-item">
            <label>字体粗细</label>
            <el-select
              :model-value="styles.fontWeight"
              placeholder="默认"
              @update:model-value="handleChange('fontWeight', $event)"
            >
              <el-option label="正常" value="normal" />
              <el-option label="粗体" value="bold" />
              <el-option label="更粗" value="bolder" />
              <el-option label="更细" value="lighter" />
              <el-option label="100" value="100" />
              <el-option label="200" value="200" />
              <el-option label="300" value="300" />
              <el-option label="400" value="400" />
              <el-option label="500" value="500" />
              <el-option label="600" value="600" />
              <el-option label="700" value="700" />
              <el-option label="800" value="800" />
              <el-option label="900" value="900" />
            </el-select>
          </div>

          <div class="style-item">
            <label>文本颜色</label>
            <el-color-picker
              :model-value="styles.color"
              @update:model-value="handleChange('color', $event)"
            />
          </div>

          <div class="style-item">
            <label>文本对齐</label>
            <el-select
              :model-value="styles.textAlign"
              placeholder="默认"
              @update:model-value="handleChange('textAlign', $event)"
            >
              <el-option label="左对齐" value="left" />
              <el-option label="居中" value="center" />
              <el-option label="右对齐" value="right" />
              <el-option label="两端对齐" value="justify" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 背景样式 -->
      <div class="style-group">
        <h5>背景</h5>
        <div class="style-row">
          <div class="style-item">
            <label>背景颜色</label>
            <el-color-picker
              :model-value="styles.backgroundColor"
              @update:model-value="handleChange('backgroundColor', $event)"
            />
          </div>

          <div class="style-item">
            <label>背景图片</label>
            <el-input
              :model-value="styles.backgroundImage"
              placeholder="请输入图片URL"
              @update:model-value="handleBackgroundImage($event)"
            />
          </div>
        </div>
      </div>

      <!-- 边框样式 -->
      <div class="style-group">
        <h5>边框</h5>
        <div class="style-row">
          <div class="style-item">
            <label>边框圆角</label>
            <el-input-number
              :model-value="parseValue(styles.borderRadius)"
              :min="0"
              @update:model-value="handleChange('borderRadius', $event + 'px')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Styles {
  [key: string]: any;
}

const props = defineProps<{
  title: string;
  styles: Styles;
  componentType: string;
}>();

const emit = defineEmits<{
  change: [key: string, value: any];
}>();

// 解析数值，移除px等单位
const parseValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value.replace('px', ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const handleChange = (key: string, value: any) => {
  emit('change', key, value);
};

const handleMarginChange = (key: string, value: number) => {
  emit('change', key, value + 'px');
};

const handlePaddingChange = (key: string, value: number) => {
  emit('change', key, value + 'px');
};

const handleBackgroundImage = (value: string) => {
  emit('change', 'backgroundImage', value ? `url(${value})` : '');
};
</script>

<style lang="scss" scoped>
.style-section {
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

.style-group {
  margin-bottom: 16px;

  h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}

.style-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.style-item {
  label {
    display: block;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-bottom: 4px;
  }

  .el-input,
  .el-input-number,
  .el-select,
  .el-color-picker {
    width: 100%;
  }
}
</style>