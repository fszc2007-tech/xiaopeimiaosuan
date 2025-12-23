"use strict";
/**
 * 生成神煞解读数据 SQL 脚本
 *
 * 运行方式：
 * npx ts-node core/scripts/generate-shensha-sql.ts
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const convert_shensha_data_1 = require("./convert-shensha-data");
// 读取数据文件
const dataPath = path.join(__dirname, 'shensha-data.json');
const userData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
// 转换数据
const sql = (0, convert_shensha_data_1.convertAllData)(userData);
// 输出 SQL 文件
const outputPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '007_import_shensha_readings.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`✅ SQL 文件已生成：${outputPath}`);
console.log(`📊 共处理 ${userData.length} 个神煞`);
//# sourceMappingURL=generate-shensha-sql.js.map