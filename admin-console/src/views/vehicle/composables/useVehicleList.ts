import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as vehicleApi from '@/api/vehicle'
import { useListPage } from '@/composables/useListPage'
import type { ApiResponse, PaginationResponse } from '@/types/common'
import type { Vehicle } from '@/mock/vehicles'

/**
 * 车辆列表逻辑
 */
export function useVehicleList() {
  // 创建类型适配器函数
  const fetchVehicleList = async (params: unknown): Promise<ApiResponse<PaginationResponse<Vehicle>>> => {
    const response = await vehicleApi.getVehicles(params as any)
    return response as ApiResponse<PaginationResponse<Vehicle>>
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
  } = useListPage(fetchVehicleList, {
    vehicleNumber: '',
    modelName: '',
    status: '',
    ownershipType: '',
    storeId: '',
  })

  // 选中的车辆
  const selectedVehicles = ref<unknown[]>([])

  // 是否有选中项
  const hasSelection = computed(() => selectedVehicles.value.length > 0)

  /**
   * 处理选择变化
   */
  const handleSelectionChange = (selection: unknown[]): void => {
    selectedVehicles.value = selection
  }

  /**
   * 删除车辆
   */
  const handleDelete = async (vehicleId: number): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该车辆吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      await vehicleApi.deleteVehicle(vehicleId)
      ElMessage.success('删除成功')
      refresh()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  return {
    // 状态
    searchForm,
    list,
    loading,
    pagination,
    selectedVehicles,
    hasSelection,

    // 方法
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleDelete,
    refresh,
  }
}
