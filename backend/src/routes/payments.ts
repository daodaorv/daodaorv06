import { Router } from 'express';
import { PaymentController } from '../controllers/payment';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const paymentController = new PaymentController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 支付方式ID
 *         code:
 *           type: string
 *           description: 支付方式代码
 *         name:
 *           type: string
 *           description: 支付方式名称
 *         description:
 *           type: string
 *           description: 支付方式描述
 *         iconUrl:
 *           type: string
 *           description: 图标URL
 *         isEnabled:
 *           type: boolean
 *           description: 是否启用
 *         sortOrder:
 *           type: integer
 *           description: 排序
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - paymentMethod
 *       properties:
 *         orderId:
 *           type: integer
 *           description: 订单ID
 *         paymentMethod:
 *           type: string
 *           enum: [wechat, alipay, balance, unionpay]
 *           description: 支付方式
 *         clientIp:
 *           type: string
 *           description: 客户端IP
 *         deviceInfo:
 *           type: string
 *           description: 设备信息
 */

// 获取支付方式列表
router.get('/methods',
  asyncHandler(paymentController.getPaymentMethods.bind(paymentController))
);

/**
 * @swagger
 * /payments/methods:
 *   get:
 *     summary: 获取支付方式列表
 *     tags: [Payments]
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
 *                     $ref: '#/components/schemas/PaymentMethod'
 */

