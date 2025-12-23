/**
 * 登錄頁面（H5 版）
 * 
 * ✅ 繁體中文
 * ✅ 支持用戶名+密碼登錄
 * ✅ 支持手機號+驗證碼登錄（可選）
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api/authService';
import { useAuthStore } from '@/store';
import './Login.css';

type LoginTab = 'username' | 'phone';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [activeTab, setActiveTab] = useState<LoginTab>('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 用戶名登錄表單
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 手機號登錄表單
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  /**
   * 用戶名登錄
   */
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('請填寫完整信息');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.loginUsername({ username, password });
      login(response.user, response.token);
      navigate('/charts');
    } catch (err: any) {
      setError(err.message || '登錄失敗');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 請求驗證碼
   */
  const handleRequestOtp = async () => {
    if (!phone) {
      setError('請輸入手機號');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.requestOtp({ phone, region: 'cn' });
      setOtpSent(true);
      setCountdown(60);
      
      // 倒計時
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || '發送驗證碼失敗');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 手機號登錄
   */
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !otp) {
      setError('請填寫完整信息');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.loginOrRegister({
        phone,
        code: otp,
        channel: 'cn',
      });
      login(response.user, response.token);
      navigate('/charts');
    } catch (err: any) {
      setError(err.message || '登錄失敗');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <h1>小佩命理 AI 助手</h1>
        </div>
        
        {/* Tab 切換 */}
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'username' ? 'active' : ''}`}
            onClick={() => setActiveTab('username')}
          >
            用戶名登錄
          </button>
          <button
            className={`login-tab ${activeTab === 'phone' ? 'active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            手機號登錄
          </button>
        </div>
        
        {/* 錯誤提示 */}
        {error && <div className="login-error">{error}</div>}
        
        {/* 用戶名登錄表單 */}
        {activeTab === 'username' && (
          <form className="login-form" onSubmit={handleUsernameLogin}>
            <div className="form-group">
              <label>用戶名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入用戶名"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>密碼</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '隱藏' : '顯示'}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? '登錄中...' : '立即登錄'}
            </button>
            
            <div className="login-footer">
              還沒有帳號？
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/register')}
              >
                去註冊
              </button>
            </div>
          </form>
        )}
        
        {/* 手機號登錄表單 */}
        {activeTab === 'phone' && (
          <form className="login-form" onSubmit={handlePhoneLogin}>
            <div className="form-group">
              <label>手機號</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入手機號"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>驗證碼</label>
              <div className="otp-input">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="請輸入驗證碼"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="otp-button"
                  onClick={handleRequestOtp}
                  disabled={loading || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}秒` : otpSent ? '重新發送' : '發送驗證碼'}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? '登錄中...' : '立即登錄'}
            </button>
            
            <div className="login-footer">
              還沒有帳號？
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/register')}
              >
                去註冊
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


