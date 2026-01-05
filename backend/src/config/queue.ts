import Queue from 'bull';
import { logger } from '@utils/logger';

/**
 * Redis 配置
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * 分润计算队列
 */
export const commissionQueue = new Queue('commission-calculation', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3, // 失败重试3次
    backoff: {
      type: 'exponential',
      delay: 2000, // 初始延迟2秒
    },
    removeOnComplete: true, // 完成后删除
    removeOnFail: false, // 失败保留用于调试
  },
});

/**
 * 权益发放队列
 */
export const benefitQueue = new Queue('benefit-distribution', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// 队列事件监听
commissionQueue.on('completed', (job) => {
  logger.info('分润计算完成', { jobId: job.id });
});

commissionQueue.on('failed', (job, err) => {
  logger.error('分润计算失败', { jobId: job?.id, error: err });
});

benefitQueue.on('completed', (job) => {
  logger.info('权益发放完成', { jobId: job.id });
});

benefitQueue.on('failed', (job, err) => {
  logger.error('权益发放失败', { jobId: job?.id, error: err });
});

logger.info('队列初始化完成');
