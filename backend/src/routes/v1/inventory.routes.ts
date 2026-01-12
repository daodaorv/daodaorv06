/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { CouponInventoryDAO } from '../../dao/coupon-inventory.dao';
import { PurchaseLimitDAO } from '../../dao/purchase-limit.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const inventoryDAO = new CouponInventoryDAO();
const limitDAO = new PurchaseLimitDAO();

/**
 * 1. 获取库存信息
 * GET /api/v1/admin/coupon-products/:id/inventory
 */
router.get('/:id/inventory', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryDAO.getInventoryByProductId(Number(id));

    if (!inventory) {
      return res.status(404).json(errorResponse('库存信息不存在'));
    }

    return res.json(successResponse(inventory));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 2. 更新库存
 * PUT /api/v1/admin/coupon-products/:id/inventory
 */
router.put('/:id/inventory', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await inventoryDAO.updateInventory(Number(id), req.body);

    if (!success) {
      return res.status(404).json(errorResponse('库存信息不存在或更新失败'));
    }

    return res.json(successResponse({ message: '更新成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 3. 补充库存
 * POST /api/v1/admin/coupon-products/:id/inventory/replenish
 */
router.post('/:id/inventory/replenish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await inventoryDAO.replenishInventory(Number(id), req.body);

    if (!success) {
      return res.status(404).json(errorResponse('库存信息不存在或补充失败'));
    }

    return res.json(successResponse({ message: '补充成功' }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 4. 获取限购规则
 * GET /api/v1/admin/coupon-products/:id/purchase-limits
 */
router.get('/:id/purchase-limits', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limits = await limitDAO.getLimitsByProductId(Number(id));
    res.json(successResponse(limits));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 5. 配置限购规则
 * POST /api/v1/admin/coupon-products/:id/purchase-limits
 */
router.post('/:id/purchase-limits', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const params = {
      ...req.body,
      coupon_product_id: Number(id),
    };
    const limit = await limitDAO.createLimit(params);
    res.json(successResponse(limit));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
