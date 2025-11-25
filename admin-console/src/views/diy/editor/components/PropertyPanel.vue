<!--
  属性面板
  显示和编辑选中组件的属性和样式
-->
<template>
  <div class="property-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h3>属性设置</h3>
      <el-button
        v-if="selectedComponent"
        :icon="Close"
        text
        size="small"
        @click="handleClearSelection"
      />
    </div>

    <!-- 面板内容 -->
    <div class="panel-content">
      <!-- 未选中组件状态 -->
      <div v-if="!selectedComponent" class="no-selection">
        <el-icon size="48">
          <Pointer />
        </el-icon>
        <p>请选择一个组件进行编辑</p>
      </div>

      <!-- 组件属性编辑 -->
      <div v-else class="property-editor">
        <!-- 组件信息 -->
        <div class="section">
          <div class="section-title">组件信息</div>
          <div class="component-info">
            <div class="info-item">
              <span class="label">类型:</span>
              <span class="value">{{ componentSchema?.name || selectedComponent.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">ID:</span>
              <span class="value">{{ selectedComponent.id }}</span>
            </div>
          </div>
        </div>

        <!-- 组件属性 -->
        <PropertySection
          v-if="componentSchema?.properties"
          title="组件属性"
          :properties="componentSchema.properties"
          :values="selectedComponent.props"
          @change="handlePropChange"
        />

        <!-- 样式设置 -->
        <StyleSection
          title="样式设���"
          :styles="selectedComponent.styles"
          :component-type="selectedComponent.type"
          @change="handleStyleChange"
        />

        <!-- 动作配置 -->
        <ActionSection
          v-if="componentSchema?.events && componentSchema.events.length > 0"
          title="动作配置"
          :events="componentSchema.events"
          :actions="getComponentActions()"
          @change="handleActionChange"
        />

        <!-- 高级设置 -->
        <div class="section">
          <div class="section-title">高级设置</div>
          <div class="form-item">
            <label>组件ID</label>
            <el-input
              v-model="componentId"
              placeholder="自定义组件ID"
              size="small"
            />
          </div>
          <div class="form-item">
            <label>CSS类名</label>
            <el-input
              v-model="cssClass"
              placeholder="自定义CSS类名"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Close, Pointer } from '@element-plus/icons-vue';
import { useDiyStore } from '@/stores/diy';
import { getComponentSchema } from '@/api/diy';

import PropertySection from './sections/PropertySection.vue';
import StyleSection from './sections/StyleSection.vue';
import ActionSection from './sections/ActionSection.vue';

import type { BaseComponent, ActionConfig } from '@/types/diy';

const props = defineProps<{
  selectedComponent: BaseComponent | null;
}>();

const emit = defineEmits<{
  updateComponent: [id: string, updates: Partial<BaseComponent>];
}>();

const diyStore = useDiyStore();

// 响应式数据
const componentSchema = ref<any>(null);
const componentId = ref('');
const cssClass = ref('');

// 计算属性
const selectedComponent = computed(() => props.selectedComponent);

// 监听选中组件变化
watch(selectedComponent, async (component) => {
  if (component) {
    // 加载组件Schema
    try {
      const response = await getComponentSchema(component.type);
      if (response.code === 0) {
        componentSchema.value = response.data;
      }
    } catch (error) {
      console.error('加载组件Schema失败:', error);
    }

    // 设置表单值
    componentId.value = component.id;
    cssClass.value = component.props.className || '';
  } else {
    componentSchema.value = null;
    componentId.value = '';
    cssClass.value = '';
  }
}, { immediate: true });

// 方法
const handleClearSelection = () => {
  diyStore.clearSelection();
};

const handlePropChange = (key: string, value: any) => {
  if (!selectedComponent.value) return;

  const updates = {
    props: {
      ...selectedComponent.value.props,
      [key]: value
    }
  };

  emit('updateComponent', selectedComponent.value.id, updates);
};

const handleStyleChange = (key: string, value: any) => {
  if (!selectedComponent.value) return;

  const updates = {
    styles: {
      ...selectedComponent.value.styles,
      [key]: value
    }
  };

  emit('updateComponent', selectedComponent.value.id, updates);
};

const handleActionChange = (trigger: string, action: ActionConfig | null) => {
  if (!selectedComponent.value) return;

  const actions = {
    ...selectedComponent.value.events,
    [trigger]: action
  };

  const updates = {
    events: actions
  };

  emit('updateComponent', selectedComponent.value.id, updates);
};

const getComponentActions = (): Record<string, ActionConfig> => {
  if (!selectedComponent.value?.events) {
    return {};
  }

  return selectedComponent.value.events as Record<string, ActionConfig>;
};

// 监听表单变化
watch([componentId, cssClass], ([id, className]) => {
  if (!selectedComponent.value) return;

  const updates: Partial<BaseComponent> = {};

  if (id !== selectedComponent.value.id) {
    updates.id = id;
  }

  if (className !== selectedComponent.value.props.className) {
    updates.props = {
      ...selectedComponent.value.props,
      className
    };
  }

  if (Object.keys(updates).length > 0) {
    emit('updateComponent', selectedComponent.value.id, updates);
  }
});
</script>

<style lang="scss" scoped>
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--el-text-color-secondary);
  text-align: center;

  .el-icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.property-editor {
  .section {
    margin-bottom: 24px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  .component-info {
    background: var(--el-fill-color-extra-light);
    padding: 12px;
    border-radius: 6px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: var(--el-text-color-regular);
      }

      .value {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 12px;
        color: var(--el-text-color-primary);
        background: var(--el-fill-color);
        padding: 2px 6px;
        border-radius: 3px;
      }
    }
  }

  .form-item {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-bottom: 6px;
    }
  }
}

// 滚动条样式
.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>