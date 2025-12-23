// 新增理由：神煞模块统一导出
// 回滚方式：回退此文件

// ===== 核心计算模块（推荐使用） =====
export { computeAllShensha, computePillarShensha } from './compute.js';
export { buildShenshaContext } from './context.js';
export { SHENSHA_RULES, getAllRuleNames, executeRule } from './rules.js';
export { TG, DZ, whichPillarsHitBranch, whichPillarsHitStem, triTarget, uniqPush, idxFromStemBranch } from './helpers.js';

// ===== 原有模块（向后兼容） =====
export * from './basic.js';
export * from './group.js';
export * from './extended.js';
export * from './kongwang.js';
export * from './ciguan.js';
export * from './bazhuan.js';
export * from './jianlu.js';
export * from './zhuanlu.js';
export * from './metadata.js';
