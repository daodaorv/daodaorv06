/**
 * 联系人相关类型定义
 */

import { RowDataPacket } from 'mysql2/promise';

export interface Contact extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  phone: string;
  idCard: string;
  driverLicenseNo: string;
  driverLicenseFront: string;
  driverLicenseBack: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactPayload {
  userId: number;
  name: string;
  phone: string;
  idCard: string;
  driverLicenseNo: string;
  driverLicenseFront: string;
  driverLicenseBack: string;
  isDefault?: boolean;
}

export interface UpdateContactPayload {
  name?: string;
  phone?: string;
  idCard?: string;
  driverLicenseNo?: string;
  driverLicenseFront?: string;
  driverLicenseBack?: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive';
}
