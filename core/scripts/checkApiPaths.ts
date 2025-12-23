/**
 * API 路径对齐检查脚本
 * 
 * 功能：
 * 1. 读取 API接口统一规范.md 中定义的规范路径
 * 2. 扫描后端路由注册（registerApi 调用）
 * 3. 对比是否存在不一致
 * 
 * 运行：npm run check:api-paths
 */

import fs from 'fs';
import path from 'path';
import { getAllApis } from '../src/utils/apiDocs';

// ===== 1. 从规范文档中提取路径 =====

interface SpecApiPath {
  method: string;
  path: string;
  description: string;
}

function extractSpecPaths(): SpecApiPath[] {
  const specFile = path.join(__dirname, '../../app.doc/API接口统一规范.md');
  
  if (!fs.existsSync(specFile)) {
    console.warn('[Warning] API接口统一规范.md not found');
    return [];
  }
  
  const content = fs.readFileSync(specFile, 'utf-8');
  const paths: SpecApiPath[] = [];
  
  // 正则匹配：#### 5.1.1 登录 / 注册
  // - **方法**: `POST`
  // - **路径**: `/api/v1/auth/login_or_register`
  
  const apiBlockRegex = /####\s+\d+\.\d+\.\d+\s+(.+?)\n.*?-\s+\*\*方法\*\*:\s+`(\w+)`\n.*?-\s+\*\*路径\*\*:\s+`([^`]+)`/gs;
  
  let match;
  while ((match = apiBlockRegex.exec(content)) !== null) {
    paths.push({
      description: match[1].trim(),
      method: match[2],
      path: match[3],
    });
  }
  
  return paths;
}

// ===== 2. 从代码中获取已注册的路径 =====

function getRegisteredPaths() {
  // 确保所有路由都被导入，触发 registerApi 调用
  require('../src/routes/auth');
  require('../src/routes/bazi');
  require('../src/routes/reading');
  require('../src/routes/conversation');
  
  return getAllApis();
}

// ===== 3. 对比检查 =====

function checkAlignment() {
  console.log('🔍 API 路径对齐检查\n');
  
  const specPaths = extractSpecPaths();
  const registeredPaths = getRegisteredPaths();
  
  console.log(`📋 规范文档中定义: ${specPaths.length} 个 API`);
  console.log(`📝 代码中注册: ${registeredPaths.length} 个 API\n`);
  
  // 检查：规范中有，代码中没有
  const missingInCode: SpecApiPath[] = [];
  for (const spec of specPaths) {
    const found = registeredPaths.find(
      reg => reg.method === spec.method && reg.path === spec.path
    );
    if (!found) {
      missingInCode.push(spec);
    }
  }
  
  // 检查：代码中有，规范中没有
  const missingInSpec: typeof registeredPaths = [];
  for (const reg of registeredPaths) {
    const found = specPaths.find(
      spec => spec.method === reg.method && spec.path === reg.path
    );
    if (!found) {
      missingInSpec.push(reg);
    }
  }
  
  // 输出结果
  let hasError = false;
  
  if (missingInCode.length > 0) {
    hasError = true;
    console.log('❌ 规范中定义但代码中未实现的 API:\n');
    missingInCode.forEach(api => {
      console.log(`   ${api.method} ${api.path}`);
      console.log(`   说明: ${api.description}\n`);
    });
  }
  
  if (missingInSpec.length > 0) {
    hasError = true;
    console.log('⚠️  代码中已实现但规范中未记录的 API:\n');
    missingInSpec.forEach(api => {
      console.log(`   ${api.method} ${api.path}`);
      console.log(`   说明: ${api.description}\n`);
    });
  }
  
  if (!hasError) {
    console.log('✅ API 路径完全对齐，没有发现不一致！\n');
  } else {
    console.log('💡 建议:\n');
    console.log('   1. 将缺失的 API 补充到规范文档或代码中');
    console.log('   2. 确保规范文档与代码保持同步');
    console.log('   3. 运行 npm run docs:generate 更新 API 文档\n');
    process.exit(1);
  }
}

// ===== 4. 运行检查 =====

try {
  checkAlignment();
} catch (error: any) {
  console.error('❌ 检查失败:', error.message);
  process.exit(1);
}

