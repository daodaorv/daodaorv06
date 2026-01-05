import { Router } from 'express';
import { MembershipOrderController } from '../../controllers/membership-order.controller';

const router = Router();
const controller = new MembershipOrderController();

/**
 * 创建会员订单
 * POST /api/v1/membership-orders
 */
router.post('/', controller.createOrder);

/**
 * 获取订单详情
 * GET /api/v1/membership-orders/:orderNo
 */
router.get('/:orderNo', controller.getOrderDetail);

/**
 * 分页查询订单列表
 * GET /api/v1/membership-orders
 */
router.get('/', controller.getOrderList);

/**
 * 处理支付回调
 * POST /api/v1/membership-orders/payment-callback
 */
router.post('/payment-callback', controller.handlePaymentCallback);

export default router;
