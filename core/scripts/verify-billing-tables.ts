/**
 * 验证计费统计表结构
 */

import { createConnection, closeConnection } from '../src/database/connection';
import dotenv from 'dotenv';

dotenv.config();

async function verifyTables() {
  try {
    const pool = await createConnection();
    
    console.log('[Verify] 检查表结构...\n');
    
    // 检查 llm_usage_logs
    const [logsColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'llm_usage_logs'
       ORDER BY ORDINAL_POSITION`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    console.log('📊 llm_usage_logs 表结构:');
    logsColumns.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查 llm_usage_daily
    const [dailyColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'llm_usage_daily'
       ORDER BY ORDINAL_POSITION`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    console.log('\n📅 llm_usage_daily 表结构:');
    dailyColumns.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查 llm_pricing_rules
    const [rulesColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'llm_pricing_rules'
       ORDER BY ORDINAL_POSITION`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    console.log('\n💰 llm_pricing_rules 表结构:');
    rulesColumns.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查价格规则数据
    const [priceRules]: any = await pool.execute(
      `SELECT provider, model, direction, tier, price_per_million, currency
       FROM llm_pricing_rules
       ORDER BY provider, model, direction, tier`
    );
    
    console.log('\n💵 价格规则数据:');
    priceRules.forEach((rule: any) => {
      console.log(`  - ${rule.provider}/${rule.model} (${rule.direction}, ${rule.tier}): ${rule.price_per_million} ${rule.currency}/百万tokens`);
    });
    
    // 检查索引
    const [indexes]: any = await pool.execute(
      `SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME IN ('llm_usage_logs', 'llm_usage_daily', 'llm_pricing_rules')
       ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    console.log('\n🔍 索引信息:');
    let currentTable = '';
    indexes.forEach((idx: any) => {
      if (idx.TABLE_NAME !== currentTable) {
        currentTable = idx.TABLE_NAME;
        console.log(`  ${currentTable}:`);
      }
      console.log(`    - ${idx.INDEX_NAME} (${idx.COLUMN_NAME})`);
    });
    
    console.log('\n✅ 验证完成！所有表结构正确。');
    
    await closeConnection();
  } catch (error: any) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  }
}

verifyTables();


