/**
 * 会员权益配置相关类型定义
 */
import { RowDataPacket } from 'mysql2/promise';

/**
 * 会员等级枚举
 */
export type MembershipLevel = 'silver' | 'gold' | 'platinum';

/**
 * 权益类型枚举
 */
export type BenefitType = 'coupon' | 'discount' | 'promotion_rate' | 'hosting_welcome';

/**
 * 会员权益配置接口
 */
export interface MembershipBenefitConfig extends RowDataPacket {
  id: number;
  membership_level: MembershipLevel;
  benefit_type: BenefitType;
  benefit_value: any; // JSON 类型
  description?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建会员权益配置参数
 */
export interface CreateMembershipBenefitConfigParams {
  membership_level: MembershipLevel;
  benefit_type: BenefitType;
  benefit_value: any;
  description?: string;
  status?: 'active' | 'inactive';
}
