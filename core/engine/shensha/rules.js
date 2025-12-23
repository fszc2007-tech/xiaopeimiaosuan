// 新增理由：神煞规则统一定义
// 回滚方式：回退此文件

import { TG, DZ, whichPillarsHitBranch, whichPillarsHitStem, triTarget } from './helpers.js';

/**
 * 神煞计算规则集合
 * 每个规则是一个函数，接收上下文对象，返回命中的柱位
 */
export const SHENSHA_RULES = {
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

  "月德合": (ctx) => {
    const base = triTarget(ctx.mZ, {"寅午戌":"丙","申子辰":"壬","亥卯未":"甲","巳酉丑":"庚"});
    const pair = {"丙":"辛","壬":"丁","甲":"己","庚":"乙"}[base];
    return whichPillarsHitStem(ctx, new Set([pair]));
  },

  "天德合": (ctx) => {
    const m = {
      "寅":"壬","卯":"巳","辰":"丁","巳":"丙","午":"寅","未":"己",
      "申":"戊","酉":"亥","戌":"辛","亥":"庚","子":"申","丑":"乙"
    };
    const t = m[ctx.mZ];
    return TG.includes(t) ? 
      whichPillarsHitStem(ctx, new Set([t])) : 
      whichPillarsHitBranch(ctx, new Set([t]));
  },

  "国印贵人": (ctx) => {
    const m = {
      "甲":"戌","乙":"亥","丙":"丑","丁":"寅","戊":"丑",
      "己":"寅","庚":"辰","辛":"巳","壬":"未","癸":"申"
    };
    return whichPillarsHitBranch(ctx, new Set([m[ctx.dG]]));
  },

  "天厨贵人": (ctx) => {
    const m = {
      "甲":"巳","乙":"午","丙":"子","丁":"巳","戊":"午",
      "己":"申","庚":"寅","辛":"午","壬":"酉","癸":"亥"
    };
    return whichPillarsHitBranch(ctx, new Set([m[ctx.dG]]));
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
  },

  // 桃花（咸池）：统一计算函数
  "桃花": (ctx) => {
    const t = triTarget(ctx.yZ, {"申子辰":"酉","寅午戌":"卯","巳酉丑":"午","亥卯未":"子"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "华盖": (ctx) => {
    const t = triTarget(ctx.yZ, {"寅午戌":"戌","亥卯未":"未","申子辰":"辰","巳酉丑":"丑"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "驿马": (ctx) => {
    const t = triTarget(ctx.yZ, {"申子辰":"寅","寅午戌":"申","巳酉丑":"亥","亥卯未":"巳"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "将星": (ctx) => {
    const t = triTarget(ctx.yZ, {"申子辰":"午","寅午戌":"子","巳酉丑":"卯","亥卯未":"酉"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "孤辰": (ctx) => {
    const t = triTarget(ctx.yZ, {"亥子丑":"寅","寅卯辰":"巳","巳午未":"申","申酉戌":"亥"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "寡宿": (ctx) => {
    const t = triTarget(ctx.yZ, {"亥子丑":"戌","寅卯辰":"丑","巳午未":"辰","申酉戌":"未"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "亡神": (ctx) => {
    const t = triTarget(ctx.yZ, {"申子辰":"亥","寅午戌":"巳","巳酉丑":"申","亥卯未":"寅"});
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "丧门": (ctx) => {
    const i = DZ.indexOf(ctx.yZ);
    const t = DZ[(i + 2) % 12];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "吊客": (ctx) => {
    const i = DZ.indexOf(ctx.yZ);
    const t = DZ[(i - 2 + 12) % 12];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "披麻": (ctx) => {
    const i = DZ.indexOf(ctx.yZ);
    const t = DZ[(i - 3 + 12) % 12];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "德秀贵人": (ctx) => {
    const sets = {
      "寅午戌": { de: new Set(["丙","丁"]), xiu: new Set(["戊","癸"]) },
      "申子辰": { de: new Set(["壬","癸","戊","己"]), xiu: new Set(["丙","辛","甲","己"]) },
      "巳酉丑": { de: new Set(["庚","辛"]), xiu: new Set(["乙","庚"]) },
      "亥卯未": { de: new Set(["甲","乙"]), xiu: new Set(["丁","壬"]) }
    };
    let ok = false;
    const all = new Set([ctx.yG, ctx.mG, ctx.dG, ctx.hG]);
    for (const k in sets) {
      if (k.includes(ctx.mZ)) {
        const S = sets[k];
        ok = ([...all].some(x => S.de.has(x)) && [...all].some(x => S.xiu.has(x)));
        break;
      }
    }
    if (!ok) return {};
    const res = {};
    for (const [p, g] of [["年柱",ctx.yG],["月柱",ctx.mG],["日柱",ctx.dG],["时柱",ctx.hG]]) {
      for (const k in sets) {
        if (sets[k].de.has(g) || sets[k].xiu.has(g)) {
          res[p] = true;
          break;
        }
      }
    }
    return res;
  },

  "龙德贵人": (ctx) => {
    const m = {
      "子":"未","丑":"申","寅":"酉","卯":"戌","辰":"亥","巳":"子",
      "午":"丑","未":"寅","申":"卯","酉":"辰","戌":"巳","亥":"午"
    };
    const t = m[ctx.yZ];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "流霞": (ctx) => {
    const m = {
      "甲":"酉","乙":"戌","丙":"未","丁":"申","戊":"巳",
      "己":"午","庚":"辰","辛":"卯","壬":"亥","癸":"寅"
    };
    const t = m[ctx.dG];
    return whichPillarsHitBranch(ctx, new Set([t]));
  },

  "文昌贵人": (ctx) => {
    const m = {
      "甲":"巳","乙":"午","丙":"申","丁":"酉","戊":"申",
      "己":"酉","庚":"亥","辛":"戌","壬":"寅","癸":"卯"
    };
    const s = new Set([...(m[ctx.yG] || []), ...(m[ctx.dG] || [])]);
    return whichPillarsHitBranch(ctx, s);
  },

  "词馆": (ctx) => {
    const m = {
      "甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳",
      "己":"午","庚":"申","辛":"酉","壬":"亥","癸":"戌"
    };
    const yearTarget = m[ctx.yG];
    const dayTarget = m[ctx.dG];
    const targets = new Set([yearTarget, dayTarget].filter(Boolean));
    return whichPillarsHitBranch(ctx, targets);
  },

  "八专": (ctx) => {
    const baZhuanSet = new Set(["甲寅","乙卯","丁未","己未","庚申","辛酉","戊戌","癸丑"]);
    const result = {};
    if (baZhuanSet.has(ctx.dG + ctx.dZ)) result["日柱"] = true;
    if (baZhuanSet.has(ctx.hG + ctx.hZ)) result["时柱"] = true;
    return result;
  },

  "建禄": (ctx) => {
    const luShenMap = {
      "甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳",
      "己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子"
    };
    const result = {};
    if (luShenMap[ctx.mG] === ctx.mZ) result["月柱"] = true;
    return result;
  },

  "专禄": (ctx) => {
    const luShenMap = {
      "甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳",
      "己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子"
    };
    const result = {};
    if (luShenMap[ctx.dG] === ctx.dZ) result["日柱"] = true;
    return result;
  },

  "十惡大敗": (ctx) => {
    // 十惡大敗日：祿神逢空亡之日，只看日柱
    // 注意：十惡大敗只論日柱，但返回格式與太極貴人一致
    const SHI_E_DA_BAI_DAYS = new Set([
      '甲辰','乙巳','丙申','丁亥','戊戌',
      '己丑','庚辰','辛巳','壬申','癸亥',
    ]);
    const result = {};
    // 只檢查日柱，但返回格式與其他神煞一致
    if (SHI_E_DA_BAI_DAYS.has(ctx.dG + ctx.dZ)) {
      result["日柱"] = true;
    }
    return result;
  },
};

/**
 * 获取所有规则名称
 */
export function getAllRuleNames() {
  return Object.keys(SHENSHA_RULES);
}

/**
 * 执行单个规则
 * @param {string} ruleName - 规则名称
 * @param {Object} ctx - 上下文对象
 * @returns {Object} 命中的柱位
 */
export function executeRule(ruleName, ctx) {
  const rule = SHENSHA_RULES[ruleName];
  if (!rule) return {};
  return rule(ctx);
}

