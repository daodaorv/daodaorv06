import { Op } from 'sequelize';
import { Rating, RatingReply, RatingLike, RatingTag, VehicleRatingStats, User, Vehicle, Order } from '../models';
import { sequelize } from '../config/database';

export interface CreateRatingData {
  orderId: number;
  userId: number;
  vehicleId: number;
  ownerId: number;
  overallRating: number;
  vehicleRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  content?: string;
  images?: string[];
  tags?: string[];
}

export interface RatingFilters {
  vehicleId?: number;
  userId?: number;
  status?: string;
  minRating?: number;
  maxRating?: number;
  hasImages?: boolean;
  tags?: string[];
}

export interface ReplyRatingData {
  ratingId: number;
  userId: number;
  content: string;
  parentId?: number;
  toUserId?: number;
}

export class RatingService {
  /**
   * 创建评价
   */
  public async createRating(data: CreateRatingData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查是否已评价过
      const existingRating = await Rating.findOne({
        where: {
          orderId: data.orderId
        },
        transaction
      });

      if (existingRating) {
        throw new Error('ORDER_ALREADY_RATED');
      }

      // 验证评分范围
      this.validateRatings({
        overallRating: data.overallRating,
        vehicleRating: data.vehicleRating,
        serviceRating: data.serviceRating,
        cleanlinessRating: data.cleanlinessRating,
        accuracyRating: data.accuracyRating
      });

      // 创建评价
      const rating = await Rating.create({
        orderId: data.orderId,
        userId: data.userId,
        vehicleId: data.vehicleId,
        ownerId: data.ownerId,
        overallRating: data.overallRating,
        vehicleRating: data.vehicleRating,
        serviceRating: data.serviceRating,
        cleanlinessRating: data.cleanlinessRating,
        accuracyRating: data.accuracyRating,
        content: data.content,
        images: data.images || [],
        tags: data.tags || [],
        status: 'approved' // 可以设置为 'pending' 需要审核
      }, { transaction });

      await transaction.commit();
      return rating;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取评价列表
   */
  public async getRatings(
    page: number = 1,
    limit: number = 20,
    filters: RatingFilters = {}
  ) {
    const whereClause: any = {};

    // 构建查询条件
    if (filters.vehicleId) {
      whereClause.vehicleId = filters.vehicleId;
    }

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = 'approved'; // 默认只显示已通过审核的评价
    }

    if (filters.minRating || filters.maxRating) {
      whereClause.overallRating = {};
      if (filters.minRating) {
        whereClause.overallRating[Op.gte] = filters.minRating;
      }
      if (filters.maxRating) {
        whereClause.overallRating[Op.lte] = filters.maxRating;
      }
    }

    if (filters.hasImages) {
      whereClause[Op.not] = [
        { images: null },
        { images: '[]' }
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause[Op.and] = filters.tags.map(tag => ({
        tags: {
          [Op.contains]: tag
        }
      }));
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatar', 'isVip']
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'images']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      ratings: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 获取评价详情
   */
  public async getRatingDetail(ratingId: number) {
    const rating = await Rating.findByPk(ratingId, {
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'avatar', 'isVip']
        },
        {
          model: Vehicle,
          attributes: ['id', 'name', 'images', 'brand', 'model']
        },
        {
          model: RatingReply,
          include: [
            {
              model: User,
              attributes: ['id', 'nickname', 'avatar']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!rating) {
      throw new Error('RATING_NOT_FOUND');
    }

    return rating;
  }

  /**
   * 回复评价
   */
  public async replyRating(data: ReplyRatingData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查评价是否存在
      const rating = await Rating.findByPk(data.ratingId, { transaction });
      if (!rating) {
        throw new Error('RATING_NOT_FOUND');
      }

      // 创建回复
      const reply = await RatingReply.create({
        ratingId: data.ratingId,
        userId: data.userId,
        parentId: data.parentId,
        toUserId: data.toUserId,
        content: data.content,
        status: 'approved'
      }, { transaction });

      // 更新回复数
      await rating.increment('reply_count', { transaction });

      await transaction.commit();
      return reply;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 点赞评价
   */
  public async likeRating(ratingId: number, userId: number, targetType: 'rating' | 'reply' = 'rating', targetId?: number) {
    const transaction = await sequelize.transaction();

    try {
      const actualTargetId = targetId || ratingId;

      // 检查是否已点赞
      const existingLike = await RatingLike.findOne({
        where: {
          userId,
          targetType,
          targetId: actualTargetId
        },
        transaction
      });

      if (existingLike) {
        // 取消点赞
        await existingLike.destroy({ transaction });

        // 更新点赞数
        if (targetType === 'rating') {
          await Rating.decrement('like_count', {
            where: { id: actualTargetId },
            transaction
          });
        } else {
          await RatingReply.decrement('like_count', {
            where: { id: actualTargetId },
            transaction
          });
        }

        await transaction.commit();
        return { isLiked: false };
      } else {
        // 添加点赞
        await RatingLike.create({
          ratingId,
          userId,
          targetType,
          targetId: actualTargetId
        }, { transaction });

        // 更新点赞数
        if (targetType === 'rating') {
          await Rating.increment('like_count', {
            where: { id: actualTargetId },
            transaction
          });
        } else {
          await RatingReply.increment('like_count', {
            where: { id: actualTargetId },
            transaction
          });
        }

        await transaction.commit();
        return { isLiked: true };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户对评价的点赞状态
   */
  public async getUserLikeStatus(ratingId: number, userId: number) {
    const likes = await RatingLike.findAll({
      where: {
        ratingId,
        userId
      }
    });

    return likes.reduce((status, like) => {
      status[like.targetType + '_' + like.targetId] = true;
      return status;
    }, {} as Record<string, boolean>);
  }

  /**
   * 获取车辆评分统计
   */
  public async getVehicleRatingStats(vehicleId: number) {
    let stats = await VehicleRatingStats.findOne({
      where: { vehicleId }
    });

    if (!stats) {
      // 如果没有统计数据，实时计算
      const ratingData = await Rating.findAll({
        where: {
          vehicleId,
          status: 'approved'
        },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgOverall'],
          [sequelize.fn('AVG', sequelize.col('vehicle_rating')), 'avgVehicle'],
          [sequelize.fn('AVG', sequelize.col('service_rating')), 'avgService'],
          [sequelize.fn('AVG', sequelize.col('cleanliness_rating')), 'avgCleanliness'],
          [sequelize.fn('AVG', sequelize.col('accuracy_rating')), 'avgAccuracy'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount']
        ],
        raw: true
      });

      const data = ratingData[0] as any;

      stats = await VehicleRatingStats.create({
        vehicleId,
        ownerId: 0, // 需要从vehicle表获取
        totalRatings: parseInt(data.totalCount) || 0,
        overallRating: parseFloat(data.avgOverall) || 0,
        vehicleRating: parseFloat(data.avgVehicle) || 0,
        serviceRating: parseFloat(data.avgService) || 0,
        cleanlinessRating: parseFloat(data.avgCleanliness) || 0,
        accuracyRating: parseFloat(data.avgAccuracy) || 0
      });
    }

    return stats;
  }

  /**
   * 获取可用的评价标签
   */
  public async getRatingTags(category?: string) {
    const whereClause: any = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    return await RatingTag.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * 用户隐藏自己的评价
   */
  public async hideRating(ratingId: number, userId: number) {
    const rating = await Rating.findOne({
      where: {
        id: ratingId,
        userId
      }
    });

    if (!rating) {
      throw new Error('RATING_NOT_FOUND');
    }

    await rating.update({ isHidden: true });
    return rating;
  }

  /**
   * 获取用户评价统计
   */
  public async getUserRatingStats(userId: number) {
    const stats = await Rating.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
        [sequelize.fn('AVG', sequelize.col('overall_rating')), 'avgOverallRating']
      ],
      raw: true
    });

    return stats[0] || {
      totalRatings: 0,
      avgOverallRating: 0
    };
  }

  /**
   * 验证评分范围
   */
  private validateRatings(ratings: {
    overallRating: number;
    vehicleRating: number;
    serviceRating: number;
    cleanlinessRating: number;
    accuracyRating: number;
  }) {
    const fields = [
      { name: 'overallRating', value: ratings.overallRating },
      { name: 'vehicleRating', value: ratings.vehicleRating },
      { name: 'serviceRating', value: ratings.serviceRating },
      { name: 'cleanlinessRating', value: ratings.cleanlinessRating },
      { name: 'accuracyRating', value: ratings.accuracyRating }
    ];

    for (const field of fields) {
      if (field.value < 1.0 || field.value > 5.0) {
        throw new Error(`INVALID_RATING_${field.name.toUpperCase()}`);
      }
    }
  }
}