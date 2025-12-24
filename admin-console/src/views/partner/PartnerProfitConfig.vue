<!-- @ts-nocheck -->
<template>
  <div class="partner-profit-config-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <StatsCard
          title="配置总数"
          :value="stats.totalCount"
          icon="Document"
          color="#409eff"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          title="启用配置"
          :value="stats.enabledCount"
          icon="Check"
          color="#67c23a"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          title="全局配置"
          :value="stats.globalCount"
          icon="Setting"
          color="#e6a23c"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          title="自定义配置"
          :value="stats.customCount"
          icon="Edit"
          color="#f56c6c"
        />
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建配置
      </el-button>
    </div>

    <!-- 数据表格 -->
    <DataTable
      :data="configList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #configType="{ row }">
        <el-tag :type="getConfigTypeTag(row.configType)" size="small">
          {{ getConfigTypeLabel(row.configType) }}
        </el-tag>
      </template>
      <template #profitRatio="{ row }">
        <div style="font-size: 12px">
          <div>门店: {{ row.storeProfitRatio }}%</div>
          <div style="color: #409eff">平台: {{ row.platformProfitRatio }}%</div>
        </div>
      </template>
      <template #enabled="{ row }">
        <el-switch
          v-model="row.enabled"
          @change="handleToggleEnabled(row)"
        />
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
      width="800px"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import StatsCard from '@/components/common/StatsCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import { useErrorHandler } from '@/composables'

const { handleApiError } = useErrorHandler()

// 统计数据
const stats = ref({
  totalCount: 0,
  enabledCount: 0,
  globalCount: 0,
  customCount: 0,
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  configType: undefined,
  enabled: undefined,
})

// 配置类型选项
const CONFIG_TYPE_OPTIONS = [
  { label: '全局配置', value: 'global' },
  { label: '门店级配置', value: 'store' },
  { label: '合作商级配置', value: 'partner' },
]

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '配置名称/门店名称/合作商名称',
    width: '250px',
  },
  {
    prop: 'configType',
    label: '配置类型',
    type: 'select',
    placeholder: '全部类型',
    options: CONFIG_TYPE_OPTIONS,
    width: '150px',
  },
  {
    prop: 'enabled',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    options: [
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ],
    width: '150px',
  },
])

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'configType', label: '配置类型', width: 120, slot: true },
  { prop: 'targetName', label: '目标名称', width: 180 },
  { prop: 'profitRatio', label: '分润比例', width: 140, slot: true },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'effectiveDate', label: '生效日期', width: 120 },
  { prop: 'enabled', label: '状态', width: 100, slot: true },
]

// 表格操作配置
const tableActions = [
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

// 数据列表
const configList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)
const currentConfigId = ref<number | null>(null)

// 表单数据
const formData = reactive({
  configName: '',
  configType: 'global',
  targetId: null,
  targetName: '',
  storeProfitRatio: 30,
  platformProfitRatio: 70,
  priority: 1,
  effectiveDate: '',
  expiryDate: '',
  description: '',
  changeDescription: '',
})

// 表单字段配置
const formFields = computed(() => [
  {
    type: 'divider',
    label: '基本信息',
  },
  {
    prop: 'configName',
    label: '配置名称',
    type: 'input',
    placeholder: '请输入配置名称',
  },
  {
    prop: 'description',
    label: '配置说明',
    type: 'textarea',
    rows: 2,
    placeholder: '请输入配置说明',
  },
  {
    type: 'divider',
    label: '配置类型',
  },
  {
    prop: 'configType',
    label: '配置类型',
    type: 'select',
    options: CONFIG_TYPE_OPTIONS,
    placeholder: '请选择配置类型',
  },
  {
    prop: 'targetName',
    label: '目标名称',
    type: 'input',
    placeholder: '全局配置无需填写',
    disabled: formData.configType === 'global',
    tip: '门店级配置填写门店名称，合作商级配置填写合作商名称',
  },
  {
    type: 'divider',
    label: '分润配置',
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'storeProfitRatio',
        label: '门店分润比例',
        type: 'number',
        min: 10,
        max: 50,
        span: 12,
        tip: '单位：%，范围：10%-50%',
      },
      {
        prop: 'platformProfitRatio',
        label: '平台分润比例',
        type: 'number',
        min: 50,
        max: 90,
        span: 12,
        tip: '单位：%，自动计算为 100% - 门店分润比例',
        disabled: true,
        readonly: true,
      },
    ],
  },
  {
    prop: 'priority',
    label: '优先级',
    type: 'number',
    min: 1,
    tip: '数字越大优先级越高',
  },
  {
    type: 'divider',
    label: '生效时间',
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'effectiveDate',
        label: '生效日期',
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        span: 12,
      },
      {
        prop: 'expiryDate',
        label: '失效日期',
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        span: 12,
        tip: '可选，不填则长期有效',
      },
    ],
  },
])

// 表单验证规则
const formRules = {
  configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
  storeProfitRatio: [
    { required: true, message: '请输入门店分润比例', trigger: 'blur' },
    {
      validator: (rule: any, value: number, callback: any) => {
        if (value < 10 || value > 50) {
          callback(new Error('门店分润比例必须在10%-50%之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }],
}

// 监听门店分润比例变化，自动计算平台分润比例
watch(() => formData.storeProfitRatio, (newValue) => {
  formData.platformProfitRatio = 100 - newValue
})

// 监听配置类型变化
watch(() => formData.configType, (newValue) => {
  if (newValue === 'global') {
    formData.targetId = null
    formData.targetName = ''
  }
})

// 加载配置列表
const loadConfigList = async () => {
  loading.value = true
  try {
    // TODO: 调用API接口
    configList.value = []
    pagination.total = 0
  } catch (error) {
    handleApiError(error, '加载配置列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadConfigList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.configType = undefined
  searchForm.enabled = undefined
  pagination.page = 1
  loadConfigList()
}

// 创建配置
const handleCreate = () => {
  isEdit.value = false
  currentConfigId.value = null
  dialogTitle.value = '创建配置'
  // 重置表单
  formData.configName = ''
  formData.configType = 'global'
  formData.targetId = null
  formData.targetName = ''
  formData.storeProfitRatio = 30
  formData.platformProfitRatio = 70
  formData.priority = 1
  formData.effectiveDate = ''
  formData.expiryDate = ''
  formData.description = ''
  formData.changeDescription = ''
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (row: any) => {
  isEdit.value = true
  currentConfigId.value = row.id
  dialogTitle.value = '编辑配置'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async (data: any) => {
  submitLoading.value = true
  try {
    // TODO: 调用API接口
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
    dialogVisible.value = false
    loadConfigList()
  } catch (error) {
    handleApiError(error, isEdit.value ? '编辑失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除配置
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除配置"${row.configName}"吗？`, '删除确认', {
      type: 'warning',
    })
    // TODO: 调用API接口
    ElMessage.success('删除成功')
    loadConfigList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 启用/禁用切换
const handleToggleEnabled = (row: any) => {
  const statusText = row.enabled ? '启用' : '禁用'
  ElMessage.success(`已${statusText}配置: ${row.configName}`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadConfigList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadConfigList()
}

// 获取配置类型标签
const getConfigTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    global: 'success',
    store: 'primary',
    partner: 'warning',
  }
  return tagMap[type] || 'info'
}

// 获取配置类型标签文本
const getConfigTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    global: '全局配置',
    store: '门店级配置',
    partner: '合作商级配置',
  }
  return labelMap[type] || type
}

onMounted(() => {
  loadConfigList()
})
</script>

<style scoped lang="scss">
.partner-profit-config-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}
</style>
