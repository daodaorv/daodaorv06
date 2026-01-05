import { Router } from 'express';
import { BenefitConfigController } from '../../controllers/benefit-config.controller';

const router = Router();
const controller = new BenefitConfigController();

/**
 * 获取所有权益配置
 * GET /api/v1/benefit-configs
 */
router.get('/', controller.getAllConfigs);

/**
 * 获取指定会员等级的权益配置
 * GET /api/v1/benefit-configs/membership/:level
 */
router.get('/membership/:level', controller.getMembershipBenefits);

/**
 * 创建权益配置
 * POST /api/v1/benefit-configs
 */
router.post('/', controller.createConfig);

export default router;
