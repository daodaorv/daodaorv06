import { RowDataPacket } from 'mysql2';

/**
 * 用户钱包
 */
export interface UserWallet extends RowDataPacket {
  id: number;
  user_id: number;
  balance: number;
  frozen_balance: number;
  total_income: number;
  total_expense: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * 钱包交易记录
 */
export interface WalletTransaction extends RowDataPacket {
  id: number;
  wallet_id: number;
  user_id: number;
  type: 'recharge' | 'withdraw' | 'payment' | 'refund' | 'income';
  amount: number;
  balance: number;
  description?: string;
  related_order_id?: number;
  created_at: Date;
}
