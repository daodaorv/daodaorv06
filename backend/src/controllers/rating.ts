import { Request, Response } from 'express';
import { RatingService } from '../services/rating';
import { ApiResponse } from '../utils/response';

export class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  /**
   * 创建评价
   */
  public async createRating(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        orderId,
        vehicleId,
        ownerId,
        overallRating,
        vehicleRating,
        serviceRating,
        cleanlinessRating,
        accuracyRating,
        content,
        images,
        tags
      } = req.body;

      const rating = await this.ratingService.createRating({
        orderId,
        userId,
        vehicleId,
        ownerId,
        overallRating,
        vehicleRating,
        serviceRating,
        cleanlinessRating,
        accuracyRating,
        content,
        images,
        tags
      });

      res.json(
        ApiResponse.success('评价成功', rating)
      );
    } catch (error: any) {
      console.error('Create rating error:', error);

      if (error.message === 'ORDER_ALREADY_RATED') {
        return res.status(400).json(
          ApiResponse.error('该订单已评价', 400001)
        );
      }

      if (error.message.startsWith('INVALID_RATING_')) {
        return res.status(400).json(
          ApiResponse.error('评分必须在1-5之间', 400002)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取评价列表
   */
  public async getRatings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const {
        vehicleId,
        userId,
        status,
        minRating,
        maxRating,
        hasImages,
        tags
      } = req.query;

      const filters = {
        vehicleId: vehicleId ? parseInt(vehicleId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        status: status as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRating: maxRating ? parseFloat(maxRating as string) : undefined,
        hasImages: hasImages === 'true',
        tags: tags ? (tags as string).split(',') : undefined
      };

      const result = await this.ratingService.getRatings(page, limit, filters);

      const pagination = {
        current: page,
        pageSize: limit,
        total: result.total,
        pages: result.totalPages
      };

      res.json(
        ApiResponse.success('获取成功', {
          ratings: result.ratings,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get ratings error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取评价详情
   */
  public async getRatingDetail(req: Request, res: Response) {
    try {
      const ratingId = parseInt(req.params.ratingId);

      const rating = await this.ratingService.getRatingDetail(ratingId);

      res.json(
        ApiResponse.success('获取成功', rating)
      );
    } catch (error: any) {
      console.error('Get rating detail error:', error);

      if (error.message === 'RATING_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('评价不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 回复评价
   */
  public async replyRating(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ratingId = parseInt(req.params.ratingId);
      const { content, parentId, toUserId } = req.body;

      const reply = await this.ratingService.replyRating({
        ratingId,
        userId,
        content,
        parentId,
        toUserId
      });

      res.json(
        ApiResponse.success('回复成功', reply)
      );
    } catch (error: any) {
      console.error('Reply rating error:', error);

      if (error.message === 'RATING_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('评价不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 点赞评价
   */
  public async likeRating(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ratingId = parseInt(req.params.ratingId);
      const { targetType, targetId } = req.body;

      const result = await this.ratingService.likeRating(
        ratingId,
        userId,
        targetType || 'rating',
        targetId
      );

      res.json(
        ApiResponse.success(result.isLiked ? '点赞成功' : '取消点赞成功', result)
      );
    } catch (error: any) {
      console.error('Like rating error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户对评价的点赞状态
   */
  public async getUserLikeStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ratingId = parseInt(req.params.ratingId);

      const status = await this.ratingService.getUserLikeStatus(ratingId, userId);

      res.json(
        ApiResponse.success('获取成功', status)
      );
    } catch (error: any) {
      console.error('Get user like status error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取车辆评分统计
   */
  public async getVehicleRatingStats(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);

      const stats = await this.ratingService.getVehicleRatingStats(vehicleId);

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get vehicle rating stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取可用的评价标签
   */
  public async getRatingTags(req: Request, res: Response) {
    try {
      const category = req.query.category as string;

      const tags = await this.ratingService.getRatingTags(category);

      res.json(
        ApiResponse.success('获取成功', tags)
      );
    } catch (error: any) {
      console.error('Get rating tags error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 用户隐藏自己的评价
   */
  public async hideRating(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const ratingId = parseInt(req.params.ratingId);

      await this.ratingService.hideRating(ratingId, userId);

      res.json(
        ApiResponse.success('隐藏成功')
      );
    } catch (error: any) {
      console.error('Hide rating error:', error);

      if (error.message === 'RATING_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('评价不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户评价统计
   */
  public async getUserRatingStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await this.ratingService.getUserRatingStats(userId);

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get user rating stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}