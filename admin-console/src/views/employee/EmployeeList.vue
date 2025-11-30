<template>
  <div class="employee-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="员工信息">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/手机号/工号"
            clearable
            style="width: 200px"
          />
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
        <el-form-item label="员工角色">
          <el-select
            v-model="searchForm.roleId"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <el-option label="平台管理员" :value="1" />
            <el-option label="区域经理" :value="2" />
            <el-option label="门店经理" :value="3" />
            <el-option label="门店员工" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
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
        新增员工
      </el-button>
      <el-button :icon="Download">导出</el-button>
      <el-button :icon="Upload">导入</el-button>
    </el-card>

    <!-- 员工列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="employeeList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="员工信息" width="200">
          <template #default="{ row }">
            <div class="employee-info">
              <el-avatar :src="row.avatar" :size="40">
                {{ row.realName.charAt(0) }}
              </el-avatar>
              <div class="employee-detail">
                <div class="name">{{ row.realName }}</div>
                <div class="job-number">工号：{{ row.jobNumber }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTypeTag(row.role)" size="small">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属门店" width="150" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职日期" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleAssignRole(row)">
              分配角色
            </el-button>
            <el-button
              link
              :type="row.status === 'active' ? 'danger' : 'success'"
              size="small"
              @click="handleStatusChange(row)"
            >
              {{ row.status === 'active' ? '离职' : '复职' }}
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

    <!-- 新增/编辑员工对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="jobNumber">
              <el-input v-model="form.jobNumber" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属门店" prop="storeId">
              <el-select v-model="form.storeId" placeholder="请选择门店" style="width: 100%">
                <el-option label="北京朝阳店" :value="1" />
                <el-option label="上海浦东店" :value="2" />
                <el-option label="深圳南山店" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="form.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker
                v-model="form.joinDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="员工状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="active">在职</el-radio>
                <el-radio label="inactive">离职</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="员工">
          <div>{{ currentEmployee?.realName }} ({{ currentEmployee?.jobNumber }})</div>
        </el-form-item>
        <el-form-item label="选择角色">
          <el-select v-model="selectedRoles" multiple placeholder="请选择角色" style="width: 100%">
            <el-option label="平台管理员" :value="1" />
            <el-option label="区域经理" :value="2" />
            <el-option label="门店经理" :value="3" />
            <el-option label="门店员工" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Upload,
} from '@element-plus/icons-vue'

const router = useRouter()

// 员工数据类型
interface Employee {
  id: number
  realName: string
  jobNumber: string
  phone: string
  email: string
  role: string
  storeId: number
  storeName: string
  department: string
  status: 'active' | 'inactive'
  avatar: string
  joinDate: string
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  storeId: null as number | null,
  roleId: null as number | null,
  status: '',
})

// 员工列表
const employeeList = ref<Employee[]>([
  {
    id: 1,
    realName: '张三',
    jobNumber: 'EMP001',
    phone: '13800138000',
    email: 'zhangsan@daodao.com',
    role: '平台管理员',
    storeId: 1,
    storeName: '北京朝阳店',
    department: '技术部',
    status: 'active',
    avatar: '',
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    realName: '李四',
    jobNumber: 'EMP002',
    phone: '13800138001',
    email: 'lisi@daodao.com',
    role: '区域经理',
    storeId: 1,
    storeName: '北京朝阳店',
    department: '运营部',
    status: 'active',
    avatar: '',
    joinDate: '2024-02-10',
  },
  {
    id: 3,
    realName: '王五',
    jobNumber: 'EMP003',
    phone: '13800138002',
    email: 'wangwu@daodao.com',
    role: '门店经理',
    storeId: 2,
    storeName: '上海浦东店',
    department: '门店管理',
    status: 'active',
    avatar: '',
    joinDate: '2024-03-05',
  },
])

const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  realName: '',
  jobNumber: '',
  phone: '',
  email: '',
  storeId: null as number | null,
  department: '',
  joinDate: '',
  status: 'active' as Employee['status'],
})

const formRules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
  ],
  jobNumber: [
    { required: true, message: '请输入工号', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  storeId: [
    { required: true, message: '请选择所属门店', trigger: 'change' },
  ],
}

// 角色分配对话框
const roleDialogVisible = ref(false)
const currentEmployee = ref<Employee | null>(null)
const selectedRoles = ref<number[]>([])

// 搜索
const handleSearch = () => {
  pagination.page = 1
  ElMessage.success('搜索功能开发中...')
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.storeId = null
  searchForm.roleId = null
  searchForm.status = ''
  pagination.page = 1
}

// 新增员工
const handleCreate = () => {
  dialogTitle.value = '新增员工'
  isEdit.value = false
  dialogVisible.value = true
}

// 查看员工
const handleView = (row: Employee) => {
  router.push(`/employees/detail/${row.id}`)
}

// 编辑员工
const handleEdit = (row: Employee) => {
  dialogTitle.value = '编辑员工'
  isEdit.value = true
  form.id = row.id
  form.realName = row.realName
  form.jobNumber = row.jobNumber
  form.phone = row.phone
  form.email = row.email
  form.storeId = row.storeId
  form.department = row.department
  form.joinDate = row.joinDate
  form.status = row.status
  dialogVisible.value = true
}

// 分配角色
const handleAssignRole = (row: Employee) => {
  currentEmployee.value = row
  selectedRoles.value = []
  roleDialogVisible.value = true
}

// 状态变更
const handleStatusChange = async (row: Employee) => {
  const action = row.status === 'active' ? '离职' : '复职'
  try {
    await ElMessageBox.confirm(
      `确定要将员工 "${row.realName}" 设置为${action}状态吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
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
        const index = employeeList.value.findIndex(e => e.id === form.id)
        if (index > -1) {
          employeeList.value[index] = {
            ...employeeList.value[index],
            realName: form.realName,
            jobNumber: form.jobNumber,
            phone: form.phone,
            email: form.email,
            storeId: form.storeId!,
            department: form.department,
            joinDate: form.joinDate,
            status: form.status,
          }
        }
        ElMessage.success('更新成功')
      } else {
        const newEmployee: Employee = {
          id: employeeList.value.length + 1,
          realName: form.realName,
          jobNumber: form.jobNumber,
          phone: form.phone,
          email: form.email,
          role: '门店员工',
          storeId: form.storeId!,
          storeName: '北京朝阳店',
          department: form.department,
          status: form.status,
          avatar: '',
          joinDate: form.joinDate,
        }
        employeeList.value.push(newEmployee)
        pagination.total++
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

// 提交角色分配
const handleRoleSubmit = () => {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请选择至少一个角色')
    return
  }
  ElMessage.success('角色分配成功')
  roleDialogVisible.value = false
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.id = 0
  form.realName = ''
  form.jobNumber = ''
  form.phone = ''
  form.email = ''
  form.storeId = null
  form.department = ''
  form.joinDate = ''
  form.status = 'active'
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

// 获取角色类型标签
const getRoleTypeTag = (role: string) => {
  const typeMap: Record<string, any> = {
    '平台管理员': 'danger',
    '区域经理': 'warning',
    '门店经理': 'success',
    '门店员工': 'info',
  }
  return typeMap[role] || 'info'
}

// 页面加载
onMounted(() => {
  // TODO: 加载员工列表
})
</script>

<style scoped lang="scss">
.employee-list-container {
  padding: 20px;

  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .employee-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .employee-detail {
      .name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .job-number {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
