<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ecf5ff">
              <el-icon :size="32" color="#409eff"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总文章数</div>
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
        新增文章
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <DataTable
      :data="articleList"
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
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  CircleCheck,
  Clock,
  View,
  Plus,
  Download,
} from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { TableAction } from '@/components/common/DataTable.vue'

// 文章数据类型定义
interface HelpArticle {
  id: number
  title: string
  categoryName: string
  content: string
  status: 'published' | 'draft'
  views: number
  publishTime: string
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

// 分类选项
const CATEGORY_OPTIONS = [
  { label: '新手入门', value: '新手入门' },
  { label: '预订指南', value: '预订指南' },
  { label: '支付问题', value: '支付问题' },
  { label: '账户管理', value: '账户管理' },
  { label: '车辆使用', value: '车辆使用' },
  { label: '保险理赔', value: '保险理赔' },
  { label: '优惠活动', value: '优惠活动' },
  { label: '常见问题', value: '常见问题' },
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
})

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '文章标题',
    width: '240px',
  },
  {
    prop: 'category',
    label: '分类',
    type: 'select',
    placeholder: '全部分类',
    options: CATEGORY_OPTIONS,
    width: '150px',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    options: STATUS_OPTIONS,
    width: '150px',
  },
]) as any

// 表格列配置
const tableColumns = computed(() => [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'title', label: '文章标题', width: 250 },
  { prop: 'categoryName', label: '所属分类', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'views', label: '阅读量', width: 100 },
  { prop: 'publishTime', label: '发布时间', width: 160 },
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
    show: (row: HelpArticle) => row.status === 'draft',
  },
  {
    label: '下线',
    type: 'warning',
    onClick: handleUnpublish,
    show: (row: HelpArticle) => row.status === 'published',
  },
  {
    label: '删除',
    type: 'danger',
    onClick: handleDelete,
  },
])

// 数据状态
const articleList = ref<HelpArticle[]>([])
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
const generateMockData = (): HelpArticle[] => {
  const data: HelpArticle[] = []
  const statuses: Array<'published' | 'draft'> = ['published', 'draft']
  const categories = ['新手入门', '预订指南', '支付问题', '账户管理', '车辆使用', '保险理赔', '优惠活动', '常见问题']
  const titles = [
    '如何注册账号',
    '如何预订房车',
    '支付方式有哪些',
    '如何修改个人信息',
    '房车使用注意事项',
    '保险如何购买',
    '优惠券如何使用',
    '忘记密码怎么办',
    '如何取消订单',
    '退款流程说明',
    '如何联系客服',
    '房车保养须知',
    '行驶证件要求',
    '违章处理流程',
    '保险理赔指南',
  ]

  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    data.push({
      id: i,
      title: titles[i % titles.length] + ` ${i}`,
      categoryName: categories[Math.floor(Math.random() * categories.length)],
      content: `这是文章 ${i} 的详细内容...`,
      status,
      views: status === 'published' ? Math.floor(Math.random() * 5000) : 0,
      publishTime: status === 'published'
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
        : '-',
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

// 获取文章列表
const fetchArticleList = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]

    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.title.includes(searchForm.keyword)
      )
    }

    if (searchForm.category) {
      filteredData = filteredData.filter(item => item.categoryName === searchForm.category)
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    articleList.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchArticleList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.status = ''
  pagination.page = 1
  fetchArticleList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchArticleList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchArticleList()
}

// 新增文章
const handleAdd = () => {
  ElMessage.info('新增文章功能开发中')
}

// 编辑文章
const handleEdit = (row: HelpArticle) => {
  ElMessage.info(`编辑文章: ${row.title}`)
}

// 发布文章
const handlePublish = async (row: HelpArticle) => {
  try {
    await ElMessageBox.confirm(`确认发布文章"${row.title}"吗？`, '发布确认', {
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

// 下线文章
const handleUnpublish = async (row: HelpArticle) => {
  try {
    await ElMessageBox.confirm(`确认下线文章"${row.title}"吗？`, '下线确认', {
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

// 删除文章
const handleDelete = async (row: HelpArticle) => {
  try {
    await ElMessageBox.confirm(`确认删除文章"${row.title}"吗？`, '删除确认', {
      type: 'error',
    })
    ElMessage.success('删除成功')
    fetchArticleList()
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

// 初始化
onMounted(() => {
  fetchStats()
  fetchArticleList()
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
