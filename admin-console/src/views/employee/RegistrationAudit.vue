<template>
  <div class="registration-audit-container">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="角色类型">
          <el-select v-model="filterForm.roleType" placeholder="全部" clearable style="width: 150px">
            <el-option label="平台员工" value="employee" />
            <el-option label="清洁工" value="cleaner" />
            <el-option label="服务商" value="service_provider" />
            <el-option label="合作方" value="partner" />
          </el-select>
        </el-form-item>

        <el-form-item label="审核状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="待补充" value="need_supplement" />
          </el-select>
        </el-form-item>

        <el-form-item label="提交时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请列表 -->
    <el-card class="table-card" shadow="never">
      <DataTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <!-- 角色类型 -->
        <template #roleType="{ row }">
          <el-tag :type="getRoleTypeTag(row.roleType)">
            {{ getRoleTypeName(row.roleType) }}
          </el-tag>
        </template>

        <!-- 审核状态 -->
        <template #status="{ row }">
          <el-tag :type="getStatusTag(row.status)">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>

        <!-- 操作 -->
        <template #actions="{ row }">
          <el-button type="primary" link @click="handleView(row)">
            {{ row.status === 'pending' ? '审核' : '查看' }}
          </el-button>
        </template>
      </DataTable>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div v-if="currentRow" class="detail-content">
        <!-- 基本信息编辑表单 -->
        <el-form :model="editForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="角色类型">
                <el-tag :type="getRoleTypeTag(currentRow.roleType)">
                  {{ getRoleTypeName(currentRow.roleType) }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="审核状态">
                <el-tag :type="getStatusTag(currentRow.status)">
                  {{ getStatusName(currentRow.status) }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名">
                <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="身份证号">
                <el-input v-model="editForm.idCard" placeholder="请输入身份证号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="提交时间">
                <el-input v-model="editForm.createdAt" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 平台员工特有字段 -->
          <template v-if="currentRow.roleType === 'employee'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="期望职位">
                  <el-input v-model="editForm.position" placeholder="请输入期望职位" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="期望门店">
                  <el-input v-model="editForm.expectedStore" placeholder="请输入期望门店" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- 清洁工特有字段 -->
          <template v-if="currentRow.roleType === 'cleaner'">
            <el-form-item label="服务区域">
              <el-input v-model="editForm.serviceArea" placeholder="请输入服务区域" />
            </el-form-item>
          </template>

          <!-- 服务商特有字段 -->
          <template v-if="currentRow.roleType === 'service_provider'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="服务类型">
                  <el-input v-model="editForm.serviceType" placeholder="请输入服务类型" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="公司名称">
                  <el-input v-model="editForm.companyName" placeholder="请输入公司名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="营业执照号">
              <el-input v-model="editForm.businessLicense" placeholder="请输入营业执照号" />
            </el-form-item>
          </template>

          <!-- 合作方特有字段 -->
          <template v-if="currentRow.roleType === 'partner'">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="合作类型">
                  <el-input v-model="editForm.partnerType" placeholder="请输入合作类型" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="公司名称">
                  <el-input v-model="editForm.companyName" placeholder="请输入公司名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="营业执照号">
              <el-input v-model="editForm.businessLicense" placeholder="请输入营业执照号" />
            </el-form-item>
          </template>

          <el-form-item label="申请说明">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入申请说明"
            />
          </el-form-item>
        </el-form>

        <!-- 证件照片 -->
        <div v-if="currentRow.photos && currentRow.photos.length > 0" class="photos-section">
          <h4>证件照片</h4>
          <div class="photos-grid">
            <div v-for="(photo, index) in currentRow.photos" :key="index" class="photo-item">
              <el-image
                :src="photo.url"
                :preview-src-list="currentRow.photos.map((p: any) => p.url)"
                :initial-index="index"
                fit="cover"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="photo-label">{{ photo.label }}</div>
            </div>
          </div>
        </div>

        <!-- 审核操作 -->
        <div v-if="currentRow.status === 'pending'" class="audit-actions">
          <el-divider />
          <el-form :model="auditForm" label-width="120px">
            <el-form-item label="审核结果">
              <el-radio-group v-model="auditForm.result">
                <el-radio value="approved">通过</el-radio>
                <el-radio value="rejected">拒绝</el-radio>
                <el-radio value="need_supplement">待补充资料</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 员工审核通过时需要分配门店和职位 -->
            <template v-if="currentRow.roleType === 'employee' && auditForm.result === 'approved'">
              <el-form-item label="分配门店">
                <el-select v-model="auditForm.assignedStore" placeholder="请选择门店" style="width: 100%">
                  <el-option label="北京朝阳门店" value="store_1" />
                  <el-option label="上海浦东门店" value="store_2" />
                  <el-option label="广州天河门店" value="store_3" />
                </el-select>
              </el-form-item>

              <el-form-item label="分配职位">
                <el-select v-model="auditForm.assignedPosition" placeholder="请选择职位" style="width: 100%">
                  <el-option label="门店经理" value="manager" />
                  <el-option label="门店员工" value="staff" />
                  <el-option label="客服人员" value="service" />
                </el-select>
              </el-form-item>
            </template>

            <el-form-item label="审核意见">
              <el-input
                v-model="auditForm.comment"
                type="textarea"
                :rows="4"
                placeholder="请填写审核意见"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmitAudit">提交审核</el-button>
              <el-button @click="dialogVisible = false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'

// 注册申请数据接口
interface RegistrationApplication {
  id: number
  roleType: string
  realName: string
  phone: string
  status: string
  createdAt: string
  [key: string]: unknown
}

// 筛选表单
const filterForm = reactive({
  roleType: '',
  status: '',
  dateRange: null as any,
})

// 表格数据
const tableData = ref<RegistrationApplication[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 表格列配置
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'roleType', label: '角色类型', width: 120, slot: 'roleType' },
  { prop: 'realName', label: '姓名', width: 120 },
  { prop: 'phone', label: '手机号', width: 140 },
  { prop: 'status', label: '审核状态', width: 120, slot: 'status' },
  { prop: 'createdAt', label: '提交时间', width: 180 },
]

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('审核申请')
const currentRow = ref<any>(null)

// 编辑表单
const editForm = reactive({
  phone: '',
  realName: '',
  idCard: '',
  createdAt: '',
  position: '',
  expectedStore: '',
  serviceArea: '',
  serviceType: '',
  companyName: '',
  businessLicense: '',
  partnerType: '',
  description: '',
})

// 审核表单
const auditForm = reactive({
  result: 'approved',
  comment: '',
  assignedStore: '',
  assignedPosition: '',
})

// 获取角色类型标签
const getRoleTypeTag = (type: string) => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    employee: 'primary',
    cleaner: 'success',
    service_provider: 'warning',
    partner: 'danger',
  }
  return map[type] || 'info'
}

