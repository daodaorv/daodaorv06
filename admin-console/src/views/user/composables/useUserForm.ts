import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'

/**
 * 用户表单对话框状态
 */
interface UserFormDialog {
  visible: boolean
  user: unknown | null
}

/**
 * 用户表单逻辑
 */
export function useUserForm(refreshList: () => void) {
  // 对话框状态
  const formDialog = ref<UserFormDialog>({
    visible: false,
    user: null,
  })

  // 表单数据
  const formData = ref({
    id: 0,
    username: '',
    phone: '',
    email: '',
    password: '',
    realName: '',
    status: 'active',
  })

  // 提交加载状态
  const submitLoading = ref(false)

  // 是否为编辑模式
  const isEdit = computed(() => !!formData.value.id)

  // 对话框标题
  const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

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
  const handleEdit = (user: unknown): void => {
    const userData = user as { id: number; username: string; phone: string; email: string; realName: string; status: string }
    formData.value = {
      id: userData.id,
      username: userData.username,
      phone: userData.phone,
      email: userData.email || '',
      password: '',
      realName: userData.realName || '',
      status: userData.status,
    }
    formDialog.value.user = user
    formDialog.value.visible = true
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await userApi.updateUser({
          id: formData.value.id,
          username: formData.value.username,
          email: formData.value.email,
          userType: 'customer',
          status: formData.value.status as 'active' | 'inactive' | 'banned',
          realName: formData.value.realName,
        })
        ElMessage.success('更新成功')
      } else {
        await userApi.createUser({
          username: formData.value.username,
          phone: formData.value.phone,
          password: formData.value.password,
          email: formData.value.email,
          userType: 'customer',
          realName: formData.value.realName,
        })
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
      username: '',
      phone: '',
      email: '',
      password: '',
      realName: '',
      status: 'active',
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
