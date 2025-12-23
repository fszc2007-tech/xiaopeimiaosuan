/**
 * 第三方登录服务
 *
 * 功能：
 * - Google / Apple ID Token 验证
 * - 用户查找/创建（使用 auth_identities 表）
 * - 事务化和幂等化
 * - 日志与隐私保护
 *
 * 参考文档：Google一键登录设计方案-v1.1-可执行版.md
 */
import type { ThirdPartyLoginResponseDto } from '../../types/dto';
/**
 * Google 登录
 *
 * P0 事务化与幂等化要点：
 * - DB 事务：BEGIN → 插入 user → 插入 identity → COMMIT
 * - 幂等锚点：以 UNIQUE(provider, provider_user_id) 为幂等锚点
 * - 并发处理（P0 修正）：如果唯一键冲突，必须 rollback 整个事务，然后在事务外重新查询并返回已有用户（避免产生孤儿用户）
 * - first_login 判断：基于"identity 是否首次创建"，不要基于 user 是否存在（更准确）
 * - 更新策略：更新 identity 信息时，不要把已有字段更新成 null（例如 Google 本次没返回 picture，就不要覆盖掉历史头像）
 */
export declare function googleLogin(params: {
    idToken: string;
    app_region: 'CN' | 'HK';
}): Promise<ThirdPartyLoginResponseDto>;
//# sourceMappingURL=thirdPartyAuthService.d.ts.map