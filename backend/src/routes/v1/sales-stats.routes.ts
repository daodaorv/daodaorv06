/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { SalesStatsDAO } from '../../dao/sales-stats.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const salesStatsDAO = new SalesStatsDAO();

/**
 * 1. 获取销售概览
 * GET /api/v1/admin/coupon-products/sales/overview
 */
router.get('/sales/overview', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const overview = await salesStatsDAO.getSalesOverview({
      start_date: start_date as string,
      end_date: end_date as string,
    });
    res.json(successResponse(overview));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 2. 获取获取方式分析
 * GET /api/v1/admin/coupon-products/sales/by-method
 */
router.get('/sales/by-method', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { product_id } = req.query;
    const stats = await salesStatsDAO.getMethodStats({
      product_id: product_id ? Number(product_id) : undefined,
    });
    res.json(successResponse(stats));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
