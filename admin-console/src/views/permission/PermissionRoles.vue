<template>
  <div class="permission-roles-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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
        新增角色
      </el-button>
      <el-button :icon="Download">导出</el-button>
    </el-card>

    <!-- 角色列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="roleList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column label="角色类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTypeTag(row.type)">
              {{ getRoleTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="角色描述" show-overflow-tooltip />
        <el-table-column label="数据权限范围" width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getDataScopeLabel(row.dataScope) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handlePermission(row)">
              配置权限
            </el-button>
            <el-button link type="primary" size="small" @click="handleViewUsers(row)">
              查看用户
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入角色编码（英文）"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="角色类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择角色类型" style="width: 100%">
            <el-option label="平台管理员" value="platform_admin" />
            <el-option label="区域经理" value="regional_manager" />
            <el-option label="门店经理" value="store_manager" />
            <el-option label="门店员工" value="store_staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限范围" prop="dataScope">
          <el-select v-model="form.dataScope" placeholder="请选择数据权限范围" style="width: 100%">
            <el-option label="全部数据" value="all" />
            <el-option label="所辖区域数据" value="region" />
            <el-option label="本门店数据" value="store" />
            <el-option label="仅本人数据" value="self" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="角色状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 配置权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="配置角色权限"
      width="800px"
    >
      <div class="permission-config">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="菜单权限" name="menu">
            <el-tree
              ref="menuTreeRef"
              :data="menuTreeData"
              :props="{ label: 'title', children: 'children' }"
              show-checkbox
              node-key="path"
              :default-checked-keys="checkedMenuKeys"
            />
          </el-tab-pane>
          <el-tab-pane label="功能权限" name="function">
            <el-checkbox-group v-model="checkedPermissions">
              <div v-for="group in permissionGroups" :key="group.name" class="permission-group">
                <div class="group-title">{{ group.name }}</div>
                <el-checkbox
                  v-for="permission in group.permissions"
                  :key="permission.code"
                  :label="permission.code"
                >
                  {{ permission.name }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看用户对话框 -->
    <el-dialog
      v-model="usersDialogVisible"
      title="角色用户列表"
      width="800px"
    >
      <el-table :data="roleUsers" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="真实姓名" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="department" label="部门" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
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
} from '@element-plus/icons-vue'
import { roleApi, type Role } from '@/api/role'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
})

// 角色列表
const roleList = ref<Role[]>([])
const loading = ref(false)

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    const response = await roleApi.getRoleList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status as any,
    })
    roleList.value = response.data.list
    pagination.total = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 4,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  code: '',
  type: 'store_staff' as Role['type'],
  description: '',
  dataScope: 'self' as Role['dataScope'],
  status: 'active' as Role['status'],
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '角色编码只能包含小写字母和下划线', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' },
  ],
  dataScope: [
    { required: true, message: '请选择数据权限范围', trigger: 'change' },
  ],
}

// 权限配置对话框
const permissionDialogVisible = ref(false)
const currentRole = ref<Role | null>(null)
const activeTab = ref('menu')
const menuTreeRef = ref()
const checkedMenuKeys = ref<string[]>([])
const checkedPermissions = ref<string[]>([])

// 菜单树数据
const menuTreeData = ref([
  {
    path: '/dashboard',
    title: '工作台',
    children: [],
  },
  {
    path: '/users',
    title: '用户管理',
    children: [
      { path: '/users/list', title: '用户列表' },
      { path: '/users/tags', title: '标签管理' },
      { path: '/users/risk', title: '风控管理' },
      { path: '/users/blacklist', title: '黑名单' },
    ],
  },
  {
    path: '/vehicles',
    title: '车辆管理',
    children: [
      { path: '/vehicles/models', title: '车型库管理' },
      { path: '/vehicles/list', title: '车辆列表' },
      { path: '/vehicles/status', title: '车辆状态' },
    ],
  },
])

