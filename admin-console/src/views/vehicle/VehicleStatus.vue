<template>
  <div class="vehicle-status-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>车辆状态管理</h2>
      <p class="page-description">实时管理车辆可用性、维修、保养状态</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card available">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.available }}</div>
              <div class="stat-label">可用车辆</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card rented">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rented }}</div>
              <div class="stat-label">租用中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card maintenance">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.maintenance }}</div>
              <div class="stat-label">维修中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card repair">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.repair }}</div>
              <div class="stat-label">维修中</div>
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
        <el-form-item label="车辆状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="可用" value="available" />
            <el-option label="租用中" value="rented" />
            <el-option label="保养中" value="maintenance" />
            <el-option label="维修中" value="repair" />
            <el-option label="已退役" value="retired" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属门店">
          <el-select
            v-model="searchForm.storeId"
            placeholder="请选择门店"
            clearable
            style="width: 150px"
          >
            <el-option label="北京朝阳店" :value="1" />
            <el-option label="上海浦东店" :value="2" />
            <el-option label="深圳南山店" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆来源">
          <el-select
            v-model="searchForm.source"
            placeholder="请选择来源"
            clearable
            style="width: 150px"
          >
            <el-option label="众筹车辆" value="crowdfunding" />
            <el-option label="合作车辆" value="cooperative" />
          </el-select>
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
      <el-button type="primary" :icon="Refresh" @click="handleRefresh">
        刷新状态
      </el-button>
      <el-button :icon="Download">导出状态报表</el-button>
      <el-button type="success" :icon="CircleCheck">批量设为可用</el-button>
      <el-button type="warning" :icon="Tools">批量维修</el-button>
    </el-card>

    <!-- 车辆状态列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="vehicleStatusList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
        <el-table-column prop="modelName" label="车型" width="150" />
        <el-table-column label="车辆来源" width="120">
          <template #default="{ row }">
            <el-tag :type="row.ownershipType === 'crowdfunding' ? 'primary' : 'success'" size="small">
              {{ row.ownershipType === 'crowdfunding' ? '众筹车辆' : '合作车辆' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属门店" width="150" />
        <el-table-column prop="location" label="当前位置" width="150" show-overflow-tooltip />
        <el-table-column label="最后更新" width="180">
          <template #default="{ row }">
            {{ row.updatedAt }}
          </template>
        </el-table-column>
        <el-table-column label="状态持续时间" width="120">
          <template #default="{ row }">
            {{ getStatusDuration(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewHistory(row)">
              状态历史
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleChangeStatus(row, 'available')"
              :disabled="row.status === 'available'"
            >
              设为可用
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              @click="handleChangeStatus(row, 'maintenance')"
              :disabled="row.status === 'maintenance'"
            >
              保养
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleChangeStatus(row, 'repair')"
              :disabled="row.status === 'repair'"
            >
              维修
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleChangeStatus(row, 'retired')"
              :disabled="row.status === 'retired'"
            >
              退役
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

    <!-- 状态变更对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="statusDialogTitle"
      width="600px"
    >
      <el-form
        ref="statusFormRef"
        :model="statusForm"
        :rules="statusFormRules"
        label-width="120px"
      >
        <el-form-item label="车辆信息">
          <div>{{ currentVehicle?.vehicleNumber }} - {{ currentVehicle?.modelName }}</div>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTag(currentVehicle?.status || '')" size="small">
            {{ getStatusLabel(currentVehicle?.status || '') }}
          </el-tag>
        </el-form-item>
        <el-form-item label="变更为" prop="newStatus">
          <el-select v-model="statusForm.newStatus" placeholder="请选择新状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="租用中" value="rented" />
            <el-option label="保养中" value="maintenance" />
            <el-option label="维修中" value="repair" />
            <el-option label="已退役" value="retired" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="statusForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入状态变更原因"
          />
        </el-form-item>
        <el-form-item label="预计恢复时间" v-if="statusForm.newStatus === 'maintenance' || statusForm.newStatus === 'repair'">
          <el-date-picker
            v-model="statusForm.estimatedRecoveryTime"
            type="datetime"
            placeholder="选择预计恢复时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleStatusSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 状态历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="状态变更历史"
      width="900px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="item in statusHistory"
          :key="item.id"
          :timestamp="item.createdAt"
          placement="top"
          :type="getTimelineType(item.newStatus)"
        >
          <el-card>
            <div class="history-item">
              <div class="history-header">
                <el-tag :type="getStatusTag(item.oldStatus)" size="small">
                  {{ getStatusLabel(item.oldStatus) }}
                </el-tag>
                <el-icon><Right /></el-icon>
                <el-tag :type="getStatusTag(item.newStatus)" size="small">
                  {{ getStatusLabel(item.newStatus) }}
                </el-tag>
              </div>
              <div class="history-content">
                <p><strong>变更原因：</strong>{{ item.reason }}</p>
                <p v-if="item.remark"><strong>备注：</strong>{{ item.remark }}</p>
                <p><strong>操作人：</strong>{{ item.operator }}</p>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  CircleCheck,
  CircleClose,
  Tools,
  Van,
  Right,
} from '@element-plus/icons-vue'
import {
  getVehicles,
  getVehicleStatusStats,
  getVehicleStatusHistory,
  createStatusHistory,
  type Vehicle,
  type VehicleStatusHistory,
} from '@/api/vehicle'

// 搜索表单
const searchForm = reactive({
  plateNumber: '',
  status: '',
  storeId: null as number | null,
  source: '',
})

// 统计数据
const stats = reactive({
  available: 0,
  rented: 0,
  maintenance: 0,
  repair: 0,
  retired: 0,
})

// 车辆状态列表
const vehicleStatusList = ref<Vehicle[]>([])

const loading = ref(false)
const selectedVehicles = ref<Vehicle[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 状态变更对话框
const statusDialogVisible = ref(false)
const statusDialogTitle = ref('变更车辆状态')
const currentVehicle = ref<Vehicle | null>(null)
const submitLoading = ref(false)
const statusFormRef = ref<FormInstance>()

const statusForm = reactive({
  newStatus: '',
  reason: '',
  estimatedRecoveryTime: '',
  remark: '',
})

const statusFormRules: FormRules = {
  newStatus: [
    { required: true, message: '请选择新状态', trigger: 'change' },
  ],
  reason: [
    { required: true, message: '请输入变更原因', trigger: 'blur' },
  ],
}

// 状态历史对话框
const historyDialogVisible = ref(false)
const statusHistory = ref<VehicleStatusHistory[]>([])

// 加载车辆列表
const loadVehicles = async () => {
  loading.value = true
  try {
    const res = await getVehicles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      vehicleNumber: searchForm.plateNumber,
      storeId: searchForm.storeId,
      status: searchForm.status,
      ownershipType: searchForm.source,
    })
    vehicleStatusList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getVehicleStatusStats()
    Object.assign(stats, res.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadVehicles()
}

// 重置
const handleReset = () => {
  searchForm.plateNumber = ''
  searchForm.status = ''
  searchForm.storeId = null
  searchForm.source = ''
  pagination.page = 1
  loadVehicles()
}

// 刷新状态
const handleRefresh = () => {
  loadVehicles()
  loadStats()
  ElMessage.success('状态已刷新')
}

// 选择变更
const handleSelectionChange = (selection: Vehicle[]) => {
  selectedVehicles.value = selection
}

// 查看状态历史
const handleViewHistory = async (row: Vehicle) => {
  currentVehicle.value = row
  try {
    const res = await getVehicleStatusHistory(row.id)
    statusHistory.value = res.data
    historyDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载状态历史失败')
  }
}

// 变更状态
const handleChangeStatus = (row: Vehicle, newStatus: string) => {
  currentVehicle.value = row
  statusForm.newStatus = newStatus
  statusForm.reason = ''
  statusForm.estimatedRecoveryTime = ''
  statusForm.remark = ''
  statusDialogTitle.value = `变更车辆状态：${row.vehicleNumber}`
  statusDialogVisible.value = true
}

// 提交状态变更
const handleStatusSubmit = async () => {
  if (!statusFormRef.value || !currentVehicle.value) return

  await statusFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      await createStatusHistory({
        vehicleId: currentVehicle.value!.id,
        newStatus: statusForm.newStatus as any,
        reason: statusForm.reason,
        remark: statusForm.remark,
        estimatedRecoveryTime: statusForm.estimatedRecoveryTime,
      })

      ElMessage.success('状态变更成功')
      statusDialogVisible.value = false

      // 重新加载数据
      loadVehicles()
      loadStats()
    } catch (error) {
      ElMessage.error('状态变更失败')
    } finally {
      submitLoading.value = false
    }
  })
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

// 计算状态持续时间
const getStatusDuration = (updatedAt: string) => {
  const now = new Date()
  const updateTime = new Date(updatedAt)
  const diff = now.getTime() - updateTime.getTime()

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  if (minutes > 0) return `${minutes}分钟`
  return '刚刚'
}

// 获取状态标签
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    repair: 'danger',
    retired: '',
  }
  return tagMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    available: '可用',
    rented: '租用中',
    maintenance: '保养中',
    repair: '维修中',
    retired: '已退役',
  }
  return labelMap[status] || status
}

// 获取时间线类型
const getTimelineType = (status: string) => {
  const typeMap: Record<string, any> = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    repair: 'danger',
    retired: '',
  }
  return typeMap[status] || 'primary'
}

// 页面加载
onMounted(() => {
  loadStats()
  loadVehicles()
})
</script>

<style scoped lang="scss">
.vehicle-status-container {
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
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      &.available {
        .stat-icon {
          color: #67c23a;
        }
        .stat-value {
          color: #67c23a;
        }
      }

      &.rented {
        .stat-icon {
          color: #e6a23c;
        }
        .stat-value {
          color: #e6a23c;
        }
      }

      &.maintenance {
        .stat-icon {
          color: #909399;
        }
        .stat-value {
          color: #909399;
        }
      }

      &.repair {
        .stat-icon {
          color: #f56c6c;
        }
        .stat-value {
          color: #f56c6c;
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

  .history-item {
    .history-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .history-content {
      p {
        margin: 8px 0;
        font-size: 14px;
        color: #606266;

        strong {
          color: #303133;
        }
      }
    }
  }
}
</style>
