/**
 * Mock服务基础类
 * 提供统一的Mock数据返回和延迟模拟
 */

import { mockDelay } from '@/mock/config';

export class MockService {
  /**
   * 模拟成功响应
   */
  static async success<T>(data: T, delay: number = 300): Promise<T> {
    await mockDelay(delay);
    return data;
  }

  /**
   * 模拟失败响应
   */
  static async error(message: string, code: number = 500, delay: number = 300): Promise<never> {
    await mockDelay(delay);
    throw new Error(`[Mock Error ${code}] ${message}`);
  }

  /**
   * 模拟分页响应
   */
  static async paginate<T>(
    data: T[],
    page: number = 1,
    pageSize: number = 10,
    delay: number = 300
  ) {
    await mockDelay(delay);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      list: data.slice(start, end),
      total: data.length,
      page,
      pageSize,
      hasMore: end < data.length
    };
  }
}
