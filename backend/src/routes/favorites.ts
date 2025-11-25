import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const favoriteController = new FavoriteController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 收藏ID
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         targetType:
 *           type: string
 *           enum: [vehicle, article, store]
 *           description: 收藏目标类型
 *         targetId:
 *           type: integer
 *           description: 收藏目标ID
 *         targetTitle:
 *           type: string
 *           description: 收藏目标标题
 *         targetImage:
 *           type: string
 *           description: 收藏目标图片
 *         targetPrice:
 *           type: number
 *           description: 收藏目标价格
 *         folderName:
 *           type: string
 *           description: 收藏夹名称
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 收藏标签列表
 *         note:
 *           type: string
 *           description: 收藏备注
 *         isActive:
 *           type: boolean
 *           description: 是否有效
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 */

// 添加收藏
router.post('/',
  authMiddleware.authenticate,
  [
    body('targetType').isIn(['vehicle', 'article', 'store']).withMessage('收藏目标类型不正确'),
    body('targetId').isInt({ min: 1 }).withMessage('收藏目标ID必须是正整数'),
    body('targetTitle').isLength({ min: 1, max: 200 }).withMessage('收藏目标标题长度必须在1-200字符之间'),
    body('targetImage').optional().isLength({ max: 500 }).withMessage('图片URL不能超过500字符'),
    body('targetPrice').optional().isDecimal().withMessage('价格格式不正确'),
    body('folderName').optional().isLength({ max: 50 }).withMessage('收藏夹名称不能超过50字符'),
    body('tags').optional().isArray().withMessage('标签列表必须是数组'),
    body('note').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000字符')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.addFavorite.bind(favoriteController))
);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: 添加收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - targetTitle
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [vehicle, article, store]
 *                 description: 收藏目标类型
 *               targetId:
 *                 type: integer
 *                 description: 收藏目标ID
 *               targetTitle:
 *                 type: string
 *                 description: 收藏目标标题
 *               targetImage:
 *                 type: string
 *                 description: 收藏目标图片
 *               targetPrice:
 *                 type: number
 *                 description: 收藏目标价格
 *               targetData:
 *                 type: object
 *                 description: 收藏目标其他数据
 *               folderName:
 *                 type: string
 *                 description: 收藏夹名称
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 收藏标签列表
 *               note:
 *                 type: string
 *                 description: 收藏备注
 *     responses:
 *       200:
 *         description: 收藏成功
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
 *                   example: 收藏成功
 *                 data:
 *                   $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: 请求参数错误或已收藏过
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取用户收藏列表
router.get('/',
  authMiddleware.authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('targetType').optional().isIn(['vehicle', 'article', 'store']).withMessage('收藏目标类型不正确'),
    query('folderName').optional().isLength({ max: 50 }).withMessage('收藏夹名称不能超过50字符'),
    query('tags').optional().isString().withMessage('标签参数格式不正确'),
    query('keyword').optional().isLength({ max: 100 }).withMessage('关键词不能超过100字符')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.getUserFavorites.bind(favoriteController))
);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: 获取用户收藏列表
 *     tags: [Favorites]
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
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [vehicle, article, store]
 *         description: 收藏目标类型筛选
 *       - in: query
 *         name: folderName
 *         schema:
 *           type: string
 *         description: 收藏夹名称筛选
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 标签筛选，逗号分隔
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
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
 *                     favorites:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Favorite'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 取消收藏
router.delete('/:targetType/:targetId',
  authMiddleware.authenticate,
  [
    param('targetType').isIn(['vehicle', 'article', 'store']).withMessage('收藏目标类型不正确'),
    param('targetId').isInt({ min: 1 }).withMessage('收藏目标ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.removeFavorite.bind(favoriteController))
);

/**
 * @swagger
 * /favorites/{targetType}/{targetId}:
 *   delete:
 *     summary: 取消收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [vehicle, article, store]
 *         description: 收藏目标类型
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 收藏目标ID
 *     responses:
 *       200:
 *         description: 取消收藏成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 收藏记录不存在
 *       500:
 *         description: 服务器错误
 */

// 获取收藏详情
router.get('/:favoriteId',
  authMiddleware.authenticate,
  [
    param('favoriteId').isInt({ min: 1 }).withMessage('收藏ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.getFavoriteDetail.bind(favoriteController))
);

// 更新收藏信息
router.patch('/:favoriteId',
  authMiddleware.authenticate,
  [
    param('favoriteId').isInt({ min: 1 }).withMessage('收藏ID必须是正整数'),
    body('folderName').optional().isLength({ max: 50 }).withMessage('收藏夹名称不能超过50字符'),
    body('tags').optional().isArray().withMessage('标签列表必须是数组'),
    body('note').optional().isLength({ max: 1000 }).withMessage('备注不能超过1000字符')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.updateFavorite.bind(favoriteController))
);

// 检查是否已收藏
router.get('/check/:targetType/:targetId',
  authMiddleware.authenticate,
  [
    param('targetType').isIn(['vehicle', 'article', 'store']).withMessage('收藏目标类型不正确'),
    param('targetId').isInt({ min: 1 }).withMessage('收藏目标ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.checkFavorited.bind(favoriteController))
);

// 获取用户收藏夹列表
router.get('/folders/list',
  authMiddleware.authenticate,
  asyncHandler(favoriteController.getUserFolders.bind(favoriteController))
);

// 创建收藏夹
router.post('/folders',
  authMiddleware.authenticate,
  [
    body('name').isLength({ min: 1, max: 50 }).withMessage('收藏夹名称长度必须在1-50字符之间'),
    body('description').optional().isLength({ max: 500 }).withMessage('收藏夹描述不能超过500字符'),
    body('icon').optional().isLength({ max: 50 }).withMessage('图标名称不能超过50字符'),
    body('color').optional().isLength({ min: 7, max: 7 }).withMessage('颜色格式不正确'),
    body('isPrivate').optional().isBoolean().withMessage('是否私有必须是布尔值')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.createFolder.bind(favoriteController))
);

// 获取收藏统计
router.get('/stats/:targetType/:targetId',
  [
    param('targetType').isIn(['vehicle', 'article', 'store']).withMessage('收藏目标类型不正确'),
    param('targetId').isInt({ min: 1 }).withMessage('收藏目标ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(favoriteController.getFavoriteStats.bind(favoriteController))
);

// 获取用户收藏统计
router.get('/user/stats',
  authMiddleware.authenticate,
  asyncHandler(favoriteController.getUserFavoriteStats.bind(favoriteController))
);

export default router;