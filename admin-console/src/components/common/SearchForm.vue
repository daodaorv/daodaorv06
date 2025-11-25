<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    :inline="inline"
    :label-width="labelWidth"
    class="search-form"
  >
    <el-form-item
      v-for="field in visibleFields"
      :key="field.prop"
      :label="field.label"
      :prop="field.prop"
      :class="`form-item-${field.type}`"
    >
      <!-- 输入框 -->
      <template v-if="field.type === 'input'">
        <el-input
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          @keyup.enter="handleSearch"
        >
          <template #prefix v-if="field.prefixIcon">
            <el-icon><component :is="field.prefixIcon" /></el-icon>
          </template>
        </el-input>
      </template>

      <!-- 选择器 -->
      <template v-else-if="field.type === 'select'">
        <el-select
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :multiple="field.multiple"
          :filterable="field.filterable"
          style="width: 100%"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
            :disabled="option.disabled"
          />
        </el-select>
      </template>

      <!-- 日期选择器 -->
      <template v-else-if="field.type === 'date'">
        <el-date-picker
          v-model="formData[field.prop]"
          type="date"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :format="field.format"
          :value-format="field.valueFormat || 'YYYY-MM-DD'"
          style="width: 100%"
        />
      </template>

      <!-- 日期范围选择器 -->
      <template v-else-if="field.type === 'daterange'">
        <el-date-picker
          v-model="formData[field.prop]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :format="field.format"
          :value-format="field.valueFormat || 'YYYY-MM-DD'"
          style="width: 100%"
        />
      </template>

      <!-- 时间选择器 -->
      <template v-else-if="field.type === 'time'">
        <el-time-picker
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :format="field.format"
          :value-format="field.valueFormat || 'HH:mm:ss'"
          style="width: 100%"
        />
      </template>

      <!-- 数字输入框 -->
      <template v-else-if="field.type === 'number'">
        <el-input-number
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :disabled="field.disabled"
          :min="field.min"
          :max="field.max"
          :step="field.step || 1"
          :precision="field.precision"
          style="width: 100%"
        />
      </template>

      <!-- 级联选择器 -->
      <template v-else-if="field.type === 'cascader'">
        <el-cascader
          v-model="formData[field.prop]"
          :options="field.options"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :filterable="field.filterable"
          style="width: 100%"
        />
      </template>

      <!-- 远程搜索 -->
      <template v-else-if="field.type === 'remote-select'">
        <el-select
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :disabled="field.disabled"
          :remote="true"
          :remote-method="field.remoteMethod"
          :loading="field.loading"
          :filterable="field.filterable !== false"
          style="width: 100%"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>

      <!-- 自定义插槽 -->
      <template v-else-if="field.type === 'slot'">
        <slot :name="`field-${field.prop}`" :field="field" :value="formData[field.prop]" />
      </template>
    </el-form-item>

    <!-- 操作按钮 -->
    <el-form-item class="form-actions">
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshRight /></el-icon>
        重置
      </el-button>
      <el-button
        v-if="showExpand"
        type="text"
        @click="toggleExpand"
      >
        {{ isExpanded ? '收起' : '展开' }}
        <el-icon>
          <ArrowUp v-if="isExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, RefreshRight, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// 字段类型定义
interface SearchFieldOption {
  label: string
  value: any
  disabled?: boolean
}

interface SearchField {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'time' | 'number' | 'cascader' | 'remote-select' | 'slot'
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
  filterable?: boolean
  loading?: boolean
  options?: SearchFieldOption[]
  format?: string
  valueFormat?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  prefixIcon?: any
  remoteMethod?: (query: string) => void
  show?: boolean | ((formData: Record<string, any>) => boolean)
}

interface Props {
  fields: SearchField[]
  modelValue: Record<string, any>
  inline?: boolean
  labelWidth?: string
  showExpand?: boolean
  maxVisibleRows?: number
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  inline: true,
  labelWidth: '100px',
  showExpand: false,
  maxVisibleRows: 2
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const isExpanded = ref(false)

// 表单数据
const formData = reactive<Record<string, any>>({})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const formRules: FormRules = {}
  props.fields.forEach(field => {
    if (field.rules) {
      formRules[field.prop] = field.rules
    }
  })
  return formRules
})

// 可见字段
const visibleFields = computed(() => {
  if (!props.showExpand || isExpanded.value) {
    return props.fields.filter(field => {
      if (typeof field.show === 'boolean') {
        return field.show
      }
      if (typeof field.show === 'function') {
        return field.show(formData)
      }
      return true
    })
  }

  return props.fields
    .filter(field => {
      if (typeof field.show === 'boolean') {
        return field.show
      }
      if (typeof field.show === 'function') {
        return field.show(formData)
      }
      return true
    })
    .slice(0, props.maxVisibleRows)
})

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(formData, newVal)
}, { deep: true, immediate: true })

// 监听表单数据变化
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

// 方法
const handleSearch = async () => {
  try {
    await formRef.value?.validate()
    emit('search')
  } catch (error) {
    // 表单验证失败
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  props.fields.forEach(field => {
    if (field.type === 'daterange') {
      formData[field.prop] = []
    } else {
      formData[field.prop] = field.multiple ? [] : ''
    }
  })
  emit('reset')
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => handleReset()
})
</script>

<style scoped lang="scss">
.search-form {
  .el-form-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-actions {
    .el-button {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  // 响应式布局
  @media (max-width: 768px) {
    :deep(.el-form-item__content) {
      flex-wrap: wrap;
    }
  }
}

// 字段类型特定样式
.form-item-daterange {
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.form-item-number {
  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>