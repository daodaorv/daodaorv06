import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ApiResponse, PaginationResponse, ListPageOptions } from '@/types/common'
import { isSuccessResponse, getErrorMessage } from '@/types/common'

/**
 * 列表页面通用逻辑 Composable
 *
 * @description 统一管理列表页面的搜索、分页、加载等逻辑，减少代码重复
 *
 * @example
 * ```ts
 * const {
 *   searchForm,
 *   list,
 *   loading,
 *   pagination,
 *   handleSearch,
 *   handleReset,
 *   handleSizeChange,
 *   handleCurrentChange,
 *   fetchList
 * } = useListPage(userApi.getUserList, {
 *   username: '',
 *   phone: '',
 *   status: ''
 * })
 * ```
 */
export function useListPage<T = unknown>(
  fetchFn: (params: unknown) => Promise<ApiResponse<PaginationResponse<T>>>,
  initialSearchForm: Record<string, unknown> = {},
  options: ListPageOptions<T> = {}
) {
  const { pageSize = 10, immediate = true, onSuccess, onError } = options

  // 搜索表单状态
  const searchForm = reactive({ ...initialSearchForm })

  // 列表数据
  const list = ref<T[]>([])

  // 加载状态
  const loading = ref(false)

  // 分页状态
  const pagination = reactive({
    page: 1,
    pageSize,
    total: 0,
  })

  // 是否有数据
  const hasData = computed(() => list.value.length > 0)

  // 是否为空
  const isEmpty = computed(() => !loading.value && list.value.length === 0)

  /**
   * 构建请求参数
   */
  const buildRequestParams = (): unknown => {
    return {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  /**
   * 更新列表数据
   */
  const updateListData = (data: PaginationResponse<T>): void => {
    list.value = data.list || data.items || data.data || []
    pagination.total = data.total || data.count || 0
  }

  /**
   * 重置列表状态
   */
  const resetListState = (): void => {
    list.value = []
    pagination.total = 0
  }

  /**
   * 处理成功响应
   */
  const handleFetchSuccess = (response: ApiResponse<PaginationResponse<T>>): void => {
    if (isSuccessResponse(response)) {
      updateListData(response.data)
      onSuccess?.(response.data)
    } else if (response.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      resetListState()
    } else {
      ElMessage.error(response.message || '获取列表失败')
      resetListState()
    }
  }

  /**
   * 处理错误响应
   */
  const handleFetchError = (error: unknown): void => {
    console.error('获取列表失败:', error)

    const errorMessage = getErrorMessage(error, '获取列表失败')
    ElMessage.error(errorMessage)

    resetListState()
    onError?.(error)
  }

  /**
   * 获取列表数据
   */
  const fetchList = async (): Promise<void> => {
    loading.value = true
    try {
      const params = buildRequestParams()
      const response = await fetchFn(params)
      handleFetchSuccess(response)
    } catch (error: unknown) {
      handleFetchError(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }

  /**
   * 重置处理
   */
  const handleReset = () => {
    // 重置搜索表单
    Object.keys(searchForm).forEach(key => {
      const value = initialSearchForm[key]
      if (Array.isArray(value)) {
        searchForm[key] = []
      } else if (typeof value === 'number') {
        searchForm[key] = 0
      } else if (typeof value === 'boolean') {
        searchForm[key] = false
      } else {
        searchForm[key] = ''
      }
    })

    // 重置分页
    pagination.page = 1

    // 重新获取数据
    fetchList()
  }

  /**
   * 每页条数变化处理
   */
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.page = 1
    fetchList()
  }

  /**
   * 当前页变化处理
   */
  const handleCurrentChange = (page: number) => {
    pagination.page = page
    fetchList()
  }

  /**
   * 刷新当前页
   */
  const refresh = () => {
    fetchList()
  }

  /**
   * 刷新并回到第一页
   */
  const refreshToFirst = () => {
    pagination.page = 1
    fetchList()
  }

  // 立即加载
  if (immediate) {
    fetchList()
  }

  return {
    // 状态
    searchForm,
    list,
    loading,
    pagination,
    hasData,
    isEmpty,

    // 方法
    fetchList,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    refresh,
    refreshToFirst,
  }
}
