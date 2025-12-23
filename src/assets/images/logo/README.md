# Logo 資源說明

## 文件說明

本目錄存放小佩 App 的 Logo 和頭像資源。

## 文件列表

請將以下 Logo 文件放置在此目錄：

- `logo-full.png` - 完整 Logo（1024x1024px，用於應用商店）
- `logo-app.png` - App 內使用版本（200x200px）
- `logo-small.png` - 小尺寸版本（120x120px）
- `avatar.png` - 頭像版本（60x60px，圓形）
- `avatar-small.png` - 小頭像（40x40px，圓形）
- `logo-icon.svg` - SVG 版本（可選）

## Logo 設計規範

請參考 `app.doc/UI_SPEC.md` 中的「Logo 與品牌標識」章節。

## 使用方式

```typescript
import LogoApp from '@/assets/images/logo/logo-app.png';
import Avatar from '@/assets/images/logo/avatar.png';
```

