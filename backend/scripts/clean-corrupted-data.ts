import mysql from 'mysql2/promise';
import { config } from '../src/config/index';

/**
 * 数据库乱码数据清理脚本
 * 功能：检测并清理所有表中的乱码数据，保留有效数据
 */

import { RowDataPacket } from 'mysql2';

interface TableInfo extends RowDataPacket {
  TABLE_NAME: string;
}

interface ColumnInfo extends RowDataPacket {
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

async function cleanCorruptedData() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    console.log('🔍 开始检测数据库乱码数据...\n');

    // 获取所有表
    const [tables] = await connection.query<TableInfo[]>(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [config.db.name]
    );

    console.log(`📊 共找到 ${tables.length} 个表\n`);

    let totalCorrupted = 0;
    let totalCleaned = 0;

    // 遍历每个表
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`\n📋 检查表: ${tableName}`);

      // 获取表的所有文本字段
      const [columns] = await connection.query<ColumnInfo[]>(
        `SELECT COLUMN_NAME, DATA_TYPE
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         AND DATA_TYPE IN ('varchar', 'text', 'char', 'tinytext', 'mediumtext', 'longtext')`,
        [config.db.name, tableName]
      );

      if (columns.length === 0) {
        console.log(`  ⏭️  跳过（无文本字段）`);
        continue;
      }

      // 检查每个文本字段的乱码数据
      for (const column of columns) {
        const columnName = column.COLUMN_NAME;

        // 检测乱码：包含 ? 或 � 或连续的特殊字符
        const [rows]: any = await connection.query(
          `SELECT COUNT(*) as count
           FROM \`${tableName}\`
           WHERE \`${columnName}\` REGEXP '[?�]|[^a-zA-Z0-9\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\\s@._-]{3,}'`
        );

        const corruptedCount = rows[0]?.count || 0;

        if (corruptedCount > 0) {
          totalCorrupted += corruptedCount;
          console.log(`  ⚠️  字段 ${columnName}: 发现 ${corruptedCount} 条乱码数据`);

          // 检查字段是否允许NULL
          const [columnDef]: any = await connection.query(
            `SELECT IS_NULLABLE
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [config.db.name, tableName, columnName]
          );

          const isNullable = columnDef[0]?.IS_NULLABLE === 'YES';

          // 清理乱码数据
          if (isNullable) {
            // 允许NULL：设置为NULL
            const [result]: any = await connection.query(
              `UPDATE \`${tableName}\`
               SET \`${columnName}\` = NULL
               WHERE \`${columnName}\` REGEXP '[?�]|[^a-zA-Z0-9\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\\s@._-]{3,}'`
            );
            totalCleaned += result.affectedRows || 0;
            console.log(`  ✅ 已清理 ${result.affectedRows || 0} 条乱码数据（设置为NULL）`);
          } else {
            // 不允许NULL：删除整行数据
            const [result]: any = await connection.query(
              `DELETE FROM \`${tableName}\`
               WHERE \`${columnName}\` REGEXP '[?�]|[^a-zA-Z0-9\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\\s@._-]{3,}'`
            );
            totalCleaned += result.affectedRows || 0;
            console.log(`  ✅ 已删除 ${result.affectedRows || 0} 条乱码数据行`);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 清理统计:');
    console.log(`  - 发现乱码数据: ${totalCorrupted} 条`);
    console.log(`  - 已清理数据: ${totalCleaned} 条`);
    console.log('='.repeat(60));
    console.log('\n✅ 数据库清理完成！\n');

  } catch (error) {
    console.error('❌ 清理过程出错:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行清理
cleanCorruptedData().catch(console.error);
