import { commissionQueue } from '../config/queue';
import { CommissionService } from '../services/commission.service';
import { logger } from '@utils/logger';

/**
 * 分润计算队列处理器
 */
const commissionService = new CommissionService();

/**
 * 处理分润计算任务
 */
commissionQueue.process(async (job) => {
  const { orderId } = job.data;

  logger.info('开始处理分润计算任务', { jobId: job.id, orderId });

  try {
    await commissionService.calculateOrderCommission(orderId);
    logger.info('分润计算任务完成', { jobId: job.id, orderId });
    return { success: true, orderId };
  } catch (error) {
    logger.error('分润计算任务失败', { jobId: job.id, orderId, error });
    throw error;
  }
});

logger.info('分润队列处理器已启动');
