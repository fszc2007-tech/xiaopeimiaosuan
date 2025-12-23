"use strict";
/**
 * 八字引擎接口
 *
 * 调用 core/engine/ 中的 JavaScript 引擎
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBaziChart = computeBaziChart;
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * 计算八字
 */
async function computeBaziChart(birthInfo) {
    return new Promise((resolve, reject) => {
        console.log('[BaziEngine] Starting engine via child process...');
        console.log('[BaziEngine] Birth info:', birthInfo);
        const runnerPath = path.resolve(__dirname, '../../../engine/runner.mjs');
        // 使用独立的 node 进程运行引擎，避免 ts-node 干扰
        const child = (0, child_process_1.spawn)('node', [runnerPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        child.on('close', (code) => {
            if (code === 0) {
                try {
                    // ✅ 从 stdout 中提取 JSON（可能包含调试信息，需要找到 JSON 行）
                    // 方法1：尝试直接解析整个 stdout
                    let response;
                    try {
                        response = JSON.parse(stdout.trim());
                    }
                    catch (e) {
                        // 方法2：如果直接解析失败，尝试找到以 { 开头的 JSON 行
                        const lines = stdout.split('\n');
                        const jsonLine = lines.find(line => line.trim().startsWith('{') && line.trim().endsWith('}'));
                        if (jsonLine) {
                            response = JSON.parse(jsonLine.trim());
                        }
                        else {
                            throw new Error('No valid JSON found in stdout');
                        }
                    }
                    if (response.success) {
                        console.log('[BaziEngine] ✅ Computation completed successfully');
                        console.log('[BaziEngine] Result fields:', Object.keys(response.data).length);
                        resolve(response.data);
                    }
                    else {
                        console.error('[BaziEngine] ❌ Engine returned error:', response.error);
                        reject(new Error(`八字计算失败: ${response.error.message}`));
                    }
                }
                catch (error) {
                    console.error('[BaziEngine] ❌ Failed to parse engine output:', error);
                    console.error('[BaziEngine] stdout (first 500 chars):', stdout.substring(0, 500));
                    console.error('[BaziEngine] stderr:', stderr);
                    reject(new Error(`八字计算失败: 无法解析引擎输出`));
                }
            }
            else {
                console.error('[BaziEngine] ❌ Engine process exited with code:', code);
                console.error('[BaziEngine] stderr:', stderr);
                reject(new Error(`八字计算失败: 引擎进程异常退出 (code ${code})`));
            }
        });
        child.on('error', (error) => {
            console.error('[BaziEngine] ❌ Failed to spawn engine process:', error);
            reject(new Error(`八字计算失败: ${error.message}`));
        });
        // 将输入数据写入 stdin
        child.stdin.write(JSON.stringify(birthInfo));
        child.stdin.end();
    });
}
//# sourceMappingURL=engine.js.map