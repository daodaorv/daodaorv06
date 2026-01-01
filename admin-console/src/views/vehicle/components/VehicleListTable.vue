<template>
  <DataTable
    :data="data"
    :columns="tableColumns"
    :loading="loading"
    :actions="tableActions"
    :toolbar-buttons="toolbarButtons"
    :pagination="pagination"
    :actions-width="300"
    :show-selection="true"
    @size-change="$emit('size-change', $event)"
    @current-change="$emit('current-change', $event)"
    @selection-change="$emit('selection-change', $event)"
  >
    <template #vehicleNumber="{ row }">
      <el-link type="primary" @click="$emit('view-detail', row)">
        {{ row.vehicleNumber }}
      </el-link>
    </template>

    <template #status="{ row }">
      <el-tag :type="getStatusTag(row.status)" size="small">
        {{ getStatusLabel(row.status) }}
      </el-tag>
    </template>

    <template #ownershipType="{ row }">
      <el-tag :type="getOwnershipTag(row.ownershipType)" size="small">
        {{ getOwnershipLabel(row.ownershipType) }}
      </el-tag>
    </template>

    <template #mileage="{ row }">
      {{ formatMileage(row.mileage) }}
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
  'view-detail': [vehicle: unknown]
  'edit': [vehicle: unknown]
  'delete': [vehicleId: number]
  'view-price-history': [vehicleId: number]
  'create': []
  'batch-delete': []
}>()

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'vehicleNumber', label: '车牌号', width: 120, slot: 'vehicleNumber' },
  { prop: 'modelName', label: '车型', width: 150 },
  { prop: 'brandName', label: '品牌', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'ownershipType', label: '所有权类型', width: 120, slot: 'ownershipType' },
  { prop: 'storeName', label: '所属门店', width: 150 },
  { prop: 'mileage', label: '里程(km)', width: 120, slot: 'mileage' },
  { prop: 'createdAt', label: '创建时间', width: 160, slot: 'createdAt' },
]

// 表格操作按钮
const tableActions: TableAction[] = [
  { label: '编辑', type: 'primary', onClick: (row: any) => emit('edit', row) },
  { label: '价格历史', type: 'info', onClick: (row: any) => emit('view-price-history', row) },
  { label: '删除', type: 'danger', onClick: (row: any) => emit('delete', row) },
]

// 工具栏按钮
const toolbarButtons: ToolbarButton[] = [
  { label: '新增车辆', type: 'primary', onClick: () => emit('create') },
  { label: '批量删除', type: 'danger', onClick: () => emit('batch-delete') },
]

// 获取状态标签类型
const getStatusTag = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    offline: 'danger',
  }
  return statusMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    available: '可用',
    rented: '已租出',
    maintenance: '维护中',
    offline: '已下线',
  }
  return statusMap[status] || status
}

// 获取所有权类型标签
const getOwnershipTag = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    platform: 'primary',
    hosting: 'success',
    cooperative: 'warning',
  }
  return typeMap[type] || 'info'
}

// 获取所有权类型标签
const getOwnershipLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    platform: '平台自有',
    hosting: '房东托管',
    cooperative: '合作伙伴',
  }
  return typeMap[type] || type
}

// 格式化里程
const formatMileage = (mileage: number): string => {
  if (!mileage) return '0'
  return mileage.toLocaleString()
}

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>
