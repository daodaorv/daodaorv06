/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDao } from './base.dao';
import { RowDataPacket } from 'mysql2';
import { QueryBuilder } from '../db/query-builder';

/**
 * 车型库数据访问对象
 */

interface VehicleModel extends RowDataPacket {
  id: number;
  name: string;
  brand: string;
  series: string;
  type: string;
  seats: number;
  sleep_capacity: number;
  length: number;
  width: number;
  height: number;
  fuel_type: string;
  transmission: string;
  engine_displacement: number;
  features: string;
  specifications: string;
  images: string;
  description: string;
  status: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export class VehicleModelDAO extends BaseDao<VehicleModel> {
  constructor() {
    super('vehicle_models');
  }

  /**
   * 获取车型列表（带分页和筛选）
   */
  async getModels(params: {
    page?: number;
    pageSize?: number;
    brandId?: number;
    keyword?: string;
    vehicleType?: string;
    status?: string;
  }): Promise<{ list: VehicleModel[]; total: number }> {
    const { page = 1, pageSize = 10, brandId, keyword, vehicleType, status } = params;
    const offset = (page - 1) * pageSize;

    // 构建WHERE条件
    const conditions: string[] = [];
    const values: any[] = [];

    if (brandId) {
      conditions.push('brand = (SELECT name FROM vehicle_brands WHERE id = ?)');
      values.push(brandId);
    }

    if (keyword) {
      conditions.push('(name LIKE ? OR brand LIKE ?)');
      values.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (vehicleType) {
      conditions.push('type = ?');
      values.push(vehicleType);
    }

    if (status) {
      conditions.push('status = ?');
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM vehicle_models ${whereClause}`;
    const countResult = await QueryBuilder.query<RowDataPacket & { total: number }>(countSql, values);
    const total = countResult[0]?.total || 0;

    // 查询列表
    const listSql = `
      SELECT * FROM vehicle_models
      ${whereClause}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await QueryBuilder.query<VehicleModel>(listSql, [...values, pageSize, offset]);

    return { list, total };
  }

  /**
   * 根据ID获取车型详情
   */
  async getModelById(id: number): Promise<VehicleModel | null> {
    return this.findById(id);
  }

  /**
   * 创建车型
   */
  async createModel(data: Partial<VehicleModel>): Promise<number> {
    return this.insert(data);
  }

  /**
   * 更新车型
   */
  async updateModel(id: number, data: Partial<VehicleModel>): Promise<boolean> {
    const affectedRows = await this.update(id, data);
    return affectedRows > 0;
  }

  /**
   * 删除车型
   */
  async deleteModel(id: number): Promise<boolean> {
    const affectedRows = await this.delete(id);
    return affectedRows > 0;
  }
}
