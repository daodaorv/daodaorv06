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
              <div class="stat-label">总图片数</div>
              <div class="stat-value">{{ stats.totalCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#67c23a"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已分类</div>
              <div class="stat-value">{{ stats.categorizedCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fdf6ec">
              <el-icon :size="32" color="#e6a23c"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">未分类</div>
              <div class="stat-value">{{ stats.uncategorizedCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff">
              <el-icon :size="32" color="#409eff"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总存储</div>
              <div class="stat-value">{{ stats.totalSize }}</div>
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
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>
        上传图片
      </el-button>
      <el-button type="success" :disabled="selectedIds.length === 0" @click="handleBatchCategory">
        <el-icon><FolderOpened /></el-icon>
        批量分类
      </el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 图片网格展示 -->
    <div class="image-grid">
      <el-checkbox-group v-model="selectedIds">
        <div v-for="image in imageList" :key="image.id" class="image-item">
          <el-checkbox :value="image.id" class="image-checkbox" />
          <el-card shadow="hover" class="image-card">
            <el-image
              :src="image.url"
              :preview-src-list="[image.url]"
              fit="cover"
              class="image-preview"
            />
            <div class="image-info">
              <div class="image-name">{{ image.name }}</div>
              <div class="image-meta">
                <el-tag v-if="image.category" type="primary" size="small">
                  {{ image.category }}
                </el-tag>
                <el-tag v-else type="info" size="small">未分类</el-tag>
                <span class="image-size">{{ image.size }}</span>
              </div>
              <div class="image-actions">
                <el-button type="primary" size="small" @click="handleEdit(image)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(image)">
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-checkbox-group>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[12, 24, 48, 96]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture,
  FolderOpened,
  Folder,
  Files,
  Upload,
  Delete,
} from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'

// 图片数据类型定义
interface ImageItem {
  id: number
  name: string
  url: string
  category: string
  size: string
  uploadTime: string
}

interface Stats {
  totalCount: number
  categorizedCount: number
  uncategorizedCount: number
  totalSize: string
}

// 分类选项
const CATEGORY_OPTIONS = [
  { label: 'Banner图片', value: 'banner' },
  { label: '车辆图片', value: 'vehicle' },
  { label: '营地图片', value: 'campsite' },
  { label: '活动图片', value: 'activity' },
  { label: '其他图片', value: 'other' },
]

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
})

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '图片名称',
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
]) as any

// 数据状态
const imageList = ref<ImageItem[]>([])
const selectedIds = ref<number[]>([])
const stats = ref<Stats>({
  totalCount: 0,
  categorizedCount: 0,
  uncategorizedCount: 0,
  totalSize: '0 MB',
})

// 分页
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 12,
})

// Mock 数据生成
const generateMockData = (): ImageItem[] => {
  const data: ImageItem[] = []
  const categories = ['banner', 'vehicle', 'campsite', 'activity', 'other', '']

  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const categoryLabel = category ? CATEGORY_OPTIONS.find(c => c.value === category)?.label || '' : ''
    data.push({
      id: i,
      name: `image_${i}.jpg`,
      url: `/static/场景推荐${(i % 3) + 1}.jpg`,
      category: categoryLabel,
      size: `${Math.floor(Math.random() * 500 + 100)} KB`,
      uploadTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
    })
  }
  return data
}

const mockData = generateMockData()

// 获取统计数据
const fetchStats = () => {
  const categorized = mockData.filter(item => item.category).length
  const totalSizeKB = mockData.reduce((sum, item) => {
    const size = parseInt(item.size)
    return sum + size
  }, 0)

  stats.value = {
    totalCount: mockData.length,
    categorizedCount: categorized,
    uncategorizedCount: mockData.length - categorized,
    totalSize: `${(totalSizeKB / 1024).toFixed(2)} MB`,
  }
}

// 获取图片列表
const fetchImageList = () => {
  let filteredData = [...mockData]

  if (searchForm.keyword) {
    filteredData = filteredData.filter(item =>
      item.name.includes(searchForm.keyword)
    )
  }

  if (searchForm.category) {
    const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === searchForm.category)?.label
    filteredData = filteredData.filter(item => item.category === categoryLabel)
  }

  pagination.total = filteredData.length
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  imageList.value = filteredData.slice(start, end)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchImageList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  pagination.page = 1
  fetchImageList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchImageList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchImageList()
}

// 上传图片
const handleUpload = () => {
  ElMessage.info('上传图片功能开发中')
}

// 编辑图片
const handleEdit = (image: ImageItem) => {
  ElMessage.info(`编辑图片: ${image.name}`)
}

// 删除图片
const handleDelete = async (image: ImageItem) => {
  try {
    await ElMessageBox.confirm(`确认删除图片"${image.name}"吗？`, '删除确认', {
      type: 'error',
    })
    ElMessage.success('删除成功')
    fetchImageList()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量分类
const handleBatchCategory = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要分类的图片')
    return
  }
  ElMessage.info('批量分类功能开发中')
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的图片')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认删除选中的${selectedIds.value.length}张图片吗？`,
      '批量删除确认',
      { type: 'error' }
    )
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchImageList()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchImageList()
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

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  .image-item {
    position: relative;

    .image-checkbox {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 10;
    }

    .image-card {
      height: 100%;

      .image-preview {
        width: 100%;
        height: 180px;
        border-radius: 4px;
      }

      .image-info {
        padding: 10px 0;

        .image-name {
          font-size: 14px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .image-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .image-size {
            font-size: 12px;
            color: #909399;
          }
        }

        .image-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
