<!--
  DIY可视化编辑器主界面
  包含左侧组件面板、中间画布区域、右侧属性面板
-->
<template>
  <div class="diy-editor">
    <!-- 顶部工具栏 -->
    <EditorToolbar
      @save="handleSave"
      @preview="handlePreview"
      @publish="handlePublish"
      @undo="handleUndo"
      @redo="handleRedo"
      :can-undo="diyStore.canUndo"
      :can-redo="diyStore.canRedo"
      :has-unsaved-changes="diyStore.hasUnsavedChanges"
    />

    <div class="editor-content">
      <!-- 左侧组件面板 -->
      <div class="left-panel">
        <ComponentPanel @add-component="handleAddComponent" />
      </div>

      <!-- 中间画布区域 -->
      <div class="center-panel">
        <EditorCanvas
          :page-config="diyStore.editorState.currentPage"
          :selected-component-id="diyStore.editorState.selectedComponentId"
          :zoom="diyStore.editorState.zoom"
          @select-component="handleSelectComponent"
          @update-component="handleUpdateComponent"
          @delete-component="handleDeleteComponent"
          @move-component="handleMoveComponent"
        />
      </div>

      <!-- 右侧属性面板 -->
      <div class="right-panel">
        <PropertyPanel
          :selected-component="diyStore.selectedComponent"
          @update-component="handleUpdateComponent"
        />
      </div>
    </div>

    <!-- 底部状态栏 -->
    <EditorStatusBar
      :zoom="diyStore.editorState.zoom"
      @zoom-change="handleZoomChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useDiyStore } from '@/stores/diy';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import EditorToolbar from './components/EditorToolbar.vue';
import ComponentPanel from './components/ComponentPanel.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import PropertyPanel from './components/PropertyPanel.vue';
import EditorStatusBar from './components/EditorStatusBar.vue';

import type { BaseComponent, PageConfiguration } from '@/types/diy';

const route = useRoute();
const router = useRouter();
const diyStore = useDiyStore();

// 组件事件处理
const handleSelectComponent = (component: BaseComponent | null) => {
  diyStore.selectComponent(component);
};

const handleAddComponent = (component: BaseComponent, parentId?: string, index?: number) => {
  diyStore.addComponent(component, parentId, index);
};

const handleUpdateComponent = (id: string, updates: Partial<BaseComponent>) => {
  diyStore.updateComponent(id, updates);
};

const handleDeleteComponent = (id: string) => {
  diyStore.deleteComponent(id);
};

const handleMoveComponent = (componentId: string, targetParentId?: string, targetIndex?: number) => {
  diyStore.moveComponent(componentId, targetParentId, targetIndex);
};

// 工具栏操作
const handleSave = async () => {
  if (!diyStore.currentProject) {
    ElMessage.warning('请先选择项目');
    return;
  }

  try {
    await diyStore.updateProject(diyStore.currentProject.id, {
      pageConfig: diyStore.editorState.currentPage
    });
    ElMessage.success('保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败: ' + error.message);
  }
};

const handlePreview = () => {
  diyStore.togglePreview();
};

const handlePublish = async () => {
  if (!diyStore.currentProject) {
    ElMessage.warning('请先选择项目');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要发布当前页面吗？', '发布确认', {
      type: 'warning'
    });

    await diyStore.publishProject(diyStore.currentProject.id);
    ElMessage.success('发布成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败: ' + error.message);
    }
  }
};

const handleUndo = () => {
  diyStore.undo();
};

const handleRedo = () => {
  diyStore.redo();
};

const handleZoomChange = (zoom: number) => {
  diyStore.setZoom(zoom);
};

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'z':
        event.preventDefault();
        if (event.shiftKey) {
          diyStore.redo();
        } else {
          diyStore.undo();
        }
        break;
      case 's':
        event.preventDefault();
        handleSave();
        break;
      case 'c':
        if (diyStore.selectedComponent) {
          event.preventDefault();
          diyStore.copyComponent(diyStore.selectedComponent);
        }
        break;
      case 'v':
        event.preventDefault();
        diyStore.pasteComponent();
        break;
    }
  }

  if (event.key === 'Delete' && diyStore.selectedComponentId) {
    event.preventDefault();
    handleDeleteComponent(diyStore.selectedComponentId);
  }

  if (event.key === 'Escape') {
    diyStore.clearSelection();
  }
};

// 初始化
onMounted(async () => {
  const projectId = route.params.id as string;

  if (projectId) {
    try {
      // 加载项目数据
      await diyStore.setCurrentProject({
        id: projectId,
        name: '',
        type: 'home',
        status: 'draft',
        pageConfig: {} as PageConfiguration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      });
    } catch (error: any) {
      ElMessage.error('加载项目失败: ' + error.message);
      router.push('/diy/projects');
    }
  }

  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.diy-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-panel {
  width: 320px;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}
</style>