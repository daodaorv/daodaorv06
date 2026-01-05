import { Request, Response } from 'express';
import { MembershipBenefitConfigDAO } from '../dao/membership-benefit-config.dao';
import { logger } from '@utils/logger';

/**
 * 会员权益配置控制器
 */
export class BenefitConfigController {
  private benefitConfigDAO: MembershipBenefitConfigDAO;

  constructor() {
    this.benefitConfigDAO = new MembershipBenefitConfigDAO();
  }

  /**
   * 获取所有权益配置列表
   */
  getAllConfigs = async (_req: Request, res: Response): Promise<void> => {
    try {
      const configs = await this.benefitConfigDAO.findAll();

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      logger.error('获取权益配置列表失败', { error });
      res.status(500).json({
        success: false,
        message: '获取权益配置列表失败',
      });
    }
  };

  /**
   * 获取指定会员等级的权益配置
   */
  getMembershipBenefits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { level } = req.params;
      const configs = await this.benefitConfigDAO.getMembershipBenefits(level as any);

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      logger.error('获取会员权益配置失败', { error });
      res.status(500).json({
        success: false,
        message: '获取会员权益配置失败',
      });
    }
  };

  /**
   * 创建权益配置
   */
  createConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membership_level, benefit_type, benefit_value, description } = req.body;

      const configId = await this.benefitConfigDAO.createConfig({
        membership_level,
        benefit_type,
        benefit_value,
        description,
      });

      res.json({
        success: true,
        data: { id: configId },
        message: '权益配置创建成功',
      });
    } catch (error) {
      logger.error('创建权益配置失败', { error });
      res.status(500).json({
        success: false,
        message: '创建权益配置失败',
      });
    }
  };
}
