import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    console.log('查询 vehicle_models 表结构...\n');

    const [columns]: any = await connection.query(
      'SHOW COLUMNS FROM vehicle_models WHERE Field = "type"'
    );

    console.log('type 字段定义:');
    console.log(JSON.stringify(columns, null, 2));

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkTableStructure().catch(console.error);