// 获取角色类型名称
const getRoleTypeName = (type: string) => {
  const map: Record<string, string> = {
    employee: '平台员工',
    cleaner: '清洁工',
    service_provider: '服务商',
    partner: '合作方',
  }
  return map[type] || type
}

// 获取状态标签
const getStatusTag = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    need_supplement: 'info',
  }
  return map[status] || 'info'
}

// 获取状态名称
const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    need_supplement: '待补充',
  }
  return map[status] || status
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  filterForm.roleType = ''
  filterForm.status = ''
  filterForm.dateRange = null
  handleSearch()
}

// 分页
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

// 查看/审核
const handleView = (row: any) => {
  currentRow.value = { ...row }
  dialogTitle.value = row.status === 'pending' ? '审核申请' : '查看申请'

  // 初始化编辑表单数据
  editForm.phone = row.phone || ''
  editForm.realName = row.realName || ''
  editForm.idCard = row.idCard || ''
  editForm.createdAt = row.createdAt || ''
  editForm.position = row.position || ''
  editForm.expectedStore = row.expectedStore || ''
  editForm.serviceArea = row.serviceArea || ''
  editForm.serviceType = row.serviceType || ''
  editForm.companyName = row.companyName || ''
  editForm.businessLicense = row.businessLicense || ''
  editForm.partnerType = row.partnerType || ''
  editForm.description = row.description || ''

  // 初始化审核表单
  auditForm.result = 'approved'
  auditForm.comment = ''
  auditForm.assignedStore = ''
  auditForm.assignedPosition = ''

  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  currentRow.value = null
}

