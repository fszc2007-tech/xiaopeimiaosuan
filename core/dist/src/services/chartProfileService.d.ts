/**
 * 命主档案服务
 *
 * 功能：
 * - 管理命主档案（创建、查询、更新、删除）
 * - 处理当前命主切换
 * - 档案列表查询与筛选
 *
 * 数据模型：
 * - chart_profiles 表：档案管理信息
 * - bazi_charts 表：命盘计算结果
 */
export type RelationType = 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
export interface ChartProfile {
    profileId: string;
    userId: string;
    chartId: string;
    name: string;
    relationType: RelationType;
    relationLabel?: string;
    isSelf: boolean;
    notes?: string;
    avatarUrl?: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number;
    birthMinute: number;
    gender: 'male' | 'female';
    createdAt: string;
    updatedAt: string;
    lastViewedAt?: string;
}
export interface CreateChartProfileInput {
    userId: string;
    chartId: string;
    name: string;
    relationType: RelationType;
    relationLabel?: string;
    isSelf?: boolean;
    notes?: string;
}
export interface UpdateChartProfileInput {
    name?: string;
    relationType?: RelationType;
    relationLabel?: string;
    notes?: string;
}
export interface GetChartProfilesOptions {
    search?: string;
    relationType?: RelationType[];
    sortBy?: 'recent' | 'created' | 'relation';
    limit?: number;
    offset?: number;
}
/**
 * 创建命主档案
 */
export declare function createChartProfile(input: CreateChartProfileInput): Promise<ChartProfile>;
/**
 * 获取命主档案列表
 */
export declare function getChartProfiles(userId: string, options?: GetChartProfilesOptions): Promise<{
    profiles: ChartProfile[];
    total: number;
}>;
/**
 * 根据 ID 获取命主档案
 */
export declare function getChartProfileById(profileId: string): Promise<ChartProfile | null>;
/**
 * 更新命主档案
 */
export declare function updateChartProfile(profileId: string, userId: string, input: UpdateChartProfileInput): Promise<ChartProfile>;
/**
 * 删除命主档案
 */
export declare function deleteChartProfile(profileId: string, userId: string): Promise<void>;
/**
 * 更新最后查看时间
 */
export declare function updateLastViewedAt(profileId: string): Promise<void>;
/**
 * 获取命主档案（含命盘数据）
 */
export declare function getChartProfileWithChart(profileId: string): Promise<{
    profile: ChartProfile;
    chart: any;
} | null>;
//# sourceMappingURL=chartProfileService.d.ts.map