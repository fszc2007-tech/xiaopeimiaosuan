# 图片资源说明

## Logo 和品牌资源

### xiaopei-avatar.png
- 用途：应用 logo 和小佩AI头像
- 尺寸：建议 512x512px
- 格式：PNG（透明背景）
- 来源：用户提供的小佩AI形象

## 使用方法

在组件中导入图片：

```typescript
import xiaopeiAvatar from '@/assets/images/xiaopei-avatar.png';

// 使用
<Image source={xiaopeiAvatar} style={styles.logo} />
```

## 目录结构

```
assets/
  images/
    xiaopei-avatar.png  - 小佩AI头像
    README.md          - 本说明文件
```

## 注意事项

1. 请将小佩AI头像保存为 `xiaopei-avatar.png`
2. 建议使用透明背景的 PNG 格式
3. 推荐尺寸：512x512px（支持各种显示尺寸）
4. 保持图片质量以确保在不同设备上清晰显示

