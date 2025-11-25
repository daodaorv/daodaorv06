import { Router } from 'express';
import { RatingController } from '../controllers/rating';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const ratingController = new RatingController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 评价ID
 *         orderId:
 *           type: integer
 *           description: 订单ID
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         vehicleId:
 *           type: integer
 *           description: 车辆ID
 *         ownerId:
 *           type: integer
 *           description: 车主ID
 *         overallRating:
 *           type: number
 *           format: float
 *           description: 总体评分 (1.0-5.0)
 *         vehicleRating:
 *           type: number
 *           format: float
 *           description: 车辆评分 (1.0-5.0)
 *         serviceRating:
 *           type: number
 *           format: float
 *           description: 服务评分 (1.0-5.0)
 *         cleanlinessRating:
 *           type: number
 *           format: float
 *           description: 卫生评分 (1.0-5.0)
 *         accuracyRating:
 *           type: number
 *           format: float
 *           description: 描述准确性评分 (1.0-5.0)
 *         content:
 *           type: string
 *           description: 评价内容
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: 评价图片列表
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 评价标签列表
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, hidden]
 *           description: 审核状态
 *         likeCount:
 *           type: integer
 *           description: 点赞数
 *         replyCount:
 *           type: integer
 *           description: 回复数
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 */

// 创建评价
router.post('/',
  authMiddleware.authenticate,
  [
    body('orderId').isInt({ min: 1 }).withMessage('订单ID必须是正整数'),
    body('vehicleId').isInt({ min: 1 }).withMessage('车辆ID必须是正整数'),
    body('ownerId').isInt({ min: 1 }).withMessage('车主ID必须是正整数'),
    body('overallRating').isFloat({ min: 1.0, max: 5.0 }).withMessage('总体评分必须在1-5之间'),
    body('vehicleRating').isFloat({ min: 1.0, max: 5.0 }).withMessage('车辆评分必须在1-5之间'),
    body('serviceRating').isFloat({ min: 1.0, max: 5.0 }).withMessage('服务评分必须在1-5之间'),
    body('cleanlinessRating').isFloat({ min: 1.0, max: 5.0 }).withMessage('卫生评分必须在1-5之间'),
    body('accuracyRating').isFloat({ min: 1.0, max: 5.0 }).withMessage('描述准确性评分必须在1-5之间'),
    body('content').optional().isLength({ max: 1000 }).withMessage('评价内容不能超过1000字符'),
    body('images').optional().isArray().withMessage('图片列表必须是数组'),
    body('tags').optional().isArray().withMessage('标签列表必须是数组')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.createRating.bind(ratingController))
);

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: 创建评价
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - vehicleId
 *               - ownerId
 *               - overallRating
 *               - vehicleRating
 *               - serviceRating
 *               - cleanlinessRating
 *               - accuracyRating
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *               vehicleId:
 *                 type: integer
 *                 description: 车辆ID
 *               ownerId:
 *                 type: integer
 *                 description: 车主ID
 *               overallRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 总体评分
 *               vehicleRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 车辆评分
 *               serviceRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 服务评分
 *               cleanlinessRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 卫生评分
 *               accuracyRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 描述准确性评分
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 评价内容
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 评价图片列表
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 评价标签列表
 *     responses:
 *       200:
 *         description: 评价成功
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
 *                   example: 评价成功
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *       400:
 *         description: 请求参数错误或已评价过
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取评价列表
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('vehicleId').optional().isInt({ min: 1 }).withMessage('车辆ID必须是正整数'),
    query('userId').optional().isInt({ min: 1 }).withMessage('用户ID必须是正整数'),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'hidden']).withMessage('状态参数不正确'),
    query('minRating').optional().isFloat({ min: 1.0, max: 5.0 }).withMessage('最低评分必须在1-5之间'),
    query('maxRating').optional().isFloat({ min: 1.0, max: 5.0 }).withMessage('最高评分必须在1-5之间'),
    query('hasImages').optional().isBoolean().withMessage('hasImages必须是布尔值'),
    query('tags').optional().isString().withMessage('标签参数格式不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.getRatings.bind(ratingController))
);

/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: 获取评价列表
 *     tags: [Ratings]
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
 *         name: vehicleId
 *         schema:
 *           type: integer
 *         description: 车辆ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 用户ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, hidden]
 *         description: 状态筛选
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: 最低评分
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: 最高评分
 *       - in: query
 *         name: hasImages
 *         schema:
 *           type: boolean
 *         description: 是否有图片
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 标签筛选，逗号分隔
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
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     ratings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Rating'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 服务器错误
 */

