"use strict";
/**
 * LLM 连接测试工具
 *
 * 功能：测试 DeepSeek、ChatGPT、Qwen 的 API 连接
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLLMConnection = testLLMConnection;
const axios_1 = __importDefault(require("axios"));
/**
 * 测试 LLM 连接
 */
async function testLLMConnection(params) {
    const startTime = Date.now();
    try {
        // 构建测试请求
        const endpoint = `${params.baseUrl}/chat/completions`;
        const requestBody = {
            model: params.modelName,
            messages: [
                {
                    role: 'user',
                    content: '你好'
                }
            ],
            max_tokens: 10,
            temperature: 0.1,
        };
        // 发送请求
        const response = await axios_1.default.post(endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${params.apiKey}`,
            },
            timeout: 30000, // 30秒超时
        });
        const latency = Date.now() - startTime;
        // 检查响应
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return {
                success: true,
                message: '连接成功',
                latency,
            };
        }
        else {
            return {
                success: false,
                message: '响应格式不正确',
                latency,
            };
        }
    }
    catch (error) {
        const latency = Date.now() - startTime;
        // 解析错误信息
        let errorMessage = '连接失败';
        if (error.response) {
            // API 返回错误
            const status = error.response.status;
            const data = error.response.data;
            if (status === 401) {
                errorMessage = 'API Key 无效或已过期';
            }
            else if (status === 403) {
                errorMessage = '没有权限访问该 API';
            }
            else if (status === 429) {
                errorMessage = 'API 请求频率超限';
            }
            else if (status === 500 || status === 502 || status === 503) {
                errorMessage = 'API 服务器错误';
            }
            else if (data && data.error && data.error.message) {
                errorMessage = data.error.message;
            }
            else {
                errorMessage = `HTTP ${status} 错误`;
            }
        }
        else if (error.code === 'ECONNREFUSED') {
            errorMessage = '无法连接到服务器';
        }
        else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            errorMessage = '连接超时';
        }
        else if (error.message) {
            errorMessage = error.message;
        }
        return {
            success: false,
            message: errorMessage,
            latency,
            error: error.message,
        };
    }
}
//# sourceMappingURL=llmTester.js.map