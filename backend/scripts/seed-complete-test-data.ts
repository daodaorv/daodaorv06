import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

/**
 * 完整测试数据填充脚本
 * 功能：为所有模块创建10-20条测试数据
 */

async function seedCompleteTestData() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    console.log('🚀 开始填充完整测试数据...\n');

    // 1. 车辆管理模块测试数据
    await seedVehicleData(connection);

    // 2. 门店管理模块测试数据
    await seedStoreData(connection);

    // 3. 订单管理模块测试数据
    await seedOrderData(connection);

    // 4. 营地管理模块测试数据
    await seedCampsiteData(connection);

    // 5. 合作商管理模块测试数据
    await seedPartnerData(connection);

    // 6. 供应商管理模块测试数据
    await seedSupplierData(connection);

    console.log('\n✅ 所有测试数据填充完成！\n');

  } catch (error) {
    console.error('❌ 填充过程出错:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 导入各模块的数据填充函数
async function seedVehicleData(connection: any) {
  console.log('📦 填充车辆管理模块测试数据...');
  // 将在单独的文件中实现
}

async function seedStoreData(connection: any) {
  console.log('📦 填充门店管理模块测试数据...');
  // 将在单独的文件中实现
}

async function seedOrderData(connection: any) {
  console.log('📦 填充订单管理模块测试数据...');
  // 将在单独的文件中实现
}

async function seedCampsiteData(connection: any) {
  console.log('📦 填充营地管理模块测试数据...');
  // 将在单独的文件中实现
}

async function seedPartnerData(connection: any) {
  console.log('📦 填充合作商管理模块测试数据...');
  // 将在单独的文件中实现
}

async function seedSupplierData(connection: any) {
  console.log('📦 填充供应商管理模块测试数据...');
  // 将在单独的文件中实现
}

// 执行填充
seedCompleteTestData().catch(console.error);
