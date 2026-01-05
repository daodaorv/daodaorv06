import { HostingApplicationDAO } from '../dao/hosting-application.dao';
import { UserRoleDAO } from '../dao/user-role.dao';
import { RoleDAO } from '../dao/role.dao';
import { logger } from '@utils/logger';

/**
 * 角色自动分配服务
 */
export class RoleAssignmentService {
  private hostingApplicationDAO: HostingApplicationDAO;
  private userRoleDAO: UserRoleDAO;
  private roleDAO: RoleDAO;

  constructor() {
    this.hostingApplicationDAO = new HostingApplicationDAO();
    this.userRoleDAO = new UserRoleDAO();
    this.roleDAO = new RoleDAO();
  }

  /**
   * 为托管车主分配角色
   */
  async assignHostingOwnerRole(data: {
    userId: number;
    applicationId: number;
  }): Promise<void> {
    try {
      logger.info('开始为托管车主分配角色', { userId: data.userId, applicationId: data.applicationId });

      // 1. 获取申请详情
      const application = await this.hostingApplicationDAO.findById(data.applicationId);
      if (!application) {
        throw new Error('托管申请不存在');
      }

      // 2. 检查用户是否已有托管车主角色
      const hasRole = await this.userRoleDAO.hasRole(data.userId, 'hosting_owner');
      if (!hasRole) {
        // 获取托管车主角色
        const hostingOwnerRole = await this.roleDAO.findByCode('hosting_owner');
        if (!hostingOwnerRole) {
          throw new Error('托管车主角色不存在，请先在系统中创建该角色');
        }

        // 分配角色
        await this.userRoleDAO.assignRole({
          user_id: data.userId,
          role_id: hostingOwnerRole.id,
          granted_by: null, // 系统自动分配
          expires_at: null, // 永久有效
        });

        logger.info('托管车主角色分配成功', { userId: data.userId, roleId: hostingOwnerRole.id });
      }

      logger.info('托管车主角色分配流程完成', { userId: data.userId });
    } catch (error) {
      logger.error('托管车主角色分配失败', { error, userId: data.userId, applicationId: data.applicationId });
      throw error;
    }
  }
}
