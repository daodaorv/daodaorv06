<!-- @ts-nocheck -->
<template>
  <div class="crowdfunding-owners-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="ownersList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="180"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 用户信息 -->
      <template #userInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.userName }}</div>
          <div style="color: #909399">{{ row.userPhone }}</div>
        </div>
      </template>

      <!-- 参与项目数 -->
      <template #projectCount="{ row }">
        <el-link type="primary" @click="handleViewProjects(row)">
          {{ row.projectCount }}个项目
        </el-link>
      </template>

      <!-- 持有份额 -->
      <template #totalShares="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.totalShares }}份</span>
      </template>

      <!-- 总投资金额 -->
      <template #totalInvestment="{ row }">
        <span style="color: #f56c6c; font-weight: bold">
          ¥{{ row.totalInvestment.toLocaleString() }}
        </span>
      </template>

      <!-- 累计收益 -->
      <template #totalIncome="{ row }">
        <span style="color: #67c23a; font-weight: bold">
          ¥{{ row.totalIncome.toLocaleString() }}
        </span>
      </template>

      <!-- 用户角色 -->
      <template #roles="{ row }">
        <el-tag
          v-for="role in row.roles"
          :key="role"
          :type="getRoleTag(role)"
          size="small"
          style="margin-right: 4px"
        >
          {{ getRoleLabel(role) }}
        </el-tag>
      </template>
    </DataTable>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="众筹车主详情"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOwner" class="owner-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户姓名">
              {{ currentOwner.userName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentOwner.userPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="用户编号">
              {{ currentOwner.userId }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ currentOwner.registeredAt }}
            </el-descriptions-item>
            <el-descriptions-item label="参与项目数">
              <span style="color: #409eff; font-weight: bold">
                {{ currentOwner.projectCount }}个
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="持有份额总数">
              <span style="color: #409eff; font-weight: bold">
                {{ currentOwner.totalShares }}份
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="总投资金额">
              <span style="color: #f56c6c; font-weight: bold">
                ¥{{ currentOwner.totalInvestment.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="累计收益">
              <span style="color: #67c23a; font-weight: bold">
                ¥{{ currentOwner.totalIncome.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="用户角色" :span="2">
              <el-tag
                v-for="role in currentOwner.roles"
                :key="role"
                :type="getRoleTag(role)"
                size="small"
                style="margin-right: 8px"
              >
                {{ getRoleLabel(role) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 参与项目列表 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>参与项目列表 ({{ currentOwner.projects.length }}个)</span>
            </div>
          </template>
          <el-table :data="currentOwner.projects" border max-height="400">
            <el-table-column prop="projectNo" label="项目编号" width="150" />
            <el-table-column prop="projectTitle" label="项目标题" width="200" />
            <el-table-column prop="modelName" label="车型" width="180" />
            <el-table-column prop="shares" label="持有份额" width="100">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
              </template>
            </el-table-column>
            <el-table-column prop="investment" label="投资金额" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.investment.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="shareRatio" label="份额占比" width="100">
              <template #default="{ row }">
                {{ row.shareRatio }}%
              </template>
            </el-table-column>
            <el-table-column prop="income" label="累计收益" width="120">
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
            <el-table-column prop="status" label="项目状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getProjectStatusTag(row.status)" size="small">
                  {{ getProjectStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinedAt" label="参与时间" width="180" />
          </el-table>
        </el-card>

        <!-- 角色管理 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>角色管理</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前角色">
              <el-tag
                v-for="role in currentOwner.roles"
                :key="role"
                :type="getRoleTag(role)"
                size="small"
                style="margin-right: 8px"
              >
                {{ getRoleLabel(role) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="角色说明">
              <div style="font-size: 13px; color: #606266; line-height: 1.8">
                <div>• <strong>发起人</strong>: 发起众筹项目的用户</div>
                <div>• <strong>投资者</strong>: 参与众筹投资的用户</div>
                <div>• <strong>托管代表</strong>: 负责车辆托管运营的用户</div>
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
import { ElMessage } from 'element-plus'
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
  role: '',
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '用户姓名/电话',
    width: '200px',
  },
  {
    prop: 'role',
    label: '用户角色',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '发起人', value: 'initiator' },
      { label: '投资者', value: 'investor' },
      { label: '托管代表', value: 'manager' },
    ],
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'userId', label: '用户编号', width: 100 },
  { prop: 'userInfo', label: '用户信息', width: 150, slot: 'userInfo' },
  { prop: 'projectCount', label: '参与项目', width: 120, slot: 'projectCount' },
  { prop: 'totalShares', label: '持有份额', width: 100, slot: 'totalShares' },
  { prop: 'totalInvestment', label: '总投资金额', width: 130, slot: 'totalInvestment' },
  { prop: 'totalIncome', label: '累计收益', width: 120, slot: 'totalIncome' },
  { prop: 'roles', label: '用户角色', width: 180, slot: 'roles' },
  { prop: 'registeredAt', label: '注册时间', width: 180 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '查看项目',
    type: 'success',
    onClick: (row: any) => handleViewProjects(row),
  },
]

// 车主列表
const ownersList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentOwner = ref<any>(null)

// 加载车主列表
const loadOwners = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        userId: 1,
        userName: '张三',
        userPhone: '13800138001',
        projectCount: 2,
        totalShares: 6,
        totalInvestment: 300000,
        totalIncome: 15000,
        roles: ['initiator', 'investor'],
        registeredAt: '2024-10-15 10:30:00',
        projects: [
          {
            projectId: 1,
            projectNo: 'CF202501001',
            projectTitle: '上汽大通RG10众筹项目',
            modelName: '上汽大通RG10 生活家V90',
            shares: 3,
            investment: 150000,
            shareRatio: 30,
            income: 9000,
            role: 'initiator',
            status: 'funding',
            joinedAt: '2025-01-01 10:00:00',
          },
          {
            projectId: 2,
            projectNo: 'CF202501002',
            projectTitle: '依维柯欧胜C型房车众筹',
            modelName: '依维柯欧胜C型房车',
            shares: 3,
            investment: 150000,
            shareRatio: 30,
            income: 6000,
            role: 'investor',
            status: 'hosting',
            joinedAt: '2024-12-01 09:00:00',
          },
        ],
      },
      {
        userId: 2,
        userName: '李四',
        userPhone: '13800138002',
        projectCount: 3,
        totalShares: 7,
        totalInvestment: 335000,
        totalIncome: 18000,
        roles: ['initiator', 'investor'],
        registeredAt: '2024-09-20 14:20:00',
        projects: [
          {
            projectId: 1,
            projectNo: 'CF202501001',
            projectTitle: '上汽大通RG10众筹项目',
            modelName: '上汽大通RG10 生活家V90',
            shares: 2,
            investment: 100000,
            shareRatio: 20,
            income: 6000,
            role: 'investor',
            status: 'funding',
            joinedAt: '2025-01-02 14:30:00',
          },
          {
            projectId: 2,
            projectNo: 'CF202501002',
            projectTitle: '依维柯欧胜C型房车众筹',
            modelName: '依维柯欧胜C型房车',
            shares: 3,
            investment: 135000,
            shareRatio: 30,
            income: 8000,
            role: 'initiator',
            status: 'success',
            joinedAt: '2024-12-01 09:00:00',
          },
          {
            projectId: 5,
            projectNo: 'CF202411001',
            projectTitle: '依维柯房车众筹项目',
            modelName: '依维柯欧胜C型房车',
            shares: 2,
            investment: 100000,
            shareRatio: 20,
            income: 4000,
            role: 'investor',
            status: 'hosting',
            joinedAt: '2024-11-03 11:20:00',
          },
        ],
      },
      {
        userId: 3,
        userName: '王五',
        userPhone: '13800138003',
        projectCount: 1,
        totalShares: 2,
        totalInvestment: 100000,
        totalIncome: 6000,
        roles: ['investor'],
        registeredAt: '2024-11-05 09:15:00',
        projects: [
          {
            projectId: 1,
            projectNo: 'CF202501001',
            projectTitle: '上汽大通RG10众筹项目',
            modelName: '上汽大通RG10 生活家V90',
            shares: 2,
            investment: 100000,
            shareRatio: 20,
            income: 6000,
            role: 'investor',
            status: 'funding',
            joinedAt: '2025-01-03 09:15:00',
          },
        ],
      },
      {
        userId: 4,
        userName: '赵六',
        userPhone: '13800138004',
        projectCount: 2,
        totalShares: 3,
        totalInvestment: 150000,
        totalIncome: 3000,
        roles: ['initiator', 'manager'],
        registeredAt: '2024-10-10 16:20:00',
        projects: [
          {
            projectId: 1,
            projectNo: 'CF202501001',
            projectTitle: '上汽大通RG10众筹项目',
            modelName: '上汽大通RG10 生活家V90',
            shares: 1,
            investment: 50000,
            shareRatio: 10,
            income: 3000,
            role: 'manager',
            status: 'funding',
            joinedAt: '2025-01-04 16:20:00',
          },
          {
            projectId: 4,
            projectNo: 'CF202412001',
            projectTitle: '大通V90房车众筹项目',
            modelName: '上汽大通RG10 生活家V90',
            shares: 2,
            investment: 100000,
            shareRatio: 40,
            income: 0,
            role: 'initiator',
            status: 'failed',
            joinedAt: '2024-12-01 10:00:00',
          },
        ],
      },
      {
        userId: 5,
        userName: '孙七',
        userPhone: '13800138005',
        projectCount: 2,
        totalShares: 5,
        totalInvestment: 225000,
        totalIncome: 12000,
        roles: ['initiator', 'investor'],
        registeredAt: '2024-08-15 11:20:00',
        projects: [
          {
            projectId: 2,
            projectNo: 'CF202501002',
            projectTitle: '依维柯欧胜C型房车众筹',
            modelName: '依维柯欧胜C型房车',
            shares: 2,
            investment: 90000,
            shareRatio: 20,
            income: 4000,
            role: 'investor',
            status: 'success',
            joinedAt: '2024-12-02 11:20:00',
          },
          {
            projectId: 5,
            projectNo: 'CF202411001',
            projectTitle: '依维柯房车众筹项目',
            modelName: '依维柯欧胜C型房车',
            shares: 3,
            investment: 135000,
            shareRatio: 30,
            income: 8000,
            role: 'initiator',
            status: 'hosting',
            joinedAt: '2024-11-01 09:00:00',
          },
        ],
      },
    ]

    ownersList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载众筹车主列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadOwners()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  pagination.page = 1
  loadOwners()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadOwners()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadOwners()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentOwner.value = row
  detailDialogVisible.value = true
}

// 查看项目
const handleViewProjects = (row: any) => {
  currentOwner.value = row
  detailDialogVisible.value = true
  ElMessage.info(`查看用户 ${row.userName} 的参与项目`)
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

// 获取项目状态标签类型
const getProjectStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
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

// 获取项目状态标签文本
const getProjectStatusLabel = (status: string) => {
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

// 页面加载
onMounted(() => {
  loadOwners()
})
</script>

<style scoped lang="scss">
.crowdfunding-owners-container {
  padding: 20px;

  .owner-detail {
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
