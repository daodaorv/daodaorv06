import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import { UserWallet, WalletTransaction } from '../types/models/wallet.types';
import { RowDataPacket } from 'mysql2';

/**
 * 用户钱包 DAO
 */
export class UserWalletDAO extends BaseDao<UserWallet> {
  constructor() {
    super('user_wallets');
  }

  /**
   * 获取用户钱包信息
   */
  async getUserWallet(userId: number): Promise<UserWallet | null> {
    return await QueryBuilder.queryOne<UserWallet>(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    );
  }

  /**
   * 获取用户钱包交易记录
   */
  async getTransactions(params: {
    userId: number;
    page: number;
    pageSize: number;
    type?: string;
  }): Promise<{ list: WalletTransaction[]; total: number }> {
    const { userId, page, pageSize, type } = params;
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions = ['user_id = ?'];
    const values: any[] = [userId];

    if (type) {
      conditions.push('type = ?');
      values.push(type);
    }

    const whereClause = conditions.join(' AND ');

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM wallet_transactions WHERE ${whereClause}`;
    const countResult = await QueryBuilder.query<RowDataPacket & { total: number }>(countSql, values);
    const total = countResult[0]?.total || 0;

    // 查询列表
    const listSql = `
      SELECT * FROM wallet_transactions
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await QueryBuilder.query<WalletTransaction>(listSql, [...values, pageSize, offset]);

    return { list, total };
  }

  /**
   * 钱包充值
   */
  async recharge(params: {
    userId: number;
    amount: number;
    description?: string;
  }): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    const { userId, amount, description } = params;

    // 获取或创建钱包
    let wallet = await this.getUserWallet(userId);
    if (!wallet) {
      // 如果钱包不存在,创建新钱包
      const insertSql = `INSERT INTO ${this.tableName} (user_id, balance, frozen_balance, total_income, total_expense) VALUES (?, 0, 0, 0, 0)`;
      await QueryBuilder.insert(insertSql, [userId]);
      wallet = await this.getUserWallet(userId);
      if (!wallet) {
        throw new Error('创建钱包失败');
      }
    }

    // 更新钱包余额
    const newBalance = Number(wallet.balance) + amount;
    const newTotalIncome = Number(wallet.total_income) + amount;
    const updateSql = `UPDATE ${this.tableName} SET balance = ?, total_income = ? WHERE user_id = ?`;
    await QueryBuilder.update(updateSql, [newBalance, newTotalIncome, userId]);

    // 创建交易记录
    const transactionSql = `
      INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance, description)
      VALUES (?, ?, 'recharge', ?, ?, ?)
    `;
    const result = await QueryBuilder.insert(transactionSql, [
      wallet.id,
      userId,
      amount,
      newBalance,
      description || '钱包充值',
    ]);

    // 获取更新后的钱包信息
    const updatedWallet = await this.getUserWallet(userId);
    if (!updatedWallet) {
      throw new Error('获取钱包信息失败');
    }

    // 获取交易记录
    const transaction = await QueryBuilder.queryOne<WalletTransaction>(
      'SELECT * FROM wallet_transactions WHERE id = ?',
      [result.insertId]
    );
    if (!transaction) {
      throw new Error('获取交易记录失败');
    }

    return { wallet: updatedWallet, transaction };
  }
}
