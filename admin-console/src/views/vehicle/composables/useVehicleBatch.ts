import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as vehicleApi from '@/api/vehicle'

/**
 * 批量操作对话框状态
 */
interface BatchDialog {
  visible: boolean
  type: 'status' | 'store' | 'delete' | null
}

/**
 * 车辆批量操作逻辑
 */
export function useVehicleBatch(
  selectedVehicles: { value: unknown[] },
  refreshList: () => void
) {
  // 对话框状态
  const batchDialog = ref<BatchDialog>({
    visible: false,
    type: null,
  })

  // 批量操作加载状态
  const batchLoading = ref(false)

  /**
   * 打开批量操作对话框
   */
  const handleOpenBatchDialog = (type: 'status' | 'store' | 'delete'): void => {
    if (selectedVehicles.value.length === 0) {
      ElMessage.warning('请先选择车辆')
      return
    }
    batchDialog.value.type = type
    batchDialog.value.visible = true
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async (): Promise<void> => {
    if (selectedVehicles.value.length === 0) {
      ElMessage.warning('请先选择要删除的车辆')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedVehicles.value.length} 辆车吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      batchLoading.value = true
      // TODO: 实现批量删除 API
      ElMessage.success('批量删除成功')
      selectedVehicles.value = []
      refreshList()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    } finally {
      batchLoading.value = false
    }
  }

  /**
   * 批量更新状态
   */
  const handleBatchUpdateStatus = async (status: string): Promise<void> => {
    batchLoading.value = true
    try {
      // TODO: 实现批量更新状态 API
      ElMessage.success('批量更新状态成功')
      batchDialog.value.visible = false
      selectedVehicles.value = []
      refreshList()
    } catch (error: unknown) {
      ElMessage.error('批量更新状态失败')
    } finally {
      batchLoading.value = false
    }
  }

  return {
    batchDialog,
    batchLoading,
    handleOpenBatchDialog,
    handleBatchDelete,
    handleBatchUpdateStatus,
  }
}
