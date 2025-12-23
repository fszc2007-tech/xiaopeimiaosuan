/**
 * 导航类型定义
 * 
 * 定义所有路由的参数类型
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { TopicKey, ChatEntrySource } from '../types';

// 主堆栈参数列表
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
  ManualBazi: { from?: 'account' | 'onboarding' };
  Chat: {
    conversationId?: string;
    masterId?: string;
    masterName?: string;
    topic?: TopicKey | null;
    question: string;
    source: ChatEntrySource;
  };
  ChartDetail: {
    chartId: string;
    initialTab?: 'basic' | 'overview' | 'fortune';
  };
  
  // Me 模块二级页面
  MyCharts: undefined;
  ChatHistory: undefined;
  MyReading: undefined;
  Settings: undefined;
  Feedback: undefined;
  InviteFriends: undefined;
  
  // Pro 模块
  ProSubscribe: undefined;
  ProMemberCenter: undefined;
};

// 底部导航参数列表
export type MainTabParamList = {
  Cases: undefined;
  XiaoPeiHome: undefined;
  Me: undefined;
};

// 命盘详情 Tab 参数列表
export type ChartDetailTabParamList = {
  BasicInfo: { chartId: string };
  Overview: { chartId: string };
  Fortune: { chartId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

