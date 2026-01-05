/**
 * 用户配置相关类型定义
 */
import { RowDataPacket } from 'mysql2/promise';

/**
 * 用户配置接口
 */
export interface UserConfig extends RowDataPacket {
  id: number;
  user_id: number;
  config_key: string;
  config_value: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建用户配置参数
 */
export interface CreateUserConfigParams {
  user_id: number;
  config_key: string;
  config_value: string;
}

/**
 * 更新用户配置参数
 */
export interface UpdateUserConfigParams {
  user_id: number;
  config_key: string;
  config_value: string;
}