// 提交审核
const handleSubmitAudit = async () => {
  if (!auditForm.comment.trim()) {
    ElMessage.warning('请填写审核意见')
    return
  }

  try {
    await ElMessageBox.confirm('确认提交审核结果？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true

    // TODO: 调用审核API
    // await auditApi.submitAudit(currentRow.value.id, auditForm)

    // 模拟API调用 - 更新本地数据状态
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新表格数据中的状态和编辑后的数据
    const index = tableData.value.findIndex((item: any) => item.id === currentRow.value.id)
    if (index !== -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        status: auditForm.result,
        phone: editForm.phone,
        realName: editForm.realName,
        idCard: editForm.idCard,
        position: editForm.position,
        expectedStore: editForm.expectedStore,
        serviceArea: editForm.serviceArea,
        serviceType: editForm.serviceType,
        companyName: editForm.companyName,
        businessLicense: editForm.businessLicense,
        partnerType: editForm.partnerType,
        description: editForm.description,
      }
    }

    ElMessage.success('审核提交成功')
    dialogVisible.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error(error.message || '审核失败')
    }
  } finally {
    loading.value = false
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true

  try {
    // TODO: 调用API获取数据
    // const res = await registrationApi.getList({
    //   ...filterForm,
    //   page: pagination.currentPage,
    //   pageSize: pagination.pageSize,
    // })

    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))

    tableData.value = [
      {
        id: 1,
        roleType: 'employee',
        realName: '张三',
        phone: '13800138001',
        idCard: '110101199001011234',
        position: '门店经理',
        expectedStore: '北京朝阳门店',
        description: '有5年房车租赁行业经验，熟悉门店运营管理',
        photos: [
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '身份证正面' },
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '身份证反面' },
        ],
        status: 'pending',
        createdAt: '2025-12-28 10:30:00',
      },
      {
        id: 2,
        roleType: 'cleaner',
        realName: '李四',
        phone: '13800138002',
        idCard: '110101199002021234',
        serviceArea: '北京市朝阳区',
        description: '有3年车辆清洁经验，服务态度好',
        photos: [
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '身份证正面' },
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '身份证反面' },
        ],
        status: 'pending',
        createdAt: '2025-12-28 11:00:00',
      },
      {
        id: 3,
        roleType: 'service_provider',
        realName: '王五',
        phone: '13800138003',
        idCard: '110101199003031234',
        serviceType: '维修保养',
        companyName: '北京XX汽车维修有限公司',
        businessLicense: '91110000MA01234567',
        description: '专业房车维修保养服务，有完善的服务体系',
        photos: [
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '身份证正面' },
          { url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', label: '营业执照' },
        ],
        status: 'approved',
        createdAt: '2025-12-27 14:20:00',
      },
    ] as any

    pagination.total = 3
  } catch (error: any) {
    console.error('获取数据失败:', error)
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.registration-audit-container {
  .filter-card {
    margin-bottom: 16px;
  }

  .detail-content {
    max-height: 600px;
    overflow-y: auto;
  }

  .photos-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 12px;
      font-size: 14px;
      color: #303133;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;

      .photo-item {
        .el-image {
          width: 100%;
          height: 150px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }

        .photo-label {
          margin-top: 8px;
          font-size: 12px;
          color: #606266;
          text-align: center;
        }

        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #f5f7fa;
          color: #909399;
          font-size: 32px;
        }
      }
    }
  }

  .audit-actions {
    margin-top: 20px;
  }
}
</style>
