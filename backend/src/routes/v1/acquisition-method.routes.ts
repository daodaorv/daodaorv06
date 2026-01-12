/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { AcquisitionMethodDAO } from '../../dao/acquisition-method.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const acquisitionMethodDAO = new AcquisitionMethodDAO();

/**
 * 1. 获取优惠券产品的获取方式列表
 * GET /api/v1/admin/coupon-products/:id/acquisition-methods
 */
router.get('/:id/acquisition-methods', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const methods = await acquisitionMethodDAO.findMethodsByProductId(Number(id));
    res.json(successResponse(methods));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 2. 添加获取方式
 * POST /api/v1/admin/coupon-products/:id/acquisition-methods
 */
router.post('/:id/acquisition-methods', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const params = {
      ...req.body,
      coupon_product_id: Number(id),
    };
    const method = await acquisitionMethodDAO.createMethod(params);
    res.json(successResponse(method));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 3. 更新获取方式
 * PUT /api/v1/admin/acquisition-methods/:id
 */
router.put('/acquisition-methods/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await acquisitionMethodDAO.updateMethod(Number(id), req.body);

    if (!success) {
      return res.status(404).json(errorResponse('获取方式不存在或更新失败'));
    }

    return res.json(successResponse({ message: '更新成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 4. 删除获取方式
 * DELETE /api/v1/admin/acquisition-methods/:id
 */
router.delete('/acquisition-methods/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await acquisitionMethodDAO.delete(Number(id));

    if (!success) {
      return res.status(404).json(errorResponse('获取方式不存在'));
    }

    return res.json(successResponse({ message: '删除成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 5. 启用/禁用获取方式
 * PATCH /api/v1/admin/acquisition-methods/:id/toggle
 */
router.patch('/acquisition-methods/:id/toggle', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await acquisitionMethodDAO.toggleMethod(Number(id));

    if (!success) {
      return res.status(404).json(errorResponse('获取方式不存在'));
    }

    return res.json(successResponse({ message: '状态切换成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

export default router;
