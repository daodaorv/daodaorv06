<!-- @ts-nocheck -->
<template>
  <div class="order-refunds-container">
    <StatsCard :stats="statsConfig" />

    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="refundList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="280"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      // @ts-ignore
      <template #status="{ row }">
        <el-tag :type="getRefundStatusTag(row.status)" size="small">
          {{ getRefundStatusLabel(row.status) }}
        </el-tag>
      </template>
      <template #refundAmount="{ row }">
        <span style="color: #f56c6c; font-weight: bold">
          ¥{{ row.refundAmount.toLocaleString() }}
        </span>
      </template>
      <template #refundMethod="{ row }">
        {{ getRefundMethodLabel(row.refundMethod) }}
      </template>
    </DataTable>

    <!-- 审核退款对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审核退款"
      width="600px"
      @close="handleApproveDialogClose"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">{{ currentRefund?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户"
          >{{ currentRefund?.userName }} - {{ currentRefund?.userPhone }}</el-descriptions-item
        >
        <el-descriptions-item label="退款金额">
          <span style="color: #f56c6c; font-weight: bold">
            ¥{{ currentRefund?.refundAmount.toLocaleString() }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="退款原因">{{
          currentRefund?.refundReason
        }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRefund?.applyTime }}</el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="approveFormRef"
        :model="approveForm"
        :rules="approveFormRules"
        label-width="100px"
        style="margin-top: 20px"
      >
        <el-form-item label="审核结果" prop="approved">
          <el-radio-group v-model="approveForm.approved">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!approveForm.approved" label="拒绝原因" prop="reason">
          <el-input
            v-model="approveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="approveLoading" @click="handleApproveSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 退款重试对话框 -->
    <RefundRetryDialog
      v-model="retryDialogVisible"
      :refund-info="currentRefund"
      @submit="handleRetrySubmit"
    />

    <!-- 退款方式切换对话框 -->
    <RefundMethodDialog
      v-model="methodDialogVisible"
      :refund-info="currentRefund"
      @submit="handleMethodSubmit"
    />

    <!-- 线下退款登记对话框 -->
    <OfflineRefundDialog
      v-model="offlineDialogVisible"
      :refund-info="currentRefund"
      @submit="handleOfflineSubmit"
    />

    <!-- 退款进度查询对话框 -->
    <RefundProgressDialog
      v-model="progressDialogVisible"
      :refund-info="currentRefund"
      @refresh="handleProgressRefresh"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Document, Clock, CircleCheck, Money } from '@element-plus/icons-vue'
import StatsCard from '@/components/common/StatsCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import RefundRetryDialog from '@/components/orders/RefundRetryDialog.vue'
import RefundMethodDialog from '@/components/orders/RefundMethodDialog.vue'
import OfflineRefundDialog from '@/components/orders/OfflineRefundDialog.vue'
import RefundProgressDialog from '@/components/orders/RefundProgressDialog.vue'
import type { StatItem } from '@/components/common/StatsCard.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction } from '@/components/common/DataTable.vue'
import {
  getRefundList,
  getRefundStats,
  approveRefund,
  type Refund,
  type RefundListParams,
} from '@/api/order'
import { useErrorHandler } from '@/composables'

// Composables
const { handleApiError } = useErrorHandler()

// 退款状态选项
const REFUND_STATUS_OPTIONS = [
  { label: '待审核', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '退款中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '退款失败', value: 'failed' },
]

// 搜索表单
const searchForm = reactive<RefundListParams>({
  keyword: '',
  status: undefined,
})

// 统计数据
const stats = reactive({
  totalRefunds: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  totalAmount: 0,
})

// 统计卡片配置
const statsConfig = computed<StatItem[]>(() => [
  {
    label: '退款总数',
    value: stats.totalRefunds,
    icon: Document,
    color: '#409eff',
  },
  {
    label: '待审核',
    value: stats.pending,
    icon: Clock,
    color: '#e6a23c',
  },
  {
    label: '退款中',
    value: stats.processing,
    icon: CircleCheck,
    color: '#67c23a',
  },
  {
    label: '退款总额',
    value: stats.totalAmount,
    icon: Money,
    color: '#f56c6c',
    format: 'currency',
  },
])

// 搜索字段配置
const searchFields = computed<SearchField[]>(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '订单号/用户/手机号',
    width: '200px',
  },
  {
    prop: 'status',
    label: '退款状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '150px',
    options: REFUND_STATUS_OPTIONS,
  },
])

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'orderNo', label: '订单号', width: 180 },
  { prop: 'userName', label: '用户', width: 100 },
  { prop: 'userPhone', label: '手机号', width: 120 },
  { prop: 'refundAmount', label: '退款金额', width: 120, slot: 'refundAmount' },
  { prop: 'refundReason', label: '退款原因', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'refundMethod', label: '退款方式', width: 120, slot: 'refundMethod' },
  { prop: 'applyTime', label: '申请时间', width: 180 },
  { prop: 'approvedBy', label: '审核人', width: 120 },
  { prop: 'completedTime', label: '完成时间', width: 180 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '审核',
    type: 'primary',
    onClick: (row: Refund) => handleApprove(row),
    show: (row: Refund) => row.status === 'pending',
  },
  {
    label: '重试',
    type: 'warning',
    onClick: (row: Refund) => handleRetry(row),
    show: (row: Refund) => row.status === 'failed',
  },
  {
    label: '切换方式',
    type: 'primary',
    onClick: (row: Refund) => handleChangeMethod(row),
    show: (row: Refund) => row.status === 'failed' || row.status === 'processing',
  },
  {
    label: '线下登记',
    type: 'success',
    onClick: (row: Refund) => handleOfflineRefund(row),
    show: (row: Refund) => row.status === 'failed' || row.status === 'approved',
  },
  {
    label: '查询进度',
    type: 'info',
    onClick: (row: Refund) => handleCheckProgress(row),
    show: (row: Refund) => row.status === 'processing' || row.status === 'approved',
  },
]

