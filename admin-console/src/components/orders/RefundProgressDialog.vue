<template>
  <el-dialog
    v-model="visible"
    title="退款进度查询"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="progress-container">
      <!-- 退款信息 -->
      <el-card class="info-card" shadow="never">
        <template #header><span class="card-title">退款信息</span></template>
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="退款单号">
            {{ refundInfo?.refundNo }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span class="amount-text">¥{{ refundInfo?.amount?.toFixed(2) || '0.00' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款方式">
            {{ getRefundMethodLabel(refundInfo?.method) }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ refundInfo?.createdAt }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 当前状态 -->
      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-header-with-action">
            <span class="card-title">当前状态</span>
            <el-button
              type="primary"
              size="small"
              :loading="refreshing"
              @click="handleRefresh"
            >
              刷新状态
            </el-button>
          </div>
        </template>

        <div class="status-content">
          <div class="status-main">
            <el-tag :type="getStatusTag(progress.status)" size="large">
              {{ getStatusLabel(progress.status) }}
            </el-tag>
            <div class="status-message">{{ progress.message }}</div>
          </div>

          <el-divider />

          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="处理进度">
              <el-progress
                :percentage="progress.percentage"
                :status="getProgressStatus(progress.status)"
              />
            </el-descriptions-item>
            <el-descriptions-item label="预计到账时间">
              <span :class="{ 'highlight-text': progress.estimatedTime }">
                {{ progress.estimatedTime || '处理中' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="第三方流水号" :span="2">
              {{ progress.transactionNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后更新时间" :span="2">
              {{ progress.updatedAt }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 处理详情 -->
      <el-card v-if="progress.details && progress.details.length > 0" class="details-card" shadow="never">
        <template #header><span class="card-title">处理详情</span></template>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in progress.details"
            :key="index"
            :timestamp="item.timestamp"
            :color="item.success ? '#67c23a' : '#909399'"
            placement="top"
          >
            <div class="timeline-content">
              <div class="timeline-title">{{ item.title }}</div>
              <div v-if="item.description" class="timeline-desc">{{ item.description }}</div>
              <el-tag v-if="item.code" size="small" type="info" style="margin-top: 8px">
                {{ item.code }}
              </el-tag>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 错误信息 -->
      <el-alert
        v-if="progress.error"
        :title="progress.error.title || '退款处理异常'"
        type="error"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="error-content">
            <p>{{ progress.error.message }}</p>
            <p v-if="progress.error.solution" class="error-solution">
              <strong>解决方案：</strong>{{ progress.error.solution }}
            </p>
          </div>
        </template>
      </el-alert>

      <!-- 温馨提示 -->
      <el-alert
        v-if="progress.status === 'processing'"
        title="温馨提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul class="tips-list">
            <li>退款正在处理中，请耐心等待</li>
            <li>不同退款方式到账时间不同，一般1-3个工作日</li>
            <li>如有疑问请联系客服或财务部门</li>
            <li>可点击"刷新状态"按钮查看最新进度</li>
          </ul>
        </template>
      </el-alert>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleRefresh" :loading="refreshing">
        刷新状态
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  modelValue: boolean
  refundInfo: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  refundInfo: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'refresh': [refundId: number]
}>()

// 响应式数据
const visible = ref(props.modelValue)
const refreshing = ref(false)

// 退款进度数据
const progress = reactive({
  status: 'processing',
  message: '退款正在处理中，请稍候...',
  percentage: 50,
  estimatedTime: '2024-01-20 18:00',
  transactionNo: 'TXN202401200001',
  updatedAt: new Date().toLocaleString('zh-CN'),
  details: [
    {
      timestamp: '2024-01-20 10:00:00',
      title: '退款申请已提交',
      description: '用户提交退款申请',
      success: true,
      code: 'REFUND_SUBMITTED'
    },
    {
      timestamp: '2024-01-20 10:05:00',
      title: '退款审核通过',
      description: '管理员审核通过退款申请',
      success: true,
      code: 'REFUND_APPROVED'
    },
    {
      timestamp: '2024-01-20 10:10:00',
      title: '退款处理中',
      description: '正在向第三方支付平台发起退款',
      success: true,
      code: 'REFUND_PROCESSING'
    }
  ],
  error: null as any
})

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.refundInfo) {
    // 加载退款进度
    loadProgress()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载退款进度
const loadProgress = () => {
  // TODO: 调用API获取实际进度
  // 这里使用Mock数据
  if (props.refundInfo?.status === 'success') {
    progress.status = 'success'
    progress.message = '退款已成功到账'
    progress.percentage = 100
    progress.estimatedTime = ''
    progress.details.push({
      timestamp: new Date().toLocaleString('zh-CN'),
      title: '退款成功',
      description: '退款已成功到账',
      success: true,
      code: 'REFUND_SUCCESS'
    })
  } else if (props.refundInfo?.status === 'failed') {
    progress.status = 'failed'
    progress.message = '退款处理失败'
    progress.percentage = 0
    progress.error = {
      title: '退款失败',
      message: props.refundInfo.failureReason || '未知错误',
      solution: '请联系技术支持或尝试切换退款方式'
    }
  }
}

// 刷新状态
const handleRefresh = async () => {
  refreshing.value = true
  try {
    // TODO: 调用API刷新状态
    emit('refresh', props.refundInfo?.id)

    // 模拟刷新
    await new Promise(resolve => setTimeout(resolve, 1000))

    progress.updatedAt = new Date().toLocaleString('zh-CN')
    ElMessage.success('状态已刷新')
  } catch (error) {
    console.error('刷新状态失败:', error)
    ElMessage.error('刷新状态失败，请重试')
  } finally {
    refreshing.value = false
  }
}

// 获取退款方式标签
const getRefundMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    original: '原路退回',
    balance: '退到余额',
    bank_card: '银行卡',
    alipay: '支付宝',
    wechat: '微信'
  }
  return labelMap[method] || method
}

// 获取状态标签类型
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '已完成',
    failed: '失败'
  }
  return labelMap[status] || status
}

// 获取进度条状态
const getProgressStatus = (status: string) => {
  const statusMap: Record<string, any> = {
    success: 'success',
    failed: 'exception',
    processing: undefined
  }
  return statusMap[status]
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.progress-container {
  .info-card,
  .status-card,
  .details-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .card-title {
    font-weight: 600;
    font-size: 14px;
  }

  .card-header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .amount-text {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
  }

  .status-content {
    .status-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;

      .status-message {
        margin-top: 12px;
        color: #606266;
        font-size: 14px;
      }
    }

    .highlight-text {
      color: #409eff;
      font-weight: 600;
    }
  }

  .timeline-content {
    .timeline-title {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      margin-bottom: 4px;
    }

    .timeline-desc {
      color: #606266;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .error-content {
    p {
      margin: 0 0 8px 0;
      color: #606266;
      font-size: 13px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .error-solution {
      color: #303133;
    }
  }

  .tips-list {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      color: #606266;
      font-size: 13px;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
}

:deep(.el-alert) {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.el-progress) {
  width: 100%;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
