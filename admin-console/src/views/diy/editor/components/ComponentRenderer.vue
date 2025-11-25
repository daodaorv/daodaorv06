<!--
  组件渲染器
  渲染单个组件并提供编辑交互功能
-->
<template>
  <div
    class="component-renderer"
    :class="{
      'selected': selected,
      'is-container': isContainer,
      'dragging-over': isDraggingOver
    }"
    :data-component-id="component.id"
    @click.stop="handleClick"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 选中状态边框 -->
    <div v-if="selected" class="selection-border">
      <!-- 拖拽手柄 -->
      <div class="drag-handle" draggable="true" @dragstart="handleDragStart">
        <el-icon size="12">
          <Rank />
        </el-icon>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button-group size="small">
          <el-button :icon="CopyDocument" @click.stop="handleCopy" />
          <el-button :icon="Delete" @click.stop="handleDelete" />
        </el-button-group>
      </div>

      <!-- 尺寸指示器 -->
      <div class="size-indicator">
        {{ component.styles.width || 'auto' }} × {{ component.styles.height || 'auto' }}
      </div>
    </div>

    <!-- 组件内容 -->
    <div class="component-content" :style="componentStyles">
      <!-- 文本组件 -->
      <TextComponent
        v-if="component.type === 'text'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 图片组件 -->
      <ImageComponent
        v-else-if="component.type === 'image'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 按钮组件 -->
      <ButtonComponent
        v-else-if="component.type === 'button'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 图标组件 -->
      <IconComponent
        v-else-if="component.type === 'icon'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 轮播图组件 -->
      <BannerComponent
        v-else-if="component.type === 'banner'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 商品卡片组件 -->
      <ProductCardComponent
        v-else-if="component.type === 'productCard'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
      />

      <!-- 容器组件 -->
      <ContainerComponent
        v-else-if="component.type === 'container'"
        :component="component"
        :is-preview="isPreview"
        @update="(updates) => $emit('update', updates)"
        @select-child="handleSelectChild"
        @update-child="handleUpdateChild"
        @delete-child="handleDeleteChild"
        @add-child="handleAddChild"
      />

      <!-- 未知组件 -->
      <div v-else class="unknown-component">
        <el-icon>
          <Warning />
        </el-icon>
        <span>未知组件类型: {{ component.type }}</span>
      </div>
    </div>

    <!-- 子组件拖拽指示器 -->
    <div v-if="isDraggingOver && isContainer" class="drop-zone-indicator">
      <div class="drop-hint">在此处添加组件</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CopyDocument, Delete, Rank, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 导入各种组件
import TextComponent from './components/TextComponent.vue';
import ImageComponent from './components/ImageComponent.vue';
import ButtonComponent from './components/ButtonComponent.vue';
import IconComponent from './components/IconComponent.vue';
import BannerComponent from './components/BannerComponent.vue';
import ProductCardComponent from './components/ProductCardComponent.vue';
import ContainerComponent from './components/ContainerComponent.vue';

import type { BaseComponent } from '@/types/diy';

interface DragState {
  isDraggingOver: boolean;
}

const props = defineProps<{
  component: BaseComponent;
  selected: boolean;
  isPreview: boolean;
}>();

const emit = defineEmits<{
  select: [component: BaseComponent];
  update: [updates: Partial<BaseComponent>];
  delete: [];
  move: [targetParentId?: string, targetIndex?: number];
  copy: [];
  addChild: [child: BaseComponent, index?: number];
  selectChild: [child: BaseComponent];
  updateChild: [childId: string, updates: Partial<BaseComponent>];
  deleteChild: [childId: string];
}>();

// 拖拽状态
const dragState = ref<DragState>({
  isDraggingOver: false
});

// 计算属性
const isContainer = computed(() => {
  return props.component.type === 'container' ||
         ['banner', 'productCard'].includes(props.component.type);
});

const componentStyles = computed(() => {
  const styles: Record<string, any> = {};

  // 处理样式对象
  Object.entries(props.component.styles || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // 转换驼峰命名为短横线命名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      styles[cssKey] = value;
    }
  });

  // 布局样式
  if (styles.position === 'absolute') {
    styles.position = 'absolute';
  }

  return styles;
});

// 事件处理
const handleClick = () => {
  emit('select', props.component);
};

const handleCopy = () => {
  emit('copy');
  ElMessage.success('组件已复制到剪贴板');
};

const handleDelete = () => {
  emit('delete');
};

// 组件拖拽
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      componentType: props.component.type,
      componentData: props.component,
      isMove: true
    }));
    event.dataTransfer.effectAllowed = 'move';
  }
};

// 子组件拖拽
const handleDragOver = (event: DragEvent) => {
  if (!isContainer.value) return;

  event.preventDefault();
  event.dataTransfer!.dropEffect = 'copy';
  dragState.value.isDraggingOver = true;
};

const handleDragLeave = (event: DragEvent) => {
  if (!isContainer.value) return;

  const target = event.currentTarget as HTMLElement;
  if (!target.contains(event.relatedTarget as Node)) {
    dragState.value.isDraggingOver = false;
  }
};

const handleDrop = async (event: DragEvent) => {
  if (!isContainer.value) return;

  event.preventDefault();
  dragState.value.isDraggingOver = false;

  try {
    const data = JSON.parse(event.dataTransfer!.getData('application/json'));

    if (data.isMove) {
      // 移动现有组件
      emit('move', props.component.id);
    } else {
      // 添加新组件
      const newComponent = {
        ...data.componentData,
        id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parentId: props.component.id
      };

      emit('addChild', newComponent);
    }
  } catch (error) {
    console.error('拖拽处理失败:', error);
  }
};

// 子组件事件处理
const handleSelectChild = (child: BaseComponent) => {
  emit('selectChild', child);
};

const handleUpdateChild = (childId: string, updates: Partial<BaseComponent>) => {
  emit('updateChild', childId, updates);
};

const handleDeleteChild = (childId: string) => {
  emit('deleteChild', childId);
};

const handleAddChild = (child: BaseComponent, index?: number) => {
  emit('addChild', child, index);
};
</script>

<style lang="scss" scoped>
.component-renderer {
  position: relative;
  margin: 2px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-info-light-5);
  }

  &.selected {
    border-color: var(--el-color-primary);
  }

  &.is-container {
    min-height: 60px;

    &.dragging-over {
      border-color: var(--el-color-primary);
      background-color: rgba(var(--el-color-primary-rgb), 0.05);
    }
  }
}

.selection-border {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 1px solid var(--el-color-primary);
  border-radius: 6px;
  pointer-events: none;
  z-index: 10;
}

.drag-handle {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 20px;
  height: 20px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  pointer-events: auto;

  &:active {
    cursor: grabbing;
  }
}

.action-buttons {
  position: absolute;
  top: -10px;
  right: -10px;
  pointer-events: auto;

  :deep(.el-button-group) {
    .el-button {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
      background: white;

      &:hover {
        background: var(--el-color-primary);
        color: white;
      }
    }
  }
}

.size-indicator {
  position: absolute;
  bottom: -10px;
  right: -10px;
  background: var(--el-color-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  pointer-events: none;
}

.component-content {
  position: relative;
  min-width: 20px;
  min-height: 20px;
}

.unknown-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--el-color-warning);
  font-size: 12px;
  text-align: center;

  .el-icon {
    margin-bottom: 8px;
  }
}

.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  border: 2px dashed var(--el-color-primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-hint {
  background: var(--el-color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>