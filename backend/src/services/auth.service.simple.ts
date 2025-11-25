import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

// 简化的用户数据类型
interface SimpleUser {
  id: string;
  phone: string;
  username?: string;
  password_hash: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: Date;
  updated_at: Date;
}

interface SimpleUserProfile {
  id: string;
  user_id: string;
  nickname?: string;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: Date;
  city?: string;
  province?: string;
  country?: string;
  created_at: Date;
  updated_at: Date;
}

interface SimpleVerificationCode {
  id: string;
  phone: string;
  code: string;
  code_type: 'register' | 'login' | 'reset_password';
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

// 简化的内存数据存储
const users = new Map<string, SimpleUser>();
const userProfiles = new Map<string, SimpleUserProfile>();
const verificationCodes = new Map<string, SimpleVerificationCode>();
const loginLogs = new Map<string, any>();

let nextId = 1;

// 创建测试用户
function createTestUser() {
  const testUserId = (nextId++).toString();
  const now = new Date();

  const testUser: SimpleUser = {
    id: testUserId,
    phone: '13800138000',
    username: 'testuser',
    password_hash: '$2a$10$QXB11Be/nATiDnLqRF9G1u4Ca/NqMrR4MlLPdz8fFkOVJ8ptwqY/i', // secret
    status: 'active',
    created_at: now,
    updated_at: now
  };

  const testProfile: SimpleUserProfile = {
    id: (nextId++).toString(),
    user_id: testUserId,
    nickname: '测试用户',
    avatar_url: 'https://via.placeholder.com/100x100?text=Avatar',
    gender: 'unknown',
    city: '北京',
    province: '北京',
    country: 'China',
    created_at: now,
    updated_at: now
  };

  users.set(testUserId, testUser);
  userProfiles.set(testUserId, testProfile);
}

// 初始化
createTestUser();

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'daodao_secret_key_2024';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (process.env.USE_MEMORY_DATA === 'true') {
      logger.info('AuthService using simplified memory data storage for development');
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateId(): string {
    return (nextId++).toString();
  }

  async sendVerificationCode(
    phone: string,
    codeType: 'register' | 'login' | 'reset_password' | 'bind_phone'
  ): Promise<{ success: boolean; expiresIn: number; code?: string }> {
    const code = this.generateVerificationCode();
    const codeTypeMap = {
      'register': 'register' as const,
      'login': 'login' as const,
      'reset_password': 'reset_password' as const,
      'bind_phone': 'login' as const
    };

    if (process.env.USE_MEMORY_DATA === 'true') {
      logger.info(`Verification code cooldown check passed for ${phone}`);

      // 创建验证码
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后过期

      // 删除同一手机号的旧验证码
      for (const [key, vc] of verificationCodes.entries()) {
        if (vc.phone === phone && vc.code_type === codeTypeMap[codeType]) {
          verificationCodes.delete(key);
        }
      }

      const verificationCode: SimpleVerificationCode = {
        id: this.generateId(),
        phone,
        code,
        code_type: codeTypeMap[codeType] || 'login',
        expires_at: expiresAt,
        used: false,
        created_at: now
      };

      verificationCodes.set(verificationCode.id, verificationCode);
      logger.info(`Created verification code for phone: ${phone}, type: ${codeType}`);

      const response: any = {
        success: true,
        expiresIn: 300, // 5 minutes
      };

      if (process.env.NODE_ENV === 'development') {
        response.code = code; // 开发环境返回验证码方便测试
      }

      return response;
    }

    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }

  async register(data: {
    phone: string;
    password: string;
    verification_code: string;
    username?: string;
  }): Promise<{ user: any; token: string; profile?: any }> {
    // 验证验证码
    const now = new Date();
    let validCode: SimpleVerificationCode | undefined;

    for (const vc of verificationCodes.values()) {
      if (vc.phone === data.phone &&
          vc.code === data.verification_code &&
          vc.code_type === 'register' &&
          !vc.used &&
          vc.expires_at > now) {
        validCode = vc;
        break;
      }
    }

    if (!validCode) {
      throw new Error('Invalid or expired verification code');
    }

    // 标记验证码为已使用
    validCode.used = true;

    // 检查用户是否已存在
    for (const user of users.values()) {
      if (user.phone === data.phone) {
        throw new Error('Phone number already registered');
      }
    }

    // 创建用户
    const passwordHash = await this.hashPassword(data.password);
    const createdAt = new Date();

    const user: SimpleUser = {
      id: this.generateId(),
      phone: data.phone,
      username: data.username || data.phone,
      password_hash: passwordHash,
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt
    };

    users.set(user.id, user);

    // 创建用户档案
    const profile: SimpleUserProfile = {
      id: this.generateId(),
      user_id: user.id,
      nickname: data.username || '用户' + user.phone.slice(-4),
      gender: 'unknown',
      country: 'China',
      created_at: createdAt,
      updated_at: createdAt
    };

    userProfiles.set(profile.id, profile);

    // 生成令牌
    const token = this.generateToken(user.id);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      phone: user.phone,
      username: user.username,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return { user: userResponse, token, profile };
  }

  async login(data: {
    phone: string;
    password: string;
    loginIp?: string;
    loginDevice?: string;
    loginPlatform?: 'miniprogram' | 'pc' | 'mobile_admin';
  }): Promise<{ user: any; token: string; profile: any | null }> {
    // 查找用户
    let foundUser: SimpleUser | undefined;
    for (const user of users.values()) {
      if (user.phone === data.phone) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid phone number or password');
    }

    // 验证密码
    const isPasswordValid = await this.comparePassword(data.password, foundUser.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid phone number or password');
    }

    // 检查用户状态
    if (foundUser.status !== 'active') {
      throw new Error('User account is not active');
    }

    // 更新用户
    foundUser.updated_at = new Date();

    // 记录登录日志
    const loginLog = {
      id: this.generateId(),
      user_id: foundUser.id,
      login_ip: data.loginIp || 'unknown',
      login_device: data.loginDevice || 'unknown',
      login_platform: data.loginPlatform || 'pc',
      login_time: new Date()
    };

    loginLogs.set(loginLog.id, loginLog);

    // 获取用户档案
    let foundProfile: SimpleUserProfile | undefined;
    for (const profile of userProfiles.values()) {
      if (profile.user_id === foundUser.id) {
        foundProfile = profile;
        break;
      }
    }

    // 生成令牌
    const token = this.generateToken(foundUser.id);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: foundUser.id,
      phone: foundUser.phone,
      username: foundUser.username,
      status: foundUser.status,
      created_at: foundUser.created_at,
      updated_at: foundUser.updated_at
    };

    return { user: userResponse, token, profile: foundProfile || null };
  }

