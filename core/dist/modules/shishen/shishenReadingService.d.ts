/**
 * 十神解读服务
 *
 * 负责从数据库获取十神解读内容
 * 支持判断十神是否为喜神/忌神
 */
export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type GenderType = 'male' | 'female';
export interface ShishenReadingRow {
    reading_id: string;
    shishen_code: string;
    pillar_type: PillarType;
    name: string;
    badge_text: string;
    type: 'auspicious' | 'inauspicious' | 'neutral';
    short_title: string;
    for_this_position: string;
    recommended_questions: string[];
    gender: GenderType | 'all';
    is_active: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}
export interface ShishenReadingDto {
    code: string;
    name: string;
    badge_text: string;
    type: 'auspicious' | 'inauspicious' | 'neutral';
    short_title: string;
    pillar_explanation: Array<{
        pillar: PillarType;
        text: string;
    }>;
    recommended_questions: string[];
    favor_status?: 'favorable' | 'unfavorable' | 'neutral';
}
/**
 * 获取十神解读内容
 *
 * @param shishenCode 十神代码（如 'bi_jian', 'jie_cai'）
 * @param pillarType 柱位类型（可选，如果提供则只返回该柱位的解读）
 * @param gender 性别（必填，male/female，排盤時必然有性別）
 * @param baziData 命盘数据（可选，用于判断喜神/忌神）
 * @returns 解读内容，如果不存在则返回 null
 */
export declare function getShishenReading(shishenCode: string, pillarType: PillarType | undefined, gender: GenderType, baziData?: any): Promise<ShishenReadingDto | null>;
//# sourceMappingURL=shishenReadingService.d.ts.map