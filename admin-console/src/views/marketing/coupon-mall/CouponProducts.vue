<template>
  <div class="page-container">
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable
      :data="productList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :toolbar-buttons="toolbarButtons"
      :pagination="pagination"
      :actions-width="220"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #product_image="{ row }">
        <el-image
          :src="row.product_image"
          :preview-src-list="[row.product_image]"
          fit="cover"
          style="width: 60px; height: 60px; border-radius: 4px"
        />
      </template>
      <template #display_position="{ row }">
        <el-tag :type="getPositionTag(row.display_position)" size="small">
          {{ getPositionLabel(row.display_position) }}
        </el-tag>
      </template>
      <template #special_tags="{ row }">
        <el-tag
          v-for="(tag, index) in row.special_tags"
          :key="index"
          size="small"
          style="margin-right: 4px"
        >
          {{ tag }}
        </el-tag>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
          {{ row.status === 'active' ? '上架' : '下架' }}
        </el-tag>
      </template>
      <template #coupon_info="{ row }">
        <div style="font-size: 12px">
          <div>{{ row.coupon_name }}</div>
          <div style="color: #f56c6c; font-weight: bold">¥{{ row.coupon_amount }}</div>
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
      width="800px"
      @submit="handleSubmit"
    />

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="优惠券产品详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="currentProduct" :column="2" border>
        <el-descriptions-item label="产品ID">{{ currentProduct.id }}</el-descriptions-item>
        <el-descriptions-item label="产品标题">{{ currentProduct.product_title }}</el-descriptions-item>
        <el-descriptions-item label="关联优惠券ID">{{ currentProduct.coupon_id }}</el-descriptions-item>
        <el-descriptions-item label="优惠券名称">{{ currentProduct.coupon_name }}</el-descriptions-item>
        <el-descriptions-item label="展示位置">
          <el-tag :type="getPositionTag(currentProduct.display_position)" size="small">
            {{ getPositionLabel(currentProduct.display_position) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentProduct.display_order }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentProduct.status === 'active' ? 'success' : 'info'" size="small">
            {{ currentProduct.status === 'active' ? '上架' : '下架' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优惠券金额">
          <span style="color: #f56c6c; font-weight: bold">¥{{ currentProduct.coupon_amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="产品图片" :span="2">
          <el-image
            :src="currentProduct.product_image"
            :preview-src-list="[currentProduct.product_image]"
            fit="cover"
            style="width: 120px; height: 120px; border-radius: 4px"
          />
        </el-descriptions-item>
        <el-descriptions-item label="特殊标签" :span="2">
          <el-tag
            v-for="(tag, index) in currentProduct.special_tags"
            :key="index"
            size="small"
            style="margin-right: 8px"
          >
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="产品描述" :span="2">
          {{ currentProduct.product_description }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentProduct.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentProduct.updated_at }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 第一部分：导入和类型定义
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn, TableAction, ToolbarButton } from '@/components/common/DataTable.vue'
import {
  getCouponProductList,
  createCouponProduct,
  updateCouponProduct,
  deleteCouponProduct,
  type CouponProduct,
  type CouponProductListParams,
  type DisplayPosition,
  type ProductStatus,
} from '@/api/coupon-mall'
import { useErrorHandler } from '@/composables'

// Composables
const { handleApiError } = useErrorHandler()

// 展示位置选项
const POSITION_OPTIONS = [
  { label: '新人专区', value: 'newbie' },
  { label: '热门推荐', value: 'hot' },
  { label: '限时特惠', value: 'limited' },
]

// 状态选项
const STATUS_OPTIONS = [
  { label: '上架', value: 'active' },
  { label: '下架', value: 'inactive' },
]

// 搜索表单
const searchForm = reactive<CouponProductListParams>({
  status: undefined,
  display_position: undefined,
})

// 搜索字段配置
const searchFields = computed<SearchField[]>(() => [
  {
    prop: 'status',
    label: '产品状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '150px',
    options: STATUS_OPTIONS,
  },
  {
    prop: 'display_position',
    label: '展示位置',
    type: 'select',
    placeholder: '请选择位置',
    width: '150px',
    options: POSITION_OPTIONS,
  },
])

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'product_image', label: '产品图片', width: 100, slot: 'product_image' },
  { prop: 'product_title', label: '产品标题', minWidth: 180 },
  { prop: 'coupon_info', label: '关联优惠券', width: 150, slot: 'coupon_info' },
  { prop: 'display_position', label: '展示位置', width: 120, slot: 'display_position' },
  { prop: 'special_tags', label: '特殊标签', width: 150, slot: 'special_tags' },
  { prop: 'display_order', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'created_at', label: '创建时间', width: 180 },
]

// 工具栏按钮配置
const toolbarButtons: ToolbarButton[] = [
  {
    label: '新增产品',
    type: 'primary',
    icon: Plus,
    onClick: () => handleCreate(),
  },
]

// 表格操作列配置
const tableActions: TableAction[] = [
  {
    label: '查看',
    type: 'primary',
    onClick: (row: CouponProduct) => handleView(row),
  },
  {
    label: '编辑',
    type: 'primary',
    onClick: (row: CouponProduct) => handleEdit(row),
  },
  {
    label: '删除',
    type: 'danger',
    onClick: (row: CouponProduct) => handleDelete(row),
  },
]

// 产品列表
const productList = ref<CouponProduct[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)
const currentProductId = ref<number | null>(null)

// 详情对话框状态
const detailDialogVisible = ref(false)
const currentProduct = ref<CouponProduct | null>(null)

// 表单数据
const formData = reactive({
  coupon_id: 0,
  product_title: '',
  product_description: '',
  product_image: '',
  display_position: 'hot' as DisplayPosition,
  special_tags: [] as string[],
  display_order: 1,
  status: 'inactive' as ProductStatus,
})

// 表单字段配置
const formFields = computed(() => [
  {
    type: 'divider',
    label: '基本信息',
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'coupon_id',
        label: '关联优惠券ID',
        type: 'number',
        placeholder: '请输入优惠券ID',
        span: 12,
        min: 1,
      },
      {
        prop: 'product_title',
        label: '产品标题',
        type: 'input',
        placeholder: '请输入产品标题',
        span: 12,
      },
    ],
  },
  {
    prop: 'product_description',
    label: '产品描述',
    type: 'textarea',
    rows: 3,
    placeholder: '请输入产品描述',
    maxlength: 200,
  },
  {
    prop: 'product_image',
    label: '产品图片',
    type: 'input',
    placeholder: '请输入图片URL',
    tip: '建议尺寸：750x400',
  },
  {
    type: 'divider',
    label: '展示设置',
  },
  {
    type: 'row',
    columns: [
      {
        prop: 'display_position',
        label: '展示位置',
        type: 'select',
        options: POSITION_OPTIONS,
        span: 12,
      },
      {
        prop: 'display_order',
        label: '排序',
        type: 'number',
        min: 1,
        span: 12,
        tip: '数字越小越靠前',
      },
    ],
  },
  {
    prop: 'special_tags',
    label: '特殊标签',
    type: 'select',
    multiple: true,
    allowCreate: true,
    filterable: true,
    placeholder: '请输入标签（可自定义）',
    tip: '如：新人专享、热门、限时等',
  },
  {
    prop: 'status',
    label: '产品状态',
    type: 'select',
    options: STATUS_OPTIONS,
  },
]) as any

