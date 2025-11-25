// 车辆服务类
import { Vehicle, VehicleModel, VehicleBrand, VehicleImage, VehicleFeature } from '../models';
import { Op } from 'sequelize';
import {
  VehicleQueryParams,
  VehicleDetail,
  VehicleListItem,
  VehicleFilter,
  SearchLog,
  ViewLog
} from '../types/vehicle';
import { sequelize } from '../database/connection';
import Redis from 'ioredis';

export class VehicleService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * 获取车辆列表
   */
  async getVehicles(query: VehicleQueryParams): Promise<{ vehicles: VehicleListItem[], total: number }> {
    const {
      page,
      pageSize,
      brandId,
      categoryId,
      seats,
      minPrice,
      maxPrice,
      fuelType,
      storeId,
      sortBy = 'popular',
      pickupCity,
      features,
    } = query;

    const offset = (page - 1) * pageSize;
    const whereConditions: any = {
      'Vehicle.status': 'active',
      'Vehicle.availability_status': '可用',
      'Vehicle.maintenance_status': '正常',
      'VehicleBrand.status': 'active',
      'VehicleModel.status': 'active',
    };

    // 构建查询条件
    if (brandId) {
      whereConditions['VehicleModel.brand_id'] = brandId;
    }

    if (categoryId) {
      whereConditions['VehicleModel.category'] = categoryId;
    }

    if (seats) {
      whereConditions['VehicleModel.seats'] = seats;
    }

    if (minPrice || maxPrice) {
      whereConditions['Vehicle.daily_rate'] = {};
      if (minPrice) whereConditions['Vehicle.daily_rate'][Op.gte] = minPrice;
      if (maxPrice) whereConditions['Vehicle.daily_rate'][Op.lte] = maxPrice;
    }

    if (fuelType) {
      whereConditions['VehicleModel.fuel_type'] = fuelType;
    }

    if (storeId) {
      whereConditions['Vehicle.store_id'] = storeId;
    }

    if (pickupCity) {
      // 关联门店表查询城市
      whereConditions['$Store.city$'] = pickupCity;
    }

    if (features && features.length > 0) {
      whereConditions['$VehicleFeatures.id$'] = {
        [Op.in]: features
      };
    }

    // 构建排序条件
    let order: any[] = [];
    switch (sortBy) {
      case 'price_asc':
        order.push(['Vehicle', 'daily_rate', 'ASC']);
        break;
      case 'price_desc':
        order.push(['Vehicle', 'daily_rate', 'DESC']);
        break;
      case 'rating_desc':
        order.push(['Vehicle', 'rating_avg', 'DESC']);
        break;
      case 'created_desc':
        order.push(['Vehicle', 'created_at', 'DESC']);
        break;
      case 'popular':
      default:
        order.push(['Vehicle', 'rental_count', 'DESC']);
        order.push(['Vehicle', 'rating_avg', 'DESC']);
        break;
    }

    // 默认排序
    order.push(['Vehicle', 'sort_order', 'DESC']);
    order.push(['Vehicle', 'id', 'DESC']);

    // 查询车辆列表
    const { count, rows } = await Vehicle.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: VehicleModel,
          as: 'VehicleModel',
          include: [
            {
              model: VehicleBrand,
              as: 'VehicleBrand',
            }
          ]
        },
        {
          model: VehicleImage,
          as: 'VehicleImages',
          where: { status: 'active' },
          required: false,
          separate: true,
          order: [['sort_order', 'ASC'], ['is_main', 'DESC']],
        },
        {
          model: VehicleFeature,
          as: 'VehicleFeatures',
          where: { status: 'active' },
          required: false,
          through: { attributes: [] },
        },
      ],
      offset,
      limit: pageSize,
      order,
      distinct: true,
    });

    // 转换数据格式
    const vehicles: VehicleListItem[] = rows.map(vehicle => ({
      id: vehicle.id,
      nickname: vehicle.nickname,
      brand: vehicle.VehicleModel?.VehicleBrand?.name || '',
      brandId: vehicle.VehicleModel?.brand_id || 0,
      model: vehicle.VehicleModel?.name || '',
      categoryId: vehicle.VehicleModel?.category || '',
      categoryName: this.getCategoryName(vehicle.VehicleModel?.category || ''),
      seats: vehicle.VehicleModel?.seats || 0,
      sleepers: vehicle.VehicleModel?.sleepers || 0,
      dailyRate: Number(vehicle.daily_rate),
      weeklyRate: vehicle.weekly_rate ? Number(vehicle.weekly_rate) : undefined,
      monthlyRate: vehicle.monthly_rate ? Number(vehicle.monthly_rate) : undefined,
      deposit: Number(vehicle.deposit),
      fuelType: vehicle.VehicleModel?.fuel_type || '',
      transmission: vehicle.VehicleModel?.transmission || '',
      length: vehicle.VehicleModel?.length,
      category: vehicle.VehicleModel?.category || '',
      ratingAvg: Number(vehicle.rating_avg),
      ratingCount: vehicle.rating_count,
      rentalCount: vehicle.rental_count,
      mainImage: vehicle.VehicleImages?.find(img => img.is_main)?.image_url || vehicle.VehicleImages?.[0]?.image_url || '',
      images: vehicle.VehicleImages?.map(img => img.image_url) || [],
      features: vehicle.VehicleFeatures?.map(feature => ({
        id: feature.id,
        name: feature.name,
        icon: feature.icon,
      })) || [],
      storeId: vehicle.store_id,
      availabilityStatus: vehicle.availability_status,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    }));

    return { vehicles, total: count };
  }

  /**
   * 获取车辆详情
   */
  async getVehicleById(vehicleId: number): Promise<VehicleDetail | null> {
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        status: 'active',
      },
      include: [
        {
          model: VehicleModel,
          as: 'VehicleModel',
          include: [
            {
              model: VehicleBrand,
              as: 'VehicleBrand',
            }
          ]
        },
        {
          model: VehicleImage,
          as: 'VehicleImages',
          where: { status: 'active' },
          required: false,
          separate: true,
          order: [['sort_order', 'ASC'], ['is_main', 'DESC']],
        },
        {
          model: VehicleFeature,
          as: 'VehicleFeatures',
          where: { status: 'active' },
          required: false,
          through: { attributes: [] },
        },
      ],
    });

    if (!vehicle) {
      return null;
    }

    // 转换为详情格式
    return {
      id: vehicle.id,
      nickname: vehicle.nickname,
      brand: vehicle.VehicleModel?.VehicleBrand?.name || '',
      brandId: vehicle.VehicleModel?.brand_id || 0,
      model: vehicle.VehicleModel?.name || '',
      categoryId: vehicle.VehicleModel?.category || '',
      categoryName: this.getCategoryName(vehicle.VehicleModel?.category || ''),
      seats: vehicle.VehicleModel?.seats || 0,
      sleepers: vehicle.VehicleModel?.sleepers || 0,
      dailyRate: Number(vehicle.daily_rate),
      weeklyRate: vehicle.weekly_rate ? Number(vehicle.weekly_rate) : undefined,
      monthlyRate: vehicle.monthly_rate ? Number(vehicle.monthly_rate) : undefined,
      deposit: Number(vehicle.deposit),
      serviceFee: Number(vehicle.service_fee),
      insuranceFee: Number(vehicle.insurance_fee),
      kilometerLimit: vehicle.kilometer_limit,
      excessKmFee: Number(vehicle.excess_km_fee),
      minimumRentalDays: vehicle.minimum_rental_days,
      maximumRentalDays: vehicle.maximum_rental_days,
      fuelType: vehicle.VehicleModel?.fuel_type || '',
      transmission: vehicle.VehicleModel?.transmission || '',
      length: vehicle.VehicleModel?.length,
      width: vehicle.VehicleModel?.width,
      height: vehicle.VehicleModel?.height,
      wheelbase: vehicle.VehicleModel?.wheelbase,
      curbWeight: vehicle.VehicleModel?.curb_weight,
      maxWeight: vehicle.VehicleModel?.max_weight,
      displacement: vehicle.VehicleModel?.displacement,
      toilet: vehicle.VehicleModel?.toilet || '无',
      kitchen: vehicle.VehicleModel?.kitchen || '无',
      shower: vehicle.VehicleModel?.shower || '无',
      waterTank: vehicle.VehicleModel?.water_tank,
      features: vehicle.VehicleFeatures?.map(feature => ({
        id: feature.id,
        name: feature.name,
        icon: feature.icon,
        description: feature.description,
        type: feature.feature_type,
      })) || [],
      images: vehicle.VehicleImages?.map(img => ({
        id: img.id,
        url: img.image_url,
        type: img.image_type,
        title: img.image_title,
        description: img.image_description,
        isMain: img.is_main,
        sortOrder: img.sort_order,
      })) || [],
      description: vehicle.description || '',
      rentalRules: vehicle.rental_rules || '',
      ratingAvg: Number(vehicle.rating_avg),
      ratingCount: vehicle.rating_count,
      rentalCount: vehicle.rental_count,
      totalRentalDays: vehicle.total_rental_days,
      availabilityStatus: vehicle.availability_status,
      maintenanceStatus: vehicle.maintenance_status,
      storeId: vehicle.store_id,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    };
  }

  /**
   * 获取车辆图片
   */
  async getVehicleImages(vehicleId: number): Promise<VehicleImage[]> {
    return await VehicleImage.findAll({
      where: {
        vehicle_id: vehicleId,
        status: 'active',
      },
      order: [['sort_order', 'ASC'], ['is_main', 'DESC']],
    });
  }

  /**
   * 获取车辆品牌列表
   */
  async getVehicleBrands(): Promise<VehicleBrand[]> {
    const cacheKey = 'vehicle_brands';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const brands = await VehicleBrand.findAll({
      where: { status: 'active' },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });

    await this.redis.setex(cacheKey, 3600, JSON.stringify(brands)); // 缓存1小时

    return brands;
  }

  /**
   * 获取车辆特性列表
   */
  async getVehicleFeatures(): Promise<VehicleFeature[]> {
    const cacheKey = 'vehicle_features';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const features = await VehicleFeature.findAll({
      where: { status: 'active' },
      order: [['feature_type', 'ASC'], ['sort_order', 'ASC'], ['name', 'ASC']],
    });

    await this.redis.setex(cacheKey, 3600, JSON.stringify(features)); // 缓存1小时

    return features;
  }

  /**
   * 获取筛选条件
   */
  async getVehicleFilters(query: Partial<VehicleQueryParams>): Promise<VehicleFilter> {
    const [brands, features, categories] = await Promise.all([
      this.getVehicleBrands(),
      this.getVehicleFeatures(),
      this.getVehicleCategories(),
    ]);

    return {
      brands,
      features: this.groupFeaturesByType(features),
      categories,
      priceRanges: [
        { label: '300元以下', min: 0, max: 300 },
        { label: '300-500元', min: 300, max: 500 },
        { label: '500-800元', min: 500, max: 800 },
        { label: '800-1200元', min: 800, max: 1200 },
        { label: '1200元以上', min: 1200, max: null },
      ],
      seatOptions: [2, 3, 4, 5, 6, 7, 8],
      fuelTypes: ['汽油', '柴油', '新能源', '混动'],
    };
  }

  /**
   * 收藏车辆
   */
  async favoriteVehicle(vehicleId: number, userId: number): Promise<void> {
    // 这里应该有用户收藏表，暂时使用redis
    const key = `user_favorites:${userId}`;
    await this.redis.sadd(key, vehicleId);
    await this.redis.expire(key, 86400 * 30); // 30天过期
  }

  /**
   * 取消收藏车辆
   */
  async unfavoriteVehicle(vehicleId: number, userId: number): Promise<void> {
    const key = `user_favorites:${userId}`;
    await this.redis.srem(key, vehicleId);
  }

  /**
   * 检查是否已收藏
   */
  async isVehicleFavorited(vehicleId: number, userId: number): Promise<boolean> {
    const key = `user_favorites:${userId}`;
    return await this.redis.sismember(key, vehicleId);
  }

  /**
   * 获取用户收藏的车辆
   */
  async getFavoriteVehicles(userId: number, page: number, pageSize: number): Promise<{ vehicles: VehicleListItem[], total: number }> {
    const key = `user_favorites:${userId}`;
    const vehicleIds = await this.redis.smembers(key);

    if (vehicleIds.length === 0) {
      return { vehicles: [], total: 0 };
    }

    const offset = (page - 1) * pageSize;
    const vehicleIdsNum = vehicleIds.map(id => Number(id)).slice(offset, offset + pageSize);

    const vehicles = await Vehicle.findAll({
      where: {
        id: vehicleIdsNum,
        status: 'active',
      },
      include: [
        {
          model: VehicleModel,
          as: 'VehicleModel',
          include: [
            {
              model: VehicleBrand,
              as: 'VehicleBrand',
            }
          ]
        },
        {
          model: VehicleImage,
          as: 'VehicleImages',
          where: { status: 'active' },
          required: false,
          separate: true,
          order: [['sort_order', 'ASC'], ['is_main', 'DESC']],
          limit: 1,
        },
      ],
    });

    const vehicleListItems: VehicleListItem[] = vehicles.map(vehicle => ({
      id: vehicle.id,
      nickname: vehicle.nickname,
      brand: vehicle.VehicleModel?.VehicleBrand?.name || '',
      model: vehicle.VehicleModel?.name || '',
      categoryId: vehicle.VehicleModel?.category || '',
      categoryName: this.getCategoryName(vehicle.VehicleModel?.category || ''),
      seats: vehicle.VehicleModel?.seats || 0,
      dailyRate: Number(vehicle.daily_rate),
      deposit: Number(vehicle.deposit),
      ratingAvg: Number(vehicle.rating_avg),
      ratingCount: vehicle.rating_count,
      mainImage: vehicle.VehicleImages?.[0]?.image_url || '',
      features: [],
      storeId: vehicle.store_id,
      availabilityStatus: vehicle.availability_status,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    }));

    return { vehicles: vehicleListItems, total: vehicleIds.length };
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(keyword: string, limit: number): Promise<string[]> {
    // 简单实现，从品牌和型号中搜索
    const [brands, models] = await Promise.all([
      VehicleBrand.findAll({
        where: {
          name: {
            [Op.like]: `%${keyword}%`
          },
          status: 'active',
        },
        limit,
      }),
      VehicleModel.findAll({
        where: {
          name: {
            [Op.like]: `%${keyword}%`
          },
          status: 'active',
        },
        include: [
          {
            model: VehicleBrand,
            as: 'VehicleBrand',
            attributes: ['name'],
          }
        ],
        limit,
      }),
    ]);

    const suggestions = new Set<string>();

    brands.forEach(brand => suggestions.add(brand.name));
    models.forEach(model => {
      suggestions.add(`${model.VehicleBrand?.name} ${model.name}`);
      suggestions.add(model.name);
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * 记录搜索日志
   */
  async logVehicleSearch(log: SearchLog): Promise<void> {
    // 异步记录，不阻塞主流程
    setImmediate(async () => {
      try {
        // 这里应该保存到数据库，暂时记录日志
        console.log('Vehicle search log:', log);
      } catch (error) {
        console.error('Failed to log vehicle search:', error);
      }
    });
  }

  /**
   * 记录浏览日志
   */
  async logVehicleView(log: ViewLog): Promise<void> {
    // 异步记录，不阻塞主流程
    setImmediate(async () => {
      try {
        // 这里应该保存到数据库，暂时记录日志
        console.log('Vehicle view log:', log);

        // 增加浏览次数
        await Vehicle.increment('view_count', {
          where: { id: log.vehicleId }
        });
      } catch (error) {
        console.error('Failed to log vehicle view:', error);
      }
    });
  }

  /**
   * 获取房车类型名称
   */
  private getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'A型': '自行式A型',
      'B型': '自行式B型',
      'C型': '自行式C型',
      '拖挂A型': '拖挂A型',
      '拖挂B型': '拖挂B型',
      '拖挂C型': '拖挂C型',
      '房车巴士': '房车巴士',
      '越野房车': '越野房车',
      '自行式A型': '自行式A型',
      '自行式B型': '自行式B型',
      '自行式C型': '自行式C型',
    };
    return categoryNames[category] || category;
  }

  /**
   * 获取房车类型列表
   */
  private async getVehicleCategories(): Promise<Array<{ value: string; label: string }>> {
    return [
      { value: '自行式A型', label: '自行式A型' },
      { value: '自行式B型', label: '自行式B型' },
      { value: '自行式C型', label: '自行式C型' },
      { value: '拖挂A型', label: '拖挂A型' },
      { value: '拖挂B型', label: '拖挂B型' },
      { value: '拖挂C型', label: '拖挂C型' },
      { value: '房车巴士', label: '房车巴士' },
      { value: '越野房车', label: '越野房车' },
    ];
  }

  /**
   * 按类型分组特性
   */
  private groupFeaturesByType(features: VehicleFeature[]): { [type: string]: VehicleFeature[] } {
    const grouped: { [type: string]: VehicleFeature[] } = {};

    features.forEach(feature => {
      const type = feature.feature_type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(feature);
    });

    return grouped;
  }
}