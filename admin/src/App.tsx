/**
 * Admin 主应用
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store';

// 布局组件
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// 页面组件
import LoginPage from './pages/Login/LoginPage';
import UserList from './pages/Users/UserList';
import UserDetail from './pages/Users/UserDetail';
import CreateTestUser from './pages/Users/CreateTestUser';
import CursorTestAccount from './pages/Users/CursorTestAccount';
import LLMConfigPage from './pages/LLMConfig/LLMConfigPage';
import SystemSettingsPage from './pages/SystemSettings/SystemSettingsPage';
import FeedbackList from './pages/Feedbacks/FeedbackList';
import MembershipUserList from './pages/Membership/MembershipUserList';
import MembershipUserDetail from './pages/Membership/MembershipUserDetail';

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // 初始化认证状态
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 登录页（公开路由） */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin 主布局（保护路由） */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* 重定向到用户列表 */}
            <Route index element={<Navigate to="/users" replace />} />

            {/* 用户管理 */}
            <Route path="users" element={<UserList />} />
            <Route path="users/test" element={<CreateTestUser />} />
            <Route path="users/cursor-test" element={<CursorTestAccount />} />
            <Route path="users/:userId" element={<UserDetail />} />

            {/* 會員管理 */}
            <Route path="membership/users" element={<MembershipUserList />} />
            <Route path="membership/users/:userId" element={<MembershipUserDetail />} />

            {/* 反馈管理 */}
            <Route path="feedbacks" element={<FeedbackList />} />

            {/* LLM 配置 */}
            <Route path="llm-config" element={<LLMConfigPage />} />

            {/* 系统设置 */}
            <Route path="system-settings" element={<SystemSettingsPage />} />
          </Route>

          {/* 404 重定向到用户列表 */}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
