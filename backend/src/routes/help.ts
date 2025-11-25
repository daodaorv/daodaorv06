import { Router } from 'express';
import { HelpController } from '../controllers/help';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const helpController = new HelpController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     HelpArticle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 文章ID
 *         categoryId:
 *           type: integer
 *           description: 分类ID
 *         title:
 *           type: string
 *           description: 文章标题
 *         summary:
 *           type: string
 *           description: 文章摘要
 *         content:
 *           type: string
 *           description: 文章内容
 *         coverImage:
 *           type: string
 *           description: 封面图片
 *         viewCount:
 *           type: integer
 *           description: 阅读次数
 *         likeCount:
 *           type: integer
 *           description: 点赞数
 *         helpfulCount:
 *           type: integer
 *           description: 有用数
 *         isTop:
 *           type: boolean
 *           description: 是否置顶
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         category:
 *           $ref: '#/components/schemas/HelpCategory'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HelpTag'
 *
 *     HelpCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         description:
 *           type: string
 *           description: 分类描述
 *         icon:
 *           type: string
 *           description: 分类图标
 *         color:
 *           type: string
 *           description: 分类颜色
 *         articleCount:
 *           type: integer
 *           description: 文章数量
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HelpCategory'
 *
 *     HelpTag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 标签ID
 *         name:
 *           type: string
 *           description: 标签名称
 *         color:
 *           type: string
 *           description: 标签颜色
 */

// 获取帮助分类列表
router.get('/categories',
  asyncHandler(helpController.getCategories.bind(helpController))
);

/**
 * @swagger
 * /help/categories:
 *   get:
 *     summary: 获取帮助分类列表
 *     tags: [Help]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含未启用的分类
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
 *                     $ref: '#/components/schemas/HelpCategory'
 *       500:
 *         description: 服务器错误
 */

// 获取分类及统计信息
router.get('/categories/stats',
  asyncHandler(helpController.getCategoriesWithStats.bind(helpController))
);

// 获取文章列表
router.get('/articles',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('keyword').optional().isLength({ max: 100 }).withMessage('关键词不能超过100字符'),
    query('isTop').optional().isBoolean().withMessage('是否置顶必须是布尔值'),
    query('authorId').optional().isInt({ min: 1 }).withMessage('作者ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.getArticles.bind(helpController))
);

/**
 * @swagger
 * /help/articles:
 *   get:
 *     summary: 获取文章列表
 *     tags: [Help]
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: isTop
 *         schema:
 *           type: boolean
 *         description: 是否置顶
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
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HelpArticle'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 服务器错误
 */

// 搜索帮助文章
router.get('/search',
  [
    query('keyword').isLength({ min: 1, max: 100 }).withMessage('搜索关键词长度必须在1-100字符之间'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.searchArticles.bind(helpController))
);

/**
 * @swagger
 * /help/search:
 *   get:
 *     summary: 搜索帮助文章
 *     tags: [Help]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 搜索成功
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
 *                   example: 搜索成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     keyword:
 *                       type: string
 *                       description: 搜索关键词
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HelpArticle'
 *                     total:
 *                       type: integer
 *                       description: 结果总数
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: 搜索关键词不能为空
 *       500:
 *         description: 服务器错误
 */

// 获取文章详情
router.get('/articles/:articleId',
  [
    param('articleId').isInt({ min: 1 }).withMessage('文章ID必须是正整数'),
    query('incrementView').optional().isBoolean().withMessage('incrementView必须是布尔值')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.getArticleDetail.bind(helpController))
);

/**
 * @swagger
 * /help/articles/{articleId}:
 *   get:
 *     summary: 获取文章详情
 *     tags: [Help]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *       - in: query
 *         name: incrementView
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否增加浏览量
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
 *                   $ref: '#/components/schemas/HelpArticle'
 *       404:
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 */

// 获取热门文章
router.get('/articles/popular',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('数量必须在1-50之间')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.getPopularArticles.bind(helpController))
);

/**
 * @swagger
 * /help/articles/popular:
 *   get:
 *     summary: 获取热门文章
 *     tags: [Help]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回数量
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
 *                     $ref: '#/components/schemas/HelpArticle'
 *       500:
 *         description: 服务器错误
 */

// 获取推荐文章
router.get('/articles/:articleId/recommended',
  [
    param('articleId').isInt({ min: 1 }).withMessage('文章ID必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('数量必须在1-20之间')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.getRecommendedArticles.bind(helpController))
);

/**
 * @swagger
 * /help/articles/{articleId}/recommended:
 *   get:
 *     summary: 获取推荐文章
 *     tags: [Help]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 当前文章ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: 返回数量
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
 *                     $ref: '#/components/schemas/HelpArticle'
 *       404:
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 */

// 提交用户反馈
router.post('/feedback',
  [
    body('type').isIn(['helpful', 'not_helpful', 'suggestion', 'complaint']).withMessage('反馈类型不正确'),
    body('content').isLength({ min: 1, max: 1000 }).withMessage('反馈内容长度必须在1-1000字符之间'),
    body('articleId').optional().isInt({ min: 1 }).withMessage('文章ID必须是正整数'),
    body('contactInfo').optional().isLength({ max: 200 }).withMessage('联系方式不能超过200字符')
  ],
  validationMiddleware.validate,
  asyncHandler(helpController.submitFeedback.bind(helpController))
);

/**
 * @swagger
 * /help/feedback:
 *   post:
 *     summary: 提交用户反馈
 *     tags: [Help]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *             properties:
 *               articleId:
 *                 type: integer
 *                 description: 相关文章ID（可选）
 *               type:
 *                 type: string
 *                 enum: [helpful, not_helpful, suggestion, complaint]
 *                 description: 反馈类型
 *               content:
 *                 type: string
 *                 description: 反馈内容
 *               contactInfo:
 *                 type: string
 *                 description: 联系方式（可选）
 *     responses:
 *       200:
 *         description: 反馈提交成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */

// 获取标签列表
router.get('/tags',
  asyncHandler(helpController.getTags.bind(helpController))
);

/**
 * @swagger
 * /help/tags:
 *   get:
 *     summary: 获取标签列表
 *     tags: [Help]
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
 *                     $ref: '#/components/schemas/HelpTag'
 *       500:
 *         description: 服务器错误
 */

// 获取帮助统计
router.get('/stats',
  asyncHandler(helpController.getHelpStats.bind(helpController))
);

/**
 * @swagger
 * /help/stats:
 *   get:
 *     summary: 获取帮助统计
 *     tags: [Help]
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
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: 统计日期
 *                     totalViews:
 *                       type: integer
 *                       description: 总浏览量
 *                     uniqueVisitors:
 *                       type: integer
 *                       description: 独立访客数
 *                     articleViews:
 *                       type: integer
 *                       description: 文章浏览量
 *                     searches:
 *                       type: integer
 *                       description: 搜索次数
 *                     feedbackCount:
 *                       type: integer
 *                       description: 反馈数量
 *                     helpfulCount:
 *                       type: integer
 *                       description: 有用反馈数
 *       500:
 *         description: 服务器错误
 */

export default router;