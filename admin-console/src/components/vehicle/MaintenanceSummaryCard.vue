<!-- 维保记录统计卡片 -->
<template>
  <div class="maintenance-summary-card">
    <div class="stats-row">
      <div class="stat-item" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <el-icon :size="24">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Tools, CircleCheck } from '@element-plus/icons-vue'

// Props
interface Props {
  plannedCount: number
  inProgressCount: number
  completedCount: number
}

const props = withDefaults(defineProps<Props>(), {
  plannedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
})

// 统计数据配置
const stats = computed(() => [
  {
    label: '计划中',
    value: props.plannedCount,
    icon: Calendar,
    color: '#409eff',
  },
  {
    label: '进行中',
    value: props.inProgressCount,
    icon: Tools,
    color: '#e6a23c',
  },
  {
    label: '已完成',
    value: props.completedCount,
    icon: CircleCheck,
    color: '#67c23a',
  },
])
</script>

<style scoped lang="scss">
.maintenance-summary-card {
  margin-bottom: 16px;

  .stats-row {
    display: flex;
    gap: 16px;

    .stat-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        margin-right: 12px;
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }
}
</style>
