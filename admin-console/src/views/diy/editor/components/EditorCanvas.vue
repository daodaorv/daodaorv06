<!--
  编辑器画布
  显示页面配置，支持拖拽、选择、编辑组件
-->
<template>
  <div class="editor-canvas-container">
    <!-- 画布工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <el-select v-model="deviceType" size="small" style="width: 100px">
          <el-option label="手机" value="mobile" />
          <el-option label="平板" value="tablet" />
          <el-option label="桌面" value="desktop" />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button-group size="small">
          <el-button :icon="ZoomOut" @click="handleZoomOut" />
          <el-button>{{ Math.round(zoom * 100) }}%</el-button>
          <el-button :icon="ZoomIn" @click="handleZoomIn" />
          <el-button :icon="ScaleToOriginal" @click="handleZoomReset" />
        </el-button-group>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-wrapper" ref="canvasWrapper">
      <div
        class="canvas-viewport"
        @scroll="handleScroll"
      >
        <div
          class="canvas-container"
          :style="canvasStyle"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <!-- 空白状态 -->
          <div v-if="!pageConfig || !pageConfig.components.length" class="empty-state">
            <el-icon size="48" class="empty-icon">
              <DocumentAdd />
            </el-icon>
            <p>从左侧拖拽组件到这里开始设计</p>
          </div>

          <!-- 组件渲染 -->
          <div v-else class="page-content">
            <ComponentRenderer
              v-for="(component, index) in pageConfig.components"
              :key="component.id"
              :component="component"
              :selected="selectedComponentId === component.id"
              :is-preview="false"
              @select="$emit('selectComponent', component)"
              @update="(updates) => $emit('updateComponent', component.id, updates)"
              @delete="() => $emit('deleteComponent', component.id)"
              @move="(targetParentId, targetIndex) => $emit('moveComponent', component.id, targetParentId, targetIndex)"
              @add-child="(child, index) => $emit('addComponent', child, component.id, index)"
            />
          </div>

          <!-- 拖拽指示器 -->
          <div
            v-if="dragState.isDraggingOver"
            class="drop-indicator"
            :style="dropIndicatorStyle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ZoomOut, ZoomIn, ScaleToOriginal, DocumentAdd } from '@element-plus/icons-vue';
import ComponentRenderer from './ComponentRenderer.vue';

import type { PageConfiguration, DragItem, DropTarget } from '@/types/diy';

interface DragState {
  isDraggingOver: boolean;
  dropPosition: 'before' | 'after' | 'inside' | null;
  targetElement: HTMLElement | null;
}

const props = defineProps<{
  pageConfig: PageConfiguration | null;
  selectedComponentId: string | null;
  zoom: number;
}>();

const emit = defineEmits<{
  selectComponent: [component: any];
  updateComponent: [id: string, updates: any];
  deleteComponent: [id: string];
  moveComponent: [componentId: string, targetParentId?: string, targetIndex?: number];
  addComponent: [component: any, parentId?: string, index?: number];
  zoomChange: [zoom: number];
}>();

// 响应式数据
const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('mobile');
const canvasWrapper = ref<HTMLElement>();
const dragState = ref<DragState>({
  isDraggingOver: false,
  dropPosition: null,
  targetElement: null
});

// 设备尺寸配置
const deviceSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 }
};

// 计算属性
const currentDeviceSize = computed(() => deviceSizes[deviceType.value]);

const canvasStyle = computed(() => ({
  transform: `scale(${props.zoom})`,
  width: `${currentDeviceSize.value.width}px`,
  minHeight: `${currentDeviceSize.value.height}px`,
  transformOrigin: 'center top'
}));

