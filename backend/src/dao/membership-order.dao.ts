import { QueryBuilder } from '@db/query-builder';
import { logger } from '@utils/logger';
import type {
  MembershipOrder,
  CreateMembershipOrderParams,
  UpdatePaymentStatusParams,
  MembershipOrderStatus,
  PaymentStatus,
} from '../types/models/membership-order.types';

/**
 * 会员订单数据访问对象
 */
export class MembershipOrderDAO {
  private tableName = 'membership_orders';

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `MEM${timestamp}${random}`;
  }

  /**
   * 创建会员订单
   */
  async createOrder(params: CreateMembershipOrderParams): Promise<string> {
    try {
      const orderNo = this.generateOrderNo();

      const sql = `
        INSERT INTO ${this.tableName}
        (order_no, user_id, membership_level, duration, original_price,
         discount_amount, actual_amount, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await QueryBuilder.insert(sql, [
        orderNo,
        params.user_id,
        params.membership_level,
        params.duration,
        params.original_price,
        params.discount_amount || 0,
        params.actual_amount,
        params.remark || null,
      ]);

      logger.info('会员订单创建成功', { orderNo, userId: params.user_id });
      return orderNo;
    } catch (error) {
      logger.error('创建会员订单失败', { error, params });
      throw error;
    }
  }

  /**
   * 根据订单号查询订单
   */
  async findByOrderNo(orderNo: string): Promise<MembershipOrder | null> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE order_no = ?`;
      const result = await QueryBuilder.queryOne<any>(sql, [orderNo]);
      return result || null;
    } catch (error) {
      logger.error('查询会员订单失败', { error, orderNo });
      throw error;
    }
  }

  /**
   * 更新订单支付状态
   */
  async updatePaymentStatus(params: UpdatePaymentStatusParams): Promise<boolean> {
    try {
      const sql = `
        UPDATE ${this.tableName}
        SET payment_status = ?,
            payment_method = ?,
            paid_at = ?,
            status = CASE
              WHEN ? = 'paid' THEN 'completed'
              ELSE status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE order_no = ?
      `;

      await QueryBuilder.update(sql, [
        params.payment_status,
        params.payment_method || null,
        params.paid_at || null,
        params.payment_status,
        params.order_no,
      ]);

      logger.info('订单支付状态更新成功', { orderNo: params.order_no });
      return true;
    } catch (error) {
      logger.error('更新订单支付状态失败', { error, params });
      throw error;
    }
  }

  /**
   * 查询用户的会员订单列表
   */
  async findByUserId(userId: number): Promise<MembershipOrder[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      return await QueryBuilder.query<any>(sql, [userId]);
    } catch (error) {
      logger.error('查询用户会员订单失败', { error, userId });
      throw error;
    }
  }

  /**
   * 分页查询订单列表
   */
  async findAll(params: {
    page: number;
    limit: number;
    status?: MembershipOrderStatus;
    payment_status?: PaymentStatus;
  }): Promise<{ list: MembershipOrder[]; total: number }> {
    try {
      const offset = (params.page - 1) * params.limit;
      const conditions: string[] = [];
      const values: any[] = [];

      if (params.status) {
        conditions.push('status = ?');
        values.push(params.status);
      }

      if (params.payment_status) {
        conditions.push('payment_status = ?');
        values.push(params.payment_status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const listSql = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [countResult, list] = await Promise.all([
        QueryBuilder.query<any>(countSql, values),
        QueryBuilder.query<any>(listSql, [...values, params.limit, offset]),
      ]);

      return {
        list,
        total: countResult[0]?.total || 0,
      };
    } catch (error) {
      logger.error('分页查询会员订单失败', { error, params });
      throw error;
    }
  }
}
