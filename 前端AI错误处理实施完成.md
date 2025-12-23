# 前端 AI 錯誤處理實施完成

> **完成時間**：2024-12-XX  
> **任務**：統一處理 `AI_DAILY_LIMIT_REACHED` 錯誤

---

## ✅ 已完成項目

### 1. API 攔截器錯誤處理（核心）

**文件**：`app/src/services/api/apiClient.ts`

**改動**：
- ✅ 在 `handleApiError()` 中添加 `AI_DAILY_LIMIT_REACHED` 錯誤處理
- ✅ 區分 AI 次數限制（429 + `AI_DAILY_LIMIT_REACHED`）和一般頻率限制（429 + `RATE_LIMIT_EXCEEDED`）
- ✅ 新增 `showAiLimitReachedDialog()` 函數顯示專用對話框
- ✅ 新增 `navigateToSubscription()` 函數跳轉到訂閱頁

**錯誤處理邏輯**：
```typescript
// 4. 429 频率限制 / AI 次数限制
if (status === 429) {
  // AI 解读次数限制
  if (data?.error?.code === 'AI_DAILY_LIMIT_REACHED') {
    showAiLimitReachedDialog(data.error);
    return;
  }
  
  // 一般频率限制
  if (data?.error?.code === 'RATE_LIMIT_EXCEEDED') {
    const message = data?.error?.message || '操作過於頻繁，請稍後再試';
    showToast(message, 'warning');
    return;
  }
  
  // 其他 429 错误
  const message = data?.error?.message || '操作過於頻繁，請稍後再試';
  showToast(message, 'warning');
  return;
}
```

---

### 2. AI 次數限制對話框

**函數**：`showAiLimitReachedDialog()`

**功能**：
- 顯示 Alert 對話框
- 標題：「今日解讀次數已用完」
- 內容：顯示已用次數和上限，引導升級會員
- 按鈕：
  - 「稍後再說」（取消）
  - 「去開通會員」（跳轉訂閱頁）

**對話框內容**：
```
標題：今日解讀次數已用完

內容：您今日的 AI 解讀次數已達上限（5 次）

升級成小佩會員，每天可使用 100 次 AI 解讀與問答。

按鈕：[稍後再說] [去開通會員]
```

---

### 3. 全局導航引用

**文件**：`app/src/navigation/navigationRef.ts`（新建）

**功能**：
- 創建全局 `navigationRef`
- 提供 `navigate()` 和 `goBack()` 工具函數
- 允許在非組件環境（如 API 攔截器）中進行導航跳轉

**代碼**：
```typescript
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
```

---

### 4. App.tsx 註冊 navigationRef

**文件**：`app/App.tsx`

**改動**：
- ✅ 導入 `navigationRef`
- ✅ 在 `<NavigationContainer>` 中註冊 `ref={navigationRef}`

**代碼**：
```typescript
import { navigationRef } from './src/navigation/navigationRef';

// ...

<NavigationContainer ref={navigationRef}>
  <View testID="app-root" style={{ flex: 1 }}>
    <RootNavigator />
  </View>
</NavigationContainer>
```

---

## 📋 工作流程

### 用戶觸發 AI 調用

1. 用戶在聊天頁面發送消息
2. 前端調用 `POST /api/v1/conversations/:id/messages`
3. 後端檢查 AI 次數限制（`checkAndCountAIUsage()`）

### 達到次數上限

4. 後端拋出 `AiLimitReachedError`
5. 後端返回 429 + 錯誤信息：
   ```json
   {
     "success": false,
     "error": {
       "code": "AI_DAILY_LIMIT_REACHED",
       "message": "今日解讀次數已用完",
       "details": {
         "limit": 5,
         "used": 5,
         "remaining": 0
       }
     }
   }
   ```

### 前端統一處理

6. axios 響應攔截器捕獲 429 錯誤
7. 檢查 `error.code === 'AI_DAILY_LIMIT_REACHED'`
8. 調用 `showAiLimitReachedDialog()` 顯示對話框
9. 用戶點擊「去開通會員」
10. 調用 `navigateToSubscription()` 跳轉到訂閱頁

---

## 🧪 測試要點

### 1. 觸發 AI 次數限制

