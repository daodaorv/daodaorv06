import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@config/index';

/**
 * JWT工具类
 */

export interface JwtPayload {
  userId: number;
  username: string;
  userType: string;
}

/**
 * 生成访问令牌
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);
}

/**
 * 验证访问令牌
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    // Token无效或已过期
    return null;
  }
}

/**
 * 验证刷新令牌
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
