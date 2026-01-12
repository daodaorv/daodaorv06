<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ecf5ff">
              <el-icon :size="32" color="#409eff"><Picture /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总Banner数</div>
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
              <div class="stat-label">已启用</div>
              <div class="stat-value">{{ stats.enabledCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fef0f0">
              <el-icon :size="32" color="#f56c6c"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已禁用</div>
              <div class="stat-value">{{ stats.disabledCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fdf6ec">
              <el-icon :size="32" color="#e6a23c"><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总点击量</div>
              <div class="stat-value">{{ stats.totalClicks }}</div>
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
        新增Banner
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <DataTable
      :data="bannerList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #image="{ row }">
        <el-image
          :src="row.imageUrl"
          :preview-src-list="[row.imageUrl]"
          fit="cover"
          style="width: 80px; height: 45px; border-radius: 4px"
        />
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
          {{ row.status === 'enabled' ? '已启用' : '已禁用' }}
        </el-tag>
      </template>
      <template #sort="{ row }">
        <el-tag type="info" size="small">{{ row.sort }}</el-tag>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture,
  CircleCheck,
  CircleClose,
  View,
  Plus,
  Download,
} from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { TableAction } from '@/components/common/DataTable.vue'

// Banner数据类型定义
interface Banner {
  id: number
  title: string
  imageUrl: string
  linkType: 'none' | 'page' | 'url'
  linkValue: string
  sort: number
  status: 'enabled' | 'disabled'
  clicks: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalCount: number
  enabledCount: number
  disabledCount: number
  totalClicks: number
}

// 状态选项
const STATUS_OPTIONS = [
  { label: '已启用', value: 'enabled' },
  { label: '已禁用', value: 'disabled' },
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
})

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: 'Banner标题',
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
]) as any

// 表格列配置
const tableColumns = computed(() => [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'image', label: 'Banner图片', width: 120, slot: true },
  { prop: 'title', label: 'Banner标题', width: 200 },
  { prop: 'sort', label: '排序', width: 100, slot: true },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'clicks', label: '点击量', width: 100 },
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
    label: '启用',
    type: 'success',
    onClick: handleEnable,
    show: (row: Banner) => row.status === 'disabled',
  },
  {
    label: '禁用',
    type: 'warning',
    onClick: handleDisable,
    show: (row: Banner) => row.status === 'enabled',
  },
  {
    label: '删除',
    type: 'danger',
    onClick: handleDelete,
  },
])

// 数据状态
const bannerList = ref<Banner[]>([])
const loading = ref(false)
const stats = ref<Stats>({
  totalCount: 0,
  enabledCount: 0,
  disabledCount: 0,
  totalClicks: 0,
})

// 分页
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
})

// Mock 数据生成
const generateMockData = (): Banner[] => {
  const data: Banner[] = []
  const statuses: Array<'enabled' | 'disabled'> = ['enabled', 'disabled']
  const linkTypes: Array<'none' | 'page' | 'url'> = ['none', 'page', 'url']

  for (let i = 1; i <= 20; i++) {
    data.push({
      id: i,
      title: `Banner ${i} - 叨叨房车优惠活动`,
      imageUrl: `/static/场景推荐${(i % 3) + 1}.jpg`,
      linkType: linkTypes[Math.floor(Math.random() * linkTypes.length)],
      linkValue: i % 2 === 0 ? '/pages/activity/detail' : 'https://example.com',
      sort: i,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      clicks: Math.floor(Math.random() * 10000),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
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
    enabledCount: mockData.filter(item => item.status === 'enabled').length,
    disabledCount: mockData.filter(item => item.status === 'disabled').length,
    totalClicks: mockData.reduce((sum, item) => sum + item.clicks, 0),
  }
}

// 获取Banner列表
const fetchBannerList = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]

    // 关键词筛选
    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.title.includes(searchForm.keyword)
      )
    }

    // 状态筛选
    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    bannerList.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchBannerList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.page = 1
  fetchBannerList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchBannerList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchBannerList()
}

// 新增Banner
const handleAdd = () => {
  ElMessage.info('新增Banner功能开发中')
}

// 编辑Banner
const handleEdit = (row: Banner) => {
  ElMessage.info(`编辑Banner: ${row.title}`)
}

// 启用Banner
const handleEnable = async (row: Banner) => {
  try {
    await ElMessageBox.confirm(`确认启用Banner"${row.title}"吗？`, '启用确认', {
      type: 'warning',
    })
    row.status = 'enabled'
    ElMessage.success('启用成功')
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('启用失败')
    }
  }
}

// 禁用Banner
const handleDisable = async (row: Banner) => {
  try {
    await ElMessageBox.confirm(`确认禁用Banner"${row.title}"吗？`, '禁用确认', {
      type: 'warning',
    })
    row.status = 'disabled'
    ElMessage.success('禁用成功')
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('禁用失败')
    }
  }
}

// 删除Banner
const handleDelete = async (row: Banner) => {
  try {
    await ElMessageBox.confirm(`确认删除Banner"${row.title}"吗？`, '删除确认', {
      type: 'error',
    })
    ElMessage.success('删除成功')
    fetchBannerList()
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
  fetchBannerList()
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