**測試步驟**：
1. 創建非會員測試帳號
2. 連續發送 5 條聊天消息（非會員次日限制）
3. 第 6 條消息應該觸發錯誤

**預期結果**：
- 顯示 Alert 對話框
- 標題：「今日解讀次數已用完」
- 內容包含已用次數（5 次）
- 有「去開通會員」按鈕

### 2. 跳轉到訂閱頁

**測試步驟**：
1. 觸發 AI 次數限制對話框
2. 點擊「去開通會員」按鈕

**預期結果**：
- 成功跳轉到訂閱頁面（`ProSubscription` 或 `Pro`）
- 訂閱頁顯示正常

### 3. 取消對話框

**測試步驟**：
1. 觸發 AI 次數限制對話框
2. 點擊「稍後再說」按鈕

**預期結果**：
- 對話框關閉
- 停留在當前頁面

---

## 📝 注意事項

### 1. 訂閱頁面路由名稱

當前代碼使用 `'ProSubscription'` 作為路由名稱：
```typescript
navigationRef.current.navigate('ProSubscription' as never);
```

**請確認**：
- 實際路由名稱是否為 `ProSubscription`
- 如果不是，請修改為正確的路由名稱（如 `Pro`、`Subscription` 等）

### 2. 對話框樣式

當前使用 React Native 原生 `Alert.alert()`：
- iOS：原生對話框樣式
- Android：原生對話框樣式

**未來優化**：
- 可以替換為自定義對話框組件
- 提供更好的視覺效果和品牌一致性

### 3. Toast 組件

當前 `showToast()` 只是 console.log：
```typescript
function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  console.log(`[Toast ${type.toUpperCase()}]`, message);
}
```

**待集成**：
- 集成 Toast 組件庫（如 `react-native-toast-message`）
- 或實現自定義 Toast 組件

### 4. 錯誤信息國際化

當前錯誤信息是硬編碼的繁體中文：
```typescript
const title = '今日解讀次數已用完';
const message = `您今日的 AI 解讀次數已達上限...`;
```

**未來優化**：
- 使用 i18n 進行國際化
- 支持簡體中文、繁體中文、英文等

---

## 🎯 與後端的配合

### 後端返回格式（已完成）

```json
{
  "success": false,
  "error": {
    "code": "AI_DAILY_LIMIT_REACHED",
    "message": "今日解讀次數已用完",
    "details": {
      "limit": 5,
      "used": 5,
      "remaining": 0
    }
  }
}
```

**HTTP 狀態碼**：429 (Too Many Requests)

### 前端解析（已完成）

- ✅ 捕獲 429 狀態碼
- ✅ 檢查 `error.code === 'AI_DAILY_LIMIT_REACHED'`
- ✅ 解析 `error.details.limit` 和 `error.details.used`
- ✅ 顯示對話框並引導跳轉

---

## 📊 文件變更總結

| 文件 | 變更類型 | 說明 |
|------|---------|------|
| `app/src/services/api/apiClient.ts` | 修改 | 添加 AI 次數限制錯誤處理 |
| `app/src/navigation/navigationRef.ts` | 新建 | 全局導航引用 |
| `app/App.tsx` | 修改 | 註冊 navigationRef |

---

## ✅ 任務完成檢查清單

- [x] API 攔截器添加 `AI_DAILY_LIMIT_REACHED` 錯誤處理
- [x] 實現 `showAiLimitReachedDialog()` 對話框
- [x] 實現 `navigateToSubscription()` 跳轉函數
- [x] 創建全局 `navigationRef`
- [x] 在 App.tsx 中註冊 `navigationRef`
- [ ] 測試：觸發 AI 次數限制
- [ ] 測試：跳轉到訂閱頁
- [ ] 測試：取消對話框

---

## 🚀 下一步

1. **測試功能**
   - 執行後端 Migration
   - 重啟後端服務
   - 測試前端錯誤處理

2. **確認路由名稱**
   - 檢查訂閱頁面的實際路由名稱
   - 如需要，修改 `navigateToSubscription()` 中的路由名稱

3. **優化體驗**（可選）
   - 集成 Toast 組件
   - 實現自定義對話框
   - 添加國際化支持

---

**文檔結束**


