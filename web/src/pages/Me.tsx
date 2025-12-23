/**
 * 個人中心頁面（H5 版）
 * 
 * ✅ 繁體中文
 * ✅ 與 App 端 UI 保持一致
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import './Me.css';

export const MePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  
  // ✅ 统一登录状态判断：只认 authStore
  const isLoggedIn = isAuthenticated && !!user;
  
  // 處理登出
  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      logout();
      navigate('/login');
    }
  };
  
  return (
    <div className="me-page">
      {/* 頭部 */}
      <div className="me-header">
        <button className="back-button" onClick={() => navigate('/charts')}>
          ← 返回
        </button>
        <h1>個人中心</h1>
        <div style={{ width: 60 }}></div>
      </div>
      
      {/* 用戶信息卡片 */}
      <div className="user-card">
        <div className="user-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="頭像" />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
        </div>
        <div className="user-info">
          <h2>{user?.nickname || '用戶'}</h2>
          {user?.username && <p className="username">@{user.username}</p>}
          {user?.phone && <p className="contact">{user.phone}</p>}
        </div>
        {user?.isPro && (
          <div className="pro-badge">PRO</div>
        )}
      </div>
      
      {/* 功能菜單 */}
      <div className="menu-section">
        <h3>我的命理</h3>
        <div className="menu-list">
          <button className="menu-item" onClick={() => navigate('/charts')}>
            <span className="menu-icon">📋</span>
            <span className="menu-label">我的命盤</span>
            <span className="menu-arrow">›</span>
          </button>
          <button className="menu-item" onClick={() => navigate('/chat-history')}>
            <span className="menu-icon">💬</span>
            <span className="menu-label">對話記錄</span>
            <span className="menu-arrow">›</span>
          </button>
          <button className="menu-item" onClick={() => alert('功能開發中')}>
            <span className="menu-icon">📖</span>
            <span className="menu-label">我的解讀</span>
            <span className="menu-arrow">›</span>
          </button>
        </div>
      </div>
      
      <div className="menu-section">
        <h3>設置與幫助</h3>
        <div className="menu-list">
          <button className="menu-item" onClick={() => alert('功能開發中')}>
            <span className="menu-icon">⚙️</span>
            <span className="menu-label">設置</span>
            <span className="menu-arrow">›</span>
          </button>
          <button className="menu-item" onClick={() => alert('功能開發中')}>
            <span className="menu-icon">❓</span>
            <span className="menu-label">幫助與反饋</span>
            <span className="menu-arrow">›</span>
          </button>
          <button className="menu-item" onClick={() => alert('功能開發中')}>
            <span className="menu-icon">ℹ️</span>
            <span className="menu-label">關於小佩</span>
            <span className="menu-arrow">›</span>
          </button>
        </div>
      </div>
      
      {isLoggedIn && !user.isPro && (
        <div className="menu-section">
          <button className="upgrade-button" onClick={() => alert('Pro 訂閱功能開發中')}>
            ⭐ 升級為 Pro 會員
          </button>
        </div>
      )}
      
      {/* 登出按钮 - 仅在已登录且有用户信息时显示 */}
      {isLoggedIn && (
        <div className="menu-section">
          <button className="logout-menu-button" onClick={handleLogout}>
            登出
          </button>
        </div>
      )}
      
      {/* 版本信息 */}
      <div className="version-info">
        <p>小佩命理 AI 助手 H5 版</p>
        <p>版本 v1.0.0</p>
      </div>
    </div>
  );
};

