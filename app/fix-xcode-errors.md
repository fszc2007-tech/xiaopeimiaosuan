# Xcode 构建错误修复指南

## 🔧 快速修复方法（推荐）

### 方法 1：在 Xcode 中清理并重新构建

1. **在 Xcode 中**：
   - 按 `Shift + Cmd + K` 清理构建文件夹（Clean Build Folder）
   - 按 `Cmd + B` 重新构建（Build）

Xcode 会自动重新生成所有缺失的 module map 文件。

### 方法 2：等待 pod install 完成

如果 `pod install` 正在运行，等待它完成后再构建。

### 方法 3：手动修复（如果上述方法不行）

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app/ios

# 1. 停止当前的 pod install（如果需要）
# 在终端按 Ctrl+C

# 2. 设置编码
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 3. 重新安装 Pods
pod install

# 4. 在 Xcode 中重新构建
```

## 📝 常见错误说明

### Module Map 文件缺失
- **原因**：清理了 DerivedData 后，module map 文件被删除
- **解决**：重新构建会自动生成这些文件

### react-native-keyboard-controller 错误
- **原因**：Pod 依赖未正确安装
- **解决**：运行 `pod install` 重新安装依赖

## ✅ 验证修复

构建成功后，应该看到：
- ✅ Build Succeeded
- ✅ 没有红色错误标记
- ✅ 应用可以正常安装到设备





