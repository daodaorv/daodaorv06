import { Router, Request, Response } from 'express';
import { VehicleFavoriteDAO } from '@dao/vehicle-favorite.dao';
import { successResponse, errorResponse, paginatedResponse } from '@utils/response';
import { logger } from '@utils/logger';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const vehicleFavoriteDAO = new VehicleFavoriteDAO();

/**
 * 添加/取消收藏车辆（切换收藏状态）
 * POST /api/v1/vehicles/:id/favorite
 */
router.post('/:id/favorite', authMiddleware, async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.id);
    const userId = req.user!.id;

    if (!vehicleId || isNaN(vehicleId)) {
      return res.status(400).json(errorResponse('车辆ID无效', 400));
    }

    // 检查是否已收藏
    const isFavorited = await vehicleFavoriteDAO.isFavorited(userId, vehicleId);

    if (isFavorited) {
      // 已收藏,则取消收藏
      await vehicleFavoriteDAO.removeFavorite(userId, vehicleId);
      return res.json(
        successResponse(
          {
            vehicleId,
            favorited: false,
          },
          '取消收藏成功'
        )
      );
    } else {
      // 未收藏,则添加收藏
      await vehicleFavoriteDAO.addFavorite(userId, vehicleId);
      return res.json(
        successResponse(
          {
            vehicleId,
            favorited: true,
          },
          '收藏成功'
        )
      );
    }
  } catch (error) {
    logger.error('收藏/取消收藏失败:', error);
    return res.status(500).json(errorResponse('操作失败', 500));
  }
});

/**
 * 获取用户收藏列表
 * GET /api/v1/vehicles/favorites
 */
router.get('/favorites', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

    const result = await vehicleFavoriteDAO.getUserFavorites({
      userId,
      page,
      pageSize,
    });

    return res.json(paginatedResponse(result.list, result.total, page, pageSize));
  } catch (error) {
    logger.error('获取收藏列表失败:', error);
    return res.status(500).json(errorResponse('获取收藏列表失败', 500));
  }
});

export default router;
