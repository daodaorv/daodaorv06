/**
 * 清除微信登录测试用户脚本
 */
import { db } from '../src/db/connection';
import { logger } from '../src/utils/logger';

async function clearWechatUsers() {
  try {
    // 查询微信登录用户
    const [users] = await db.query(
      'SELECT id, username, phone, created_at FROM users WHERE phone = ?',
      ['13800138000']
    );

    logger.info('查询到的微信用户:', users);

    if (Array.isArray(users) && users.length > 0) {
      // 删除用户
      const [result] = await db.query(
        'DELETE FROM users WHERE phone = ?',
        ['13800138000']
      );

      logger.info('删除结果:', result);
      console.log(`成功删除 ${users.length} 个微信测试用户`);
    } else {
      console.log('没有找到微信测试用户');
    }

    process.exit(0);
  } catch (error) {
    logger.error('清除用户失败:', error);
    process.exit(1);
  }
}

clearWechatUsers();
