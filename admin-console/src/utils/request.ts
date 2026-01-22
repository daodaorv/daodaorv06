import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: unknown) => {
    if (error instanceof Error) {
      console.error('请求错误:', error.message)
    } else {
      console.error('请求错误:', error)
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message } = response.data

    // 请求成功
    if (code === 200 || code === 0) {
      return response.data
    }

    // 业务错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  async (error: unknown) => {
    // 类型守卫：检查是否为 Axios 错误
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { status: number; data?: { code?: number; message?: string } } }
      const { response } = axiosError

      if (response) {
        const { status, data } = response

        switch (status) {
          case 401: {
            // 未授权，清除登录信息并跳转到登录页
            const userStore = useUserStore()

            if (data?.code === 401001) {
              // Token过期
              ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning',
              }).then(() => {
                userStore.logout()
                router.push('/login')
              })
            } else {
              // 未登录或权限不足
              userStore.logout()
              router.push('/login')
            }
            break
          }

          case 403:
            ElMessage.error('权限不足')
            break

          case 404:
            ElMessage.error('请求的资源不存在')
            break

          case 500:
            ElMessage.error('服务器内部错误')
            break

          default:
            ElMessage.error(data?.message || `请求失败 (${status})`)
        }
      }
    } else if (typeof error === 'object' && error !== null && 'code' in error) {
      const codeError = error as { code: string }
      if (codeError.code === 'ECONNABORTED') {
        ElMessage.error('请求超时')
      } else {
        ElMessage.error('网络异常')
      }
    } else {
      ElMessage.error('网络异常')
    }

    return Promise.reject(error)
  }
)

/**
 * GET 请求
 */
export const get = <T = unknown>(
  url: string,
  params?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.get(url, { ...config, params })
}

/**
 * POST 请求
 */
export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, data, config)
}

/**
 * PUT 请求
 */
export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.put(url, data, config)
}

/**
 * DELETE 请求
 */
export const del = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.delete(url, config)
}

/**
 * 文件上传
 */
export const upload = <T = unknown>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 保留旧的 request 对象以兼容现有代码（将逐步废弃）
 * @deprecated 请使用直接导出的 get, post, put, del, upload 方法
 */
export const request = {
  get,
  post,
  put,
  delete: del,
  upload,
}

export default service
