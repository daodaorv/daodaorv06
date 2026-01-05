import { BaseDao } from './base.dao';
import { QueryBuilder } from '@db/query-builder';
import {
  MembershipBenefitConfig,
  CreateMembershipBenefitConfigParams,
  MembershipLevel,
  BenefitType,
} from '../types/models/membership-benefit.types';
import { logger } from '@utils/logger';

/**
 * 会员权益配置数据访问对象
 */
export class MembershipBenefitConfigDAO extends BaseDao<MembershipBenefitConfig> {
  constructor() {
    super('membership_benefit_configs');
  }

  /**
   * 获取指定会员等级和权益类型的配置
   */
  async getConfig(
    membershipLevel: MembershipLevel,
    benefitType: BenefitType
  ): Promise<MembershipBenefitConfig | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE membership_level = ? AND benefit_type = ? AND status = 'active'
        LIMIT 1
      `;
      return await QueryBuilder.queryOne<MembershipBenefitConfig>(sql, [membershipLevel, benefitType]);
    } catch (error) {
      logger.error('获取会员权益配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定会员等级的所有权益配置
   */
  async getMembershipBenefits(membershipLevel: MembershipLevel): Promise<MembershipBenefitConfig[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE membership_level = ? AND status = 'active'
      `;
      return await QueryBuilder.query<MembershipBenefitConfig>(sql, [membershipLevel]);
    } catch (error) {
      logger.error('获取会员权益列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取托管欢迎权益配置
   */
  async getHostingWelcomeBenefits(): Promise<MembershipBenefitConfig[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE benefit_type = 'hosting_welcome' AND status = 'active'
      `;
      return await QueryBuilder.query<MembershipBenefitConfig>(sql);
    } catch (error) {
      logger.error('获取托管欢迎权益失败:', error);
      throw error;
    }
  }

  /**
   * 创建权益配置
   */
  async createConfig(params: CreateMembershipBenefitConfigParams): Promise<number> {
    try {
      const sql = `
        INSERT INTO ${this.tableName}
        (membership_level, benefit_type, benefit_value, description, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await QueryBuilder.insert(sql, [
        params.membership_level,
        params.benefit_type,
        JSON.stringify(params.benefit_value),
        params.description || null,
        params.status || 'active',
      ]);
      return result.insertId;
    } catch (error) {
      logger.error('创建会员权益配置失败:', error);
      throw error;
    }
  }
}
