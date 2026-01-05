import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import { UserConfig } from '../types/models/user-config.types';
import { logger } from '@utils/logger';

/**
 * 用户配置数据访问对象
 */
export class UserConfigDAO extends BaseDao<UserConfig> {
  constructor() {
    super('user_configs');
  }

  /**
   * 获取用户配置
   */
  async get(userId: number, configKey: string): Promise<string | null> {
    try {
      const sql = `SELECT config_value FROM ${this.tableName} WHERE user_id = ? AND config_key = ?`;
      const result = await QueryBuilder.queryOne<UserConfig>(sql, [userId, configKey]);
      return result?.config_value || null;
    } catch (error) {
      logger.error('获取用户配置失败:', error);
      throw error;
    }
  }

  /**
   * 设置用户配置（不存在则创建，存在则更新）
   */
  async set(userId: number, configKey: string, configValue: string): Promise<boolean> {
    try {
      const sql = `
        INSERT INTO ${this.tableName} (user_id, config_key, config_value)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)
      `;
      await QueryBuilder.insert(sql, [userId, configKey, configValue]);
      return true;
    } catch (error) {
      logger.error('设置用户配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户所有配置
   */
  async getUserConfigs(userId: number): Promise<UserConfig[]> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
      return await QueryBuilder.query<UserConfig>(sql, [userId]);
    } catch (error) {
      logger.error('获取用户所有配置失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户配置
   */
  async remove(userId: number, configKey: string): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE user_id = ? AND config_key = ?`;
      const result = await QueryBuilder.delete(sql, [userId, configKey]);
      return result > 0;
    } catch (error) {
      logger.error('删除用户配置失败:', error);
      throw error;
    }
  }
}
