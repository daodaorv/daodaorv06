<template>
  <!-- 单卡片模式 -->
  <el-card v-if="isSingleMode" shadow="hover" class="stat-card single-mode">
    <div class="stat-content">
      <div class="stat-icon">
        <el-icon :size="iconSize" :color="color">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ formatValue(value, format) }}</div>
        <div class="stat-label">{{ title }}</div>
      </div>
    </div>
  </el-card>

  <!-- 多卡片模式 -->
  <el-row v-else :gutter="20" class="stats-cards">
    <el-col v-for="(item, index) in stats" :key="index" :span="span">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="iconSize" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatValue(item.value, item.format) }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export interface StatItem {
  label: string
  value: number | string
  icon: any
  color: string
  format?: 'number' | 'currency' | 'percent'
}

const props = withDefaults(
  defineProps<{
    // 多卡片模式
    stats?: StatItem[]
    span?: number
    // 单卡片模式
    title?: string
    value?: number | string
    icon?: string
    color?: string
    format?: 'number' | 'currency' | 'percent'
    iconSize?: number
  }>(),
  {
    span: 6,
    iconSize: 40,
    color: '#409EFF',
  }
)

// 判断是单卡片模式还是多卡片模式
const isSingleMode = computed(() => {
  return !props.stats && (props.title !== undefined || props.value !== undefined)
})

// 获取图标组件
const iconComponent = computed(() => {
  if (!props.icon) return null
  // 如果是字符串，从 Element Plus Icons 中获取
  if (typeof props.icon === 'string') {
    return (ElementPlusIconsVue as any)[props.icon]
  }
  return props.icon
})

const formatValue = (
  value: number | string | undefined,
  format?: 'number' | 'currency' | 'percent'
) => {
  if (value === undefined || value === null) return '0'
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return `¥${value.toLocaleString()}`
    case 'percent':
      return `${value}%`
    default:
      return value.toLocaleString()
  }
}
</script>

<style scoped lang="scss">
.stat-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;

    .stat-icon {
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #303133;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  &.single-mode {
    height: 100%;
  }
}

.stats-cards {
  margin-bottom: 20px;
}
</style>
