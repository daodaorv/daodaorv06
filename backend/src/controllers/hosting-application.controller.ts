import { Request, Response } from 'express';
import { HostingApplicationDAO } from '../dao/hosting-application.dao';
import { RoleAssignmentService } from '../services/role-assignment.service';
import { BenefitDistributionService } from '../services/benefit-distribution.service';
import { logger } from '@utils/logger';

/**
 * 托管申请控制器
 */
export class HostingApplicationController {
  private hostingApplicationDAO: HostingApplicationDAO;
  private roleAssignmentService: RoleAssignmentService;
  private benefitDistributionService: BenefitDistributionService;

  constructor() {
    this.hostingApplicationDAO = new HostingApplicationDAO();
    this.roleAssignmentService = new RoleAssignmentService();
    this.benefitDistributionService = new BenefitDistributionService();
  }

  /**
   * 获取待审核的申请列表
   */
  getPendingApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.hostingApplicationDAO.getPendingApplications(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('获取待审核申请列表失败', { error });
      res.status(500).json({
        success: false,
        message: '获取待审核申请列表失败',
      });
    }
  };

  /**
   * 审核托管申请
   */
  reviewApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, reject_reason } = req.body;
      const reviewedBy = (req as any).user?.id;

      if (!reviewedBy) {
        res.status(401).json({
          success: false,
          message: '未授权',
        });
        return;
      }

      // 验证状态
      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          message: '无效的审核状态',
        });
        return;
      }

      // 如果是拒绝，必须提供拒绝原因
      if (status === 'rejected' && !reject_reason) {
        res.status(400).json({
          success: false,
          message: '拒绝申请必须提供原因',
        });
        return;
      }

      // 更新申请状态
      await this.hostingApplicationDAO.reviewApplication({
        id: parseInt(id),
        status,
        reviewedBy,
        rejectReason: reject_reason,
      });

      // 如果审核通过，触发角色自动分配
      if (status === 'approved') {
        const application = await this.hostingApplicationDAO.findById(parseInt(id));
        if (application) {
          // 分配托管车主角色
          await this.roleAssignmentService.assignHostingOwnerRole({
            userId: application.user_id,
            applicationId: parseInt(id),
          });

          // 发放欢迎权益
          await this.benefitDistributionService.distributeHostingWelcomeBenefits({
            userId: application.user_id,
            hostingVehicleId: parseInt(id),
          });
        }
      }

      res.json({
        success: true,
        message: status === 'approved' ? '审核通过' : '审核拒绝',
      });
    } catch (error) {
      logger.error('审核托管申请失败', { error });
      res.status(500).json({
        success: false,
        message: '审核失败',
      });
    }
  };
}
