/**
 * 字段映射器（FieldMapper）
 *
 * 职责：将数据库行（snake_case）转换为 API DTO（camelCase）
 *
 * 原则：
 * 1. 所有对外 API 响应必须通过 FieldMapper
 * 2. 禁止在 service 层手搓字段映射
 * 3. 使用 TypeScript 类型约束，避免字段遗漏或错误
 * 4. 单一真相源：DTO 定义是唯一标准
 */
import type { UserRow, ChartProfileRow, BaziChartRow, ConversationRow, MessageRow, SubscriptionRow, AdminUserRow, LlmApiConfigRow } from '../types/database';
import type { UserDto, ChartProfileDto, BaziChartDto, ConversationItemDto, MessageDto, SubscriptionDto, AdminUserDto, LLMConfigDto } from '../types/dto';
/**
 * 字段映射器
 */
export declare class FieldMapper {
    static mapUser(row: UserRow): UserDto;
    static mapChartProfile(row: ChartProfileRow): ChartProfileDto;
    static mapBaziChart(row: BaziChartRow): BaziChartDto;
    static mapConversationItem(row: ConversationRow & {
        master_name: string;
    }): ConversationItemDto;
    static mapMessage(row: MessageRow): MessageDto;
    static mapUsers(rows: UserRow[]): UserDto[];
    static mapChartProfiles(rows: ChartProfileRow[]): ChartProfileDto[];
    static mapBaziCharts(rows: BaziChartRow[]): BaziChartDto[];
    static mapConversationItems(rows: (ConversationRow & {
        master_name: string;
    })[]): ConversationItemDto[];
    static mapMessages(rows: MessageRow[]): MessageDto[];
    static mapSubscription(row: SubscriptionRow): SubscriptionDto;
    static mapSubscriptions(rows: SubscriptionRow[]): SubscriptionDto[];
    static mapAdminUser(row: AdminUserRow): AdminUserDto;
    static mapLLMConfig(row: LlmApiConfigRow, decryptedKey?: string): LLMConfigDto;
}
//# sourceMappingURL=fieldMapper.d.ts.map