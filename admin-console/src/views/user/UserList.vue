<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <PageHeader title="用户列表" description="管理小程序端用户信息、角色分配和状态" />

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
      :actions-width="280"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 用户信息列 -->
      <template #userInfo="{ row }">
        <div class="user-info">
          <el-avatar :src="row.avatarUrl" :size="40">
            {{ row.nickname?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-detail">
            <div class="nickname">{{ row.nickname }}</div>
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
        <el-descriptions-item label="昵称">
          {{ currentUser.nickname }}
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
          <strong>用户：</strong>{{ currentUser?.nickname }} ({{ currentUser?.phone }})
        </div>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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

// Composables
const { formatDateTime } = useDateFormat()
const { handleApiError } = useErrorHandler()

// 用户数据类型
interface UserRole {
  id: number
  name: string
  code: string
}

interface User {
  id: number
  nickname: string
  phone: string
  realName?: string
  avatarUrl: string
  roles: UserRole[]
  status: 'active' | 'banned'
  createdAt: string
  lastLoginAt: string
}

// Mock 数据
const list = ref<User[]>([
  {
    id: 1,
    nickname: '张三',
    phone: '13800138000',
    realName: '张三',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    roles: [{ id: 1, name: '普通注册用户', code: 'normal' }],
    status: 'active',
    createdAt: '2024-01-15T10:00:00.000Z',
    lastLoginAt: '2024-12-28T15:30:00.000Z',
  },
  {
    id: 2,
    nickname: '李四',
    phone: '13800138001',
    realName: '李四',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    roles: [
      { id: 1, name: '普通注册用户', code: 'normal' },
      { id: 2, name: 'PLUS用户', code: 'plus' },
    ],
    status: 'active',
    createdAt: '2024-02-20T14:00:00.000Z',
    lastLoginAt: '2024-12-29T09:15:00.000Z',
  },
  {
    id: 3,
    nickname: '王五',
    phone: '13800138002',
    realName: '王五',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    roles: [
      { id: 1, name: '普通注册用户', code: 'normal' },
      { id: 3, name: '自有车托管用户', code: 'hosting_own' },
    ],
    status: 'active',
    createdAt: '2024-03-10T09:00:00.000Z',
    lastLoginAt: '2024-12-27T18:45:00.000Z',
  },
])

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
const toolbarButtons: ToolbarButton[] = [
  {
    label: '导出',
    icon: Download,
    onClick: handleExport,
  },
]

// 表格操作列配置
const tableActions: TableAction[] = []

// 对话框
const detailDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const roleSubmitLoading = ref(false)
const currentUser = ref<User | null>(null)

const roleFormData = reactive({
  roleIds: [] as number[],
})

// 可用角色列表
const availableRoles = ref([
  { id: 1, name: '普通注册用户', code: 'normal' },
  { id: 2, name: 'PLUS用户', code: 'plus' },
  { id: 3, name: '自有车托管用户', code: 'hosting_own' },
  { id: 4, name: '购车托管用户', code: 'hosting_purchase' },
  { id: 5, name: '众筹托管用户', code: 'hosting_crowdfunding' },
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
function handleSearch() {
  pagination.page = 1
  ElMessage.success('搜索功能开发中...')
}

// 重置
function handleReset() {
  searchForm.keyword = ''
  searchForm.roleCode = ''
  searchForm.status = ''
  pagination.page = 1
}

// 查看详情
function handleView(row: User) {
  currentUser.value = row
  detailDialogVisible.value = true
}

// 分配角色
function handleAssignRole(row: User) {
  currentUser.value = row
  roleFormData.roleIds = row.roles.map(r => r.id)
  roleDialogVisible.value = true
}

// 提交角色分配
async function handleRoleSubmit() {
  roleSubmitLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (currentUser.value) {
      currentUser.value.roles = availableRoles.value.filter(r =>
        roleFormData.roleIds.includes(r.id)
      )
    }

    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error) {
    handleApiError(error, '角色分配失败')
  } finally {
    roleSubmitLoading.value = false
  }
}

// 切换用户状态
async function handleToggleStatus(row: User) {
  const action = row.status === 'active' ? '封禁' : '解封'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.nickname}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    row.status = row.status === 'active' ? 'banned' : 'active'
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, `${action}失败`)
    }
  }
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
