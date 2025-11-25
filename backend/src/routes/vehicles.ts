// 车辆相关的API接口
import express from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { vehicleQuerySchema, vehicleIdSchema } from '../validators/vehicleValidator';

const router = express.Router();
const vehicleController = new VehicleController();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: 车辆管理接口
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: 获取车辆列表
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *         description: 品牌ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           enum: [A型, B型, C型, 拖挂A型, 拖挂B型, 拖挂C型, 房车巴士, 越野房车, 自行式A型, 自行式B型, 自行式C型]
 *         description: 房车类型
 *       - in: query
 *         name: seats
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: 座位数
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: 最低日租金
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: 最高日租金
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *           enum: [汽油, 柴油, 新能源, 混动, 液化气, 天然气]
 *         description: 燃料类型
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: 门店ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating_desc, created_desc, popular]
 *           default: popular
 *         description: 排序方式
 *       - in: query
 *         name: pickupCity
 *         schema:
 *           type: string
 *         description: 取车城市
 *       - in: query
 *         name: features
 *         schema:
 *           type: string
 *         description: 车辆特性，多个用逗号分隔
 *     responses:
 *       200:
 *         description: 成功返回车辆列表
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
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Vehicle'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     filters:
 *                       $ref: '#/components/schemas/Filters'
 */
router.get('/', validationMiddleware(vehicleQuerySchema), vehicleController.getVehicles.bind(vehicleController));

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: 获取车辆详情
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 车辆ID
 *     responses:
 *       200:
 *         description: 成功返回车辆详情
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
 *                   $ref: '#/components/schemas/VehicleDetail'
 *       404:
 *         description: 车辆不存在
 */
router.get('/:id', validationMiddleware(vehicleIdSchema), vehicleController.getVehicleById.bind(vehicleController));

/**
 * @swagger
 * /vehicles/{id}/images:
 *   get:
 *     summary: 获取车辆图片列表
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 车辆ID
 *     responses:
 *       200:
 *         description: 成功返回车辆图片列表
 */
router.get('/:id/images', validationMiddleware(vehicleIdSchema), vehicleController.getVehicleImages.bind(vehicleController));

/**
 * @swagger
 * /vehicles/brands:
 *   get:
 *     summary: 获取车辆品牌列表
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: 成功返回品牌列表
 */
router.get('/brands/list', vehicleController.getVehicleBrands.bind(vehicleController));

/**
 * @swagger
 * /vehicles/features:
 *   get:
 *     summary: 获取车辆特性列表
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: 成功返回特性列表
 */
router.get('/features/list', vehicleController.getVehicleFeatures.bind(vehicleController));

/**
 * @swagger
 * /vehicles/{id}/favorite:
 *   post:
 *     summary: 收藏车辆
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 车辆ID
 *     responses:
 *       200:
 *         description: 收藏成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 车辆不存在
 */
router.post('/:id/favorite', authMiddleware, validationMiddleware(vehicleIdSchema), vehicleController.favoriteVehicle.bind(vehicleController));

/**
 * @swagger
 * /vehicles/{id}/favorite:
 *   delete:
 *     summary: 取消收藏车辆
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 车辆ID
 *     responses:
 *       200:
 *         description: 取消收藏成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 车辆不存在
 */
router.delete('/:id/favorite', authMiddleware, validationMiddleware(vehicleIdSchema), vehicleController.unfavoriteVehicle.bind(vehicleController));

/**
 * @swagger
 * /vehicles/favorites:
 *   get:
 *     summary: 获取用户收藏的车辆列表
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功返回收藏列表
 *       401:
 *         description: 未授权
 */
router.get('/favorites/list', authMiddleware, vehicleController.getFavoriteVehicles.bind(vehicleController));

/**
 * @swagger
 * /vehicles/search/suggestions:
 *   get:
 *     summary: 获取搜索建议
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         description: 搜索关键词
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: 返回数量限制
 *     responses:
 *       200:
 *         description: 成功返回搜索建议
 */
router.get('/search/suggestions', vehicleController.getSearchSuggestions.bind(vehicleController));

export default router;