/**
 * 内存数据存储服务 - 用于开发阶段替代数据库
 * 当真实的MySQL数据库不可用时使用
 */

import { logger } from '@/utils/logger';

export interface User {
  id: string;
  phone: string;
  username?: string;
  password_hash: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: Date;
  updated_at: Date;
  toJSON(): Omit<User, 'password_hash'>; // 必需的toJSON方法
}

export interface UserProfile {
  id: string;
  user_id: string;
  nickname?: string;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: Date;
  city?: string;
  province?: string;
  country?: string = 'China';
  created_at: Date;
  updated_at: Date;
}

export interface VerificationCode {
  id: string;
  phone: string;
  code: string;
  code_type: 'register' | 'login' | 'reset_password';
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface UserLoginLog {
  id: string;
  user_id: string;
  login_ip: string;
  login_device: string;
  login_platform: 'pc' | 'mobile' | 'miniprogram' | 'mobile_admin';
  login_time: Date;
}

class MemoryDataService {
  private users: Map<string, User> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private userLoginLogs: Map<string, UserLoginLog> = new Map();
  private nextId = 1;

  constructor() {
    logger.info('Memory Data Service initialized for development');
    // 创建一个测试用户
    this.createTestUser();
  }

  private generateId(): string {
    return (this.nextId++).toString();
  }

  private createTestUser() {
    const testUserId = this.generateId();
    const now = new Date();

    const testUser: User = {
      id: testUserId,
      phone: '13800138000',
      username: 'testuser',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6G', // secret
      status: 'active',
      created_at: now,
      updated_at: now
    };

    // 添加toJSON方法
    testUser.toJSON = () => {
      // 返回不包含密码的用户信息
      const { password_hash, ...userWithoutPassword } = testUser;
      return userWithoutPassword;
    };

    const testProfile: UserProfile = {
      id: this.generateId(),
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

    this.users.set(testUserId, testUser);
    this.userProfiles.set(testUserId, testProfile);
  }

  // 用户相关操作
  async findUserByPhone(phone: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'toJSON'>): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.generateId(),
      ...userData,
      created_at: now,
      updated_at: now
    };

    // 添加toJSON方法
    user.toJSON = () => {
      // 返回不包含密码的用户信息
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    };

    this.users.set(user.id, user);
    logger.info(`Created user with phone: ${user.phone}`);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // 用户档案相关操作
  async findProfileByUserId(userId: string): Promise<UserProfile | null> {
    for (const profile of this.userProfiles.values()) {
      if (profile.user_id === userId) {
        return profile;
      }
    }
    return null;
  }

  async createProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const now = new Date();
    const profile: UserProfile = {
      id: this.generateId(),
      ...profileData,
      created_at: now,
      updated_at: now
    };

    this.userProfiles.set(profile.id, profile);
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    for (const profile of this.userProfiles.values()) {
      if (profile.user_id === userId) {
        const updatedProfile = {
          ...profile,
          ...updates,
          updated_at: new Date()
        };

        this.userProfiles.set(profile.id, updatedProfile);
        return updatedProfile;
      }
    }
    return null;
  }

  // 验证码相关操作
  async createVerificationCode(phone: string, code: string, codeType: VerificationCode['code_type']): Promise<VerificationCode> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后过期

    // 删除同一手机号的旧验证码
    for (const [key, vc] of this.verificationCodes.entries()) {
      if (vc.phone === phone && vc.code_type === codeType) {
        this.verificationCodes.delete(key);
      }
    }

    const verificationCode: VerificationCode = {
      id: this.generateId(),
      phone,
      code,
      code_type: codeType,
      expires_at: expiresAt,
      used: false,
      created_at: now
    };

    this.verificationCodes.set(verificationCode.id, verificationCode);
    logger.info(`Created verification code for phone: ${phone}, type: ${codeType}`);
    return verificationCode;
  }

  async findValidVerificationCode(phone: string, code: string, codeType: VerificationCode['code_type']): Promise<VerificationCode | null> {
    const now = new Date();
    for (const vc of this.verificationCodes.values()) {
      if (vc.phone === phone && vc.code === code && vc.code_type === codeType && !vc.used && vc.expires_at > now) {
        return vc;
      }
    }
    return null;
  }

  async markVerificationCodeUsed(phone: string, code: string, codeType: VerificationCode['code_type']): Promise<boolean> {
    for (const vc of this.verificationCodes.values()) {
      if (vc.phone === phone && vc.code === code && vc.code_type === codeType && !vc.used) {
        vc.used = true;
        return true;
      }
    }
    return false;
  }

  // 登录日志相关操作
  async createLoginLog(logData: Omit<UserLoginLog, 'id' | 'login_time'>): Promise<UserLoginLog> {
    const loginLog: UserLoginLog = {
      id: this.generateId(),
      ...logData,
      login_time: new Date()
    };

    this.userLoginLogs.set(loginLog.id, loginLog);
    logger.info(`Created login log for user: ${logData.user_id}`);
    return loginLog;
  }

  // 清理过期的验证码
  async cleanupExpiredCodes(): Promise<void> {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, vc] of this.verificationCodes.entries()) {
      if (vc.expires_at <= now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.verificationCodes.delete(key));
    if (expiredKeys.length > 0) {
      logger.info(`Cleaned up ${expiredKeys.length} expired verification codes`);
    }
  }

  // 获取统计信息
  getStats() {
    return {
      users: this.users.size,
      profiles: this.userProfiles.size,
      verificationCodes: this.verificationCodes.size,
      loginLogs: this.userLoginLogs.size
    };
  }
}

export const memoryDataService = new MemoryDataService();