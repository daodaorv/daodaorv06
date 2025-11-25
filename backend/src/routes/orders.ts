import { Router } from 'express';
import { OrderController } from '../controllers/order';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const orderController = new OrderController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 订单ID
 *         orderNo:
 *           type: string
 *           description: 订单号
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         vehicleId:
 *           type: integer
 *           description: 车辆ID
 *         pickupStoreId:
 *           type: integer
 *           description: 取车门店ID
 *         returnStoreId:
 *           type: integer
 *           description: 还车门店ID
 *         statusId:
 *           type: integer
 *           description: 订单状态ID
 *         pickupTime:
 *           type: string
 *           format: date-time
 *           description: 取车时间
 *         returnTime:
 *           type: string
 *           format: date-time
 *           description: 还车时间
 *         totalAmount:
 *           type: number
 *           description: 订单总金额
 *         actualAmount:
 *           type: number
 *           description: 实付金额
 *         depositAmount:
 *           type: number
 *           description: 押金金额
 *         contactName:
 *           type: string
 *           description: 联系人姓名
 *         contactPhone:
 *           type: string
 *           description: 联系人电话
 *         idCardNumber:
 *           type: string
 *           description: 身份证号
 *         driverLicenseNumber:
 *           type: string
 *           description: 驾驶证号
 *         userRemark:
 *           type: string
 *           description: 用户备注
 *         isRated:
 *           type: boolean
 *           description: 是否已评价
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         vehicle:
 *           $ref: '#/components/schemas/Vehicle'
 *         pickupStore:
 *           $ref: '#/components/schemas/Store'
 *         returnStore:
 *           $ref: '#/components/schemas/Store'
 *         status:
 *           $ref: '#/components/schemas/OrderStatus'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderStatus:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 状态ID
 *         name:
 *           type: string
 *           description: 状态名称
 *         code:
 *           type: string
 *           description: 状态代码
 *         description:
 *           type: string
 *           description: 状态描述
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - vehicleId
 *         - pickupStoreId
 *         - pickupTime
 *         - returnTime
 *         - contactName
 *         - contactPhone
 *         - idCardNumber
 *       properties:
 *         vehicleId:
 *           type: integer
 *           description: 车辆ID
 *         pickupStoreId:
 *           type: integer
 *           description: 取车门店ID
 *         returnStoreId:
 *           type: integer
 *           description: 还车门店ID（可选，不填则与取车门店相同）
 *         pickupTime:
 *           type: string
 *           format: date-time
 *           description: 取车时间
 *         returnTime:
 *           type: string
 *           format: date-time
 *           description: 还车时间
 *         contactName:
 *           type: string
 *           description: 联系人姓名
 *         contactPhone:
 *           type: string
 *           description: 联系人电话
 *         idCardNumber:
 *           type: string
 *           description: 身份证号
 *         driverLicenseNumber:
 *           type: string
 *           description: 驾驶证号
 *         couponId:
 *           type: integer
 *           description: 优惠券ID
 *         userRemark:
 *           type: string
 *           description: 用户备注
 *         isDifferentReturn:
 *           type: boolean
 *           description: 是否异地还车
 */

