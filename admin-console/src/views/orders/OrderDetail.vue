<template>
  <div class="order-detail-container">
    <el-card v-if="order" class="detail-card">
      <template #header>
        <div class="card-header">
          <span>订单信息</span>
          <div class="header-actions">
            <el-tag :type="getOrderStatusTag(order.status)" size="large">
              {{ getOrderStatusLabel(order.status) }}
            </el-tag>
            <el-tag
              :type="getPaymentStatusTag(order.paymentStatus)"
              size="large"
              style="margin-left: 10px"
            >
              {{ getPaymentStatusLabel(order.paymentStatus) }}
            </el-tag>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag :type="getOrderTypeTag(order.type)" size="small">
            {{ getOrderTypeLabel(order.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatDateTime(order.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ order.userName }}</el-descriptions-item>
        <el-descriptions-item label="用户手机">{{ order.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="所属门店">{{ order.storeName }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="order" class="vehicle-card">
      <template #header><span>车辆信息</span></template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="车辆名称">{{ order.vehicleName }}</el-descriptions-item>
        <el-descriptions-item label="车牌号">{{ order.vehicleNumber }}</el-descriptions-item>
        <el-descriptions-item label="日租金"
          >¥{{ order.dailyPrice.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="取车门店">{{ order.pickupStore }}</el-descriptions-item>
        <el-descriptions-item label="还车门店">{{ order.returnStore }}</el-descriptions-item>
        <el-descriptions-item label="租赁天数">{{ order.days }} 天</el-descriptions-item>
        <el-descriptions-item label="取车时间">{{ order.pickupTime }}</el-descriptions-item>
        <el-descriptions-item label="还车时间">{{ order.returnTime }}</el-descriptions-item>
        <el-descriptions-item label="租期"
          >{{ order.startDate }} 至 {{ order.endDate }}</el-descriptions-item
        >
      </el-descriptions>
    </el-card>

    <el-card v-if="order" class="driver-card">
      <template #header><span>驾驶员信息</span></template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="驾驶员姓名">{{ order.driverName }}</el-descriptions-item>
        <el-descriptions-item label="驾驶员手机">{{ order.driverPhone }}</el-descriptions-item>
        <el-descriptions-item label="驾驶证号">{{ order.driverLicense }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ order.emergencyContact }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系电话">{{ order.emergencyPhone }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ order.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="order" class="payment-card">
      <template #header><span>费用信息</span></template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="租金"
          >¥{{ order.totalAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="押金"
          >¥{{ order.depositAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="保险费"
          >¥{{ order.insuranceAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="服务费"
          >¥{{ order.serviceAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="优惠金额"
          >-¥{{ order.discountAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="实付金额">
          <span style="color: #f56c6c; font-weight: bold; font-size: 16px">
            ¥{{ order.actualAmount.toLocaleString() }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已支付"
          >¥{{ order.paidAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="已退款"
          >¥{{ order.refundAmount.toLocaleString() }}</el-descriptions-item
        >
        <el-descriptions-item label="支付状态">
          <el-tag :type="getPaymentStatusTag(order.paymentStatus)" size="small">
            {{ getPaymentStatusLabel(order.paymentStatus) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 合作商订单信息（仅合作商门店订单显示） -->
    <el-card v-if="order && order.storeType === 'cooperative'" class="partner-card">
      <template #header>
        <div class="card-header">
          <span>合作商订单信息</span>
          <el-button type="primary" size="small" @click="handleEditPartnerInfo">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="合作商订单编号">
          {{ order.partnerOrderNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="合作商订单价格">
          <span v-if="order.partnerOrderPrice" style="color: #409eff; font-weight: bold">
            ¥{{ order.partnerOrderPrice.toLocaleString() }}
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="差价（分润基础）">
          <span
            v-if="order.priceDifference"
            style="color: #67c23a; font-weight: bold; font-size: 16px"
          >
            ¥{{ order.priceDifference.toLocaleString() }}
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="说明" :span="3">
          <div style="color: #909399; font-size: 13px; line-height: 1.6">
            合作商门店通过差价获利。差价 = 平台订单价格（¥{{
              order.actualAmount.toLocaleString()
            }}）- 合作商订单价格（¥{{ order.partnerOrderPrice?.toLocaleString() || '0' }}）= ¥{{
              order.priceDifference?.toLocaleString() || '0'
            }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="order" class="timeline-card">
      <template #header><span>订单时间线</span></template>
      <OrderTimeline :timeline="orderTimeline" @action="handleTimelineAction" />
    </el-card>

    <el-card v-if="order" class="actions-card">
      <template #header><span>订单操作</span></template>
      <div class="action-buttons">
        <el-button
          v-if="order.status === 'pending_confirm'"
          type="success"
          size="large"
          @click="handleConfirm"
          >确认订单</el-button
        >
        <el-button
          v-if="order.status === 'confirmed'"
          type="success"
          size="large"
          @click="handlePickup"
          >取车登记</el-button
        >
        <el-button
          v-if="order.status === 'in_use'"
          type="warning"
          size="large"
          @click="handleReturn"
          >还车登记</el-button
        >
        <el-button
          v-if="order.status === 'in_use'"
          type="success"
          size="large"
          @click="handleComplete"
          >完成订单</el-button
        >
        <el-button
          v-if="['pending_payment', 'pending_confirm', 'confirmed'].includes(order.status)"
          type="danger"
          size="large"
          @click="handleCancel"
          >取消订单</el-button
        >
        <el-button size="large" @click="handleBack">返回列表</el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="cancelDialogVisible"
      title="取消订单"
      width="500px"
      @close="handleCancelDialogClose"
    >
      <el-form ref="cancelFormRef" :model="cancelForm" :rules="cancelFormRules" label-width="100px">
        <el-form-item label="取消原因" prop="reason">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="cancelLoading" @click="handleCancelSubmit"
          >确定取消订单</el-button
        >
      </template>
    </el-dialog>

    <!-- 编辑合作商订单信息对话框 -->
    <el-dialog
      v-model="partnerDialogVisible"
      title="编辑合作商订单信息"
      width="600px"
      @close="handlePartnerDialogClose"
    >
      <el-form
        ref="partnerFormRef"
        :model="partnerForm"
        :rules="partnerFormRules"
        label-width="140px"
      >
        <el-form-item label="合作商订单编号" prop="partnerOrderNo">
          <el-input v-model="partnerForm.partnerOrderNo" placeholder="请输入合作商订单编号" />
        </el-form-item>
        <el-form-item label="合作商订单价格" prop="partnerOrderPrice">
          <el-input-number
            v-model="partnerForm.partnerOrderPrice"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
            placeholder="请输入合作商订单价格"
          />
        </el-form-item>
        <el-form-item label="差价（自动计算）">
          <div style="color: #67c23a; font-weight: bold; font-size: 16px">
            ¥{{ calculatedPriceDifference.toLocaleString() }}
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            差价 = 平台订单价格（¥{{ order?.actualAmount.toLocaleString() }}）- 合作商订单价格（¥{{
              partnerForm.partnerOrderPrice?.toLocaleString() || '0'
            }}）
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="partnerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="partnerLoading" @click="handlePartnerSubmit"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <!-- 取车管理对话框 -->
    <PickupDialog v-model="pickupDialogVisible" :order-info="order" @submit="handlePickupSubmit" />

    <!-- 还车管理对话框 -->
    <ReturnDialog
      v-model="returnDialogVisible"
      :order-info="order"
      :pickup-record="pickupRecord"
      @submit="handleReturnSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getOrderDetail,
  confirmOrder,
  completeOrder,
  cancelOrder,
  pickupOrder,
  returnOrder,
  getPickupRecord,
  getOrderTimeline,
  type Order,
} from '@/api/order'
import { useErrorHandler } from '@/composables'
import OrderTimeline from '@/components/orders/OrderTimeline.vue'
import PickupDialog from '@/components/orders/PickupDialog.vue'
import ReturnDialog from '@/components/orders/ReturnDialog.vue'

const route = useRoute()
const router = useRouter()
const { handleApiError } = useErrorHandler()

const order = ref<Order | null>(null)
const loading = ref(false)
const cancelDialogVisible = ref(false)
const cancelLoading = ref(false)
const cancelFormRef = ref<FormInstance>()
const cancelForm = reactive({ reason: '' })
const cancelFormRules: FormRules = {
  reason: [
    { required: true, message: '请输入取消原因', trigger: 'blur' },
    { min: 5, message: '取消原因至少5个字符', trigger: 'blur' },
  ],
}

// 订单时间线
const orderTimeline = ref<any[]>([])

// 取车管理对话框
const pickupDialogVisible = ref(false)

// 还车管理对话框
const returnDialogVisible = ref(false)
const pickupRecord = ref<any>(null)

const loadOrderDetail = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    ElMessage.error('订单ID无效')
    router.push('/orders/list')
    return
  }
  loading.value = true
  try {
    const res = (await getOrderDetail(orderId)) as any
    order.value = res.data
    // 加载订单时间线
    await loadOrderTimeline(orderId)
  } catch (error) {
    handleApiError(error, '加载订单详情失败')
    router.push('/orders/list')
  } finally {
    loading.value = false
  }
}

// 加载订单时间线
const loadOrderTimeline = async (orderId: number) => {
  try {
    const res = (await getOrderTimeline(orderId)) as any
    orderTimeline.value = res.data
  } catch (error) {
    handleApiError(error, '加载订单时间线失败')
  }
}

const handleConfirm = async () => {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(`确定要确认订单 "${order.value.orderNo}" 吗？`, '确认订单', {
      type: 'success',
    })
    await confirmOrder(order.value.id)
    ElMessage.success('订单已确认')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') handleApiError(error, '确认订单失败')
  }
}

const handleComplete = async () => {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(`确定要完成订单 "${order.value.orderNo}" 吗？`, '完成订单', {
      type: 'success',
    })
    await completeOrder(order.value.id)
    ElMessage.success('订单已完成')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') handleApiError(error, '完成订单失败')
  }
}

const handleCancel = () => {
  cancelDialogVisible.value = true
}

// 合作商订单信息编辑
const partnerDialogVisible = ref(false)
const partnerLoading = ref(false)
const partnerFormRef = ref<FormInstance>()
const partnerForm = reactive({
  partnerOrderNo: '',
  partnerOrderPrice: 0,
})
const partnerFormRules: FormRules = {
  partnerOrderNo: [{ required: true, message: '请输入合作商订单编号', trigger: 'blur' }],
  partnerOrderPrice: [
    { required: true, message: '请输入合作商订单价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' },
  ],
}

// 计算差价
const calculatedPriceDifference = computed(() => {
  if (!order.value) return 0
  return order.value.actualAmount - (partnerForm.partnerOrderPrice || 0)
})

// 打开编辑合作商订单信息对话框
const handleEditPartnerInfo = () => {
  if (!order.value) return
  partnerForm.partnerOrderNo = order.value.partnerOrderNo || ''
  partnerForm.partnerOrderPrice = order.value.partnerOrderPrice || 0
  partnerDialogVisible.value = true
}

// 提交合作商订单信息
const handlePartnerSubmit = async () => {
  if (!partnerFormRef.value || !order.value) return

  await partnerFormRef.value.validate(async valid => {
    if (!valid) return

    partnerLoading.value = true
    try {
      // 这里应该调用更新订单的 API，暂时使用 Mock 数据模拟
      // await updateOrderPartnerInfo(order.value.id, {
      //   partnerOrderNo: partnerForm.partnerOrderNo,
      //   partnerOrderPrice: partnerForm.partnerOrderPrice,
      //   priceDifference: calculatedPriceDifference.value
      // })

      // 模拟更新成功，直接更新本地数据
      order.value.partnerOrderNo = partnerForm.partnerOrderNo
      order.value.partnerOrderPrice = partnerForm.partnerOrderPrice
      order.value.priceDifference = calculatedPriceDifference.value

      ElMessage.success('合作商订单信息更新成功')
      partnerDialogVisible.value = false
    } catch (error) {
      handleApiError(error, '更新失败')
    } finally {
      partnerLoading.value = false
    }
  })
}

// 关闭合作商订单信息对话框
const handlePartnerDialogClose = () => {
  partnerFormRef.value?.resetFields()
}

const handleCancelSubmit = async () => {
  if (!cancelFormRef.value || !order.value) return
  await cancelFormRef.value.validate(async valid => {
    if (!valid) return
    cancelLoading.value = true
    try {
      await cancelOrder(order.value!.id, cancelForm.reason)
      ElMessage.success('订单已取消')
      cancelDialogVisible.value = false
      loadOrderDetail()
    } catch (error) {
      handleApiError(error, '取消订单失败')
    } finally {
      cancelLoading.value = false
    }
  })
}

const handleCancelDialogClose = () => {
  cancelFormRef.value?.resetFields()
  cancelForm.reason = ''
}

// 取车
const handlePickup = () => {
  pickupDialogVisible.value = true
}

// 提交取车
const handlePickupSubmit = async (data: any) => {
  try {
    await pickupOrder(data.orderId, data)
    ElMessage.success('取车登记成功')
    pickupDialogVisible.value = false
    loadOrderDetail()
  } catch (error) {
    handleApiError(error, '取车登记失败')
  }
}

// 还车
const handleReturn = async () => {
  if (!order.value) return
  try {
    // 先获取取车记录
    const res = (await getPickupRecord(order.value.id)) as any
    pickupRecord.value = res.data
    returnDialogVisible.value = true
  } catch (error) {
    handleApiError(error, '获取取车记录失败')
  }
}

// 提交还车
const handleReturnSubmit = async (data: any) => {
  try {
    await returnOrder(data.orderId, data)
    ElMessage.success('还车登记成功')
    returnDialogVisible.value = false
    loadOrderDetail()
  } catch (error) {
    handleApiError(error, '还车登记失败')
  }
}

// 时间线操作
const handleTimelineAction = (key: string, item: any) => {
  console.log('Timeline action:', key, item)
  // 可以根据不同的操作类型执行不同的逻辑
}

const handleBack = () => {
  router.push('/orders/list')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getOrderTypeTag = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    hosting: 'primary',
    cooperative: 'success',
    tour: 'warning',
  }
  return map[type] || 'info'
}
const getOrderTypeLabel = (type: string) =>
  ({ hosting: '托管订单', cooperative: '合作订单', tour: '房车旅游' })[type] || type
const getOrderStatusTag = (
  status: string
): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending_payment: 'warning',
    pending_confirm: 'warning',
    confirmed: 'primary',
    in_use: 'success',
    completed: 'info',
    cancelled: 'danger',
    refunding: 'warning',
    refunded: 'info',
  }
  return map[status] || 'info'
}
const getOrderStatusLabel = (status: string) =>
  ({
    pending_payment: '待支付',
    pending_confirm: '待确认',
    confirmed: '已确认',
    in_use: '使用中',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款',
  })[status] || status
const getPaymentStatusTag = (
  status: string
): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    unpaid: 'danger',
    paid: 'success',
    refunding: 'warning',
    refunded: 'info',
  }
  return map[status] || 'info'
}
const getPaymentStatusLabel = (status: string) =>
  ({ unpaid: '未支付', paid: '已支付', refunding: '退款中', refunded: '已退款' })[status] || status

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail-container {
  padding: 20px;
  .detail-card,
  .vehicle-card,
  .driver-card,
  .payment-card,
  .actions-card {
    margin-top: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 20px 0;
  }
}
</style>
