<template>
  <div class="vehicle-list-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <VehicleListTable
      :data="list"
      :loading="loading"
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      @view-detail="handleViewDetail"
      @edit="handleEdit"
      @delete="handleDelete"
      @view-price-history="handleViewPriceHistory"
      @create="handleCreate"
      @batch-delete="handleBatchDelete"
    />

    <!-- 车辆表单对话框 -->
    <VehicleFormDialog
      v-model="formDialog.visible"
      :title="dialogTitle"
      :form-data="formData"
      :loading="submitLoading"
      :is-edit="isEdit"
      @submit="handleSubmit"
    />

    <!-- 价格历史对话框 -->
    <VehiclePriceHistoryDialog
      v-model="priceHistoryDialog.visible"
      :price-history="priceHistory"
      :loading="historyLoading"
    />
  </div>
</template>

<script setup lang="ts">
import SearchForm from '@/components/common/SearchForm.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import VehicleListTable from './components/VehicleListTable.vue'
import VehicleFormDialog from './components/VehicleFormDialog.vue'
import VehiclePriceHistoryDialog from './components/VehiclePriceHistoryDialog.vue'
import { useVehicleList } from './composables/useVehicleList'
import { useVehicleForm } from './composables/useVehicleForm'
import { usePriceHistory } from './composables/usePriceHistory'
import { useVehicleBatch } from './composables/useVehicleBatch'
import { ElMessage } from 'element-plus'

// 列表逻辑
const {
  searchForm,
  list,
  loading,
  pagination,
  selectedVehicles,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleDelete,
  refresh,
} = useVehicleList()

// 表单逻辑
const {
  formDialog,
  formData,
  submitLoading,
  isEdit,
  dialogTitle,
  handleCreate,
  handleEdit,
  handleSubmit,
} = useVehicleForm(refresh)

// 价格历史逻辑
const {
  priceHistoryDialog,
  priceHistory,
  historyLoading,
  handleViewPriceHistory,
} = usePriceHistory()

// 批量操作逻辑
const {
  handleBatchDelete,
} = useVehicleBatch(selectedVehicles, refresh)

// 查看详情
const handleViewDetail = (vehicle: unknown): void => {
  ElMessage.info('查看详情功能开发中')
}

// 搜索表单字段配置
const searchFields: SearchField[] = [
  {
    prop: 'vehicleNumber',
    label: '车牌号',
    type: 'input',
    placeholder: '请输入车牌号',
  },
  {
    prop: 'modelName',
    label: '车型',
    type: 'input',
    placeholder: '请输入车型',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '可用', value: 'available' },
      { label: '已租出', value: 'rented' },
      { label: '维护中', value: 'maintenance' },
      { label: '已下线', value: 'offline' },
    ],
  },
  {
    prop: 'ownershipType',
    label: '所有权类型',
    type: 'select',
    placeholder: '请选择所有权类型',
    options: [
      { label: '全部', value: '' },
      { label: '平台自有', value: 'platform' },
      { label: '房东托管', value: 'hosting' },
      { label: '合作伙伴', value: 'cooperative' },
    ],
  },
]
</script>

<style scoped>
.vehicle-list-container {
  padding: 20px;
}
</style>