// 创建订单
router.post('/',
  authMiddleware.authenticate,
  [
    body('vehicleId').isInt({ min: 1 }).withMessage('车辆ID必须是正整数'),
    body('pickupStoreId').isInt({ min: 1 }).withMessage('取车门店ID必须是正整数'),
    body('returnStoreId').optional().isInt({ min: 1 }).withMessage('还车门店ID必须是正整数'),
    body('pickupTime').isISO8601().withMessage('取车时间格式不正确'),
    body('returnTime').isISO8601().withMessage('还车时间格式不正确'),
    body('contactName').isLength({ min: 2, max: 50 }).withMessage('联系人姓名长度应在2-50字符之间'),
    body('contactPhone').isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    body('idCardNumber').isLength({ min: 15, max: 18 }).withMessage('身份证号长度不正确'),
    body('driverLicenseNumber').optional().isLength({ min: 1, max: 50 }).withMessage('驾驶证号长度不正确'),
    body('couponId').optional().isInt({ min: 1 }).withMessage('优惠券ID必须是正整数'),
    body('userRemark').optional().isLength({ max: 500 }).withMessage('用户备注不能超过500字符'),
    body('isDifferentReturn').optional().isBoolean().withMessage('异地还车标识必须是布尔值')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.createOrder.bind(orderController))
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: 创建订单
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       200:
 *         description: 创建成功
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
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取用户订单列表
router.get('/',
  authMiddleware.authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['pending_payment', 'pending_confirmation', 'pending_pickup', 'in_progress', 'pending_return', 'completed', 'cancelled']).withMessage('状态参数不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.getUserOrders.bind(orderController))
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: 获取用户订单列表
 *     tags: [Orders]
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
 *           enum: [pending_payment, pending_confirmation, pending_pickup, in_progress, pending_return, completed, cancelled]
 *         description: 订单状态筛选
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取订单详情
router.get('/:orderId',
  authMiddleware.authenticate,
  [
    param('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.getOrderDetail.bind(orderController))
);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 订单ID
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
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */

// 取消订单
router.post('/:orderId/cancel',
  authMiddleware.authenticate,
  [
    param('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数'),
    body('reason').optional().isLength({ max: 200 }).withMessage('取消原因不能超过200字符')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.cancelOrder.bind(orderController))
);

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   post:
 *     summary: 取消订单
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 订单ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 取消原因
 *     responses:
 *       200:
 *         description: 取消成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       400:
 *         description: 订单状态不允许取消
 *       500:
 *         description: 服务器错误
 */

// 计算订单价格
router.post('/calculate-price',
  authMiddleware.authenticate,
  [
    body('vehicleId').isInt({ min: 1 }).withMessage('车辆ID必须是正整数'),
    body('pickupTime').isISO8601().withMessage('取车时间格式不正确'),
    body('returnTime').isISO8601().withMessage('还车时间格式不正确'),
    body('couponId').optional().isInt({ min: 1 }).withMessage('优惠券ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.calculatePrice.bind(orderController))
);

/**
 * @swagger
 * /orders/calculate-price:
 *   post:
 *     summary: 计算订单价格
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - pickupTime
 *               - returnTime
 *             properties:
 *               vehicleId:
 *                 type: integer
 *                 description: 车辆ID
 *               pickupTime:
 *                 type: string
 *                 format: date-time
 *                 description: 取车时间
 *               returnTime:
 *                 type: string
 *                 format: date-time
 *                 description: 还车时间
 *               couponId:
 *                 type: integer
 *                 description: 优惠券ID
 *     responses:
 *       200:
 *         description: 计算成功
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
 *                     vehicleFee:
 *                       type: number
 *                       description: 车辆租赁费用
 *                     insuranceFee:
 *                       type: number
 *                       description: 保险费用
 *                     serviceFee:
 *                       type: number
 *                       description: 服务费用
 *                     couponDiscount:
 *                       type: number
 *                       description: 优惠券折扣
 *                     totalAmount:
 *                       type: number
 *                       description: 订单总金额
 *                     depositAmount:
 *                       type: number
 *                       description: 押金金额
 *                     actualAmount:
 *                       type: number
 *                       description: 实付金额
 *                     rentalDays:
 *                       type: integer
 *                       description: 租赁天数
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取订单状态列表
router.get('/status/list',
  asyncHandler(orderController.getOrderStatusList.bind(orderController))
);

/**
 * @swagger
 * /orders/status/list:
 *   get:
 *     summary: 获取订单状态列表
 *     tags: [Orders]
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
 *                     $ref: '#/components/schemas/OrderStatus'
 */

// 申请订单延期
router.post('/:orderId/extend',
  authMiddleware.authenticate,
  [
    param('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数'),
    body('extensionHours').isInt({ min: 1, max: 168 }).withMessage('延期时间必须在1-168小时之间'),
    body('remark').optional().isLength({ max: 200 }).withMessage('备注不能超过200字符')
  ],
  validationMiddleware.validate,
  asyncHandler(orderController.requestOrderExtension.bind(orderController))
);

/**
 * @swagger
 * /orders/{orderId}/extend:
 *   post:
 *     summary: 申请订单延期
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 订单ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extensionHours
 *             properties:
 *               extensionHours:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 168
 *                 description: 延期小时数（最多7天）
 *               remark:
 *                 type: string
 *                 description: 申请备注
 *     responses:
 *       200:
 *         description: 申请成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       400:
 *         description: 订单状态不允许延期
 *       500:
 *         description: 服务器错误
 */

export default router;