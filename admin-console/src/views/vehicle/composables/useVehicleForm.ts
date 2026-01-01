import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as vehicleApi from '@/api/vehicle'

/**
 * 车辆表单对话框状态
 */
interface VehicleFormDialog {
  visible: boolean
  vehicle: unknown | null
}

/**
 * 车辆表单逻辑
 */
export function useVehicleForm(refreshList: () => void) {
  // 对话框状态
  const formDialog = ref<VehicleFormDialog>({
    visible: false,
    vehicle: null,
  })

  // 表单数据
  const formData = ref({
    id: 0,
    vehicleNumber: '',
    modelId: 0,
    modelName: '',
    ownershipType: 'platform',
    storeId: 0,
    status: 'available',
    purchaseDate: '',
    mileage: 0,
    insuranceExpiry: '',
    maintenanceExpiry: '',
  })

  // 提交加载状态
  const submitLoading = ref(false)

  // 是否为编辑模式
  const isEdit = computed(() => !!formData.value.id)

  // 对话框标题
  const dialogTitle = computed(() => (isEdit.value ? '编辑车辆' : '新增车辆'))

  /**
   * 打开新增对话框
   */
  const handleCreate = (): void => {
    resetForm()
    formDialog.value.visible = true
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (vehicle: unknown): void => {
    const vehicleData = vehicle as {
      id: number
      vehicleNumber: string
      modelId: number
      modelName: string
      ownershipType: string
      storeId: number
      status: string
      purchaseDate: string
      mileage: number
      insuranceExpiry: string
      maintenanceExpiry: string
    }

    formData.value = {
      id: vehicleData.id,
      vehicleNumber: vehicleData.vehicleNumber,
      modelId: vehicleData.modelId,
      modelName: vehicleData.modelName,
      ownershipType: vehicleData.ownershipType,
      storeId: vehicleData.storeId,
      status: vehicleData.status,
      purchaseDate: vehicleData.purchaseDate || '',
      mileage: vehicleData.mileage || 0,
      insuranceExpiry: vehicleData.insuranceExpiry || '',
      maintenanceExpiry: vehicleData.maintenanceExpiry || '',
    }

    formDialog.value.vehicle = vehicle
    formDialog.value.visible = true
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await vehicleApi.updateVehicle(formData.value.id, formData.value as any)
        ElMessage.success('更新成功')
      } else {
        await vehicleApi.createVehicle(formData.value as any)
        ElMessage.success('创建成功')
      }
      formDialog.value.visible = false
      refreshList()
    } catch (error: unknown) {
      const message = isEdit.value ? '更新失败' : '创建失败'
      ElMessage.error(message)
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 重置表单
   */
  const resetForm = (): void => {
    formData.value = {
      id: 0,
      vehicleNumber: '',
      modelId: 0,
      modelName: '',
      ownershipType: 'platform',
      storeId: 0,
      status: 'available',
      purchaseDate: '',
      mileage: 0,
      insuranceExpiry: '',
      maintenanceExpiry: '',
    }
  }

  return {
    formDialog,
    formData,
    submitLoading,
    isEdit,
    dialogTitle,
    handleCreate,
    handleEdit,
    handleSubmit,
  }
}
