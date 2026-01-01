<template>
  <div class="national-holiday-list">
    <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
      <template #title>
        <div style="font-size: 13px">法定节假日价格调整优先级固定为 90，高于所有自定义时间规则</div>
      </template>
    </el-alert>

    <!-- 同步状态卡片 -->
    <el-card class="sync-status-card" shadow="never" style="margin-bottom: 16px">
      <template #header>
        <div class="card-header">
          <span style="font-weight: 600">节假日自动同步</span>
          <el-button
            type="primary"
            size="small"
            :loading="syncLoading"
            :disabled="syncLoading"
            @click="handleManualSync"
          >
            {{ syncLoading ? '同步中...' : '立即同步' }}
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">最后同步时间</div>
            <div class="status-value">{{ lastSyncTime || '从未同步' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">已获取年份范围</div>
            <div class="status-value">{{ syncedYearsRange }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">已获取节假日总数</div>
            <div class="status-value">{{ totalHolidaysCount }}个</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">下次自动同步时间</div>
            <div class="status-value">{{ nextSyncTime }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 同步进度 -->
      <el-progress
        v-if="syncLoading"
        :percentage="syncProgress"
        :status="syncProgress === 100 ? 'success' : undefined"
        style="margin-top: 16px"
      >
        <template #default="{ percentage }">
          <span style="font-size: 12px">{{ syncProgressMessage }} ({{ percentage }}%)</span>
        </template>
      </el-progress>
    </el-card>

    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="holidayList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :toolbar-buttons="toolbarButtons"
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #adjustmentType="{ row }">
        <el-tag :type="row.adjustmentType === 'percentage' ? 'success' : 'primary'" size="small">
          {{ row.adjustmentType === 'percentage' ? '百分比' : '固定金额' }}
        </el-tag>
      </template>
      <template #adjustmentValue="{ row }">
        <span
          :style="{ color: row.adjustmentValue > 0 ? '#f56c6c' : '#67c23a', fontWeight: 'bold' }"
        >
          {{ row.adjustmentValue > 0 ? '+' : '' }}{{ row.adjustmentValue
          }}{{ row.adjustmentType === 'percentage' ? '%' : '元' }}
        </span>
      </template>
      <template #dateRange="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.startDate }}</div>
          <div>{{ row.endDate }}</div>
        </div>
      </template>
    </DataTable>

    <!-- 创建/编辑对话框 -->
    <FormDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :fields="formFields"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'
import type { FormField } from '@/components/common/FormDialog.vue'
import {
  syncNationalHolidays,
  getLastSyncTime,
  saveLastSyncTime,
  saveSyncLog,
  formatNextSyncTime,
} from '@/services/holidaySyncService'
import { calculateSyncYears } from '@/utils/timorApi'
import { getNationalHolidayList } from '@/api/timeFactor'

// 开发环境下加载调试工具
if (import.meta.env.DEV) {
  import('@/utils/debugTimorApi')
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  year: new Date().getFullYear(),
})

// 搜索字段配置
const searchFields = computed<SearchField[]>(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '节假日名称',
    width: '200px',
  },
  {
    prop: 'year',
    label: '年份',
    type: 'select',
    placeholder: '请选择年份',
    width: '150px',
    options: [
      { label: '2024年', value: 2024 },
      { label: '2025年', value: 2025 },
      { label: '2026年', value: 2026 },
    ],
  },
])

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '节假日名称', minWidth: 150 },
  { prop: 'dateRange', label: '日期范围', width: 180, slot: 'dateRange' },
  { prop: 'adjustmentType', label: '调整类型', width: 120, slot: 'adjustmentType' },
  { prop: 'adjustmentValue', label: '调整值', width: 120, slot: 'adjustmentValue' },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'description', label: '说明', minWidth: 200 },
]

// 工具栏按钮配置
const toolbarButtons: ToolbarButton[] = [
  {
    label: '新增节假日',
    type: 'primary',
    icon: Plus,
    onClick: () => handleCreate(),
  },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '编辑',
    type: 'primary',
    onClick: (row: any) => handleEdit(row),
  },
  {
    label: '删除',
    type: 'danger',
    onClick: (row: any) => handleDelete(row),
  },
]

// 节假日列表数据
const holidayList = ref([])

const loading = ref(false)

// 同步状态
const syncLoading = ref(false)
const syncProgress = ref(0)
const syncProgressMessage = ref('')
const lastSyncTime = ref<string | null>(null)
const nextSyncTime = ref('')
const syncedYearsRange = ref('')
const totalHolidaysCount = ref(0)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: holidayList.value.length,
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

// 表单数据
const formData = reactive({
  name: '',
  startDate: '',
  endDate: '',
  adjustmentType: 'percentage',
  adjustmentValue: 0,
  description: '',
})

