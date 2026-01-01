<template>
  <el-dialog v-model="visible" title="订单详情" width="900px">
    <div v-loading="loading">
      <el-descriptions v-if="order" :column="2" border>
        <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTag(order.status)">
            {{ getStatusLabel(order.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ order.userName }}</el-descriptions-item>
        <el-descriptions-item label="客户手机">{{ order.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="车牌号">{{ order.vehicleNumber }}</el-descriptions-item>
        <el-descriptions-item label="车型">{{ order.vehicleName }}</el-descriptions-item>
        <el-descriptions-item label="租赁开始">{{ formatDateTime(order.startDate) }}</el-descriptions-item>
        <el-descriptions-item label="租赁结束">{{ formatDateTime(order.endDate) }}</el-descriptions-item>
        <el-descriptions-item label="租赁天数">{{ order.days }} 天</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ order.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(order.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '@/api/order'

interface Props {
  modelValue: boolean
  order: Order | null
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const getStatusTag = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    confirmed: 'primary',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>
