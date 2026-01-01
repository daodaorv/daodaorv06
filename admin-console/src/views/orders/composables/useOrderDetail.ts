import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api/order'
import type { ApiResponse } from '@/types/common'
import { isSuccessResponse } from '@/types/common'
import type { Order } from '@/mock/orders'

/**
 * 订单详情对话框状态
 */
interface OrderDetailDialog {
  visible: boolean
  orderId: number | null
}

/**
 * 订单详情逻辑
 */
export function useOrderDetail() {
  // 对话框状态
  const detailDialog = ref<OrderDetailDialog>({
    visible: false,
    orderId: null,
  })

  // 订单详情
  const orderDetail = ref<Order | null>(null)

  // 加载状态
  const detailLoading = ref(false)

  /**
   * 打开订单详情对话框
   */
  const handleViewDetail = async (orderId: number): Promise<void> => {
    detailDialog.value.orderId = orderId
    detailDialog.value.visible = true
    await loadOrderDetail(orderId)
  }

  /**
   * 加载订单详情
   */
  const loadOrderDetail = async (orderId: number): Promise<void> => {
    detailLoading.value = true
    try {
      const response = await orderApi.getOrderDetail(orderId) as ApiResponse<Order>
      if (isSuccessResponse(response)) {
        orderDetail.value = response.data
      }
    } catch (error: unknown) {
      ElMessage.error('加载订单详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  return {
    detailDialog,
    orderDetail,
    detailLoading,
    handleViewDetail,
  }
}
