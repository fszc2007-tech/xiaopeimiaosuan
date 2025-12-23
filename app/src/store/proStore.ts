/**
 * Pro 状态管理
 * 
 * 职责：
 * - Pro 用户状态
 * - 订阅计划信息
 * - 功能权限管理
 * - AI 使用次数状态管理
 * 
 * 遵循规范：
 * - Store 命名：useProStore
 * - Action 命名：set/fetch/check/reset
 * - 持久化：是
 * 
 * 参考文档：AI使用次数前端拦截方案-最终实施规格.md v1.1
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { proService } from '@/services/api/proService';

// ===== AI 使用状态接口（规则 1：命名必须统一）=====
interface AiUsageStatus {
  aiCallsToday: number;        // 今天已使用次数
  aiDailyLimit: number | null; // 当日总额度；Pro 可以为 null 或非常大
  aiRemaining: number;         // 剩余次数（已帮前端算好）
  resetAt?: string | null;     // 可选：本次统计重置时间（用于展示，不参与逻辑判断）
  lastFetchedAt: number;       // timestamp：最后获取时间（用于节流）
}

interface ProState {
  // ===== 已有字段 =====
  isPro: boolean;
  plan: 'yearly' | 'monthly' | 'lifetime' | null;
  expiresAt: string | null; // ISO 8601
  features: string[];
  
  // ===== 新增 AI 使用状态字段 =====
  aiUsageStatus: AiUsageStatus | null;
  isAiUsageLoading: boolean;
  
  // ===== 已有方法 =====
  // 设置 Pro 状态
  setProStatus: (isPro: boolean, plan?: 'yearly' | 'monthly' | 'lifetime', expiresAt?: string) => void;
  
  // 刷新 Pro 状态（从服务器）
  refreshProStatus: () => Promise<void>;
  
  // 检查功能权限
  hasFeature: (feature: string) => boolean;
  
  // 检查是否过期
  isExpired: () => boolean;
  
  // 重置状态
  reset: () => void;
  
  // ===== 新增 AI 使用次数方法 =====
  // 获取 AI 使用状态（含节流和状态同步）
  fetchAiUsageStatus: (options?: { force?: boolean }) => Promise<void>;
  
  // 本地减 1（发送成功后调用）
  consumeAiUsageLocally: () => void;
  
  // 清空 AI 状态（登出/开通 Pro 时调用）
  resetAiUsage: () => void;
}

const initialState = {
  isPro: false,
  plan: null,
  expiresAt: null,
  features: [],
  aiUsageStatus: null,
  isAiUsageLoading: false,
};

export const useProStore = create<ProState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setProStatus: (isPro, plan, expiresAt) => set({
        isPro,
        plan: plan || null,
        expiresAt: expiresAt || null,
      }),
      
      refreshProStatus: async () => {
        // 直接复用 fetchAiUsageStatus（它会同时更新会员状态和 AI 状态）
        await get().fetchAiUsageStatus({ force: true });
      },
      
      hasFeature: (feature) => {
        const state = get();
        return state.isPro && state.features.includes(feature);
      },
      
      isExpired: () => {
        const state = get();
        if (state.plan === 'lifetime') return false;
        if (!state.expiresAt) return true;
        return new Date() > new Date(state.expiresAt);
      },
      
      reset: () => set(initialState),
      
      // ===== AI 使用次数方法实现 =====
      
      /**
       * 获取 AI 使用状态
       * 
       * 规则 3：调用时机
       * - ChatScreen 首次进入/得到焦点时调用（非 Pro 用户）
       * - 后端返回 AI_DAILY_LIMIT_REACHED 时强制刷新（force: true）
       * 
       * 规则 3.3：isPro 同步
       * - 同时更新会员状态（isPro, plan, expiresAt, features）
       * - 同时更新 AI 使用状态（aiUsageStatus）
       * 
       * @param options.force 是否强制刷新（忽略节流）
       */
      fetchAiUsageStatus: async (options?: { force?: boolean }) => {
        const state = get();
        const now = Date.now();
        
        // 节流：30 秒内不重复请求（除非 force）
        if (!options?.force && state.aiUsageStatus?.lastFetchedAt) {
          const elapsed = now - state.aiUsageStatus.lastFetchedAt;
          if (elapsed < 30 * 1000) {
            console.log('[proStore] fetchAiUsageStatus: throttled (30s)');
            return; // 节流，直接返回
          }
        }
        
        try {
          set({ isAiUsageLoading: true });
          
          // 调用 API 获取最新状态
          const status = await proService.getStatus();
          
          // 规则 3.3：同时更新会员状态和 AI 使用状态
          set({
            // 更新会员状态
            isPro: status.isPro,
            plan: status.proPlan,
            expiresAt: status.proExpiresAt,
            features: status.features,
            
            // 更新 AI 使用状态
            aiUsageStatus: {
              aiCallsToday: status.aiCallsToday,
              aiDailyLimit: status.aiDailyLimit,
              aiRemaining: status.aiRemaining,
              lastFetchedAt: now,
            },
            isAiUsageLoading: false,
          });
          
          console.log('[proStore] fetchAiUsageStatus: success', {
            isPro: status.isPro,
            aiRemaining: status.aiRemaining,
            aiDailyLimit: status.aiDailyLimit,
          });
        } catch (error) {
          // 规则 2：静默失败，不阻止用户使用
          console.warn('[proStore] fetchAiUsageStatus: failed (silent)', error);
          set({ isAiUsageLoading: false });
          // 不抛出错误，允许继续使用（后端兜底）
        }
      },
      
      /**
       * 本地减 1（发送成功后调用）
       * 
       * 规则 5.4：本地状态同步的 Trade-off
       * - 只要接口返回 2xx 并开始输出，就视为已计入当天使用次数
       * - 本地状态仅作为 UI 参考，不作为安全逻辑依据
       */
      consumeAiUsageLocally: () => {
        const state = get();
        
        if (!state.aiUsageStatus) {
          console.warn('[proStore] consumeAiUsageLocally: no aiUsageStatus');
          return;
        }
        
        set({
          aiUsageStatus: {
            ...state.aiUsageStatus,
            aiCallsToday: state.aiUsageStatus.aiCallsToday + 1,
            aiRemaining: Math.max(0, state.aiUsageStatus.aiRemaining - 1),
          },
        });
        
        console.log('[proStore] consumeAiUsageLocally: updated', {
          aiCallsToday: state.aiUsageStatus.aiCallsToday + 1,
          aiRemaining: Math.max(0, state.aiUsageStatus.aiRemaining - 1),
        });
      },
      
      /**
       * 清空 AI 状态（登出/开通 Pro 时调用）
       * 
       * 规则 4：Pro 开通/登出行为
       * - 登出时必须调用
       * - 开通 Pro 成功后必须调用
       */
      resetAiUsage: () => {
        set({
          aiUsageStatus: null,
          isAiUsageLoading: false,
        });
        console.log('[proStore] resetAiUsage: cleared');
      },
    }),
    {
      name: 'xiaopei-pro-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

