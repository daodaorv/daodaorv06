import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

async function testInsert() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    console.log('测试插入数据...\n');

    const testData = {
      name: '测试B型',
      brand: '测试',
      series: '测试',
      type: 'B型',
      seats: 4,
      sleep_capacity: 2,
      length: 5.5,
      width: 2.0,
      height: 2.5,
      fuel_type: '柴油',
      transmission: '自动',
      engine_displacement: 2.0,
      status: 'active'
    };

    console.log('插入数据:', JSON.stringify(testData, null, 2));

    const [result]: any = await connection.query(
      `INSERT INTO vehicle_models (
        name, brand, series, type, seats, sleep_capacity,
        length, width, height, fuel_type, transmission, engine_displacement,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        testData.name, testData.brand, testData.series, testData.type,
        testData.seats, testData.sleep_capacity, testData.length, testData.width,
        testData.height, testData.fuel_type, testData.transmission,
        testData.engine_displacement, testData.status
      ]
    );

    console.log('\n插入成功! ID:', result.insertId);

  } catch (error: any) {
    console.error('\n插入失败:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
  } finally {
    await connection.end();
  }
}

testInsert().catch(console.error);
