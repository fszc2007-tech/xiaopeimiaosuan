/**
 * 神煞解读服务
 *
 * 负责从数据库获取神煞解读内容
 * 支持按性别返回不同的解读（紅鸞、天喜、流霞、孤辰、寡宿）
 */
export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type GenderType = 'male' | 'female';
export interface ShenshaReadingDto {
    code: string;
    name: string;
    badge_text: string;
    type: 'auspicious' | 'inauspicious' | 'neutral';
    short_title: string;
    summary: string;
    bullet_points: string[];
    pillar_explanation: Array<{
        pillar: PillarType;
        text: string;
    }>;
    recommended_questions: string[];
}
/**
 * 获取神煞解读内容
 *
 * @param shenshaCode 神煞代码（如 'tian_yi_gui_ren'）
 * @param pillarType 柱位类型（可选，如果提供则只返回该柱位的解读）
 * @param gender 性別（必填，male/female，排盤時必然有性別）
 * @returns 解读内容，如果不存在则返回 null
 */
export declare function getShenshaReading(shenshaCode: string, pillarType: PillarType | undefined, gender: GenderType): Promise<ShenshaReadingDto | null>;
//# sourceMappingURL=shenshaReadingService.d.ts.map