// 车辆控制器
import { Request, Response } from 'express';
import { VehicleService } from '../services/VehicleService';
import { BaseController } from './BaseController';
import { VehicleQueryParams, VehicleDetail } from '../types/vehicle';
import { GenerateRequestId } from '../utils/response';

export class VehicleController extends BaseController {
  private vehicleService: VehicleService;

  constructor() {
    super();
    this.vehicleService = new VehicleService();
  }

  /**
   * 获取车辆列表
   */
  async getVehicles(req: Request, res: Response) {
    try {
      const query: VehicleQueryParams = {
        page: Number(req.query.page) || 1,
        pageSize: Math.min(Number(req.query.pageSize) || 20, 100),
        brandId: req.query.brandId ? Number(req.query.brandId) : undefined,
        categoryId: req.query.categoryId as string || undefined,
        seats: req.query.seats ? Number(req.query.seats) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        fuelType: req.query.fuelType as string || undefined,
        storeId: req.query.storeId ? Number(req.query.storeId) : undefined,
        sortBy: (req.query.sortBy as string) || 'popular',
        pickupCity: req.query.pickupCity as string || undefined,
        features: req.query.features ? (req.query.features as string).split(',').filter(Boolean) : undefined,
      };

      const result = await this.vehicleService.getVehicles(query);

      const filters = await this.vehicleService.getVehicleFilters(query);

      res.json(this.success({
        list: result.vehicles,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: result.total,
          pages: Math.ceil(result.total / query.pageSize),
        },
        filters,
      }));

      // 记录搜索日志
      if (req.query.keyword || Object.keys(req.query).length > 2) {
        await this.vehicleService.logVehicleSearch({
          userId: req.user?.id || null,
          query: req.query as any,
          resultCount: result.total,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
    } catch (error) {
      console.error('获取车辆列表失败:', error);
      res.status(500).json(this.error('获取车辆列表失败', 500, error.message));
    }
  }

  /**
   * 获取车辆详情
   */
  async getVehicleById(req: Request, res: Response) {
    try {
      const vehicleId = Number(req.params.id);

      if (!vehicleId || vehicleId <= 0) {
        return res.status(400).json(this.error('无效的车辆ID', 400));
      }

      const vehicle: VehicleDetail = await this.vehicleService.getVehicleById(vehicleId);

      if (!vehicle) {
        return res.status(404).json(this.error('车辆不存在', 404));
      }

      // 记录浏览日志
      await this.vehicleService.logVehicleView({
        vehicleId,
        userId: req.user?.id || null,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // 检查是否已收藏
      let isFavorited = false;
      if (req.user?.id) {
        isFavorited = await this.vehicleService.isVehicleFavorited(vehicleId, req.user.id);
      }

      res.json(this.success({
        ...vehicle,
        isFavorited,
      }));
    } catch (error) {
      console.error('获取车辆详情失败:', error);
      res.status(500).json(this.error('获取车辆详情失败', 500, error.message));
    }
  }

  /**
   * 获取车辆图片列表
   */
  async getVehicleImages(req: Request, res: Response) {
    try {
      const vehicleId = Number(req.params.id);

      if (!vehicleId || vehicleId <= 0) {
        return res.status(400).json(this.error('无效的车辆ID', 400));
      }

      const images = await this.vehicleService.getVehicleImages(vehicleId);

      res.json(this.success(images));
    } catch (error) {
      console.error('获取车辆图片失败:', error);
      res.status(500).json(this.error('获取车辆图片失败', 500, error.message));
    }
  }

  /**
   * 获取车辆品牌列表
   */
  async getVehicleBrands(req: Request, res: Response) {
    try {
      const brands = await this.vehicleService.getVehicleBrands();
      res.json(this.success(brands));
    } catch (error) {
      console.error('获取车辆品牌失败:', error);
      res.status(500).json(this.error('获取车辆品牌失败', 500, error.message));
    }
  }

  /**
   * 获取车辆特性列表
   */
  async getVehicleFeatures(req: Request, res: Response) {
    try {
      const features = await this.vehicleService.getVehicleFeatures();
      res.json(this.success(features));
    } catch (error) {
      console.error('获取车辆特性失败:', error);
      res.status(500).json(this.error('获取车辆特性失败', 500, error.message));
    }
  }

  /**
   * 收藏车辆
   */
  async favoriteVehicle(req: Request, res: Response) {
    try {
      const vehicleId = Number(req.params.id);
      const userId = req.user!.id;

      if (!vehicleId || vehicleId <= 0) {
        return res.status(400).json(this.error('无效的车辆ID', 400));
      }

      // 检查车辆是否存在
      const vehicle = await this.vehicleService.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json(this.error('车辆不存在', 404));
      }

      // 检查是否已收藏
      const isFavorited = await this.vehicleService.isVehicleFavorited(vehicleId, userId);
      if (isFavorited) {
        return res.status(400).json(this.error('车辆已收藏', 400));
      }

      await this.vehicleService.favoriteVehicle(vehicleId, userId);

      res.json(this.success(null, '收藏成功'));
    } catch (error) {
      console.error('收藏车辆失败:', error);
      res.status(500).json(this.error('收藏车辆失败', 500, error.message));
    }
  }

  /**
   * 取消收藏车辆
   */
  async unfavoriteVehicle(req: Request, res: Response) {
    try {
      const vehicleId = Number(req.params.id);
      const userId = req.user!.id;

      if (!vehicleId || vehicleId <= 0) {
        return res.status(400).json(this.error('无效的车辆ID', 400));
      }

      // 检查是否已收藏
      const isFavorited = await this.vehicleService.isVehicleFavorited(vehicleId, userId);
      if (!isFavorited) {
        return res.status(400).json(this.error('车辆未收藏', 400));
      }

      await this.vehicleService.unfavoriteVehicle(vehicleId, userId);

      res.json(this.success(null, '取消收藏成功'));
    } catch (error) {
      console.error('取消收藏车辆失败:', error);
      res.status(500).json(this.error('取消收藏车辆失败', 500, error.message));
    }
  }

  /**
   * 获取用户收藏的车辆列表
   */
  async getFavoriteVehicles(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = Number(req.query.page) || 1;
      const pageSize = Math.min(Number(req.query.pageSize) || 20, 100);

      const result = await this.vehicleService.getFavoriteVehicles(userId, page, pageSize);

      res.json(this.success({
        list: result.vehicles,
        pagination: {
          page,
          pageSize,
          total: result.total,
          pages: Math.ceil(result.total / pageSize),
        },
      }));
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      res.status(500).json(this.error('获取收藏列表失败', 500, error.message));
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(req: Request, res: Response) {
    try {
      const keyword = req.query.keyword as string;
      const limit = Math.min(Number(req.query.limit) || 5, 10);

      if (!keyword || keyword.trim().length === 0) {
        return res.status(400).json(this.error('搜索关键词不能为空', 400));
      }

      const suggestions = await this.vehicleService.getSearchSuggestions(keyword.trim(), limit);

      res.json(this.success(suggestions));
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      res.status(500).json(this.error('获取搜索建议失败', 500, error.message));
    }
  }
}