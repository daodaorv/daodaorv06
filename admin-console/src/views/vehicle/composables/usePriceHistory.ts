import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as vehiclePriceHistoryApi from '@/api/vehiclePriceHistory'

/**
 * 价格历史对话框状态
 */
interface PriceHistoryDialog {
  visible: boolean
  vehicleId: number | null
}

/**
 * 车辆价格历史逻辑
 */
export function usePriceHistory() {
  // 对话框状态
  const priceHistoryDialog = ref<PriceHistoryDialog>({
    visible: false,
    vehicleId: null,
  })

  // 价格历史列表
  const priceHistory = ref<unknown[]>([])

  // 加载状态
  const historyLoading = ref(false)

  /**
   * 打开价格历史对话框
   */
  const handleViewPriceHistory = async (vehicleId: number): Promise<void> => {
    priceHistoryDialog.value.vehicleId = vehicleId
    priceHistoryDialog.value.visible = true
    await loadPriceHistory(vehicleId)
  }

  /**
   * 加载价格历史
   */
  const loadPriceHistory = async (vehicleId: number): Promise<void> => {
    historyLoading.value = true
    try {
      const history = await vehiclePriceHistoryApi.getVehiclePriceHistory(vehicleId)
      priceHistory.value = history
    } catch (error: unknown) {
      ElMessage.error('加载价格历史失败')
    } finally {
      historyLoading.value = false
    }
  }

  return {
    priceHistoryDialog,
    priceHistory,
    historyLoading,
    handleViewPriceHistory,
  }
}
