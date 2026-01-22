<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <StatsCard :stats="statsConfig" />

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
      :actions-width="320"
      :selectable="true"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <!-- 用户信息列 -->
      <template #userInfo="{ row }">
        <div class="user-info">
          <el-avatar :src="row.avatarUrl" :size="40">
            {{ row.username?.charAt(0) || row.phone?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-detail">
            <div class="nickname">{{ row.username || row.phone }}</div>
            <div class="phone">{{ row.phone }}</div>
          </div>
        </div>
      </template>

      <!-- 用户角色列 -->
      <template #roles="{ row }">
        <div class="roles-tags">
          <el-tag
            v-for="role in row.roles"
            :key="role.id"
            :type="getRoleTagType(role.code)"
            size="small"
            style="margin-right: 4px; margin-bottom: 4px"
          >
            {{ role.name }}
          </el-tag>
          <el-tag v-if="!row.roles || row.roles.length === 0" type="info" size="small">
            普通用户
          </el-tag>
        </div>
      </template>

      <!-- 注册时间列 -->
      <template #createdAt="{ row }">
        {{ formatDateTime(row.createdAt) }}
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
          {{ row.status === 'active' ? '正常' : '已封禁' }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary" size="small" @click="handleView(row)">
          查看详情
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
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'active' ? '封禁' : '解封' }}
        </el-button>
      </template>
    </DataTable>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="currentUser" :column="2" border>
        <el-descriptions-item label="用户ID">
          {{ currentUser.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ currentUser.username }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ currentUser.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          {{ currentUser.realName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户角色" :span="2">
          <el-tag
            v-for="role in currentUser.roles"
            :key="role.id"
            :type="getRoleTagType(role.code)"
            size="small"
            style="margin-right: 4px"
          >
            {{ role.name }}
          </el-tag>
          <span v-if="!currentUser.roles || currentUser.roles.length === 0">普通用户</span>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatDateTime(currentUser.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录">
          {{ formatDateTime(currentUser.lastLoginAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
            {{ currentUser.status === 'active' ? '正常' : '已封禁' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 用户编辑对话框 -->
    <FormDialog
      v-model="editDialogVisible"
      :title="isAddMode ? '添加用户' : '编辑用户'"
      :fields="editFormFields"
      :form-data="editFormData"
      :loading="editSubmitLoading"
      width="700px"
      @submit="handleEditSubmit"
    />

    <!-- 分配角色对话框 -->
    <FormDialog
      v-model="roleDialogVisible"
      title="分配用户角色"
      :fields="roleFormFields"
      :form-data="roleFormData"
      :loading="roleSubmitLoading"
      width="600px"
      @submit="handleRoleSubmit"
    >
      <template #header>
        <div style="margin-bottom: 16px">
          <strong>用户：</strong>{{ currentUser?.username || currentUser?.phone }} ({{ currentUser?.phone }})
        </div>
      </template>
    </FormDialog>

    <!-- 批量分配角色对话框 -->
    <FormDialog
      v-model="batchRoleDialogVisible"
      title="批量分配角色"
      :fields="roleFormFields"
      :form-data="roleFormData"
      :loading="roleSubmitLoading"
      width="600px"
      @submit="handleBatchRoleSubmit"
    >
      <template #header>
        <div style="margin-bottom: 16px">
          <strong>已选择：</strong>{{ selectedUsers.length }} 个用户
        </div>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, UserFilled, Checked, Download } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import type { StatItem } from '@/components/common/StatsCard.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'
import type { FormField } from '@/components/common/FormDialog.vue'
import { useDateFormat, useErrorHandler } from '@/composables'
import { exportToCSV } from '@/utils/export'
import { userApi } from '@/api/user'
import type { UserInfo } from '@/api/user'

// Composables
const { formatDateTime } = useDateFormat()
const { handleApiError } = useErrorHandler()

// 数据状态
const list = ref<UserInfo[]>([])
const loading = ref(false)

// 统计数据
const stats = reactive({
  totalUsers: 1250,
  activeUsers: 1180,
  plusUsers: 85,
  hostingUsers: 42,
})

// 统计卡片配置
const statsConfig = computed<StatItem[]>(() => [
  {
    label: '总用户数',
    value: stats.totalUsers,
    icon: User,
    color: '#409eff',
  },
  {
    label: '活跃用户',
    value: stats.activeUsers,
    icon: UserFilled,
    color: '#67c23a',
  },
  {
    label: 'PLUS用户',
    value: stats.plusUsers,
    icon: Checked,
    color: '#e6a23c',
  },
  {
    label: '托管用户',
    value: stats.hostingUsers,
    icon: UserFilled,
    color: '#909399',
  },
])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  roleCode: '',
  status: '',
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
})

// 搜索字段配置
const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '用户信息',
    type: 'input',
    placeholder: '手机号/昵称/真实姓名',
    width: '220px',
  },
  {
    prop: 'roleCode',
    label: '用户角色',
    type: 'select',
    placeholder: '请选择角色',
    width: '180px',
    options: [
      { label: '全部', value: '' },
      { label: '普通注册用户', value: 'normal' },
      { label: 'PLUS用户', value: 'plus' },
      { label: '自有车托管用户', value: 'hosting_own' },
      { label: '购车托管用户', value: 'hosting_purchase' },
      { label: '众筹托管用户', value: 'hosting_crowdfunding' },
    ],
  },
  {
    prop: 'status',
    label: '账号状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '正常', value: 'active' },
      { label: '已封禁', value: 'banned' },
    ],
  },
]

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'userInfo', label: '用户信息', width: 200, slot: 'userInfo' },
  { prop: 'roles', label: '用户角色', minWidth: 200, slot: 'roles' },
  { prop: 'createdAt', label: '注册时间', width: 180, slot: 'createdAt' },
  { prop: 'lastLoginAt', label: '最后登录', width: 180, slot: 'createdAt' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
]

// 工具栏按钮配置
const toolbarButtons = computed<ToolbarButton[]>(() => [
  {
    label: '添加用户',
    type: 'primary',
    onClick: handleAdd,
  },
  {
    label: '批量分配角色',
    type: 'default',
    onClick: handleBatchAssignRole,
    disabled: selectedUsers.value.length === 0,
  },
  {
    label: '批量删除',
    type: 'danger',
    onClick: handleBatchDelete,
    disabled: selectedUsers.value.length === 0,
  },
  {
    label: '导出',
    icon: Download,
    onClick: handleExport,
  },
])

// 表格操作列配置
const tableActions: TableAction[] = []

// 对话框
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const batchRoleDialogVisible = ref(false)
const editSubmitLoading = ref(false)
const roleSubmitLoading = ref(false)
const currentUser = ref<UserInfo | null>(null)
const isAddMode = ref(false)

// 批量选择
const selectedUsers = ref<UserInfo[]>([])

const roleFormData = reactive({
  roleIds: [] as number[],
})

const editFormData = reactive({
  username: '',
  phone: '',
  realName: '',
  password: '',
  avatarUrl: '',
  avatarFile: null as File | null,
  roleIds: [] as number[],
})

// 可用角色列表（从后端动态加载）
const availableRoles = ref<Array<{ id: number; name: string; code: string }>>([])

// 加载角色列表
async function loadRoles() {
  try {
    // 根据产品需求文档，C端用户角色包括：
    // 1. 普通用户
    // 2. PLUS会员
    availableRoles.value = [
      { id: 21, name: '普通用户', code: 'customer_normal' },
      { id: 22, name: 'PLUS会员', code: 'customer_plus' },
    ]
  } catch (error) {
    handleApiError(error, '加载角色列表失败')
  }
}

// 编辑表单字段配置
const editFormFields = computed<FormField[]>(() => [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    required: true,
    placeholder: '请输入用户名',
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    required: true,
    placeholder: '请输入手机号',
  },
  {
    prop: 'realName',
    label: '真实姓名',
    type: 'input',
    placeholder: '请输入真实姓名',
  },
  {
    prop: 'password',
    label: isAddMode.value ? '登录密码' : '新密码',
    type: 'password',
    required: isAddMode.value,
    placeholder: isAddMode.value ? '请输入登录密码' : '留空则不修改密码',
  },
  {
    prop: 'avatarFile',
    label: '用户头像',
    type: 'upload',
    accept: 'image/*',
    placeholder: '点击上传头像',
  },
  {
    prop: 'roleIds',
    label: '用户角色',
    type: 'checkbox',
    options: availableRoles.value.map(r => ({
      label: r.name,
      value: r.id,
    })),
  },
])

// 角色表单字段配置
const roleFormFields: FormField[] = [
  {
    prop: 'roleIds',
    label: '选择角色',
    type: 'checkbox',
    options: availableRoles.value.map(r => ({
      label: r.name,
      value: r.id,
    })),
  },
]

// 搜索
async function handleSearch() {
  pagination.page = 1
  await loadUserList()
}

// 重置
async function handleReset() {
  searchForm.keyword = ''
  searchForm.roleCode = ''
  searchForm.status = ''
  pagination.page = 1
  await loadUserList()
}

// 加载用户列表
async function loadUserList() {
  loading.value = true
  try {
    const response = await userApi.getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      phone: searchForm.keyword,
      username: searchForm.keyword,
      status: searchForm.status,
    })

    list.value = response.data.list
    pagination.total = response.data.total

    // 更新统计数据
    stats.totalUsers = response.data.total
    stats.activeUsers = response.data.list.filter(u => u.status === 'active').length
  } catch (error) {
    handleApiError(error, '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
function handleView(row: UserInfo) {
  currentUser.value = row
  detailDialogVisible.value = true
}

// 批量选择变化
function handleSelectionChange(selection: UserInfo[]) {
  selectedUsers.value = selection
}

// 添加用户
function handleAdd() {
  isAddMode.value = true
  editFormData.username = ''
  editFormData.phone = ''
  editFormData.realName = ''
  editFormData.password = ''
  editFormData.avatarUrl = ''
  editFormData.avatarFile = null
  editFormData.roleIds = []
  editDialogVisible.value = true
}

// 编辑用户
function handleEdit(row: UserInfo) {
  isAddMode.value = false
  currentUser.value = row
  editFormData.username = row.username || ''
  editFormData.phone = row.phone || ''
  editFormData.realName = row.realName || ''
  editFormData.password = ''
  editFormData.avatarUrl = row.avatarUrl || ''
  editFormData.avatarFile = null
  editFormData.roleIds = row.roles?.map(r => r.id) || []
  editDialogVisible.value = true
}

// 提交编辑
async function handleEditSubmit() {
  editSubmitLoading.value = true
  try {
    if (isAddMode.value) {
      // 调用创建用户 API
      const createData = {
        username: editFormData.username,
        phone: editFormData.phone,
        password: editFormData.password,
        realName: editFormData.realName,
        userType: 'registered' as const,
      }
      await userApi.createUser(createData)
      ElMessage.success('添加用户成功')
    } else {
      // 调用更新用户 API
      if (!currentUser.value) {
        throw new Error('当前用户信息不存在')
      }

      const updateData = {
        id: currentUser.value.id,
        username: editFormData.username,
        realName: editFormData.realName,
      }
      await userApi.updateUser(updateData)
      ElMessage.success('编辑用户成功')
    }

    // 关闭对话框并刷新列表
    editDialogVisible.value = false
    await loadUserList()
  } catch (error) {
    handleApiError(error, isAddMode.value ? '添加用户失败' : '编辑用户失败')
  } finally {
    editSubmitLoading.value = false
  }
}

// 分配角色
function handleAssignRole(row: UserInfo) {
  currentUser.value = row
  roleFormData.roleIds = row.roles?.map(r => r.id) || []
  roleDialogVisible.value = true
}

// 提交角色分配
async function handleRoleSubmit() {
  roleSubmitLoading.value = true
  try {
    if (!currentUser.value) {
      throw new Error('当前用户信息不存在')
    }

    // 调用真实 API
    await userApi.assignUserRoles(currentUser.value.id, roleFormData.roleIds)

    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    await loadUserList()
  } catch (error) {
    handleApiError(error, '角色分配失败')
  } finally {
    roleSubmitLoading.value = false
  }
}

// 批量分配角色
function handleBatchAssignRole() {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  roleFormData.roleIds = []
  batchRoleDialogVisible.value = true
}

// 提交批量角色分配
async function handleBatchRoleSubmit() {
  roleSubmitLoading.value = true
  try {
    const userIds = selectedUsers.value.map(u => u.id)

    // 调用真实 API
    await userApi.batchAssignRoles(userIds, roleFormData.roleIds)

    ElMessage.success(`成功为 ${selectedUsers.value.length} 个用户分配角色`)
    batchRoleDialogVisible.value = false
    selectedUsers.value = []
    await loadUserList()
  } catch (error) {
    handleApiError(error, '批量分配角色失败')
  } finally {
    roleSubmitLoading.value = false
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const userIds = selectedUsers.value.map(u => u.id)

    // 调用真实 API
    await userApi.batchDeleteUsers(userIds)

    ElMessage.success(`成功删除 ${selectedUsers.value.length} 个用户`)
    selectedUsers.value = []
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '批量删除失败')
    }
  }
}

// 切换用户状态
async function handleToggleStatus(row: UserInfo) {
  const action = row.status === 'active' ? '封禁' : '解封'
  const newStatus = row.status === 'active' ? 'banned' : 'active'

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username || row.phone}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用真实 API
    await userApi.changeUserStatus(row.id, newStatus)

    ElMessage.success(`${action}成功`)
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, `${action}失败`)
    }
  }
}

// 分页
async function handleSizeChange(size: number) {
  pagination.pageSize = size
  await loadUserList()
}

async function handleCurrentChange(page: number) {
  pagination.page = page
  await loadUserList()
}

// 导出数据
function handleExport() {
  if (list.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nickname', label: '昵称' },
    { key: 'phone', label: '手机号' },
    { key: 'realName', label: '真实姓名' },
  ]

  exportToCSV(list.value, columns, '用户列表')
}

// 获取角色标签类型
type RoleTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
function getRoleTagType(code: string): RoleTagType {
  const typeMap: Record<string, RoleTagType> = {
    normal: 'info',
    plus: 'warning',
    hosting_own: 'success',
    hosting_purchase: 'primary',
    hosting_crowdfunding: 'danger',
  }
  return typeMap[code] || 'info'
}

// 页面初始化
onMounted(() => {
  loadRoles()
  loadUserList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-detail {
    .nickname {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .phone {
      font-size: 12px;
      color: #909399;
    }
  }
}

.roles-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
