import { VehicleModelDAO } from '../src/dao/vehicle-model.dao';

async function testDAOInsert() {
  const dao = new VehicleModelDAO();

  try {
    console.log('测试DAO插入...\n');

    const testData = {
      name: '测试车型',
      brand: '测试品牌',
      series: '测试系列',
      type: 'B型',
      seats: 4,
      sleep_capacity: 2,
      length: 5.5,
      width: 2.0,
      height: 2.5,
      fuel_type: '柴油',
      transmission: '自动',
      engine_displacement: 2.0,
      description: '这是一个测试车型',
      status: 'active'
    };

    console.log('插入数据:', JSON.stringify(testData, null, 2));

    const id = await dao.createModel(testData as any);

    console.log('\n插入成功! ID:', id);

  } catch (error: any) {
    console.error('\n插入失败:', error.message);
  }
}

testDAOInsert().catch(console.error);
