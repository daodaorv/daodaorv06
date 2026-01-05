<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <PageHeader title="用户角色管理" description="管理用户角色类型、权益配置和自动分配规则" />

    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="list"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :toolbar-buttons="toolbarButtons"
      :pagination="pagination"
      :actions-width="280"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 角色类型列 -->
      <template #type="{ row }">
        <el-tag :type="row.isSystem ? 'primary' : 'success'">
          {{ row.isSystem ? '系统角色' : '自定义角色' }}
        </el-tag>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          active-value="active"
          inactive-value="inactive"
          :disabled="row.isSystem"
          @change="handleStatusChange(row)"
        />
      </template>

      <!-- 用户数量列 -->
      <template #userCount="{ row }">
        <el-link type="primary" @click="handleViewUsers(row)">
          {{ row.userCount }} 人
        </el-link>
      </template>

      <!-- 创建时间列 -->
      <template #createdAt="{ row }">
        {{ formatDateTime(row.createdAt) }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary" size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button link type="primary" size="small" @click="handleConfigBenefits(row)">
          配置权益
        </el-button>
        <el-button
          link
          type="danger"
          size="small"
          :disabled="row.isSystem"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </DataTable>

    <!-- 新增/编辑角色对话框 -->
    <FormDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :fields="formFields"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="600px"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'
import type { FormField } from '@/components/common/FormDialog.vue'
import { useDateFormat, useErrorHandler } from '@/composables'
import { exportToCSV } from '@/utils/export'

const router = useRouter()

// Composables
const { formatDateTime } = useDateFormat()
const { handleApiError } = useErrorHandler()

// 用户角色数据类型
interface UserRole {
  id: number
  name: string
  code: string
  description: string
  isSystem: boolean
  status: 'active' | 'inactive'
  userCount: number
  createdAt: string
}

// Mock 数据
const list = ref<UserRole[]>([
  {
    id: 1,
    name: '普通注册用户',
    code: 'normal',
    description: '小程序注册的普通用户',
    isSystem: true,
    status: 'active',
    userCount: 1180,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'PLUS用户',
    code: 'plus',
    description: '付费会员用户（99元/年）',
    isSystem: true,
    status: 'active',
    userCount: 85,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: '自有车托管用户',
    code: 'hosting_own',
    description: '托管自有房车的用户',
    isSystem: true,
    status: 'active',
    userCount: 28,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    name: '购车托管用户',
    code: 'hosting_purchase',
    description: '通过平台购车并托管的用户',
    isSystem: true,
    status: 'active',
    userCount: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    name: '众筹托管用户',
    code: 'hosting_crowdfunding',
    description: '参与众筹项目的用户',
    isSystem: true,
    status: 'active',
    userCount: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
])

const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: '',
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5,
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称或编码',
    width: '200px',
  },
  {
    prop: 'type',
    label: '角色类型',
    type: 'select',
    placeholder: '请选择类型',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '系统角色', value: 'system' },
      { label: '自定义角色', value: 'custom' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '角色名称', width: 180 },
  { prop: 'code', label: '角色编码', width: 180 },
  { prop: 'description', label: '角色描述', minWidth: 200 },
  { prop: 'type', label: '角色类型', width: 120, slot: 'type' },
  { prop: 'userCount', label: '用户数量', width: 120, slot: 'userCount' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'createdAt', label: '创建时间', width: 180, slot: 'createdAt' },
]

// 工具栏按钮配置
const toolbarButtons: ToolbarButton[] = [
  {
    label: '新增角色',
    type: 'primary',
    icon: Plus,
    onClick: handleAdd,
  },
  {
    label: '导出',
    icon: Download,
    onClick: handleExport,
  },
]

// 表格操作列配置
const tableActions: TableAction[] = []

// 对话框
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentRole = ref<UserRole | null>(null)

const formData = reactive({
  name: '',
  code: '',
  description: '',
})

// 表单字段配置
const formFields: FormField[] = [
  {
    prop: 'name',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称',
  },
  {
    prop: 'code',
    label: '角色编码',
    type: 'input',
    placeholder: '请输入角色编码（英文）',
  },
  {
    prop: 'description',
    label: '角色描述',
    type: 'textarea',
    rows: 3,
    placeholder: '请输入角色描述',
  },
]

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '角色编码只能包含小写字母和下划线', trigger: 'blur' },
  ],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
}

const dialogTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

// 搜索
function handleSearch() {
  pagination.page = 1
  ElMessage.success('搜索功能开发中...')
}

// 重置
function handleReset() {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.status = ''
  pagination.page = 1
}

// 新增角色
function handleAdd() {
  isEdit.value = false
  currentRole.value = null
  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
  })
  dialogVisible.value = true
}

// 编辑角色
function handleEdit(row: UserRole) {
  if (row.isSystem) {
    ElMessage.warning('系统角色不可编辑')
    return
  }
  isEdit.value = true
  currentRole.value = row
  Object.assign(formData, {
    name: row.name,
    code: row.code,
    description: row.description,
  })
  dialogVisible.value = true
}

// 提交表单
async function handleSubmit() {
  submitLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value && currentRole.value) {
      Object.assign(currentRole.value, formData)
      ElMessage.success('编辑成功')
    } else {
      const newRole: UserRole = {
        id: list.value.length + 1,
        ...formData,
        isSystem: false,
        status: 'active',
        userCount: 0,
        createdAt: new Date().toISOString(),
      }
      list.value.unshift(newRole)
      pagination.total++
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  } catch (error) {
    handleApiError(error, isEdit.value ? '编辑失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除角色
async function handleDelete(row: UserRole) {
  if (row.userCount > 0) {
    ElMessage.warning('该角色下还有用户，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = list.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      list.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 切换状态
async function handleStatusChange(row: UserRole) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 'active' ? 'inactive' : 'active'
    handleApiError(error, '状态更新失败')
  }
}

// 配置权益
function handleConfigBenefits(row: UserRole) {
  router.push({
    path: '/user/role-config',
    query: { roleId: row.id },
  })
}

// 查看用户列表
function handleViewUsers(row: UserRole) {
  router.push({
    path: '/user/list',
    query: { roleCode: row.code },
  })
}

// 分页
function handleSizeChange(size: number) {
  pagination.pageSize = size
}

function handleCurrentChange(page: number) {
  pagination.page = page
}

// 导出数据
function handleExport() {
  if (list.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '角色名称' },
    { key: 'code', label: '角色编码' },
    { key: 'description', label: '角色描述' },
  ]

  exportToCSV(list.value, columns, '用户角色列表')
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
