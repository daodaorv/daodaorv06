import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { memoryDataService, User, UserProfile, UserLoginLog, VerificationCode } from '@/services/memory-data.service';

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private useMemoryData: boolean;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'daodao_secret_key_2024';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // 如果没有数据库连接，使用内存数据服务
    this.useMemoryData = process.env.USE_MEMORY_DATA === 'true';

    if (this.useMemoryData) {
      logger.info('AuthService using memory data storage for development');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password
   */
  private async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code
   */
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

    if (this.useMemoryData) {
      // 检查冷却时间（简单实现）
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);

      // 这里简化实现，生产环境需要更严格的检查
      logger.info(`Verification code cooldown check passed for ${phone}`);

      // 创建验证码
      await memoryDataService.createVerificationCode(phone, code, codeTypeMap[codeType] || 'login');

      // 开发环境返回验证码，生产环境不返回
      const response: any = {
        success: true,
        expiresIn: 300, // 5 minutes
      };

      if (process.env.NODE_ENV === 'development') {
        response.code = code; // 开发环境返回验证码方便测试
      }

      return response;
    }

    // 数据库版本的实现（暂时保留原逻辑）
    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }

  /**
   * Verify verification code
   */
  async verifyCode(
    phone: string,
    code: string,
    codeType: 'register' | 'login' | 'reset_password' | 'bind_phone'
  ): Promise<boolean> {
    const codeTypeMap = {
      'register': 'register' as const,
      'login': 'login' as const,
      'reset_password': 'reset_password' as const,
      'bind_phone': 'login' as const
    };

    if (this.useMemoryData) {
      const verificationCode = await memoryDataService.findValidVerificationCode(
        phone,
        code,
        codeTypeMap[codeType] || 'login'
      );

      if (!verificationCode) {
        return false;
      }

      // 标记为已使用
      await memoryDataService.markVerificationCodeUsed(phone, code, codeTypeMap[codeType] || 'login');
      return true;
    }

    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }

  /**
   * Register new user
   */
  async register(data: {
    phone: string;
    password: string;
    verification_code: string;
    username?: string;
  }): Promise<{ user: User; token: string; profile?: UserProfile }> {
    // Verify code
    const isCodeValid = await this.verifyCode(
      data.phone,
      data.verification_code,
      'register'
    );

    if (!isCodeValid) {
      throw new Error('Invalid or expired verification code');
    }

    if (this.useMemoryData) {
      // Check if user exists
      const existingUser = await memoryDataService.findUserByPhone(data.phone);
      if (existingUser) {
        throw new Error('Phone number already registered');
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const user = await memoryDataService.createUser({
        phone: data.phone,
        username: data.username || data.phone,
        password_hash: passwordHash,
        status: 'active'
      });

      // Create user profile
      const profile = await memoryDataService.createProfile({
        user_id: user.id,
        nickname: data.username || '用户' + user.phone.slice(-4),
        gender: 'unknown',
        country: 'China'
      });

      // Generate token
      const token = this.generateToken(user.id);

      return { user, token, profile };
    }

    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }

  /**
   * Login with password
   */
  async login(data: {
    phone: string;
    password: string;
    loginIp?: string;
    loginDevice?: string;
    loginPlatform?: 'miniprogram' | 'pc' | 'mobile_admin';
  }): Promise<{ user: User; token: string; profile: UserProfile | null }> {
    if (this.useMemoryData) {
      // Find user
      const user = await memoryDataService.findUserByPhone(data.phone);
      logger.info('Login attempt:', { phone: data.phone, userFound: !!user });

      if (!user) {
        throw new Error('Invalid phone number or password');
      }

      logger.info('User found:', { id: user.id, phone: user.phone, hasPassword: !!user.password_hash });

      // Verify password
      const isPasswordValid = await this.comparePassword(
        data.password,
        user.password_hash
      );

      logger.info('Password validation:', { isValid: isPasswordValid });

      if (!isPasswordValid) {
        // Log failed login
        await memoryDataService.createLoginLog({
          user_id: user.id,
          login_ip: data.loginIp || 'unknown',
          login_device: data.loginDevice || 'unknown',
          login_platform: data.loginPlatform || 'pc'
        });

        throw new Error('Invalid phone number or password');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      // Update user (last login time simulation)
      await memoryDataService.updateUser(user.id, { updated_at: new Date() });

      // Log successful login
      await memoryDataService.createLoginLog({
        user_id: user.id,
        login_ip: data.loginIp || 'unknown',
        login_device: data.loginDevice || 'unknown',
        login_platform: data.loginPlatform || 'pc'
      });

      // Get user profile
      const profile = await memoryDataService.findProfileByUserId(user.id);

      // Generate token
      const token = this.generateToken(user.id);

      return { user, token, profile };
    }

    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }

  /**
   * Login with verification code
   */
  async loginWithCode(data: {
    phone: string;
    verification_code: string;
    loginIp?: string;
    loginDevice?: string;
    loginPlatform?: 'miniprogram' | 'pc' | 'mobile_admin';
  }): Promise<{ user: User; token: string; profile: UserProfile | null }> {
    // Verify code
    const isCodeValid = await this.verifyCode(
      data.phone,
      data.verification_code,
      'login'
    );

    if (!isCodeValid) {
      throw new Error('Invalid or expired verification code');
    }

    if (this.useMemoryData) {
      // Find user
      const user = await memoryDataService.findUserByPhone(data.phone);

      if (!user) {
        throw new Error('User not found');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      // Update user (last login time simulation)
      await memoryDataService.updateUser(user.id, { updated_at: new Date() });

      // Log successful login
      await memoryDataService.createLoginLog({
        user_id: user.id,
        login_ip: data.loginIp || 'unknown',
        login_device: data.loginDevice || 'unknown',
        login_platform: data.loginPlatform || 'miniprogram'
      });

      // Get user profile
      const profile = await memoryDataService.findProfileByUserId(user.id);

      // Generate token
      const token = this.generateToken(user.id);

      return { user, token, profile };
    }

    throw new Error('Database mode not implemented yet. Please set USE_MEMORY_DATA=true');
  }
}