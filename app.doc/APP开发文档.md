# 小佩命理 AI 助手 App 开发文档

## 目录

1. [项目概述](#项目概述)
   - [1.1 项目简介](#11-项目简介)
   - [1.2 技术选型](#12-技术选型)
   - [1.3 核心功能](#13-核心功能)
   - [1.4 应用架构概览](#14-应用架构概览)
   - [1.5 用户流程](#15-用户流程)
2. [技术架构](#技术架构)
3. [项目结构](#项目结构)
   - [3.1 目录结构](#31-目录结构)
   - [3.2 文件命名规范](#32-文件命名规范)
   - [3.3 路由命名规范](#33-路由命名规范)
4. [开发环境配置](#开发环境配置)
5. [本地数据库配置](#本地数据库配置)
6. [核心功能模块](#核心功能模块)
   - [6.1 应用入口与认证](#61-应用入口与认证)
   - [6.2 底部导航主界面](#62-底部导航主界面)
   - [6.3 全屏功能页面](#63-全屏功能页面)
   - [6.4 我的模块二级页面](#64-我的模块二级页面)
   - [6.5 特殊功能页面](#65-特殊功能页面)
   - [6.6 组件模块](#66-组件模块)
   - [6.7 状态管理模块](#67-状态管理模块)
7. [UI/UX 设计规范](#uiux-设计规范)
8. [通知功能实现](#通知功能实现)
9. [开发流程](#开发流程)
   - [9.1 开发思路与优先级](#91-开发思路与优先级)
   - [9.2 开发阶段划分](#92-开发阶段划分)
   - [9.3 开发规范](#93-开发规范)
10. [测试策略](#测试策略)
11. [构建与部署](#构建与部署)
12. [常见问题](#常见问题)
13. [附录](#附录)

---

> **⚠️ 重要**: 所有开发必须遵循安全策略规范。前端只负责 UI，所有核心逻辑（算法、prompt、计费）必须在后端 Core 实现。
> 
> **相关文档**:
> - `security/Core架构与安全策略方案.md` - 总体架构和安全策略
> - `security/前端开发安全规范.md` - 前端开发必须遵守的规则（**系统级要求**）
> - `security/后端开发安全规范.md` - 后端开发必须遵守的规则（**系统级要求**）
> - `security/代码审查安全检查清单.md` - 代码审查时使用的检查清单

---

## 项目概述

### 1.1 项目简介
小佩命理 AI 助手是一款基于 React Native 开发的跨平台移动应用，支持 Android 和 iOS 平台。现阶段专注于 App 界面开发，不涉及后端 Core 系统集成。

### 1.2 技术选型
- **框架**: React Native 0.73+
- **语言**: TypeScript
- **开发方式**: Expo (Managed Workflow)
- **目标平台**: Android 5.0+, iOS 12.0+

### 1.3 核心功能
- **命盘管理**: 手动排盘、命盘列表、命盘详情（基本信息、命盘总览、大运流年）
- **AI 对话**: 小佩主页（意图选择）、聊天页（多轮对话）、历史对话管理
- **个人中心**: 我的主页、命盘管理、解读归档、聊天记录、设置、Pro订阅
- **用户认证**: 登录/注册（手机号/邮箱、验证码/密码）
- **推送通知**: Android & iOS 推送通知（预留）

### 1.4 应用架构概览

**整体架构**:
```
┌─────────────────────────────────────────┐
│         用户认证层 (Auth)                │
│  登录/注册 → 用户引导页（新用户）        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      底部导航主界面 (MainTabs)          │
│  ┌────────┬────────┬────────┬────────┐ │
│  │ 排盤   │ 檔案   │ 小佩   │ 我的   │ │
│  └────────┴────────┴────────┴────────┘ │
└──────┬──────┬──────┬──────┬────────────┘
       │      │      │      │
   ┌───┘      │      │      └───┐
   │          │      │          │
┌──▼──┐  ┌───▼──┐ ┌─▼──┐  ┌───▼──┐
│手動 │  │命盤  │ │小佩│  │我的  │
│排盤 │  │列表  │ │主页│  │主页  │
└──┬──┘  └───┬──┘ └─┬──┘  └───┬──┘
   │         │      │         │
   │    ┌────▼────┐ │    ┌────▼────┐
   │    │命盤詳情 │ │    │二级页面 │
   │    │(3 Tabs) │ │    │(多个)   │
   │    └────┬────┘ │    └─────────┘
   │         │      │
   └─────────┴──────┴─────────┐
                              │
                        ┌─────▼─────┐
                        │  聊天页   │
                        │ (全屏)    │
                        └───────────┘
```

**路由层级**:
- **RootStack**: 顶层导航栈
  - `Auth` (登录/注册)
  - `Onboarding` (用户引导页，新用户)
  - `MainTabs` (底部导航主界面)
  - `ManualBazi` (手動排盤頁，全屏)
  - `ChartDetail` (命盤詳情頁，全屏)
  - `Chat` (聊天頁，全屏)
  - `ProSubscribe` (Pro订阅页，全屏)
  - 其他二级页面...

- **MainTabs**: 底部导航 Tab 组
  - `Cases` (檔案列表)
  - `XiaoPeiHome` (小佩主页)
  - `Me` (我的主页)

### 1.5 用户流程

#### 1.5.1 新用户流程
```
启动 App
  ↓
登录/注册页面
  ↓
用户引导页（填写出生信息）
  ├─→ 聊天方式输入 → 聊天页 → 排盘完成
  └─→ 手动排盘 → 排盘完成
  ↓
底部导航主界面（默认「小佩」Tab）
  ↓
小佩主页 → 选择话题/问题 → 聊天页
```

#### 1.5.2 老用户流程
```
启动 App
  ↓
登录页面
  ↓
底部导航主界面（保持上次停留的 Tab）
  ├─→ 排盤 Tab → 手動排盤頁
  ├─→ 檔案 Tab → 命盤列表 → 命盤詳情頁
  ├─→ 小佩 Tab → 小佩主页 → 聊天页
  └─→ 我的 Tab → 我的主页 → 二级页面
```

---

## 技术架构

### 2.1 架构分层

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Screens, Components, Navigation)  │
├─────────────────────────────────────┤
│         State Management            │
│      (Zustand / Redux Toolkit)      │
├─────────────────────────────────────┤
│         Service Layer               │
│  (Storage, Notifications, Utils)    │
├─────────────────────────────────────┤
│         Native Layer                │
│  (React Native, Expo, Native APIs)  │
└─────────────────────────────────────┘
```

### 2.2 核心技术栈

#### 2.2.1 框架与库
| 类别 | 技术选型 | 版本要求 | 用途 |
|------|---------|---------|------|
| 核心框架 | React Native | 0.73+ | 跨平台开发框架 |
| 开发工具 | Expo | SDK 50+ | 开发工具链 |
| 导航 | React Navigation | 6.x | 页面导航 |
| 状态管理 | Zustand | 4.x | 全局状态管理 |
| UI组件 | React Native Paper | 5.x | Material Design组件库 |
| 通知 | Expo Notifications | 0.27+ | 推送通知 |
| 存储 | AsyncStorage | 1.19+ | 本地数据存储 |
| 动画 | React Native Reanimated | 3.x | 高性能动画 |

#### 2.2.2 开发工具
- **TypeScript**: 类型安全
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **React Native Debugger**: 调试工具

---

## 项目结构

### 3.1 目录结构

```
小佩APP/
├── src/
│   ├── screens/                    # 页面组件
│   │   ├── Auth/
│   │   │   ├── AuthScreen.tsx
│   │   │   └── index.ts
│   │   ├── Onboarding/
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── index.ts
│   │   ├── ManualBazi/
│   │   │   ├── ManualBaziScreen.tsx
│   │   │   └── index.ts
│   │   ├── Cases/
│   │   │   ├── CasesScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   └── FilterBottomSheet.tsx
│   │   │   └── index.ts
│   │   ├── XiaoPeiHome/
│   │   │   ├── XiaoPeiHomeScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── CurrentMasterCard.tsx
│   │   │   │   ├── TopicButton.tsx
│   │   │   │   └── CommonQuestionChip.tsx
│   │   │   └── index.ts
│   │   ├── Chat/
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ThinkingBubble.tsx
│   │   │   │   ├── FollowUpSuggestions.tsx
│   │   │   │   └── ChatComposer.tsx
│   │   │   └── index.ts
│   │   ├── ChartDetail/
│   │   │   ├── ChartDetailScreen.tsx
│   │   │   ├── tabs/
│   │   │   │   ├── BasicInfoTab.tsx
│   │   │   │   ├── OverviewTab.tsx
│   │   │   │   └── FortuneTab.tsx
│   │   │   └── index.ts
│   │   ├── Me/
│   │   │   ├── MeScreen.tsx
│   │   │   ├── MyChartsScreen.tsx
│   │   │   ├── ChatHistoryScreen.tsx
│   │   │   ├── MyReadingScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── FeedbackScreen.tsx
│   │   │   └── index.ts
│   │   └── Pro/
│   │       ├── ProSubscribeScreen.tsx
│   │       └── index.ts
│   │
│   ├── components/                 # 通用组件
│   │   ├── common/                # 基础组件
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   └── EmptyState/
│   │   ├── chat/                  # 聊天相关组件
│   │   │   ├── MessageList/
│   │   │   ├── MessageItem/
│   │   │   └── ChatHeader/
│   │   └── layout/                # 布局组件
│   │       ├── Header/
│   │       ├── TabBar/
│   │       └── Container/
│   │
│   ├── navigation/                 # 导航配置
│   │   ├── AppNavigator.tsx       # 主导航器
│   │   ├── TabNavigator.tsx       # 底部导航
│   │   ├── StackNavigator.tsx     # 堆栈导航
│   │   └── types.ts               # 导航类型定义
│   │
│   ├── services/                   # 服务层
│   │   ├── api/                   # API调用
│   │   │   ├── client.ts          # API 客户端
│   │   │   ├── chatService.ts     # 聊天相关 API
│   │   │   ├── chartService.ts    # 命盘相关 API
│   │   │   ├── userService.ts     # 用户相关 API
│   │   │   └── endpoints.ts       # API 路径常量
│   │   ├── ai/                    # AI 服务（LLM 调用）
│   │   │   ├── aiService.ts       # AI 服务接口
│   │   │   └── types.ts           # AI 相关类型
│   │   ├── storage/               # 本地存储
│   │   │   ├── StorageService.ts
│   │   │   └── keys.ts
│   │   └── notifications/         # 通知服务（预留）
│   │       ├── NotificationService.ts
│   │       ├── handlers.ts
│   │       └── types.ts
│   │
│   ├── store/                      # 状态管理
│   │   ├── stores/
│   │   │   ├── userStore.ts       # 用户状态
│   │   │   ├── chartStore.ts      # 命盘状态
│   │   │   ├── chatStore.ts       # 聊天状态
│   │   │   ├── uiStore.ts         # UI 状态
│   │   │   └── notificationStore.ts  # 通知状态（预留）
│   │   └── index.ts
│   │
│   ├── hooks/                      # 自定义Hooks
│   │   ├── useNotification.ts
│   │   ├── useStorage.ts
│   │   └── useTheme.ts
│   │
│   ├── utils/                      # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   ├── constants/                  # 常量配置
│   │   ├── config.ts              # 应用配置
│   │   ├── routes.ts              # 路由常量（根据路由命名规范生成）
│   │   ├── storageKeys.ts         # 存储键常量
│   │   ├── topics.ts              # 话题配置（小佩主页用）
│   │   └── businessRules.ts       # 业务规则（验证码、频率限制等）
│   │
│   ├── types/                      # TypeScript类型定义
│   │   ├── navigation.ts          # 导航类型（RootStackParamList 等）
│   │   ├── user.ts                # 用户相关类型
│   │   ├── chart.ts               # 命盘相关类型
│   │   ├── chat.ts                # 聊天相关类型
│   │   ├── topic.ts               # 话题相关类型
│   │   └── notification.ts        # 通知相关类型（预留）
│   │
│   ├── theme/                      # 主题配置
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   │
│   └── assets/                     # 静态资源
│       ├── images/
│       ├── fonts/
│       └── icons/
│
├── app.json                        # Expo配置文件
├── app.config.js                   # Expo动态配置
├── package.json
├── tsconfig.json
├── babel.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

### 3.2 文件命名规范

- **组件文件**: PascalCase，如 `ChatScreen.tsx`
- **工具文件**: camelCase，如 `formatDate.ts`
- **常量文件**: camelCase，如 `appConfig.ts`
- **类型文件**: camelCase，如 `userTypes.ts`
- **样式文件**: camelCase + `.styles.ts`，如 `HomeScreen.styles.ts`

---

### 3.3 路由命名规范

**重要**: 所有文档中涉及路由时，请引用以下命名规范，避免硬编码字符串。

#### 3.3.1 React Navigation Screen Name

使用 **PascalCase** 命名：

- `ManualBazi` - 手動排盤頁面
- `Chat` - 聊天頁面
- `ChartDetail` - 命盤詳情頁面
- `XiaoPeiHome` - 小佩主页
- `Cases` - 檔案列表頁面
- `MyHome` - 我的主页
- `MyCharts` - 我的命盘列表
- `ChatHistory` - 聊天记录页面
- `MyReading` - 我的解读页面
- `ProSubscribe` - 小佩 Pro 订阅页面
- `Settings` - 设置页面
- `Feedback` - 意见反馈页面

**使用示例**:
```typescript
// ✅ 正确
navigation.navigate('Chat', { conversationId: 'xxx' });
navigation.navigate('ManualBazi', { from: 'cases' });

// ❌ 错误（硬编码字符串）
navigation.navigate('chat', { conversationId: 'xxx' });
navigation.navigate('manual-bazi', { from: 'cases' });
```

#### 3.3.2 DeepLink / Web Path

使用 **kebab-case** 命名：

- `/my/charts` - 我的命盘列表
- `/my/reading` - 我的解读
- `/chat/history` - 聊天记录
- `/pro/center` - 小佩 Pro 中心
- `/pro/subscribe` - 小佩 Pro 订阅
- `/settings` - 设置
- `/feedback` - 意见反馈

**使用示例**:
```typescript
// DeepLink 示例
const deepLink = 'xiaopei://my/charts';
const webPath = '/my/charts';
```

#### 3.3.3 路由常量文件（可选）

开发时可以让 Cursor 根据本规范自动生成 `src/constants/routes.ts` 文件：

```typescript
// src/constants/routes.ts
// 此文件可由 Cursor 根据路由命名规范自动生成

export const ROUTES = {
  // React Navigation Screen Names (PascalCase)
  ManualBazi: 'ManualBazi',
  Chat: 'Chat',
  ChartDetail: 'ChartDetail',
  XiaoPeiHome: 'XiaoPeiHome',
  Cases: 'Cases',
  MyHome: 'MyHome',
  MyCharts: 'MyCharts',
  ChatHistory: 'ChatHistory',
  MyReading: 'MyReading',
  ProSubscribe: 'ProSubscribe',
  Settings: 'Settings',
  Feedback: 'Feedback',
  
  // DeepLink / Web Paths (kebab-case)
  DEEP_LINKS: {
    MyCharts: '/my/charts',
    MyReading: '/my/reading',
    ChatHistory: '/chat/history',
    ProCenter: '/pro/center',
    ProSubscribe: '/pro/subscribe',
    Settings: '/settings',
    Feedback: '/feedback',
  },
} as const;
```

**使用示例**:
```typescript
import { ROUTES } from '@/constants/routes';

// ✅ 使用常量，避免硬编码
navigation.navigate(ROUTES.Chat, { conversationId: 'xxx' });
navigation.navigate(ROUTES.ManualBazi, { from: 'cases' });
```

> **注意**: `routes.ts` 文件不是必须的，但建议在代码中使用常量而非硬编码字符串。Cursor 可以根据本规范自动生成此文件。

---

## 开发环境配置

### 4.1 系统要求

#### macOS (推荐)
- macOS 12.0+
- Xcode 14.0+ (iOS开发)
- Android Studio (Android开发)
- Node.js 18.x 或更高
- npm 或 yarn

#### Windows
- Windows 10+
- Android Studio
- Node.js 18.x 或更高
- (无法开发iOS，需macOS)

### 4.2 环境变量配置

#### 4.2.1 环境变量规范
所有环境变量必须使用 `XIAOPEI_` 前缀，遵循项目规范。

#### 4.2.2 开发环境变量 (.env.development)
```env
# App配置
XIAOPEI_APP_PORT=3001
XIAOPEI_APP_ENV=development

# 通知配置（预留，界面开发阶段暂不使用）
XIAOPEI_FCM_SERVER_KEY=
XIAOPEI_APNS_KEY_ID=
XIAOPEI_NOTIFICATION_ENDPOINT=

# API配置（预留）
XIAOPEI_API_BASE_URL=
XIAOPEI_API_TIMEOUT=30000
```

#### 4.2.3 生产环境变量 (.env.production)
```env
XIAOPEI_APP_PORT=3001
XIAOPEI_APP_ENV=production
# ... 其他生产环境配置
```

### 4.3 安装步骤

#### 步骤1: 安装Node.js和包管理器
```bash
# 检查Node版本
node --version  # 应 >= 18.0.0

# 安装yarn（推荐）
npm install -g yarn
```

#### 步骤2: 安装Expo CLI
```bash
npm install -g expo-cli
# 或
yarn global add expo-cli
```

#### 步骤3: 安装iOS依赖（仅macOS）
```bash
# 安装CocoaPods
sudo gem install cocoapods
```

#### 步骤4: 安装Android Studio
- 下载并安装 Android Studio
- 配置 Android SDK
- 设置环境变量 `ANDROID_HOME`

#### 步骤5: 初始化项目
```bash
# 使用Expo创建项目
npx create-expo-app 小佩APP --template

# 进入项目目录
cd 小佩APP

# 安装依赖
yarn install
```

### 4.4 开发工具配置

#### 4.4.1 TypeScript配置 (tsconfig.json)
- 严格模式启用
- 路径别名配置
- React Native类型支持

#### 4.4.2 ESLint配置
- React Native规则
- TypeScript规则
- 代码风格统一

#### 4.4.3 Prettier配置
- 2空格缩进
- 单引号
- 尾随逗号

---

## 本地数据库配置

### 5.1 MySQL 安装信息

#### 5.1.1 当前环境配置
根据本地环境检测，MySQL 已安装并运行：

- **MySQL 版本**: 9.5.0
- **安装方式**: Homebrew
- **服务状态**: 运行中
- **端口**: 3306
- **绑定地址**: 127.0.0.1 (localhost)
- **安装路径**: `/opt/homebrew/bin/mysql`
- **配置文件**: `/opt/homebrew/etc/my.cnf`

#### 5.1.2 服务管理命令
```bash
# 启动 MySQL 服务
brew services start mysql

# 停止 MySQL 服务
brew services stop mysql

# 重启 MySQL 服务
brew services restart mysql

# 查看服务状态
brew services list | grep mysql
```

### 5.2 数据库连接配置

#### 5.2.1 连接信息
- **主机**: 127.0.0.1 或 localhost
- **端口**: 3306
- **默认用户**: root
- **字符集**: utf8mb4 (推荐)

#### 5.2.2 环境变量配置
在 `.env.development` 文件中添加数据库配置：

```env
# MySQL 数据库配置
XIAOPEI_MYSQL_HOST=127.0.0.1
XIAOPEI_MYSQL_PORT=3306
XIAOPEI_MYSQL_USER=root
XIAOPEI_MYSQL_PASSWORD=
XIAOPEI_MYSQL_DATABASE=xiaopei_app
XIAOPEI_MYSQL_CHARSET=utf8mb4
XIAOPEI_MYSQL_POOL_MIN=2
XIAOPEI_MYSQL_POOL_MAX=10
```

#### 5.2.3 连接测试
```bash
# 测试连接（无密码）
mysql -u root -h 127.0.0.1 -P 3306

# 测试连接（有密码）
mysql -u root -p -h 127.0.0.1 -P 3306

# 查看版本
mysql --version
```

### 5.3 数据库初始化

#### 5.3.1 创建应用数据库
```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS xiaopei_app 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE xiaopei_app;

-- 查看数据库
SHOW DATABASES;
```

#### 5.3.2 创建应用专用用户（推荐）
```sql
-- 创建用户
CREATE USER 'xiaopei_app'@'localhost' IDENTIFIED BY 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON xiaopei_app.* TO 'xiaopei_app'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户
SELECT User, Host FROM mysql.user WHERE User = 'xiaopei_app';
```

### 5.4 数据库表结构设计（预留）

#### 5.4.1 用户相关表
```sql
-- 用户表（示例，根据实际需求调整）
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5.4.2 聊天记录表（示例）
```sql
-- 聊天记录表（示例，根据实际需求调整）
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  message TEXT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5.5 React Native 连接 MySQL

#### 5.5.1 注意事项
⚠️ **重要提示**: React Native 应用**不能直接连接 MySQL**，因为：
- React Native 运行在移动设备上，无法直接访问本地 MySQL
- 移动应用应通过 API 与后端服务通信
- 本地 MySQL 主要用于开发测试或作为后端服务的数据存储

#### 5.5.2 推荐架构
```
┌─────────────┐
│  React      │
│  Native App │
└──────┬──────┘
       │ HTTP/HTTPS
       │ API 请求
┌──────▼──────┐
│  Backend    │
│  API Server │  (Core 系统，端口 3000)
└──────┬──────┘
       │ SQL 查询
┌──────▼──────┐
│   MySQL     │
│  Database   │  (本地，端口 3306)
└─────────────┘
```

#### 5.5.3 开发阶段使用场景
1. **本地开发测试**: 后端 API 服务连接本地 MySQL
2. **数据模拟**: 使用本地 MySQL 存储测试数据
3. **接口开发**: 后端开发时使用本地数据库

### 5.6 数据库管理工具推荐

#### 5.6.1 命令行工具
- **mysql**: MySQL 官方命令行客户端（已安装）
- **mycli**: 增强型 MySQL 命令行工具

#### 5.6.2 图形化工具
- **MySQL Workbench**: MySQL 官方图形化管理工具
- **Sequel Pro**: macOS 平台 MySQL 管理工具（已停止维护）
- **Sequel Ace**: Sequel Pro 的社区维护版本
- **TablePlus**: 现代化数据库管理工具（支持多种数据库）
- **DBeaver**: 免费开源的通用数据库工具

#### 5.6.3 VS Code 插件
- **MySQL**: VS Code 的 MySQL 管理插件
- **SQLTools**: 通用 SQL 工具插件

### 5.7 数据库备份与恢复

#### 5.7.1 备份数据库
```bash
# 备份整个数据库
mysqldump -u root xiaopei_app > backup_$(date +%Y%m%d).sql

# 备份特定表
mysqldump -u root xiaopei_app users chat_messages > tables_backup.sql

# 压缩备份
mysqldump -u root xiaopei_app | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### 5.7.2 恢复数据库
```bash
# 恢复数据库
mysql -u root xiaopei_app < backup_20240101.sql

# 从压缩文件恢复
gunzip < backup_20240101.sql.gz | mysql -u root xiaopei_app
```

### 5.8 常见问题

#### Q1: 无法连接到 MySQL？
**A**: 
- 检查服务是否运行: `brew services list | grep mysql`
- 检查端口是否被占用: `lsof -i :3306`
- 检查防火墙设置
- 确认绑定地址为 127.0.0.1

#### Q2: 忘记 root 密码？
**A**: 
```bash
# 停止 MySQL 服务
brew services stop mysql

# 以安全模式启动
mysqld_safe --skip-grant-tables &

# 重置密码
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# 重启服务
brew services restart mysql
```

#### Q3: 如何查看 MySQL 日志？
**A**: 
- 错误日志: `/opt/homebrew/var/mysql/*.err`
- 慢查询日志: 在 `my.cnf` 中配置 `slow_query_log`

---

## 核心功能模块

### 6.1 应用入口与认证

#### 6.1.1 登录/注册页面 (AuthScreen)
**参考文档**: `注册登录设计文档.md`

**功能描述**:
- 统一的登录和注册入口
- 支持手机号/邮箱登录
- 支持验证码/密码验证
- 首次登录即自动注册
- 第三方登录（微信/支付宝/Google）

**关键特性**:
- 单页面架构（登录/注册共用）
- 根据 `app_region` 绑定语言（CN/HK）
- 验证码策略（60秒/次，10次/天，有效期10分钟）

**路由**: `Auth`

---

#### 6.1.2 用户引导页 (OnboardingScreen)
**参考文档**: `用户引导页设计文档.md`

**功能描述**:
- 新用户首次进入的页面
- 提供两种输入方式：聊天方式 / 手动排盘
- 引导用户填写出生信息

**关键特性**:
- 选择输入方式后跳转到对应页面
- 完成后进入底部导航主界面

**路由**: `Onboarding`

---

### 6.2 底部导航主界面

#### 6.2.1 底部导航组件 (XiaoPeiTabBar)
**参考文档**: `底部导航设计文档.md`

**功能描述**:
- 四个 Tab：排盤、檔案、小佩、我的
- 中间「小佩」Tab 为悬浮按钮样式
- 支持 Tab 切换和状态管理

**关键特性**:
- 小佩按钮进场动画和点击动画
- 触觉反馈（iOS/Android）
- 安全区域适配

---

#### 6.2.2 排盤 Tab → 手動排盤頁 (ManualBaziScreen)
**参考文档**: `出生信息輸入-手動排盤.md`

**功能描述**:
- 手动填写出生信息表单
- 日期+时间合并选择器
- 真太阳时开关
- 排盘引擎调用

**路由**: `ManualBazi`（全屏，不显示底部导航）

**关键特性**:
- 表单验证
- 支持从不同入口进入（`from` 参数）
- 排盘完成后跳转到命盤詳情頁

---

#### 6.2.3 檔案 Tab → 命盤列表頁 (CasesScreen)
**参考文档**: `檔案－命盤列表設計文檔.md`

**功能描述**:
- 展示所有命盤檔案列表
- 区分「正在查看」（當前命主）和「全部命盤」
- 支持搜索、筛选、排序
- 支持新增、编辑、删除命盤

**路由**: `Cases`（显示底部导航）

**关键特性**:
- 点击卡片进入命盤詳情頁
- 支持切换當前命主
- 空状态和無結果狀態处理

---

#### 6.2.4 小佩 Tab → 小佩主页 (XiaoPeiHomeScreen)
**参考文档**: `小佩主页设计文档.md`

**功能描述**:
- 意图选择页 + 问题入口页
- 展示当前命主信息
- 提供 6 个话题入口
- 提供「大家常问」示例问题
- 提供自由输入框

**路由**: `XiaoPeiHome`（显示底部导航）

**关键特性**:
- 不调用 LLM，只收集意图
- 跳转到聊天页时传递参数（topic, question, source）

---

#### 6.2.5 我的 Tab → 我的主页 (MeScreen)
**参考文档**: `我的-一级设计文档.md`

**功能描述**:
- 个人中心主页
- 展示用户信息和命主信息
- 提供功能入口（我的命理、小佩服务、工具与帮助）

**路由**: `Me`（显示底部导航）

**关键特性**:
- 分组展示功能入口
- 支持跳转到多个二级页面

---

### 6.3 全屏功能页面

#### 6.3.1 聊天页 (ChatScreen)
**参考文档**: `聊天页设计文档（公共组件版）.md`

**功能描述**:
- 公共聊天组件，被所有聊天入口复用
- 当前会话消息展示
- 消息输入与发送
- LLM 调用（首轮 & 多轮）
- 追问建议
- 等待状态反馈（思考中气泡）

**路由**: `Chat`（全屏，不显示底部导航）

**关键特性**:
- 只负责当前会话，不管理历史对话列表
- 支持多入口（小佩主页、命盘总览、神煞弹窗等）
- 顶部栏右侧预留历史快捷入口位置（第一期不实现）

**入口来源**:
- `xiaopei_topic_button` - 小佩主页话题按钮
- `xiaopei_common_question` - 小佩主页大家常问
- `xiaopei_free_input` - 小佩主页自由输入
- `overview_card` - 命盘总览一键解读
- `shen_sha_popup` - 神煞解读弹窗
- `history` - 历史对话入口

---

#### 6.3.2 命盤詳情頁 (ChartDetailScreen)
**参考文档**: `基本信息设计文档.md`, `命盤總覽设计文档.md`

**功能描述**:
- 展示命盤的详细信息
- 包含三个 Tab：基本信息、命盤總覽、大運流年

**路由**: `ChartDetail`（全屏，不显示底部导航）

**Tab 1: 基本信息**
- 命盤檔案信息
- 日主概覽
- 五行分佈统计
- 含藏干统计
- 身強身弱參考
- 喜忌用神

**Tab 2: 命盤總覽**
- 基礎命盤表格（参考 `基礎命盤表格設計.md`）
- 高階指標 & 標籤（命局體質、結構格局、體用喜忌等）
- 一鍵解讀功能（跳转聊天页）

**Tab 3: 大運流年**（预留）
- 大运流年展示

**关键特性**:
- 神煞可点击，弹出解读弹窗（参考 `神煞解讀彈窗設計.md`）
- 卡片可点击，一键解讀跳转聊天页

---

#### 6.3.3 手動排盤頁 (ManualBaziScreen)
**参考文档**: `出生信息輸入-手動排盤.md`

**功能描述**:
- 手动填写出生信息
- 日期时间选择
- 地点选择
- 真太阳时开关
- 排盘引擎调用

**路由**: `ManualBazi`（全屏，不显示底部导航）

**关键特性**:
- 支持从不同入口进入（`from` 参数：`cases`, `account` 等）
- 排盘完成后跳转到命盤詳情頁

---

### 6.4 我的模块二级页面

#### 6.4.1 我的命盘 (MyChartsScreen)
**参考文档**: `我的-二级-命盘相关设计文档.md`

**功能描述**:
- 命主列表展示
- 添加新命主（复用手動排盤頁）
- 查看命盘

**路由**: `MyCharts`（全屏，不显示底部导航）

---

#### 6.4.2 我的解读 (MyReadingScreen)
**参考文档**: `我的-二级-内容查看页面设计文档.md`

**功能描述**:
- 解读归档列表
- 按主题筛选
- 查看解读详情

**路由**: `MyReading`（全屏，不显示底部导航）

---

#### 6.4.3 聊天记录 (ChatHistoryScreen)
**参考文档**: `我的-二级-内容查看页面设计文档.md`

**功能描述**:
- 历史对话列表（集中管理）
- 支持查看、删除历史对话
- 支持按命主、日期筛选
- 点击进入聊天页加载对应会话

**路由**: `ChatHistory`（全屏，不显示底部导航）

**关键特性**:
- 第一期实现：查看和删除
- 支持左滑删除（iOS 风格）或长按删除（Android 风格）

---

#### 6.4.4 小佩 Pro 订阅 (ProSubscribeScreen)
**参考文档**: `小佩Pro-订阅页面设计文档.md`

**功能描述**:
- Pro 订阅页面
- 当前状态展示
- Pro 功能介绍
- 价格方案
- 订阅管理

**路由**: `ProSubscribe`（全屏，不显示底部导航）

---

#### 6.4.5 设置 (SettingsScreen)
**参考文档**: `我的-二级-邀请好友和设置设计文档.md`

**功能描述**:
- 应用设置
- 通知设置
- 语言设置（根据 app_region）
- 关于信息

**路由**: `Settings`（全屏，不显示底部导航）

---

#### 6.4.6 意见反馈 (FeedbackScreen)
**参考文档**: `我的-二级-意见反馈和客服设计文档.md`

**功能描述**:
- 意见反馈表单
- 联系客服（弹窗）

**路由**: `Feedback`（全屏，不显示底部导航）

---

### 6.5 特殊功能页面

#### 6.5.1 聊天方式输入出生信息 (ChatInputScreen)
**参考文档**: `出生信息輸入-聊天.md`

**功能描述**:
- 通过聊天方式收集出生信息
- NLP 解析自然语言输入
- 逐步完善信息
- 完成后跳转排盘

**路由**: `ChatInput`（全屏，不显示底部导航）

**关键特性**:
- 条件显示「完成排盘」按钮
- 支持信息更新和修正

---

#### 6.5.2 神煞解读弹窗 (ShenShaBottomSheet)
**参考文档**: `神煞解讀彈窗設計.md`

**功能描述**:
- 神煞解读 Bottom Sheet
- 展示神煞信息和解讀
- 推荐提问
- 一键解讀跳转聊天页

**组件类型**: Bottom Sheet（非独立页面）

**关键特性**:
- 伪流式动画
- 支持点击推荐提问跳转聊天页

### 6.6 组件模块

#### 6.6.1 通用组件
**参考文档**: `UI_SPEC.md`

- **Button**: 按钮组件（PrimaryButton, SecondaryButton, TextButton）
- **Input**: 输入框组件（TextInput, TextArea）
- **Card**: 卡片容器
- **Chip**: 标签组件
- **Loading**: 加载指示器
- **EmptyState**: 空状态提示
- **Modal**: 模态框
- **BottomSheet**: 底部抽屉
- **Toast**: 提示消息

**设计规范**:
- 所有组件必须遵循 `UI_SPEC.md` 中的设计规范
- 使用 Design Tokens（colors, typography, spacing, radius, shadows）
- 禁止硬编码颜色、字号、间距等

---

#### 6.6.2 聊天组件
**参考文档**: `聊天页设计文档（公共组件版）.md`

- **MessageBubble**: 消息气泡（用户/小佩）
- **MessageList**: 消息列表容器
- **ChatComposer**: 输入框组件
- **ThinkingBubble**: 思考中气泡
- **FollowUpSuggestions**: 追问建议组件
- **ChatHeader**: 聊天页面头部
- **ErrorToast**: 错误提示组件

**关键特性**:
- 用户消息：右对齐，深色背景，白色文字
- 小佩消息：左对齐，浅色背景，深色文字，左侧头像
- 思考中气泡：温和的等待反馈

---

#### 6.6.3 布局组件
**参考文档**: `底部导航设计文档.md`, `UI_SPEC.md`

- **XiaoPeiTabBar**: 底部导航栏（自定义 TabBar）
- **Header**: 通用头部
- **Container**: 页面容器
- **SafeAreaView**: 安全区域容器

---

#### 6.6.4 命盘相关组件
**参考文档**: `基礎命盤表格設計.md`, `神煞解讀彈窗設計.md`

- **BaziTable**: 基础命盘表格
- **ShenShaRow**: 神煞行组件
- **ShenShaBottomSheet**: 神煞解读弹窗
- **OverviewCard**: 命盘总览卡片
- **ProfileCard**: 命盤卡片（檔案列表用）

### 6.7 状态管理模块

#### 6.7.1 Store结构
```
store/
├── userStore.ts          # 用户信息状态
├── chartStore.ts         # 命盘状态（当前命主、命盘列表等）
├── chatStore.ts          # 聊天状态（当前会话）
├── navigationStore.ts    # 导航状态（可选）
├── notificationStore.ts  # 通知状态（预留）
└── uiStore.ts            # UI状态（主题、语言等）
```

#### 6.7.2 状态设计

**用户状态 (userStore)**:
```typescript
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  appRegion: 'CN' | 'HK';  // 决定语言和登录方式
  preferences: UserPreferences;
}
```

**命盘状态 (chartStore)**:
```typescript
interface ChartState {
  currentMasterId: string | null;  // 当前命主 ID
  profiles: ChartProfile[];        // 命盘列表
  currentChart: BaziChart | null;  // 当前命盘数据
}
```

**聊天状态 (chatStore)**:
```typescript
interface ChatState {
  currentConversationId: string | null;
  messages: ChatMessage[];
  status: 'idle' | 'loading' | 'error';
  followUps: string[];
}
```

**UI状态 (uiStore)**:
```typescript
interface UIState {
  theme: 'light' | 'dark';  // 预留
  language: 'zh-CN' | 'zh-HK';
  bottomSheetVisible: boolean;
}
```

---

## UI/UX 设计规范

> **重要**: 所有 UI 设计必须严格遵循 `UI_SPEC.md` 中的设计规范。本文档仅提供概览，详细规范请参考 `UI_SPEC.md`。

### 7.1 设计系统

**参考文档**: `UI_SPEC.md`

#### 7.1.1 颜色系统
**使用 Design Tokens**: `src/theme/colors.ts`

```typescript
// 所有颜色必须从 colors.ts 导入
import { colors } from '@/theme';

// ✅ 正确
backgroundColor: colors.bg
textColor: colors.ink

// ❌ 错误（硬编码）
backgroundColor: '#FFFFFF'
textColor: '#32343a'
```

**主要颜色**:
- `colors.ink` - 主文字（#32343a）
- `colors.textSecondary` - 次文字（#6b7280）
- `colors.brandGreen` - 粉绿（#83cbac）
- `colors.brandBlue` - 晚波藍（#648e93）
- `colors.brandOrange` - 莓鶯紅（#f9723d）
- `colors.bg` - 页面背景（#ffffff）
- `colors.cardBg` - 卡片背景（#ffffff）
- `colors.border` - 边框/分割线（#e5e7eb）

详见 `UI_SPEC.md` 和 `src/theme/colors.ts`。
```typescript
// 主色调
primary: '#6200EE'        // 主色
primaryDark: '#3700B3'    // 主色深色
primaryLight: '#BB86FC'   // 主色浅色

// 辅助色
secondary: '#03DAC6'      // 辅助色
accent: '#FF6B6B'         // 强调色

// 中性色
background: '#FFFFFF'     // 背景色
surface: '#F5F5F5'        // 表面色
text: '#212121'           // 文本色
textSecondary: '#757575'  // 次要文本

// 状态色
success: '#4CAF50'
warning: '#FF9800'
error: '#F44336'
info: '#2196F3'
```

#### 7.1.2 字体系统
```typescript
// 字体大小
fontSizes: {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
}

// 字体粗细
fontWeights: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

// 行高
lineHeights: {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
}
```

#### 7.1.3 间距系统
```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}
```

#### 7.1.4 圆角系统
```typescript
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

### 7.2 组件设计规范

#### 7.2.1 按钮规范
- **主要按钮**: 填充主色，白色文字
- **次要按钮**: 边框主色，主色文字
- **文本按钮**: 无背景，主色文字
- **禁用状态**: 降低透明度，禁用交互

#### 7.2.2 输入框规范
- 统一高度: 48px
- 圆角: 8px
- 边框: 1px 灰色
- 聚焦状态: 边框变为主色
- 错误状态: 边框变为红色

#### 7.2.3 卡片规范
- 背景: 白色
- 圆角: 12px
- 阴影: 轻微阴影
- 内边距: 16px

### 7.3 响应式设计

#### 7.3.1 屏幕适配
- 使用 `Dimensions` API 获取屏幕尺寸
- 使用百分比或 `flex` 布局
- 关键尺寸使用 `PixelRatio` 处理

#### 7.3.2 安全区域
- iOS: 使用 `SafeAreaView` 处理刘海屏
- Android: 使用 `StatusBar` 处理状态栏

### 7.4 Logo 与品牌标识

**参考文档**: `UI_SPEC.md` 3. Logo 与品牌標識

- 使用官方 Logo 和头像版本
- 聊天页小佩头像必须使用官方 Logo 头像版本
- 遵循 Logo 使用规范（比例、留白、颜色等）

### 7.5 主题切换（预留）

#### 7.5.1 主题模式
- 浅色主题（默认，当前版本）
- 深色主题（预留，后续实现）

#### 7.5.2 主题实现
- 使用 Zustand 管理主题状态
- 所有颜色从主题配置读取
- 支持系统主题跟随（预留）

---

## 通知功能实现

### 8.1 通知架构

```
┌─────────────────┐
│  Push Server    │  (后端Core系统，预留)
└────────┬────────┘
         │
         │ Push Notification
         │
┌────────▼────────┐
│  Expo Push      │
│  Notification   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ iOS   │ │Android│
│ APNs  │ │  FCM  │
└───────┘ └───────┘
```

### 8.2 通知功能模块

#### 8.2.1 通知服务 (NotificationService)
**职责**:
- 注册设备Token
- 请求通知权限
- 处理通知接收
- 处理通知点击
- 管理本地通知

**主要方法**:
- `registerForPushNotifications()`: 注册推送通知
- `getExpoPushTokenAsync()`: 获取Expo推送Token
- `scheduleLocalNotification()`: 安排本地通知
- `cancelAllNotifications()`: 取消所有通知
- `setNotificationHandler()`: 设置通知处理器

#### 8.2.2 通知类型定义
```typescript
// 通知数据类型
interface NotificationData {
  type: 'chat' | 'system' | 'reminder';
  chatId?: string;
  message?: string;
  action?: string;
}

// 通知内容
interface NotificationContent {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: boolean;
  badge?: number;
}
```

### 8.3 Android通知配置

#### 8.3.1 通知渠道
- **聊天通知**: 高优先级，声音+震动
- **系统通知**: 默认优先级，仅声音
- **提醒通知**: 低优先级，静音

#### 8.3.2 权限配置
- `android.permission.POST_NOTIFICATIONS` (Android 13+)
- `android.permission.VIBRATE`
- `android.permission.RECEIVE_BOOT_COMPLETED`

### 8.4 iOS通知配置

#### 8.4.1 权限请求
- 首次启动时请求通知权限
- 支持临时授权和永久授权
- 处理权限拒绝情况

#### 8.4.2 通知能力
- 横幅通知
- 声音通知
- 角标管理
- 锁屏通知

### 8.5 通知处理流程

#### 8.5.1 接收通知
1. 应用在前台: 自定义UI显示
2. 应用在后台: 系统通知栏显示
3. 应用已关闭: 系统通知栏显示

#### 8.5.2 点击通知
1. 解析通知数据
2. 根据类型跳转相应页面
3. 传递相关参数
4. 更新应用状态

#### 8.5.3 通知交互
- 点击打开应用/特定页面
- 滑动删除
- 操作按钮（如"回复"）

### 8.6 环境变量（预留）

```env
# FCM配置（Android）
XIAOPEI_FCM_SERVER_KEY=your_fcm_server_key

# APNs配置（iOS）
XIAOPEI_APNS_KEY_ID=your_apns_key_id
XIAOPEI_APNS_TEAM_ID=your_team_id
XIAOPEI_APNS_BUNDLE_ID=com.xiaopei.app

# 推送服务端点
XIAOPEI_NOTIFICATION_ENDPOINT=https://api.xiaopei.com/notifications
```

---

## 开发流程

### 9.1 开发阶段划分

#### 阶段一: 项目初始化 (1-2天)
- [ ] 创建React Native项目
- [ ] 配置TypeScript
- [ ] 配置ESLint和Prettier
- [ ] 搭建项目目录结构
- [ ] 配置导航结构
- [ ] 配置主题系统

#### 阶段二: 基础组件开发 (3-5天)
- [ ] 开发通用组件（Button, Input, Card等）
- [ ] 开发布局组件（Header, Container等）
- [ ] 建立组件文档
- [ ] 组件单元测试

#### 阶段三: 页面开发 (5-7天)
- [ ] 首页开发
- [ ] AI对话页面开发
- [ ] 个人中心页面开发
- [ ] 历史记录页面开发
- [ ] 设置页面开发

#### 阶段四: 状态管理集成 (2-3天)
- [ ] 配置状态管理库
- [ ] 实现用户状态管理
- [ ] 实现聊天状态管理
- [ ] 实现UI状态管理

#### 阶段五: 通知功能开发 (3-4天)
- [ ] 配置推送通知服务
- [ ] 实现通知权限管理
- [ ] 实现通知接收处理
- [ ] 实现通知点击跳转
- [ ] Android/iOS平台测试

#### 阶段六: 优化与测试 (3-5天)
- [ ] 性能优化
- [ ] 内存优化
- [ ] 跨平台适配测试
- [ ] UI/UX优化
- [ ] 兼容性测试

### 9.3 开发规范

#### 9.3.1 代码提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

**示例**:
- `feat: 实现聊天页思考中气泡`
- `fix: 修复命盘列表搜索功能`
- `docs: 更新路由命名规范`

#### 9.3.2 分支管理
- `main`: 主分支，生产环境
- `develop`: 开发分支
- `feature/*`: 功能分支（如 `feature/chat-page`）
- `fix/*`: 修复分支（如 `fix/navigation-bug`）

#### 9.3.3 代码审查要点
- ✅ TypeScript 类型完整（禁止使用 `any`）
- ✅ 符合 ESLint 规则
- ✅ 遵循 UI_SPEC.md 设计规范（使用 Design Tokens）
- ✅ 遵循路由命名规范（使用 PascalCase）
- ✅ UI 在不同设备上正常显示
- ✅ 代码注释清晰
- ✅ 组件可复用性

#### 9.3.4 命名规范

**路由命名**: 参考「3.3 路由命名规范」
- React Navigation: PascalCase（如 `Chat`, `ManualBazi`）
- DeepLink: kebab-case（如 `/my/charts`）

**文件命名**: 参考「3.2 文件命名规范」
- 组件: PascalCase（如 `ChatScreen.tsx`）
- 工具: camelCase（如 `formatDate.ts`）

**变量命名**: camelCase
- 组件 Props: PascalCase（如 `ChatPageProps`）
- 函数/变量: camelCase（如 `handleSendMessage`）

#### 9.3.5 设计规范遵循

**必须遵守**:
- ✅ 所有颜色使用 `colors` Design Tokens
- ✅ 所有字号使用 `typography` Design Tokens
- ✅ 所有间距使用 `layout.spacing` Design Tokens
- ✅ 所有圆角使用 `layout.radius` Design Tokens
- ✅ 所有阴影使用 `layout.shadows` Design Tokens
- ✅ 禁止硬编码颜色、字号、间距等

**检查清单**:
- [ ] 代码中无 `'#xxxxxx'` 硬编码颜色
- [ ] 代码中无 `fontSize: 16` 硬编码字号
- [ ] 代码中无 `padding: 10` 硬编码间距
- [ ] 所有 UI 数值都来自 Design Tokens

---

## 测试策略

### 10.1 测试类型

#### 10.1.1 单元测试
- **工具**: Jest + React Native Testing Library
- **覆盖范围**: 工具函数、Hooks、纯函数组件
- **目标覆盖率**: 60%+

#### 10.1.2 组件测试
- **工具**: React Native Testing Library
- **覆盖范围**: 通用组件、业务组件
- **测试内容**: 渲染、交互、状态变化

#### 10.1.3 集成测试
- **工具**: Detox (可选)
- **覆盖范围**: 关键用户流程
- **测试场景**: 登录流程、对话流程、通知流程

#### 10.1.4 手动测试
- **设备测试**: 真机测试（iOS/Android）
- **版本测试**: 不同系统版本
- **屏幕测试**: 不同屏幕尺寸

### 10.2 测试设备清单

#### iOS设备
- iPhone SE (小屏)
- iPhone 14 Pro (标准屏)
- iPhone 14 Pro Max (大屏)
- iPad (平板，如支持)

#### Android设备
- 小屏手机 (5.0" - 5.5")
- 标准手机 (5.5" - 6.0")
- 大屏手机 (6.0"+)
- 不同Android版本 (8.0, 10.0, 12.0, 14.0)

### 10.3 测试检查清单

#### 功能测试
- [ ] 所有页面正常显示
- [ ] 导航功能正常
- [ ] 输入功能正常
- [ ] 按钮点击响应正常
- [ ] 数据存储正常

#### 通知测试
- [ ] 通知权限请求正常
- [ ] 接收推送通知正常
- [ ] 点击通知跳转正常
- [ ] 本地通知正常
- [ ] 通知角标更新正常

#### 兼容性测试
- [ ] iOS 12.0+ 兼容
- [ ] Android 5.0+ 兼容
- [ ] 不同屏幕尺寸适配
- [ ] 横竖屏切换（如支持）

#### 性能测试
- [ ] 应用启动时间 < 3秒
- [ ] 页面切换流畅
- [ ] 列表滚动流畅
- [ ] 内存使用合理
- [ ] 无内存泄漏

---

## 构建与部署

### 11.1 构建配置

#### 11.1.1 Android构建
- **构建工具**: Gradle
- **签名配置**: 使用密钥库文件
- **构建类型**: Debug / Release
- **目标SDK**: 33+
- **最低SDK**: 21 (Android 5.0)

#### 11.1.2 iOS构建
- **构建工具**: Xcode
- **签名配置**: 使用开发者证书
- **构建配置**: Debug / Release
- **目标版本**: iOS 12.0+
- **部署目标**: iOS 12.0

### 11.2 构建流程

#### 11.2.1 开发构建
```bash
# Android
yarn android

# iOS
yarn ios

# Expo Go
expo start
```

#### 11.2.2 生产构建
```bash
# 使用EAS Build
eas build --platform android
eas build --platform ios

# 或使用本地构建
# Android
cd android && ./gradlew assembleRelease

# iOS
# 使用Xcode Archive
```

### 11.3 版本管理

#### 11.3.1 版本号规范
- **格式**: `主版本号.次版本号.修订号`
- **示例**: `1.0.0`
- **主版本**: 重大更新
- **次版本**: 功能更新
- **修订号**: Bug修复

#### 11.3.2 版本更新流程
1. 更新 `package.json` 版本号
2. 更新 `app.json` 版本号
3. 更新 Android `build.gradle` 版本
4. 更新 iOS `Info.plist` 版本
5. 提交代码并打Tag

### 11.4 发布渠道

#### 11.4.1 Android发布
- **Google Play Store**: 正式发布渠道
- **内部测试**: Alpha测试
- **封闭测试**: Beta测试
- **开放测试**: 公测

#### 11.4.2 iOS发布
- **App Store**: 正式发布渠道
- **TestFlight**: 内测渠道
- **Ad Hoc**: 特定设备测试
- **Enterprise**: 企业内部分发

---

## 常见问题

### 12.1 开发问题

#### Q1: Expo项目如何添加原生模块？
**A**: 使用 `expo prebuild` 生成原生代码，然后可以添加原生模块。或使用 `expo install` 安装Expo兼容的包。

#### Q2: 如何处理Android和iOS的UI差异？
**A**: 使用 `Platform.OS` 判断平台，为不同平台提供不同的样式或组件。

#### Q3: 如何调试React Native应用？
**A**: 
- 使用React Native Debugger
- 使用Chrome DevTools
- 使用Flipper
- 使用 `console.log` 和断点

#### Q4: 如何处理长列表性能问题？
**A**: 
- 使用 `FlatList` 或 `SectionList`
- 设置 `getItemLayout` 优化滚动
- 使用 `removeClippedSubviews`
- 合理设置 `initialNumToRender` 和 `windowSize`

### 12.2 通知问题

#### Q1: iOS通知不显示？
**A**: 
- 检查通知权限是否授予
- 检查APNs证书配置
- 检查设备是否开启勿扰模式
- 检查应用是否在前台（前台需自定义显示）

#### Q2: Android通知不显示？
**A**: 
- 检查通知权限（Android 13+需要）
- 检查通知渠道是否创建
- 检查应用是否被系统杀死
- 检查FCM配置是否正确

#### Q3: 通知点击无响应？
**A**: 
- 检查通知处理器是否正确设置
- 检查导航配置是否正确
- 检查通知数据格式是否正确

### 12.3 构建问题

#### Q1: Android构建失败？
**A**: 
- 检查Gradle版本兼容性
- 检查Android SDK版本
- 检查依赖冲突
- 清理构建缓存: `cd android && ./gradlew clean`

#### Q2: iOS构建失败？
**A**: 
- 检查Xcode版本
- 检查CocoaPods依赖: `cd ios && pod install`
- 检查签名配置
- 检查最低部署版本

---

## 附录

### A. 参考资源

#### 官方文档
- [React Native官方文档](https://reactnative.dev/)
- [Expo官方文档](https://docs.expo.dev/)
- [React Navigation文档](https://reactnavigation.org/)
- [React Native Paper文档](https://callstack.github.io/react-native-paper/)

#### 工具文档
- [TypeScript文档](https://www.typescriptlang.org/)
- [ESLint文档](https://eslint.org/)
- [Jest文档](https://jestjs.io/)

### B. 开发工具推荐

#### IDE/编辑器
- **VS Code**: 推荐，丰富的React Native插件
- **WebStorm**: JetBrains IDE，功能强大

#### 调试工具
- **React Native Debugger**: 独立调试工具
- **Flipper**: Facebook调试平台
- **React DevTools**: React组件调试

#### 设计工具
- **Figma**: UI设计
- **Zeplin**: 设计稿标注

### C. 安全策略与架构

**核心安全原则**: 前端只负责 UI，所有核心逻辑（算法、prompt、计费判断）都在 Core 后端。

**相关文档**:
- `security/Core架构与安全策略方案.md` - 总体架构和安全策略
- `security/前端开发安全规范.md` - 前端开发必须遵守的规则（**系统级要求**）
- `security/后端开发安全规范.md` - 后端开发必须遵守的规则（**系统级要求**）
- `security/代码审查安全检查清单.md` - 代码审查时使用的检查清单

**关键要求**:
- ❌ 前端禁止引入 `core/engine`
- ❌ 前端禁止包含 prompt 模板
- ❌ 前端禁止进行计费判断（业务逻辑）
- ❌ 后端禁止通过 API 返回 prompt
- ❌ 后端禁止返回完整的 blocks_json 结构
- ✅ 所有业务逻辑通过 API 调用
- ✅ 所有权限校验在后端进行

---

### D. API 接口统一规范

**核心规范**: 所有 API 接口遵循统一的路径、响应格式和参数命名规范。

**相关文档**:
- `API接口统一规范.md` - API 接口统一规范（路径、响应格式、参数命名等）

**关键规范**:
- ✅ API 路径统一使用 `/api/v1/...` 前缀
- ✅ 路径参数统一使用 `chartId`（不是 `id` 或 `mingpanId`）
- ✅ 响应格式统一包含 `success` 字段
- ✅ 成功响应：`{ success: true, data: T }`
- ✅ 错误响应：`{ success: false, error: { code, message, details? } }`
- ✅ 模型支持：仅支持三个模型（DeepSeek、ChatGPT、Qwen）

---

### E. 项目检查清单

#### 开发前
- [ ] 开发环境配置完成
- [ ] 项目结构创建完成
- [ ] 依赖包安装完成
- [ ] 配置文件设置完成

#### 开发中
- [ ] 代码符合规范
- [ ] TypeScript类型完整
- [ ] 组件可复用
- [ ] 样式统一

#### 开发后
- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 兼容性测试通过
- [ ] 代码审查通过
- [ ] 文档更新完成

---

**文档版本**: v2.0.0  
**最后更新**: 2024年11月  
**更新内容**: 
  - v1.0.0: 初始版本，基础技术架构和开发环境配置
  - v2.0.0: 重大更新，根据所有设计文档理清开发思路
    - 更新核心功能模块，与设计文档完全对应
    - 添加应用架构概览和用户流程
    - 完善页面模块说明（所有主要页面）
    - 更新组件模块说明
    - 更新状态管理模块
    - 更新项目目录结构
    - 添加路由命名规范
    - 更新开发流程和优先级
    - 完善开发规范
    - 添加设计文档索引
    - 添加关键开发原则
    - 添加 API 接口统一规范章节  
**维护者**: 开发团队

