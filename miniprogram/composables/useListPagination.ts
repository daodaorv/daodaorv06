/**
 * 列表分页 Composable
 * 用于列表页面的分页加载、下拉刷新、上拉加载功能
 */

import { ref, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { logger } from '@/utils/logger'

interface UseListPaginationOptions<T> {
  /** 获取列表数据的 API 函数 */
  fetchApi: (params: { page: number; pageSize: number }) => Promise<{
    list: T[]
    total: number
    page: number
    pageSize: number
  }>
  /** 每页数量，默认 10 */
  pageSize?: number
  /** 是否自动加载第一页，默认 true */
  autoLoad?: boolean
  /** 额外的请求参数 */
  extraParams?: Record<string, unknown>
}

interface UseListPaginationReturn<T> {
  /** 列表数据 */
  list: ReturnType<typeof ref<T[]>>
  /** 当前页码 */
  page: ReturnType<typeof ref<number>>
  /** 总数量 */
  total: ReturnType<typeof ref<number>>
  /** 是否正在加载 */
  loading: ReturnType<typeof ref<boolean>>
  /** 是否正在刷新 */
  refreshing: ReturnType<typeof ref<boolean>>
  /** 是否还有更多数据 */
  hasMore: ReturnType<typeof computed<boolean>>
  /** 是否为空列表 */
  isEmpty: ReturnType<typeof computed<boolean>>
  /** 加载状态文本 */
  loadingText: ReturnType<typeof computed<string>>
  /** 加载第一页（刷新） */
  refresh: () => Promise<void>
  /** 加载更多 */
  loadMore: () => Promise<void>
  /** 重置列表 */
  reset: () => void
}

/**
 * 列表分页 Composable
 * @param options 配置选项
 * @returns 分页相关状态和方法
 *
 * @example
 * ```ts
 * const {
 *   list,
 *   loading,
 *   refreshing,
 *   hasMore,
 *   isEmpty,
 *   loadingText,
 *   refresh,
 *   loadMore
 * } = useListPagination({
 *   fetchApi: orderApi.getOrderList,
 *   pageSize: 10
 * })
 *
 * // 在模板中使用
 * <scroll-view @scrolltolower="loadMore">
 *   <view v-for="item in list" :key="item.id">{{ item.name }}</view>
 *   <view v-if="loading">{{ loadingText }}</view>
 *   <view v-if="isEmpty">暂无数据</view>
 * </scroll-view>
 * ```
 */
export function useListPagination<T>(options: UseListPaginationOptions<T>): UseListPaginationReturn<T> {
  const { fetchApi, pageSize = 10, autoLoad = true, extraParams = {} } = options

  const list = ref<T[]>([]) as ReturnType<typeof ref<T[]>>
  const page = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const refreshing = ref(false)

  // 是否还有更多数据
  const hasMore = computed(() => {
    return list.value.length < total.value
  })

  // 是否为空列表
  const isEmpty = computed(() => {
    return !loading.value && !refreshing.value && list.value.length === 0
  })

  // 加载状态文本
  const loadingText = computed(() => {
    if (refreshing.value) return '刷新中...'
    if (loading.value) return '加载中...'
    if (!hasMore.value && list.value.length > 0) return '没有更多了'
    return ''
  })

  /**
   * 加载数据
   */
  const fetchData = async (isRefresh: boolean = false): Promise<void> => {
    if (loading.value || refreshing.value) return

    const currentPage = isRefresh ? 1 : page.value

    try {
      if (isRefresh) {
        refreshing.value = true
      } else {
        loading.value = true
      }

      const result = await fetchApi({
        page: currentPage,
        pageSize,
        ...extraParams
      })

      if (isRefresh) {
        list.value = result.list
      } else {
        list.value = [...list.value, ...result.list]
      }

      total.value = result.total
      page.value = currentPage + 1
    } catch (error) {
      logger.error('加载列表失败', error)
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  /**
   * 刷新列表
   */
  const refresh = async (): Promise<void> => {
    await fetchData(true)
  }

  /**
   * 加载更多
   */
  const loadMore = async (): Promise<void> => {
    if (!hasMore.value) return
    await fetchData(false)
  }

  /**
   * 重置列表
   */
  const reset = (): void => {
    list.value = []
    page.value = 1
    total.value = 0
    loading.value = false
    refreshing.value = false
  }

  // 监听下拉刷新
  onPullDownRefresh(async () => {
    await refresh()
    uni.stopPullDownRefresh()
  })

  // 监听上拉加载
  onReachBottom(() => {
    loadMore()
  })

  // 自动加载第一页
  if (autoLoad) {
    refresh()
  }

  return {
    list,
    page,
    total,
    loading,
    refreshing,
    hasMore,
    isEmpty,
    loadingText,
    refresh,
    loadMore,
    reset
  }
}

export default useListPagination
