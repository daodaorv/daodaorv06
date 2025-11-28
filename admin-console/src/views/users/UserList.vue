<template>
  <div class="user-list">
    <!-- 搜索工具栏 -->
    <div class="page-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="普通用户" value="customer" />
            <el-option label="移动端管理" value="mobile_admin" />
            <el-option label="PC端管理" value="pc_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="page-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>

      <!-- 用户列表表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="userType" label="用户类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 'customer'" type="info">普通用户</el-tag>
            <el-tag v-else-if="row.userType === 'mobile_admin'" type="warning">移动端管理</el-tag>
            <el-tag v-else-if="row.userType === 'pc_admin'" type="success">PC端管理</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="warning">禁用</el-tag>
            <el-tag v-else-if="row.status === 'banned'" type="danger">封禁</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="160">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              link
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              <el-icon><Switch /></el-icon>
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType" placeholder="请选择用户类型">
            <el-option label="普通用户" value="customer" />
            <el-option label="移动端管理" value="mobile_admin" />
            <el-option label="PC端管理" value="pc_admin" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { userApi, type UserInfo, type CreateUserParams, type UpdateUserParams } from '@/api/user'

// 搜索表单
const searchForm = reactive({
  phone: '',
  username: '',
  userType: '',
  status: '',
})

// 用户列表
const userList = ref<UserInfo[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)
const submitLoading = ref(false)
const userFormRef = ref<FormInstance>()

// 用户表单
const userForm = reactive<CreateUserParams & UpdateUserParams>({
  id: 0,
  username: '',
  phone: '',
  password: '',
  email: '',
  realName: '',
  userType: 'customer',
  status: 'active',
})

// 表单验证规则
const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度为2-50个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' },
  ],
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const { data } = await userApi.getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    userList.value = data.list
    pagination.total = data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.phone = ''
  searchForm.username = ''
  searchForm.userType = ''
  searchForm.status = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = () => {
  getUserList()
}

const handlePageChange = () => {
  getUserList()
}

// 添加用户
const handleAdd = () => {
  dialogTitle.value = '添加用户'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  userForm.id = row.id
  userForm.username = row.username
  userForm.phone = row.phone
  userForm.email = row.email || ''
  userForm.realName = row.realName || ''
  userForm.userType = row.userType
  userForm.status = row.status
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await userApi.updateUser({
        id: userForm.id,
        username: userForm.username,
        email: userForm.email,
        realName: userForm.realName,
        userType: userForm.userType,
        status: userForm.status,
      })
      ElMessage.success('更新用户成功')
    } else {
      await userApi.createUser({
        username: userForm.username,
        phone: userForm.phone,
        password: userForm.password,
        email: userForm.email,
        realName: userForm.realName,
        userType: userForm.userType,
      })
      ElMessage.success('添加用户成功')
    }

    dialogVisible.value = false
    getUserList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
  userForm.id = 0
  userForm.username = ''
  userForm.phone = ''
  userForm.password = ''
  userForm.email = ''
  userForm.realName = ''
  userForm.userType = 'customer'
  userForm.status = 'active'
}

// 切换用户状态
const handleToggleStatus = async (row: UserInfo) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const statusText = newStatus === 'active' ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${statusText}用户"${row.username}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await userApi.changeUserStatus(row.id, newStatus)
    ElMessage.success(`${statusText}成功`)
    getUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${statusText}失败`)
    }
  }
}

// 删除用户
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.username}"吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 初始化
onMounted(() => {
  getUserList()
})
</script>

<style scoped lang="scss">
.user-list {
  .search-form {
    margin-bottom: 0;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    .el-button {
      margin-left: 0;
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
