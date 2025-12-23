/**
 * 执行迁移 042_create_auth_identities.sql
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.XIAOPEI_MYSQL_HOST || 'localhost',
    port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
    user: process.env.XIAOPEI_MYSQL_USER || 'root',
    password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
    database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'src/database/migrations/042_create_auth_identities.sql'),
      'utf8'
    );
    
    console.log('执行迁移 042_create_auth_identities.sql...');
    await connection.query(sql);
    console.log('✅ 迁移执行成功！auth_identities 表已创建');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
      console.log('ℹ️ 表已存在，跳过迁移');
    } else {
      console.error('❌ 迁移失败:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);

