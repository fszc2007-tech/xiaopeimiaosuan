/**
 * 命盤狀態管理（H5 版）
 * 
 * ✅ 與 App 端邏輯一致
 */

import { create } from 'zustand';
import type { ChartProfile } from '@/types/chart';

interface ChartState {
  // ===== State =====
  charts: ChartProfile[];
  currentChartId: string | null;
  
  // ===== Actions =====
  setCharts: (charts: ChartProfile[]) => void;
  setCurrentChartId: (chartId: string | null) => void;
  clearCharts: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  charts: [],
  currentChartId: null,
  
  setCharts: (charts) => {
    set({ charts });
  },
  
  setCurrentChartId: (chartId) => {
    set({ currentChartId: chartId });
  },
  
  clearCharts: () => {
    set({ charts: [], currentChartId: null });
  },
}));


