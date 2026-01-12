/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryBuilder } from '@db/query-builder';
import { Contact, CreateContactPayload, UpdateContactPayload } from '../types/models/contact.types';
import { logger } from '@utils/logger';

/**
 * 联系人数据访问对象
 */
export class ContactDAO {
  private tableName = 'contacts';

  /**
   * 将数据库字段转换为驼峰命名
   */
  private mapToContact(row: any): Contact {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      phone: row.phone,
      idCard: row.id_card,
      driverLicenseNo: row.driver_license_no,
      driverLicenseFront: row.driver_license_front,
      driverLicenseBack: row.driver_license_back,
      isDefault: Boolean(row.is_default),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Contact;
  }

  /**
   * 根据用户ID获取联系人列表
   */
  async findByUserId(userId: number): Promise<Contact[]> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE user_id = ? AND status = 'active'
        ORDER BY is_default DESC, created_at DESC
      `;
      const rows = await QueryBuilder.query<any>(sql, [userId]);
      return rows.map(row => this.mapToContact(row));
    } catch (error) {
      logger.error('根据用户ID获取联系人列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取联系人详情
   */
  async findById(id: number, userId: number): Promise<Contact | null> {
    try {
      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE id = ? AND user_id = ? AND status = 'active'
        LIMIT 1
      `;
      const row = await QueryBuilder.queryOne<any>(sql, [id, userId]);
      return row ? this.mapToContact(row) : null;
    } catch (error) {
      logger.error('根据ID获取联系人详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建联系人
   */
  async create(data: CreateContactPayload): Promise<number> {
    try {
      // 如果设置为默认联系人，先取消其他默认联系人
      if (data.isDefault) {
        await this.clearDefaultContact(data.userId);
      }

      const sql = `
        INSERT INTO ${this.tableName}
        (user_id, name, phone, id_card, driver_license_no, driver_license_front, driver_license_back, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await QueryBuilder.execute(sql, [
        data.userId,
        data.name,
        data.phone,
        data.idCard,
        data.driverLicenseNo,
        data.driverLicenseFront,
        data.driverLicenseBack,
        data.isDefault || false,
      ]);
      return result.insertId;
    } catch (error) {
      logger.error('创建联系人失败:', error);
      throw error;
    }
  }

  /**
   * 更新联系人
   */
  async update(id: number, userId: number, data: UpdateContactPayload): Promise<boolean> {
    try {
      // 如果设置为默认联系人，先取消其他默认联系人
      if (data.isDefault) {
        await this.clearDefaultContact(userId, id);
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      if (data.idCard !== undefined) {
        fields.push('id_card = ?');
        values.push(data.idCard);
      }
      if (data.driverLicenseNo !== undefined) {
        fields.push('driver_license_no = ?');
        values.push(data.driverLicenseNo);
      }
      if (data.driverLicenseFront !== undefined) {
        fields.push('driver_license_front = ?');
        values.push(data.driverLicenseFront);
      }
      if (data.driverLicenseBack !== undefined) {
        fields.push('driver_license_back = ?');
        values.push(data.driverLicenseBack);
      }
      if (data.isDefault !== undefined) {
        fields.push('is_default = ?');
        values.push(data.isDefault);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }

      if (fields.length === 0) {
        return false;
      }

      values.push(id, userId);
      const sql = `
        UPDATE ${this.tableName}
        SET ${fields.join(', ')}
        WHERE id = ? AND user_id = ?
      `;
      const result = await QueryBuilder.execute(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('更新联系人失败:', error);
      throw error;
    }
  }

  /**
   * 删除联系人（软删除）
   */
  async delete(id: number, userId: number): Promise<boolean> {
    try {
      const sql = `
        UPDATE ${this.tableName}
        SET status = 'inactive'
        WHERE id = ? AND user_id = ?
      `;
      const result = await QueryBuilder.execute(sql, [id, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('删除联系人失败:', error);
      throw error;
    }
  }

  /**
   * 清除默认联系人标记
   */
  private async clearDefaultContact(userId: number, excludeId?: number): Promise<void> {
    try {
      let sql = `
        UPDATE ${this.tableName}
        SET is_default = false
        WHERE user_id = ?
      `;
      const params: any[] = [userId];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      await QueryBuilder.execute(sql, params);
    } catch (error) {
      logger.error('清除默认联系人标记失败:', error);
      throw error;
    }
  }
}
