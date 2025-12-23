/**
 * 命盘服务
 *
 * 负责命盘计算、存储、查询等功能
 */
import { ChartProfile } from '../../types';
/**
 * 计算命盘
 */
export declare function computeChart(params: {
    userId: string;
    name: string;
    gender: 'male' | 'female';
    birth: any;
    chartProfileId?: string;
    forceRecompute?: boolean;
    relationType?: string;
}): Promise<{
    chartId: string;
    chartProfileId: string;
    result: any;
}>;
/**
 * 获取命盘列表
 */
export declare function getCharts(params: {
    userId: string;
    page: number;
    pageSize: number;
    search: string;
}): Promise<{
    items: ChartProfile[];
    total: number;
}>;
/**
 * 获取命盘详情
 */
export declare function getChartDetail(params: {
    userId: string;
    chartId: string;
}): Promise<any>;
/**
 * 删除命盘
 *
 * 支持两种方式：
 * 1. 通过 chartId 删除（优先）
 * 2. 通过 profileId（chart_profile_id）删除（如果 chartId 不存在）
 */
export declare function deleteChart(params: {
    userId: string;
    chartId: string;
}): Promise<void>;
//# sourceMappingURL=baziService.d.ts.map