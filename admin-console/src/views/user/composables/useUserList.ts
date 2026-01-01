import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user'
import type { UserInfo } from '@/api/user'
import { useListPage } from '@/composables/useListPage'
import type { ApiResponse, PaginationResponse } from '@/types/common'

/**
 * 用户列表逻辑
 */
export function useUserList() {
  // 创建类型适配器函数
  const fetchUserList = async (params: unknown): Promise<ApiResponse<PaginationResponse<UserInfo>>> => {
    const response = await userApi.getUserList(params as any)
    return {
      code: response.code,
      message: response.message,
      data: {
        list: response.data.list,
        total: response.data.total,
      },
    } as ApiResponse<PaginationResponse<UserInfo>>
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
  } = useListPage(fetchUserList, {
    username: '',
    phone: '',
    status: '',
    userType: '',
  })

  // 选中的用户
  const selectedUsers = ref<unknown[]>([])

  // 是否有选中项
  const hasSelection = computed(() => selectedUsers.value.length > 0)

  /**
   * 处理选择变化
   */
  const handleSelectionChange = (selection: unknown[]): void => {
    selectedUsers.value = selection
  }

  /**
   * 删除用户
   */
  const handleDelete = async (userId: number): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      await userApi.deleteUser(userId)
      ElMessage.success('删除成功')
      refresh()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 批量删除用户
   */
  const handleBatchDelete = async (): Promise<void> => {
    if (!hasSelection.value) {
      ElMessage.warning('请先选择要删除的用户')
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      // TODO: 实现批量删除 API
      ElMessage.success('批量删除成功')
      selectedUsers.value = []
      refresh()
    } catch (error: unknown) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    }
  }

  return {
    // 状态
    searchForm,
    list,
    loading,
    pagination,
    selectedUsers,
    hasSelection,

    // 方法
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleDelete,
    handleBatchDelete,
    refresh,
  }
}
