import { QueryBuilder } from '@db/query-builder';
import { logger } from '@utils/logger';

/**
 * 分润数据访问对象
 */
export class ProfitSharingDAO {
  private tableName = 'profit_sharing_records';

  /**
   * 创建分润记录
   */
  async createRecord(data: {
    order_id: number;
    user_id: number;
    type: string;
    amount: number;
    status: string;
  }): Promise<number> {
    try {
      const sql = `
        INSERT INTO ${this.tableName} (order_id, user_id, type, amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const result = await QueryBuilder.execute(sql, [
        data.order_id,
        data.user_id,
        data.type,
        data.amount,
        data.status,
      ]);

      logger.info('分润记录创建成功', { id: result.insertId, ...data });
      return result.insertId;
    } catch (error) {
      logger.error('创建分润记录失败', { error, data });
      throw error;
    }
  }
}
