<template>
  <div class="order-list-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <OrderListTable
      :data="list"
      :loading="loading"
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      @view-detail="handleViewDetail"
      @confirm="handleConfirmOrder"
      @cancel="handleCancel"
      @pickup="handlePickupOrder"
      @return="handleReturnOrder"
      @export="handleExport"
    />

    <!-- 订单详情对话框 -->
    <OrderDetailDialog
      v-model="detailDialog.visible"
      :order="orderDetail"
      :loading="detailLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/common/SearchForm.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import OrderListTable from './components/OrderListTable.vue'
import OrderDetailDialog from './components/OrderDetailDialog.vue'
import { useOrderList } from './composables/useOrderList'
import { useOrderDetail } from './composables/useOrderDetail'
import { useOrderActions } from './composables/useOrderActions'

// 列表逻辑
const {
  searchForm,
  list,
  loading,
  pagination,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleCancel,
  refresh,
} = useOrderList()

// 详情逻辑
const {
  detailDialog,
  orderDetail,
  detailLoading,
  handleViewDetail,
} = useOrderDetail()

// 操作逻辑
const {
  handleConfirm,
  handlePickup,
  handleReturn,
} = useOrderActions(refresh)

// 确认订单
const handleConfirmOrder = async (orderId: number): Promise<void> => {
  await handleConfirm(orderId)
}

// 取车
const handlePickupOrder = (orderId: number): void => {
  ElMessage.info('取车功能开发中')
}

// 还车
const handleReturnOrder = (orderId: number): void => {
  ElMessage.info('还车功能开发中')
}

// 导出订单
const handleExport = (): void => {
  ElMessage.info('导出功能开发中')
}

// 搜索表单字段配置
const searchFields: SearchField[] = [
  {
    prop: 'orderNo',
    label: '订单号',
    type: 'input',
    placeholder: '请输入订单号',
  },
  {
    prop: 'customerName',
    label: '客户姓名',
    type: 'input',
    placeholder: '请输入客户姓名',
  },
  {
    prop: 'customerPhone',
    label: '客户手机',
    type: 'input',
    placeholder: '请输入客户手机',
  },
  {
    prop: 'status',
    label: '订单状态',
    type: 'select',
    placeholder: '请选择订单状态',
    options: [
      { label: '全部', value: '' },
      { label: '待确认', value: 'pending' },
      { label: '已确认', value: 'confirmed' },
      { label: '进行中', value: 'in_progress' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
  },
  {
    prop: 'startDate',
    label: '开始日期',
    type: 'date',
    placeholder: '请选择开始日期',
  },
  {
    prop: 'endDate',
    label: '结束日期',
    type: 'date',
    placeholder: '请选择结束日期',
  },
]
</script>

<style scoped>
.order-list-container {
  padding: 20px;
}
</style>
