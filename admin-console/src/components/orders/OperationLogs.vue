<template>
  <el-card class="operation-logs-card">
    <template #header>
      <div class="card-header">
        <span>操作日志</span>
        <div class="header-actions">
          <el-select v-model="filterType" placeholder="操作类型" size="small" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="创建订单" value="create" />
            <el-option label="修改订单" value="update" />
            <el-option label="状态变更" value="status_change" />
            <el-option label="支付操作" value="payment" />
            <el-option label="退款操作" value="refund" />
            <el-option label="备注添加" value="remark" />
          </el-select>
          <el-tag type="info" size="small">共 {{ filteredLogs.length }} 条记录</el-tag>
        </div>
      </div>
    </template>

    <el-timeline v-if="filteredLogs.length > 0">
      <el-timeline-item
        v-for="log in filteredLogs"
        :key="log.id"
        :timestamp="log.createdAt"
        placement="top"
        :color="getTypeColor(log.type)"
      >
        <el-card shadow="hover" class="log-item">
          <div class="log-header">
            <div class="log-title">
              <el-tag :type="getTypeTag(log.type)" size="small">
                {{ getTypeLabel(log.type) }}
              </el-tag>
              <span class="log-operator">{{ log.operatorName }}</span>
            </div>
          </div>

          <div class="log-content">
            <p class="log-description">{{ log.description }}</p>
            <el-descriptions v-if="log.details" :column="1" size="small" class="log-details">
              <el-descriptions-item
                v-for="(value, key) in log.details"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="log.remark" class="log-remark">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ log.remark }}</span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-empty v-else description="暂无操作日志" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'

// 操作日志类型定义
interface OperationLog {
  id: number
  type: 'create' | 'update' | 'status_change' | 'payment' | 'refund' | 'remark'
  operatorName: string
  operatorId: number
  description: string
  details?: Record<string, string>
  remark?: string
  createdAt: string
}

// Props
interface Props {
  logs: OperationLog[]
}

const props = withDefaults(defineProps<Props>(), {
  logs: () => [],
})

// 过滤类型
const filterType = ref('')

// 过滤后的日志
const filteredLogs = computed(() => {
  if (!filterType.value) {
    return props.logs
  }
  return props.logs.filter(log => log.type === filterType.value)
})

// 处理过滤
const handleFilter = () => {
  // 过滤逻辑已在 computed 中处理
}

// 获取操作类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    create: '#409eff',
    update: '#67c23a',
    status_change: '#e6a23c',
    payment: '#67c23a',
    refund: '#f56c6c',
    remark: '#909399',
  }
  return colorMap[type] || '#909399'
}

// 获取操作类型标签类型
const getTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    create: 'primary',
    update: 'success',
    status_change: 'warning',
    payment: 'success',
    refund: 'danger',
    remark: 'info',
  }
  return tagMap[type] || 'info'
}

// 获取操作类型标签文本
const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    create: '创建订单',
    update: '修改订单',
    status_change: '状态变更',
    payment: '支付操作',
    refund: '退款操作',
    remark: '备注添加',
  }
  return labelMap[type] || type
}
</script>

<style scoped lang="scss">
.operation-logs-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .log-item {
    margin-bottom: 10px;

    .log-header {
      margin-bottom: 12px;

      .log-title {
        display: flex;
        align-items: center;
        gap: 10px;

        .log-operator {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }

    .log-content {
      .log-description {
        font-size: 14px;
        color: #303133;
        margin-bottom: 10px;
        line-height: 1.6;
      }

      .log-details {
        margin-top: 10px;
      }
    }

    .log-remark {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 13px;
      color: #606266;
    }
  }
}
</style>
