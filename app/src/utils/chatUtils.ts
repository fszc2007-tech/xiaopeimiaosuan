/**
 * 聊天相关工具函数
 */

/**
 * 检查追问建议是否有效
 * 统一处理空数组和 undefined，确保全项目一致使用
 * 
 * @param followUps 追问建议数组
 * @returns 是否有有效的追问建议
 */
export function hasValidFollowUps(followUps: string[] | undefined): boolean {
  return !!(followUps && followUps.length > 0);
}

