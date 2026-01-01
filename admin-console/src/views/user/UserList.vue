<template>
  <div class="user-list-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <UserListTable
      :data="list"
      :loading="loading"
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      @manage-tags="handleManageTags"
      @edit="handleEdit"
      @delete="handleDelete"
      @create="handleCreate"
      @batch-delete="handleBatchDelete"
      @import="handleOpenImport"
    />

    <!-- 用户表单对话框 -->
    <UserFormDialog
      v-model="formDialog.visible"
      :title="dialogTitle"
      :form-data="formData"
      :loading="submitLoading"
      :is-edit="isEdit"
      @submit="handleSubmit"
    />

    <!-- 标签管理对话框 -->
    <UserTagDialog
      v-model="tagDialog.visible"
      :user="tagDialog.user"
      :available-tags="availableTags"
      :loading="tagsLoading"
      @add-tag="handleAddTag"
      @remove-tag="handleRemoveTag"
    />

    <!-- 导入对话框 -->
    <UserImportDialog
      v-model="importDialog.visible"
      :loading="uploadLoading"
      @upload="handleFileUpload"
      @download-template="handleDownloadTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import SearchForm from '@/components/common/SearchForm.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import UserListTable from './components/UserListTable.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import UserTagDialog from './components/UserTagDialog.vue'
import UserImportDialog from './components/UserImportDialog.vue'
import { useUserList } from './composables/useUserList'
import { useUserForm } from './composables/useUserForm'
import { useUserTags } from './composables/useUserTags'
import { useUserImport } from './composables/useUserImport'

// 列表逻辑
const {
  searchForm,
  list,
  loading,
  pagination,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleDelete,
  handleBatchDelete,
  refresh,
} = useUserList()

// 表单逻辑
const {
  formDialog,
  formData,
  submitLoading,
  isEdit,
  dialogTitle,
  handleCreate,
  handleEdit,
  handleSubmit,
} = useUserForm(refresh)

// 标签逻辑
const {
  tagDialog,
  availableTags,
  tagsLoading,
  handleManageTags,
  handleAddTag,
  handleRemoveTag,
} = useUserTags(refresh)

// 导入逻辑
const {
  importDialog,
  uploadLoading,
  handleOpenImport,
  handleFileUpload,
  handleDownloadTemplate,
} = useUserImport(refresh)

// 搜索表单字段配置
const searchFields: SearchField[] = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '正常', value: 'active' },
      { label: '未激活', value: 'inactive' },
      { label: '已封禁', value: 'banned' },
    ],
  },
  {
    prop: 'userType',
    label: '用户类型',
    type: 'select',
    placeholder: '请选择用户类型',
    options: [
      { label: '全部', value: '' },
      { label: '普通用户', value: 'customer' },
      { label: '企业用户', value: 'enterprise' },
    ],
  },
]
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}
</style>
