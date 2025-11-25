import { Op } from 'sequelize';
import { UserFavorite, FavoriteFolder, FavoriteLog, FavoriteStats, User, Vehicle } from '../models';
import { sequelize } from '../config/database';

export interface FavoriteFilters {
  targetType?: 'vehicle' | 'article' | 'store';
  folderName?: string;
  tags?: string[];
  keyword?: string;
  isPublic?: boolean;
}

export interface CreateFavoriteData {
  userId: number;
  targetType: 'vehicle' | 'article' | 'store';
  targetId: number;
  targetTitle: string;
  targetImage?: string;
  targetPrice?: number;
  targetData?: any;
  folderName?: string;
  tags?: string[];
  note?: string;
}

export interface UpdateFavoriteData {
  folderName?: string;
  tags?: string[];
  note?: string;
}

export class FavoriteService {
  /**
   * 添加收藏
   */
  public async addFavorite(data: CreateFavoriteData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查是否已收藏
      const existingFavorite = await UserFavorite.findOne({
        where: {
          userId: data.userId,
          targetType: data.targetType,
          targetId: data.targetId,
          isActive: true
        },
        transaction
      });

      if (existingFavorite) {
        throw new Error('ALREADY_FAVORITED');
      }

      // 确保收藏夹存在，如果不存在则创建
      const folderName = data.folderName || '默认收藏夹';
      await this.ensureFolderExists(data.userId, folderName, transaction);

      // 创建收藏记录
      const favorite = await UserFavorite.create({
        userId: data.userId,
        targetType: data.targetType,
        targetId: data.targetId,
        targetTitle: data.targetTitle,
        targetImage: data.targetImage,
        targetPrice: data.targetPrice,
        targetData: data.targetData,
        folderName,
        tags: data.tags || [],
        note: data.note,
        isActive: true
      }, { transaction });

      // 记录操作日志
      await FavoriteLog.create({
        userId: data.userId,
        favoriteId: favorite.id,
        targetType: data.targetType,
        targetId: data.targetId,
        action: 'add',
        newFolder: folderName,
        reason: '用户收藏'
      }, { transaction });

      await transaction.commit();
      return favorite;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 取消收藏
   */
  public async removeFavorite(userId: number, targetType: string, targetId: number) {
    const transaction = await sequelize.transaction();

    try {
      const favorite = await UserFavorite.findOne({
        where: {
          userId,
          targetType,
          targetId,
          isActive: true
        },
        transaction
      });

      if (!favorite) {
        throw new Error('FAVORITE_NOT_FOUND');
      }

      // 更新收藏状态为无效
      await favorite.update({ isActive: false }, { transaction });

      // 记录操作日志
      await FavoriteLog.create({
        userId,
        favoriteId: favorite.id,
        targetType,
        targetId,
        action: 'remove',
        reason: '用户取消收藏'
      }, { transaction });

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户收藏列表
   */
  public async getUserFavorites(
    userId: number,
    page: number = 1,
    limit: number = 20,
    filters: FavoriteFilters = {}
  ) {
    const whereClause: any = {
      userId,
      isActive: true
    };

    // 构建查询条件
    if (filters.targetType) {
      whereClause.targetType = filters.targetType;
    }

    if (filters.folderName) {
      whereClause.folderName = filters.folderName;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause[Op.and] = filters.tags.map(tag => ({
        tags: {
          [Op.contains]: tag
        }
      }));
    }

    if (filters.keyword) {
      whereClause.targetTitle = {
        [Op.like]: `%${filters.keyword}%`
      };
    }

    const { count, rows } = await UserFavorite.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      favorites: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 获取收藏详情
   */
  public async getFavoriteDetail(userId: number, favoriteId: number) {
    const favorite = await UserFavorite.findOne({
      where: {
        id: favoriteId,
        userId,
        isActive: true
      }
    });

    if (!favorite) {
      throw new Error('FAVORITE_NOT_FOUND');
    }

    return favorite;
  }

  /**
   * 更新收藏信息
   */
  public async updateFavorite(userId: number, favoriteId: number, updateData: UpdateFavoriteData) {
    const transaction = await sequelize.transaction();

    try {
      const favorite = await UserFavorite.findOne({
        where: {
          id: favoriteId,
          userId,
          isActive: true
        },
        transaction
      });

      if (!favorite) {
        throw new Error('FAVORITE_NOT_FOUND');
      }

      const oldFolder = favorite.folderName;

      // 如果更换了收藏夹，确保新收藏夹存在
      if (updateData.folderName && updateData.folderName !== oldFolder) {
        await this.ensureFolderExists(userId, updateData.folderName, transaction);
      }

      // 更新收藏信息
      const updatedFavorite = await favorite.update(updateData, { transaction });

      // 记录操作日志
      const logAction = updateData.folderName && updateData.folderName !== oldFolder ? 'move' : 'update';
      await FavoriteLog.create({
        userId,
        favoriteId,
        targetType: favorite.targetType,
        targetId: favorite.targetId,
        action: logAction,
        oldFolder: logAction === 'move' ? oldFolder : undefined,
        newFolder: updateData.folderName,
        reason: '用户更新收藏'
      }, { transaction });

      await transaction.commit();
      return updatedFavorite;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户收藏夹列表
   */
  public async getUserFolders(userId: number) {
    return await FavoriteFolder.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * 创建收藏夹
   */
  public async createFolder(userId: number, folderData: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isPrivate?: boolean;
  }) {
    // 检查收藏夹名称是否已存在
    const existingFolder = await FavoriteFolder.findOne({
      where: {
        userId,
        name: folderData.name
      }
    });

    if (existingFolder) {
      throw new Error('FOLDER_NAME_EXISTS');
    }

    const folder = await FavoriteFolder.create({
      userId,
      name: folderData.name,
      description: folderData.description,
      icon: folderData.icon || 'star',
      color: folderData.color || '#FF9F29',
      isPrivate: folderData.isPrivate !== false, // 默认为私有
      sortOrder: await this.getNextFolderSortOrder(userId)
    });

    return folder;
  }

  /**
   * 检查是否已收藏
   */
  public async isFavorited(userId: number, targetType: string, targetId: number): Promise<boolean> {
    const favorite = await UserFavorite.findOne({
      where: {
        userId,
        targetType,
        targetId,
        isActive: true
      }
    });

    return !!favorite;
  }

  /**
   * 获取收藏统计
   */
  public async getFavoriteStats(targetType: string, targetId: number) {
    let stats = await FavoriteStats.findOne({
      where: {
        targetType,
        targetId
      }
    });

    if (!stats) {
      // 如果没有统计数据，实时计算
      const count = await UserFavorite.count({
        where: {
          targetType,
          targetId,
          isActive: true
        }
      });

      stats = await FavoriteStats.create({
        targetType,
        targetId,
        favoriteCount: count,
        dailyCount: 0,
        weeklyCount: 0,
        monthlyCount: 0
      });
    }

    return stats;
  }

  /**
   * 获取用户收藏统计
   */
  public async getUserFavoriteStats(userId: number) {
    const stats = await UserFavorite.findAll({
      where: {
        userId,
        isActive: true
      },
      attributes: [
        'targetType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['targetType'],
      raw: true
    });

    const result = {
      total: 0,
      vehicle: 0,
      article: 0,
      store: 0
    };

    stats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      result.total += count;
      result[stat.targetType] = count;
    });

    return result;
  }

  /**
   * 确保收藏夹存在
   */
  private async ensureFolderExists(userId: number, folderName: string, transaction: any) {
    const folder = await FavoriteFolder.findOne({
      where: {
        userId,
        name: folderName
      },
      transaction
    });

    if (!folder) {
      await FavoriteFolder.create({
        userId,
        name: folderName,
        isDefault: false,
        sortOrder: await this.getNextFolderSortOrder(userId)
      }, { transaction });
    }
  }

  /**
   * 获取下一个收藏夹排序值
   */
  private async getNextFolderSortOrder(userId: number): Promise<number> {
    const lastFolder = await FavoriteFolder.findOne({
      where: { userId },
      order: [['sortOrder', 'DESC']],
      attributes: ['sortOrder']
    });

    return (lastFolder?.sortOrder || 0) + 1;
  }
}