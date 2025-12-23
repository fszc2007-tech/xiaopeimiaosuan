/**
 * API 文档生成脚本
 * 
 * 运行：npm run docs:generate
 */

import fs from 'fs';
import path from 'path';

// 导入所有路由以触发 API 注册
import '../src/routes/auth';
import '../src/routes/bazi';
import '../src/routes/reading';

import { generateMarkdown } from '../src/utils/apiDocs';

// 生成文档
const markdown = generateMarkdown();

// 保存到文件
const outputPath = path.join(__dirname, '../../API接口文档-自动生成.md');
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log(`✅ API 文档已生成: ${outputPath}`);
console.log(`📝 共 ${markdown.split('###').length - 1} 个接口`);

