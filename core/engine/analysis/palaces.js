/**
 * 命宫、胎元、身宫计算
 * 
 * 从 engine/mingli/palaces.js 重新导出
 * 保持向后兼容，同时统一到 analysis 目录
 */

// 重新导出所有函数
export * from '../mingli/palaces.js';

// 导出主函数（便于统一调用）
export { calculateAllPalaces as calculatePalaces } from '../mingli/palaces.js';

