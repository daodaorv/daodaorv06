/**
 * 通用类型定义
 */

/**
 * API响应基础接口
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string
  thumbnail?: string
}

/**
 * 地理位置
 */
export interface Location {
  latitude: number
  longitude: number
  address?: string
}

/**
 * 时间范围
 */
export interface TimeRange {
  start: string
  end: string
}

/**
 * 键值对
 */
export interface KeyValue<T = string> {
  key: string
  value: T
}

/**
 * 选项
 */
export interface Option<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * 树形节点
 */
export interface TreeNode<T = unknown> {
  id: string
  label: string
  children?: TreeNode<T>[]
  data?: T
}
