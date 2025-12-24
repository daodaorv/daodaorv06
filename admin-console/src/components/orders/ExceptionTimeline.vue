<template>
  <div class="exception-timeline">
    <el-empty v-if="timeline.length === 0" description="暂无处理记录" :image-size="100" />

    <el-timeline v-else>
      <el-timeline-item
        v-for="(item, index) in timelineData"
        :key="index"
        :timestamp="item.timestamp"
        :color="item.color"
        :icon="item.icon"
        placement="top"
      >
        <el-card class="timeline-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-tag :type="item.tagType" size="small">{{ item.status }}</el-tag>
                <span class="operator">{{ item.operator }}</span>
              </div>
            </div>
          </template>

          <div class="card-content">
            <p v-if="item.description" class="description">{{ item.description }}</p>

            <!-- 详细信息 -->
            <el-descriptions v-if="item.details && item.details.length > 0" :column="2" size="small" border class="details">
              <el-descriptions-item
                v-for="(detail, idx) in item.details"
                :key="idx"
                :label="detail.label"
              >
                {{ detail.value }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 费用明细 -->
            <div v-if="item.feeItems && item.feeItems.length > 0" class="fee-section">
              <div class="section-title">费用明细</div>
              <el-table :data="item.feeItems" size="small" border>
                <el-table-column prop="type" label="费用类型" width="120">
                  <template #default="{ row }">
                    {{ getFeeTypeLabel(row.type) }}
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="100">
                  <template #default="{ row }">
                    ¥{{ row.amount.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="说明" />
              </el-table>
              <div class="fee-total">
                总计：<span class="amount">¥{{ calculateTotal(item.feeItems).toFixed(2) }}</span>
              </div>
            </div>

            <!-- 图片展示 -->
            <div v-if="item.images && item.images.length > 0" class="images-section">
              <div class="section-title">相关图片</div>
              <div class="images-grid">
                <el-image
                  v-for="(img, idx) in item.images"
                  :key="idx"
                  :src="img"
                  :preview-src-list="item.images"
                  :initial-index="idx"
                  fit="cover"
                  class="image-item"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="item.actions && item.actions.length > 0" class="actions-section">
              <el-button
                v-for="action in item.actions"
                :key="action.key"
                :type="action.type || 'default'"
                size="small"
                @click="handleAction(action.key, item)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CircleCheck,
  Clock,
  Warning,
  User,
  Document,
  Money,
  Close
} from '@element-plus/icons-vue'

interface TimelineItem {
  action: string
  timestamp: string
  operator: string
  description?: string
  details?: Array<{ label: string; value: string }>
  feeItems?: Array<{ type: string; amount: number; description: string }>
  images?: string[]
  actions?: Array<{
    key: string
    label: string
    type?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text'
  }>
}

interface Props {
  timeline: TimelineItem[]
}

const props = withDefaults(defineProps<Props>(), {
  timeline: () => []
})

const emit = defineEmits<{
  action: [key: string, item: TimelineItem]
}>()

// 时间线配置映射
const timelineConfig: Record<string, any> = {
  created: {
    status: '异常创建',
    color: '#409eff',
    icon: Document,
    tagType: 'primary'
  },
  assigned: {
    status: '已分配',
    color: '#67c23a',
    icon: User,
    tagType: 'success'
  },
  processing: {
    status: '处理中',
    color: '#e6a23c',
    icon: Clock,
    tagType: 'warning'
  },
  escalated: {
    status: '已升级',
    color: '#f56c6c',
    icon: Warning,
    tagType: 'danger'
  },
  settled: {
    status: '费用结算',
    color: '#409eff',
    icon: Money,
    tagType: 'primary'
  },
  resolved: {
    status: '已解决',
    color: '#67c23a',
    icon: CircleCheck,
    tagType: 'success'
  },
  closed: {
    status: '已关闭',
    color: '#909399',
    icon: CircleCheck,
    tagType: 'info'
  },
  rejected: {
    status: '已驳回',
    color: '#f56c6c',
    icon: Close,
    tagType: 'danger'
  }
}

// 处理时间线数据
const timelineData = computed(() => {
  return props.timeline.map(item => {
    const config = timelineConfig[item.action] || {
      status: item.action,
      color: '#909399',
      icon: Document,
      tagType: 'info'
    }

    return {
      ...item,
      ...config
    }
  })
})

// 获取费用类型标签
const getFeeTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    repair: '车辆维修费',
    cleaning: '车辆清洁费',
    violation_fine: '违章罚款',
    accident_compensation: '事故赔偿',
    towing: '拖车费用',
    parking: '停车费用',
    other: '其他费用'
  }
  return labelMap[type] || type
}

// 计算费用总计
const calculateTotal = (feeItems: Array<{ amount: number }>) => {
  return feeItems.reduce((sum, item) => sum + item.amount, 0)
}

// 处理操作按钮点击
const handleAction = (key: string, item: TimelineItem) => {
  emit('action', key, item)
}
</script>

<style scoped lang="scss">
.exception-timeline {
  padding: 20px;

  .timeline-card {
    margin-bottom: 0;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .operator {
          color: #606266;
          font-size: 14px;
        }
      }
    }

    .card-content {
      .description {
        margin: 0 0 16px 0;
        color: #606266;
        font-size: 14px;
        line-height: 1.6;
      }

      .details {
        margin-bottom: 16px;
      }

      .fee-section {
        margin-bottom: 16px;

        .section-title {
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }

        .fee-total {
          margin-top: 12px;
          text-align: right;
          font-size: 14px;
          color: #606266;

          .amount {
            margin-left: 8px;
            font-weight: 600;
            font-size: 16px;
            color: #f56c6c;
          }
        }
      }

      .images-section {
        margin-bottom: 16px;

        .section-title {
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
          color: #303133;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;

          .image-item {
            width: 100px;
            height: 100px;
            border-radius: 4px;
            cursor: pointer;
            transition: transform 0.2s;

            &:hover {
              transform: scale(1.05);
            }
          }
        }
      }

      .actions-section {
        display: flex;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;
      }
    }
  }
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid #e4e7ed;
}

:deep(.el-timeline-item__node) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
