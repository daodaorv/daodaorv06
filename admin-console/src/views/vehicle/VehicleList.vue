<template>
  <div class="vehicle-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>车辆列表</h2>
      <p class="page-description">管理平台所有车辆档案、状态跟踪和位置管理(包含平台自有、托管、合作车辆)</p>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="车牌号">
          <el-input
            v-model="searchForm.vehicleNumber"
            placeholder="请输入车牌号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="车型">
          <el-select
            v-model="searchForm.modelId"
            placeholder="请选择车型"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="model in vehicleModelsList"
              :key="model.id"
              :label="model.modelName"
              :value="model.id"
            />
          </el-select>
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
            <el-option label="成都武侯店" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="所有权类型">
          <el-select
            v-model="searchForm.ownershipType"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="平台自有" value="platform" />
            <el-option label="托管车辆" value="hosting" />
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
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新增车辆
      </el-button>
      <el-button :icon="Download">导出车辆</el-button>
      <el-button :icon="Upload">导入车辆</el-button>
    </el-card>

    <!-- 车辆列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="vehicleList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="车辆图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.images[0]"
              :preview-src-list="row.images"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
        <el-table-column prop="modelName" label="车型" width="180" />
        <el-table-column label="所有权类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getOwnershipTypeTag(row.ownershipType)" size="small">
              {{ getOwnershipTypeLabel(row.ownershipType) }}
            </el-tag>
            <div v-if="row.ownershipType === 'hosting'" style="font-size: 12px; color: #909399; margin-top: 2px;">
              {{ row.hostingOwnerName }}
            </div>
            <div v-if="row.ownershipType === 'cooperative'" style="font-size: 12px; color: #909399; margin-top: 2px;">
              {{ row.cooperativePartnerName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="车辆状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属门店" width="150" />
        <el-table-column prop="location" label="当前位置" width="150" show-overflow-tooltip />
        <el-table-column prop="currentMileage" label="总里程(km)" width="120">
          <template #default="{ row }">
            {{ row.currentMileage.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="dailyPrice" label="日租金" width="100">
          <template #default="{ row }">
            ¥{{ row.dailyPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="购入日期" width="120" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-dropdown @command="(cmd) => handleStatusChange(row, cmd)">
              <el-button link type="warning" size="small">
                状态 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="available" :disabled="row.status === 'available'">
                    设为可用
                  </el-dropdown-item>
                  <el-dropdown-item command="maintenance" :disabled="row.status === 'maintenance'">
                    进入保养
                  </el-dropdown-item>
                  <el-dropdown-item command="repair" :disabled="row.status === 'repair'">
                    进入维修
                  </el-dropdown-item>
                  <el-dropdown-item command="retired" :disabled="row.status === 'retired'">
                    设为退役
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 新增/编辑车辆对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="车牌号" prop="vehicleNumber">
                  <el-input v-model="form.vehicleNumber" placeholder="请输入车牌号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车型" prop="modelId">
                  <el-select v-model="form.modelId" placeholder="请选择车型" style="width: 100%">
                    <el-option
                      v-for="model in vehicleModelsList"
                      :key="model.id"
                      :label="model.modelName"
                      :value="model.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所有权类型" prop="ownershipType">
                  <el-select v-model="form.ownershipType" placeholder="请选择所有权类型" style="width: 100%">
                    <el-option label="平台自有" value="platform" />
                    <el-option label="托管车辆" value="hosting" />
                    <el-option label="合作车辆" value="cooperative" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属门店" prop="storeId">
                  <el-select v-model="form.storeId" placeholder="请选择门店" style="width: 100%">
                    <el-option label="北京朝阳店" :value="1" />
                    <el-option label="上海浦东店" :value="2" />
                    <el-option label="深圳南山店" :value="3" />
                    <el-option label="成都武侯店" :value="4" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="购入日期" prop="purchaseDate">
                  <el-date-picker
                    v-model="form.purchaseDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购入价格" prop="purchasePrice">
                  <el-input-number
                    v-model="form.purchasePrice"
                    :min="0"
                    :step="10000"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="当前里程(km)" prop="currentMileage">
                  <el-input-number
                    v-model="form.currentMileage"
                    :min="0"
                    :step="100"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="日租金" prop="dailyPrice">
                  <el-input-number
                    v-model="form.dailyPrice"
                    :min="0"
                    :step="50"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="当前位置" prop="location">
              <el-input v-model="form.location" placeholder="请输入当前位置" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="保险信息" name="insurance">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="保险公司">
                  <el-input v-model="form.insuranceCompany" placeholder="请输入保险公司" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保险到期日期">
                  <el-date-picker
                    v-model="form.insuranceExpireDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="年检日期">
              <el-date-picker
                v-model="form.annualInspectionDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="维保信息" name="maintenance">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最后保养日期">
                  <el-date-picker
                    v-model="form.lastMaintenanceDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下次保养日期">
                  <el-date-picker
                    v-model="form.nextMaintenanceDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
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
  Upload,
  Picture,
  ArrowDown,
} from '@element-plus/icons-vue'
import {
  getVehicles,
  getVehicleModels,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  changeVehicleStatus,
  type Vehicle,
  type VehicleModel,
} from '@/api/vehicle'

// 搜索表单
const searchForm = reactive({
  vehicleNumber: '',
  modelId: null as number | null,
  status: '',
  storeId: null as number | null,
  ownershipType: '',
})

// 车辆列表
const vehicleList = ref<Vehicle[]>([])
const vehicleModelsList = ref<VehicleModel[]>([])

const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增车辆')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const activeTab = ref('basic')

const form = reactive({
  id: 0,
  vehicleNumber: '',
  modelId: null as number | null,
  ownershipType: 'platform' as 'platform' | 'hosting' | 'cooperative',
  storeId: null as number | null,
  storeName: '',
  purchaseDate: '',
  purchasePrice: 0,
  currentMileage: 0,
  dailyPrice: 0,
  location: '',
  insuranceCompany: '',
  insuranceExpireDate: '',
  annualInspectionDate: '',
  lastMaintenanceDate: '',
  nextMaintenanceDate: '',
  remark: '',
})

const formRules: FormRules = {
  vehicleNumber: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
  ],
  modelId: [
    { required: true, message: '请选择车型', trigger: 'change' },
  ],
  storeId: [
    { required: true, message: '请选择所属门店', trigger: 'change' },
  ],
  crowdfundingProjectId: [
    { required: true, message: '请选择众筹项目', trigger: 'change' },
  ],
  purchaseDate: [
    { required: true, message: '请选择购入日期', trigger: 'change' },
  ],
  purchasePrice: [
    { required: true, message: '请输入购入价格', trigger: 'blur' },
  ],
}

// 加载车辆列表
const loadVehicles = async () => {
  loading.value = true
  try {
    const res = await getVehicles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      vehicleNumber: searchForm.vehicleNumber,
      modelId: searchForm.modelId,
      storeId: searchForm.storeId,
      status: searchForm.status,
      ownershipType: 'crowdfunding', // 只显示众筹车辆
      crowdfundingProjectId: searchForm.crowdfundingProjectId,
    })
    vehicleList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

// 加载车型列表
const loadVehicleModels = async () => {
  try {
    const res = await getVehicleModels({
      page: 1,
      pageSize: 100,
      status: 'active',
    })
    vehicleModelsList.value = res.data.list
  } catch (error) {
    ElMessage.error('加载车型列表失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadVehicles()
}

// 重置
const handleReset = () => {
  searchForm.vehicleNumber = ''
  searchForm.modelId = null
  searchForm.status = ''
  searchForm.storeId = null
  searchForm.crowdfundingProjectId = null
  pagination.page = 1
  loadVehicles()
}

// 新增车辆
const handleCreate = () => {
  dialogTitle.value = '新增车辆'
  isEdit.value = false
  activeTab.value = 'basic'
  dialogVisible.value = true
}

// 查看车辆
const handleView = (row: Vehicle) => {
  ElMessage.info('查看功能开发中...')
}

// 编辑车辆
const handleEdit = (row: Vehicle) => {
  dialogTitle.value = '编辑车辆'
  isEdit.value = true
  activeTab.value = 'basic'
  form.id = row.id
  form.vehicleNumber = row.vehicleNumber
  form.modelId = row.modelId
  form.crowdfundingProjectId = row.crowdfundingProjectId
  form.crowdfundingProjectName = row.crowdfundingProjectName || ''
  form.storeId = row.storeId
  form.storeName = row.storeName
  form.purchaseDate = row.purchaseDate
  form.purchasePrice = row.purchasePrice
  form.currentMileage = row.currentMileage
  form.dailyPrice = row.dailyPrice
  form.location = row.location
  form.insuranceCompany = row.insuranceCompany
  form.insuranceExpireDate = row.insuranceExpireDate
  form.annualInspectionDate = row.annualInspectionDate
  form.lastMaintenanceDate = row.lastMaintenanceDate
  form.nextMaintenanceDate = row.nextMaintenanceDate
  form.remark = row.remark
  dialogVisible.value = true
}

// 状态变更
const handleStatusChange = async (row: Vehicle, status: string) => {
  const statusMap: Record<string, string> = {
    available: '可用',
    maintenance: '保养中',
    repair: '维修中',
    retired: '已退役',
  }

  try {
    await ElMessageBox.confirm(
      `确定要将车辆 "${row.vehicleNumber}" 状态设置为"${statusMap[status]}"吗？`,
      '状态变更确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await changeVehicleStatus(row.id, status as any)
    ElMessage.success('状态更新成功')
    loadVehicles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态更新失败')
    }
  }
}

// 删除车辆
const handleDelete = async (row: Vehicle) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除车辆 "${row.vehicleNumber}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteVehicle(row.id)
    ElMessage.success('删除成功')
    loadVehicles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
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
      const data = {
        vehicleNumber: form.vehicleNumber,
        modelId: form.modelId!,
        ownershipType: 'crowdfunding' as const,
        crowdfundingProjectId: form.crowdfundingProjectId,
        crowdfundingProjectName: form.crowdfundingProjectName,
        storeId: form.storeId!,
        storeName: form.storeName,
        purchaseDate: form.purchaseDate,
        purchasePrice: form.purchasePrice,
        currentMileage: form.currentMileage,
        dailyPrice: form.dailyPrice,
        location: form.location,
        insuranceCompany: form.insuranceCompany,
        insuranceExpireDate: form.insuranceExpireDate,
        annualInspectionDate: form.annualInspectionDate,
        lastMaintenanceDate: form.lastMaintenanceDate,
        nextMaintenanceDate: form.nextMaintenanceDate,
        remark: form.remark,
      }

      if (isEdit.value) {
        await updateVehicle(form.id, data)
        ElMessage.success('更新成功')
      } else {
        await createVehicle(data)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadVehicles()
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
  form.vehicleNumber = ''
  form.modelId = null
  form.crowdfundingProjectId = null
  form.crowdfundingProjectName = ''
  form.storeId = null
  form.storeName = ''
  form.purchaseDate = ''
  form.purchasePrice = 0
  form.currentMileage = 0
  form.dailyPrice = 0
  form.location = ''
  form.insuranceCompany = ''
  form.insuranceExpireDate = ''
  form.annualInspectionDate = ''
  form.lastMaintenanceDate = ''
  form.nextMaintenanceDate = ''
  form.remark = ''
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

// 获取所有权类型标签
const getOwnershipTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    platform: 'primary',
    hosting: 'success',
    cooperative: 'warning',
  }
  return tagMap[type] || 'info'
}

// 获取所有权类型标签文本
const getOwnershipTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    platform: '平台自有',
    hosting: '托管车辆',
    cooperative: '合作车辆',
  }
  return labelMap[type] || type
}

// 页面加载
onMounted(() => {
  loadVehicleModels()
  loadVehicles()
})
</script>

<style scoped lang="scss">
.vehicle-list-container {
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

  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 60px;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 24px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
