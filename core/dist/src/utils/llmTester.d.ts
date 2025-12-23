/**
 * LLM 连接测试工具
 *
 * 功能：测试 DeepSeek、ChatGPT、Qwen 的 API 连接
 */
interface TestConnectionParams {
    provider: 'deepseek' | 'chatgpt' | 'qwen';
    apiKey: string;
    baseUrl: string;
    modelName: string;
}
interface TestConnectionResult {
    success: boolean;
    message: string;
    latency?: number;
    error?: string;
}
/**
 * 测试 LLM 连接
 */
export declare function testLLMConnection(params: TestConnectionParams): Promise<TestConnectionResult>;
export {};
//# sourceMappingURL=llmTester.d.ts.map