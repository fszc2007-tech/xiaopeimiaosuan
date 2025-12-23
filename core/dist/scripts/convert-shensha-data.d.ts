/**
 * 神煞解读数据转换脚本
 *
 * 将用户提供的数据转换为 SQL INSERT 语句
 *
 * 使用方法：
 * 1. 将用户提供的数据整理成 JSON 格式
 * 2. 运行此脚本生成 SQL 文件
 */
interface UserShenshaData {
    神煞名称: string;
    核心含义: string;
    年柱: string;
    月柱: string;
    日柱: string;
    时柱: string;
    备注: string;
}
/**
 * 主函数：转换所有数据
 */
export declare function convertAllData(userData: UserShenshaData[]): string;
export {};
//# sourceMappingURL=convert-shensha-data.d.ts.map