const dropIndicatorStyle = computed(() => {
  if (!dragState.value.targetElement) {
    return { display: 'none' };
  }

  const rect = dragState.value.targetElement.getBoundingClientRect();
  const canvasRect = canvasWrapper.value?.getBoundingClientRect();

  if (!canvasRect) {
    return { display: 'none' };
  }

  const relativeTop = rect.top - canvasRect.top;
  const relativeLeft = rect.left - canvasRect.left;

  const baseStyle = {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: '#007aff',
    transition: 'all 0.2s ease'
  };

  switch (dragState.value.dropPosition) {
    case 'before':
      return {
        ...baseStyle,
        top: `${relativeTop / props.zoom}px`,
        left: `${relativeLeft / props.zoom}px`,
        width: `${rect.width / props.zoom}px`,
        height: '2px'
      };
    case 'after':
      return {
        ...baseStyle,
        top: `${(relativeTop + rect.height) / props.zoom}px`,
        left: `${relativeLeft / props.zoom}px`,
        width: `${rect.width / props.zoom}px`,
        height: '2px'
      };
    case 'inside':
      return {
        ...baseStyle,
        top: `${relativeTop / props.zoom}px`,
        left: `${relativeLeft / props.zoom}px`,
        width: `${rect.width / props.zoom}px`,
        height: `${rect.height / props.zoom}px`,
        border: '2px dashed #007aff',
        backgroundColor: 'rgba(0, 122, 255, 0.1)'
      };
    default:
      return { display: 'none' };
  }
});

// 方法
const handleZoomIn = () => {
  const newZoom = Math.min(props.zoom + 0.1, 3);
  emit('zoomChange', newZoom);
};

const handleZoomOut = () => {
  const newZoom = Math.max(props.zoom - 0.1, 0.1);
  emit('zoomChange', newZoom);
};

const handleZoomReset = () => {
  emit('zoomChange', 1);
};

const handleScroll = () => {
  // 清除拖拽状态
  if (dragState.value.isDraggingOver) {
    dragState.value = {
      isDraggingOver: false,
      dropPosition: null,
      targetElement: null
    };
  }
};

// 拖拽事件处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'copy';

  const target = event.target as HTMLElement;
  const componentElement = target.closest('[data-component-id]');

  if (componentElement) {
    const rect = componentElement.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const relativeY = event.clientY;

    dragState.value = {
      isDraggingOver: true,
      dropPosition: relativeY < midY ? 'before' : 'after',
      targetElement: componentElement
    };
  } else {
    // 检查是否在容器内
    const canvasContainer = event.currentTarget as HTMLElement;
    const rect = canvasContainer.getBoundingClientRect();
    const pageContent = canvasContainer.querySelector('.page-content');

    if (pageContent) {
      dragState.value = {
        isDraggingOver: true,
        dropPosition: 'inside',
        targetElement: pageContent as HTMLElement
      };
    }
  }
};

const handleDragLeave = (event: DragEvent) => {
  // 只有当离开整个画布区域时才清除状态
  const canvasContainer = event.currentTarget as HTMLElement;
  if (!canvasContainer.contains(event.relatedTarget as Node)) {
    dragState.value = {
      isDraggingOver: false,
      dropPosition: null,
      targetElement: null
    };
  }
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();

  try {
    const data = JSON.parse(event.dataTransfer!.getData('application/json')) as DragItem;

    // 创建新组件
    const newComponent = {
      ...data.componentData,
      id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // 确定插入位置
    let targetParentId: string | undefined;
    let insertIndex: number | undefined;

    const target = event.target as HTMLElement;
    const componentElement = target.closest('[data-component-id]');

    if (componentElement && dragState.value.dropPosition !== 'inside') {
      // 插入到现有组件的前面或后面
      const targetComponentId = componentElement.getAttribute('data-component-id');
      const components = props.pageConfig?.components || [];
      const targetIndex = components.findIndex(c => c.id === targetComponentId);

      if (targetIndex !== -1) {
        insertIndex = dragState.value.dropPosition === 'before'
          ? targetIndex
          : targetIndex + 1;
      }
    }

    emit('addComponent', newComponent, targetParentId, insertIndex);
  } catch (error) {
    console.error('拖拽处理失败:', error);
  }

  // 清除拖拽状态
  dragState.value = {
    isDraggingOver: false,
    dropPosition: null,
    targetElement: null
  };
};

onMounted(() => {
  // 键盘事件处理
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleZoomReset();
          break;
      }
    }
  };

  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.editor-canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

.canvas-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
}

.canvas-viewport {
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.canvas-container {
  position: relative;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: transform 0.2s ease;
  transform-origin: center top;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--el-text-color-secondary);
  text-align: center;

  .empty-icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.page-content {
  position: relative;
  min-height: 100%;
}

.drop-indicator {
  pointer-events: none;
  border-radius: 2px;
}

// 滚动条样式
.canvas-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.canvas-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.canvas-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.canvas-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>