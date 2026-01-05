import { Router } from 'express';
import { HostingApplicationController } from '../../controllers/hosting-application.controller';

const router = Router();
const controller = new HostingApplicationController();

/**
 * 获取待审核的托管申请列表
 * GET /api/v1/hosting-applications/pending
 */
router.get('/pending', controller.getPendingApplications);

/**
 * 审核托管申请
 * POST /api/v1/hosting-applications/:id/review
 */
router.post('/:id/review', controller.reviewApplication);

export default router;