  async loginWithCode(data: {
    phone: string;
    verification_code: string;
    loginIp?: string;
    loginDevice?: string;
    loginPlatform?: 'miniprogram' | 'pc' | 'mobile_admin';
  }): Promise<{ user: any; token: string; profile: any | null }> {
    // 验证验证码
    const now = new Date();
    let validCode: SimpleVerificationCode | undefined;

    for (const vc of verificationCodes.values()) {
      if (vc.phone === data.phone &&
          vc.code === data.verification_code &&
          vc.code_type === 'login' &&
          !vc.used &&
          vc.expires_at > now) {
        validCode = vc;
        break;
      }
    }

    if (!validCode) {
      throw new Error('Invalid or expired verification code');
    }

    // 标记验证码为已使用
    validCode.used = true;

    // 查找用户
    let foundUser: SimpleUser | undefined;
    for (const user of users.values()) {
      if (user.phone === data.phone) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('User not found');
    }

    // 检查用户状态
    if (foundUser.status !== 'active') {
      throw new Error('User account is not active');
    }

    // 更新用户
    foundUser.updated_at = new Date();

    // 记录登录日志
    const loginLog = {
      id: this.generateId(),
      user_id: foundUser.id,
      login_ip: data.loginIp || 'unknown',
      login_device: data.loginDevice || 'unknown',
      login_platform: data.loginPlatform || 'miniprogram',
      login_time: new Date()
    };

    loginLogs.set(loginLog.id, loginLog);

    // 获取用户档案
    let foundProfile: SimpleUserProfile | undefined;
    for (const profile of userProfiles.values()) {
      if (profile.user_id === foundUser.id) {
        foundProfile = profile;
        break;
      }
    }

    // 生成令牌
    const token = this.generateToken(foundUser.id);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: foundUser.id,
      phone: foundUser.phone,
      username: foundUser.username,
      status: foundUser.status,
      created_at: foundUser.created_at,
      updated_at: foundUser.updated_at
    };

    return { user: userResponse, token, profile: foundProfile || null };
  }
}