"use strict";
/**
 * 测试神煞解读 API
 *
 * 运行方式：
 * npx ts-node core/scripts/test-shensha-api.ts
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
require("dotenv/config");
const shenshaReadingService = __importStar(require("../src/modules/shensha/shenshaReadingService"));
const connection_1 = require("../src/database/connection");
// 初始化数据库连接
(0, connection_1.createConnection)();
async function testShenshaAPI() {
    console.log('🧪 开始测试神煞解读 API...\n');
    // 测试用例
    const testCases = [
        { code: 'tai_ji_gui_ren', pillarType: 'year', name: '太极贵人-年柱' },
        { code: 'tian_yi_gui_ren', pillarType: 'month', name: '天乙贵人-月柱' },
        { code: 'tao_hua', pillarType: 'day', name: '桃花-日柱' },
        { code: 'hong_luan', pillarType: 'hour', name: '红鸾-时柱' },
    ];
    let successCount = 0;
    let failCount = 0;
    for (const testCase of testCases) {
        try {
            console.log(`📋 测试: ${testCase.name}`);
            const result = await shenshaReadingService.getShenshaReading(testCase.code, testCase.pillarType);
            if (result) {
                console.log(`  ✅ 成功获取数据`);
                // 使用 JSON.stringify 来正确显示中文
                console.log(`     - 名称: ${JSON.stringify(result.name)}`);
                console.log(`     - 类型: ${result.type}`);
                console.log(`     - 徽标: ${JSON.stringify(result.badge_text)}`);
                console.log(`     - 短标题: ${JSON.stringify(result.short_title || '(无)')}`);
                console.log(`     - 总结: ${JSON.stringify(result.summary.substring(0, 50))}...`);
                console.log(`     - 要点数: ${result.bullet_points.length}`);
                console.log(`     - 推荐问题数: ${result.recommended_questions.length}`);
                console.log(`     - 柱位解读: ${JSON.stringify(result.pillar_explanation[0]?.text?.substring(0, 50) || '')}...`);
                successCount++;
            }
            else {
                console.log(`  ❌ 未找到数据`);
                failCount++;
            }
        }
        catch (error) {
            console.log(`  ❌ 错误: ${error.message}`);
            failCount++;
        }
        console.log('');
    }
    console.log('📊 测试结果:');
    console.log(`   ✅ 成功: ${successCount}`);
    console.log(`   ❌ 失败: ${failCount}`);
    console.log(`   📈 成功率: ${((successCount / testCases.length) * 100).toFixed(1)}%`);
}
// 运行测试
testShenshaAPI().catch(console.error);
//# sourceMappingURL=test-shensha-api.js.map