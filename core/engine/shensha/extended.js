// 新增理由：扩展神煞计算（v6.0补丁）
// 回滚方式：回退此文件
// 注意：此文件保留向后兼容，主要规则已迁移至 rules.js

import { TG, whichPillarsHitBranch, whichPillarsHitStem, triTarget } from './helpers.js';

/**
 * 扩展神煞规则（向后兼容导出）
 * @deprecated 推荐使用 rules.js 中的 SHENSHA_RULES
 */
export const EXTENDED_RULES = {
  "太极贵人": (ctx) => {
    const m = {
      "甲": ["子","午"], "乙": ["子","午"], "丙": ["酉","卯"], "丁": ["酉","卯"],
      "戊": ["辰","戌","丑","未"], "己": ["辰","戌","丑","未"],
      "庚": ["寅","亥"], "辛": ["寅","亥"], "壬": ["巳","申"], "癸": ["巳","申"]
    };
    const s = new Set([...(m[ctx.dG] || []), ...(m[ctx.yG] || [])]);
    return whichPillarsHitBranch(ctx, s);
  },

  "月德贵人": (ctx) => {
    const t = triTarget(ctx.mZ, {"寅午戌":"丙","申子辰":"壬","亥卯未":"甲","巳酉丑":"庚"});
    return whichPillarsHitStem(ctx, new Set([t]));
  },

  "天德贵人": (ctx) => {
    const m = {
      "寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲",
      "申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"巳","丑":"庚"
    };
    const t = m[ctx.mZ];
    return TG.includes(t) ? 
      whichPillarsHitStem(ctx, new Set([t])) : 
      whichPillarsHitBranch(ctx, new Set([t]));
  },

  "红鸾": (ctx) => {
    const t = {
      "子":"卯","丑":"寅","寅":"丑","卯":"子","辰":"亥","巳":"戌",
      "午":"酉","未":"申","申":"未","酉":"午","戌":"巳","亥":"辰"
    }[ctx.yZ];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "天喜": (ctx) => {
    const t = {
      "子":"酉","丑":"申","寅":"未","卯":"午","辰":"巳","巳":"辰",
      "午":"卯","未":"寅","申":"丑","酉":"子","戌":"亥","亥":"戌"
    }[ctx.yZ];
    return whichPillarsHitBranch(ctx, new Set([t]));
  }
};
