import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

/**
 * 车辆品牌测试数据填充脚本
 */

const vehicleBrands = [
  { name: '大通', name_en: 'MAXUS', country: '中国', logo_url: '/images/brands/maxus.png' },
  { name: '福特', name_en: 'Ford', country: '美国', logo_url: '/images/brands/ford.png' },
  { name: '依维柯', name_en: 'IVECO', country: '意大利', logo_url: '/images/brands/iveco.png' },
  { name: '奔驰', name_en: 'Mercedes-Benz', country: '德国', logo_url: '/images/brands/benz.png' },
  { name: '览众', name_en: 'Lanzhong', country: '中国', logo_url: '/images/brands/lanzhong.png' },
  { name: '中天', name_en: 'Zhongtian', country: '中国', logo_url: '/images/brands/zhongtian.png' },
  { name: '亚特', name_en: 'Yate', country: '中国', logo_url: '/images/brands/yate.png' },
  { name: '长城', name_en: 'Great Wall', country: '中国', logo_url: '/images/brands/greatwall.png' },
  { name: '江铃', name_en: 'JMC', country: '中国', logo_url: '/images/brands/jmc.png' },
  { name: '宇通', name_en: 'Yutong', country: '中国', logo_url: '/images/brands/yutong.png' },
];

export async function seedVehicleBrands(connection: any) {
  console.log('📦 填充车辆品牌测试数据...');

  try {
    // 检查是否已有数据
    const [existing]: any = await connection.query('SELECT COUNT(*) as count FROM vehicle_brands');
    if (existing[0].count > 0) {
      console.log(`  ⏭️  跳过（已有 ${existing[0].count} 条数据）`);
      return;
    }

    // 插入品牌数据
    for (const brand of vehicleBrands) {
      await connection.query(
        `INSERT INTO vehicle_brands (name, name_en, country, logo_url, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
        [brand.name, brand.name_en, brand.country, brand.logo_url]
      );
    }

    console.log(`  ✅ 成功插入 ${vehicleBrands.length} 条品牌数据`);
  } catch (error) {
    console.error('  ❌ 填充失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
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
      await seedVehicleBrands(connection);
    } finally {
      await connection.end();
    }
  })().catch(console.error);
}
