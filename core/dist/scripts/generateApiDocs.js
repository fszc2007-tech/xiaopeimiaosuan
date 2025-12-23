"use strict";
/**
 * API 文档生成脚本
 *
 * 运行：npm run docs:generate
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 导入所有路由以触发 API 注册
require("../src/routes/auth");
require("../src/routes/bazi");
require("../src/routes/reading");
const apiDocs_1 = require("../src/utils/apiDocs");
// 生成文档
const markdown = (0, apiDocs_1.generateMarkdown)();
// 保存到文件
const outputPath = path_1.default.join(__dirname, '../../API接口文档-自动生成.md');
fs_1.default.writeFileSync(outputPath, markdown, 'utf-8');
console.log(`✅ API 文档已生成: ${outputPath}`);
console.log(`📝 共 ${markdown.split('###').length - 1} 个接口`);
//# sourceMappingURL=generateApiDocs.js.map