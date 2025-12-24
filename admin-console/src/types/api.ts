/**
 * API 响应通用类型
 */

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ApiListResponse<T = any> {
  code: number
  message: string
  data: {
    list: T[]
    total: number
    page: number
    pageSize: number
  }
}
