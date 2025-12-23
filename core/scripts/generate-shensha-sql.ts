/**
 * 生成神煞解读数据 SQL 脚本
 * 
 * 运行方式：
 * npx ts-node core/scripts/generate-shensha-sql.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { convertAllData } from './convert-shensha-data';

// 读取数据文件
const dataPath = path.join(__dirname, 'shensha-data.json');
const userData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 转换数据
const sql = convertAllData(userData);

// 输出 SQL 文件
const outputPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '007_import_shensha_readings.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ SQL 文件已生成：${outputPath}`);
console.log(`📊 共处理 ${userData.length} 个神煞`);





