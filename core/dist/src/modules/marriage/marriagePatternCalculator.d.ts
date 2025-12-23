/**
 * 婚姻模式计算器
 *
 * 基于命盘结构、配偶星状态、十神组合等综合判断婚姻模式
 * 复用系统已有的计算能力，新增针对婚姻场景的分析逻辑
 */
/**
 * 计算早婚/晚婚/不婚倾向
 */
export declare function calculateMarriageTendency(params: {
    spouseStarStatus: any;
    spousePalace: any;
    W: any;
    pillars: any;
    dayMasterStrength: any;
}): string;
/**
 * 计算婚姻稳定度
 */
export declare function calculateStabilityLevel(params: {
    spouseStarStatus: any;
    spousePalace: any;
    breaking: any;
    purityLevel: string;
}): '偏稳' | '有波动' | '波动较大';
/**
 * 计算矛盾处理风格
 */
export declare function calculateConflictStyle(params: {
    W: any;
    dayMasterStrength: any;
    shiShangStatus: any;
}): string;
/**
 * 计算现实压力落点
 */
export declare function calculateRealityPressureFocus(params: {
    W: any;
    structure: any;
}): string;
/**
 * 计算风险提示
 */
export declare function calculateMarriageRiskHints(params: {
    breaking: any;
    spouseStarStatus: any;
    spousePalace: any;
    conflictStyle: string;
}): string[];
/**
 * 计算改善方向
 */
export declare function calculateHealingHints(params: {
    riskHints: string[];
    conflictStyle: string;
    yongshen: any;
    realityPressureFocus: string;
}): string[];
/**
 * 统一计算婚姻模式
 */
export declare function calculateMarriagePattern(params: {
    W: any;
    spouseStarStatus: any;
    spousePalace: any;
    breaking: any;
    purityLevel: string;
    dayMasterStrength: any;
    pillars: any;
    yongshen: any;
    structure: any;
    shiShangStatus: any;
}): {
    marriageTendency: string;
    stabilityLevel: '偏稳' | '有波动' | '波动较大';
    conflictStyle: string;
    realityPressureFocus: string;
    riskHints: string[];
    healingHints: string[];
};
//# sourceMappingURL=marriagePatternCalculator.d.ts.map