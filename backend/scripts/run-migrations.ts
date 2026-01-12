import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 执行数据库迁移脚本
 */
async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'daodao_dev',
    password: process.env.DB_PASSWORD || 'daodao_dev_2024',
    database: process.env.DB_NAME || 'daodao',
    multipleStatements: true,
  });

  try {
    console.log('开始执行数据库迁移...\n');

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`执行迁移: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await connection.query(sql);
      console.log(`✓ ${file} 执行成功\n`);
    }

    console.log('所有迁移执行完成!');
  } catch (error) {
    console.error('迁移执行失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigrations().catch(console.error);
