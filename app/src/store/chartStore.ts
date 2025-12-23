/**
 * 命盘状态管理
 * 
 * 单一真相源：只存储 currentChartId，currentChart 通过计算属性获取
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChartProfile, BaziResult } from '../types';

interface ChartState {
  // 状态
  charts: ChartProfile[];
  currentChart: ChartProfile | null;  // 保留用于向后兼容，但建议通过计算属性获取
  currentChartId: string | null;  // 单一真相源：用于小佩场景分析
  currentBaziResult: BaziResult | null;
  
  // 操作
  setCharts: (charts: ChartProfile[]) => void;
  addChart: (chart: ChartProfile) => void;
  updateChart: (chartId: string, updates: Partial<ChartProfile>) => void;
  deleteChart: (chartId: string) => void;
  setCurrentChart: (chart: ChartProfile) => void;
  setCurrentChartId: (chartId: string | null) => void;  // 新增：设置当前命盘 ID
  setCurrentBaziResult: (result: BaziResult) => void;
  clearCurrentChart: () => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set, get) => ({
      // 初始状态
      charts: [],
      currentChart: null,
      currentChartId: null,  // 单一真相源
      currentBaziResult: null,
      
      // 设置命盘列表（自动校验并恢复 currentChartId）
      setCharts: (charts) => {
        const state = get();
        let newCurrentChartId = state.currentChartId;
        
        // 如果 localStorage 中的 currentChartId 不在命盘列表中：
        if (newCurrentChartId && !charts.find(c => c.chartProfileId === newCurrentChartId)) {
          if (charts.length > 0) {
            // 使用第一个命盘（或按最近查看排序后的第一个）
            const sortedByRecent = [...charts].sort((a, b) => {
              const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return timeB - timeA; // 降序，最新的在前
            });
            newCurrentChartId = sortedByRecent[0]?.chartProfileId || charts[0]?.chartProfileId || null;
          } else {
            // 若命盘列表为空，则置为 null，进入「无命盘」状态
            newCurrentChartId = null;
          }
        }
        
        // 同步更新 currentChart
        const newCurrentChart = newCurrentChartId 
          ? charts.find(c => c.chartProfileId === newCurrentChartId) ?? null
          : null;
        
        set({ 
          charts,
          currentChartId: newCurrentChartId,
          currentChart: newCurrentChart,
        });
      },
      
      // 添加命盘
      addChart: (chart) => set((state) => ({
        charts: [chart, ...state.charts],
      })),
      
      // 更新命盘
      updateChart: (chartId, updates) => set((state) => ({
        charts: state.charts.map((chart) =>
          chart.chartProfileId === chartId ? { ...chart, ...updates } : chart
        ),
      })),
      
      // 删除命盘（优化：如果删除的是当前命盘，自动切换或置为 null）
      deleteChart: (chartId) => set((state) => {
        const newCharts = state.charts.filter((chart) => chart.chartProfileId !== chartId);
        let newCurrentChartId = state.currentChartId;
        
        // 如果删除的是当前命盘
        if (state.currentChartId === chartId) {
          if (newCharts.length > 0) {
            // 若命盘列表非空，则使用列表第一项的 id
            newCurrentChartId = newCharts[0].chartProfileId;
          } else {
            // 若命盘列表为空，则置为 null
            newCurrentChartId = null;
          }
        }
        
        return {
          charts: newCharts,
          currentChartId: newCurrentChartId,
          currentChart: newCurrentChartId 
            ? newCharts.find(c => c.chartProfileId === newCurrentChartId) ?? null
            : null,
        };
      }),
      
      // 设置当前命盘（保留用于向后兼容）
      setCurrentChart: (chart) => set({ 
        currentChart: chart,
        currentChartId: chart.chartProfileId,  // 同步更新 currentChartId
      }),
      
      // 设置当前命盘 ID（单一真相源）
      setCurrentChartId: (chartId) => {
        const state = get();
        const chart = chartId ? state.charts.find(c => c.chartProfileId === chartId) : null;
        set({ 
          currentChartId: chartId,
          currentChart: chart ?? null,  // 同步更新 currentChart（向后兼容）
        });
      },
      
      // 设置当前八字结果
      setCurrentBaziResult: (result) => set({ currentBaziResult: result }),
      
      // 清除当前命盘
      clearCurrentChart: () => set({ 
        currentChart: null,
        currentChartId: null,
        currentBaziResult: null,
      }),
    }),
    {
      name: 'xiaopei-chart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化 currentChartId（单一真相源）
      partialize: (state) => ({
        currentChartId: state.currentChartId,
        // 不持久化 charts，从服务器获取
        // 不持久化 currentChart，通过计算属性获取
      }),
    }
  )
);

