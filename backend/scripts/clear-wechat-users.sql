-- 清除微信登录测试用户
-- 执行前请确认数据库连接

-- 查看微信登录用户
SELECT id, username, phone, created_at
FROM users
WHERE phone = '13800138000';

-- 删除微信登录用户（取消注释以执行）
-- DELETE FROM users WHERE phone = '13800138000';
