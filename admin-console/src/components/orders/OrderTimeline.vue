<template>
  <div class="order-timeline">
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in timelineData"
        :key="index"
        :timestamp="item.timestamp"
        :type="item.type"
        :color="item.color"
        :icon="item.icon"
        placement="top"
      >
        <el-card class="timeline-card" shadow="hover" :class="{ 'is-important': item.isImportant }">
          <div class="timeline-header">
            <div class="header-left">
              <span class="timeline-title">{{ item.title }}</span>
              <el-tag :type="item.tagType" size="small">{{ item.status }}</el-tag>
            </div>
            <div v-if="item.duration" class="timeline-duration">
              <el-icon><Clock /></el-icon>
              <span>{{ item.duration }}</span>
            </div>
          </div>

          <div v-if="item.description" class="timeline-description">
            {{ item.description }}
          </div>

          <div v-if="item.operator" class="timeline-operator">
            <el-icon><User /></el-icon>
            <span>操作人：{{ item.operator }}</span>
          </div>

          <div v-if="item.details && item.details.length > 0" class="timeline-details">
            <el-divider content-position="left">详细信息</el-divider>
            <div v-for="(detail, idx) in item.details" :key="idx" class="detail-item">
              <span class="detail-label">{{ detail.label }}：</span>
              <span class="detail-value">{{ detail.value }}</span>
            </div>
          </div>

          <div v-if="item.images && item.images.length > 0" class="timeline-images">
            <el-divider content-position="left">相关图片</el-divider>
            <el-image
              v-for="(image, idx) in item.images"
              :key="idx"
              :src="image"
              :preview-src-list="item.images"
              :initial-index="idx"
              fit="cover"
              class="timeline-image"
            />
          </div>

          <div v-if="item.actions && item.actions.length > 0" class="timeline-actions">
            <el-button
              v-for="(action, idx) in item.actions"
              :key="idx"
              :type="action.type"
              size="small"
              @click="handleAction(action.key, item)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-empty v-if="timelineData.length === 0" description="暂无时间线数据" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Check, Close, Clock, Document, CaretRight } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/format'

// Props
interface TimelineItem {
  title: string
  timestamp: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  color?: string
  icon?: any
  status: string
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  description?: string
  operator?: string
  duration?: string
  isImportant?: boolean
  details?: Array<{ label: string; value: string }>
  images?: string[]
  actions?: Array<{
    key: string
    label: string
    type?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text'
  }>
}

interface Props {
  timeline: any[]
}

const props = withDefaults(defineProps<Props>(), {
  timeline: () => [],
})

// Emits
const emit = defineEmits<{
  action: [key: string, item: any]
}>()

// 计算时间线数据
const timelineData = computed<TimelineItem[]>(() => {
  return props.timeline.map((item, index) => {
    const config = getTimelineConfig(item.action)
    const duration = index < props.timeline.length - 1
      ? calculateDuration(item.timestamp, props.timeline[index + 1].timestamp)
      : undefined

    return {
      title: config.title,
      timestamp: formatDateTime(item.timestamp),
      type: config.type,
      color: config.color,
      icon: config.icon,
      status: config.status,
      tagType: config.tagType,
      description: item.description || config.description,
      operator: item.operator,
      duration,
      isImportant: config.isImportant,
      details: item.details || [],
      images: item.images || [],
      actions: item.actions || [],
    }
  })
})

