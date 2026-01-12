<template>
  <div class="page-container">
    <!-- 产品选择器 -->
    <el-card class="product-selector" shadow="never">
      <el-form :inline="true">
        <el-form-item label="选择产品">
          <el-select
            v-model="selectedProductId"
            placeholder="请选择优惠券产品"
            style="width: 300px"
            filterable
            @change="handleProductChange"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.product_title"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 库存管理 -->
    <el-card v-if="selectedProductId" class="inventory-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
          <el-button
            v-if="!inventory"
            type="primary"
            :icon="Plus"
            @click="handleCreateInventory"
          >
            创建库存配置
          </el-button>
          <div v-else>
            <el-button type="primary" @click="handleEditInventory">编辑库存</el-button>
            <el-button type="success" :icon="Plus" @click="handleReplenish">补充库存</el-button>
          </div>
        </div>
      </template>

      <div v-if="inventory" class="inventory-info">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总库存" :value="inventory.total_stock">
              <template #suffix>
                <span style="font-size: 14px">张</span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="可用库存" :value="inventory.available_stock">
              <template #suffix>
                <span style="font-size: 14px">张</span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="已售出" :value="inventory.sold_count">
              <template #suffix>
                <span style="font-size: 14px">张</span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="预留中" :value="inventory.reserved_count">
              <template #suffix>
                <span style="font-size: 14px">张</span>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
        <el-divider />
        <div class="inventory-meta">
          <p>创建时间: {{ inventory.created_at }}</p>
          <p>更新时间: {{ inventory.updated_at }}</p>
        </div>
      </div>
      <el-empty v-else description="暂无库存配置，请先创建" />
    </el-card>

    <!-- 限购规则 -->
    <el-card v-if="selectedProductId" class="limits-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>限购规则</span>
          <el-button type="primary" :icon="Plus" @click="handleCreateLimit">
            新增限购规则
          </el-button>
        </div>
      </template>

      <el-table :data="limitList" :loading="limitLoading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="limit_type" label="限购类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLimitTypeTag(row.limit_type)" size="small">
              {{ getLimitTypeLabel(row.limit_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="limit_count" label="限购数量" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">{{ row.limit_count }}张</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDeleteLimit(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <el-empty v-else description="请先选择优惠券产品" />

    <!-- 创建/编辑库存对话框 -->
    <el-dialog
      v-model="inventoryDialogVisible"
      :title="inventoryDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="inventoryFormRef"
        :model="inventoryFormData"
        :rules="inventoryFormRules"
        label-width="120px"
      >
        <el-form-item label="总库存" prop="total_stock">
          <el-input-number
            v-model="inventoryFormData.total_stock"
            :min="0"
            :max="1000000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="可用库存" prop="available_stock">
          <el-input-number
            v-model="inventoryFormData.available_stock"
            :min="0"
            :max="inventoryFormData.total_stock"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="inventorySubmitLoading" @click="handleInventorySubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 补充库存对话框 -->
    <el-dialog
      v-model="replenishDialogVisible"
      title="补充库存"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="replenishFormRef"
        :model="replenishFormData"
        :rules="replenishFormRules"
        label-width="120px"
      >
        <el-form-item label="补充数量" prop="quantity">
          <el-input-number
            v-model="replenishFormData.quantity"
            :min="1"
            :max="100000"
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 8px">
            当前可用库存: {{ inventory?.available_stock || 0 }}张
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="replenishDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replenishSubmitLoading" @click="handleReplenishSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建限购规则对话框 -->
    <el-dialog
      v-model="limitDialogVisible"
      title="新增限购规则"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="limitFormRef"
        :model="limitFormData"
        :rules="limitFormRules"
        label-width="120px"
      >
        <el-form-item label="限购类型" prop="limit_type">
          <el-select v-model="limitFormData.limit_type" placeholder="请选择限购类型" style="width: 100%">
            <el-option label="每日限购" value="daily" />
            <el-option label="每周限购" value="weekly" />
            <el-option label="每月限购" value="monthly" />
            <el-option label="总限购" value="total" />
          </el-select>
        </el-form-item>
        <el-form-item label="限购数量" prop="limit_count">
          <el-input-number
            v-model="limitFormData.limit_count"
            :min="1"
            :max="1000"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="limitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="limitSubmitLoading" @click="handleLimitSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getCouponProductList,
  getInventory,
  createInventory,
  updateInventory,
  replenishInventory,
  getPurchaseLimits,
  createPurchaseLimit,
  type CouponProduct,
  type CouponInventory,
  type PurchaseLimit,
} from '@/api/coupon-mall'
import { useErrorHandler } from '@/composables'

const { handleApiError } = useErrorHandler()

// 产品列表
const productList = ref<CouponProduct[]>([])
const selectedProductId = ref<number | null>(null)

// 库存信息
const inventory = ref<CouponInventory | null>(null)
const inventoryLoading = ref(false)

// 限购规则列表
const limitList = ref<PurchaseLimit[]>([])
const limitLoading = ref(false)

// 库存对话框状态
const inventoryDialogVisible = ref(false)
const inventoryDialogTitle = ref('')
const inventorySubmitLoading = ref(false)
const isEditInventory = ref(false)
const inventoryFormRef = ref()

// 库存表单数据
const inventoryFormData = reactive({
  total_stock: 0,
  available_stock: 0,
})

// 库存表单验证规则
const inventoryFormRules = {
  total_stock: [{ required: true, message: '请输入总库存', trigger: 'blur' }],
  available_stock: [{ required: true, message: '请输入可用库存', trigger: 'blur' }],
}

// 补充库存对话框状态
const replenishDialogVisible = ref(false)
const replenishSubmitLoading = ref(false)
const replenishFormRef = ref()

// 补充库存表单数据
const replenishFormData = reactive({
  quantity: 0,
})

// 补充库存表单验证规则
const replenishFormRules = {
  quantity: [{ required: true, message: '请输入补充数量', trigger: 'blur' }],
}

// 限购规则对话框状态
const limitDialogVisible = ref(false)
const limitSubmitLoading = ref(false)
const limitFormRef = ref()

// 限购规则表单数据
const limitFormData = reactive({
  limit_type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'total',
  limit_count: 1,
})

// 限购规则表单验证规则
const limitFormRules = {
  limit_type: [{ required: true, message: '请选择限购类型', trigger: 'change' }],
  limit_count: [{ required: true, message: '请输入限购数量', trigger: 'blur' }],
}

// 加载产品列表
const loadProductList = async () => {
  try {
    const res = (await getCouponProductList({ page: 1, pageSize: 100 })) as any
    productList.value = res.data.list
  } catch (error) {
    handleApiError(error, '加载产品列表失败')
  }
}

// 加载库存信息
const loadInventory = async () => {
  if (!selectedProductId.value) return

  inventoryLoading.value = true
  try {
    const res = (await getInventory(selectedProductId.value)) as any
    inventory.value = res.data
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      inventory.value = null
    } else {
      handleApiError(error, '加载库存信息失败')
    }
  } finally {
    inventoryLoading.value = false
  }
}

// 加载限购规则列表
const loadLimitList = async () => {
  if (!selectedProductId.value) return

  limitLoading.value = true
  try {
    const res = (await getPurchaseLimits(selectedProductId.value)) as any
    limitList.value = res.data
  } catch (error) {
    handleApiError(error, '加载限购规则列表失败')
  } finally {
    limitLoading.value = false
  }
}

// 产品切换
const handleProductChange = () => {
  loadInventory()
  loadLimitList()
}

// 重置库存表单
const resetInventoryForm = () => {
  inventoryFormData.total_stock = 0
  inventoryFormData.available_stock = 0
}

// 创建库存配置
const handleCreateInventory = () => {
  if (!selectedProductId.value) {
    ElMessage.warning('请先选择优惠券产品')
    return
  }

  resetInventoryForm()
  isEditInventory.value = false
  inventoryDialogTitle.value = '创建库存配置'
  inventoryDialogVisible.value = true
}

// 编辑库存配置
const handleEditInventory = () => {
  if (!inventory.value) return

  resetInventoryForm()
  isEditInventory.value = true
  inventoryDialogTitle.value = '编辑库存配置'

  // 填充表单数据
  inventoryFormData.total_stock = inventory.value.total_stock
  inventoryFormData.available_stock = inventory.value.available_stock

  inventoryDialogVisible.value = true
}

// 提交库存表单
const handleInventorySubmit = async () => {
  if (!selectedProductId.value) return
  if (!inventoryFormRef.value) return

  try {
    await inventoryFormRef.value.validate()
  } catch {
    return
  }

  inventorySubmitLoading.value = true
  try {
    const data = {
      total_stock: inventoryFormData.total_stock,
      available_stock: inventoryFormData.available_stock,
    }

    if (isEditInventory.value) {
      await updateInventory(selectedProductId.value, data)
      ElMessage.success('编辑成功')
    } else {
      await createInventory(selectedProductId.value, data)
      ElMessage.success('创建成功')
    }

    inventoryDialogVisible.value = false
    loadInventory()
  } catch (error) {
    handleApiError(error, isEditInventory.value ? '编辑库存配置失败' : '创建库存配置失败')
  } finally {
    inventorySubmitLoading.value = false
  }
}

// 补充库存
const handleReplenish = () => {
  if (!inventory.value) return

  replenishFormData.quantity = 0
  replenishDialogVisible.value = true
}

// 提交补充库存
const handleReplenishSubmit = async () => {
  if (!selectedProductId.value) return
  if (!replenishFormRef.value) return

  try {
    await replenishFormRef.value.validate()
  } catch {
    return
  }

  replenishSubmitLoading.value = true
  try {
    await replenishInventory(selectedProductId.value, {
      quantity: replenishFormData.quantity,
    })
    ElMessage.success('补充库存成功')
    replenishDialogVisible.value = false
    loadInventory()
  } catch (error) {
    handleApiError(error, '补充库存失败')
  } finally {
    replenishSubmitLoading.value = false
  }
}

// 创建限购规则
const handleCreateLimit = () => {
  if (!selectedProductId.value) {
    ElMessage.warning('请先选择优惠券产品')
    return
  }

  limitFormData.limit_type = 'daily'
  limitFormData.limit_count = 1
  limitDialogVisible.value = true
}

// 提交限购规则
const handleLimitSubmit = async () => {
  if (!selectedProductId.value) return
  if (!limitFormRef.value) return

  try {
    await limitFormRef.value.validate()
  } catch {
    return
  }

  limitSubmitLoading.value = true
  try {
    await createPurchaseLimit(selectedProductId.value, {
      limit_type: limitFormData.limit_type,
      limit_count: limitFormData.limit_count,
    })
    ElMessage.success('创建成功')
    limitDialogVisible.value = false
    loadLimitList()
  } catch (error) {
    handleApiError(error, '创建限购规则失败')
  } finally {
    limitSubmitLoading.value = false
  }
}

// 删除限购规则
const handleDeleteLimit = async (row: PurchaseLimit) => {
  try {
    await ElMessageBox.confirm('确定要删除该限购规则吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 注意：API 文档中没有删除限购规则的接口，这里假设有
    // 如果后端没有提供删除接口，需要联系后端添加
    ElMessage.warning('删除功能待后端实现')
    // await deletePurchaseLimit(selectedProductId.value, row.id)
    // ElMessage.success('删除成功')
    // loadLimitList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '删除限购规则失败')
    }
  }
}

// 获取限购类型标签类型
const getLimitTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    daily: 'success',
    weekly: 'warning',
    monthly: 'danger',
    total: 'info',
  }
  return tagMap[type] || 'info'
}

// 获取限购类型标签文本
const getLimitTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    daily: '每日限购',
    weekly: '每周限购',
    monthly: '每月限购',
    total: '总限购',
  }
  return labelMap[type] || type
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

.product-selector {
  margin-bottom: 20px;
}

.inventory-card,
.limits-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.inventory-info {
  .inventory-meta {
    font-size: 12px;
    color: #909399;
    margin-top: 16px;

    p {
      margin: 4px 0;
    }
  }
}
</style>
