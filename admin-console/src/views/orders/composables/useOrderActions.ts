import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api/order'

/**
 * 订单操作对话框状态
 */
interface OrderActionDialog {
  visible: boolean
  type: 'pickup' | 'return' | 'confirm' | null
  orderId: number | null
}

/**
 * 订单操作逻辑
 */
export function useOrderActions(refreshList: () => void) {
  // 对话框状态
  const actionDialog = ref<OrderActionDialog>({
    visible: false,
    type: null,
    orderId: null,
  })

  // 操作加载状态
  const actionLoading = ref(false)

  /**
   * 打开操作对话框
   */
  const handleOpenAction = (type: 'pickup' | 'return' | 'confirm', orderId: number): void => {
    actionDialog.value = {
      visible: true,
      type,
      orderId,
    }
  }

  /**
   * 确认订单
   */
  const handleConfirm = async (orderId: number): Promise<void> => {
    actionLoading.value = true
    try {
      await orderApi.confirmOrder(orderId)
      ElMessage.success('确认成功')
      actionDialog.value.visible = false
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('确认失败')
    } finally {
      actionLoading.value = false
    }
  }

  /**
   * 取车
   */
  const handlePickup = async (orderId: number, data: unknown): Promise<void> => {
    actionLoading.value = true
    try {
      // TODO: 实现取车 API
      ElMessage.success('取车成功')
      actionDialog.value.visible = false
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('取车失败')
    } finally {
      actionLoading.value = false
    }
  }

  /**
   * 还车
   */
  const handleReturn = async (orderId: number, data: unknown): Promise<void> => {
    actionLoading.value = true
    try {
      // TODO: 实现还车 API
      ElMessage.success('还车成功')
      actionDialog.value.visible = false
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('还车失败')
    } finally {
      actionLoading.value = false
    }
  }

  return {
    actionDialog,
    actionLoading,
    handleOpenAction,
    handleConfirm,
    handlePickup,
    handleReturn,
  }
}
