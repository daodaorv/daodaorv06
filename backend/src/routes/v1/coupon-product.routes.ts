/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { CouponProductDAO } from '../../dao/coupon-product.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const couponProductDAO = new CouponProductDAO();

/**
 * 1. 获取优惠券产品列表
 * GET /api/v1/admin/coupon-products
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, display_position, page = 1, pageSize = 20 } = req.query;

    const result = await couponProductDAO.findProducts({
      status: status as any,
      display_position: display_position as any,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    res.json(successResponse({
      list: result.list,
      total: result.total,
      page: Number(page),
      pageSize: Number(pageSize),
    }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 2. 获取优惠券产品详情
 * GET /api/v1/admin/coupon-products/:id
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await couponProductDAO.findProductDetail(Number(id));

    if (!product) {
      return res.status(404).json(errorResponse('优惠券产品不存在'));
    }

    return res.json(successResponse(product));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 3. 创建优惠券产品
 * POST /api/v1/admin/coupon-products
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const product = await couponProductDAO.createProduct(req.body);
    res.json(successResponse(product));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 4. 更新优惠券产品
 * PUT /api/v1/admin/coupon-products/:id
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await couponProductDAO.updateProduct(Number(id), req.body);

    if (!success) {
      return res.status(404).json(errorResponse('优惠券产品不存在或更新失败'));
    }

    return res.json(successResponse({ message: '更新成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 5. 删除优惠券产品
 * DELETE /api/v1/admin/coupon-products/:id
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await couponProductDAO.delete(Number(id));

    if (!success) {
      return res.status(404).json(errorResponse('优惠券产品不存在'));
    }

    return res.json(successResponse({ message: '删除成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 6. 批量上下架
 * POST /api/v1/admin/coupon-products/batch-status
 */
router.post('/batch-status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(errorResponse('请提供要操作的产品ID列表'));
    }

    const success = await couponProductDAO.batchUpdateStatus(ids, status);

    if (!success) {
      return res.status(400).json(errorResponse('批量更新失败'));
    }

    return res.json(successResponse({ message: '批量更新成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 7. 调整展示顺序
 * POST /api/v1/admin/coupon-products/reorder
 */
router.post('/reorder', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json(errorResponse('请提供排序数据'));
    }

    const success = await couponProductDAO.reorderProducts(orders);

    if (!success) {
      return res.status(400).json(errorResponse('调整顺序失败'));
    }

    return res.json(successResponse({ message: '调整顺序成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

export default router;
