const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'daodao_root_password_2024',
  database: 'daodao',
  charset: 'utf8mb4'
};

async function createAdminUser() {
  let connection;

  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查管理员用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE phone = ?',
      ['13800138000']
    );

    if (existingUsers.length > 0) {
      console.log('ℹ️ 管理员用户已存在');
      console.log('📱 手机号: 13800138000');
      console.log('🔑 密码: 123456');
      return;
    }

    // 创建密码哈希
    const passwordHash = await bcrypt.hash('123456', 10);
    console.log('✅ 密码哈希创建成功');

    // 插入管理员用户
    const [result] = await connection.execute(
      `INSERT INTO users (username, phone, password_hash, user_type, status, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', 'active', NOW(), NOW())`,
      ['admin', '13800138000', passwordHash]
    );

    const adminId = result.insertId;
    console.log('✅ 管理员用户创建成功，ID:', adminId);

    // 插入用户档案
    await connection.execute(
      `INSERT INTO user_profiles (user_id, nickname, avatar, gender, preferences, created_at, updated_at)
       VALUES (?, ?, ?, 'unknown', ?, NOW(), NOW())`,
      [adminId, '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', JSON.stringify({
         theme: 'light',
         language: 'zh-CN'
       })]
    );

    console.log('✅ 用户档案创建成功');

    // 创建测试用户
    const [customerResult] = await connection.execute(
      `INSERT INTO users (username, phone, password_hash, user_type, status, created_at, updated_at)
       VALUES (?, ?, ?, 'customer', 'active', NOW(), NOW())`,
      ['测试用户', '13900139000', passwordHash]
    );

    const customerId = customerResult.insertId;
    console.log('✅ 测试用户创建成功，ID:', customerId);

    // 插入测试用户档案
    await connection.execute(
      `INSERT INTO user_profiles (user_id, nickname, avatar, gender, preferences, created_at, updated_at)
       VALUES (?, ?, ?, 'unknown', ?, NOW(), NOW())`,
      [customerId, '测试用户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer', JSON.stringify({
         theme: 'light',
         language: 'zh-CN'
       })]
    );

    console.log('✅ 测试用户档案创建成功');

    console.log('\n🎉 用户创建完成！');
    console.log('📋 登录信息:');
    console.log('👨‍💼 管理员账号:');
    console.log('   手机号: 13800138000');
    console.log('   密码: 123456');
    console.log('👤 普通用户账号:');
    console.log('   手机号: 13900139000');
    console.log('   密码: 123456');

  } catch (error) {
    console.error('❌ 创建用户失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

createAdminUser();