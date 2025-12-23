/**
 * API 文档自动生成工具
 *
 * 用法：
 * 1. 在路由文件中使用 @api 注解
 * 2. 运行 npm run docs:generate 生成文档
 */
export interface ApiDoc {
    method: string;
    path: string;
    description: string;
    auth: boolean;
    tags?: string[];
    request?: {
        params?: Record<string, string>;
        query?: Record<string, string>;
        body?: Record<string, any>;
    };
    response: {
        success: any;
        error?: string[];
    };
    example?: string;
}
/**
 * 注册 API 文档
 */
export declare function registerApi(doc: ApiDoc): void;
/**
 * 获取所有 API 文档
 */
export declare function getAllApis(): ApiDoc[];
/**
 * 按模块分组
 */
export declare function getApisByModule(): Record<string, ApiDoc[]>;
/**
 * 生成 Markdown 文档
 */
export declare function generateMarkdown(): string;
//# sourceMappingURL=apiDocs.d.ts.map