// 权限分组
const permissionGroups = ref([
  {
    name: '用户管理',
    permissions: [
      { code: 'user:view', name: '查看用户' },
      { code: 'user:create', name: '创建用户' },
      { code: 'user:edit', name: '编辑用户' },
      { code: 'user:delete', name: '删除用户' },
    ],
  },
  {
    name: '车辆管理',
    permissions: [
      { code: 'vehicle:view', name: '查看车辆' },
      { code: 'vehicle:create', name: '创建车辆' },
      { code: 'vehicle:edit', name: '编辑车辆' },
      { code: 'vehicle:delete', name: '删除车辆' },
    ],
  },
])

// 角色用户列表
const usersDialogVisible = ref(false)
const roleUsers = ref([])

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRoleList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.page = 1
  loadRoleList()
}

// 新增角色
const handleCreate = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: Role) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.type = row.type
  form.description = row.description
  form.dataScope = row.dataScope
  form.status = row.status
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await roleApi.deleteRole(row.id)
    ElMessage.success('删除成功')
    loadRoleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row: Role) => {
  try {
    await roleApi.updateRole({
      id: row.id,
      status: row.status,
    })
    ElMessage.success(`角色状态已${row.status === 'active' ? '启用' : '禁用'}`)
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    // 恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 配置权限
const handlePermission = (row: Role) => {
  currentRole.value = row
  // Mock数据：根据角色类型设置默认权限
  if (row.type === 'platform_admin') {
    checkedMenuKeys.value = ['/dashboard', '/users', '/users/list', '/users/tags']
    checkedPermissions.value = ['user:view', 'user:create', 'user:edit', 'user:delete']
  } else {
    checkedMenuKeys.value = ['/dashboard']
    checkedPermissions.value = ['user:view']
  }
  permissionDialogVisible.value = true
}

// 查看用户
const handleViewUsers = async (row: Role) => {
  currentRole.value = row
  try {
    const response = await roleApi.getRoleUsers(row.id)
    roleUsers.value = response.data.list as any
    usersDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
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
        await roleApi.updateRole({
          id: form.id,
          name: form.name,
          type: form.type,
          description: form.description,
          dataScope: form.dataScope,
          status: form.status,
        })
        ElMessage.success('更新成功')
      } else {
        await roleApi.createRole({
          name: form.name,
          code: form.code,
          type: form.type,
          description: form.description,
          dataScope: form.dataScope,
          status: form.status,
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadRoleList()
    } catch (error: any) {
      ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
    } finally {
      submitLoading.value = false
    }
  })
}

// 保存权限配置
const handlePermissionSubmit = async () => {
  if (!currentRole.value) return

  try {
    const checkedNodes = menuTreeRef.value.getCheckedKeys()
    await roleApi.configRolePermissions({
      roleId: currentRole.value.id,
      menuPermissions: checkedNodes,
      functionPermissions: checkedPermissions.value,
    })
    ElMessage.success('权限配置保存成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '权限配置失败')
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.id = 0
  form.name = ''
  form.code = ''
  form.type = 'store_staff'
  form.description = ''
  form.dataScope = 'self'
  form.status = 'active'
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadRoleList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRoleList()
}

// 获取角色类型标签
const getRoleTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    platform_admin: 'danger',
    regional_manager: 'warning',
    store_manager: 'success',
    store_staff: 'info',
  }
  return typeMap[type] || 'info'
}

// 获取角色类型标签文本
const getRoleTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    platform_admin: '平台管理员',
    regional_manager: '区域经理',
    store_manager: '门店经理',
    store_staff: '门店员工',
  }
  return labelMap[type] || type
}

// 获取数据权限范围标签
const getDataScopeLabel = (scope: string) => {
  const labelMap: Record<string, string> = {
    all: '全部数据',
    region: '所辖区域',
    store: '本门店',
    self: '仅本人',
  }
  return labelMap[scope] || scope
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 页面加载
onMounted(() => {
  loadRoleList()
})
</script>

<style scoped lang="scss">
.permission-roles-container {
  padding: 20px;

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

  .permission-config {
    .permission-group {
      margin-bottom: 20px;

      .group-title {
        font-weight: 600;
        margin-bottom: 10px;
        color: #303133;
      }

      .el-checkbox {
        display: block;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
