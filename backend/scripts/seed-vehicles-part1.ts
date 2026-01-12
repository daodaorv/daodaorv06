import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

/**
 * 车辆测试数据填充脚本（第1部分：基础数据）
 */

export async function seedVehicles(connection: any) {
  console.log('📦 填充车辆测试数据...');

  try {
    // 检查是否已有数据
    const [existing]: any = await connection.query('SELECT COUNT(*) as count FROM vehicles');
    if (existing[0].count > 0) {
      console.log(`  ⏭️  跳过（已有 ${existing[0].count} 条数据）`);
      return;
    }

    // 获取型号和门店ID
    const [models]: any = await connection.query('SELECT id FROM vehicle_models LIMIT 5');
    const [stores]: any = await connection.query('SELECT id FROM stores LIMIT 5');

    if (models.length === 0 || stores.length === 0) {
      console.log('  ⚠️  缺少型号或门店数据，跳过');
      return;
    }

    // 车辆数据（15条）
    const vehicles = [
      { vehicle_no: 'RV001', model_id: models[0].id, store_id: stores[0].id, license_plate: '京A12345', vin: '1HGBH41JXMN109186', color: '白色', year: 2023, mileage: 5000, status: 'available', daily_price: 800, deposit: 5000 },
      { vehicle_no: 'RV002', model_id: models[0].id, store_id: stores[0].id, license_plate: '京A12346', vin: '1HGBH41JXMN109187', color: '银色', year: 2023, mileage: 3000, status: 'available', daily_price: 800, deposit: 5000 },
      { vehicle_no: 'RV003', model_id: models[1].id, store_id: stores[1].id, license_plate: '沪B23456', vin: '1HGBH41JXMN109188', color: '白色', year: 2022, mileage: 15000, status: 'available', daily_price: 750, deposit: 5000 },
      { vehicle_no: 'RV004', model_id: models[1].id, store_id: stores[1].id, license_plate: '沪B23457', vin: '1HGBH41JXMN109189', color: '灰色', year: 2022, mileage: 18000, status: 'rented', daily_price: 750, deposit: 5000 },
      { vehicle_no: 'RV005', model_id: models[2].id, store_id: stores[2].id, license_plate: '粤C34567', vin: '1HGBH41JXMN109190', color: '白色', year: 2023, mileage: 8000, status: 'available', daily_price: 900, deposit: 6000 },
    ];

    // 插入数据
    for (const vehicle of vehicles) {
      await connection.query(
        `INSERT INTO vehicles (
          vehicle_no, model_id, store_id, license_plate, vin, color, year, mileage,
          status, daily_price, deposit, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          vehicle.vehicle_no, vehicle.model_id, vehicle.store_id, vehicle.license_plate,
          vehicle.vin, vehicle.color, vehicle.year, vehicle.mileage, vehicle.status,
          vehicle.daily_price, vehicle.deposit
        ]
      );
    }

    console.log(`  ✅ 成功插入 ${vehicles.length} 条车辆数据（第1批）`);
  } catch (error) {
    console.error('  ❌ 填充失败:', error);
    throw error;
  }
}

if (require.main === module) {
  (async () => {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
    });

    try {
      await seedVehicles(connection);
    } finally {
      await connection.end();
    }
  })().catch(console.error);
}
