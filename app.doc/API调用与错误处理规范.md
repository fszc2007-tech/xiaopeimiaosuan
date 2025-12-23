# API 调用与错误处理规范

> **版本**: v1.0  
> **类型**: 系统级规范（横向）  
> **目的**: 统一 API 调用方式、错误处理、请求拦截，避免各页面重复代码  
> **适用范围**: 小佩 App 所有 API 调用

---

## 文档说明

### 为什么需要这个文档?

- ✅ **统一 API 调用**：禁止直接使用 `fetch`/`axios`，必须使用统一的 `apiClient`
- ✅ **规范错误处理**：避免出现 `alert`/`toast`/`console.log` 混用
- ✅ **统一请求拦截**：自动添加 `token`、`app_region`、`X-Request-ID` 等 header
- ✅ **类型安全**：所有 API 响应都有 TypeScript 类型定义

### 相关文档

- **参考**: `API接口统一规范.md` 响应格式
- **参考**: `security/前端开发安全规范.md` API 调用安全规范
- **遵循**: `APP开发文档.md` 6.8 网络请求模块

---

## 一、技术选型

### 1.1 HTTP 客户端

**选择**: **Axios**（首选）

**理由**:
- ✅ 拦截器支持好（请求/响应拦截）
- ✅ 自动转换 JSON
- ✅ 超时控制
- ✅ 取消请求支持
- ✅ TypeScript 支持好

**禁止**: 直接使用 `fetch` API（除非有明确理由）

---

### 1.2 API 基础 URL

**环境变量管理**:

```typescript
// src/config/env.ts
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  API_TIMEOUT: 30000, // 30秒
  ENABLE_LOG: __DEV__,
};
```

**.env 文件**:
```bash
# .env.development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# .env.production
EXPO_PUBLIC_API_BASE_URL=https://api.xiaopei.com
```

---

## 二、统一 API Client（强制使用）

### 2.1 API Client 配置

**位置**: `src/services/api/apiClient.ts`

**完整实现**:

```typescript
// src/services/api/apiClient.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { generateRequestId } from '@/utils/requestId';
import type { ApiResponse, ErrorResponse } from '@/types/api';

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== 请求拦截器 =====
apiClient.interceptors.request.use(
  (config) => {
    // 1. 自动添加 Authorization
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 2. 自动添加 X-App-Region
    const appRegion = useAuthStore.getState().appRegion;
    if (appRegion) {
      config.headers['X-App-Region'] = appRegion;
    }
    
    // 3. 自动添加 X-Request-ID（用于日志追踪）
    config.headers['X-Request-ID'] = generateRequestId();
    
    // 4. 日志（仅开发环境）
    if (ENV.ENABLE_LOG) {
      console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ===== 响应拦截器 =====
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 日志（仅开发环境）
    if (ENV.ENABLE_LOG) {
      console.log('[API Response]', response.config.url, response.data);
    }
    
    // 统一处理成功响应
    if (response.data.success) {
      return response;
    }
    
    // 如果 success: false，视为业务错误
    return Promise.reject(response.data.error);
  },
  async (error: AxiosError<ErrorResponse>) => {
    // 日志
    console.error('[API Response Error]', error.response?.config.url, error.response?.data);
    
    // 统一错误处理
    await handleApiError(error);
    
    return Promise.reject(error);
  }
);

// ===== 统一错误处理函数 =====
async function handleApiError(error: AxiosError<ErrorResponse>) {
  const { response } = error;
  
  // 1. 网络错误（无响应）
  if (!response) {
    showToast('网络连接失败，请检查您的网络设置', 'error');
    return;
  }
  
  const { status, data } = response;
  
  // 2. 401 未授权 → 跳转登录
  if (status === 401) {
    showToast('登录已过期，请重新登录', 'warning');
    // 清空用户状态
    useAuthStore.getState().logout();
    // 跳转到登录页（由 NavigationContainer 的 onStateChange 监听处理）
    return;
  }
  
  // 3. 403 权限不足 → 提示升级 Pro
  if (status === 403 && data?.error?.code === 'PRO_REQUIRED') {
    showToast('此功能需要升级 Pro 才能使用', 'warning');
    // TODO: 可选择性弹出 Pro 订阅页
    return;
  }
  
  // 4. 429 频率限制 → 提示限流信息
  if (status === 429 || data?.error?.code === 'RATE_LIMIT_EXCEEDED') {
    const message = data?.error?.message || '操作过于频繁，请稍后再试';
    showToast(message, 'warning');
    return;
  }
  
  // 5. 422 验证错误 → 显示详细错误
  if (status === 422) {
    const message = data?.error?.message || '输入数据有误，请检查';
    showToast(message, 'error');
    return;
  }
  
  // 6. 500 服务器错误
  if (status >= 500) {
    showToast('服务器开小差了，请稍后再试', 'error');
    return;
  }
  
  // 7. 其他错误 → 显示通用错误信息
  const message = data?.error?.message || '请求失败，请稍后再试';
  showToast(message, 'error');
}

// ===== Toast 显示函数（统一入口）=====
function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  // TODO: 集成 Toast 组件（如 react-native-toast-message）
  console.log(`[Toast ${type.toUpperCase()}]`, message);
  // Toast.show({ type, text1: message });
}

// ===== 导出类型化的请求方法 =====
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}
```

