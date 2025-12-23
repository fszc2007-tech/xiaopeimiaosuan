/**
 * 会员状态工具函数
 * 
 * 统一管理会员状态判断逻辑，避免到处重复计算
 */

export type MembershipState =
  | 'non_pro'         // 未订阅
  | 'pro_active'      // 有效期内
  | 'pro_expiring'    // 距离到期 <= 7 天
  | 'pro_expired';    // 已过期

/**
 * 获取会员状态
 * 
 * @param isPro 是否为会员（支持 boolean 或 0/1）
 * @param proExpiresAt 会员到期时间（ISO 字符串）
 * @returns 会员状态枚举
 */
export function getMembershipState(
  isPro: boolean | number | null | undefined,
  proExpiresAt: string | null | undefined
): MembershipState {
  // 兼容后端返回的 0/1 数字类型
  const isProBool = Boolean(isPro);
  
  if (!isProBool || !proExpiresAt) {
    return 'non_pro';
  }
  
  const expiresAt = new Date(proExpiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 已过期
  if (expiresAt < today) {
    return 'pro_expired';
  }
  
  // 计算距离到期的天数
  const daysUntilExpiry = Math.ceil(
    (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // 即将到期（7 天内）
  if (daysUntilExpiry <= 7) {
    return 'pro_expiring';
  }
  
  // 有效期内
  return 'pro_active';
}

/**
 * 获取距离到期的天数
 * 
 * @param proExpiresAt 会员到期时间（ISO 字符串）
 * @returns 距离到期的天数，如果已过期或无效则返回 0
 */
export function getDaysUntilExpiry(proExpiresAt: string | null | undefined): number {
  if (!proExpiresAt) {
    return 0;
  }
  
  const expiresAt = new Date(proExpiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (expiresAt < today) {
    return 0;
  }
  
  return Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 格式化日期为 YYYY-MM-DD
 * 
 * @param dateString ISO 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return '';
  }
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 获取会员标签文案
 * 
 * @param plan 会员计划类型
 * @returns 会员标签文案
 */
export function getPlanLabel(plan: 'monthly' | 'quarterly' | 'yearly' | null): string {
  switch (plan) {
    case 'monthly':
      return '月付會員';
    case 'quarterly':
      return '季付會員';
    case 'yearly':
      return '年付會員';
    default:
      return '';
  }
}

/**
 * 获取价格文案
 * 
 * @param plan 会员计划类型
 * @returns 价格文案
 */
export function getPriceLabel(plan: 'monthly' | 'quarterly' | 'yearly'): string {
  switch (plan) {
    case 'monthly':
      return 'HK$ 39 / 月';
    case 'quarterly':
      return 'HK$ 99 / 季';
    case 'yearly':
      return 'HK$ 348 / 年';
    default:
      return '';
  }
}

