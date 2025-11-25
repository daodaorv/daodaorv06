import { Request, Response } from 'express';
import { CouponService } from '../services/coupon';
import { ApiResponse } from '../utils/response';

export class CouponController {
  private couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
  }

  /**
   * 获取可用优惠券列表
   */
  public async getAvailableCoupons(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { orderAmount, vehicleId, category } = req.query;

      const filters = {
        orderAmount: orderAmount ? parseFloat(orderAmount as string) : undefined,
        vehicleId: vehicleId ? parseInt(vehicleId as string) : undefined,
        category: category as string
      };

      const coupons = await this.couponService.getAvailableCoupons(userId, filters);

      res.json(
        ApiResponse.success('获取成功', coupons)
      );
    } catch (error: any) {
      console.error('Get available coupons error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户优惠券列表
   */
  public async getUserCoupons(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const { coupons, total } = await this.couponService.getUserCoupons(
        userId,
        page,
        limit,
        status
      );

      const pagination = {
        current: page,
        pageSize: limit,
        total,
        pages: Math.ceil(total / limit)
      };

      res.json(
        ApiResponse.success('获取成功', {
          coupons,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get user coupons error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 领取优惠券
   */
  public async claimCoupon(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const couponId = parseInt(req.params.couponId);

      const userCoupon = await this.couponService.claimCoupon(userId, couponId);

      res.json(
        ApiResponse.success('领取成功', userCoupon)
      );
    } catch (error: any) {
      console.error('Claim coupon error:', error);

      if (error.code === 'COUPON_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('优惠券不存在', 404001)
        );
      }

      if (error.code === 'COUPON_INACTIVE') {
        return res.status(400).json(
          ApiResponse.error('优惠券已失效', 400001)
        );
      }

      if (error.code === 'CLAIM_LIMIT_EXCEEDED') {
        return res.status(400).json(
          ApiResponse.error('已达到领取上限', 400002)
        );
      }

      if (error.code === 'INSUFFICIENT_QUANTITY') {
        return res.status(400).json(
          ApiResponse.error('优惠券库存不足', 400003)
        );
      }

      if (error.code === 'ALREADY_CLAIMED') {
        return res.status(400).json(
          ApiResponse.error('已领取过该优惠券', 400004)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 使用优惠券
   */
  public async useCoupon(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { couponCode } = req.params;
      const { orderId } = req.body;

      const result = await this.couponService.useCoupon(userId, couponCode, orderId);

      res.json(
        ApiResponse.success('使用成功', result)
      );
    } catch (error: any) {
      console.error('Use coupon error:', error);

      if (error.code === 'COUPON_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('优惠券不存在', 404001)
        );
      }

      if (error.code === 'COUPON_NOT_OWNED') {
        return res.status(403).json(
          ApiResponse.error('优惠券不属于当前用户', 403001)
        );
      }

      if (error.code === 'COUPON_USED') {
        return res.status(400).json(
          ApiResponse.error('优惠券已使用', 400001)
        );
      }

      if (error.code === 'COUPON_EXPIRED') {
        return res.status(400).json(
          ApiResponse.error('优惠券已过期', 400002)
        );
      }

      if (error.code === 'COUPON_NOT_APPLICABLE') {
        return res.status(400).json(
          ApiResponse.error('优惠券不适用于当前订单', 400003)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 验证优惠券
   */
  public async validateCoupon(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { couponCode, orderAmount, vehicleId } = req.body;

      const validationResult = await this.couponService.validateCoupon(
        userId,
        couponCode,
        parseFloat(orderAmount),
        vehicleId ? parseInt(vehicleId) : undefined
      );

      res.json(
        ApiResponse.success('验证成功', validationResult)
      );
    } catch (error: any) {
      console.error('Validate coupon error:', error);

      if (error.code === 'COUPON_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('优惠券不存在', 404001)
        );
      }

      if (error.code === 'COUPON_INVALID') {
        return res.status(400).json(
          ApiResponse.error('优惠券无效', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取优惠券详情
   */
  public async getCouponDetail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const couponId = parseInt(req.params.couponId);

      const coupon = await this.couponService.getCouponDetail(couponId);

      if (!coupon) {
        return res.status(404).json(
          ApiResponse.error('优惠券不存在', 404001)
        );
      }

      // 检查用户是否已领取
      const userCoupon = await this.couponService.getUserCouponByCouponId(userId, couponId);
      const isClaimed = !!userCoupon;

      res.json(
        ApiResponse.success('获取成功', {
          ...coupon,
          isClaimed,
          userStatus: userCoupon?.status,
          validFrom: userCoupon?.validFrom,
          validUntil: userCoupon?.validUntil
        })
      );
    } catch (error: any) {
      console.error('Get coupon detail error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户优惠券统计信息
   */
  public async getCouponStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await this.couponService.getCouponStats(userId);

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get coupon stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}