// 退款列表
const refundList = ref<Refund[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 审核退款对话框
const approveDialogVisible = ref(false)
const approveLoading = ref(false)
const approveFormRef = ref<FormInstance>()
const currentRefund = ref<Refund | null>(null)

const approveForm = reactive({
  approved: true,
  reason: '',
})

const approveFormRules: FormRules = {
  approved: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' },
  ],
}

// 退款重试对话框
const retryDialogVisible = ref(false)

// 退款方式切换对话框
const methodDialogVisible = ref(false)

// 线下退款登记对话框
const offlineDialogVisible = ref(false)

// 退款进度查询对话框
const progressDialogVisible = ref(false)

// 加载退款列表
const loadRefundList = async () => {
  loading.value = true
  try {
    const params: RefundListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    }

    const res = (await getRefundList(params)) as any
    refundList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    handleApiError(error, '加载退款列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = (await getRefundStats()) as any
    stats.totalRefunds = res.data.totalRefunds
    stats.pending = res.data.pending
    stats.processing = res.data.processing
    stats.completed = res.data.completed
    stats.totalAmount = res.data.totalAmount
  } catch (error) {
    handleApiError(error, '加载统计数据失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRefundList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  pagination.page = 1
  loadRefundList()
}

// 审核退款
const handleApprove = (row: Refund) => {
  currentRefund.value = row
  approveForm.approved = true
  approveForm.reason = ''
  approveDialogVisible.value = true
}

// 退款重试
const handleRetry = (row: Refund) => {
  currentRefund.value = row
  retryDialogVisible.value = true
}

// 切换退款方式
const handleChangeMethod = (row: Refund) => {
  currentRefund.value = row
  methodDialogVisible.value = true
}

// 线下退款登记
const handleOfflineRefund = (row: Refund) => {
  currentRefund.value = row
  offlineDialogVisible.value = true
}

// 查询退款进度
const handleCheckProgress = (row: Refund) => {
  currentRefund.value = row
  progressDialogVisible.value = true
}

// 提交审核
const handleApproveSubmit = async () => {
  if (!approveFormRef.value || !currentRefund.value) return

  // 如果拒绝，需要验证拒绝原因
  if (!approveForm.approved) {
    await approveFormRef.value.validate(async valid => {
      if (!valid) return
      await submitApprove()
    })
  } else {
    await submitApprove()
  }
}

const submitApprove = async () => {
  approveLoading.value = true
  try {
    await approveRefund(currentRefund.value!.id, approveForm.approved, approveForm.reason)
    ElMessage.success(approveForm.approved ? '审核通过' : '审核拒绝')
    approveDialogVisible.value = false
    loadRefundList()
    loadStats()
  } catch (error) {
    handleApiError(error, '审核失败')
  } finally {
    approveLoading.value = false
  }
}

// 对话框关闭
const handleApproveDialogClose = () => {
  approveFormRef.value?.resetFields()
  approveForm.approved = true
  approveForm.reason = ''
  currentRefund.value = null
}

// 提交重试
const handleRetrySubmit = async (data: any) => {
  try {
    // TODO: 调用重试API
    console.log('重试数据:', data)
    ElMessage.success('退款重试已提交')
    retryDialogVisible.value = false
    loadRefundList()
    loadStats()
  } catch (error) {
    handleApiError(error, '退款重试失败')
  }
}

// 提交切换方式
const handleMethodSubmit = async (data: any) => {
  try {
    // TODO: 调用切换方式API
    console.log('切换方式数据:', data)
    ElMessage.success('退款方式切换成功')
    methodDialogVisible.value = false
    loadRefundList()
    loadStats()
  } catch (error) {
    handleApiError(error, '切换退款方式失败')
  }
}

// 提交线下退款
const handleOfflineSubmit = async (data: any) => {
  try {
    // TODO: 调用线下退款API
    console.log('线下退款数据:', data)
    ElMessage.success('线下退款登记成功')
    offlineDialogVisible.value = false
    loadRefundList()
    loadStats()
  } catch (error) {
    handleApiError(error, '线下退款登记失败')
  }
}

// 刷新进度
const handleProgressRefresh = async (refundId: number) => {
  try {
    // TODO: 调用刷新进度API
    console.log('刷新进度:', refundId)
    // 刷新列表以获取最新状态
    loadRefundList()
  } catch (error) {
    handleApiError(error, '刷新进度失败')
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadRefundList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRefundList()
}

// 获取退款状态标签类型
const getRefundStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    processing: 'primary',
    completed: 'success',
    failed: 'danger',
  }
  return tagMap[status] || 'info'
}

// 获取退款状态标签文本
const getRefundStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    processing: '退款中',
    completed: '已完成',
    failed: '退款失败',
  }
  return labelMap[status] || status
}

// 获取退款方式标签文本
const getRefundMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    original: '原路退回',
    bank: '银行卡',
    alipay: '支付宝',
    wechat: '微信',
  }
  return labelMap[method] || method
}

// 页面加载
onMounted(() => {
  loadRefundList()
  loadStats()
})
</script>

<style scoped lang="scss">
.order-refunds-container {
  padding: 20px;
}
</style>
