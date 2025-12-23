/**
 * 导航类型定义
 * 
 * 定义所有路由参数类型
 */

import { ChatEntrySource, TopicKey } from './chat';

export type RootStackParamList = {
  // Auth & Onboarding
  Auth: undefined;
  PolicyViewer: {
    type: 'privacy' | 'agreement' | 'pics';
  };
  Onboarding: undefined;
  
  // Main Tabs
  MainTabs: {
    screen?: 'Cases' | 'XiaoPeiHome' | 'Me';
    params?: any;
  };
  
  // Full Screen Pages
  ManualBazi: {
    from: 'tab' | 'cases' | 'account' | 'onboarding';
    initialData?: Partial<{
      name: string;
      gender: 'male' | 'female';
      birthday: string;
      birthTime: string;
    }>;
  };
  
  ChatInput: {
    from: 'onboarding';
  };
  
  Chat: {
    conversationId?: string | null;
    topic?: TopicKey | null;
    question?: string;
    source?: ChatEntrySource;
    masterId?: string;
    chartId?: string; // 兼容参数（从聊天记录页面传入时使用，实际是 masterId）
    sectionKey?: string;
    shenShaCode?: string;
    pillarType?: 'year' | 'month' | 'day' | 'hour';
  };
  
  ChartDetail: {
    chartId: string;
    masterId: string;
    initialTab?: 'basic' | 'overview' | 'fortune';
  };
  
  // My Pages
  MyCharts: undefined;
  ChatHistory: undefined;
  Readings: undefined;
  
  // Pro & Settings
  ProSubscription: undefined;
  ProMemberCenter: undefined;
  Settings: undefined;
  ThemeSettings: undefined;  // 新增：主題設置
  AboutXiaopei: undefined;
  Feedback: undefined;
  ContactSupport: undefined;
  InviteFriends: undefined;
  About: undefined;
  
  // Account
  AccountDeletionPending: undefined;
};

export type MainTabsParamList = {
  Cases: undefined;
  XiaoPeiHome: undefined;
  Me: undefined;
};

