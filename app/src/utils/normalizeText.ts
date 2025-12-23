/**
 * 简繁统一转换工具
 * 
 * 核心原则：只处理系统产生的文本，坚决不碰用户输入
 * 
 * 使用场景：
 * - LLM 输出（助手消息）
 * - 后端生成的字段（标签、状态、卡片内容等）
 * - 系统提示信息
 * 
 * ⚠️ 禁止使用场景：
 * - 用户输入（userInput / query / keyword 等）
 * - 用户生成的内容（UGC）
 */

import { Converter } from 'opencc-js';
import { toTraditional } from './shishenMapping';

// ⚠️ 重要：Converter 在模块顶层创建一次，不要每次调用都 new
const s2hk = Converter({ from: 'cn', to: 'hk' });

/**
 * 命理術語 / 專業用字映射修正
 * 
 * V1：完全復用現有的 toTraditional 邏輯
 * V2：擴展處理文本中的術語（不僅僅是完整匹配）
 * 
 * @param text 已經過 opencc 轉換的文本
 * @returns 經過領域映射修正的文本
 */
function applyDomainMapping(text: string): string {
  // 第一步：處理完整匹配的術語（復用現有的 toTraditional 邏輯）
  // 它已經處理了十神、格局、破格因素、救應因素等完整映射表
  let result = toTraditional(text);
  
  // 第二步：處理文本中可能出現的術語組合（擴展映射）
  // 這些是 opencc 可能轉換不準確的命理專業術語
  const extendedMappings: Record<string, string> = {
    // 命理基礎概念
    '命盘': '命盤',
    '命盤': '命盤', // 確保已經是繁體
    '流年': '流年',
    '大运': '大運',
    '大運': '大運',
    '流月': '流月',
    '流日': '流日',
    
    // 常用組合詞
    '命盘分析': '命盤分析',
    '命盤分析': '命盤分析',
    '流年分析': '流年分析',
    '大运分析': '大運分析',
    '大運分析': '大運分析',
    
    // 其他可能出現的術語
    '日主': '日主',
    '用神': '用神',
    '忌神': '忌神',
    '喜神': '喜神',
    '格局': '格局',
    '神煞': '神煞',
    '四柱': '四柱',
    '八字': '八字',
    '干支': '干支',
    '天干': '天干',
    '地支': '地支',
    '藏干': '藏干',
    '納音': '納音',
    '空亡': '空亡',
    '自坐': '自坐',
    '星運': '星運',
  };
  
  // 按順序替換（優先處理長詞，避免短詞誤替換）
  const sortedKeys = Object.keys(extendedMappings).sort((a, b) => b.length - a.length);
  for (const simplified of sortedKeys) {
    const traditional = extendedMappings[simplified];
    if (result.includes(simplified)) {
      result = result.replace(new RegExp(simplified.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), traditional);
    }
  }
  
  return result;
}

/**
 * 将系统产生的文本统一转换为繁体中文（香港用字风格）
 * 
 * ⚠️ 重要约束：
 * - 只能用于「系统文本」（LLM 输出、后端生成字段、系统提示等）
 * - 禁止在任何与用户输入有关的地方调用
 * - 凡是函数参数名包含 user/input/query/keyword 等字样的，默认视为用户输入，不得传入
 * 
 * @param text 系统产生的文本（可能是简体或繁体）
 * @returns 繁体中文（香港风格）
 * 
 * @example
 * // ✅ 正确：转换 LLM 输出
 * const assistantText = normalizeToZhHK(llmResponse.content);
 * 
 * // ✅ 正确：转换后端标签
 * const tag = normalizeToZhHK(backendTag);
 * 
 * // ❌ 错误：转换用户输入
 * const userInput = '用户输入的内容';
 * const wrong = normalizeToZhHK(userInput); // 禁止！
 */
export function normalizeToZhHK(text: string): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }
  
  // 第一步：简→繁（香港用字）
  const traditional = s2hk(text);
  
  // 第二步：命理术语/专业用字修正
  const normalized = applyDomainMapping(traditional);
  
  return normalized;
}

