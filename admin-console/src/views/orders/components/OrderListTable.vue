<template>
  <DataTable
    :data="data"
    :columns="tableColumns"
    :loading="loading"
    :actions="tableActions"
    :toolbar-buttons="toolbarButtons"
    :pagination="pagination"
    :actions-width="280"
    :show-selection="true"
    @size-change="$emit('size-change', $event)"
    @current-change="$emit('current-change', $event)"
    @selection-change="$emit('selection-change', $event)"
  >
    <template #orderNo="{ row }">
      <el-link type="primary" @click="$emit('view-detail', row.id)">
        {{ row.orderNo }}
      </el-link>
    </template>

    <template #status="{ row }">
      <el-tag :type="getStatusTag(row.status)" size="small">
        {{ getStatusLabel(row.status) }}
      </el-tag>
    </template>

    <template #totalAmount="{ row }">
      ¥{{ row.totalAmount }}
    </template>

    <template #createdAt="{ row }">
      {{ formatDateTime(row.createdAt) }}
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from '@/components/common/DataTable.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'

interface Props {
  data: unknown[]
  loading: boolean
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

defineProps<Props>()

const emit = defineEmits<{
  'size-change': [size: number]
  'current-change': [page: number]
  'selection-change': [selection: unknown[]]
  'view-detail': [orderId: number]
  'confirm': [orderId: number]
  'cancel': [orderId: number]
  'pickup': [orderId: number]
  'return': [orderId: number]
  'export': []
}>()

const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'orderNo', label: '订单号', width: 180, slot: 'orderNo' },
  { prop: 'customerName', label: '客户姓名', width: 120 },
  { prop: 'customerPhone', label: '客户手机', width: 130 },
  { prop: 'vehicleNumber', label: '车牌号', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'totalAmount', label: '总金额', width: 120, slot: 'totalAmount' },
  { prop: 'createdAt', label: '创建时间', width: 160, slot: 'createdAt' },
]

const tableActions: TableAction[] = [
  { label: '查看', type: 'primary', onClick: (row: any) => emit('view-detail', row.id) },
  { label: '确认', type: 'success', onClick: (row: any) => emit('confirm', row.id), show: (row: { status: string }) => row.status === 'pending' },
  { label: '取消', type: 'danger', onClick: (row: any) => emit('cancel', row.id), show: (row: { status: string }) => row.status === 'pending' },
]

const toolbarButtons: ToolbarButton[] = [
  { label: '导出订单', type: 'primary', onClick: () => emit('export') },
]

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
