<!-- @ts-nocheck -->
<template>
  <div class="crowdfunding-transactions-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="transactionsList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 交易编号 -->
      <template #transactionNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.transactionNo }}
        </span>
      </template>

      <!-- 项目信息 -->
      <template #projectInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.projectTitle }}</div>
          <div style="color: #909399">{{ row.projectNo }}</div>
        </div>
      </template>

      <!-- 卖方信息 -->
      <template #sellerInfo="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.sellerName }}</div>
          <div style="color: #909399">{{ row.sellerPhone }}</div>
        </div>
      </template>

      <!-- 买方信息 -->
      <template #buyerInfo="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.buyerName }}</div>
          <div style="color: #909399">{{ row.buyerPhone }}</div>
        </div>
      </template>

      <!-- 份额数量 -->
      <template #shares="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
      </template>

      <!-- 交易价格 -->
      <template #transactionPrice="{ row }">
        <span style="color: #f56c6c; font-weight: bold">
          ¥{{ row.transactionPrice.toLocaleString() }}
        </span>
      </template>

      <!-- 价格变化 -->
      <template #priceChange="{ row }">
        <div style="font-size: 12px">
          <div style="color: #909399">
            参考价: ¥{{ row.referencePrice.toLocaleString() }}
          </div>
          <div :style="{ color: getPriceChangeColor(row) }">
            {{ getPriceChangeText(row) }}
          </div>
        </div>
      </template>

      <!-- 交易状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </DataTable>

    <!-- 交易详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="交易详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="currentTransaction" class="transaction-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>交易信息</span>
              <el-tag :type="getStatusTag(currentTransaction.status)" size="small">
                {{ getStatusLabel(currentTransaction.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="交易编号">
              {{ currentTransaction.transactionNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目编号">
              {{ currentTransaction.projectNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目标题">
              {{ currentTransaction.projectTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="车型信息">
              {{ currentTransaction.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="卖方">
              {{ currentTransaction.sellerName }} ({{ currentTransaction.sellerPhone }})
            </el-descriptions-item>
            <el-descriptions-item label="买方">
              {{ currentTransaction.buyerName }} ({{ currentTransaction.buyerPhone }})
            </el-descriptions-item>
            <el-descriptions-item label="交易份额">
              <span style="color: #409eff; font-weight: bold">
                {{ currentTransaction.shares }}份
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="交易价格">
              <span style="color: #f56c6c; font-weight: bold">
                ¥{{ currentTransaction.transactionPrice.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="参考价格">
              <span style="color: #909399">
                ¥{{ currentTransaction.referencePrice.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="价格变化">
              <span :style="{ color: getPriceChangeColor(currentTransaction) }">
                {{ getPriceChangeText(currentTransaction) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="交易时间">
              {{ currentTransaction.transactionTime }}
            </el-descriptions-item>
            <el-descriptions-item label="交易状态">
              <el-tag :type="getStatusTag(currentTransaction.status)" size="small">
                {{ getStatusLabel(currentTransaction.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 交易操作 -->
        <el-card
          v-if="currentTransaction.status === 'pending'"
          class="detail-card"
          shadow="never"
          style="margin-top: 20px"
        >
          <template #header>
            <div class="card-header">
              <span>交易操作</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTag(currentTransaction.status)" size="small">
                {{ getStatusLabel(currentTransaction.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="操作">
              <el-button type="danger" @click="handleCancelTransaction(currentTransaction)">
                取消交易
              </el-button>
            </el-form-item>
            <el-form-item label="说明">
              <div style="font-size: 13px; color: #606266; line-height: 1.8">
                <div>• <strong>待确认</strong>: 交易正在等待双方确认</div>
                <div>• <strong>已完成</strong>: 交易已成功完成</div>
                <div>• <strong>已取消</strong>: 交易已被取消</div>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction } from '@/components/common/DataTable.vue'
import { useErrorHandler } from '@/composables'

// Composables
const { handleApiError } = useErrorHandler()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  projectId: null as number | null,
  status: '',
  startDate: '',
  endDate: '',
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '交易编号/卖方/买方',
    width: '200px',
  },
  {
    prop: 'status',
    label: '交易状态',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '待确认', value: 'pending' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
    ],
  },
  {
    prop: 'startDate',
    label: '开始日期',
    type: 'date',
    placeholder: '选择日期',
    width: '150px',
  },
  {
    prop: 'endDate',
    label: '结束日期',
    type: 'date',
    placeholder: '选择日期',
    width: '150px',
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'transactionNo', label: '交易编号', width: 180, slot: 'transactionNo' },
  { prop: 'projectInfo', label: '项目信息', width: 200, slot: 'projectInfo' },
  { prop: 'sellerInfo', label: '卖方', width: 130, slot: 'sellerInfo' },
  { prop: 'buyerInfo', label: '买方', width: 130, slot: 'buyerInfo' },
  { prop: 'shares', label: '交易份额', width: 100, slot: 'shares' },
  { prop: 'transactionPrice', label: '交易价格', width: 120, slot: 'transactionPrice' },
  { prop: 'priceChange', label: '价格变化', width: 150, slot: 'priceChange' },
  { prop: 'status', label: '交易状态', width: 100, slot: 'status' },
  { prop: 'transactionTime', label: '交易时间', width: 180 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '取消交易',
    type: 'danger',
    onClick: (row: any) => handleCancelTransaction(row),
    show: (row: any) => row.status === 'pending',
  },
]

// 交易列表
const transactionsList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentTransaction = ref<any>(null)

// 加载交易列表
const loadTransactions = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        id: 1,
        transactionNo: 'TR202501001',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        sellerId: 2,
        sellerName: '李四',
        sellerPhone: '13800138002',
        buyerId: 5,
        buyerName: '孙七',
        buyerPhone: '13800138005',
        shares: 1,
        transactionPrice: 52000,
        referencePrice: 51500,
        status: 'completed',
        transactionTime: '2025-01-10 14:30:00',
      },
      {
        id: 2,
        transactionNo: 'TR202501002',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        sellerId: 3,
        sellerName: '王五',
        sellerPhone: '13800138003',
        buyerId: 6,
        buyerName: '周八',
        buyerPhone: '13800138006',
        shares: 1,
        transactionPrice: 51000,
        referencePrice: 51500,
        status: 'pending',
        transactionTime: '2025-01-15 10:20:00',
      },
      {
        id: 3,
        transactionNo: 'TR202412001',
        projectId: 2,
        projectNo: 'CF202501002',
        projectTitle: '依维柯欧胜C型房车众筹',
        modelName: '依维柯欧胜C型房车',
        sellerId: 5,
        sellerName: '孙七',
        sellerPhone: '13800138005',
        buyerId: 1,
        buyerName: '张三',
        buyerPhone: '13800138001',
        shares: 1,
        transactionPrice: 50000,
        referencePrice: 51300,
        status: 'completed',
        transactionTime: '2024-12-15 14:30:00',
      },
      {
        id: 4,
        transactionNo: 'TR202412002',
        projectId: 2,
        projectNo: 'CF202501002',
        projectTitle: '依维柯欧胜C型房车众筹',
        modelName: '依维柯欧胜C型房车',
        sellerId: 2,
        sellerName: '李四',
        sellerPhone: '13800138002',
        buyerId: 4,
        buyerName: '赵六',
        buyerPhone: '13800138004',
        shares: 2,
        transactionPrice: 100000,
        referencePrice: 102600,
        status: 'cancelled',
        transactionTime: '2024-12-20 09:15:00',
      },
    ]

    transactionsList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载交易列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadTransactions()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.projectId = null
  searchForm.status = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  pagination.page = 1
  loadTransactions()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTransactions()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTransactions()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentTransaction.value = row
  detailDialogVisible.value = true
}

// 取消交易
const handleCancelTransaction = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消交易 "${row.transactionNo}" 吗？取消后份额将退回卖方账户。`,
      '取消确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新交易状态
    row.status = 'cancelled'
    if (currentTransaction.value && currentTransaction.value.id === row.id) {
      currentTransaction.value.status = 'cancelled'
    }

    ElMessage.success('交易已取消')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '取消失败')
    }
  }
}

// 获取价格变化颜色
const getPriceChangeColor = (row: any) => {
  const change = row.transactionPrice - row.referencePrice
  return change > 0 ? '#f56c6c' : change < 0 ? '#67c23a' : '#909399'
}

// 获取价格变化文本
const getPriceChangeText = (row: any) => {
  const change = row.transactionPrice - row.referencePrice
  const percent = row.referencePrice > 0 ? ((change / row.referencePrice) * 100).toFixed(2) : '0.00'
  if (change > 0) {
    return `溢价 +¥${change.toLocaleString()} (+${percent}%)`
  } else if (change < 0) {
    return `折价 -¥${Math.abs(change).toLocaleString()} (${percent}%)`
  } else {
    return '平价交易'
  }
}

// 获取状态标签类型
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

// 页面加载
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped lang="scss">
.crowdfunding-transactions-container {
  padding: 20px;

  .transaction-detail {
    .detail-card {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
