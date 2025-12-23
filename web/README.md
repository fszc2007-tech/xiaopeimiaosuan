# 小佩命理 AI 助手 - H5 版本

> ✅ **與 App 端保持邏輯一致，不影響現有 App**

---

## 📦 技術棧

- **框架**: React 18 + TypeScript
- **構建工具**: Vite 5
- **狀態管理**: Zustand (與 App 端一致)
- **路由**: React Router 6
- **API 客戶端**: Axios
- **樣式**: CSS

---

## 🚀 快速開始

### 1. 安裝依賴

```bash
cd web
npm install
```

### 2. 啟動開發服務器

```bash
npm run dev
```

應用將運行在：`http://localhost:3002`

### 3. 構建生產版本

```bash
npm run build
```

構建產物將輸出到 `dist/` 目錄。

---

## 📁 目錄結構

```
web/
├── src/
│   ├── pages/              # 頁面組件
│   │   ├── Login.tsx       # 登錄頁面
│   │   ├── Register.tsx    # 註冊頁面
│   │   └── Charts.tsx      # 命盤列表
│   ├── services/           # API 服務
│   │   └── api/
│   │       ├── apiClient.ts    # API 客戶端（與 App 邏輯一致）
│   │       └── authService.ts  # 認證服務（與 App 邏輯一致）
│   ├── store/              # 狀態管理（Zustand）
│   │   └── authStore.ts    # 認證狀態（與 App 邏輯一致）
│   ├── types/              # TypeScript 類型（與 App 一致）
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/              # 工具函數
│   │   └── storage.ts      # 本地存儲（localStorage 替代 AsyncStorage）
│   ├── App.tsx             # 根組件
│   └── main.tsx            # 應用入口
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔐 登錄方式

### 1. 用戶名 + 密碼登錄（H5 專用）

- 用戶名：4-20 字符，字母/數字/下劃線
- 密碼：至少 8 位

### 2. 手機號 + 驗證碼登錄（與 App 共用）

- 手機號：支持中國大陸手機號
- 驗證碼：默認 `123456`（內測期間）

---

## 🔗 API 接口

所有 API 接口均與 App 端共用同一套後端：

### 現有接口（與 App 一致）

- `POST /api/v1/auth/request-otp` - 請求驗證碼
- `POST /api/v1/auth/login_or_register` - 手機號登錄
- `GET /api/v1/auth/me` - 獲取用戶信息

### 新增接口（H5 專用）

- `POST /api/v1/auth/register_username` - 用戶名註冊
- `POST /api/v1/auth/login_username` - 用戶名登錄

---

## ⚙️ 環境配置

### 開發環境 (`.env.development`)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

### 生產環境 (`.env.production`)

```env
VITE_API_BASE_URL=https://api.xiaopei.com
VITE_ENV=production
```

---

## 🧪 測試

### 測試用戶

**方式 1：註冊新用戶**
1. 訪問 `http://localhost:3002/register`
2. 填寫用戶名和密碼
3. 註冊成功後自動登錄

**方式 2：手機號登錄**
1. 訪問 `http://localhost:3002/login`
2. 切換到「手機號登錄」Tab
3. 輸入手機號和驗證碼 `123456`

---

## 📝 開發規範

### 1. TypeScript 類型

- ✅ 與 App 端保持一致
- ✅ 與 Core 後端的 DTO 保持一致
- ❌ 禁止使用 `any` 類型

### 2. API 調用

- ✅ 使用統一的 `apiClient`
- ✅ 自動添加 Token
- ✅ 統一錯誤處理

### 3. 狀態管理

- ✅ 使用 Zustand（與 App 一致）
- ✅ 登錄邏輯與 App 保持一致
- ✅ 使用 localStorage 替代 AsyncStorage

### 4. 文字

- ✅ **所有文字必須使用繁體中文**
- ❌ 禁止使用簡體中文

---

## 🚨 重要提示

### 與 App 端的關係

1. **後端接口**：共用同一套後端，完全兼容
2. **業務邏輯**：登錄、認證邏輯與 App 保持一致
3. **數據結構**：TypeScript 類型與 App 完全一致
4. **互不影響**：H5 版本不會影響現有 App 的任何功能

### App 端無需改動

- ✅ 後端新增字段向下兼容
- ✅ 新增接口不影響現有接口
- ✅ App 端無需任何代碼修改
- ✅ App 端無需重新測試

---

## 📞 聯繫

如有問題，請聯繫開發團隊。


