import { Router } from 'express';
import { CouponController } from '../controllers/coupon';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const couponController = new CouponController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 优惠券ID
 *         name:
 *           type: string
 *           description: 优惠券名称
 *         description:
 *           type: string
 *           description: 优惠券描述
 *         type:
 *           type: string
 *           enum: [fixed, percentage]
 *           description: 优惠券类型
 *         discount:
 *           type: number
 *           description: 优惠金额/折扣比例
 *         minAmount:
 *           type: number
 *           description: 最低使用金额
 *         maxDiscount:
 *           type: number
 *           description: 最大优惠金额
 *         totalQuantity:
 *           type: integer
 *           description: 总发放数量
 *         perUserLimit:
 *           type: integer
 *           description: 每人限领数量
 *         validDays:
 *           type: integer
 *           description: 有效天数
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: 有效开始时间
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: 有效��束时间
 *         isActive:
 *           type: boolean
 *           description: 是否激活
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCoupon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户优惠券ID
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         couponId:
 *           type: integer
 *           description: 优惠券模板ID
 *         couponCode:
 *           type: string
 *           description: 优惠券码
 *         status:
 *           type: string
 *           enum: [unused, used, expired, cancelled]
 *           description: 状态
 *         usedAt:
 *           type: string
 *           format: date-time
 *           description: 使用时间
 *         usedOrderId:
 *           type: integer
 *           description: 使用的订单ID
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: 有效开始时间
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: 有效结束时间
 *         obtainedAt:
 *           type: string
 *           format: date-time
 *           description: 获取时间
 *         obtainSource:
 *           type: string
 *           enum: [register, activity, purchase, gift, admin]
 *           description: 获取来源
 *         coupon:
 *           $ref: '#/components/schemas/Coupon'
 */

// 获取可用优惠券列表
router.get('/available',
  authMiddleware.authenticate,
  [
    query('orderAmount').optional().isDecimal().withMessage('订单金额格式不正确'),
    query('vehicleId').optional().isInt({ min: 1 }).withMessage('车辆ID必须是正整数'),
    query('category').optional().isLength({ max: 50 }).withMessage('分类长度不能超过50字符')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.getAvailableCoupons.bind(couponController))
);

/**
 * @swagger
 * /coupons/available:
 *   get:
 *     summary: 获取可用优惠券列表
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderAmount
 *         schema:
 *           type: number
 *         description: 订单金额（用于筛选满足最低使用金额的优惠券）
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         description: 车辆ID（用于筛选适用车辆的优惠券）
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 车辆分类（用于筛选适用分类的优惠券）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取用户优惠券列表
router.get('/my',
  authMiddleware.authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['unused', 'used', 'expired', 'cancelled']).withMessage('状态参数不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.getUserCoupons.bind(couponController))
);

/**
 * @swagger
 * /coupons/my:
 *   get:
 *     summary: 获取用户优惠券列表
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unused, used, expired, cancelled]
 *         description: 状态筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserCoupon'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 领取优惠券
router.post('/:couponId/claim',
  authMiddleware.authenticate,
  [
    param('couponId').isInt({ min: 1 }).withMessage('优惠券ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.claimCoupon.bind(couponController))
);

/**
 * @swagger
 * /coupons/{couponId}/claim:
 *   post:
 *     summary: 领取优惠券
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 优惠券ID
 *     responses:
 *       200:
 *         description: 领取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 领取成功
 *                 data:
 *                   $ref: '#/components/schemas/UserCoupon'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 优惠券不存在
 *       400:
 *         description: 优惠券不可领取或已达到领取限制
 *       500:
 *         description: 服务器错误
 */

// 使用优惠券
router.post('/:couponCode/use',
  authMiddleware.authenticate,
  [
    param('couponCode').isLength({ min: 1, max: 50 }).withMessage('优惠券码格式不正确'),
    body('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.useCoupon.bind(couponController))
);

/**
 * @swagger
 * /coupons/{couponCode}/use:
 *   post:
 *     summary: 使用优惠券
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 优惠券码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *     responses:
 *       200:
 *         description: 使用成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 使用成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     discountAmount:
 *                       type: number
 *                       description: 优惠金额
 *                     actualAmount:
 *                       type: number
 *                       description: 实际支付金额
 *       401:
 *         description: 未授权
 *       404:
 *         description: 优惠券不存在或无效
 *       400:
 *         description: 优惠券不可使用
 *       500:
 *         description: 服务器错误
 */

// 验证优惠券
router.post('/validate',
  authMiddleware.authenticate,
  [
    body('couponCode').isLength({ min: 1, max: 50 }).withMessage('优惠券码格式不正确'),
    body('orderAmount').isDecimal().withMessage('订单金额格式不正确'),
    body('vehicleId').optional().isInt({ min: 1 }).withMessage('车辆ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.validateCoupon.bind(couponController))
);

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: 验证优惠券
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *               - orderAmount
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: 优惠券码
 *               orderAmount:
 *                 type: number
 *                 description: 订单金额
 *               vehicleId:
 *                 type: integer
 *                 description: 车辆ID
 *     responses:
 *       200:
 *         description: 验证成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 验证成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       description: 是否有效
 *                     discountAmount:
 *                       type: number
 *                       description: 优惠金额
 *                     finalAmount:
 *                       type: number
 *                       description: 最终金额
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: 未授权
 *       400:
 *         description: 验证失败
 *       500:
 *         description: 服务器错误
 */

// 获取优惠券详情
router.get('/:couponId',
  authMiddleware.authenticate,
  [
    param('couponId').isInt({ min: 1 }).withMessage('优惠券ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(couponController.getCouponDetail.bind(couponController))
);

/**
 * @swagger
 * /coupons/{couponId}:
 *   get:
 *     summary: 获取优惠券详情
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: couponId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 优惠券ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 优惠券不存在
 *       500:
 *         description: 服务器错误
 */

// 获取优惠券统计信息
router.get('/stats',
  authMiddleware.authenticate,
  asyncHandler(couponController.getCouponStats.bind(couponController))
);

/**
 * @swagger
 * /coupons/stats:
 *   get:
 *     summary: 获取用户优惠券统计信息
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总优惠券数量
 *                     unused:
 *                       type: integer
 *                       description: 未使用数量
 *                     used:
 *                       type: integer
 *                       description: 已使用数量
 *                     expired:
 *                       type: integer
 *                       description: 已过期数量
 *                     totalSavings:
 *                       type: number
 *                       description: 累计节省金额
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

export default router;