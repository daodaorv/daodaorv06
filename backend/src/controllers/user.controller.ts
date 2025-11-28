import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { UserService } from '@/services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get current user profile
   * GET /api/v1/users/profile
   */
  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const result = await this.userService.getUserProfile(userId);

      // Remove password_hash from response
      const userResponse = result.user.toJSON();
      delete (userResponse as any).password_hash;

      res.json({
        code: 0,
        message: 'Success',
        data: {
          user: userResponse,
          profile: result.profile,
        },
      });
    } catch (error: any) {
      res.status(404).json({
        code: 404001,
        message: error.message || 'User not found',
        data: null,
      });
    }
  };

  /**
   * Update current user profile
   * PUT /api/v1/users/profile
   */
  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const updateData = req.body;

      const result = await this.userService.updateUserProfile(
        userId,
        updateData
      );

      // Remove password_hash from response
      const userResponse = result.user.toJSON();
      delete (userResponse as any).password_hash;

      res.json({
        code: 0,
        message: 'Profile updated successfully',
        data: {
          user: userResponse,
          profile: result.profile,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400004,
        message: error.message || 'Failed to update profile',
        data: null,
      });
    }
  };

  /**
   * Get user login logs
   * GET /api/v1/users/login-logs
   */
  getLoginLogs = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;

      const logs = await this.userService.getUserLoginLogs(userId, limit);

      res.json({
        code: 0,
        message: 'Success',
        data: logs,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400005,
        message: error.message || 'Failed to get login logs',
        data: null,
      });
    }
  };

  /**
   * Get all users (admin only)
   * GET /api/v1/users
   */
  getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        status: req.query.status as any,
        userType: req.query.userType as any,
        search: req.query.search as string,
      };

      const result = await this.userService.getAllUsers(params);

      res.json({
        code: 0,
        message: 'Success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400006,
        message: error.message || 'Failed to get users',
        data: null,
      });
    }
  };

  /**
   * Update user status (admin only)
   * PUT /api/v1/users/:id/status
   */
  updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id!);
      const { status } = req.body;

      const user = await this.userService.updateUserStatus(userId, status);

      // Remove password_hash from response
      const userResponse = user.toJSON();
      delete (userResponse as any).password_hash;

      res.json({
        code: 0,
        message: 'User status updated successfully',
        data: userResponse,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400007,
        message: error.message || 'Failed to update user status',
        data: null,
      });
    }
  };

  /**
   * Get user detail by ID (admin only)
   * GET /api/v1/users/:id
   */
  getUserById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id!);
      const result = await this.userService.getUserProfile(userId);

      // Remove password_hash from response
      const userResponse = result.user.toJSON();
      delete (userResponse as any).password_hash;

      res.json({
        code: 0,
        message: 'Success',
        data: {
          user: userResponse,
          profile: result.profile,
        },
      });
    } catch (error: any) {
      res.status(404).json({
        code: 404001,
        message: error.message || 'User not found',
        data: null,
      });
    }
  };

  /**
   * Create new user (admin only)
   * POST /api/v1/users
   */
  createUser = async (req: AuthRequest, res: Response) => {
    try {
      const { username, phone, password, email, userType, realName } = req.body;

      const result = await this.userService.createUser({
        username,
        phone,
        password,
        email,
        user_type: userType,
        real_name: realName,
      });

      // Remove password_hash from response
      const userResponse = result.user.toJSON();
      delete (userResponse as any).password_hash;

      res.status(201).json({
        code: 0,
        message: 'User created successfully',
        data: {
          user: userResponse,
          profile: result.profile,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400008,
        message: error.message || 'Failed to create user',
        data: null,
      });
    }
  };

  /**
   * Update user (admin only)
   * PUT /api/v1/users/:id
   */
  updateUser = async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id!);
      const { username, email, userType, realName, status } = req.body;

      const user = await this.userService.updateUser(userId, {
        username,
        email,
        user_type: userType,
        real_name: realName,
        status,
      });

      // Remove password_hash from response
      const userResponse = user.toJSON();
      delete (userResponse as any).password_hash;

      res.json({
        code: 0,
        message: 'User updated successfully',
        data: userResponse,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400009,
        message: error.message || 'Failed to update user',
        data: null,
      });
    }
  };

  /**
   * Delete user (admin only)
   * DELETE /api/v1/users/:id
   */
  deleteUser = async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id!);
      await this.userService.deleteUser(userId);

      res.json({
        code: 0,
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400010,
        message: error.message || 'Failed to delete user',
        data: null,
      });
    }
  };

  /**
   * Reset user password (admin only)
   * PUT /api/v1/users/:id/reset-password
   */
  resetUserPassword = async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id!);
      const { password } = req.body;

      await this.userService.resetPassword(userId, password);

      res.json({
        code: 0,
        message: 'Password reset successfully',
        data: null,
      });
    } catch (error: any) {
      res.status(400).json({
        code: 400011,
        message: error.message || 'Failed to reset password',
        data: null,
      });
    }
  };
}

