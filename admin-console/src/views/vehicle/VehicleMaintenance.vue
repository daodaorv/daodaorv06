<template>
  <div class="vehicle-maintenance-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>维保管理</h2>
      <p class="page-description">管理车辆维修保养计划、记录和成本</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#409eff"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.planned }}</div>
              <div class="stat-label">计划维保</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#e6a23c"><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inProgress }}</div>
              <div class="stat-label">维保中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#f56c6c"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.totalCost.toLocaleString() }}</div>
              <div class="stat-label">本月成本</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="车牌号">
          <el-input
            v-model="searchForm.plateNumber"
            placeholder="请输入车牌号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="维保类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="常规保养" value="regular" />
            <el-option label="维修" value="repair" />
            <el-option label="年检" value="inspection" />
            <el-option label="紧急维修" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="维保状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="计划中" value="planned" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card" shadow="never">
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新增维保记录
      </el-button>
      <el-button :icon="Calendar">维保计划</el-button>
      <el-button :icon="Download">导出记录</el-button>
      <el-button :icon="DocumentCopy">成本报表</el-button>
    </el-card>

    <!-- 维保记录列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="maintenanceList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="modelName" label="车型" width="150" />
        <el-table-column label="维保类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="维保内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="维保状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceProvider" label="服务商" width="150" />
        <el-table-column prop="cost" label="费用" width="120">
          <template #default="{ row }">
            ¥{{ row.cost.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduledDate" label="计划日期" width="120" />
        <el-table-column prop="completedDate" label="完成日期" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleComplete(row)"
              v-if="row.status !== 'completed' && row.status !== 'cancelled'"
            >
              完成
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑维保记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆" prop="vehicleId">
              <el-select v-model="form.vehicleId" placeholder="请选择车辆" style="width: 100%">
                <el-option label="京A12345 - 大通RV80" :value="1" />
                <el-option label="沪B67890 - 福特全顺" :value="2" />
                <el-option label="粤C11111 - 依维柯拖挂" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="常规保养" value="regular" />
                <el-option label="维修" value="repair" />
                <el-option label="年检" value="inspection" />
                <el-option label="紧急维修" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="维保内容" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入维保内容"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务商" prop="serviceProvider">
              <el-input v-model="form.serviceProvider" placeholder="请输入服务商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划日期" prop="scheduledDate">
              <el-date-picker
                v-model="form.scheduledDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计费用" prop="estimatedCost">
              <el-input-number
                v-model="form.estimatedCost"
                :min="0"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前里程">
              <el-input-number
                v-model="form.currentMileage"
                :min="0"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次保养里程">
              <el-input-number
                v-model="form.nextMaintenanceMileage"
                :min="0"
                :step="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 维保详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="维保记录详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="车牌号">
          {{ currentRecord.plateNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="车型">
          {{ currentRecord.modelName }}
        </el-descriptions-item>
        <el-descriptions-item label="维保类型">
          <el-tag :type="getTypeTag(currentRecord.type)" size="small">
            {{ getTypeLabel(currentRecord.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="维保状态">
          <el-tag :type="getStatusTag(currentRecord.status)" size="small">
            {{ getStatusLabel(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="维保内容" :span="2">
          {{ currentRecord.description }}
        </el-descriptions-item>
        <el-descriptions-item label="服务商">
          {{ currentRecord.serviceProvider }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentRecord.contactPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="计划日期">
          {{ currentRecord.scheduledDate }}
        </el-descriptions-item>
        <el-descriptions-item label="完成日期">
          {{ currentRecord.completedDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="预计费用">
          ¥{{ currentRecord.estimatedCost?.toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="实际费用">
          ¥{{ currentRecord.cost.toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="当前里程">
          {{ currentRecord.currentMileage }}km
        </el-descriptions-item>
        <el-descriptions-item label="下次保养里程">
          {{ currentRecord.nextMaintenanceMileage }}km
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRecord.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Calendar,
  Tools,
  CircleCheck,
  Money,
  DocumentCopy,
} from '@element-plus/icons-vue'

// 维保记录数据类型
interface MaintenanceRecord {
  id: number
  vehicleId: number
  plateNumber: string
  modelName: string
  type: string
  description: string
  status: string
  serviceProvider: string
  contactPhone: string
  scheduledDate: string
  completedDate: string | null
  estimatedCost: number
  cost: number
  currentMileage: number
  nextMaintenanceMileage: number
  remark: string
}

// 搜索表单
const searchForm = reactive({
  plateNumber: '',
  type: '',
  status: '',
  dateRange: [] as Date[],
})

// 统计数据
const stats = reactive({
  planned: 5,
  inProgress: 3,
  completed: 28,
  totalCost: 45600,
})

// 维保记录列表
const maintenanceList = ref<MaintenanceRecord[]>([
  {
    id: 1,
    vehicleId: 1,
    plateNumber: '京A12345',
    modelName: '大通RV80 C型',
    type: 'regular',
    description: '常规保养：更换机油、机滤、空滤',
    status: 'completed',
    serviceProvider: '北京汽车维修中心',
    contactPhone: '010-12345678',
    scheduledDate: '2024-11-25',
    completedDate: '2024-11-25',
    estimatedCost: 800,
    cost: 850,
    currentMileage: 15000,
    nextMaintenanceMileage: 20000,
    remark: '保养正常',
  },
  {
    id: 2,
    vehicleId: 2,
    plateNumber: '沪B67890',
    modelName: '福特全顺B型',
    type: 'repair',
    description: '发动机异响维修',
    status: 'in_progress',
    serviceProvider: '上海福特4S店',
    contactPhone: '021-87654321',
    scheduledDate: '2024-11-28',
    completedDate: null,
    estimatedCost: 2000,
    cost: 0,
    currentMileage: 8000,
    nextMaintenanceMileage: 10000,
    remark: '需要更换发动机皮带',
  },
  {
    id: 3,
    vehicleId: 3,
    plateNumber: '粤C11111',
    modelName: '依维柯拖挂',
    type: 'inspection',
    description: '年度车辆检验',
    status: 'planned',
    serviceProvider: '深圳车辆检测站',
    contactPhone: '0755-11223344',
    scheduledDate: '2024-12-05',
    completedDate: null,
    estimatedCost: 300,
    cost: 0,
    currentMileage: 5000,
    nextMaintenanceMileage: 10000,
    remark: '需提前预约',
  },
  {
    id: 4,
    vehicleId: 1,
    plateNumber: '京A12345',
    modelName: '大通RV80 C型',
    type: 'emergency',
    description: '紧急维修：轮胎爆胎更换',
    status: 'completed',
    serviceProvider: '道路救援服务',
    contactPhone: '400-888-8888',
    scheduledDate: '2024-11-20',
    completedDate: '2024-11-20',
    estimatedCost: 500,
    cost: 600,
    currentMileage: 14500,
    nextMaintenanceMileage: 15000,
    remark: '高速公路爆胎',
  },
  {
    id: 5,
    vehicleId: 2,
    plateNumber: '沪B67890',
    modelName: '福特全顺B型',
    type: 'regular',
    description: '常规保养：更换机油、三滤',
    status: 'planned',
    serviceProvider: '上海福特4S店',
    contactPhone: '021-87654321',
    scheduledDate: '2024-12-10',
    completedDate: null,
    estimatedCost: 900,
    cost: 0,
    currentMileage: 7800,
    nextMaintenanceMileage: 10000,
    remark: '',
  },
])

const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增维保记录')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  vehicleId: null as number | null,
  type: '',
  description: '',
  serviceProvider: '',
  contactPhone: '',
  scheduledDate: '',
  estimatedCost: 0,
  currentMileage: 0,
  nextMaintenanceMileage: 0,
  remark: '',
})

const formRules: FormRules = {
  vehicleId: [
    { required: true, message: '请选择车辆', trigger: 'change' },
  ],
  type: [
    { required: true, message: '请选择维保类型', trigger: 'change' },
  ],
  description: [
    { required: true, message: '请输入维保内容', trigger: 'blur' },
  ],
  serviceProvider: [
    { required: true, message: '请输入服务商名称', trigger: 'blur' },
  ],
  scheduledDate: [
    { required: true, message: '请选择计划日期', trigger: 'change' },
  ],
  estimatedCost: [
    { required: true, message: '请输入预计费用', trigger: 'blur' },
  ],
}

// 详情对话框
const detailDialogVisible = ref(false)
const currentRecord = ref<MaintenanceRecord | null>(null)

// 搜索
const handleSearch = () => {
  pagination.page = 1
  ElMessage.success('搜索功能开发中...')
}

// 重置
const handleReset = () => {
  searchForm.plateNumber = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.page = 1
}

// 新增维保记录
const handleCreate = () => {
  dialogTitle.value = '新增维保记录'
  isEdit.value = false
  dialogVisible.value = true
}

// 查看维保记录
const handleView = (row: MaintenanceRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 编辑维保记录
const handleEdit = (row: MaintenanceRecord) => {
  dialogTitle.value = '编辑维保记录'
  isEdit.value = true
  form.id = row.id
  form.vehicleId = row.vehicleId
  form.type = row.type
  form.description = row.description
  form.serviceProvider = row.serviceProvider
  form.contactPhone = row.contactPhone
  form.scheduledDate = row.scheduledDate
  form.estimatedCost = row.estimatedCost
  form.currentMileage = row.currentMileage
  form.nextMaintenanceMileage = row.nextMaintenanceMileage
  form.remark = row.remark
  dialogVisible.value = true
}

// 完成维保
const handleComplete = async (row: MaintenanceRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要将维保记录 "${row.description}" 标记为已完成吗？`,
      '完成确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      }
    )
    row.status = 'completed'
    row.completedDate = new Date().toLocaleDateString('zh-CN')
    ElMessage.success('维保记录已完成')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除维保记录
const handleDelete = async (row: MaintenanceRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除维保记录 "${row.description}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const index = maintenanceList.value.findIndex(m => m.id === row.id)
    if (index > -1) {
      maintenanceList.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value) {
        ElMessage.success('更新成功')
      } else {
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.id = 0
  form.vehicleId = null
  form.type = ''
  form.description = ''
  form.serviceProvider = ''
  form.contactPhone = ''
  form.scheduledDate = ''
  form.estimatedCost = 0
  form.currentMileage = 0
  form.nextMaintenanceMileage = 0
  form.remark = ''
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

// 获取类型标签
const getTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    regular: 'primary',
    repair: 'warning',
    inspection: 'success',
    emergency: 'danger',
  }
  return tagMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    regular: '常规保养',
    repair: '维修',
    inspection: '年检',
    emergency: '紧急维修',
  }
  return labelMap[type] || type
}

// 获取状态标签
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    planned: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

// 页面加载
onMounted(() => {
  // TODO: 加载维保记录列表
})
</script>

<style scoped lang="scss">
.vehicle-maintenance-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #303133;
    }

    .page-description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .stat-icon {
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #303133;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
