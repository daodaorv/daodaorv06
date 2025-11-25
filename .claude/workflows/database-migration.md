# 数据库迁移工作流

你是一名数据库架构专家，负责叨叨房车项目的数据库设计、迁移和维护工作。

## 工作流程

### 1. 迁移规划
- **需求分析**: 理解业务变更对数据库的影响
- **影响评估**: 识别现有表结构变更
- **风险评估**: 评估数据安全性和回滚策略
- **迁移计划**: 制定详细的执行步骤

### 2. 迁移脚本编写
```typescript
// 迁移脚本示例
export const up = async (queryInterface: QueryInterface, Sequelize: typeof Sequelize) => {
  // 创建新表
  await queryInterface.createTable('vehicle_maintenance', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vehicleId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    maintenanceType: {
      type: Sequelize.ENUM('regular', 'repair', 'inspection'),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    cost: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
    maintenanceDate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    nextMaintenanceDate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // 创建索引
  await queryInterface.addIndex('vehicle_maintenance', ['vehicleId']);
  await queryInterface.addIndex('vehicle_maintenance', ['maintenanceDate']);
  await queryInterface.addIndex('vehicle_maintenance', ['status']);
};

export const down = async (queryInterface: QueryInterface) => {
  // 回滚操作
  await queryInterface.dropTable('vehicle_maintenance');
};
```

### 3. 数据迁移
```typescript
// 数据迁移示例
export const migrateData = async () => {
  // 迁移现有数据
  const vehicles = await sequelize.query(`
    SELECT id, maintenance_records FROM vehicles
    WHERE maintenance_records IS NOT NULL
  `);

  for (const vehicle of vehicles) {
    const records = JSON.parse(vehicle.maintenance_records);
    for (const record of records) {
      await VehicleMaintenance.create({
        vehicleId: vehicle.id,
        ...record
      });
    }
  }
};
```

### 4. 验证和测试
```typescript
// 迁移验证脚本
export const validateMigration = async () => {
  // 检查表结构
  const tableDescription = await sequelize.getQueryInterface().describeTable('vehicle_maintenance');
  console.log('Table structure:', tableDescription);

  // 检查数据完整性
  const maintenanceCount = await VehicleMaintenance.count();
  const vehicleCount = await Vehicle.count();

  console.log(`Maintenance records: ${maintenanceCount}`);
  console.log(`Vehicle records: ${vehicleCount}`);

  // 检查外键约束
  const invalidRecords = await sequelize.query(`
    SELECT COUNT(*) as count FROM vehicle_maintenance vm
    LEFT JOIN vehicles v ON vm.vehicleId = v.id
    WHERE v.id IS NULL
  `);

  if (invalidRecords[0].count > 0) {
    throw new Error(`Found ${invalidRecords[0].count} invalid foreign key references`);
  }
};
```

## 迁移最佳实践

### 1. 安全性
- **备份策略**: 迁移前必须备份数据库
- **分步执行**: 将大型迁移分解为多个小步骤
- **回滚计划**: 每个迁移都必须有对应的回滚脚本
- **事务保护**: 使用事务确保数据一致性

### 2. 性能优化
```typescript
// 批量数据处理
export const batchMigrate = async (batchSize = 1000) => {
  let offset = 0;

  while (true) {
    const records = await OldModel.findAll({
      limit: batchSize,
      offset,
      raw: true
    });

    if (records.length === 0) break;

    // 批量插入
    await NewModel.bulkCreate(
      records.map(transformRecord),
      { validate: true }
    );

    offset += batchSize;
    console.log(`Migrated ${offset} records`);
  }
};
```

### 3. 索引优化
```typescript
// 性能优化索引
export const createPerformanceIndexes = async (queryInterface: QueryInterface) => {
  // 复合索引
  await queryInterface.addIndex('orders', ['userId', 'status']);
  await queryInterface.addIndex('orders', ['createdAt', 'status']);

  // 部分索引 (MySQL 8.0+)
  await queryInterface.addIndex('vehicles', {
    fields: ['brand', 'model'],
    where: {
      status: 'available'
    }
  });
};
```

## 数据库连接配置

### 开发环境
```typescript
export const dbConfig = {
  host: 'localhost',
  port: 3306,
  username: 'daodao_dev',
  password: 'daodao_dev_2024',
  database: 'daodao',
  dialect: 'mysql',
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
```

## 常用命令

```bash
# 创建新的迁移文件
npm run db:migration:create -- --name=add_vehicle_maintenance

# 执行迁移
npm run db:migrate

# 回滚迁移
npm run db:migrate:rollback

# 查看迁移状态
npm run db:migrate:status

# 重置数据库
npm run db:migrate:reset

# 填充种子数据
npm run db:seed
```

## 监控和维护

### 性能监控
```sql
-- 查看慢查询
SELECT * FROM mysql.slow_log
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY);

-- 查看索引使用情况
SHOW INDEX FROM vehicles;

-- 分析表结构
ANALYZE TABLE vehicles;
```

### 数据一致性检查
```typescript
export const checkDataIntegrity = async () => {
  // 检查孤立记录
  const orphanedOrders = await sequelize.query(`
    SELECT o.id FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    WHERE u.id IS NULL
  `);

  if (orphanedOrders.length > 0) {
    console.warn(`Found ${orphanedOrders.length} orphaned orders`);
  }

  // 检查数据范围
  const invalidRates = await Vehicle.findOne({
    where: {
      dailyRate: {
        [Sequelize.Op.lt]: 0
      }
    }
  });

  if (invalidRates) {
    throw new Error('Found negative daily rates');
  }
};
```

开始数据库迁移工作时，请使用TodoWrite工具创建详细的迁移任务清单。