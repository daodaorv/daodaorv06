<!--
  编辑器工具栏
  包含保存、预览、发布、撤销、重做等操作按钮
-->
<template>
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <el-button-group>
        <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
          <el-button
            :icon="RefreshLeft"
            :disabled="!canUndo"
            @click="$emit('undo')"
          />
        </el-tooltip>
        <el-tooltip content="重做 (Ctrl+Shift+Z)" placement="bottom">
          <el-button
            :icon="RefreshRight"
            :disabled="!canRedo"
            @click="$emit('redo')"
          />
        </el-tooltip>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-tooltip content="保存 (Ctrl+S)" placement="bottom">
        <el-button
          type="primary"
          :icon="DocumentAdd"
          @click="$emit('save')"
        >
          保存
        </el-button>
      </el-tooltip>

      <el-tooltip content="预览" placement="bottom">
        <el-button
          :icon="View"
          @click="$emit('preview')"
        >
          预览
        </el-button>
      </el-tooltip>

      <el-tooltip content="发布" placement="bottom">
        <el-button
          type="success"
          :icon="Promotion"
          @click="$emit('publish')"
        >
          发布
        </el-button>
      </el-tooltip>
    </div>

    <div class="toolbar-right">
      <el-badge
        v-if="hasUnsavedChanges"
        value="未保存"
        type="danger"
        class="save-indicator"
      />

      <el-divider direction="vertical" />

      <el-tooltip content="清空选择" placement="bottom">
        <el-button
          :icon="Remove"
          @click="clearSelection"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RefreshLeft,
  RefreshRight,
  DocumentAdd,
  View,
  Promotion,
  Remove
} from '@element-plus/icons-vue';
import { useDiyStore } from '@/stores/diy';

defineProps<{
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
}>();

defineEmits<{
  save: [];
  preview: [];
  publish: [];
  undo: [];
  redo: [];
}>();

const diyStore = useDiyStore();

const clearSelection = () => {
  diyStore.clearSelection();
};
</script>

<style lang="scss" scoped>
.editor-toolbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-indicator {
  :deep(.el-badge__content) {
    border: none;
  }
}

.el-divider--vertical {
  height: 24px;
  margin: 0 12px;
}
</style>