// 创建支付订单
router.post('/',
  authMiddleware.authenticate,
  [
    body('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数'),
    body('paymentMethod').isIn(['wechat', 'alipay', 'balance', 'unionpay']).withMessage('支付方式不正确'),
    body('clientIp').optional().isIP().withMessage('客户端IP格式不正确'),
    body('deviceInfo').optional().isLength({ max: 200 }).withMessage('设备信息不能超过200字符')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.createPayment.bind(paymentController))
);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: 创建支付订单
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
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
 *                   type: object
 *                   properties:
 *                     paymentNo:
 *                       type: string
 *                       description: 支付流水号
 *                     paymentUrl:
 *                       type: string
 *                       description: 支付链接（微信H5支付）
 *                     qrCode:
 *                       type: string
 *                       description: 支付二维码
 *                     prepayId:
 *                       type: string
 *                       description: 预支付ID（微信小程序支付）
 *                     paySign:
 *                       type: string
 *                       description: 支付签名
 *                     timeStamp:
 *                       type: string
 *                       description: 时间戳
 *                     nonceStr:
 *                       type: string
 *                       description: 随机字符串
 *                     package:
 *                       type: string
 *                       description: 扩展字段
 *                     signType:
 *                       type: string
 *                       description: 签名类型
 *                     amount:
 *                       type: number
 *                       description: 支付金额
 *                     expireTime:
 *                       type: string
 *                       format: date-time
 *                       description: 过期时间
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 查询支付状态
router.get('/:paymentNo/status',
  authMiddleware.authenticate,
  [
    param('paymentNo').isLength({ min: 1, max: 50 }).withMessage('支付流水号格式不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.getPaymentStatus.bind(paymentController))
);

/**
 * @swagger
 * /payments/{paymentNo}/status:
 *   get:
 *     summary: 查询支付状态
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 支付流水号
 *     responses:
 *       200:
 *         description: 查询成功
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
 *                     paymentNo:
 *                       type: string
 *                       description: 支付流水号
 *                     orderId:
 *                       type: integer
 *                       description: 订单ID
 *                     orderNo:
 *                       type: string
 *                       description: 订单号
 *                     amount:
 *                       type: number
 *                       description: 支付金额
 *                     status:
 *                       type: string
 *                       description: 支付状态
 *                     paymentMethod:
 *                       type: string
 *                       description: 支付方式
 *                     thirdPartyTransactionId:
 *                       type: string
 *                       description: 第三方交易流水号
 *                     paidTime:
 *                       type: string
 *                       format: date-time
 *                       description: 支付时间
 *                     failureReason:
 *                       type: string
 *                       description: 失败原因
 *       401:
 *         description: 未授权
 *       404:
 *         description: 支付记录不存在
 *       500:
 *         description: 服务器错误
 */

// 支付回调接口（用于第三方支付平台回调）
router.post('/notify/:method',
  [
    param('method').isIn(['wechat', 'alipay', 'unionpay']).withMessage('支付方式不正确')
  ],
  asyncHandler(paymentController.handlePaymentNotify.bind(paymentController))
);

/**
 * @swagger
 * /payments/notify/{method}:
 *   post:
 *     summary: 支付回调接口
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: method
 *         required: true
 *         schema:
 *           type: string
 *           enum: [wechat, alipay, unionpay]
 *         description: 支付方式
 *     responses:
 *       200:
 *         description: 回调处理成功
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */

// 取消支付
router.post('/:paymentNo/cancel',
  authMiddleware.authenticate,
  [
    param('paymentNo').isLength({ min: 1, max: 50 }).withMessage('支付流水号格式不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.cancelPayment.bind(paymentController))
);

/**
 * @swagger
 * /payments/{paymentNo}/cancel:
 *   post:
 *     summary: 取消支付
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 支付流水号
 *     responses:
 *       200:
 *         description: 取消成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 支付记录不存在
 *       400:
 *         description: 支付状态不允许取消
 *       500:
 *         description: 服务器错误
 */

// 申请退款
router.post('/:paymentNo/refund',
  authMiddleware.authenticate,
  [
    param('paymentNo').isLength({ min: 1, max: 50 }).withMessage('支付流水号格式不正确'),
    body('refundAmount').isDecimal({ decimal_digits: '0,2' }).withMessage('退款金额格式不正确'),
    body('refundReason').isLength({ min: 1, max: 500 }).withMessage('退款原因长度应在1-500字符之间')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.requestRefund.bind(paymentController))
);

/**
 * @swagger
 * /payments/{paymentNo}/refund:
 *   post:
 *     summary: 申请退款
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 支付流水号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refundAmount
 *               - refundReason
 *             properties:
 *               refundAmount:
 *                 type: number
 *                 description: 退款金额
 *               refundReason:
 *                 type: string
 *                 description: 退款原因
 *     responses:
 *       200:
 *         description: 申请成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 支付记录不存在
 *       400:
 *         description: 退款金额不正确或支付状态不允许退款
 *       500:
 *         description: 服务器错误
 */

// 获取用户支付记录
router.get('/',
  authMiddleware.authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['pending', 'success', 'failed', 'refunded']).withMessage('状态参数不正确'),
    query('method').optional().isIn(['wechat', 'alipay', 'balance', 'unionpay']).withMessage('支付方式参数不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.getUserPayments.bind(paymentController))
);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: 获取用户支付记录
 *     tags: [Payments]
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
 *           enum: [pending, success, failed, refunded]
 *         description: 支付状态筛选
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [wechat, alipay, balance, unionpay]
 *         description: 支付方式筛选
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取支付详情
router.get('/:paymentNo',
  authMiddleware.authenticate,
  [
    param('paymentNo').isLength({ min: 1, max: 50 }).withMessage('支付流水号格式不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.getPaymentDetail.bind(paymentController))
);

/**
 * @swagger
 * /payments/{paymentNo}:
 *   get:
 *     summary: 获取支付详情
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 支付流水号
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
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 支付记录不存在
 *       500:
 *         description: 服务器错误
 */

// 重试支付
router.post('/:paymentNo/retry',
  authMiddleware.authenticate,
  [
    param('paymentNo').isLength({ min: 1, max: 50 }).withMessage('支付流水号格式不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(paymentController.retryPayment.bind(paymentController))
);

/**
 * @swagger
 * /payments/{paymentNo}/retry:
 *   post:
 *     summary: 重试支付
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 支付流水号
 *     responses:
 *       200:
 *         description: 重试成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 支付记录不存在
 *       400:
 *         description: 支付状态不允许重试
 *       500:
 *         description: 服务器错误
 */

export default router;