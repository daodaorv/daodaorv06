/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
import { CouponProductDAO } from '../../dao/coupon-product.dao';
import { AcquisitionMethodDAO } from '../../dao/acquisition-method.dao';
import { CouponInventoryDAO } from '../../dao/coupon-inventory.dao';
import { PurchaseLimitDAO } from '../../dao/purchase-limit.dao';
import { successResponse, errorResponse } from '../../utils/response';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const productDAO = new CouponProductDAO();
const methodDAO = new AcquisitionMethodDAO();
const inventoryDAO = new CouponInventoryDAO();
const limitDAO = new PurchaseLimitDAO();

/**
 * 1. 获取特惠商城首页数据
 * GET /api/v1/mall/home
 */
router.get('/home', authMiddleware, async (_req: Request, res: Response) => {
  try {
    // 获取热门推荐产品
    const hotProducts = await productDAO.findProducts({
      status: 'active',
      display_position: 'hot',
      page: 1,
      pageSize: 10,
    });

    // 获取新人专区产品
    const newbieProducts = await productDAO.findProducts({
      status: 'active',
      display_position: 'newbie',
      page: 1,
      pageSize: 5,
    });

    res.json(successResponse({
      banners: [],
      user_points: 0,
      hot_products: hotProducts.list,
      newbie_products: newbieProducts.list,
    }));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * 2. 获取优惠券产品列表
 * GET /api/v1/mall/products
 */
router.get('/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;

    const result = await productDAO.findProducts({
      status: 'active',
      display_position: category as any,
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
 * 3. 获取优惠券产品详情
 * GET /api/v1/mall/products/:id
 */
router.get('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 获取产品详情
    const product = await productDAO.findProductDetail(Number(id));
    if (!product) {
      return res.status(404).json(errorResponse('优惠券产品不存在'));
    }

    // 获取获取方式
    const methods = await methodDAO.findMethodsByProductId(Number(id));

    // 获取库存信息
    const inventory = await inventoryDAO.getInventoryByProductId(Number(id));

    // 获取限购规则
    const limits = await limitDAO.getLimitsByProductId(Number(id));

    return res.json(successResponse({
      product,
      acquisition_methods: methods,
      inventory,
      purchase_limits: limits,
    }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message));
  }
});

export default router;
