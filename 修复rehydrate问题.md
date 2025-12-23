# 修复 Rehydrate 问题

## 问题确认

从 AsyncStorage 查询结果显示：
- ✅ **Token 已保存** (517 字节)
- ✅ **数据完整**（包含 user, token, isAuthenticated）
- ❌ **但重启后 token 丢失**

## 根本原因

Zustand persist 的 `migrate` 函数在恢复数据时可能破坏了 token：

```typescript
// ❌ 问题代码
return {
  ...initialState,        // initialState.token = null
  ...persistedState,      // persistedState.token = "eyJh..."
  isAuthenticated: Boolean(persistedState.isAuthenticated),
} as AuthState;
```

虽然展开顺序是对的，但可能存在其他问题。

## 解决方案

### 1. 增强 migrate 日志

```typescript
migrate: (persistedState: any, version: number) => {
  console.log('[authStore] migrate 开始迁移数据:', {
    version,
    hasPersistedState: !!persistedState,
    hasToken: !!persistedState?.token,
    tokenLength: persistedState?.token?.length || 0,
  });
  
  // 确保 token 和 user 不被覆盖
  const migratedState = {
    ...initialState,
    ...persistedState,
    user: persistedState.user || null,
    token: persistedState.token || null,  // 明确保留 token
    isAuthenticated: Boolean(persistedState.isAuthenticated && persistedState.token),
  };
  
  return migratedState;
}
```

### 2. 增强 onRehydrateStorage 验证

```typescript
onRehydrateStorage: () => {
  return (state, error) => {
    console.log('[authStore] ✅ 数据恢复完成:', {
      hasUser: !!state?.user,
      hasToken: !!state?.token,
      tokenLength: state?.token?.length || 0,
      tokenPreview: state?.token?.substring(0, 50) + '...',
    });
    
    // 自动修复不一致状态
    if (state?.isAuthenticated && !state?.token) {
      console.error('[authStore] ⚠️ 发现错误状态，自动清除登录状态');
      state.isAuthenticated = false;
    }
    
    if (state?.token && !state?.isAuthenticated) {
      console.warn('[authStore] ⚠️ 有 token 但未标记为已登录，自动修正');
      state.isAuthenticated = true;
    }
    
    state?._setHasHydrated(true);
  };
}
```

## 测试步骤

1. **完全关闭并重启 App**
   - 从后台划掉 App
   - 重新打开

2. **查看控制台日志**
   ```
   [authStore] ==================== 开始 Rehydrate ====================
   [authStore] migrate 开始迁移数据: { version: 1, hasToken: true, tokenLength: 192 }
   [authStore] migrate 迁移完成: { hasToken: true, tokenLength: 192 }
   [authStore] ✅ 数据恢复完成: { hasToken: true, tokenLength: 192, tokenPreview: "eyJh..." }
   [authStore] ==================== Rehydrate 完成 ====================
   ```

3. **验证结果**
   - 如果 `hasToken: true` → 修复成功
   - 如果 `hasToken: false` → 还需深入检查

## 下一步

如果修复后仍然失败，可能原因：
1. AsyncStorage 权限问题
2. Zustand persist 配置问题
3. React Native 版本兼容性问题

届时考虑：
- 手动管理 AsyncStorage
- 使用其他持久化方案（如 MMKV）

