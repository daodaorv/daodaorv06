<template>
  <div class="crowdfunding-vehicles-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="vehiclesList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 车辆编号 -->
      <template #vehicleNo="{ row }">
        <span style="color: #409eff; cursor: pointer" @click="handleViewDetail(row)">
          {{ row.vehicleNo }}
        </span>
      </template>

      <!-- 车辆信息 -->
      <template #vehicleInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.vehiclePlate }}</div>
          <div style="color: #909399">{{ row.modelName }}</div>
        </div>
      </template>

      <!-- 项目信息 -->
      <template #projectInfo="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold">{{ row.projectTitle }}</div>
          <div style="color: #909399">{{ row.projectNo }}</div>
        </div>
      </template>

      <!-- 托管代表 -->
      <template #managerInfo="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.managerName }}</div>
          <div style="color: #909399">{{ row.managerPhone }}</div>
        </div>
      </template>

      <!-- 参与人数 -->
      <template #participantCount="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.participantCount }}人</span>
      </template>

      <!-- 总份额 -->
      <template #totalShares="{ row }">
        <span style="color: #409eff; font-weight: bold">{{ row.totalShares }}份</span>
      </template>

      <!-- 车辆状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTag(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>

      <!-- 使用率 -->
      <template #utilizationRate="{ row }">
        <div style="font-size: 12px">
          <div style="font-weight: bold; color: #409eff">{{ row.utilizationRate }}%</div>
          <el-progress
            :percentage="row.utilizationRate"
            :color="getUtilizationColor(row.utilizationRate)"
            :stroke-width="6"
            style="margin-top: 4px"
          />
        </div>
      </template>

      <!-- 总收益 -->
      <template #totalIncome="{ row }">
        <span style="color: #67c23a; font-weight: bold">
          ¥{{ row.totalIncome.toLocaleString() }}
        </span>
      </template>
    </DataTable>

    <!-- 车辆详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="众筹车辆详情"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-if="currentVehicle" class="vehicle-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>车辆信息</span>
              <el-tag :type="getStatusTag(currentVehicle.status)" size="small">
                {{ getStatusLabel(currentVehicle.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="车辆编号">
              {{ currentVehicle.vehicleNo }}
            </el-descriptions-item>
            <el-descriptions-item label="车牌号">
              {{ currentVehicle.vehiclePlate }}
            </el-descriptions-item>
            <el-descriptions-item label="车型">
              {{ currentVehicle.brandName }} {{ currentVehicle.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="项目编号">
              {{ currentVehicle.projectNo }}
            </el-descriptions-item>
            <el-descriptions-item label="项目标题">
              {{ currentVehicle.projectTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="托管代表">
              {{ currentVehicle.managerName }} ({{ currentVehicle.managerPhone }})
            </el-descriptions-item>
            <el-descriptions-item label="参与人数">
              <span style="color: #409eff; font-weight: bold">
                {{ currentVehicle.participantCount }}人
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="总份额">
              <span style="color: #409eff; font-weight: bold">
                {{ currentVehicle.totalShares }}份
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="托管开始日期">
              {{ currentVehicle.hostingStartDate }}
            </el-descriptions-item>
            <el-descriptions-item label="车辆状态">
              <el-tag :type="getStatusTag(currentVehicle.status)" size="small">
                {{ getStatusLabel(currentVehicle.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 运营数据 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>运营数据</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">订单数</div>
                <div class="stat-value" style="color: #409eff">
                  {{ currentVehicle.orderCount }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">使用率</div>
                <div class="stat-value" style="color: #409eff">
                  {{ currentVehicle.utilizationRate }}%
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">总收益</div>
                <div class="stat-value" style="color: #67c23a">
                  ¥{{ currentVehicle.totalIncome.toLocaleString() }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">月均收益</div>
                <div class="stat-value" style="color: #67c23a">
                  ¥{{ currentVehicle.avgMonthlyIncome.toLocaleString() }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 参与者列表 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>参与者列表 ({{ currentVehicle.participants.length }}人)</span>
            </div>
          </template>
          <el-table :data="currentVehicle.participants" border max-height="300">
            <el-table-column prop="userName" label="用户姓名" width="120" />
            <el-table-column prop="userPhone" label="联系电话" width="130" />
            <el-table-column prop="shares" label="持有份额" width="100">
              <template #default="{ row }">
                <span style="color: #409eff; font-weight: bold">{{ row.shares }}份</span>
              </template>
            </el-table-column>
            <el-table-column prop="shareRatio" label="份额占比" width="100">
              <template #default="{ row }"> {{ row.shareRatio }}% </template>
            </el-table-column>
            <el-table-column prop="investment" label="投资金额" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.investment.toLocaleString() }}
                </span>
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
          </el-table>
        </el-card>

        <!-- 状态管理 -->
        <el-card class="detail-card" shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>状态管理</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTag(currentVehicle.status)" size="small">
                {{ getStatusLabel(currentVehicle.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="更新状态">
              <el-select v-model="statusUpdateForm.newStatus" placeholder="请选择新状态">
                <el-option
                  v-for="option in getAvailableStatusOptions(currentVehicle.status)"
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
  projectId: null as number | null,
  status: '',
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '车辆编号/车牌号',
    width: '200px',
  },
  {
    prop: 'status',
    label: '车辆状态',
    type: 'select',
    placeholder: '全部',
    width: '150px',
    options: [
      { label: '托管中', value: 'hosting' },
      { label: '维护中', value: 'maintenance' },
      { label: '车主自用', value: 'owner_use' },
      { label: '已下线', value: 'offline' },
    ],
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'vehicleNo', label: '车辆编号', width: 150, slot: 'vehicleNo' },
  { prop: 'vehicleInfo', label: '车辆信息', width: 180, slot: 'vehicleInfo' },
  { prop: 'projectInfo', label: '项目信息', width: 200, slot: 'projectInfo' },
  { prop: 'managerInfo', label: '托管代表', width: 130, slot: 'managerInfo' },
  { prop: 'participantCount', label: '参与人数', width: 100, slot: 'participantCount' },
  { prop: 'totalShares', label: '总份额', width: 100, slot: 'totalShares' },
  { prop: 'status', label: '车辆状态', width: 100, slot: 'status' },
  { prop: 'orderCount', label: '订单数', width: 100 },
  { prop: 'utilizationRate', label: '使用率', width: 120, slot: 'utilizationRate' },
  { prop: 'totalIncome', label: '总收益', width: 120, slot: 'totalIncome' },
  { prop: 'hostingStartDate', label: '托管开始日期', width: 120 },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看详情',
    type: 'primary',
    onClick: (row: any) => handleViewDetail(row),
  },
  {
    label: '更新状态',
    type: 'warning',
    onClick: (row: any) => handleUpdateStatus(row),
  },
  {
    label: '查看参与者',
    type: 'success',
    onClick: (row: any) => handleViewParticipants(row),
  },
]

// 车辆列表
const vehiclesList = ref<any[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentVehicle = ref<any>(null)

// 状态更新表单
const statusUpdateForm = reactive({
  newStatus: '',
  remark: '',
})

// 加载车辆列表
const loadVehicles = async () => {
  loading.value = true
  try {
    // Mock数据 - 实际应该调用API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockData = [
      {
        id: 1,
        vehicleNo: 'VH202501001',
        vehiclePlate: '京A12345',
        modelName: '上汽大通RG10 生活家V90',
        brandName: '上汽大通',
        projectId: 1,
        projectNo: 'CF202501001',
        projectTitle: '上汽大通RG10众筹项目',
        managerId: 4,
        managerName: '赵六',
        managerPhone: '13800138004',
        participantCount: 4,
        totalShares: 10,
        status: 'hosting',
        orderCount: 25,
        utilizationRate: 75,
        totalIncome: 87500,
        avgMonthlyIncome: 8750,
        hostingStartDate: '2025-01-15',
        participants: [
          {
            userId: 1,
            userName: '张三',
            userPhone: '13800138001',
            shares: 3,
            shareRatio: 30,
            investment: 150000,
            income: 26250,
            role: 'initiator',
          },
          {
            userId: 2,
            userName: '李四',
            userPhone: '13800138002',
            shares: 2,
            shareRatio: 20,
            investment: 100000,
            income: 17500,
            role: 'investor',
          },
          {
            userId: 3,
            userName: '王五',
            userPhone: '13800138003',
            shares: 2,
            shareRatio: 20,
            investment: 100000,
            income: 17500,
            role: 'investor',
          },
          {
            userId: 4,
            userName: '赵六',
            userPhone: '13800138004',
            shares: 3,
            shareRatio: 30,
            investment: 150000,
            income: 26250,
            role: 'manager',
          },
        ],
      },
      {
        id: 2,
        vehicleNo: 'VH202412001',
        vehiclePlate: '京B67890',
        modelName: '依维柯欧胜C型房车',
        brandName: '依维柯',
        projectId: 2,
        projectNo: 'CF202501002',
        projectTitle: '依维柯欧胜C型房车众筹',
        managerId: 5,
        managerName: '孙七',
        managerPhone: '13800138005',
        participantCount: 5,
        totalShares: 10,
        status: 'hosting',
        orderCount: 30,
        utilizationRate: 82,
        totalIncome: 105000,
        avgMonthlyIncome: 8750,
        hostingStartDate: '2024-12-20',
        participants: [],
      },
      {
        id: 3,
        vehicleNo: 'VH202411001',
        vehiclePlate: '京C11111',
        modelName: '依维柯欧胜C型房车',
        brandName: '依维柯',
        projectId: 5,
        projectNo: 'CF202411001',
        projectTitle: '依维柯房车众筹项目',
        managerId: 5,
        managerName: '孙七',
        managerPhone: '13800138005',
        participantCount: 5,
        totalShares: 10,
        status: 'maintenance',
        orderCount: 18,
        utilizationRate: 60,
        totalIncome: 54000,
        avgMonthlyIncome: 6000,
        hostingStartDate: '2024-11-10',
        participants: [],
      },
    ]

    vehiclesList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    handleApiError(error, '加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadVehicles()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.projectId = null
  searchForm.status = ''
  pagination.page = 1
  loadVehicles()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadVehicles()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadVehicles()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentVehicle.value = row
  detailDialogVisible.value = true
}

// 更新状态
const handleUpdateStatus = (row: any) => {
  currentVehicle.value = row
  statusUpdateForm.newStatus = ''
  statusUpdateForm.remark = ''
  detailDialogVisible.value = true
}

// 查看参与者
const handleViewParticipants = (row: any) => {
  currentVehicle.value = row
  detailDialogVisible.value = true
  ElMessage.info(`查看车辆 ${row.vehicleNo} 的参与者`)
}

// 提交状态更新
const handleStatusUpdate = async () => {
  if (!statusUpdateForm.newStatus) {
    ElMessage.warning('请选择新状态')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将车辆状态更新为"${getStatusLabel(statusUpdateForm.newStatus)}"吗？`,
      '状态更新确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新车辆状态
    if (currentVehicle.value) {
      currentVehicle.value.status = statusUpdateForm.newStatus
      const index = vehiclesList.value.findIndex(v => v.id === currentVehicle.value.id)
      if (index !== -1) {
        vehiclesList.value[index].status = statusUpdateForm.newStatus
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

// 获取状态标签类型
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    hosting: 'success',
    maintenance: 'warning',
    owner_use: 'primary',
    offline: 'info',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    hosting: '托管中',
    maintenance: '维护中',
    owner_use: '车主自用',
    offline: '已下线',
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
    hosting: [
      { label: '维护中', value: 'maintenance' },
      { label: '车主自用', value: 'owner_use' },
      { label: '已下线', value: 'offline' },
    ],
    maintenance: [
      { label: '托管中', value: 'hosting' },
      { label: '已下线', value: 'offline' },
    ],
    owner_use: [{ label: '托管中', value: 'hosting' }],
  }
  return statusFlow[currentStatus] || []
}

// 获取使用率颜色
const getUtilizationColor = (rate: number) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#409eff'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 页面加载
onMounted(() => {
  loadVehicles()
})
</script>

<style scoped lang="scss">
.crowdfunding-vehicles-container {
  padding: 20px;

  .vehicle-detail {
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

    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .stat-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
}
</style>
