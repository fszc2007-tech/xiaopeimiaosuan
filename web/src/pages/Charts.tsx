/**
 * 命盤列表頁面（H5 版 - 完整版）
 * 
 * ✅ 繁體中文
 * ✅ 與 App 端 UI 保持一致
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chartService } from '@/services/api/chartService';
import { useAuthStore, useChartStore } from '@/store';
import type { ChartProfile, RelationType, SortByType } from '@/types/chart';
import { RELATION_TYPE_LABELS } from '@/types/chart';
import './Charts.css';

export const ChartsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { charts, setCharts, currentChartId, setCurrentChartId } = useChartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // 篩選狀態
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<RelationType[]>([]);
  const [sortBy, setSortBy] = useState<SortByType>('recent');
  
  // 獲取命盤列表
  const fetchCharts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');
      
      const data = await chartService.getCharts({
        search: searchQuery || undefined,
        relationType: selectedTypes.length > 0 ? selectedTypes : undefined,
        sortBy,
        limit: 100,
      });
      
      setCharts(data.profiles || []);
      
      // 如果沒有選擇當前命盤，自動選擇第一個
      if (!currentChartId && data.profiles.length > 0) {
        setCurrentChartId(data.profiles[0].chartProfileId);
      }
    } catch (err: any) {
      console.error('獲取命盤列表失敗:', err);
      setError(err.message || '獲取命盤列表失敗');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // 初始加載
  useEffect(() => {
    fetchCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTypes, sortBy]);
  
  // 處理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // 處理命盤點擊
  const handleChartClick = (chartId: string) => {
    navigate(`/chart/${chartId}`);
  };
  
  // 設置為當前命主
  const handleSetCurrent = (chartId: string) => {
    setCurrentChartId(chartId);
  };
  
  // 當前命主
  const currentChart = charts.find(c => c.chartProfileId === currentChartId);
  
  // 渲染空狀態
  if (!isLoading && charts.length === 0 && !searchQuery && selectedTypes.length === 0) {
    return (
      <div className="charts-page">
        <div className="charts-header">
          <h1>命盤檔案</h1>
          <button className="logout-button" onClick={handleLogout}>
            登出
          </button>
        </div>
        
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h2>還沒有命盤檔案</h2>
          <p>創建第一個命盤，開始您的命理探索之旅</p>
          <button className="primary-button" onClick={() => navigate('/create-chart')}>
            創建命盤
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="charts-page">
      {/* 頭部 */}
      <div className="charts-header">
        <div className="header-left">
          <h1>命盤檔案</h1>
          <span className="chart-count">{charts.length} 個</span>
        </div>
        <div className="header-right">
          <button className="icon-button" onClick={() => navigate('/me')}>
            👤
          </button>
          <button className="logout-button" onClick={handleLogout}>
            登出
          </button>
        </div>
      </div>
      
      {/* 搜索和篩選 */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className={`filter-button ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          篩選 {(selectedTypes.length > 0 || sortBy !== 'recent') && '●'}
        </button>
      </div>
      
      {/* 篩選面板 */}
      {showFilter && (
        <div className="filter-panel">
          <div className="filter-section">
            <h3>關係類型</h3>
            <div className="filter-chips">
              {(Object.keys(RELATION_TYPE_LABELS) as RelationType[]).map((type) => (
                <button
                  key={type}
                  className={`filter-chip ${selectedTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => {
                    if (selectedTypes.includes(type)) {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    } else {
                      setSelectedTypes([...selectedTypes, type]);
                    }
                  }}
                >
                  {RELATION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>排序方式</h3>
            <div className="filter-chips">
              <button
                className={`filter-chip ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                最近查看
              </button>
              <button
                className={`filter-chip ${sortBy === 'created' ? 'active' : ''}`}
                onClick={() => setSortBy('created')}
              >
                創建時間
              </button>
              <button
                className={`filter-chip ${sortBy === 'relation' ? 'active' : ''}`}
                onClick={() => setSortBy('relation')}
              >
                關係類型
              </button>
            </div>
          </div>
          
          <div className="filter-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setSelectedTypes([]);
                setSortBy('recent');
              }}
            >
              重置
            </button>
            <button
              className="primary-button"
              onClick={() => setShowFilter(false)}
            >
              確定
            </button>
          </div>
        </div>
      )}
      
      {/* 當前命主卡片 */}
      {currentChart && (
        <div className="current-chart-section">
          <h2>正在查看</h2>
          <div className="current-chart-card" onClick={() => handleChartClick(currentChart.chartProfileId)}>
            <div className="chart-info">
              <h3>{currentChart.name}</h3>
              <p>{RELATION_TYPE_LABELS[currentChart.relationType]}</p>
              {currentChart.oneLineSummary && (
                <p className="summary">{currentChart.oneLineSummary}</p>
              )}
            </div>
            <div className="chart-date">
              {currentChart.birthday}
            </div>
          </div>
        </div>
      )}
      
      {/* 命盤列表 */}
      <div className="charts-list-section">
        <h2>全部命盤</h2>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>加載中...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="secondary-button" onClick={() => fetchCharts()}>
              重試
            </button>
          </div>
        ) : charts.length === 0 ? (
          <div className="empty-result">
            <p>沒有找到符合條件的命盤</p>
          </div>
        ) : (
          <div className="charts-list">
            {charts.map((chart) => (
              <div
                key={chart.chartProfileId}
                className={`chart-card ${chart.chartProfileId === currentChartId ? 'current' : ''}`}
              >
                <div className="chart-card-content" onClick={() => handleChartClick(chart.chartProfileId)}>
                  <div className="chart-card-header">
                    <h3>{chart.name}</h3>
                    <span className="relation-badge">
                      {RELATION_TYPE_LABELS[chart.relationType]}
                    </span>
                  </div>
                  <div className="chart-card-info">
                    <p>📅 {chart.birthday}</p>
                    {chart.oneLineSummary && (
                      <p className="summary">{chart.oneLineSummary}</p>
                    )}
                  </div>
                </div>
                {chart.chartProfileId !== currentChartId && (
                  <button
                    className="set-current-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCurrent(chart.chartProfileId);
                    }}
                  >
                    設為當前
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 浮動新增按鈕 */}
      <button className="fab" onClick={() => navigate('/create-chart')}>
        +
      </button>
    </div>
  );
};
