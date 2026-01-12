import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

async function checkVehicleTables() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    // 查询车辆相关表
    const [tables]: any = await connection.query(
      `SHOW TABLES LIKE '%vehicle%'`
    );

    console.log('车辆相关表:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n表名: ${tableName}`);

      // 查询表结构
      const [columns]: any = await connection.query(`DESCRIBE ${tableName}`);
      console.log('字段:');
      columns.forEach((col: any) => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
  } finally {
    await connection.end();
  }
}

checkVehicleTables().catch(console.error);
