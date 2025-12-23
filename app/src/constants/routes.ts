/**
 * 路由常量定义
 * 
 * 命名规范：
 * - Screen Names（React Navigation）: PascalCase
 * - DeepLink/Web Paths: kebab-case
 */

export const SCREEN_NAMES = {
  // Auth Flow
  AUTH: 'Auth',
  
  // Main Tabs
  MAIN_TABS: 'MainTabs',
  CASES: 'Cases',
  XIAOPEI_HOME: 'XiaoPeiHome',
  ME: 'Me',
  
  // Full Screen Pages
  ONBOARDING: 'Onboarding',
  MANUAL_BAZI: 'ManualBazi',
  CHAT: 'Chat',
  CHART_DETAIL: 'ChartDetail',
  
  // Me Module - Second Level
  MY_CHARTS: 'MyCharts',
  CHAT_HISTORY: 'ChatHistory',
  READINGS: 'Readings',
  SETTINGS: 'Settings',
  THEME_SETTINGS: 'ThemeSettings',  // 新增：主題設置
  ABOUT_XIAOPEI: 'AboutXiaopei',
  FEEDBACK: 'Feedback',
  INVITE_FRIENDS: 'InviteFriends',
  
  // Pro Module
  PRO_SUBSCRIPTION: 'ProSubscription',
  PRO_MEMBER_CENTER: 'ProMemberCenter',
  
  // Account Module
  ACCOUNT_DELETION_PENDING: 'AccountDeletionPending',
} as const;

export const DEEP_LINK_PATHS = {
  AUTH: 'auth',
  ONBOARDING: 'onboarding',
  MANUAL_BAZI: 'manual-bazi',
  CHAT: 'chat',
  CHART_DETAIL: 'chart-detail',
  CASES: 'cases',
  XIAOPEI_HOME: 'xiaopei',
  ME: 'me',
  MY_CHARTS: 'my-charts',
  CHAT_HISTORY: 'chat-history',
  MY_READING: 'my-reading',
  SETTINGS: 'settings',
  THEME_SETTINGS: 'theme-settings',  // 新增：主題設置
  FEEDBACK: 'feedback',
  INVITE_FRIENDS: 'invite-friends',
  PRO_SUBSCRIBE: 'pro-subscribe',
} as const;

export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];
export type DeepLinkPath = typeof DEEP_LINK_PATHS[keyof typeof DEEP_LINK_PATHS];

