// 新增理由：时区处理工具
// 回滚方式：回退此文件

/**
 * 解析灵活的时区格式
 * 支持：+08:00, +8, +0800, UTC+8, GMT+0800
 */
export function parseTZFlexible(tzstr) {
  if (!tzstr) return 8 * 60; // 默认 +08:00
  
  const s = tzstr.trim().toUpperCase().replace(/\s+/g, "");
  const cleaned = s.replace(/^UTC|^GMT/, "");
  
  let m;
  
  // 格式：+08:00 或 -05:30
  m = /^([+-])(\d{1,2}):?(\d{2})$/.exec(cleaned);
  if (m) {
    const sign = m[1] === "+" ? 1 : -1;
    return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
  }
  
  // 格式：+8 或 -5
  m = /^([+-])(\d{1,2})$/.exec(cleaned);
  if (m) {
    const sign = m[1] === "+" ? 1 : -1;
    return sign * (parseInt(m[2], 10) * 60);
  }
  
  // 格式：+0800 或 -0530
  m = /^([+-]?)(\d{2})(\d{2})$/.exec(cleaned);
  if (m) {
    const sign = (m[1] || "+") === "+" ? 1 : -1;
    return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
  }
  
  // 格式：8（默认为正）
  m = /^(\d{1,2})$/.exec(cleaned);
  if (m) {
    return parseInt(m[1], 10) * 60;
  }
  
  throw new Error("时区格式无效。建议 +08:00、+8、+0800、UTC+8、GMT+0800。");
}

/**
 * 格式化时区为 +HH:MM 格式
 */
export function formatTZ(mins) {
  const sign = mins >= 0 ? "+" : "-";
  const m = Math.abs(mins);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

/**
 * 计算两个UTC日期之间的天数差
 */
export function daysBetweenUTC(y1, m1, d1, y2, m2, d2) {
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((b - a) / 86400000);
}
