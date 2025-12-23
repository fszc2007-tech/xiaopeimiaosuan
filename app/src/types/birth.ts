/**
 * 出生信息相关类型定义
 * 
 * 用于手动排盘页面的出生信息输入
 */

export type CalendarType = 'solar' | 'lunar';

/**
 * 前端 ViewModel - 出生信息输入
 */
export interface BirthInputVM {
  calendarType: CalendarType | null;    // 公历 / 农历（可为空，不设默认值）
  year: number;                          // 年份
  month: number;                         // 1-12
  day: number;                           // 1-31
  hour: number;                          // 0-23
  minute: number;                        // 0-59
  timezoneOffsetMinutes: number;         // 时区偏移（分钟），东八区 = 480
  timezoneLabel: string;                 // 时区标签，如 "东八区（北京时间）"
  isDst: boolean;                        // 夏令时开关
}

/**
 * 默认出生信息值
 */
export const DEFAULT_BIRTH_INPUT: BirthInputVM = {
  calendarType: null,                   // 不设默认值，用户需手动选择
  year: 1990,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  timezoneOffsetMinutes: 480,            // 东八区
  timezoneLabel: '东八区（北京时间）',
  isDst: false,
};

/**
 * 农历月份信息（用于闰月处理）
 */
export interface LunarMonthInfo {
  month: number;                          // 月份（1-12）
  isLeap: boolean;                       // 是否为闰月
  label: string;                          // 显示标签，如 "正月"、"闰二月"
}





