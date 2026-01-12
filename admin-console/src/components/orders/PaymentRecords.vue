<template>
  <el-card class="payment-records-card">
    <template #header>
      <div class="card-header">
        <span>支付记录</span>
        <el-tag type="info" size="small">共 {{ records.length }} 条记录</el-tag>
      </div>
    </template>

    <el-timeline v-if="records.length > 0">
      <el-timeline-item
        v-for="record in records"
        :key="record.id"
        :timestamp="record.paymentTime"
        placement="top"
        :color="getStatusColor(record.status)"
      >
        <el-card shadow="hover" class="record-item">
          <div class="record-header">
            <div class="record-title">
              <el-tag :type="getStatusTag(record.status)" size="small">
                {{ getStatusLabel(record.status) }}
              </el-tag>
              <span class="record-type">{{ getPaymentTypeLabel(record.paymentType) }}</span>
            </div>
            <div class="record-amount" :class="{ refund: record.type === 'refund' }">
              {{ record.type === 'refund' ? '-' : '+' }}¥{{ record.amount.toLocaleString() }}
            </div>
          </div>

          <el-descriptions :column="2" size="small" class="record-details">
            <el-descriptions-item label="交易类型">
              <el-tag :type="record.type === 'payment' ? 'success' : 'warning'" size="small">
                {{ record.type === 'payment' ? '支付' : '退款' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="交易号">{{ record.transactionNo }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">
              {{ getPaymentMethodLabel(record.paymentMethod) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付账户">{{ record.paymentAccount }}</el-descriptions-item>
            <el-descriptions-item v-if="record.remark" label="备注" :span="2">
              {{ record.remark }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="record.status === 'success'" class="record-actions">
            <el-button type="primary" size="small" link @click="handleViewVoucher(record)">
              查看凭证
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-empty v-else description="暂无支付记录" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

// 支付记录类型定义
interface PaymentRecord {
  id: number
  type: 'payment' | 'refund'
  paymentType: 'deposit' | 'rent' | 'insurance' | 'service' | 'other'
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'cash'
  paymentAccount: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  transactionNo: string
  paymentTime: string
  remark?: string
}

// Props
interface Props {
  records: PaymentRecord[]
}

const props = withDefaults(defineProps<Props>(), {
  records: () => [],
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    success: '#67c23a',
    pending: '#e6a23c',
    failed: '#f56c6c',
  }
  return colorMap[status] || '#909399'
}

// 获取状态标签类型
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    success: '支付成功',
    pending: '支付中',
    failed: '支付失败',
  }
  return labelMap[status] || status
}

// 获取支付类型标签
const getPaymentTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    deposit: '押金',
    rent: '租金',
    insurance: '保险费',
    service: '服务费',
    other: '其他',
  }
  return labelMap[type] || type
}

// 获取支付方式标签
const getPaymentMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    bank: '银行卡',
    cash: '现金',
  }
  return labelMap[method] || method
}

// 查看支付凭证
const handleViewVoucher = (record: PaymentRecord) => {
  ElMessage.info(`查看支付凭证: ${record.transactionNo}`)
}
</script>

<style scoped lang="scss">
.payment-records-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .record-item {
    margin-bottom: 10px;

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .record-title {
        display: flex;
        align-items: center;
        gap: 10px;

        .record-type {
          font-size: 14px;
          color: #606266;
        }
      }

      .record-amount {
        font-size: 18px;
        font-weight: bold;
        color: #67c23a;

        &.refund {
          color: #f56c6c;
        }
      }
    }

    .record-details {
      margin-bottom: 15px;
    }

    .record-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
