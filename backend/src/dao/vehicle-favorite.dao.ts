import { BaseDao } from './base.dao';
import { RowDataPacket } from 'mysql2';
import { QueryBuilder } from '../db/query-builder';

/**
 * 车辆收藏数据访问对象
 */

interface VehicleFavorite extends RowDataPacket {
  id: number;
  user_id: number;
  vehicle_id: number;
  created_at: Date;
  updated_at: Date;
}

export class VehicleFavoriteDAO extends BaseDao<VehicleFavorite> {
  constructor() {
    super('vehicle_favorites');
  }

  /**
   * 添加收藏
   */
  async addFavorite(userId: number, vehicleId: number): Promise<number> {
    const sql = `
      INSERT INTO vehicle_favorites (user_id, vehicle_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `;
    const result = await QueryBuilder.insert(sql, [userId, vehicleId]);
    return result.insertId;
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: number, vehicleId: number): Promise<boolean> {
    const sql = `
      DELETE FROM vehicle_favorites
      WHERE user_id = ? AND vehicle_id = ?
    `;
    const affectedRows = await QueryBuilder.delete(sql, [userId, vehicleId]);
    return affectedRows > 0;
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(userId: number, vehicleId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM vehicle_favorites
      WHERE user_id = ? AND vehicle_id = ?
    `;
    const result = await QueryBuilder.queryOne<RowDataPacket & { count: number }>(sql, [
      userId,
      vehicleId,
    ]);
    return (result?.count || 0) > 0;
  }

  /**
   * 获取用户收藏列表
   */
  async getUserFavorites(params: {
    userId: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: any[]; total: number }> {
    const { userId, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM vehicle_favorites vf
      WHERE vf.user_id = ?
    `;
    const countResult = await QueryBuilder.queryOne<RowDataPacket & { total: number }>(countSql, [
      userId,
    ]);
    const total = countResult?.total || 0;

    // 查询列表(关联车辆信息)
    const listSql = `
      SELECT
        vf.id as favorite_id,
        vf.created_at as favorited_at,
        v.id,
        v.vehicle_no,
        v.model_id,
        v.store_id,
        v.license_plate,
        v.daily_price,
        v.deposit,
        v.status,
        v.images,
        vm.name as model_name,
        vm.brand,
        vm.series,
        vm.type as vehicle_type,
        vm.seats
      FROM vehicle_favorites vf
      INNER JOIN vehicles v ON vf.vehicle_id = v.id
      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
      WHERE vf.user_id = ?
      ORDER BY vf.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const list = await QueryBuilder.query<any>(listSql, [userId, pageSize, offset]);

    return { list, total };
  }

  /**
   * 获取用户收藏的车辆ID列表
   */
  async getUserFavoriteVehicleIds(userId: number): Promise<number[]> {
    const sql = `
      SELECT vehicle_id
      FROM vehicle_favorites
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const result = await QueryBuilder.query<RowDataPacket & { vehicle_id: number }>(sql, [userId]);
    return result.map((row) => row.vehicle_id);
  }
}
