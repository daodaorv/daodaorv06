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

    <!-- 获取方式列表 -->
    <el-card v-if="selectedProductId" class="methods-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>获取方式配置</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新增获取方式
          </el-button>
        </div>
      </template>

      <el-table :data="methodList" :loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="method_type" label="获取方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getMethodTypeTag(row.method_type)" size="small">
              {{ getMethodTypeLabel(row.method_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="method_config" label="配置信息" min-width="300">
          <template #default="{ row }">
            <div class="config-info">
              <template v-if="row.method_type === 'free'">
                <div>每日限领: {{ row.method_config.daily_limit }}次</div>
                <div>总限领: {{ row.method_config.total_limit }}次</div>
              </template>
              <template v-else-if="row.method_type === 'points'">
                <div>所需积分: {{ row.method_config.points_required }}</div>
                <div>每日限兑: {{ row.method_config.daily_limit }}次</div>
              </template>
              <template v-else-if="row.method_type === 'cash'">
                <div>售价: ¥{{ row.method_config.price }}</div>
                <div>每日限购: {{ row.method_config.daily_limit }}次</div>
              </template>
              <template v-else-if="row.method_type === 'combo'">
                <div>现金: ¥{{ row.method_config.cash_amount }}</div>
                <div>积分: {{ row.method_config.points_amount }}</div>
              </template>
              <template v-else-if="row.method_type === 'share'">
                <div>分享奖励积分: {{ row.method_config.reward_points }}</div>
                <div>每日限次: {{ row.method_config.daily_limit }}次</div>
              </template>
              <template v-else-if="row.method_type === 'invite'">
                <div>邀请奖励积分: {{ row.method_config.reward_points }}</div>
                <div>被邀请人奖励: {{ row.method_config.invitee_reward_points }}</div>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              :type="row.is_active ? 'warning' : 'success'"
              size="small"
              @click="handleToggle(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <el-empty v-else description="请先选择优惠券产品" />

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="获取方式" prop="method_type">
          <el-select
            v-model="formData.method_type"
            placeholder="请选择获取方式"
            :disabled="isEdit"
            style="width: 100%"
          >
            <el-option label="免费领取" value="free" />
            <el-option label="积分兑换" value="points" />
            <el-option label="现金购买" value="cash" />
            <el-option label="组合支付" value="combo" />
            <el-option label="分享获取" value="share" />
            <el-option label="邀请获取" value="invite" />
          </el-select>
        </el-form-item>

        <!-- 免费领取配置 -->
        <template v-if="formData.method_type === 'free'">
          <el-form-item label="每日限领次数" prop="method_config.daily_limit">
            <el-input-number
              v-model="formData.method_config.daily_limit"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="总限领次数" prop="method_config.total_limit">
            <el-input-number
              v-model="formData.method_config.total_limit"
              :min="1"
              :max="1000"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 积分兑换配置 -->
        <template v-else-if="formData.method_type === 'points'">
          <el-form-item label="所需积分" prop="method_config.points_required">
            <el-input-number
              v-model="formData.method_config.points_required"
              :min="1"
              :max="100000"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="每日限兑次数" prop="method_config.daily_limit">
            <el-input-number
              v-model="formData.method_config.daily_limit"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 现金购买配置 -->
        <template v-else-if="formData.method_type === 'cash'">
          <el-form-item label="售价(元)" prop="method_config.price">
            <el-input-number
              v-model="formData.method_config.price"
              :min="0.01"
              :max="10000"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="每日限购次数" prop="method_config.daily_limit">
            <el-input-number
              v-model="formData.method_config.daily_limit"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 组合支付配置 -->
        <template v-else-if="formData.method_type === 'combo'">
          <el-form-item label="现金金额(元)" prop="method_config.cash_amount">
            <el-input-number
              v-model="formData.method_config.cash_amount"
              :min="0.01"
              :max="10000"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="积分金额" prop="method_config.points_amount">
            <el-input-number
              v-model="formData.method_config.points_amount"
              :min="1"
              :max="100000"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="每日限购次数" prop="method_config.daily_limit">
            <el-input-number
              v-model="formData.method_config.daily_limit"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 分享获取配置 -->
        <template v-else-if="formData.method_type === 'share'">
          <el-form-item label="奖励积分" prop="method_config.reward_points">
            <el-input-number
              v-model="formData.method_config.reward_points"
              :min="1"
              :max="10000"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="每日限次" prop="method_config.daily_limit">
            <el-input-number
              v-model="formData.method_config.daily_limit"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- 邀请获取配置 -->
        <template v-else-if="formData.method_type === 'invite'">
          <el-form-item label="邀请人奖励积分" prop="method_config.reward_points">
            <el-input-number
              v-model="formData.method_config.reward_points"
              :min="1"
              :max="10000"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="被邀请人奖励" prop="method_config.invitee_reward_points">
            <el-input-number
              v-model="formData.method_config.invitee_reward_points"
              :min="1"
              :max="10000"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <el-form-item label="是否启用" prop="is_active">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
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
  getAcquisitionMethods,
  createAcquisitionMethod,
  updateAcquisitionMethod,
  toggleAcquisitionMethod,
  type CouponProduct,
  type AcquisitionMethod,
  type MethodType,
} from '@/api/coupon-mall'
import { useErrorHandler } from '@/composables'

const { handleApiError } = useErrorHandler()

// 产品列表
const productList = ref<CouponProduct[]>([])
const selectedProductId = ref<number | null>(null)

// 获取方式列表
const methodList = ref<AcquisitionMethod[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)
const currentMethodId = ref<number | null>(null)
const formRef = ref()

// 表单数据
const formData = reactive({
  method_type: 'free' as MethodType,
  method_config: {} as Record<string, any>,
  is_active: true,
})

// 表单验证规则
const formRules = {
  method_type: [{ required: true, message: '请选择获取方式', trigger: 'change' }],
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

// 加载获取方式列表
const loadMethodList = async () => {
  if (!selectedProductId.value) return

  loading.value = true
  try {
    const res = (await getAcquisitionMethods(selectedProductId.value)) as any
    methodList.value = res.data
  } catch (error) {
    handleApiError(error, '加载获取方式列表失败')
  } finally {
    loading.value = false
  }
}

// 产品切换
const handleProductChange = () => {
  loadMethodList()
}

// 重置表单
const resetForm = () => {
  formData.method_type = 'free'
  formData.method_config = {}
  formData.is_active = true
}

// 创建获取方式
const handleCreate = () => {
  if (!selectedProductId.value) {
    ElMessage.warning('请先选择优惠券产品')
    return
  }

  resetForm()
  isEdit.value = false
  currentMethodId.value = null
  dialogTitle.value = '新增获取方式'
  dialogVisible.value = true
}

// 编辑获取方式
const handleEdit = (row: AcquisitionMethod) => {
  resetForm()
  isEdit.value = true
  currentMethodId.value = row.id
  dialogTitle.value = '编辑获取方式'

  // 填充表单数据
  formData.method_type = row.method_type
  formData.method_config = { ...row.method_config }
  formData.is_active = row.is_active

  dialogVisible.value = true
}

// 切换获取方式状态
const handleToggle = async (row: AcquisitionMethod) => {
  if (!selectedProductId.value) return

  try {
    await ElMessageBox.confirm(
      `确定要${row.is_active ? '禁用' : '启用'}该获取方式吗？`,
      '状态切换确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await toggleAcquisitionMethod(selectedProductId.value, row.id)
    ElMessage.success('状态切换成功')
    loadMethodList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '状态切换失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!selectedProductId.value) return
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitLoading.value = true
  try {
    const data = {
      method_type: formData.method_type,
      method_config: formData.method_config,
      is_active: formData.is_active,
    }

    if (isEdit.value && currentMethodId.value) {
      await updateAcquisitionMethod(selectedProductId.value, currentMethodId.value, data)
      ElMessage.success('编辑成功')
    } else {
      await createAcquisitionMethod(selectedProductId.value, data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadMethodList()
  } catch (error) {
    handleApiError(error, isEdit.value ? '编辑获取方式失败' : '创建获取方式失败')
  } finally {
    submitLoading.value = false
  }
}

// 获取获取方式类型标签类型
const getMethodTypeTag = (type: MethodType) => {
  const tagMap: Record<MethodType, string> = {
    free: 'success',
    points: 'warning',
    cash: 'danger',
    combo: 'primary',
    share: 'info',
    invite: 'success',
  }
  return tagMap[type] || 'info'
}

// 获取获取方式类型标签文本
const getMethodTypeLabel = (type: MethodType) => {
  const labelMap: Record<MethodType, string> = {
    free: '免费领取',
    points: '积分兑换',
    cash: '现金购买',
    combo: '组合支付',
    share: '分享获取',
    invite: '邀请获取',
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

.methods-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.config-info {
  font-size: 12px;
  line-height: 1.8;

  div {
    color: #606266;
  }
}
</style>
