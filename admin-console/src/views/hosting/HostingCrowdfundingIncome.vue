<template>
  <div class="crowdfunding-income-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #ecf5ff">
              <el-icon :size="32" color="#409eff"><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总收益</div>
              <div class="stat-value">¥{{ stats.totalIncome.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已分配收益</div>
              <div class="stat-value">¥{{ stats.distributedIncome.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #fef0f0">
              <el-icon :size="32" color="#f56c6c"><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">待分配收益</div>
              <div class="stat-value">¥{{ stats.pendingIncome.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #fdf6ec">
              <el-icon :size="32" color="#e6a23c"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">本月收益</div>
              <div class="stat-value">¥{{ stats.monthlyIncome.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="incomeList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 记录编号 -->
      <template #recordNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.recordNo }}
        </span>
      </template>

      <!-- 项目信息 -->
      <template #projectInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.projectTitle }}</div>
          <div style="color: #909399">{{ row.projectNo }}</div>
        </div>
      </template>

      <!-- 车辆信息 -->
      <template #vehicleInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.vehiclePlate }}</div>
          <div style="color: #909399">{{ row.modelName }}</div>
        </div>
      </template>

      <!-- 订单号 -->
      <template #orderNo="{ row }">
        <span style="color: #409eff">{{ row.orderNo }}</span>
      </template>

      <!-- 总收益 -->
      <template #totalIncome="{ row }">
        <span style="color: #67c23a; font-weight: bold">
          ¥{{ row.totalIncome.toLocaleString() }}
        </span>
      </template>

      <!-- 受益人数 -->
      <template #beneficiaryCount="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.beneficiaryCount }}人</span>
      </template>

      <!-- 分配状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </DataTable>

    <!-- 收益详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="收益分配详情"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentIncome" class="income-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>收益信息</span>
              <el-tag :type="getStatusTag(currentIncome.status)" size="small">
                {{ getStatusLabel(currentIncome.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录编号">
              {{ currentIncome.recordNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目编号">
              {{ currentIncome.projectNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目标题">
              {{ currentIncome.projectTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="车辆信息">
              {{ currentIncome.vehiclePlate }} - {{ currentIncome.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="订单号">
              {{ currentIncome.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="订单金额">
              <span style="color: #409eff; font-weight: bold">
                ¥{{ currentIncome.orderAmount.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="总收益">
              <span style="color: #67c23a; font-weight: bold">
                ¥{{ currentIncome.totalIncome.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="受益人数">
              <span style="color: #409eff; font-weight: bold">
                {{ currentIncome.beneficiaryCount }}人
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="分配时间">
              {{ currentIncome.distributionTime }}
            </el-descriptions-item>
            <el-descriptions-item label="分配状态">
              <el-tag :type="getStatusTag(currentIncome.status)" size="small">
                {{ getStatusLabel(currentIncome.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 分配明细 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>分配明细 ({{ currentIncome.distributions.length }}人)</span>
            </div>
          </template>
          <el-table :data="currentIncome.distributions" border max-height="400">
            <el-table-column prop="userName" label="受益人" width="120" />
            <el-table-column prop="userPhone" label="联系电话" width="130" />
            <el-table-column prop="shares" label="持有份额" width="100">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
              </template>
            </el-table-column>
            <el-table-column prop="shareRatio" label="份额占比" width="100">
              <template #default="{ row }"> {{ row.shareRatio }}% </template>
            </el-table-column>
            <el-table-column prop="income" label="分配收益" width="120">
              <template #default="{ row }">
                <span style="color: #67c23a; font-weight: bold">
                  ¥{{ row.income.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="getRoleTag(row.role)" size="small">
                  {{ getRoleLabel(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getDistributionStatusTag(row.status)" size="small">
                  {{ getDistributionStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 手动分配 -->
        <el-card
          v-if="currentIncome.status === 'pending'"
          class="detail-card"
          shadow="never"
          style="margin-top: 20px"
        >
          <template #header>
            <div class="card-header">
              <span>手动分配</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTag(currentIncome.status)" size="small">
                {{ getStatusLabel(currentIncome.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="操作">
              <el-button type="primary" @click="handleDistribute(currentIncome)">
                执行分配
              </el-button>
            </el-form-item>
            <el-form-item label="说明">
              <div style="font-size: 13px; color: #606266; line-height: 1.8">
                <div>• 收益将按照份额比例自动分配到各受益人账户</div>
                <div>• 分配完成后状态将更新为"已分配"</div>
                <div>• 分配操作不可撤销，请谨慎操作</div>
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
import { Money, CircleCheck, Clock, TrendCharts } from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction } from '@/components/common/DataTable.vue'
import { useErrorHandler } from '@/composables'

// Composables
const { handleApiError } = useErrorHandler()

// 统计数据
const stats = reactive({
  totalIncome: 0,
  distributedIncome: 0,
  pendingIncome: 0,
  monthlyIncome: 0,
})

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
    placeholder: '记录编号/订单号',
    width: '200px',
  },
  {
    prop: 'status',
    label: '分配状态',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '待分配', value: 'pending' },
      { label: '已分配', value: 'distributed' },
      { label: '分配失败', value: 'failed' },
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
  { prop: 'recordNo', label: '记录编号', width: 180, slot: 'recordNo' },
  { prop: 'projectInfo', label: '项目信息', width: 200, slot: 'projectInfo' },
  { prop: 'vehicleInfo', label: '车辆信息', width: 180, slot: 'vehicleInfo' },
  { prop: 'orderNo', label: '订单号', width: 180, slot: 'orderNo' },
  { prop: 'totalIncome', label: '总收益', width: 120, slot: 'totalIncome' },
  { prop: 'beneficiaryCount', label: '受益人数', width: 100, slot: 'beneficiaryCount' },
  { prop: 'distributionTime', label: '分配时间', width: 180 },
  { prop: 'status', label: '分配状态', width: 100, slot: 'status' },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '执行分配',
    type: 'success',
    onClick: (row: any) => handleDistribute(row),
    show: (row: any) => row.status === 'pending',
  },
]

// 收益列表
const incomeList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentIncome = ref<any>(null)

// 加载统计数据
const loadStats = async () => {
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 300))

    stats.totalIncome = 125000
    stats.distributedIncome = 98000
    stats.pendingIncome = 27000
    stats.monthlyIncome = 45000
  } catch (error) {
    handleApiError(error, '加载统计数据失败')
  }
}

// 加载收益列表
const loadIncomeList = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        id: 1,
        recordNo: 'IN202501001',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        vehicleId: 1,
        vehiclePlate: '京A12345',
        modelName: '上汽大通RG10 生活家V90',
        orderNo: 'ORD202501001',
        orderAmount: 5000,
        totalIncome: 3500,
        beneficiaryCount: 4,
        distributionTime: '2025-01-10 15:00:00',
        status: 'distributed',
        distributions: [
          {
            userId: 1,
            userName: '张三',
            userPhone: '13800138001',
            shares: 3,
            shareRatio: 30,
            income: 1050,
            role: 'initiator',
            status: 'success',
          },
          {
            userId: 2,
            userName: '李四',
            userPhone: '13800138002',
            shares: 2,
            shareRatio: 20,
            income: 700,
            role: 'investor',
            status: 'success',
          },
          {
            userId: 3,
            userName: '王五',
            userPhone: '13800138003',
            shares: 2,
            shareRatio: 20,
            income: 700,
            role: 'investor',
            status: 'success',
          },
          {
            userId: 4,
            userName: '赵六',
            userPhone: '13800138004',
            shares: 1,
            shareRatio: 10,
            income: 350,
            role: 'manager',
            status: 'success',
          },
        ],
      },
      {
        id: 2,
        recordNo: 'IN202501002',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        vehicleId: 1,
        vehiclePlate: '京A12345',
        modelName: '上汽大通RG10 生活家V90',
        orderNo: 'ORD202501002',
        orderAmount: 4500,
        totalIncome: 3150,
        beneficiaryCount: 4,
        distributionTime: '2025-01-15 10:30:00',
        status: 'pending',
        distributions: [
          {
            userId: 1,
            userName: '张三',
            userPhone: '13800138001',
            shares: 3,
            shareRatio: 30,
            income: 945,
            role: 'initiator',
            status: 'pending',
          },
          {
            userId: 2,
            userName: '李四',
            userPhone: '13800138002',
            shares: 2,
            shareRatio: 20,
            income: 630,
            role: 'investor',
            status: 'pending',
          },
          {
            userId: 3,
            userName: '王五',
            userPhone: '13800138003',
            shares: 2,
            shareRatio: 20,
            income: 630,
            role: 'investor',
            status: 'pending',
          },
          {
            userId: 4,
            userName: '赵六',
            userPhone: '13800138004',
            shares: 1,
            shareRatio: 10,
            income: 315,
            role: 'manager',
            status: 'pending',
          },
        ],
      },
      {
        id: 3,
        recordNo: 'IN202412001',
        projectId: 2,
        projectNo: 'CF202501002',
        projectTitle: '依维柯欧胜C型房车众筹',
        vehicleId: 2,
        vehiclePlate: '京B67890',
        modelName: '依维柯欧胜C型房车',
        orderNo: 'ORD202412001',
        orderAmount: 4000,
        totalIncome: 2800,
        beneficiaryCount: 5,
        distributionTime: '2024-12-20 14:00:00',
        status: 'distributed',
        distributions: [],
      },
    ]

    incomeList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载收益列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadIncomeList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.projectId = null
  searchForm.status = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  pagination.page = 1
  loadIncomeList()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadIncomeList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadIncomeList()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentIncome.value = row
  detailDialogVisible.value = true
}

// 执行分配
const handleDistribute = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要执行收益分配吗？总收益 ¥${row.totalIncome.toLocaleString()} 将按份额比例分配给 ${row.beneficiaryCount} 位受益人。`,
      '分配确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新分配状态
    row.status = 'distributed'
    if (currentIncome.value && currentIncome.value.id === row.id) {
      currentIncome.value.status = 'distributed'
      currentIncome.value.distributions.forEach((d: any) => {
        d.status = 'success'
      })
    }

    // 更新统计数据
    stats.distributedIncome += row.totalIncome
    stats.pendingIncome -= row.totalIncome

    ElMessage.success('收益分配成功')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '分配失败')
    }
  }
}

// 获取状态标签类型
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    pending: 'warning',
    distributed: 'success',
    failed: 'danger',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待分配',
    distributed: '已分配',
    failed: '分配失败',
  }
  return labelMap[status] || status
}

// 获取角色标签类型
const getRoleTag = (role: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    initiator: 'primary',
    investor: 'success',
    manager: 'warning',
  }
  return tagMap[role] || 'info'
}

// 获取角色标签文本
const getRoleLabel = (role: string) => {
  const labelMap: Record<string, string> = {
    initiator: '发起人',
    investor: '投资者',
    manager: '托管代表',
  }
  return labelMap[role] || role
}

// 获取分配状态标签类型
const getDistributionStatusTag = (
  status: string
): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    pending: 'warning',
    success: 'success',
    failed: 'danger',
  }
  return tagMap[status] || 'info'
}

// 获取分配状态标签文本
const getDistributionStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待分配',
    success: '已到账',
    failed: '失败',
  }
  return labelMap[status] || status
}

// 页面加载
onMounted(() => {
  loadStats()
  loadIncomeList()
})
</script>

<style scoped lang="scss">
.crowdfunding-income-container {
  padding: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .income-detail {
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