---

### 2.2 请求 ID 生成工具

**位置**: `src/utils/requestId.ts`

```typescript
// src/utils/requestId.ts
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 三、API 服务层（模块化封装）

### 3.1 服务层目录结构

```
src/services/api/
├── apiClient.ts           // 统一 API Client
├── authService.ts         // 认证相关 API
├── chartService.ts        // 命盘相关 API
├── chatService.ts         // 聊天相关 API
├── readingService.ts      // 解读相关 API
├── proService.ts          // Pro 订阅相关 API
├── userService.ts         // 用户相关 API
└── index.ts               // 统一导出
```

---

### 3.2 API 服务示例

#### 3.2.1 authService（认证服务）

```typescript
// src/services/api/authService.ts
import { get, post } from './apiClient';
import type { LoginResponse, OtpResponse, RefreshTokenResponse } from '@/types/api';

export const authService = {
  /**
   * 登录或注册
   */
  async loginOrRegister(params: {
    phone?: string;
    email?: string;
    otp?: string;
    password?: string;
    appRegion: 'CN' | 'HK';
  }): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/login_or_register', params);
  },

  /**
   * 请求验证码
   */
  async requestOtp(params: {
    phone?: string;
    email?: string;
    purpose: 'login' | 'reset_password';
  }): Promise<OtpResponse> {
    return post<OtpResponse>('/api/v1/auth/request-otp', params);
  },

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return post<RefreshTokenResponse>('/api/v1/auth/refresh', { refreshToken });
  },

  /**
   * 重置密码
   */
  async resetPassword(params: {
    phone?: string;
    email?: string;
    otp: string;
    newPassword: string;
  }): Promise<void> {
    return post<void>('/api/v1/auth/reset-password', params);
  },
};
```

---

#### 3.2.2 chartService（命盘服务）

```typescript
// src/services/api/chartService.ts
import { get, post, put, del } from './apiClient';
import type { ChartProfile, BaziChart, CreateChartRequest } from '@/types/chart';

export const chartService = {
  /**
   * 获取命盘列表
   */
  async getCharts(): Promise<ChartProfile[]> {
    return get<ChartProfile[]>('/api/v1/bazi/charts');
  },

  /**
   * 创建命盘
   */
  async createChart(params: CreateChartRequest): Promise<BaziChart> {
    return post<BaziChart>('/api/v1/bazi/chart', params);
  },

  /**
   * 获取命盘详情
   */
  async getChart(chartId: string): Promise<BaziChart> {
    return get<BaziChart>(`/api/v1/bazi/charts/${chartId}`);
  },

  /**
   * 更新命盘
   */
  async updateChart(chartId: string, params: Partial<CreateChartRequest>): Promise<BaziChart> {
    return put<BaziChart>(`/api/v1/bazi/charts/${chartId}`, params);
  },

  /**
   * 删除命盘
   */
  async deleteChart(chartId: string): Promise<void> {
    return del<void>(`/api/v1/bazi/charts/${chartId}`);
  },

  /**
   * 设置为当前命主
   */
  async setDefaultChart(chartId: string): Promise<void> {
    return post<void>(`/api/v1/bazi/charts/${chartId}/set-default`);
  },
};
```

---

#### 3.2.3 chatService（聊天服务）

```typescript
// src/services/api/chatService.ts
import { get, post, del } from './apiClient';
import type { Conversation, ChatMessage, SendMessageRequest, SendMessageResponse } from '@/types/chat';

