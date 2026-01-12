<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ecf5ff">
              <el-icon :size="32" color="#409eff"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总分润金额</div>
              <div class="stat-value">¥{{ stats.totalAmount.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fdf6ec">
              <el-icon :size="32" color="#e6a23c"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">待结算</div>
              <div class="stat-value">{{ stats.pendingCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#409eff"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已结算</div>
              <div class="stat-value">{{ stats.settledCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已支付</div>
              <div class="stat-value">{{ stats.paidCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="table-toolbar">
      <el-button type="primary" :disabled="selectedIds.length === 0" @click="handleBatchSettle">
        <el-icon><DocumentChecked /></el-icon>
        批量结算
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出记录
      </el-button>
    </div>

    <DataTable
      :data="recordList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      :show-selection="true"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #recordNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.recordNo }}
        </span>
      </template>
      <template #promoterInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.promoterName }}</div>
          <div style="color: #909399">{{ row.promoterPhone }}</div>
        </div>
      </template>
      <template #promoterLevel="{ row }">
        <el-tag :type="row.promoterLevel === 'level1' ? 'success' : 'warning'" size="small">
          {{ row.promoterLevel === 'level1' ? '一级推广' : '二级推广' }}
        </el-tag>
      </template>
      <template #amount="{ row }">
        <span style="color: #409eff; font-weight: bold">
          ¥{{ row.amount.toLocaleString() }}
        </span>
      </template>
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </DataTable>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="推广分润详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录编号">
            {{ currentRecord.recordNo }}
          </el-descriptions-item>
          <el-descriptions-item label="推广员姓名">
            {{ currentRecord.promoterName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentRecord.promoterPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="推广级别">
            <el-tag
              :type="currentRecord.promoterLevel === 'level1' ? 'success' : 'warning'"
              size="small"
            >
              {{ currentRecord.promoterLevel === 'level1' ? '一级推广' : '二级推广' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ currentRecord.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #409eff; font-weight: bold">
              ¥{{ currentRecord.orderAmount.toLocaleString() }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="分润金额">
            <span style="color: #67c23a; font-weight: bold; font-size: 18px">
              ¥{{ currentRecord.amount.toLocaleString() }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="分润状态">
            <el-tag :type="getStatusTag(currentRecord.status)" size="small">
              {{ getStatusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentRecord.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="结算时间">
            {{ currentRecord.settlementDate || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentRecord && currentRecord.status === 'pending'"
          type="primary"
          @click="handleSettle(currentRecord)"
        >
          结算
        </el-button>
        <el-button
          v-if="currentRecord && currentRecord.status === 'settled'"
          type="success"
          @click="handlePay(currentRecord)"
        >
          支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Money,
  Clock,
  DocumentChecked,
  CircleCheck,
  Download,
} from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { TableAction } from '@/components/common/DataTable.vue'

// Mock 数据类型定义
interface PromotionProfitRecord {
  id: number
  recordNo: string
  promoterName: string
  promoterPhone: string
  promoterLevel: 'level1' | 'level2'
  orderNo: string
  orderAmount: number
  amount: number
  status: 'pending' | 'settled' | 'paid'
  createdAt: string
  settlementDate?: string
}

interface Stats {
  totalAmount: number
  pendingCount: number
  settledCount: number
  paidCount: number
}

// 状态选项
const STATUS_OPTIONS = [
  { label: '待结算', value: 'pending' },
  { label: '已结算', value: 'settled' },
  { label: '已支付', value: 'paid' },
]

const LEVEL_OPTIONS = [
  { label: '一级推广', value: 'level1' },
  { label: '二级推广', value: 'level2' },
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  promoterLevel: '',
  status: '',
  dateRange: [] as string[],
})

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '记录编号/推广员姓名/手机号',
    width: '240px',
  },
  {
    prop: 'promoterLevel',
    label: '推广级别',
    type: 'select',
    placeholder: '全部级别',
    options: LEVEL_OPTIONS,
    width: '150px',
  },
  {
    prop: 'status',
    label: '分润状态',
    type: 'select',
    placeholder: '全部状态',
    options: STATUS_OPTIONS,
    width: '150px',
  },
  {
    prop: 'dateRange',
    label: '时间范围',
    type: 'daterange',
    placeholder: '选择时间范围',
    width: '240px',
  },
]) as any

// 表格列配置
const tableColumns = computed(() => [
  { prop: 'recordNo', label: '记录编号', width: 150, slot: true },
  { prop: 'promoterInfo', label: '推广员信息', width: 150, slot: true },
  { prop: 'promoterLevel', label: '推广级别', width: 100, slot: true },
  { prop: 'orderNo', label: '订单编号', width: 150 },
  { prop: 'orderAmount', label: '订单金额', width: 120 },
  { prop: 'amount', label: '分润金额', width: 120, slot: true },
  { prop: 'status', label: '分润状态', width: 100, slot: true },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]) as any

// 表格操作配置
const tableActions = computed<TableAction[]>(() => [
  {
    label: '查看详情',
    type: 'primary',
    onClick: handleViewDetail,
  },
  {
    label: '结算',
    type: 'primary',
    onClick: handleSettle,
    show: (row: PromotionProfitRecord) => row.status === 'pending',
  },
  {
    label: '支付',
    type: 'success',
    onClick: handlePay,
    show: (row: PromotionProfitRecord) => row.status === 'settled',
  },
])

// 数据状态
const recordList = ref<PromotionProfitRecord[]>([])
const loading = ref(false)
const stats = ref<Stats>({
  totalAmount: 0,
  pendingCount: 0,
  settledCount: 0,
  paidCount: 0,
})

// 分页
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
})

// 对话框状态
const detailDialogVisible = ref(false)
const currentRecord = ref<PromotionProfitRecord | null>(null)
const selectedIds = ref<number[]>([])

// Mock 数据生成
const generateMockData = (): PromotionProfitRecord[] => {
  const data: PromotionProfitRecord[] = []
  const statuses: Array<'pending' | 'settled' | 'paid'> = ['pending', 'settled', 'paid']
  const levels: Array<'level1' | 'level2'> = ['level1', 'level2']

  for (let i = 1; i <= 50; i++) {
    data.push({
      id: i,
      recordNo: `PR${String(i).padStart(6, '0')}`,
      promoterName: `推广员${i}`,
      promoterPhone: `138${String(i).padStart(8, '0')}`,
      promoterLevel: levels[Math.floor(Math.random() * levels.length)],
      orderNo: `ORD${String(i).padStart(8, '0')}`,
      orderAmount: Math.floor(Math.random() * 10000) + 1000,
      amount: Math.floor(Math.random() * 1000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      settlementDate: Math.random() > 0.5 ? new Date().toISOString().slice(0, 10) : undefined,
    })
  }
  return data
}

const mockData = generateMockData()

// 获取统计数据
const fetchStats = () => {
  stats.value = {
    totalAmount: mockData.reduce((sum, item) => sum + item.amount, 0),
    pendingCount: mockData.filter(item => item.status === 'pending').length,
    settledCount: mockData.filter(item => item.status === 'settled').length,
    paidCount: mockData.filter(item => item.status === 'paid').length,
  }
}

// 获取记录列表
const fetchRecordList = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]

    // 关键词筛选
    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.recordNo.includes(searchForm.keyword) ||
        item.promoterName.includes(searchForm.keyword) ||
        item.promoterPhone.includes(searchForm.keyword)
      )
    }

    // 级别筛选
    if (searchForm.promoterLevel) {
      filteredData = filteredData.filter(item => item.promoterLevel === searchForm.promoterLevel)
    }

    // 状态筛选
    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    recordList.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRecordList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.promoterLevel = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.page = 1
  fetchRecordList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchRecordList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchRecordList()
}

// 选择变化
const handleSelectionChange = (selection: PromotionProfitRecord[]) => {
  selectedIds.value = selection
    .filter(record => record.status === 'pending')
    .map(record => record.id)
}

// 查看详情
const handleViewDetail = (row: PromotionProfitRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 结算
const handleSettle = async (row: PromotionProfitRecord) => {
  try {
    await ElMessageBox.confirm(
      `确认结算记录"${row.recordNo}"吗？`,
      '结算确认',
      { type: 'warning' }
    )
    ElMessage.success('结算成功')
    row.status = 'settled'
    row.settlementDate = new Date().toISOString().slice(0, 10)
    detailDialogVisible.value = false
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('结算失败')
    }
  }
}

// 批量结算
const handleBatchSettle = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择待结算的记录')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认批量结算${selectedIds.value.length}条记录吗？`,
      '批量结算确认',
      { type: 'warning' }
    )
    ElMessage.success('批量结算成功')
    fetchRecordList()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量结算失败')
    }
  }
}

// 支付
const handlePay = async (row: PromotionProfitRecord) => {
  try {
    await ElMessageBox.confirm(
      `确认支付记录"${row.recordNo}"吗？`,
      '支付确认',
      { type: 'warning' }
    )
    ElMessage.success('支付成功')
    row.status = 'paid'
    detailDialogVisible.value = false
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('支付失败')
    }
  }
}

// 导出记录
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 获取状态标签类型
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    pending: 'warning',
    settled: 'primary',
    paid: 'success',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待结算',
    settled: '已结算',
    paid: '已支付',
  }
  return labelMap[status] || status
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchRecordList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }
}

.table-toolbar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}
</style>

