/**
 * 命盤詳情頁面（H5 版）
 * 
 * ✅ 繁體中文
 * ✅ 與 App 端 UI 保持一致
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chartService } from '@/services/api/chartService';
import './ChartDetail.css';

type TabKey = 'basicInfo' | 'chartOverview' | 'luckTimeline';

export const ChartDetailPage: React.FC = () => {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabKey>('basicInfo');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 加載命盤數據
  useEffect(() => {
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);
  
  const loadChartData = async () => {
    if (!chartId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await chartService.getChartDetail(chartId);
      console.log('命盤詳情響應:', response);
      
      setChartData(response);
    } catch (err: any) {
      console.error('加載命盤數據失敗:', err);
      setError(err.message || '加載命盤數據失敗');
    } finally {
      setIsLoading(false);
    }
  };
  
  const tabs = [
    { key: 'basicInfo' as TabKey, label: '基本資訊' },
    { key: 'chartOverview' as TabKey, label: '命盤總覽' },
    { key: 'luckTimeline' as TabKey, label: '大運流年' },
  ];
  
  if (isLoading) {
    return (
      <div className="chart-detail-page">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/charts')}>
            ← 返回
          </button>
          <h1>命盤詳情</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加載中...</p>
        </div>
      </div>
    );
  }
  
  if (error || !chartData) {
    return (
      <div className="chart-detail-page">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/charts')}>
            ← 返回
          </button>
          <h1>命盤詳情</h1>
        </div>
        <div className="error-container">
          <p>{error || '命盤數據不存在'}</p>
          <button className="primary-button" onClick={() => navigate('/charts')}>
            返回列表
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chart-detail-page">
      {/* 頭部 */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/charts')}>
          ← 返回
        </button>
        <h1>{chartData.profile?.name || '命盤詳情'}</h1>
        <button className="icon-button" onClick={() => navigate('/chat')}>
          💬
        </button>
      </div>
      
      {/* Tab 切換 */}
      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`detail-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab 內容 */}
      <div className="detail-content">
        {activeTab === 'basicInfo' && <BasicInfoTab chartData={chartData} />}
        {activeTab === 'chartOverview' && <ChartOverviewTab chartData={chartData} />}
        {activeTab === 'luckTimeline' && <LuckTimelineTab chartData={chartData} />}
      </div>
    </div>
  );
};

// 基本資訊 Tab
const BasicInfoTab: React.FC<{ chartData: any }> = ({ chartData }) => {
  const profile = chartData.profile;
  const result = chartData.result;
  
  return (
    <div className="tab-content">
      <div className="info-section">
        <h2>檔案信息</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">姓名</span>
            <span className="value">{profile?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">性別</span>
            <span className="value">{profile?.gender === 'male' ? '男' : '女'}</span>
          </div>
          <div className="info-item">
            <span className="label">出生日期</span>
            <span className="value">{profile?.birthday}</span>
          </div>
          <div className="info-item">
            <span className="label">出生時間</span>
            <span className="value">{profile?.birthTime || '未知'}</span>
          </div>
        </div>
      </div>
      
      {result?.dayMasterAnalysis && (
        <div className="info-section">
          <h2>日主概覽</h2>
          <div className="day-master-card">
            <p className="summary">{result.dayMasterAnalysis.summary || '日主分析加載中...'}</p>
          </div>
        </div>
      )}
      
      <div className="info-section">
        <h2>四柱八字</h2>
        <div className="pillars-container">
          {['年柱', '月柱', '日柱', '時柱'].map((label, index) => {
            const pillarKeys = ['year', 'month', 'day', 'hour'];
            const pillar = result?.pillars?.[pillarKeys[index]];
            return (
              <div key={label} className="pillar-card">
                <div className="pillar-label">{label}</div>
                <div className="pillar-stem">{pillar?.stem || '-'}</div>
                <div className="pillar-branch">{pillar?.branch || '-'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 命盤總覽 Tab
const ChartOverviewTab: React.FC<{ chartData: any }> = ({ chartData }) => {
  const result = chartData.result;
  const navigate = useNavigate();
  
  if (!result) {
    return <div className="tab-content"><p>數據加載中...</p></div>;
  }
  
  return (
    <div className="tab-content">
      {/* 四柱八字表格 */}
      {result.pillars && (
        <div className="info-section">
          <h2>四柱八字</h2>
          <div className="four-pillars-table">
            {['year', 'month', 'day', 'hour'].map((key, index) => {
              const pillar = result.pillars[key];
              const labels = ['年柱', '月柱', '日柱', '時柱'];
              return (
                <div key={key} className="pillar-column">
                  <div className="pillar-header">{labels[index]}</div>
                  <div className="pillar-stem">{pillar?.stem || '-'}</div>
                  <div className="pillar-branch">{pillar?.branch || '-'}</div>
                  <div className="pillar-hidden">
                    {pillar?.hiddenStems?.map((hs: string, idx: number) => (
                      <span key={idx}>{hs}</span>
                    )) || '-'}
                  </div>
                  {pillar?.shenSha && pillar.shenSha.length > 0 && (
                    <div className="pillar-shensha">
                      {pillar.shenSha.map((ss: string, idx: number) => (
                        <span key={idx} className="shensha-tag">{ss}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 命格總評 */}
      {result.analysis?.minggeSummary && (
        <div className="info-section clickable" onClick={() => navigate(`/chat?question=請詳細解讀我的命格總評`)}>
          <div className="section-header">
            <h2>命格總評</h2>
            <span className="one-click-read">一鍵解讀</span>
          </div>
          <div className="mingge-indicators">
            <div className="indicator-item">
              <span className="label">日主體質</span>
              <span className="value">
                {result.analysis.minggeSummary.dayMaster.level} · {result.analysis.minggeSummary.dayMaster.score}/100
              </span>
            </div>
            <div className="indicator-item">
              <span className="label">財富格局</span>
              <span className="value">
                {result.analysis.minggeSummary.wealth.level} · {result.analysis.minggeSummary.wealth.score}/100
              </span>
            </div>
            <div className="indicator-item">
              <span className="label">婚戀桃花</span>
              <span className="value">
                {result.analysis.minggeSummary.peachBlossom.level} · {result.analysis.minggeSummary.peachBlossom.score}/100
              </span>
            </div>
            <div className="indicator-item">
              <span className="label">事業發展</span>
              <span className="value">
                {result.analysis.minggeSummary.career.level} · {result.analysis.minggeSummary.career.score}/100
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 用神格局 */}
      {result.analysis?.yongshen && (
        <div className="info-section clickable" onClick={() => navigate(`/chat?question=請詳細解讀我的用神格局`)}>
          <div className="section-header">
            <h2>用神格局</h2>
            <span className="one-click-read">一鍵解讀</span>
          </div>
          <div className="yongshen-content">
            <div className="yongshen-main">
              <span className="label">喜用神：</span>
              <span className="value">{result.analysis.yongshen.favorable?.join('、') || '-'}</span>
            </div>
            <div className="yongshen-main">
              <span className="label">忌神：</span>
              <span className="value">{result.analysis.yongshen.unfavorable?.join('、') || '-'}</span>
            </div>
            {result.analysis.yongshen.summary && (
              <p className="summary">{result.analysis.yongshen.summary}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 大運流年 Tab
const LuckTimelineTab: React.FC<{ chartData: any }> = ({ chartData }) => {
  const result = chartData.result;
  const navigate = useNavigate();
  
  if (!result) {
    return <div className="tab-content"><p>數據加載中...</p></div>;
  }
  
  // 計算當前年齡
  const getCurrentAge = () => {
    if (!chartData.profile?.birthday) return 0;
    const birthYear = new Date(chartData.profile.birthday).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };
  
  const currentAge = getCurrentAge();
  const luckCycles = result.derived?.luckCycle || [];
  const startAge = result.derived?.qi_yun?.years || 0;
  
  // 找到當前大運
  const currentLuck = luckCycles.find((luck: any) => 
    currentAge >= luck.startAge && currentAge <= luck.endAge
  );
  
  return (
    <div className="tab-content">
      {/* 時間坐標 */}
      {result.analysis?.timeCoordinate && (
        <div className="info-section clickable" onClick={() => navigate(`/chat?question=請詳細解讀我的時間坐標`)}>
          <div className="section-header">
            <h2>時間坐標</h2>
            <span className="one-click-read">一鍵解讀</span>
          </div>
          <div className="time-coordinate-content">
            <p className="summary">{result.analysis.timeCoordinate.summary || '時間坐標分析...'}</p>
          </div>
        </div>
      )}
      
      {/* 當前大運 */}
      {currentLuck && (
        <div className="info-section">
          <h2>當前大運（{currentAge} 歲）</h2>
          <div className="current-luck-card">
            <div className="luck-stem-branch">{currentLuck.stemBranch}</div>
            <div className="luck-age-range">
              {currentLuck.startAge} - {currentLuck.endAge} 歲
            </div>
            {currentLuck.summary && (
              <p className="summary">{currentLuck.summary}</p>
            )}
          </div>
        </div>
      )}
      
      {/* 大運時間軸 */}
      {luckCycles.length > 0 && (
        <div className="info-section">
          <h2>大運時間軸（起運年齡：{startAge} 歲）</h2>
          <div className="luck-cycles-list">
            {luckCycles.map((luck: any, index: number) => {
              const isCurrent = currentAge >= luck.startAge && currentAge <= luck.endAge;
              return (
                <div
                  key={index}
                  className={`luck-cycle-item ${isCurrent ? 'current' : ''}`}
                  onClick={() => navigate(`/chat?question=幫我解讀一下${luck.stemBranch}大運（${luck.startAge}–${luck.endAge}歲）`)}
                >
                  <div className="luck-index">{index + 1}</div>
                  <div className="luck-info">
                    <div className="luck-stem-branch">{luck.stemBranch}</div>
                    <div className="luck-age">{luck.startAge} - {luck.endAge} 歲</div>
                  </div>
                  {isCurrent && <span className="current-badge">當前</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 未來十年流年 */}
      {result.analysis?.luckRhythm?.annualBrief && result.analysis.luckRhythm.annualBrief.length > 0 && (
        <div className="info-section">
          <h2>未來十年流年</h2>
          <div className="annual-luck-list">
            {result.analysis.luckRhythm.annualBrief.map((annual: any, index: number) => (
              <div key={index} className="annual-luck-item">
                <div className="annual-year">{annual.year}年</div>
                <div className="annual-stem-branch">{annual.stemBranch}</div>
                <div className="annual-rating">
                  {'★'.repeat(Math.round(annual.rating || 3))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

