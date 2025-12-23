# 如何添加小佩 AI 头像作为 Logo

## 📋 操作步骤

### 1. 准备图片

将用户提供的**第一张图片**（小佩AI头像）保存到电脑：

```
图片要求：
- 文件名：xiaopei-avatar.png
- 格式：PNG（最好是透明背景）
- 建议尺寸：512x512px 或 1024x1024px
- 质量：高清，适合各种显示尺寸
```

### 2. 放置图片

将图片复制到项目的 assets 目录：

```bash
# 目标路径
/Users/gaoxuxu/Desktop/小佩APP/app/assets/images/xiaopei-avatar.png

# 如果 assets/images 目录不存在，请创建：
mkdir -p /Users/gaoxuxu/Desktop/小佩APP/app/assets/images
```

### 3. 更新 Logo 组件

修改 `app/src/components/common/Logo/Logo.tsx` 文件：

```typescript
/**
 * Logo 组件
 */

import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

// 导入小佩头像
const xiaopeiAvatar = require('@/assets/images/xiaopei-avatar.png');

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeMap = {
    small: 48,
    medium: 80,
    large: 120,
  };

  const logoSize = sizeMap[size];

  return (
    <View style={styles.container}>
      <Image 
        source={xiaopeiAvatar}
        style={[
          styles.logo,
          { width: logoSize, height: logoSize }
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 100, // 圆形
  },
});
```

### 4. 配置 TypeScript（可选）

如果使用 TypeScript，可能需要添加图片类型声明。

创建或更新 `app/src/types/images.d.ts`：

```typescript
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}
```

### 5. 测试显示效果

重新启动应用：

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo start --clear
```

在模拟器或设备上查看登录界面，应该能看到小佩的头像。

## 🎨 样式调整建议

### 添加阴影效果

```typescript
const styles = StyleSheet.create({
  logo: {
    borderRadius: 100,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    // Android 阴影
    elevation: 8,
  },
});
```

### 添加背景圆圈

```typescript
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF', // 浅蓝色背景
    borderRadius: 100,
    padding: 16,
  },
  logo: {
    borderRadius: 100,
  },
});
```

### 添加渐变背景

安装渐变库：
```bash
npx expo install expo-linear-gradient
```

使用渐变：
```typescript
import { LinearGradient } from 'expo-linear-gradient';

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  // ...
  return (
    <LinearGradient
      colors={['#4A90E2', '#50E3C2']}
      style={styles.gradient}
    >
      <Image 
        source={xiaopeiAvatar}
        style={styles.logo}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 100,
    padding: 4,
  },
  logo: {
    borderRadius: 100,
  },
});
```

## 🔍 常见问题

### Q1: 图片不显示？
**A**: 检查以下几点：
1. 图片路径是否正确
2. 文件名是否匹配
3. 重新启动开发服务器（`npx expo start --clear`）

### Q2: 图片模糊？
**A**: 使用更高分辨率的图片（推荐 1024x1024px）

### Q3: 图片背景不透明？
**A**: 确保使用 PNG 格式，并在图片编辑软件中保存为透明背景

### Q4: TypeScript 报错？
**A**: 添加 `images.d.ts` 类型声明文件

## 📱 效果预览

添加后，登录界面将显示：

```
┌─────────────────────┐
│                     │
│   [小佩AI头像]      │
│                     │
│ 小佩妙算 AI 助手    │
│ 用心陪伴您的命理之旅│
│                     │
│ [手机号输入框]      │
│ [发送验证码按钮]    │
│                     │
└─────────────────────┘
```

## ✅ 完成检查清单

- [ ] 图片已保存到 `app/assets/images/xiaopei-avatar.png`
- [ ] Logo.tsx 组件已更新
- [ ] 应用已重新启动
- [ ] 登录界面显示正常
- [ ] 图片清晰，无模糊
- [ ] （可选）添加了阴影或其他样式效果

---

**下一步**: 重新构建应用并测试完整的登录流程

