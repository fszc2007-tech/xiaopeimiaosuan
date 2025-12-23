"use strict";
/**
 * LLM 计费相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMSource = exports.LLMProvider = void 0;
/**
 * LLM 提供商枚举
 */
var LLMProvider;
(function (LLMProvider) {
    LLMProvider["DeepSeek"] = "deepseek";
    LLMProvider["OpenAI"] = "openai";
    LLMProvider["Qwen"] = "qwen";
})(LLMProvider || (exports.LLMProvider = LLMProvider = {}));
/**
 * LLM 调用来源枚举
 */
var LLMSource;
(function (LLMSource) {
    LLMSource["App"] = "app";
    LLMSource["Admin"] = "admin";
    LLMSource["Script"] = "script";
})(LLMSource || (exports.LLMSource = LLMSource = {}));
//# sourceMappingURL=types.js.map