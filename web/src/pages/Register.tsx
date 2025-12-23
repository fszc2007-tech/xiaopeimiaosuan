/**
 * 註冊頁面（H5 版）
 * 
 * ✅ 繁體中文
 * ✅ 用戶名+密碼註冊
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api/authService';
import { useAuthStore } from '@/store';
import './Login.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  /**
   * 註冊
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 校驗表單
    if (!username || !password || !confirmPassword) {
      setError('請填寫完整信息');
      return;
    }
    
    if (username.length < 2 || username.length > 50) {
      setError('用戶名長度需 2-50 字符');
      return;
    }
    
    // 移除用戶名格式限制，允許任何字符
    
    if (password.length < 6) {
      setError('密碼至少 6 位');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('兩次密碼不一致');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.registerUsername({
        username,
        password,
        confirmPassword,
      });
      
      // 自動登錄
      login(response.user, response.token);
      navigate('/charts');
    } catch (err: any) {
      setError(err.message || '註冊失敗');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <h1>註冊新帳號</h1>
        </div>
        
        {/* 錯誤提示 */}
        {error && <div className="login-error">{error}</div>}
        
        {/* 註冊表單 */}
        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>用戶名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2-50 字符"
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
                placeholder="至少 6 位"
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
          
          <div className="form-group">
            <label>確認密碼</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入密碼"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? '註冊中...' : '註冊並登錄'}
          </button>
          
          <div className="login-footer">
            已有帳號？
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
            >
              去登錄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

