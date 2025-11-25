import { Request, Response } from 'express';
import { FavoriteService } from '../services/favorite';
import { ApiResponse } from '../utils/response';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  /**
   * 添加收藏
   */
  public async addFavorite(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        targetType,
        targetId,
        targetTitle,
        targetImage,
        targetPrice,
        targetData,
        folderName,
        tags,
        note
      } = req.body;

      const favorite = await this.favoriteService.addFavorite({
        userId,
        targetType,
        targetId,
        targetTitle,
        targetImage,
        targetPrice,
        targetData,
        folderName,
        tags,
        note
      });

      res.json(
        ApiResponse.success('收藏成功', favorite)
      );
    } catch (error: any) {
      console.error('Add favorite error:', error);

      if (error.message === 'ALREADY_FAVORITED') {
        return res.status(400).json(
          ApiResponse.error('已收藏过该项目', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 取消收藏
   */
  public async removeFavorite(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { targetType, targetId } = req.params;

      const result = await this.favoriteService.removeFavorite(
        userId,
        targetType,
        parseInt(targetId)
      );

      res.json(
        ApiResponse.success('取消收藏成功', result)
      );
    } catch (error: any) {
      console.error('Remove favorite error:', error);

      if (error.message === 'FAVORITE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('收藏记录不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户收藏列表
   */
  public async getUserFavorites(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const {
        targetType,
        folderName,
        tags,
        keyword
      } = req.query;

      const filters = {
        targetType: targetType as any,
        folderName: folderName as string,
        tags: tags ? (tags as string).split(',') : undefined,
        keyword: keyword as string
      };

      const result = await this.favoriteService.getUserFavorites(
        userId,
        page,
        limit,
        filters
      );

      const pagination = {
        current: page,
        pageSize: limit,
        total: result.total,
        pages: result.totalPages
      };

      res.json(
        ApiResponse.success('获取成功', {
          favorites: result.favorites,
          pagination
        })
      );
    } catch (error: any) {
      console.error('Get user favorites error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取收藏详情
   */
  public async getFavoriteDetail(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const favoriteId = parseInt(req.params.favoriteId);

      const favorite = await this.favoriteService.getFavoriteDetail(userId, favoriteId);

      res.json(
        ApiResponse.success('获取成功', favorite)
      );
    } catch (error: any) {
      console.error('Get favorite detail error:', error);

      if (error.message === 'FAVORITE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('收藏记录不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 更新收藏信息
   */
  public async updateFavorite(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const favoriteId = parseInt(req.params.favoriteId);
      const { folderName, tags, note } = req.body;

      const favorite = await this.favoriteService.updateFavorite(userId, favoriteId, {
        folderName,
        tags,
        note
      });

      res.json(
        ApiResponse.success('更新成功', favorite)
      );
    } catch (error: any) {
      console.error('Update favorite error:', error);

      if (error.message === 'FAVORITE_NOT_FOUND') {
        return res.status(404).json(
          ApiResponse.error('收藏记录不存在', 404001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户收藏夹列表
   */
  public async getUserFolders(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const folders = await this.favoriteService.getUserFolders(userId);

      res.json(
        ApiResponse.success('获取成功', folders)
      );
    } catch (error: any) {
      console.error('Get user folders error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 创建收藏夹
   */
  public async createFolder(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, description, icon, color, isPrivate } = req.body;

      const folder = await this.favoriteService.createFolder(userId, {
        name,
        description,
        icon,
        color,
        isPrivate
      });

      res.json(
        ApiResponse.success('创建成功', folder)
      );
    } catch (error: any) {
      console.error('Create folder error:', error);

      if (error.message === 'FOLDER_NAME_EXISTS') {
        return res.status(400).json(
          ApiResponse.error('收藏夹名称已存在', 400001)
        );
      }

      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 检查是否已收藏
   */
  public async checkFavorited(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { targetType, targetId } = req.params;

      const isFavorited = await this.favoriteService.isFavorited(
        userId,
        targetType,
        parseInt(targetId)
      );

      res.json(
        ApiResponse.success('获取成功', { isFavorited })
      );
    } catch (error: any) {
      console.error('Check favorited error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取收藏统计
   */
  public async getFavoriteStats(req: Request, res: Response) {
    try {
      const { targetType, targetId } = req.params;

      const stats = await this.favoriteService.getFavoriteStats(
        targetType,
        parseInt(targetId)
      );

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get favorite stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }

  /**
   * 获取用户收藏统计
   */
  public async getUserFavoriteStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await this.favoriteService.getUserFavoriteStats(userId);

      res.json(
        ApiResponse.success('获取成功', stats)
      );
    } catch (error: any) {
      console.error('Get user favorite stats error:', error);
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500000)
      );
    }
  }
}