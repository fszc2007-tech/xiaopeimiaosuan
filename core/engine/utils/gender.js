// 新增理由：性别标准化工具，统一处理各种输入格式
// 回滚方式：删除此文件

/**
 * 标准化性别输入
 * 支持多种格式：中文、英文、数字、布尔值等
 * @param {string|number|boolean|null|undefined} input - 性别输入
 * @returns {'male'|'female'|'unknown'} 标准化后的性别
 */
export function normalizeGender(input) {
  if (input == null) return 'unknown';
  const s = String(input).trim().toLowerCase();

  // 中英 & 常见缩写 & 数值兜底
  if (['男', 'male', 'm', 'man', 'boy', '1', 'true'].includes(s)) return 'male';
  if (['女', 'female', 'f', 'woman', 'girl', '0', 'false'].includes(s)) return 'female';

  return 'unknown';
}

/**
 * 判断是否为男性
 * @param {string|number|boolean|null|undefined} input - 性别输入
 * @returns {boolean} 是否为男性
 */
export function isMale(input) {
  return normalizeGender(input) === 'male';
}

/**
 * 判断是否为女性
 * @param {string|number|boolean|null|undefined} input - 性别输入
 * @returns {boolean} 是否为女性
 */
export function isFemale(input) {
  return normalizeGender(input) === 'female';
}

