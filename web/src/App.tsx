/**
 * App 根組件（H5 版）
 * 
 * ✅ 路由配置
 * ✅ 認證保護
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ChartsPage } from './pages/Charts';
import { ChartDetailPage } from './pages/ChartDetail';
import { ChatPage } from './pages/Chat';
import { MePage } from './pages/Me';
import { CreateChartPage } from './pages/CreateChart';
import './App.css';

/**
 * 私有路由保護
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * 公開路由（已登錄則跳轉）
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/charts" replace /> : <>{children}</>;
};

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  
  // 初始化：從 localStorage 恢復登錄狀態
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* 公開路由 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        
        {/* 私有路由 */}
        <Route
          path="/charts"
          element={
            <PrivateRoute>
              <ChartsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chart/:chartId"
          element={
            <PrivateRoute>
              <ChartDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/me"
          element={
            <PrivateRoute>
              <MePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-chart"
          element={
            <PrivateRoute>
              <CreateChartPage />
            </PrivateRoute>
          }
        />
        
        {/* 默認路由 */}
        <Route path="/" element={<Navigate to="/charts" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/charts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

