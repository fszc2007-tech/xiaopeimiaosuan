/**
 * 独立的 ES 模块运行器
 * 用于在纯 Node 环境中运行引擎，避免 ts-node 干扰
 */

import { BaziEngine } from './index.js';

// ✅ 重定向所有 console.log 到 stderr，确保 stdout 只包含 JSON
const originalLog = console.log;
const originalError = console.error;

// 重定向 console.log 到 stderr
console.log = (...args) => {
  originalError(...args);
};

// console.error 保持输出到 stderr
console.error = originalError;

// 从 stdin 读取输入数据
let inputData = '';

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    const birthInfo = JSON.parse(inputData);
    const engine = new BaziEngine();
    const result = await engine.compute(birthInfo);
    
    // ✅ 重要：只输出 JSON 到 stdout，所有调试信息已重定向到 stderr
    const jsonOutput = JSON.stringify({ success: true, data: result });
    
    // 直接写入 stdout，不使用 console.log（避免被其他 console.log 污染）
    process.stdout.write(jsonOutput + '\n');
    process.exit(0);
  } catch (error) {
    // 错误信息也直接写入 stdout（作为 JSON）
    const errorOutput = JSON.stringify({
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    process.stdout.write(errorOutput + '\n');
    process.exit(1);
  }
});

