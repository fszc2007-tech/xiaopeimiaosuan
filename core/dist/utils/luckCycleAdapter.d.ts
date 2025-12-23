/**
 * 大运时间轴适配层
 *
 * 职责：将引擎原始大运数据转换为前端格式
 *
 * 设计文档：大运时间轴卡片优化方案-最终版.md
 */
/**
 * 引擎层输出（内部结构，private）
 */
export interface RawLuckCycle {
    stem: string;
    branch: string;
    stemBranch?: string;
    shishen: string;
    startAge: number;
    endAge: number;
    startUTC: Date | string;
    endUTC: Date | string;
    rawFavour?: '用神' | '中性' | '忌神';
    favourScore?: number;
}
/**
 * 适配层输出（对前端公开）
 */
export interface LuckCycleData {
    id: string;
    stemBranch: string;
    shishen: string;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    favourLevel: 'good' | 'wave' | 'flat';
    toneTag: string;
    keywords: string[];
    isCurrent: boolean;
}
/**
 * 将引擎原始大运数据转换为前端格式
 */
export declare function buildLuckCycleForApp(rawLuckCycle: RawLuckCycle[], currentAge: number): LuckCycleData[];
//# sourceMappingURL=luckCycleAdapter.d.ts.map