import { Sequelize } from 'sequelize';
import { logger } from '@/utils/logger';
import { initModels } from '@/models';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'daodao',
  username: process.env.DB_USER || 'daodao_dev',
  password: process.env.DB_PASSWORD || 'daodao_dev_2024',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  timezone: '+08:00',
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: (msg) => logger.debug(msg)
});

export async function connectDatabase(): Promise<Sequelize> {
  // 如果使用内存数据模式，跳过数据库连接
  if (process.env.USE_MEMORY_DATA === 'true') {
    logger.info('Using memory data mode - skipping database connection');
    return sequelize as any;
  }

  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Initialize models
    initModels(sequelize);
    logger.info('Database models initialized successfully.');

    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

export { sequelize };