// 获取评价详情
router.get('/:ratingId',
  [
    param('ratingId').isInt({ min: 1 }).withMessage('评价ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.getRatingDetail.bind(ratingController))
);

/**
 * @swagger
 * /ratings/{ratingId}:
 *   get:
 *     summary: 获取评价详情
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评价ID
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
 *                   example: 获取成功
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */

// 回复评价
router.post('/:ratingId/replies',
  authMiddleware.authenticate,
  [
    param('ratingId').isInt({ min: 1 }).withMessage('评价ID必须是正整数'),
    body('content').isLength({ min: 1, max: 500 }).withMessage('回复内容长度必须在1-500字符之间'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父回复ID必须是正整数'),
    body('toUserId').optional().isInt({ min: 1 }).withMessage('目标用户ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.replyRating.bind(ratingController))
);

/**
 * @swagger
 * /ratings/{ratingId}/replies:
 *   post:
 *     summary: 回复评价
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评价ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: 回复内容
 *               parentId:
 *                 type: integer
 *                 description: 父回复ID（用于多级回复）
 *               toUserId:
 *                 type: integer
 *                 description: 回复目标用户ID
 *     responses:
 *       200:
 *         description: 回复成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */

// 点赞评价
router.post('/:ratingId/like',
  authMiddleware.authenticate,
  [
    param('ratingId').isInt({ min: 1 }).withMessage('评价ID必须是正整数'),
    body('targetType').optional().isIn(['rating', 'reply']).withMessage('目标类型不正确'),
    body('targetId').optional().isInt({ min: 1 }).withMessage('目标ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.likeRating.bind(ratingController))
);

/**
 * @swagger
 * /ratings/{ratingId}/like:
 *   post:
 *     summary: 点赞评价
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评价ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [rating, reply]
 *                 default: rating
 *                 description: 点赞目标类型
 *               targetId:
 *                 type: integer
 *                 description: 目标ID（回复ID时使用）
 *     responses:
 *       200:
 *         description: 点赞成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取用户对评价的点赞状态
router.get('/:ratingId/like-status',
  authMiddleware.authenticate,
  [
    param('ratingId').isInt({ min: 1 }).withMessage('评价ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.getUserLikeStatus.bind(ratingController))
);

// 获取车辆评分统计
router.get('/vehicle/:vehicleId/stats',
  [
    param('vehicleId').isInt({ min: 1 }).withMessage('车辆ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.getVehicleRatingStats.bind(ratingController))
);

/**
 * @swagger
 * /ratings/vehicle/{vehicleId}/stats:
 *   get:
 *     summary: 获取车辆评分统计
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 车辆ID
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
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRatings:
 *                       type: integer
 *                       description: 总评价数
 *                     overallRating:
 *                       type: number
 *                       description: 总体平均评分
 *                     vehicleRating:
 *                       type: number
 *                       description: 车辆平均评分
 *                     serviceRating:
 *                       type: number
 *                       description: 服务平均评分
 *                     cleanlinessRating:
 *                       type: number
 *                       description: 卫生平均评分
 *                     accuracyRating:
 *                       type: number
 *                       description: 描述准确性平均评分
 *       500:
 *         description: 服务器错误
 */

// 获取可用的评价标签
router.get('/tags',
  [
    query('category').optional().isIn(['vehicle', 'service', 'general']).withMessage('标签分类不正确')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.getRatingTags.bind(ratingController))
);

/**
 * @swagger
 * /ratings/tags:
 *   get:
 *     summary: 获取可用的评价标签
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [vehicle, service, general]
 *         description: 标签分类
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
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 标签ID
 *                       name:
 *                         type: string
 *                         description: 标签名称
 *                       category:
 *                         type: string
 *                         description: 标签分类
 *                       color:
 *                         type: string
 *                         description: 标签颜色
 *       500:
 *         description: 服务器错误
 */

// 隐藏评价
router.patch('/:ratingId/hide',
  authMiddleware.authenticate,
  [
    param('ratingId').isInt({ min: 1 }).withMessage('评价ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(ratingController.hideRating.bind(ratingController))
);

// 获取用户评价统计
router.get('/user/stats',
  authMiddleware.authenticate,
  asyncHandler(ratingController.getUserRatingStats.bind(ratingController))
);

export default router;