// 表单字段配置
const formFields = computed<FormField[]>(() => [
  {
    prop: 'name',
    label: '节假日名称',
    type: 'input',
    placeholder: '请输入节假日名称',
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'startDate',
        label: '开始日期',
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        span: 12,
      },
      {
        prop: 'endDate',
        label: '结束日期',
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        span: 12,
      },
    ],
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'adjustmentType',
        label: '调整类型',
        type: 'select',
        options: [
          { label: '百分比', value: 'percentage' },
          { label: '固定金额', value: 'fixed' },
        ],
        span: 12,
      },
      {
        prop: 'adjustmentValue',
        label: '调整值',
        type: 'number',
        span: 12,
        tip: '正数表示涨价，负数表示降价',
      },
    ],
  },
  {
    prop: 'description',
    label: '说明',
    type: 'textarea',
    rows: 3,
    placeholder: '请输入节假日说明',
    maxlength: 200,
  },
])

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入节假日名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  adjustmentType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  adjustmentValue: [{ required: true, message: '请输入调整值', trigger: 'blur' }],
}

// 加载节假日列表
const loadHolidayList = async () => {
  loading.value = true
  try {
    const response = await getNationalHolidayList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      type: 'national',
      keyword: searchForm.keyword,
      year: searchForm.year,
    })

    holidayList.value = response.list
    pagination.total = response.total

    // 更新统计信息
    updateSyncStatus()
  } catch (error) {
    console.error('加载节假日列表失败:', error)
    ElMessage.error('加载节假日列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadHolidayList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.year = new Date().getFullYear()
  pagination.page = 1
  loadHolidayList()
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.startDate = ''
  formData.endDate = ''
  formData.adjustmentType = 'percentage'
  formData.adjustmentValue = 0
  formData.description = ''
}

// 创建
const handleCreate = () => {
  resetForm()
  isEdit.value = false
  currentId.value = null
  dialogTitle.value = '新增法定节假日'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  resetForm()
  isEdit.value = true
  currentId.value = row.id
  dialogTitle.value = '编辑法定节假日'

  formData.name = row.name
  formData.startDate = row.startDate
  formData.endDate = row.endDate
  formData.adjustmentType = row.adjustmentType
  formData.adjustmentValue = row.adjustmentValue
  formData.description = row.description

  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除法定节假日"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    ElMessage.success('删除成功')
    // TODO: 调用删除API
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async (_data: any) => {
  submitLoading.value = true
  try {
    if (isEdit.value) {
      ElMessage.success('编辑成功')
    } else {
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    // TODO: 重新加载数据
  } catch (error) {
    ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadHolidayList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadHolidayList()
}

// 手动同步节假日
const handleManualSync = async () => {
  try {
    await ElMessageBox.confirm('确认同步当前日期向后1年的法定节假日数据？', '同步确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    syncLoading.value = true
    syncProgress.value = 0
    syncProgressMessage.value = '准备同步...'

    const result = await syncNationalHolidays({
      defaultAdjustmentValue: 30,
      onProgress: progress => {
        syncProgress.value = Math.round((progress.current / progress.total) * 100)
        syncProgressMessage.value = progress.message
      },
    })

    if (result.success) {
      // 保存同步时间
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      saveLastSyncTime(now)
      lastSyncTime.value = now

      // 保存同步日志
      if (result.syncLog) {
        saveSyncLog(result.syncLog)
      }

      // 更新统计信息
      updateSyncStatus()

      // 重新加载节假日列表
      await loadHolidayList()

      // 显示同步结果
      ElMessageBox.alert(
        `<div style="line-height: 1.8">
          <p><strong>同步年份：</strong>${result.syncedYears.join('、')}</p>
          <p><strong>获取节假日：</strong>${result.totalHolidays}个</p>
          <p><strong>新增：</strong>${result.newCount}个</p>
          <p><strong>更新：</strong>${result.updatedCount}个</p>
          <p><strong>跳过：</strong>${result.skippedCount}个</p>
          ${result.errors.length > 0 ? `<p style="color: #f56c6c"><strong>失败：</strong>${result.errors.length}个年份</p>` : ''}
        </div>`,
        '同步完成',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
        }
      )
    } else {
      ElMessage.error(result.message || '同步失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步失败:', error)
      ElMessage.error('同步失败，请稍后重试')
    }
  } finally {
    syncLoading.value = false
    syncProgress.value = 0
    syncProgressMessage.value = ''
  }
}

// 更新同步状态信息
const updateSyncStatus = () => {
  // 最后同步时间
  lastSyncTime.value = getLastSyncTime()

  // 下次同步时间
  nextSyncTime.value = formatNextSyncTime()

  // 已获取年份范围
  const years = calculateSyncYears()
  syncedYearsRange.value =
    years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : `${years[0]}`

  // 已获取节假日总数
  totalHolidaysCount.value = holidayList.value.length
}

// 组件挂载时初始化
onMounted(() => {
  updateSyncStatus()
  loadHolidayList()
})
</script>

<style scoped lang="scss">
.national-holiday-list {
  .sync-status-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
      background-color: #f5f7fa;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-item {
      text-align: center;
      padding: 8px 0;

      .status-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .status-value {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