// 表单验证规则
const formRules = {
  coupon_id: [{ required: true, message: '请输入优惠券ID', trigger: 'blur' }],
  product_title: [{ required: true, message: '请输入产品标题', trigger: 'blur' }],
  product_description: [{ required: true, message: '请输入产品描述', trigger: 'blur' }],
  product_image: [{ required: true, message: '请输入产品图片URL', trigger: 'blur' }],
  display_position: [{ required: true, message: '请选择展示位置', trigger: 'change' }],
  display_order: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择产品状态', trigger: 'change' }],
}

// 加载产品列表
const loadProductList = async () => {
  loading.value = true
  try {
    const params: CouponProductListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    }

    const res = (await getCouponProductList(params)) as any
    productList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    handleApiError(error, '加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadProductList()
}

// 重置
const handleReset = () => {
  searchForm.status = undefined
  searchForm.display_position = undefined
  pagination.page = 1
  loadProductList()
}

// 重置表单
const resetForm = () => {
  formData.coupon_id = 0
  formData.product_title = ''
  formData.product_description = ''
  formData.product_image = ''
  formData.display_position = 'hot'
  formData.special_tags = []
  formData.display_order = 1
  formData.status = 'inactive'
}

// 创建产品
const handleCreate = () => {
  resetForm()
  isEdit.value = false
  currentProductId.value = null
  dialogTitle.value = '新增优惠券产品'
  dialogVisible.value = true
}

// 编辑产品
const handleEdit = (row: CouponProduct) => {
  resetForm()
  isEdit.value = true
  currentProductId.value = row.id
  dialogTitle.value = '编辑优惠券产品'

  // 填充表单数据
  formData.coupon_id = row.coupon_id
  formData.product_title = row.product_title
  formData.product_description = row.product_description
  formData.product_image = row.product_image
  formData.display_position = row.display_position
  formData.special_tags = [...row.special_tags]
  formData.display_order = row.display_order
  formData.status = row.status

  dialogVisible.value = true
}

// 查看产品详情
const handleView = (row: CouponProduct) => {
  currentProduct.value = row
  detailDialogVisible.value = true
}

// 删除产品
const handleDelete = async (row: CouponProduct) => {
  try {
    await ElMessageBox.confirm(`确定要删除产品"${row.product_title}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteCouponProduct(row.id)
    ElMessage.success('删除成功')
    loadProductList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '删除产品失败')
    }
  }
}

// 提交表单
const handleSubmit = async (data: any) => {
  submitLoading.value = true
  try {
    if (isEdit.value && currentProductId.value) {
      await updateCouponProduct(currentProductId.value, data)
      ElMessage.success('编辑成功')
    } else {
      await createCouponProduct(data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadProductList()
  } catch (error) {
    handleApiError(error, isEdit.value ? '编辑产品失败' : '创建产品失败')
  } finally {
    submitLoading.value = false
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadProductList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadProductList()
}

// 获取展示位置标签类型
const getPositionTag = (position: DisplayPosition) => {
  const tagMap: Record<DisplayPosition, string> = {
    newbie: 'success',
    hot: 'danger',
    limited: 'warning',
  }
  return tagMap[position] || 'info'
}

// 获取展示位置标签文本
const getPositionLabel = (position: DisplayPosition) => {
  const labelMap: Record<DisplayPosition, string> = {
    newbie: '新人专区',
    hot: '热门推荐',
    limited: '限时特惠',
  }
  return labelMap[position] || position
}

// 页面加载
onMounted(() => {
  loadProductList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
