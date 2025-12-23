/**
 * 神煞解读数据转换脚本
 * 
 * 将用户提供的数据转换为 SQL INSERT 语句
 * 
 * 使用方法：
 * 1. 将用户提供的数据整理成 JSON 格式
 * 2. 运行此脚本生成 SQL 文件
 */

// 使用 require 导入 engine 目录的 JavaScript 模块
const { SHENSHA_METADATA, getMetadataByName } = require('../engine/shensha/metadata.js');
import { v4 as uuidv4 } from 'uuid';

// 用户提供的数据结构
interface UserShenshaData {
  神煞名称: string;
  核心含义: string;
  年柱: string;
  月柱: string;
  日柱: string;
  时柱: string;
  备注: string;
}

// 神煞类型映射（需要根据实际情况补充）
const SHENSHA_TYPE_MAP: Record<string, 'auspicious' | 'inauspicious' | 'neutral'> = {
  '天乙贵人': 'auspicious',
  '文昌贵人': 'auspicious',
  '太极贵人': 'auspicious',
  '月德贵人': 'auspicious',
  '天德贵人': 'auspicious',
  '红鸾': 'neutral',
  '天喜': 'auspicious',
  '桃花（咸池）': 'neutral',
  '驿马': 'neutral',
  '将星': 'auspicious',
  '华盖': 'neutral',
  '孤辰': 'inauspicious',
  '寡宿': 'inauspicious',
  '亡神': 'inauspicious',
  '丧门': 'inauspicious',
  '吊客': 'inauspicious',
  '披麻': 'inauspicious',
  '建禄': 'neutral',
  '专禄（归禄）': 'auspicious',
  '年空亡': 'inauspicious',
  '月空亡': 'inauspicious',
  '日空亡': 'inauspicious',
  '国印贵人': 'auspicious',
  '天厨贵人': 'auspicious',
  '词馆': 'auspicious',
  '八专': 'neutral',
};

// 徽标文本映射
const BADGE_TEXT_MAP: Record<string, string> = {
  '天乙贵人': '吉神',
  '文昌贵人': '吉神',
  '太极贵人': '吉神',
  '月德贵人': '吉神',
  '天德贵人': '吉神',
  '红鸾': '桃花',
  '天喜': '吉神',
  '桃花（咸池）': '桃花',
  '驿马': '中性',
  '将星': '吉神',
  '华盖': '中性',
  '孤辰': '帶挑戰',
  '寡宿': '帶挑戰',
  '亡神': '帶挑戰',
  '丧门': '帶挑戰',
  '吊客': '帶挑戰',
  '披麻': '帶挑戰',
  '建禄': '中性',
  '专禄（归禄）': '吉神',
  '年空亡': '帶挑戰',
  '月空亡': '帶挑戰',
  '日空亡': '帶挑戰',
  '国印贵人': '吉神',
  '天厨贵人': '吉神',
  '词馆': '吉神',
  '八专': '中性',
};

/**
 * 去掉括号及括号内容
 */
function removeParentheses(text: string): string {
  if (!text) return '';
  // 匹配中文括号和英文括号
  return text.replace(/（[^）]*）|\([^)]*\)/g, '').trim();
}

/**
 * 根据中文名称获取神煞代码
 */
function getShenshaCode(chineseName: string): string | null {
  // 去掉括号
  const cleanName = removeParentheses(chineseName);
  
  // 先尝试直接匹配
  let metadata = getMetadataByName(cleanName);
  
  // 如果没找到，尝试去掉括号后的名称
  if (!metadata) {
    metadata = getMetadataByName(chineseName);
  }
  
  // 特殊处理：亡神
  if (cleanName === '亡神' && !metadata) {
    metadata = getMetadataByName('亡神');
  }
  
  return metadata?.id || null;
}

/**
 * 从柱位解读文本中提取短标题（第一句话，控制在 30 字以内）
 */
function extractShortTitle(text: string): string {
  if (!text || text.trim() === '' || text.includes('只有一个解读')) {
    return '';
  }
  // 取第一句话（以句号、逗号、分号分隔）
  let firstSentence = text.split(/[。，；]/)[0].trim();
  
  // 如果超过 30 字，截取前 30 字
  if (firstSentence.length > 30) {
    firstSentence = firstSentence.substring(0, 30);
    // 如果截取后最后一个字符不是标点，尝试在合适的位置截断
    const lastChar = firstSentence[firstSentence.length - 1];
    if (!/[，。、]/.test(lastChar)) {
      // 找最后一个逗号或顿号
      const lastComma = firstSentence.lastIndexOf('，');
      const lastPause = firstSentence.lastIndexOf('、');
      const cutPoint = Math.max(lastComma, lastPause);
      if (cutPoint > 20) {
        firstSentence = firstSentence.substring(0, cutPoint + 1);
      }
    }
  }
  
  return firstSentence || text.substring(0, 30);
}

/**
 * 从柱位解读文本中提取要点（3-4条，每条控制在 30 字以内）
 */