// 计算持续时间
const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const diff = end - start

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 获取时间线配置
const getTimelineConfig = (action: string) => {
  const configMap: Record<string, any> = {
    created: {
      title: '订单创建',
      status: '已创建',
      type: 'primary',
      color: '#409eff',
      icon: Document,
      tagType: 'primary',
      description: '用户成功创建订单',
      isImportant: true,
    },
    paid: {
      title: '支付完成',
      status: '已支付',
      type: 'success',
      color: '#67c23a',
      icon: Check,
      tagType: 'success',
      description: '订单支付成功',
      isImportant: true,
    },
    confirmed: {
      title: '订单确认',
      status: '已确认',
      type: 'success',
      color: '#67c23a',
      icon: Check,
      tagType: 'success',
      description: '管理员确认订单',
    },
    ready: {
      title: '准备取车',
      status: '准备中',
      type: 'warning',
      color: '#e6a23c',
      icon: Clock,
      tagType: 'warning',
      description: '车辆准备完毕，等待取车',
    },
    pickup: {
      title: '取车完成',
      status: '已取车',
      type: 'success',
      color: '#67c23a',
      icon: CaretRight,
      tagType: 'success',
      description: '客户完成取车手续',
      isImportant: true,
    },
    in_use: {
      title: '使用中',
      status: '使用中',
      type: 'primary',
      color: '#409eff',
      icon: CaretRight,
      tagType: 'primary',
      description: '订单正在使用中',
    },
    return: {
      title: '还车完成',
      status: '已还车',
      type: 'success',
      color: '#67c23a',
      icon: Check,
      tagType: 'success',
      description: '客户完成还车手续',
      isImportant: true,
    },
    completed: {
      title: '订单完成',
      status: '已完成',
      type: 'success',
      color: '#67c23a',
      icon: Check,
      tagType: 'success',
      description: '订单已完成，押金已退还',
      isImportant: true,
    },
    cancelled: {
      title: '订单取消',
      status: '已取消',
      type: 'danger',
      color: '#f56c6c',
      icon: Close,
      tagType: 'danger',
      description: '订单已取消',
    },
    refunding: {
      title: '退款处理',
      status: '退款中',
      type: 'warning',
      color: '#e6a23c',
      icon: Clock,
      tagType: 'warning',
      description: '正在处理退款',
    },
    refunded: {
      title: '退款完成',
      status: '已退款',
      type: 'info',
      color: '#909399',
      icon: Check,
      tagType: 'info',
      description: '退款已完成',
    },
    exception_created: {
      title: '异常创建',
      status: '异常',
      type: 'danger',
      color: '#f56c6c',
      icon: Close,
      tagType: 'danger',
      description: '订单产生异常',
    },
    exception_resolved: {
      title: '异常解决',
      status: '已解决',
      type: 'success',
      color: '#67c23a',
      icon: Check,
      tagType: 'success',
      description: '异常已解决',
    },
  }

  return (
    configMap[action] || {
      title: action,
      status: action,
      type: 'info',
      color: '#909399',
      icon: Document,
      tagType: 'info',
      description: '',
    }
  )
}

// 处理操作
const handleAction = (key: string, item: any) => {
  emit('action', key, item)
}
</script>

<style scoped lang="scss">
.order-timeline {
  padding: 20px 0;

  :deep(.el-timeline) {
    padding-left: 0;
  }

  :deep(.el-timeline-item__timestamp) {
    color: #909399;
    font-size: 13px;
    margin-bottom: 8px;
  }

  :deep(.el-timeline-item__wrapper) {
    padding-left: 32px;
  }

  :deep(.el-timeline-item__node) {
    width: 16px;
    height: 16px;
  }

  :deep(.el-timeline-item__icon) {
    font-size: 14px;
  }
}

.timeline-card {
  margin-bottom: 0;
  transition: all 0.3s;

  :deep(.el-card__body) {
    padding: 16px;
  }

  &.is-important {
    border: 2px solid #409eff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);

    .timeline-title {
      color: #409eff;
      font-weight: 700;
    }
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .timeline-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .timeline-duration {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 13px;
    white-space: nowrap;

    .el-icon {
      font-size: 14px;
    }
  }
}

.timeline-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.timeline-operator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 12px;

  .el-icon {
    font-size: 14px;
  }
}

.timeline-details {
  margin-top: 12px;

  .detail-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      color: #909399;
      min-width: 80px;
    }

    .detail-value {
      color: #606266;
      flex: 1;
    }
  }
}

.timeline-images {
  margin-top: 12px;

  .timeline-image {
    width: 80px;
    height: 80px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.timeline-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

:deep(.el-divider) {
  margin: 12px 0;
}

:deep(.el-divider__text) {
  font-size: 12px;
  color: #909399;
  background-color: #fff;
}
</style>
