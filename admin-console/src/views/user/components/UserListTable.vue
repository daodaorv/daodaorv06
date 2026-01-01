<template>
  <DataTable
    :data="data"
    :columns="tableColumns"
    :loading="loading"
    :actions="tableActions"
    :toolbar-buttons="toolbarButtons"
    :pagination="pagination"
    :actions-width="280"
    :show-selection="true"
    @size-change="$emit('size-change', $event)"
    @current-change="$emit('current-change', $event)"
    @selection-change="$emit('selection-change', $event)"
  >
    <template #avatar="{ row }">
      <el-avatar :src="row.avatarUrl" :size="40">
        {{ row.username?.charAt(0) || 'U' }}
      </el-avatar>
    </template>

    <template #tags="{ row }">
      <div class="user-tags">
        <el-tag
          v-for="tag in row.tags"
          :key="tag.id"
          :type="tag.color"
          size="small"
          :effect="tag.name === 'PLUS会员' ? 'dark' : 'light'"
          style="margin-right: 4px"
        >
          <el-icon v-if="tag.name === 'PLUS会员'" style="margin-right: 2px">
            <Star />
          </el-icon>
          {{ tag.name }}
        </el-tag>
        <el-button
          v-if="!row.tags || row.tags.length === 0"
          link
          type="primary"
          size="small"
          @click="$emit('manage-tags', row)"
        >
          添加标签
        </el-button>
        <el-button v-else link type="primary" size="small" @click="$emit('manage-tags', row)">
          管理
        </el-button>
      </div>
    </template>

    <template #status="{ row }">
      <el-tag :type="getStatusTag(row.status)" size="small">
        {{ getUserStatusLabel(row.status) }}
      </el-tag>
    </template>

    <template #lastLoginAt="{ row }">
      {{ formatDateTime(row.lastLoginAt) }}
    </template>

    <template #createdAt="{ row }">
      {{ formatDateTime(row.createdAt) }}
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'

interface Props {
  data: unknown[]
  loading: boolean
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

defineProps<Props>()

const emit = defineEmits<{
  'size-change': [size: number]
  'current-change': [page: number]
  'selection-change': [selection: unknown[]]
  'manage-tags': [user: any]
  'edit': [user: unknown]
  'delete': [userId: number]
  'create': []
  'batch-delete': []
  'import': []
}>()

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'avatar', label: '头像', width: 80, slot: 'avatar' },
  { prop: 'username', label: '用户名', width: 150 },
  { prop: 'realName', label: '真实姓名', width: 120 },
  { prop: 'phone', label: '手机号', width: 130 },
  { prop: 'email', label: '邮箱', width: 180 },
  { prop: 'tags', label: '标签', width: 200, slot: 'tags' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'lastLoginAt', label: '最后登录', width: 160, slot: 'lastLoginAt' },
  { prop: 'createdAt', label: '创建时间', width: 160, slot: 'createdAt' },
]

// 表格操作按钮
const tableActions: TableAction[] = [
  { label: '编辑', type: 'primary', onClick: (row: any) => emit('edit', row) },
  { label: '删除', type: 'danger', onClick: (row: any) => emit('delete', row.id) },
]

// 工具栏按钮
const toolbarButtons: ToolbarButton[] = [
  { label: '新增用户', type: 'primary', onClick: () => emit('create') },
  { label: '批量删除', type: 'danger', onClick: () => emit('batch-delete') },
  { label: '导入用户', type: 'success', onClick: () => emit('import') },
]

// 获取状态标签类型
const getStatusTag = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    inactive: 'info',
    banned: 'danger',
  }
  return statusMap[status] || 'info'
}

// 获取用户状态标签
const getUserStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    banned: '已封禁',
  }
  return statusMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
