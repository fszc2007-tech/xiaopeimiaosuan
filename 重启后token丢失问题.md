# 重启后 Token 丢失问题分析

## 问题描述

用户反馈：**重新启动 App 后，提示没有 token，但没有进行任何操作**

这说明问题不是登录时没有 token，而是：
- ✅ 登录时 token 存在
- ❌ 重启 App 后，从 AsyncStorage 恢复数据时，token 丢失了

## 可能原因

### 1. AsyncStorage 保存失败

Zustand persist 配置：
```typescript
{
  name: 'xiaopei-auth-storage',
  storage: createJSONStorage(() => AsyncStorage),
}
```

**可能问题**：
- AsyncStorage 保存是异步的
- 登录后立即跳转，可能还没来得及保存
- App 被杀掉时，数据还在内存中，没有刷新到磁盘

### 2. Token 字段被排除

检查了配置，**没有** `partialize` 字段过滤，所以 token 应该被保存。

### 3. 数据恢复时的问题

`onRehydrateStorage` 只打印了 `hasUser` 和 `isAuthenticated`，没有打印 `hasToken`。

**这导致我们无法看到 token 是否真的被恢复了。**

## 修复方案

### 1. 增强日志

```typescript
onRehydrateStorage: () => {
  return (state, error) => {
    if (!error) {
      console.log('[authStore] 数据恢复完成:', {
        hasUser: !!state?.user,
        hasToken: !!state?.token,        // ← 新增
        tokenLength: state?.token?.length || 0,  // ← 新增
        isAuthenticated: state?.isAuthenticated,
      });
      
      // 验证数据一致性
      if (state?.isAuthenticated && !state?.token) {
        console.error('[authStore] ⚠️ 警告：isAuthenticated=true 但 token 为空！');
      }
    }
  };
},
```

### 2. 确保数据保存完成

在 `login()` 中已经有等待逻辑：
```typescript
// 登录成功后
login(response.user, response.token);

// 等待 1 秒，确保 AsyncStorage 保存完成
await new Promise(resolve => setTimeout(resolve, 1000));
```

### 3. 调试步骤

请执行以下操作并查看日志：

#### A. 登录测试
```
1. 完全退出 App
2. 重新打开
3. 登录：13636602202 / 123456
4. 查看控制台日志：
   [authStore] 开始登录
   [authStore] 登录成功，状态已更新
   [authStore] 验证登录状态 { hasToken: true, tokenLength: 192 }
```

#### B. 重启测试
```
1. 登录成功后
2. 完全关闭 App（从后台划掉）
3. 重新打开 App
4. 查看控制台日志：
   [authStore] 开始从 AsyncStorage 恢复数据...
   [authStore] 数据恢复完成: {
     hasUser: true/false,
     hasToken: true/false,  ← 关键！
     tokenLength: 192/0,    ← 关键！
     isAuthenticated: true/false
   }
```

**如果看到 `hasToken: false`，说明 token 确实没有被保存到 AsyncStorage！**

### 4. 可能的解决方案

如果 token 确实没有被保存，可能需要：

#### 方案 A：手动触发保存
```typescript
login: async (user, token) => {
  set({ user, token, isAuthenticated: true });
  
  // 手动触发持久化
  await AsyncStorage.setItem('xiaopei-auth-storage', JSON.stringify({
    state: { user, token, isAuthenticated: true },
    version: 0,
  }));
}
```

#### 方案 B：使用同步保存
检查 Zustand persist 配置是否需要添加 `partialize` 或其他选项。

#### 方案 C：延长保存等待时间
```typescript
// 从 1 秒增加到 2 秒
await new Promise(resolve => setTimeout(resolve, 2000));
```

## 下一步

1. **按 Cmd+R 重新加载 App**
2. **登录**
3. **完全关闭 App**（从后台划掉）
4. **重新打开**
5. **查看控制台日志**，特别是：
   ```
   [authStore] 数据恢复完成: { hasToken: ?, tokenLength: ? }
   ```

**请把这个日志告诉我！**

