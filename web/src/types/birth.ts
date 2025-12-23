/**
 * 出生信息相關類型定義（H5 版）
 * 
 * ✅ 與 App 端完全一致
 */

export type CalendarType = 'solar' | 'lunar';

/**
 * 前端 ViewModel - 出生信息輸入
 */
export interface BirthInputVM {
  calendarType: CalendarType;           // 公曆 / 農曆
  year: number;                          // 年份
  month: number;                         // 1-12
  day: number;                           // 1-31
  hour: number;                          // 0-23
  minute: number;                        // 0-59
  timezoneOffsetMinutes: number;         // 時區偏移（分鐘），東八區 = 480
  timezoneLabel: string;                 // 時區標籤，如 "東八區（北京時間）"
  isDst: boolean;                        // 夏令時開關
}

/**
 * 默認出生信息值
 */
export const DEFAULT_BIRTH_INPUT: BirthInputVM = {
  calendarType: 'solar',
  year: 1990,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  timezoneOffsetMinutes: 480,            // 東八區
  timezoneLabel: '東八區（北京時間）',
  isDst: false,
};


