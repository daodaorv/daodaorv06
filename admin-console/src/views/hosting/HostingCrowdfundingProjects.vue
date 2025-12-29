<!-- @ts-nocheck -->
<template>
  <div class="crowdfunding-projects-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="projectsList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 项目编号 -->
      <template #projectNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.projectNo }}
        </span>
      </template>

      <!-- 车型信息 -->
      <template #modelInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.modelName }}</div>
          <div style="color: #909399">{{ row.brandName }}</div>
        </div>
      </template>

      <!-- 发起人信息 -->
      <template #initiatorInfo="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.initiatorName }}</div>
          <div style="color: #909399">{{ row.initiatorPhone }}</div>
        </div>
      </template>

      <!-- 份额进度 -->
      <template #shareProgress="{ row }">
        <div style="font-size: 12px">
          <div>
            <span style="color: #67c23a; font-weight: bold">{{ row.soldShares }}</span>
            <span style="color: #909399"> / {{ row.totalShares }}份</span>
          </div>
          <el-progress
            :percentage="calculateProgress(row)"
            :color="getProgressColor(row)"
            :stroke-width="6"
            style="margin-top: 4px"
          />
        </div>
      </template>

      <!-- 项目金额 -->
      <template #amount="{ row }">
        <div style="font-size: 12px">
          <div style="color: #f56c6c; font-weight: bold">
            ¥{{ row.targetAmount.toLocaleString() }}
          </div>
          <div style="color: #67c23a">已筹: ¥{{ row.raisedAmount.toLocaleString() }}</div>
        </div>
      </template>

      <!-- 项目状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>

      <!-- 众筹期限 -->
      <template #deadline="{ row }">
        <div style="font-size: 12px">
          <div>{{ formatDate(row.startDate) }}</div>
          <div style="color: #909399">至</div>
          <div>{{ formatDate(row.endDate) }}</div>
          <div v-if="row.status === 'funding'" style="color: #f56c6c; margin-top: 4px">
            剩余{{ calculateRemainingDays(row.endDate) }}天
          </div>
        </div>
      </template>
    </DataTable>

    <!-- 项目详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="众筹项目详情"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentProject" class="project-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="getStatusTag(currentProject.status)" size="small">
                {{ getStatusLabel(currentProject.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目编号">
              {{ currentProject.projectNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目标题">
              {{ currentProject.title }}
            </el-descriptions-item>
            <el-descriptions-item label="车型信息">
              {{ currentProject.brandName }} {{ currentProject.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="购置价格">
              <span style="color: #f56c6c; font-weight: bold">
                ¥{{ currentProject.purchasePrice.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="发起人">
              {{ currentProject.initiatorName }} ({{ currentProject.initiatorPhone }})
            </el-descriptions-item>
            <el-descriptions-item label="发起时间">
              {{ formatDateTime(currentProject.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="总份额">
              {{ currentProject.totalShares }}份
            </el-descriptions-item>
            <el-descriptions-item label="单份价格">
              <span style="color: #409eff; font-weight: bold">
                ¥{{ currentProject.pricePerShare.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="已售份额">
              <span style="color: #67c23a; font-weight: bold">
                {{ currentProject.soldShares }}份
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="参与人数">
              {{ currentProject.participantCount }}人
            </el-descriptions-item>
            <el-descriptions-item label="众筹期限">
              {{ formatDate(currentProject.startDate) }} 至 {{ formatDate(currentProject.endDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="预估月收益">
              <span style="color: #67c23a; font-weight: bold">
                ¥{{ currentProject.estimatedMonthlyIncome.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">
              {{ currentProject.description }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 参与者列表 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>参与者列表 ({{ currentProject.participantCount }}人)</span>
            </div>
          </template>
          <el-table :data="currentProject.participants" border max-height="300">
            <el-table-column prop="userName" label="用户姓名" width="120" />
            <el-table-column prop="userPhone" label="联系电话" width="130" />
            <el-table-column prop="shares" label="购买份额" width="100">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="投资金额" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.amount.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="shareRatio" label="份额占比" width="100">
              <template #default="{ row }"> {{ row.shareRatio }}% </template>
            </el-table-column>
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="getRoleTag(row.role)" size="small">
                  {{ getRoleLabel(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinedAt" label="参与时间" width="180" />
          </el-table>
        </el-card>

        <!-- 审核操作 -->
        <el-card
          v-if="currentProject.status === 'pending'"
          class="detail-card"
          shadow="never"
          style="margin-top: 20px"
        >
          <template #header>
            <div class="card-header">
              <span>审核操作</span>
            </div>
          </template>
          <el-form :model="reviewForm" label-width="100px">
            <el-form-item label="审核结果">
              <el-radio-group v-model="reviewForm.approved">
                <el-radio :value="true">通过</el-radio>
                <el-radio :value="false">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="审核意见">
              <el-input
                v-model="reviewForm.comment"
                type="textarea"
                :rows="3"
                placeholder="请输入审核意见"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleReviewSubmit"> 提交审核 </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 状态管理 -->
        <el-card
          v-if="['funding', 'success', 'purchasing'].includes(currentProject.status)"
          class="detail-card"
          shadow="never"
          style="margin-top: 20px"
        >
          <template #header>
            <div class="card-header">
              <span>状态管理</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTag(currentProject.status)" size="small">
                {{ getStatusLabel(currentProject.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="更新状态">
              <el-select v-model="statusUpdateForm.newStatus" placeholder="请选择新状态">
                <el-option
                  v-for="option in getAvailableStatusOptions(currentProject.status)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="statusUpdateForm.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入状态更新备注"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleStatusUpdate"> 更新状态 </el-button>
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
  status: '',
  modelId: null as number | null,
  initiatorId: null as number | null,
  startDate: '',
  endDate: '',
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '项目编号/标题/发起人',
    width: '200px',
  },
  {
    prop: 'status',
    label: '项目状态',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '审核中', value: 'pending' },
      { label: '审核拒绝', value: 'rejected' },
      { label: '众筹中', value: 'funding' },
      { label: '众筹成功', value: 'success' },
      { label: '众筹失败', value: 'failed' },
      { label: '购车中', value: 'purchasing' },
      { label: '托管中', value: 'hosting' },
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
  { prop: 'projectNo', label: '项目编号', width: 180, slot: 'projectNo' },
  { prop: 'title', label: '项目标题', width: 200 },
  { prop: 'modelInfo', label: '车型信息', width: 150, slot: 'modelInfo' },
  { prop: 'initiatorInfo', label: '发起人', width: 130, slot: 'initiatorInfo' },
  { prop: 'shareProgress', label: '份额进度', width: 150, slot: 'shareProgress' },
  { prop: 'amount', label: '项目金额', width: 130, slot: 'amount' },
  { prop: 'participantCount', label: '参与人数', width: 100 },
  { prop: 'status', label: '项目状态', width: 120, slot: 'status' },
  { prop: 'deadline', label: '众筹期限', width: 180, slot: 'deadline' },
  { prop: 'createdAt', label: '创建时间', width: 180 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '审核',
    type: 'success',
    onClick: (row: any) => handleReview(row),
    show: (row: any) => row.status === 'pending',
  },
  {
    label: '更新状态',
    type: 'warning',
    onClick: (row: any) => handleUpdateStatus(row),
    show: (row: any) => ['funding', 'success', 'purchasing'].includes(row.status),
  },
]

// 项目列表
const projectsList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentProject = ref<any>(null)

// 审核表单
const reviewForm = reactive({
  approved: true,
  comment: '',
})

// 状态更新表单
const statusUpdateForm = reactive({
  newStatus: '',
  remark: '',
})

// 加载项目列表
const loadProjects = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        id: 1,
        projectNo: 'CF202501001',
        title: '上汽大通RG10众筹项目',
        modelId: 1,
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        purchasePrice: 500000,
        totalShares: 10,
        pricePerShare: 50000,
        soldShares: 8,
        raisedAmount: 400000,
        targetAmount: 500000,
        participantCount: 5,
        initiatorId: 1,
        initiatorName: '张三',
        initiatorPhone: '13800138001',
        estimatedMonthlyIncome: 8500,
        status: 'funding',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        description: '专为川西环线打造的高端房车，配备完善的生活设施，适合长途旅行。',
        createdAt: '2025-01-01 10:00:00',
        participants: [
          {
            userId: 1,
            userName: '张三',
            userPhone: '13800138001',
            shares: 3,
            amount: 150000,
            shareRatio: 30,
            role: 'initiator',
            joinedAt: '2025-01-01 10:00:00',
          },
          {
            userId: 2,
            userName: '李四',
            userPhone: '13800138002',
            shares: 2,
            amount: 100000,
            shareRatio: 20,
            role: 'investor',
            joinedAt: '2025-01-02 14:30:00',
          },
          {
            userId: 3,
            userName: '王五',
            userPhone: '13800138003',
            shares: 2,
            amount: 100000,
            shareRatio: 20,
            role: 'investor',
            joinedAt: '2025-01-03 09:15:00',
          },
          {
            userId: 4,
            userName: '赵六',
            userPhone: '13800138004',
            shares: 1,
            amount: 50000,
            shareRatio: 10,
            role: 'manager',
            joinedAt: '2025-01-04 16:20:00',
          },
        ],
      },
      {
        id: 2,
        projectNo: 'CF202501002',
        title: '依维柯欧胜C型房车众筹',
        modelId: 2,
        modelName: '依维柯欧胜C型房车',
        brandName: '依维柯',
        purchasePrice: 450000,
        totalShares: 10,
        pricePerShare: 45000,
        soldShares: 10,
        raisedAmount: 450000,
        targetAmount: 450000,
        participantCount: 6,
        initiatorId: 2,
        initiatorName: '李四',
        initiatorPhone: '13800138002',
        estimatedMonthlyIncome: 7500,
        status: 'success',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        description: '经典C型房车，性价比高，适合家庭出游。',
        createdAt: '2024-12-01 09:00:00',
        participants: [],
      },
      {
        id: 3,
        projectNo: 'CF202501003',
        title: '福特全顺B型房车众筹',
        modelId: 3,
        modelName: '福特全顺B型房车',
        brandName: '福特',
        purchasePrice: 380000,
        totalShares: 10,
        pricePerShare: 38000,
        soldShares: 0,
        raisedAmount: 0,
        targetAmount: 380000,
        participantCount: 0,
        initiatorId: 3,
        initiatorName: '王五',
        initiatorPhone: '13800138003',
        estimatedMonthlyIncome: 6500,
        status: 'pending',
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        description: '紧凑型B型房车，适合城市出行和短途旅游。',
        createdAt: '2025-01-10 15:30:00',
        participants: [],
      },
    ]

    projectsList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载众筹项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadProjects()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.modelId = null
  searchForm.initiatorId = null
  searchForm.startDate = ''
  searchForm.endDate = ''
  pagination.page = 1
  loadProjects()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadProjects()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadProjects()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentProject.value = row
  detailDialogVisible.value = true
}

// 审核
const handleReview = (row: any) => {
  currentProject.value = row
  reviewForm.approved = true
  reviewForm.comment = ''
  detailDialogVisible.value = true
}

// 提交审核
const handleReviewSubmit = async () => {
  if (!reviewForm.comment) {
    ElMessage.warning('请输入审核意见')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要${reviewForm.approved ? '通过' : '拒绝'}该众筹项目吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新项目状态
    if (currentProject.value) {
      currentProject.value.status = reviewForm.approved ? 'funding' : 'rejected'
      const index = projectsList.value.findIndex(p => p.id === currentProject.value.id)
      if (index !== -1) {
        projectsList.value[index].status = currentProject.value.status
      }
    }

    ElMessage.success('审核成功')
    detailDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '审核失败')
    }
  }
}

// 更新状态
const handleUpdateStatus = (row: any) => {
  currentProject.value = row
  statusUpdateForm.newStatus = ''
  statusUpdateForm.remark = ''
  detailDialogVisible.value = true
}

// 提交状态更新
const handleStatusUpdate = async () => {
  if (!statusUpdateForm.newStatus) {
    ElMessage.warning('请选择新状态')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将项目状态更新为"${getStatusLabel(statusUpdateForm.newStatus)}"吗？`,
      '状态更新确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新项目状态
    if (currentProject.value) {
      currentProject.value.status = statusUpdateForm.newStatus
      const index = projectsList.value.findIndex(p => p.id === currentProject.value.id)
      if (index !== -1) {
        projectsList.value[index].status = statusUpdateForm.newStatus
      }
    }

    ElMessage.success('状态更新成功')
    detailDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '状态更新失败')
    }
  }
}

// 计算进度
const calculateProgress = (row: any) => {
  if (row.totalShares === 0) return 0
  return Math.round((row.soldShares / row.totalShares) * 100)
}

// 获取进度颜色
const getProgressColor = (row: any) => {
  const progress = calculateProgress(row)
  if (progress >= 100) return '#67c23a'
  if (progress >= 80) return '#409eff'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 计算剩余天数
const calculateRemainingDays = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// 获取状态标签类型
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    pending: 'warning',
    rejected: 'danger',
    funding: 'primary',
    success: 'success',
    failed: 'danger',
    purchasing: 'warning',
    hosting: 'success',
    completed: 'info',
    cancelled: 'info',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '审核中',
    rejected: '审核拒绝',
    funding: '众筹中',
    success: '众筹成功',
    failed: '众筹失败',
    purchasing: '购车中',
    hosting: '托管中',
    completed: '已完成',
    cancelled: '已取消',
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

// 获取可用的状态选项
const getAvailableStatusOptions = (currentStatus: string) => {
  const statusFlow: Record<string, Array<{ label: string; value: string }>> = {
    funding: [
      { label: '众筹成功', value: 'success' },
      { label: '众筹失败', value: 'failed' },
    ],
    success: [{ label: '购车中', value: 'purchasing' }],
    purchasing: [{ label: '托管中', value: 'hosting' }],
  }
  return statusFlow[currentStatus] || []
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.split(' ')[0]
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

// 页面加载
onMounted(() => {
  loadProjects()
})
</script>

<style scoped lang="scss">
.crowdfunding-projects-container {
  padding: 20px;

  .project-detail {
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
