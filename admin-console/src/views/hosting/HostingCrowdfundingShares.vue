<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="sharesList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 份额编号 -->
      <template #shareNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.shareNo }}
        </span>
      </template>

      <!-- 项目信息 -->
      <template #projectInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.projectTitle }}</div>
          <div style="color: #909399">{{ row.projectNo }}</div>
        </div>
      </template>

      <!-- 车型信息 -->
      <template #modelInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.modelName }}</div>
          <div style="color: #909399">{{ row.brandName }}</div>
        </div>
      </template>

      <!-- 持有人信息 -->
      <template #ownerInfo="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.ownerName }}</div>
          <div style="color: #909399">{{ row.ownerPhone }}</div>
        </div>
      </template>

      <!-- 份额数量 -->
      <template #shares="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
      </template>

      <!-- 购买价格 -->
      <template #purchasePrice="{ row }">
        <span style="color: #f56c6c; font-weight: bold">
          ¥{{ row.purchasePrice.toLocaleString() }}
        </span>
      </template>

      <!-- 当前市价 -->
      <template #currentPrice="{ row }">
        <div style="font-size: 12px">
          <div style="color: #409eff; font-weight: bold">
            ¥{{ row.currentPrice.toLocaleString() }}
          </div>
          <div :style="{ color: getPriceChangeColor(row) }">
            {{ getPriceChangeText(row) }}
          </div>
        </div>
      </template>

      <!-- 累计收益 -->
      <template #totalIncome="{ row }">
        <span style="color: #67c23a; font-weight: bold">
          ¥{{ row.totalIncome.toLocaleString() }}
        </span>
      </template>

      <!-- 收益率 -->
      <template #returnRate="{ row }">
        <span :style="{ color: row.returnRate >= 0 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
          {{ row.returnRate >= 0 ? '+' : '' }}{{ row.returnRate }}%
        </span>
      </template>

      <!-- 份额状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </DataTable>

    <!-- 份额详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="份额详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="currentShare" class="share-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="getStatusTag(currentShare.status)" size="small">
                {{ getStatusLabel(currentShare.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="份额编号">
              {{ currentShare.shareNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目编号">
              {{ currentShare.projectNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目标题">
              {{ currentShare.projectTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="车型信息">
              {{ currentShare.brandName }} {{ currentShare.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="持有人">
              {{ currentShare.ownerName }} ({{ currentShare.ownerPhone }})
            </el-descriptions-item>
            <el-descriptions-item label="份额数量">
              <span style="color: #409eff; font-weight: bold"> {{ currentShare.shares }}份 </span>
            </el-descriptions-item>
            <el-descriptions-item label="购买价格">
              <span style="color: #f56c6c; font-weight: bold">
                ¥{{ currentShare.purchasePrice.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="当前市价">
              <span style="color: #409eff; font-weight: bold">
                ¥{{ currentShare.currentPrice.toLocaleString() }}
              </span>
              <span :style="{ color: getPriceChangeColor(currentShare), marginLeft: '8px' }">
                {{ getPriceChangeText(currentShare) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="累计收益">
              <span style="color: #67c23a; font-weight: bold">
                ¥{{ currentShare.totalIncome.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="收益率">
              <span
                :style="{
                  color: currentShare.returnRate >= 0 ? '#67c23a' : '#f56c6c',
                  fontWeight: 'bold',
                }"
              >
                {{ currentShare.returnRate >= 0 ? '+' : '' }}{{ currentShare.returnRate }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="购买时间">
              {{ currentShare.purchasedAt }}
            </el-descriptions-item>
            <el-descriptions-item label="份额状态">
              <el-tag :type="getStatusTag(currentShare.status)" size="small">
                {{ getStatusLabel(currentShare.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 转移记录 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>转移记录 ({{ currentShare.transferHistory.length }}次)</span>
            </div>
          </template>
          <el-table
            v-if="currentShare.transferHistory.length > 0"
            :data="currentShare.transferHistory"
            border
            max-height="300"
          >
            <el-table-column prop="transferNo" label="转移编号" width="150" />
            <el-table-column prop="fromOwner" label="转出方" width="120" />
            <el-table-column prop="toOwner" label="转入方" width="120" />
            <el-table-column prop="shares" label="转移份额" width="100">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="转移价格" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.price.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTransferStatusTag(row.status)" size="small">
                  {{ getTransferStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="transferredAt" label="转移时间" width="180" />
          </el-table>
          <el-empty v-else description="暂无转移记录" />
        </el-card>

        <!-- 份额操作 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>份额操作</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTag(currentShare.status)" size="small">
                {{ getStatusLabel(currentShare.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="操作">
              <el-button
                v-if="currentShare.status === 'normal'"
                type="warning"
                @click="handleLockShare(currentShare)"
              >
                锁定份额
              </el-button>
              <el-button
                v-if="currentShare.status === 'locked'"
                type="success"
                @click="handleUnlockShare(currentShare)"
              >
                解锁份额
              </el-button>
            </el-form-item>
            <el-form-item label="说明">
              <div style="font-size: 13px; color: #606266; line-height: 1.8">
                <div>• <strong>正常</strong>: 份额可以正常交易和收益分配</div>
                <div>• <strong>锁定</strong>: 份额被锁定，暂时无法交易</div>
                <div>• <strong>交易中</strong>: 份额正在交易过程中</div>
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
  ownerId: null as number | null,
  status: '',
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '份额编号/持有人',
    width: '200px',
  },
  {
    prop: 'status',
    label: '份额状态',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '正常', value: 'normal' },
      { label: '锁定', value: 'locked' },
      { label: '交易中', value: 'trading' },
    ],
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'shareNo', label: '份额编号', width: 150, slot: 'shareNo' },
  { prop: 'projectInfo', label: '项目信息', width: 200, slot: 'projectInfo' },
  { prop: 'modelInfo', label: '车型信息', width: 180, slot: 'modelInfo' },
  { prop: 'ownerInfo', label: '持有人', width: 130, slot: 'ownerInfo' },
  { prop: 'shares', label: '份额数量', width: 100, slot: 'shares' },
  { prop: 'purchasePrice', label: '购买价格', width: 120, slot: 'purchasePrice' },
  { prop: 'currentPrice', label: '当前市价', width: 130, slot: 'currentPrice' },
  { prop: 'totalIncome', label: '累计收益', width: 120, slot: 'totalIncome' },
  { prop: 'returnRate', label: '收益率', width: 100, slot: 'returnRate' },
  { prop: 'status', label: '份额状态', width: 100, slot: 'status' },
  { prop: 'purchasedAt', label: '购买时间', width: 180 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '锁定',
    type: 'warning',
    onClick: (row: any) => handleLockShare(row),
    show: (row: any) => row.status === 'normal',
  },
  {
    label: '解锁',
    type: 'success',
    onClick: (row: any) => handleUnlockShare(row),
    show: (row: any) => row.status === 'locked',
  },
  {
    label: '转移记录',
    type: 'info',
    onClick: (row: any) => handleViewTransferHistory(row),
  },
]

// 份额列表
const sharesList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentShare = ref<any>(null)

// 加载份额列表
const loadShares = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        id: 1,
        shareNo: 'SH202501001-001',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        ownerId: 1,
        ownerName: '张三',
        ownerPhone: '13800138001',
        shares: 3,
        purchasePrice: 150000,
        currentPrice: 155000,
        totalIncome: 9000,
        returnRate: 9.33,
        status: 'normal',
        purchasedAt: '2025-01-01 10:00:00',
        transferHistory: [],
      },
      {
        id: 2,
        shareNo: 'SH202501001-002',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        ownerId: 2,
        ownerName: '李四',
        ownerPhone: '13800138002',
        shares: 2,
        purchasePrice: 100000,
        currentPrice: 103000,
        totalIncome: 6000,
        returnRate: 9.0,
        status: 'normal',
        purchasedAt: '2025-01-02 14:30:00',
        transferHistory: [],
      },
      {
        id: 3,
        shareNo: 'SH202501001-003',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        ownerId: 3,
        ownerName: '王五',
        ownerPhone: '13800138003',
        shares: 2,
        purchasePrice: 100000,
        currentPrice: 103000,
        totalIncome: 6000,
        returnRate: 9.0,
        status: 'locked',
        purchasedAt: '2025-01-03 09:15:00',
        transferHistory: [],
      },
      {
        id: 4,
        shareNo: 'SH202501001-004',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        ownerId: 4,
        ownerName: '赵六',
        ownerPhone: '13800138004',
        shares: 1,
        purchasePrice: 50000,
        currentPrice: 51500,
        totalIncome: 3000,
        returnRate: 9.0,
        status: 'normal',
        purchasedAt: '2025-01-04 16:20:00',
        transferHistory: [],
      },
      {
        id: 5,
        shareNo: 'SH202501002-001',
        projectId: 2,
        projectNo: 'CF202501002',
        projectTitle: '依维柯欧胜C型房车众筹',
        modelName: '依维柯欧胜C型房车',
        brandName: '依维柯',
        ownerId: 1,
        ownerName: '张三',
        ownerPhone: '13800138001',
        shares: 3,
        purchasePrice: 150000,
        currentPrice: 154000,
        totalIncome: 6000,
        returnRate: 6.67,
        status: 'normal',
        purchasedAt: '2024-12-01 09:00:00',
        transferHistory: [
          {
            transferNo: 'TR202412001',
            fromOwner: '李四',
            toOwner: '张三',
            shares: 1,
            price: 50000,
            status: 'completed',
            transferredAt: '2024-12-15 14:30:00',
          },
        ],
      },
    ]

    sharesList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载份额列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadShares()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.projectId = null
  searchForm.ownerId = null
  searchForm.status = ''
  pagination.page = 1
  loadShares()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadShares()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadShares()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentShare.value = row
  detailDialogVisible.value = true
}

// 锁定份额
const handleLockShare = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要锁定份额 "${row.shareNo}" 吗？锁定后该份额将无法交易。`,
      '锁定确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新份额状态
    row.status = 'locked'
    if (currentShare.value && currentShare.value.id === row.id) {
      currentShare.value.status = 'locked'
    }

    ElMessage.success('份额已锁定')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '锁定失败')
    }
  }
}

// 解锁份额
const handleUnlockShare = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要解锁份额 "${row.shareNo}" 吗？解锁后该份额可以正常交易。`,
      '解锁确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新份额状态
    row.status = 'normal'
    if (currentShare.value && currentShare.value.id === row.id) {
      currentShare.value.status = 'normal'
    }

    ElMessage.success('份额已解锁')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '解锁失败')
    }
  }
}

// 查看转移记录
const handleViewTransferHistory = (row: any) => {
  currentShare.value = row
  detailDialogVisible.value = true
  ElMessage.info(`查看份额 ${row.shareNo} 的转移记录`)
}

// 获取价格变化颜色
const getPriceChangeColor = (row: any) => {
  const change = row.currentPrice - row.purchasePrice
  return change > 0 ? '#67c23a' : change < 0 ? '#f56c6c' : '#909399'
}

// 获取价格变化文本
const getPriceChangeText = (row: any) => {
  const change = row.currentPrice - row.purchasePrice
  const percent = row.purchasePrice > 0 ? ((change / row.purchasePrice) * 100).toFixed(2) : '0.00'
  return change > 0
    ? `+¥${change.toLocaleString()} (+${percent}%)`
    : change < 0
      ? `-¥${Math.abs(change).toLocaleString()} (${percent}%)`
      : '无变化'
}

// 获取状态标签类型
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    normal: 'success',
    locked: 'warning',
    trading: 'primary',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    normal: '正常',
    locked: '锁定',
    trading: '交易中',
  }
  return labelMap[status] || status
}

// 获取转移状态标签类型
const getTransferStatusTag = (
  status: string
): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'info',
  }
  return tagMap[status] || 'info'
}

// 获取转移状态标签文本
const getTransferStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待确认',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

// 页面加载
onMounted(() => {
  loadShares()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }

.share-detail {
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
