<!--
  动作配置编辑区域组件
-->
<template>
  <div class="action-section">
    <div class="section-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="section-content">
      <div
        v-for="event in events"
        :key="event.name"
        class="event-item"
      >
        <div class="event-header">
          <label>{{ event.title }}</label>
          <el-switch
            :model-value="!!actions[event.name]"
            @update:model-value="handleEventToggle(event.name, $event)"
          />
        </div>

        <div v-if="actions[event.name]" class="action-config">
          <div class="config-row">
            <label>动作类型</label>
            <el-select
              :model-value="actions[event.name].type"
              placeholder="请选择动作类型"
              @update:model-value="handleActionChange(event.name, 'type', $event)"
            >
              <el-option label="页面导航" value="navigate" />
              <el-option label="网页跳转" value="webview" />
              <el-option label="拨打电话" value="phone" />
              <el-option label="小程序跳转" value="miniprogram" />
              <el-option label="自定义动作" value="action" />
            </el-select>
          </div>

          <div class="config-row">
            <label>目标地址</label>
            <el-input
              :model-value="actions[event.name].target"
              :placeholder="getTargetPlaceholder(actions[event.name].type)"
              @update:model-value="handleActionChange(event.name, 'target', $event)"
            />
          </div>

          <div v-if="actions[event.name].type === 'navigate'" class="config-row">
            <label>页面参数</label>
            <el-input
              :model-value="JSON.stringify(actions[event.name].params || {})"
              placeholder='{"key": "value"}'
              @update:model-value="handleParamsChange(event.name, $event)"
            />
          </div>

          <div v-if="actions[event.name].type === 'phone'" class="config-row">
            <label>电话号码</label>
            <el-input
              :model-value="actions[event.name].target"
              placeholder="请输入电话号码"
              @update:model-value="handleActionChange(event.name, 'target', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { ComponentEvent, ActionConfig } from '@/types/diy';

defineProps<{
  title: string;
  events: ComponentEvent[];
  actions: Record<string, ActionConfig>;
}>();

const emit = defineEmits<{
  change: [trigger: string, action: ActionConfig | null];
}>();

const handleEventToggle = (eventName: string, enabled: boolean) => {
  if (enabled) {
    // 启用事件，创建默认动作
    const defaultAction: ActionConfig = {
      type: 'navigate',
      target: '',
      params: {}
    };
    emit('change', eventName, defaultAction);
  } else {
    // 禁用事件
    emit('change', eventName, null);
  }
};

const handleActionChange = (eventName: string, key: string, value: any) => {
  const currentAction = {
    type: 'navigate' as const,
    target: '',
    params: {}
  };

  if (key === 'type') {
    currentAction.type = value;
  } else if (key === 'target') {
    currentAction.target = value;
  }

  emit('change', eventName, currentAction);
};

const handleParamsChange = (eventName: string, value: string) => {
  try {
    const params = JSON.parse(value || '{}');
    const action = {
      type: 'navigate' as const,
      target: '',
      params
    };
    emit('change', eventName, action);
  } catch (error) {
    ElMessage.error('参数格式错误，请输入有效的JSON格式');
  }
};

const getTargetPlaceholder = (type: string): string => {
  const placeholders: Record<string, string> = {
    navigate: '/pages/index/index',
    webview: 'https://example.com',
    phone: '13800138000',
    miniprogram: 'wx1234567890abcdef',
    action: 'customAction'
  };
  return placeholders[type] || '请输入目标地址';
};
</script>

<style lang="scss" scoped>
.action-section {
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

.event-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  &:last-child {
    margin-bottom: 0;
  }
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.action-config {
  .config-row {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-bottom: 4px;
    }

    .el-input,
    .el-select {
      width: 100%;
    }
  }
}
</style>