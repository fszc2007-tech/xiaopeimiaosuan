"use strict";
/**
 * API 文档自动生成工具
 *
 * 用法：
 * 1. 在路由文件中使用 @api 注解
 * 2. 运行 npm run docs:generate 生成文档
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApi = registerApi;
exports.getAllApis = getAllApis;
exports.getApisByModule = getApisByModule;
exports.generateMarkdown = generateMarkdown;
/**
 * API 文档注册表
 */
const apiRegistry = [];
/**
 * 注册 API 文档
 */
function registerApi(doc) {
    apiRegistry.push(doc);
}
/**
 * 获取所有 API 文档
 */
function getAllApis() {
    return apiRegistry;
}
/**
 * 按模块分组
 */
function getApisByModule() {
    const grouped = {};
    apiRegistry.forEach(api => {
        const module = api.path.split('/')[3] || 'unknown'; // /api/v1/[module]/...
        if (!grouped[module]) {
            grouped[module] = [];
        }
        grouped[module].push(api);
    });
    return grouped;
}
/**
 * 生成 Markdown 文档
 */
function generateMarkdown() {
    const grouped = getApisByModule();
    const modules = Object.keys(grouped).sort();
    let md = `# API 接口文档

> **自动生成时间**: ${new Date().toISOString()}  
> **版本**: v1.0  
> **基础 URL**: \`http://localhost:3000\`

---

## 📋 接口总览

`;
    // 统计
    const totalApis = apiRegistry.length;
    const authApis = apiRegistry.filter(api => api.auth).length;
    md += `- **总接口数**: ${totalApis}\n`;
    md += `- **需要认证**: ${authApis}\n`;
    md += `- **公开接口**: ${totalApis - authApis}\n\n`;
    md += `## 📑 模块列表\n\n`;
    modules.forEach(module => {
        md += `- [${module}](#${module}模块) (${grouped[module].length} 个接口)\n`;
    });
    md += `\n---\n\n`;
    // 各模块详情
    modules.forEach(module => {
        md += `## ${module}模块\n\n`;
        grouped[module].forEach(api => {
            md += `### ${api.method} ${api.path}\n\n`;
            md += `**描述**: ${api.description}\n\n`;
            md += `**认证**: ${api.auth ? '✅ 需要（Bearer Token）' : '❌ 不需要'}\n\n`;
            // 请求参数
            if (api.request) {
                if (api.request.params) {
                    md += `**路径参数**:\n\n`;
                    Object.entries(api.request.params).forEach(([key, desc]) => {
                        md += `- \`${key}\`: ${desc}\n`;
                    });
                    md += `\n`;
                }
                if (api.request.query) {
                    md += `**查询参数**:\n\n`;
                    Object.entries(api.request.query).forEach(([key, desc]) => {
                        md += `- \`${key}\`: ${desc}\n`;
                    });
                    md += `\n`;
                }
                if (api.request.body) {
                    md += `**请求体**:\n\n\`\`\`json\n${JSON.stringify(api.request.body, null, 2)}\n\`\`\`\n\n`;
                }
            }
            // 响应示例
            md += `**成功响应**:\n\n\`\`\`json\n${JSON.stringify(api.response.success, null, 2)}\n\`\`\`\n\n`;
            if (api.response.error && api.response.error.length > 0) {
                md += `**错误码**:\n\n`;
                api.response.error.forEach(error => {
                    md += `- \`${error}\`\n`;
                });
                md += `\n`;
            }
            if (api.example) {
                md += `**示例**:\n\n\`\`\`bash\n${api.example}\n\`\`\`\n\n`;
            }
            md += `---\n\n`;
        });
    });
    md += `## 📚 统一响应格式\n\n`;
    md += `所有接口都遵循统一的响应格式：\n\n`;
    md += `**成功响应**:\n\`\`\`json\n{\n  "success": true,\n  "data": { /* 业务数据 */ }\n}\n\`\`\`\n\n`;
    md += `**错误响应**:\n\`\`\`json\n{\n  "success": false,\n  "error": {\n    "code": "ERROR_CODE",\n    "message": "错误信息",\n    "details": {} // 可选\n  }\n}\n\`\`\`\n\n`;
    return md;
}
//# sourceMappingURL=apiDocs.js.map