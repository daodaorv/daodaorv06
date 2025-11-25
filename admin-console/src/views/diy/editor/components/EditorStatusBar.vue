<!--
  编辑器状态栏
  显示缩放比例、页面尺寸等信息
-->
<template>
  <div class="editor-status-bar">
    <div class="status-left">
      <div class="status-item">
        <span class="label">缩放:</span>
        <el-select
          v-model="currentZoom"
          size="small"
          style="width: 80px"
          @change="handleZoomChange"
        >
          <el-option label="25%" :value="0.25" />
          <el-option label="50%" :value="0.5" />
          <el-option label="75%" :value="0.75" />
          <el-option label="100%" :value="1" />
          <el-option label="125%" :value="1.25" />
          <el-option label="150%" :value="1.5" />
          <el-option label="200%" :value="2" />
        </el-select>
      </div>

      <div class="status-item">
        <span class="label">尺寸:</span>
        <span>{{ canvasSize.width }} × {{ canvasSize.height }}</span>
      </div>

      <div class="status-item">
        <span class="label">组件:</span>
        <span>{{ componentCount }}</span>
      </div>
    </div>

    <div class="status-right">
      <div v-if="selectedComponentInfo" class="status-item">
        <span class="label">选中:</span>
        <span>{{ selectedComponentInfo }}</span>
      </div>

      <div v-if="lastSaveTime" class="status-item">
        <span class="label">保存:</span>
        <span>{{ formatTime(lastSaveTime) }}</span>
      </div>

      <div class="status-item">
        <el-button-group size="small">
          <el-tooltip content="重置缩放 (Ctrl+0)" placement="top">
            <el-button :icon="ScaleToOriginal" @click="handleZoomReset" />
          </el-tooltip>
          <el-tooltip content="适应屏幕" placement="top">
            <el-button :icon="FullScreen" @click="handleFitToScreen" />
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ScaleToOriginal, FullScreen } from '@element-plus/icons-vue';
import { useDiyStore } from '@/stores/diy';

const props = defineProps<{
  zoom: number;
}>();

const emit = defineEmits<{
  zoomChange: [zoom: number];
}>();

const diyStore = useDiyStore();

// 响应式数据
const currentZoom = computed({
  get: () => props.zoom,
  set: (value: number) => emit('zoomChange', value)
});

// 计算属性
const canvasSize = computed(() => diyStore.editorState.canvasSize);

const componentCount = computed(() => {
  const countComponents = (components: any[]): number => {
    return components.reduce((count, component) => {
      const childCount = component.children ? countComponents(component.children) : 0;
      return count + 1 + childCount;
    }, 0);
  };

  return diyStore.editorState.currentPage?.components
    ? countComponents(diyStore.editorState.currentPage.components)
    : 0;
});

const selectedComponentInfo = computed(() => {
  const component = diyStore.selectedComponent;
  if (!component) return null;

  const schema = getComponentSchemaName(component.type);
  const width = component.styles.width || 'auto';
  const height = component.styles.height || 'auto';

  return `${schema} (${width} × ${height})`;
});

const lastSaveTime = computed(() => {
  // 这里应该从状态中获取最后保存时间
  // 暂时返回当前时间作为示例
  return new Date();
});

// 方法
const handleZoomChange = (zoom: number) => {
  emit('zoomChange', zoom);
};

const handleZoomReset = () => {
  emit('zoomChange', 1);
};

const handleFitToScreen = () => {
  // 计算适应屏幕的缩放比例
  const viewportWidth = window.innerWidth - 280 - 320; // 减去左右面板宽度
  const viewportHeight = window.innerHeight - 56 - 32; // 减去工具栏和状态栏高度

  const canvasWidth = canvasSize.value.width;
  const canvasHeight = canvasSize.value.height;

  const scaleX = (viewportWidth * 0.8) / canvasWidth;
  const scaleY = (viewportHeight * 0.8) / canvasHeight;

  const fitZoom = Math.min(scaleX, scaleY, 1); // 不超过100%

  emit('zoomChange', Math.max(0.1, Math.min(3, fitZoom)));
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    return date.toLocaleDateString();
  }
};

const getComponentSchemaName = (type: string): string => {
  const componentNames: Record<string, string> = {
    text: '文本',
    image: '图片',
    button: '按钮',
    icon: '图标',
    banner: '轮播图',
    productCard: '商品卡片',
    container: '容器'
  };

  return componentNames[type] || type;
};
</script>

<style lang="scss" scoped>
.editor-status-bar {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;

  .label {
    color: var(--el-text-color-secondary);
  }

  span:not(.label) {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    color: var(--el-text-color-primary);
  }
}

.el-select {
  :deep(.el-input__inner) {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
  }
}

.el-button-group {
  :deep(.el-button) {
    padding: 4px 6px;
  }
}
</style>