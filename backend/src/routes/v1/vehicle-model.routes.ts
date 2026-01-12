import { Router, Request, Response } from 'express';
import { VehicleModelDAO } from '@dao/vehicle-model.dao';
import { successResponse, errorResponse } from '@utils/response';
import { logger } from '@utils/logger';

const router = Router();
const vehicleModelDAO = new VehicleModelDAO();

/**
 * 获取车型列表
 * GET /api/v1/vehicles/models
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, pageSize, brandId, keyword, vehicleType, status } = req.query;

    const result = await vehicleModelDAO.getModels({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      brandId: brandId && !isNaN(Number(brandId)) ? Number(brandId) : undefined,
      keyword: keyword as string,
      vehicleType: vehicleType as string,
      status: status as string,
    });

    return res.json(successResponse(result, '获取成功'));
  } catch (error) {
    logger.error('获取车型列表失败:', error);
    return res.status(500).json(errorResponse('获取失败', 500));
  }
});

/**
 * 获取车型详情
 * GET /api/v1/vehicles/models/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await vehicleModelDAO.getModelById(Number(id));

    if (!model) {
      return res.status(404).json(errorResponse('车型不存在', 404));
    }

    return res.json(successResponse(model, '获取成功'));
  } catch (error) {
    logger.error('获取车型详情失败:', error);
    return res.status(500).json(errorResponse('获取失败', 500));
  }
});

/**
 * 创建车型
 * POST /api/v1/vehicles/models
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // 详细日志
    logger.info('=== POST 请求调试信息 ===');
    logger.info('Content-Type:', req.get('Content-Type'));
    logger.info('Content-Length:', req.get('Content-Length'));
    logger.info('req.body类型:', typeof data);
    logger.info('req.body是否为空对象:', Object.keys(data).length === 0);
    logger.info('req.body内容:', JSON.stringify(data, null, 2));
    logger.info('req.body.name:', data?.name);
    logger.info('========================');

    // 如果body为空，直接返回错误
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json(errorResponse('请求体不能为空', 400));
    }

    const id = await vehicleModelDAO.createModel(data);
    return res.status(201).json(successResponse({ id }, '创建成功'));
  } catch (error) {
    logger.error('创建车型失败:', error);
    return res.status(500).json(errorResponse('创建失败', 500));
  }
});

/**
 * 更新车型
 * PUT /api/v1/vehicles/models/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const success = await vehicleModelDAO.updateModel(Number(id), data);

    if (!success) {
      return res.status(400).json(errorResponse('更新失败', 400));
    }

    return res.json(successResponse(null, '更新成功'));
  } catch (error) {
    logger.error('更新车型失败:', error);
    return res.status(500).json(errorResponse('更新失败', 500));
  }
});

/**
 * 删除车型
 * DELETE /api/v1/vehicles/models/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await vehicleModelDAO.deleteModel(Number(id));

    if (!success) {
      return res.status(400).json(errorResponse('删除失败', 400));
    }

    return res.json(successResponse(null, '删除成功'));
  } catch (error) {
    logger.error('删除车型失败:', error);
    return res.status(500).json(errorResponse('删除失败', 500));
  }
});

export default router;
