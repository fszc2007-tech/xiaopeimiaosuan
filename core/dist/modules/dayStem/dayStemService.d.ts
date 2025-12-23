/**
 * 日主天干解读服务
 *
 * 负责从数据库获取日主天干解读内容
 */
export interface DayStemReadingDto {
    stem: string;
    element: string;
    yinYang: string;
    title: string;
    description: string;
}
/**
 * 获取日主天干解读
 * @param stem 日主天干（甲/乙/丙/丁/戊/己/庚/辛/壬/癸）
 * @returns 解读内容，如果不存在则返回 null
 */
export declare function getDayStemReading(stem: string): Promise<DayStemReadingDto | null>;
/**
 * 获取所有日主天干解读（用于预加载或缓存）
 */
export declare function getAllDayStemReadings(): Promise<DayStemReadingDto[]>;
//# sourceMappingURL=dayStemService.d.ts.map