<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ecf5ff">
              <el-icon :size="32" color="#409eff"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总公告数</div>
              <div class="stat-value">{{ stats.totalCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已发布</div>
              <div class="stat-value">{{ stats.publishedCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fdf6ec">
              <el-icon :size="32" color="#e6a23c"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">待发布</div>
              <div class="stat-value">{{ stats.draftCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fef0f0">
              <el-icon :size="32" color="#f56c6c"><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总阅读量</div>
              <div class="stat-value">{{ stats.totalViews }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="table-toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增公告
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <DataTable
      :data="announcementList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 'published' ? 'success' : 'warning'" size="small">
          {{ row.status === 'published' ? '已发布' : '待发布' }}
        </el-tag>
      </template>
      <template #priority="{ row }">
        <el-tag :type="getPriorityTag(row.priority)" size="small">
          {{ getPriorityLabel(row.priority) }}
        </el-tag>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  CircleCheck,
  Clock,
  View,
  Plus,
  Download,
} from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { TableAction } from '@/components/common/DataTable.vue'

// 公告数据类型定义
interface Announcement {
  id: number
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  status: 'published' | 'draft'
  publishTime: string
  views: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalCount: number
  publishedCount: number
  draftCount: number
  totalViews: number
}

// 状态选项
const STATUS_OPTIONS = [
  { label: '已发布', value: 'published' },
  { label: '待发布', value: 'draft' },
]

// 优先级选项
const PRIORITY_OPTIONS = [
  { label: '高优先级', value: 'high' },
  { label: '中优先级', value: 'medium' },
  { label: '低优先级', value: 'low' },
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  priority: '',
})

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '公告标题',
    width: '240px',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    options: STATUS_OPTIONS,
    width: '150px',
  },
  {
    prop: 'priority',
    label: '优先级',
    type: 'select',
    placeholder: '全部优先级',
    options: PRIORITY_OPTIONS,
    width: '150px',
  },
]) as any

// 表格列配置
const tableColumns = computed(() => [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '公告标题', width: 250 },
  { prop: 'priority', label: '优先级', width: 120, slot: true },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'publishTime', label: '发布时间', width: 160 },
  { prop: 'views', label: '阅读量', width: 100 },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]) as any

// 表格操作配置
const tableActions = computed<TableAction[]>(() => [
  {
    label: '编辑',
    type: 'primary',
    onClick: handleEdit,
  },
  {
    label: '发布',
    type: 'success',
    onClick: handlePublish,
    show: (row: Announcement) => row.status === 'draft',
  },
  {
    label: '下线',
    type: 'warning',
    onClick: handleUnpublish,
    show: (row: Announcement) => row.status === 'published',
  },
  {
    label: '删除',
    type: 'danger',
    onClick: handleDelete,
  },
])

// 数据状态
const announcementList = ref<Announcement[]>([])
const loading = ref(false)
const stats = ref<Stats>({
  totalCount: 0,
  publishedCount: 0,
  draftCount: 0,
  totalViews: 0,
})

// 分页
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
})

// Mock 数据生成
const generateMockData = (): Announcement[] => {
  const data: Announcement[] = []
  const statuses: Array<'published' | 'draft'> = ['published', 'draft']
  const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']

  for (let i = 1; i <= 30; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    data.push({
      id: i,
      title: `叨叨房车公告 ${i} - 重要通知`,
      content: `这是公告 ${i} 的详细内容...`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status,
      publishTime: status === 'published'
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
        : '-',
      views: status === 'published' ? Math.floor(Math.random() * 5000) : 0,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
  }
  return data
}

const mockData = generateMockData()

// 获取统计数据
const fetchStats = () => {
  stats.value = {
    totalCount: mockData.length,
    publishedCount: mockData.filter(item => item.status === 'published').length,
    draftCount: mockData.filter(item => item.status === 'draft').length,
    totalViews: mockData.reduce((sum, item) => sum + item.views, 0),
  }
}

// 获取公告列表
const fetchAnnouncementList = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]

    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.title.includes(searchForm.keyword)
      )
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.priority) {
      filteredData = filteredData.filter(item => item.priority === searchForm.priority)
    }

    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    announcementList.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAnnouncementList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.priority = ''
  pagination.page = 1
  fetchAnnouncementList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchAnnouncementList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchAnnouncementList()
}

// 新增公告
const handleAdd = () => {
  ElMessage.info('新增公告功能开发中')
}

// 编辑公告
const handleEdit = (row: Announcement) => {
  ElMessage.info(`编辑公告: ${row.title}`)
}

// 发布公告
const handlePublish = async (row: Announcement) => {
  try {
    await ElMessageBox.confirm(`确认发布公告"${row.title}"吗？`, '发布确认', {
      type: 'warning',
    })
    row.status = 'published'
    row.publishTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    ElMessage.success('发布成功')
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

// 下线公告
const handleUnpublish = async (row: Announcement) => {
  try {
    await ElMessageBox.confirm(`确认下线公告"${row.title}"吗？`, '下线确认', {
      type: 'warning',
    })
    row.status = 'draft'
    ElMessage.success('下线成功')
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('下线失败')
    }
  }
}

// 删除公告
const handleDelete = async (row: Announcement) => {
  try {
    await ElMessageBox.confirm(`确认删除公告"${row.title}"吗？`, '删除确认', {
      type: 'error',
    })
    ElMessage.success('删除成功')
    fetchAnnouncementList()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 获取优先级标签类型
const getPriorityTag = (priority: string) => {
  const tagMap: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return tagMap[priority] || 'info'
}

// 获取优先级标签文本
const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }
  return labelMap[priority] || priority
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchAnnouncementList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }
}

.table-toolbar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}
</style>
