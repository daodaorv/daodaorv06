<!-- 保险信息统计卡片 -->
<template>
  <div class="insurance-summary-card">
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
import { CircleCheck, Warning, CircleClose } from '@element-plus/icons-vue'

// Props
interface Props {
  activeCount: number
  expiringCount: number
  expiredCount: number
}

const props = withDefaults(defineProps<Props>(), {
  activeCount: 0,
  expiringCount: 0,
  expiredCount: 0,
})

// 统计数据配置
const stats = computed(() => [
  {
    label: '有效保险',
    value: props.activeCount,
    icon: CircleCheck,
    color: '#67c23a',
  },
  {
    label: '即将到期',
    value: props.expiringCount,
    icon: Warning,
    color: '#e6a23c',
  },
  {
    label: '已过期',
    value: props.expiredCount,
    icon: CircleClose,
    color: '#f56c6c',
  },
])
</script>

<style scoped lang="scss">
.insurance-summary-card {
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
