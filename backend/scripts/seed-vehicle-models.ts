import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

/**
 * 车辆型号测试数据填充脚本
 */

const vehicleModels = [
  {
    name: 'V90房车',
    brand: '大通',
    series: 'V90系列',
    type: 'B型',
    seats: 4,
    sleep_capacity: 4,
    length: 5.99,
    width: 2.05,
    height: 2.80,
    fuel_type: '柴油',
    transmission: '自动',
    engine_displacement: 2.0,
    features: JSON.stringify(['卫生间', '厨房', '冰箱', '空调', '太阳能板']),
    description: '大通V90房车，空间宽敞，配置齐全'
  },
  {
    name: 'Transit房车',
    brand: '福特',
    series: 'Transit系列',
    type: 'B型',
    seats: 6,
    sleep_capacity: 4,
    length: 5.34,
    width: 2.03,
    height: 2.78,
    fuel_type: '柴油',
    transmission: '手动',
    engine_displacement: 2.2,
    features: JSON.stringify(['卫生间', '厨房', '冰箱', '暖风']),
    description: '福特Transit房车，经典B型房车'
  },
  {
    name: '欧胜C型房车',
    brand: '依维柯',
    series: '欧胜系列',
    type: 'C型',
    seats: 6,
    sleep_capacity: 6,
    length: 5.99,
    width: 2.32,
    height: 3.20,
    fuel_type: '柴油',
    transmission: '手动',
    engine_displacement: 3.0,
    features: JSON.stringify(['卫生间', '厨房', '冰箱', '空调', '电视', '额头床']),
    description: '依维柯欧胜C型房车，空间超大'
  },
];

export async function seedVehicleModels(connection: any) {
  console.log('📦 填充车辆型号测试数据...');

  try {
    const [existing]: any = await connection.query('SELECT COUNT(*) as count FROM vehicle_models');
    if (existing[0].count > 0) {
      console.log(`  ⏭️  跳过（已有 ${existing[0].count} 条数据）`);
      return;
    }

    for (const model of vehicleModels) {
      await connection.query(
        `INSERT INTO vehicle_models (
          name, brand, series, type, seats, sleep_capacity,
          length, width, height, fuel_type, transmission, engine_displacement,
          features, description, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          model.name, model.brand, model.series, model.type, model.seats, model.sleep_capacity,
          model.length, model.width, model.height, model.fuel_type, model.transmission,
          model.engine_displacement, model.features, model.description
        ]
      );
    }

    console.log(`  ✅ 成功插入 ${vehicleModels.length} 条型号数据`);
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
      await seedVehicleModels(connection);
    } finally {
      await connection.end();
    }
  })().catch(console.error);
}
