import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate, authorize } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { updateProfileSchema } from '@/validators/auth.validator';

const router = Router();
const userController = new UserController();

// Get current user profile (requires authentication)
router.get('/profile', authenticate, userController.getProfile);

// Update current user profile (requires authentication)
router.put(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  userController.updateProfile
);

// Get user login logs (requires authentication)
router.get('/login-logs', authenticate, userController.getLoginLogs);

// Get all users (admin only)
router.get(
  '/',
  authenticate,
  authorize('pc_admin', 'mobile_admin'),
  userController.getAllUsers
);

// Get user detail by ID (admin only)
router.get(
  '/:id',
  authenticate,
  authorize('pc_admin', 'mobile_admin'),
  userController.getUserById
);

// Create new user (admin only)
router.post(
  '/',
  authenticate,
  authorize('pc_admin'),
  userController.createUser
);

// Update user (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('pc_admin'),
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('pc_admin'),
  userController.deleteUser
);

// Update user status (admin only)
router.put(
  '/:id/status',
  authenticate,
  authorize('pc_admin'),
  userController.updateUserStatus
);

// Reset user password (admin only)
router.put(
  '/:id/reset-password',
  authenticate,
  authorize('pc_admin'),
  userController.resetUserPassword
);

export default router;

