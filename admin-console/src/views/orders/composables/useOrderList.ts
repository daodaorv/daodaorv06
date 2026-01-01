import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api/order'
import type { OrderListParams } from '@/api/order'
import { useListPage } from '@/composables/useListPage'
import type { ApiResponse, PaginationResponse } from '@/types/common'

/**
 * 订单列表逻辑
 */
export function useOrderList() {
  // 包装 API 调用以适配 useListPage 的类型
  const fetchOrderList = async (params: unknown): Promise<ApiResponse<PaginationResponse<unknown>>> => {
    return await orderApi.getOrderList(params as OrderListParams) as ApiResponse<PaginationResponse<unknown>>
  }

  // 使用通用列表逻辑
  const {
    searchForm,
    list,
    loading,
    pagination,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    refresh,
  } = useListPage(fetchOrderList, {
    orderNo: '',
    customerName: '',
    customerPhone: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  // 选中的订单
  const selectedOrders = ref<unknown[]>([])

  // 是否有选中项
  const hasSelection = computed(() => selectedOrders.value.length > 0)

  /**
   * 处理选择变化
   */
  const handleSelectionChange = (selection: unknown[]): void => {
    selectedOrders.value = selection
  }

  /**
   * 取消订单
   */
  const handleCancel = async (orderId: number): Promise<void> => {
    try {
      const { value: reason } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入取消原因',
      })

      await orderApi.cancelOrder(orderId, reason as string)
      ElMessage.success('取消成功')
      refresh()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error('取消失败')
      }
    }
  }

  return {
    // 状态
    searchForm,
    list,
    loading,
    pagination,
    selectedOrders,
    hasSelection,

    // 方法
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleCancel,
    refresh,
  }
}
