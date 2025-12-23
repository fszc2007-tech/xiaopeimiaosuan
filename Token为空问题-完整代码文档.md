# Token 为空问题 - 完整代码文档

> **问题**: `[API Request] ❌ token 为空，无法添加 Authorization header`  
> **位置**: `apiClient.ts:59:20`  
> **状态**: ⚠️ 警告（非崩溃错误）

---

## 📋 目录

1. [问题概述](#问题概述)
2. [完整代码](#完整代码)
3. [流程分析](#流程分析)
4. [问题原因](#问题原因)
5. [相关文件清单](#相关文件清单)

---

## 问题概述

### 错误信息

```
Console Error
[API Request] ❌ token 为空，无法添加 Authorization header

Source:
apiClient.ts (59:20)

Call Stack:
interceptors.request.use$argument_0
  apiClient.ts:59:20
```

### 当前状态

- ✅ **类型错误（boolean/string）**: 已通过删除 App 解决
- ⚠️ **Token 为空警告**: 这是预期行为（用户未登录）
- ✅ **App 可以正常启动**: 能看到登录页面
- ⚠️ **某个组件在启动时尝试调用 API**: 触发了警告

---

## 完整代码

### 1. apiClient.ts - API 客户端

**文件路径**: `app/src/services/api/client.ts`

```typescript
/**
 * API 客户端
 * 
 * 统一的 HTTP 客户端，处理所有 API 请求
 * 包含：请求拦截、响应拦截、错误处理、Token 管理
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/keys';

// API 基础 URL（从环境变量读取）
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 创建 axios 实例
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ⚠️ 请求拦截器：添加 Token（问题发生处）
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // ✅ 直接使用 AsyncStorage.getItem，因为 token 是纯字符串，不需要 JSON.parse
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Client] ✅ Token 已添加到请求头');
      } else {
        // ⚠️ 第 49 行：警告发生处
        console.warn('[API Client] ⚠️ Token 不存在，无法添加 Authorization header');
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器：统一处理响应
  instance.interceptors.response.use(
    (response) => {
      // 后端返回统一格式：{ success: boolean, data?: T, error?: {...} }
      return response.data;
    },
    async (error: AxiosError<ApiResponse>) => {
      // 处理错误响应
      if (error.response) {
        const { status, data } = error.response;

        // 401 未授权：清除 token 并跳转到登录页
        if (status === 401) {
          await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          // TODO: 跳转到登录页（通过 navigation 或 event emitter）
        }

        // 返回后端的错误信息
        if (data && !data.success && data.error) {
          return Promise.reject(data.error);
        }
      }

      // 网络错误或其他错误
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: error.message || '网络请求失败，请检查网络连接',
      });
    }
  );

  return instance;
};

// 导出单例实例
export const apiClient = createApiClient();

/**
 * 便捷方法：GET 请求
 */
export const get = <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => {
  return apiClient.get(url, { params });
};

/**
 * 便捷方法：POST 请求
 */
export const post = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return apiClient.post(url, data);
};

/**
 * 便捷方法：PUT 请求
 */
export const put = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return apiClient.put(url, data);
};

/**
 * 便捷方法：DELETE 请求
 */
export const del = <T = any>(url: string): Promise<ApiResponse<T>> => {
  return apiClient.delete(url);
};

export default apiClient;
```

---

### 2. keys.ts - 存储键常量

**文件路径**: `app/src/services/storage/keys.ts`

```typescript
/**
 * 存储 Key 常量
 */

export const STORAGE_KEYS = {
  // 认证相关
  AUTH_TOKEN: '@xiaopei/auth_token',  // ← Token 存储键
  USER_INFO: '@xiaopei/user_info',
  APP_REGION: '@xiaopei/app_region', // 'cn' | 'hk'
  
  // 用户偏好
  CURRENT_CHART_ID: '@xiaopei/current_chart_id',
  LANGUAGE: '@xiaopei/language', // 'zh-CN' | 'zh-HK'
  
  // 其他
  FIRST_LAUNCH: '@xiaopei/first_launch',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

---

### 3. tokenStorage.ts - Token 存储工具

**文件路径**: `app/src/utils/tokenStorage.ts`

```typescript
/**
 * Token 存储管理
 * 
 * 使用独立的 AsyncStorage 管理，完全绕过 Zustand persist 的潜在问题
 * 
 * 职责：
 * - 保存 Token 到 AsyncStorage
 * - 恢复 Token 从 AsyncStorage
 * - 清除 Token
 * - 详细日志追踪
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 使用与 client.ts 一致的 key
const TOKEN_STORAGE_KEY = '@xiaopei/auth_token';

export const tokenStorage = {
  /**
   * 保存 Token
   */
  async save(token: string): Promise<void> {
    try {
      console.log('[TokenStorage] 开始保存 Token:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + '...',
      });
      
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // 立即验证保存结果
      const saved = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (saved === token) {
        console.log('[TokenStorage] ✅ Token 保存成功并验证通过');
      } else {
        console.error('[TokenStorage] ❌ Token 保存后验证失败！');
      }
    } catch (error) {
      console.error('[TokenStorage] ❌ 保存 Token 失败:', error);
      throw error;
    }
  },

  /**
   * 读取 Token
   */
  async load(): Promise<string | null> {
    try {
      console.log('[TokenStorage] 开始读取 Token...');
      
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (token) {
        console.log('[TokenStorage] ✅ Token 读取成功:', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + '...',
        });
      } else {
        console.log('[TokenStorage] ⚠️ Token 不存在');
      }
      
      return token;
    } catch (error) {
      console.error('[TokenStorage] ❌ 读取 Token 失败:', error);
      return null;
    }
  },

  /**
   * 清除 Token
   */
  async clear(): Promise<void> {
    try {
      console.log('[TokenStorage] 开始清除 Token...');
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      console.log('[TokenStorage] ✅ Token 已清除');
    } catch (error) {
      console.error('[TokenStorage] ❌ 清除 Token 失败:', error);
      throw error;
    }
  },

  /**
   * 检查 Token 是否存在
   */
  async exists(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return token !== null;
    } catch (error) {
      console.error('[TokenStorage] ❌ 检查 Token 失败:', error);
      return false;
    }
  },
};
```

---

### 4. authStore.ts - 认证状态管理（login 方法）

**文件路径**: `app/src/store/authStore.ts`

```typescript
// ... 省略其他部分 ...

login: async (user, token) => {
  logger.auth('开始登录', {
    userId: user.userId,
    phone: user.phone,
    hasToken: !!token,
    tokenLength: token?.length,
  });
  
  if (!token || token.length === 0) {
    logger.error('auth', 'Token 为空，登录失败', { token });
    return;
  }
  
  set({
    user,
    token: token,
    isAuthenticated: true,
    appRegion: user.appRegion,
  });
  
  // 🔥 手动保存 Token 到 AsyncStorage
  try {
    await tokenStorage.save(token);  // ← 保存到 @xiaopei/auth_token
    logger.auth('✅ Token 已手动保存到 AsyncStorage');
  } catch (error) {
    logger.error('auth', '❌ 手动保存 Token 失败', error);
  }
  
  logger.auth('登录成功，状态已更新', {
    userId: user.userId,
    isAuthenticated: true,
    tokenLength: token.length,
  });
},

// ... 省略其他部分 ...
```

---

### 5. initializeAuth.ts - 认证初始化

**文件路径**: `app/src/utils/initializeAuth.ts`

```typescript
/**
 * 认证初始化
 * 
 * 在 App 启动时恢复 Token
 */

import { tokenStorage } from './tokenStorage';
import { useAuthStore } from '@/store';

/**
 * 初始化认证状态
 * 在 App 启动时调用，恢复保存的 Token
 */
export async function initializeAuth(): Promise<void> {
  console.log('[InitializeAuth] ==================== 开始初始化认证 ====================');
  
  try {
    // 1. 从 AsyncStorage 恢复 Token
    const token = await tokenStorage.load();  // ← 读取 @xiaopei/auth_token
    
    if (token) {
      console.log('[InitializeAuth] ✅ 发现已保存的 Token，恢复登录状态');
      
      // 2. 更新 authStore
      useAuthStore.setState({
        token,
        isAuthenticated: true,
        _hasHydrated: true, // 标记已恢复
      });
      
      console.log('[InitializeAuth] ✅ 登录状态已恢复');
    } else {
      console.log('[InitializeAuth] ⚠️ 未找到保存的 Token，用户需要登录');
      
      // 确保状态为未登录
      useAuthStore.setState({
        token: null,
        isAuthenticated: false,
        user: null,
        _hasHydrated: true, // 标记已恢复
      });
    }
  } catch (error) {
    console.error('[InitializeAuth] ❌ 初始化认证失败:', error);
    
    // 出错时清空状态
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      user: null,
      _hasHydrated: true, // 标记已恢复
    });
  }
  
  console.log('[InitializeAuth] ==================== 认证初始化完成 ====================');
}
```

---

### 6. App.tsx - App 主入口

**文件路径**: `app/App.tsx`

```typescript
/**
 * 小佩 App 主入口
 * 
 * 职责：
 * 1. 初始化 i18n
 * 2. 挂载导航器
 * 3. 提供全局 SafeAreaProvider
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeAuth } from './src/utils/initializeAuth';
import './src/i18n'; // 初始化 i18n

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] ==================== App 启动 ====================');
        
        // 🔥🔥🔥 临时：强制清除问题数据（只执行一次）
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const clearFlag = await AsyncStorage.getItem('__xiaopei_v4_cleared__');
        if (clearFlag !== 'true') {
          console.log('[App] 🔥 首次运行 v4，清除所有旧数据...');
          await AsyncStorage.removeItem('xiaopei-auth-storage');
          await AsyncStorage.setItem('__xiaopei_v4_cleared__', 'true');
          console.log('[App] ✅ 旧数据已清除');
        }
        
        // 1. 初始化认证（从 AsyncStorage 恢复 Token）
        await initializeAuth();
        
        console.log('[App] ==================== 初始化完成 ====================');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] 初始化失败:', error);
        setIsInitialized(true); // 即使失败也要继续
      }
    }

    prepare();
  }, []);

  // 等待认证初始化完成
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View testID="app-root" style={{ flex: 1 }}>
        <RootNavigator />
        </View>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
```

---

### 7. RootNavigator.tsx - 根导航器

**文件路径**: `app/src/navigation/RootNavigator.tsx`

```typescript
/**
 * 根导航器
 * 
 * 架构：
 * - Auth（登录/注册）
 * - MainTabs（底部导航）
 * - 全屏页面（Chat, ManualBazi, ChartDetail 等）
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREEN_NAMES } from '@/constants/routes';
import { RootStackParamList } from '@/types/navigation';
import { useIsAuthenticated } from '@/store/authStore';
import { colors } from '@/theme';

// Screens
import { AuthScreen } from '@/screens/Auth';
import { MainTabNavigator } from './MainTabNavigator';
// ... 其他导入 ...

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // 🔥 使用安全的 hook 确保 isAuthenticated 始终是布尔值
  const isAuthenticated = useIsAuthenticated();
  
  // ✅ 简化：直接使用 hook 返回的布尔值（已经过类型保护）
  const isLoggedIn = isAuthenticated;

  // 记录认证状态变化
  React.useEffect(() => {
    import('@/utils/logger').then(({ logger }) => {
      logger.navigation('认证状态变化', {
        isAuthenticated,
        isLoggedIn,
        type: typeof isAuthenticated,
      });
    });
  }, [isAuthenticated, isLoggedIn]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLoggedIn === false ? (
        // 未登录：显示登录页
        <Stack.Screen name={SCREEN_NAMES.AUTH} component={AuthScreen} />
      ) : (
        // 已登录：显示主应用
        <>
          <Stack.Screen name={SCREEN_NAMES.MAIN_TABS} component={MainTabNavigator} />
          {/* 其他页面... */}
        </>
      )}
    </Stack.Navigator>
  );
};
```

---

### 8. AuthScreen.tsx - 登录页面

**文件路径**: `app/src/screens/Auth/AuthScreen.tsx`

```typescript
/**
 * 登录/注册页面
 * 
 * 功能：
 * - 单页面架构（登录/注册共用）
 * - 支持手机号/邮箱登录
 * - 支持验证码/密码验证
 * - 首次登录即自动注册
 * - app_region 选择（CN/HK）
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, Logo } from '@/components/common';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useAuthStore, useUIStore } from '@/store';
import { authService } from '@/services/api';  // ← 使用 apiClient

export const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const appRegion = useUIStore((state) => state.language === 'zh-HK' ? 'HK' : 'CN');
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  
  // ... 其他状态和逻辑 ...

  // 发送验证码
  const handleSendOtp = async () => {
    if (!phone) {
      setError('请输入手机号');
      return;
    }
    
    if (!validatePhone(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    
    setLoading(true);
    setError('');
    setPhoneError('');
    
    try {
      // ⚠️ 这里会调用 API，触发 apiClient 拦截器
      await authService.requestOtp({ 
        phone, 
        region: appRegion 
      });
      
      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // ... 其他方法 ...
};
```

---

## 流程分析

### 完整启动流程

```
┌─────────────────────────────────────────────────────────┐
│ 1. App 启动                                              │
│    App.tsx useEffect                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. 清除旧数据（v4 标记）                                 │
│    - 检查 __xiaopei_v4_cleared__                        │
│    - 如果未清除，删除 xiaopei-auth-storage              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. 初始化认证                                            │
│    initializeAuth()                                     │
│    └─> tokenStorage.load()                             │
│        └─> AsyncStorage.getItem('@xiaopei/auth_token') │
│            └─> 返回 null（Token 不存在）                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 4. 设置未登录状态                                         │
│    useAuthStore.setState({                              │
│      token: null,                                       │
│      isAuthenticated: false,  ← 布尔值 ✅               │
│      user: null                                         │
│    })                                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 5. 渲染 RootNavigator                                   │
│    useIsAuthenticated() 返回 false                      │
│    → 显示 AuthScreen（登录页）                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 6. 【问题】某个组件尝试调用 API                           │
│    可能的触发点：                                         │
│    - AuthScreen 渲染后的 useEffect                       │
│    - 某个全局监听器                                       │
│    - 自动的预加载逻辑                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 7. apiClient 请求拦截器                                  │
│    interceptors.request.use()                           │
│    └─> AsyncStorage.getItem('@xiaopei/auth_token')     │
│        └─> 返回 null                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 8. 输出警告（第 49 行）                                   │
│    console.warn('[API Client] ⚠️ Token 不存在...')       │
└─────────────────────────────────────────────────────────┘
```

---

## 问题原因

### 为什么会有这个警告？

1. **用户未登录**
   - 删除了 App 后，AsyncStorage 清空
   - `@xiaopei/auth_token` 不存在

2. **启动时就有 API 调用**
   - 某个组件在渲染后立即调用 API
   - apiClient 拦截器检测到 Token 为空
   - 输出警告信息

3. **这是预期行为**
   - ✅ 用户未登录时，Token 本来就应该为空
   - ✅ apiClient 正确检测并警告
   - ✅ 不影响 App 正常运行

### 与之前类型错误的区别

| 对比项 | 类型错误（已解决） | Token 为空警告（当前） |
|--------|-------------------|----------------------|
| **严重程度** | ❌ 崩溃错误 | ⚠️ 警告 |
| **错误类型** | TypeError: boolean vs string | Token 不存在 |
| **影响** | App 无法启动 | App 正常运行 |
| **原因** | AsyncStorage 中 isAuthenticated 是字符串 | Token 不存在（未登录） |
| **解决方案** | 删除 App + migrate v4 | 用户登录后自动解决 |

---

## 相关文件清单

### AsyncStorage 存储键

```
@xiaopei/auth_token        ← Token 存储位置（tokenStorage）
xiaopei-auth-storage       ← Zustand persist 数据（authStore）
__xiaopei_v4_cleared__     ← 清除标记（App.tsx）
```

### 文件依赖关系

```
App.tsx
  ├─> initializeAuth()
  │     └─> tokenStorage.load()
  │           └─> AsyncStorage.getItem('@xiaopei/auth_token')
  │
  └─> RootNavigator
        └─> useIsAuthenticated()
              └─> authStore.isAuthenticated
                    └─> false（未登录）
                          └─> 显示 AuthScreen
                                └─> authService.requestOtp()
                                      └─> apiClient.post()
                                            └─> interceptors.request
                                                  └─> AsyncStorage.getItem('@xiaopei/auth_token')
                                                        └─> null
                                                              └─> ⚠️ 警告
```

### 环境变量

```bash
# .env 文件
EXPO_PUBLIC_API_BASE_URL=http://10.89.148.75:3000
EXPO_PUBLIC_API_URL=http://localhost:3000  # 备用
```

---

## 总结

### 当前状态

- ✅ **类型错误已解决**：删除 App 后 AsyncStorage 清空，migrate v4 生效
- ⚠️ **Token 为空是正常的**：用户未登录，需要登录后才有 Token
- ✅ **App 可以正常使用**：登录页面正常显示

### 下一步

1. **测试登录流程**
   - 输入手机号
   - 获取验证码
   - 完成登录
   - Token 会被保存到 `@xiaopei/auth_token`

2. **验证 Token 持久化**
   - 登录后关闭 App
   - 重新打开
   - 检查是否自动登录（Token 被恢复）

3. **如果想消除警告**
   - 检查是否有不必要的 API 调用
   - 或者在未登录时禁用某些功能

---

**文档生成时间**: 2025-01-20  
**App 版本**: v1.0.0  
**问题状态**: ⚠️ 非阻塞警告（可忽略）