export const chatService = {
  /**
   * 创建会话
   */
  async createConversation(params: {
    chartId: string;
    topic?: string;
    firstMessage?: string;
  }): Promise<Conversation> {
    return post<Conversation>('/api/v1/chat/conversations', params);
  },

  /**
   * 发送消息（流式）
   */
  async sendMessage(params: SendMessageRequest): Promise<SendMessageResponse> {
    return post<SendMessageResponse>('/api/v1/chat/messages', params);
  },

  /**
   * 获取会话历史
   */
  async getConversations(params: {
    chartId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    const queryString = new URLSearchParams(params as any).toString();
    return get<{ conversations: Conversation[]; total: number }>(
      `/api/v1/chat/conversations?${queryString}`
    );
  },

  /**
   * 获取会话消息列表
   */
  async getMessages(conversationId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ messages: ChatMessage[]; total: number }> {
    const queryString = new URLSearchParams(params as any).toString();
    return get<{ messages: ChatMessage[]; total: number }>(
      `/api/v1/chat/conversations/${conversationId}/messages?${queryString}`
    );
  },

  /**
   * 删除会话
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return del<void>(`/api/v1/chat/conversations/${conversationId}`);
  },
};
```

---

#### 3.2.4 readingService（解读服务）

```typescript
// src/services/api/readingService.ts
import { post } from './apiClient';
import type { ReadingCard, OneClickReadingRequest, OneClickReadingResponse } from '@/types/reading';

export const readingService = {
  /**
   * 一鍵解讀（總覽卡片）
   */
  async oneClickReading(params: OneClickReadingRequest): Promise<OneClickReadingResponse> {
    return post<OneClickReadingResponse>('/api/v1/reading/one-click', params);
  },

  /**
   * 獲取神煞解讀
   */
  async getShenShaReading(params: {
    chartId: string;
    shenShaCode: string;
    pillarType: 'year' | 'month' | 'day' | 'hour';
  }): Promise<ReadingCard> {
    return post<ReadingCard>('/api/v1/reading/shen-sha', params);
  },

  /**
   * 獲取大運卡片
   */
  async getLuckCycleCard(params: {
    chartId: string;
    cycleIndex: number;
  }): Promise<ReadingCard> {
    return post<ReadingCard>('/api/v1/reading/luck-cycle', params);
  },

  /**
   * 獲取流年卡片
   */
  async getFlowYearCard(params: {
    chartId: string;
    year: number;
  }): Promise<ReadingCard> {
    return post<ReadingCard>('/api/v1/reading/flow-year', params);
  },
};
```

---

#### 3.2.5 proService（Pro 订阅服务）

```typescript
// src/services/api/proService.ts
import { get, post } from './apiClient';
import type { ProStatus, SubscriptionPlan, SubscribeRequest, SubscribeResponse } from '@/types/pro';

export const proService = {
  /**
   * 获取 Pro 状态
   */
  async getStatus(): Promise<ProStatus> {
    return get<ProStatus>('/api/v1/pro/status');
  },

  /**
   * 获取订阅计划列表
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return get<SubscriptionPlan[]>('/api/v1/pro/plans');
  },

  /**
   * 创建订阅（模拟）
   */
  async subscribe(params: SubscribeRequest): Promise<SubscribeResponse> {
    return post<SubscribeResponse>('/api/v1/pro/subscribe', params);
  },

  /**
   * 获取订阅历史
   */
  async getSubscriptionHistory(): Promise<any[]> {
    return get<any[]>('/api/v1/pro/subscriptions');
  },

  /**
   * 获取 Pro 功能列表
   */
  async getFeatures(): Promise<string[]> {
    return get<string[]>('/api/v1/pro/features');
  },
};
```

---

### 3.3 统一导出

```typescript
// src/services/api/index.ts
export { authService } from './authService';
export { chartService } from './chartService';
export { chatService } from './chatService';
export { readingService } from './readingService';
export { proService } from './proService';
export { userService } from './userService';
```

---

## 四、错误处理规范

### 4.1 错误码映射表

**位置**: `src/constants/errorCodes.ts`

```typescript
// src/constants/errorCodes.ts
export const ERROR_MESSAGES: Record<string, string> = {
  // 认证相关
  INVALID_CREDENTIALS: '手机号/邮箱或密码错误',
  INVALID_OTP: '验证码错误或已过期',
  OTP_EXPIRED: '验证码已过期，请重新获取',
  OTP_TOO_FREQUENT: '验证码发送过于频繁，请稍后再试',
  TOKEN_EXPIRED: '登录已过期，请重新登录',
  
  // 频率限制
  RATE_LIMIT_EXCEEDED: '操作过于频繁，请稍后再试',
  DAILY_CHART_LIMIT_EXCEEDED: '今日排盘次数已达上限，升级 Pro 可享受无限制排盘',
  
  // 权限相关
  PRO_REQUIRED: '此功能需要升级 Pro 才能使用',
  FORBIDDEN: '权限不足',
  
  // 数据相关
  CHART_NOT_FOUND: '命盘不存在',
  CONVERSATION_NOT_FOUND: '会话不存在',
  INVALID_BIRTH_INFO: '出生信息有误，请检查',
  
  // 网络相关
  NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
  TIMEOUT: '请求超时，请稍后再试',
  SERVER_ERROR: '服务器开小差了，请稍后再试',
  
  // 通用错误
  UNKNOWN_ERROR: '未知错误，请稍后再试',
};

/**
 * 根据错误码获取用户友好的错误信息
 */
export function getErrorMessage(code: string, defaultMessage?: string): string {
  return ERROR_MESSAGES[code] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

---

### 4.2 错误处理最佳实践

#### 4.2.1 在组件中处理 API 错误

```typescript
// ✅ 正确：使用 try-catch + 统一错误提示
import { chartService } from '@/services/api';
import { showToast } from '@/utils/toast';

const handleCreateChart = async () => {
  setLoading(true);
  try {
    const chart = await chartService.createChart({
      name: '自己',
      gender: 'female',
      birth: { ... },
    });
    
    // 成功处理
    useChartStore.getState().addProfile(chart);
    showToast('命盘创建成功', 'success');
    navigation.goBack();
  } catch (error: any) {
    // 错误已经在 apiClient 拦截器中统一处理
    // 这里只需要处理页面级别的逻辑（如不跳转）
    console.error('创建命盘失败:', error);
  } finally {
    setLoading(false);
  }
};
```

#### 4.2.2 需要自定义错误处理的场景

```typescript
// 某些场景需要自定义错误处理（如不显示 Toast）
import { apiClient } from '@/services/api/apiClient';

const handleSilentRequest = async () => {
  try {
    const response = await apiClient.get('/api/v1/some-endpoint', {
      // 跳过全局错误处理
      __skipErrorHandler: true,
    });
    
    // 手动处理响应
    if (!response.data.success) {
      // 自定义错误处理
      console.log('静默请求失败', response.data.error);
    }
  } catch (error) {
    // 手动处理错误
    console.error('请求失败', error);
  }
};
```

**对应的 apiClient 拦截器调整**:
```typescript
// apiClient.ts 响应拦截器中
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // 检查是否跳过全局错误处理
    if (error.config?.__skipErrorHandler) {
      return Promise.reject(error);
    }
    
    // 全局错误处理
    await handleApiError(error);
    return Promise.reject(error);
  }
);
```

---

### 4.3 Toast 组件集成

**推荐库**: `react-native-toast-message`

**安装**:
```bash
npm install react-native-toast-message
```

**配置**:
```typescript
// src/utils/toast.ts
import Toast from 'react-native-toast-message';

export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
}
```

**在 App.tsx 中注册**:
```typescript
// App.tsx
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <NavigationContainer>
        {/* Your app content */}
      </NavigationContainer>
      <Toast />
    </>
  );
}
```

---

## 五、类型定义

### 5.1 API 响应类型

**位置**: `src/types/api.ts`

```typescript
// src/types/api.ts

// ===== 通用响应格式 =====
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===== 认证相关 =====
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface OtpResponse {
  message: string;
  expiresIn: number; // 秒
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ===== 命盘相关 =====
export interface CreateChartRequest {
  name: string;
  nickname?: string;
  relation: 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'other';
  gender: 'male' | 'female';
  birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  birthPlace: string;
  useRealSolarTime: boolean;
}

// ===== 聊天相关 =====
export interface SendMessageRequest {
  conversationId?: string | null;
  chartId: string;
  message: string;
  topic?: string;
  context?: any;
}

export interface SendMessageResponse {
  conversationId: string;
  message: ChatMessage;
  followUpSuggestions?: string[];
}

// ===== 解读相关 =====
export interface OneClickReadingRequest {
  chartId: string;
  sectionKey: string; // 'constitution' | 'structure' | 'tiyong' | 'palace' | 'fortune'
}

export interface OneClickReadingResponse {
  card: ReadingCard;
  suggestedQuestions: string[];
}

// ===== Pro 相关 =====
export interface SubscribeRequest {
  plan: 'yearly' | 'monthly' | 'lifetime';
}

export interface SubscribeResponse {
  subscriptionId: string;
  status: 'active';
  plan: string;
  expiresAt?: string;
}
```

---

## 六、开发检查清单

### 6.1 API 调用时必须检查

- [ ] ❌ 不允许：直接使用 `fetch` / `axios.create`
- [ ] ✅ 必须：使用 `apiClient` 或封装的 service（如 `chartService.createChart`）
- [ ] ✅ 必须：所有 API 调用都在 `try-catch` 中
- [ ] ✅ 必须：API 响应类型已定义在 `src/types/api.ts`
- [ ] ✅ 必须：错误码已添加到 `ERROR_MESSAGES` 映射表
- [ ] ❌ 不允许：在组件中直接调用 `alert`（必须使用 `showToast`）

### 6.2 新增 API 服务时必须检查

- [ ] 服务文件放在 `src/services/api/` 目录下
- [ ] 服务命名为 `xxxService.ts`（如 `chartService.ts`）
- [ ] 每个方法都有 JSDoc 注释
- [ ] 每个方法的返回类型都已定义
- [ ] 已在 `src/services/api/index.ts` 中导出

---

## 七、与其他规范文档的关系

### 7.1 与 前端路由与页面结构设计文档.md 的关系

- **路由文档** 定义页面跳转和路由参数
- **本文档** 定义如何调用 API 获取数据
- **协同**: 页面跳转 → API 调用 → 更新 Store → UI 重新渲染

### 7.2 与 状态管理与数据模型规范.md 的关系

- **状态管理规范** 定义数据如何存储在 store
- **本文档** 定义如何从 API 获取数据
- **协同**: API 响应 → DTO 转换 → 更新 Store

### 7.3 与 security/前端开发安全规范.md 的关系

- **安全规范** 禁止前端引入核心算法、Prompt 模板
- **本文档** 强制所有业务逻辑通过 API 调用
- **协同**: 前端只调用 API，不实现业务逻辑

---

## 八、常见问题 FAQ

### Q1: 什么时候可以不使用 apiClient？

**A**: 
- **99% 的场景都必须使用 apiClient**
- 极少数例外：第三方 SDK（如上传文件到 OSS）、WebSocket 连接

### Q2: 如何处理文件上传？

**A**:
```typescript
import { apiClient } from '@/services/api/apiClient';

const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiClient.post<{ avatarUrl: string }>(
    '/api/v1/user/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data.avatarUrl;
};
```

### Q3: 如何取消正在进行的请求？

**A**:
```typescript
import { apiClient } from '@/services/api/apiClient';
import { CancelToken } from 'axios';

// 创建取消令牌
const source = CancelToken.source();

// 发起请求
apiClient.get('/api/v1/some-endpoint', {
  cancelToken: source.token,
});

// 取消请求
source.cancel('用户取消了请求');
```

### Q4: 如何处理流式响应（SSE）？

**A**: 流式响应需要特殊处理，不使用 apiClient
```typescript
// 单独处理 SSE
const eventSource = new EventSource(`${ENV.API_BASE_URL}/api/v1/chat/stream?token=${token}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 处理流式数据
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

---

## 九、更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|---------|--------|
| v1.0 | 2024-11-18 | 初始版本，定义完整 API 调用规范和错误处理机制 | 开发团队 |

---

**文档版本**: v1.0  
**最后更新**: 2024-11-18  
**维护者**: 开发团队  
**相关文档**: `API接口统一规范.md`, `security/前端开发安全规范.md`, `状态管理与数据模型规范.md`