function extractBulletPoints(text: string): string[] {
  if (!text || text.trim() === '' || text.includes('只有一个解读')) {
    return [];
  }
  
  // 按句号、分号分割
  let sentences = text.split(/[。；]/).filter(s => s.trim().length > 0);
  
  // 如果句子数 <= 4，直接返回（但需要控制长度）
  if (sentences.length <= 4) {
    return sentences
      .map(s => {
        let trimmed = s.trim();
        // 如果超过 30 字，截取前 30 字
        if (trimmed.length > 30) {
          trimmed = trimmed.substring(0, 30);
          // 尝试在合适的位置截断
          const lastComma = trimmed.lastIndexOf('，');
          if (lastComma > 20) {
            trimmed = trimmed.substring(0, lastComma + 1);
          }
        }
        return trimmed;
      })
      .filter(s => s.length > 0);
  }
  
  // 如果句子数 > 4，取前4条
  return sentences
    .slice(0, 4)
    .map(s => {
      let trimmed = s.trim();
      if (trimmed.length > 30) {
        trimmed = trimmed.substring(0, 30);
        const lastComma = trimmed.lastIndexOf('，');
        if (lastComma > 20) {
          trimmed = trimmed.substring(0, lastComma + 1);
        }
      }
      return trimmed;
    })
    .filter(s => s.length > 0);
}

/**
 * 生成推荐提问（简单模板，不需要太详细）
 */
function generateRecommendedQuestions(shenshaName: string, pillarType: string): string[] {
  const pillarLabels: Record<string, string> = {
    'year': '年柱',
    'month': '月柱',
    'day': '日柱',
    'hour': '时柱',
  };
  
  const pillarLabel = pillarLabels[pillarType] || '';
  
  // 生成简洁的推荐提问（引导用户去聊天页面详细询问）
  return [
    `${shenshaName}對我的影響是什麼？`,
    `${pillarLabel}的${shenshaName}會如何影響我？`,
    `我該如何善用${shenshaName}？`,
    `${shenshaName}需要注意什麼？`,
  ];
}

/**
 * 转义 SQL 字符串
 */
function escapeSqlString(str: string | null | undefined): string {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * 转义 JSON 数组
 */
function escapeJsonArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return 'NULL';
  // 先 JSON.stringify，然后转义单引号（用于 SQL），最后转义反斜杠
  const jsonStr = JSON.stringify(arr);
  return `'${jsonStr.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

/**
 * 转换单条数据
 */
function convertShenshaData(data: UserShenshaData): string[] {
  const sqlStatements: string[] = [];
  
  // 获取神煞代码
  const shenshaCode = getShenshaCode(data.神煞名称);
  if (!shenshaCode) {
    console.warn(`⚠️  无法找到神煞代码：${data.神煞名称}`);
    return [];
  }
  
  // 获取神煞类型和徽标
  const type = SHENSHA_TYPE_MAP[data.神煞名称] || 'neutral';
  const badgeText = BADGE_TEXT_MAP[data.神煞名称] || '中性';
  
  // 处理四个柱位
  const pillars = [
    { type: 'year' as const, label: '年柱', text: data.年柱 },
    { type: 'month' as const, label: '月柱', text: data.月柱 },
    { type: 'day' as const, label: '日柱', text: data.日柱 },
    { type: 'hour' as const, label: '时柱', text: data.时柱 },
  ];
  
  for (const pillar of pillars) {
    // 跳过无效的柱位解读
    if (!pillar.text || pillar.text.trim() === '' || pillar.text.includes('只有一个解读')) {
      continue;
    }
    
    const readingId = uuidv4();
    const shortTitle = extractShortTitle(pillar.text);
    const bulletPoints = extractBulletPoints(pillar.text);
    const recommendedQuestions = generateRecommendedQuestions(data.神煞名称, pillar.type);
    
    const sql = `INSERT INTO shensha_readings (
  reading_id,
  shensha_code,
  pillar_type,
  name,
  badge_text,
  type,
  short_title,
  summary,
  bullet_points,
  for_this_position,
  recommended_questions,
  is_active,
  sort_order
) VALUES (
  ${escapeSqlString(readingId)},
  ${escapeSqlString(shenshaCode)},
  ${escapeSqlString(pillar.type)},
  ${escapeSqlString(data.神煞名称)},
  ${escapeSqlString(badgeText)},
  ${escapeSqlString(type)},
  ${escapeSqlString(shortTitle)},
  ${escapeSqlString(data.核心含义)},
  ${escapeJsonArray(bulletPoints)},
  ${escapeSqlString(pillar.text)},
  ${escapeJsonArray(recommendedQuestions)},
  TRUE,
  0
);`;
    
    sqlStatements.push(sql);
  }
  
  return sqlStatements;
}

/**
 * 主函数：转换所有数据
 */
export function convertAllData(userData: UserShenshaData[]): string {
  const allSql: string[] = [];
  
  allSql.push('-- 神煞解读内容数据导入');
  allSql.push('-- 生成时间：' + new Date().toISOString());
  allSql.push('');
  allSql.push('-- 开始事务');
  allSql.push('START TRANSACTION;');
  allSql.push('');
  
  for (const data of userData) {
    const sqls = convertShenshaData(data);
    allSql.push(...sqls);
    allSql.push('');
  }
  
  allSql.push('-- 提交事务');
  allSql.push('COMMIT;');
  allSql.push('');
  allSql.push('-- 验证数据');
  allSql.push('SELECT COUNT(*) as total FROM shensha_readings;');
  
  return allSql.join('\n');
}

// 如果直接运行此脚本
// 注意：此脚本需要通过 generate-shensha-sql.ts 调用，不直接运行

