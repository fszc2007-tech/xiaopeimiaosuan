# 国家代码选择器使用指南

## 功能概述

前端已成功集成国家代码选择器，支持多个国家/地区的手机号登录。

### 核心特性

- ✅ **默认香港**：默认选择 +852 香港
- ✅ **多地区支持**：香港、大陆、澳门、台湾、新加坡、美国等
- ✅ **智能验证**：根据选择的国家/地区自动验证手机号格式
- ✅ **多语言**：支持简体中文/繁体中文自动切换
- ✅ **美观 UI**：底部弹窗选择，带旗帜 emoji 和选中状态
- ✅ **实时反馈**：输入错误时显示对应地区的提示信息

## 文件结构

```
app/
├── src/
│   ├── constants/
│   │   └── countryCodeData.ts           # 国家代码配置数据
│   ├── components/
│   │   └── auth/
│   │       ├── CountryCodePicker.tsx    # 国家代码选择器组件
│   │       └── index.ts                 # 导出文件
│   ├── screens/
│   │   └── Auth/
│   │       └── AuthScreen.tsx           # 登录界面（已更新）
│   ├── services/
│   │   └── api/
│   │       ├── authApi.ts               # API 接口（已更新）
│   │       └── authService.ts           # API 服务（已更新）
│   └── types/
│       └── user.ts                      # 类型定义（已更新）
```

## 主要组件

### 1. countryCodeData.ts

定义了支持的国家/地区配置：

```typescript
export interface CountryCode {
  code: string;           // 国家代码（如 "+852"）
  name: string;           // 地区名称（繁体中文）
  nameSimplified: string; // 简体中文
  nameEn: string;         // 英文名称
  flag: string;           // 旗帜 emoji
  region: 'cn' | 'hk' | 'mo' | 'tw' | 'intl'; // 地区类型
  placeholder: string;    // 输入框示例（繁体）
  placeholderSimplified: string; // 输入框示例（简体）
  pattern?: string;       // 号码格式正则（可选）
}
```

**支持的国家/地区**（按优先级排序）：
1. 🇭🇰 香港（+852）- **默认**
2. 🇨🇳 中国大陆（+86）
3. 🇲🇴 澳门（+853）
4. 🇹🇼 台湾（+886）
5. 🇸🇬 新加坡（+65）
6. 🇺🇸 美国/加拿大（+1）
7. 🇬🇧 英国（+44）
8. 🇦🇺 澳洲（+61）
9. 🇯🇵 日本（+81）
10. 🇰🇷 韩国（+82）

### 2. CountryCodePicker 组件

国家代码选择器组件，提供美观的 UI 和交互体验。

**Props**:
```typescript
interface CountryCodePickerProps {
  value: CountryCode;           // 当前选择的国家代码
  onChange: (CountryCode) => void;  // 选择变更回调
  disabled?: boolean;           // 是否禁用
}
```

**功能**:
- 显示当前选择的国家代码（旗帜 + 代码）
- 点击展开底部弹窗
- 滚动列表选择
- 根据语言显示对应的地区名称

### 3. AuthScreen 更新

登录界面已完全重构以支持国家代码选择器：

**主要改动**:
1. 添加 `countryCode` 状态（默认 +852）
2. 国家代码选择器 + 手机号输入框横向布局
3. 根据选择的国家代码动态调整：
   - 输入框 placeholder（如 "9123 4567" for HK）
   - 手机号验证规则
   - 错误提示语言
4. API 调用参数：`phone`（纯数字）+ `countryCode`（如 "+852"）

## API 变更

### 发送验证码

**新接口**: `POST /api/v1/auth/send_code`

**请求参数**:
```typescript
{
  phone: string;          // 手机号（纯数字，无前缀）
  countryCode: string;    // 国家代码（如 "+852"）
  region?: string;        // 地区（可选：cn/hk/mo/tw/intl）
  scene?: string;         // 场景（可选：login/register）
}
```

**示例**:
```typescript
await authService.requestOtp({
  phone: "91234567",
  countryCode: "+852",
  region: "hk",
  scene: "login",
});
```

### 登录/注册

**接口**: `POST /api/v1/auth/login_or_register`

**请求参数**:
```typescript
{
  phone: string;          // 手机号（纯数字）
  countryCode: string;    // 国家代码（如 "+852"）
  code: string;          // 验证码（6位数字）
  region?: string;        // 地区（可选）
  scene?: string;         // 场景（可选）
  inviteCode?: string;   // 邀请码（可选）
}
```

**示例**:
```typescript
await authService.loginOrRegister({
  phone: "91234567",
  countryCode: "+852",
  code: "123456",
  region: "hk",
  scene: "login",
});
```

## 使用方法

### 基础使用

```tsx
import { CountryCodePicker } from '@/components/auth';
import { DEFAULT_COUNTRY_CODE } from '@/constants/countryCodeData';

function MyComponent() {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  
  return (
    <CountryCodePicker
      value={countryCode}
      onChange={setCountryCode}
    />
  );
}
```

### 手机号验证

```typescript
import { validatePhoneNumber } from '@/constants/countryCodeData';

const isValid = validatePhoneNumber(phone, countryCode);
```

### 手机号格式化

```typescript
import { formatPhoneNumber } from '@/constants/countryCodeData';

const formatted = formatPhoneNumber("91234567", countryCode);
// 香港：9123 4567
// 大陆：138 0013 8000
```

## UI 展示

### 选择器按钮

```
┌─────────────┐
│ 🇭🇰 +852 ▼ │
└─────────────┘
```

### 底部弹窗

```
┌──────────────────────────────┐
│ 選擇國家/地區           ✕    │
├──────────────────────────────┤
│ 🇭🇰  香港                 ✓  │
│      +852                     │
├──────────────────────────────┤
│ 🇨🇳  中國大陸                │
│      +86                      │
├──────────────────────────────┤
│ 🇲🇴  澳門                    │
│      +853                     │
├──────────────────────────────┤
│ ...                          │
└──────────────────────────────┘
```

### 登录界面布局

```
┌────────────────────────────────┐
│  小佩妙算 AI 助手              │
│  用心陪伴您的命理之旅          │
├────────────────────────────────┤
│  手機號登入                    │
│                                │
│  ┌──────┐ ┌──────────────┐   │
│  │🇭🇰+852▼││ 9123 4567    │   │
│  └──────┘ └──────────────┘   │
│                                │
│  驗證碼                        │
│  ┌──────────────────────┐     │
│  │ ● ● ● ● ● ●          │     │
│  └──────────────────────┘     │
│                                │
│  ┌──────────────────────┐     │
│  │     發送驗證碼        │     │
│  └──────────────────────┘     │
│                                │
│  首次登入即自動註冊            │
└────────────────────────────────┘
```

## 验证规则

### 香港（+852）
- 格式：8位数字
- 开头：5-9
- 示例：9123 4567

### 大陆（+86）
- 格式：11位数字
- 开头：1（且第二位为3-9）
- 示例：138 0013 8000

### 澳门（+853）
- 格式：8位数字
- 开头：6
- 示例：6234 5678

### 台湾（+886）
- 格式：9位数字
- 开头：9
- 示例：912 345 678

## 多语言支持

组件会根据 `i18n.language` 自动切换语言：

**繁体中文（zh-HK）**:
- 标题：選擇國家/地區
- 地区名：香港、中國大陸、澳門、台灣
- 错误提示：請輸入正確的香港手機號

**简体中文（zh-CN）**:
- 标题：选择国家/地区
- 地区名：香港、中国大陆、澳门、台湾
- 错误提示：请输入正确的香港手机号

## 测试步骤

### 1. 启动前端

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npm start
```

### 2. 测试国家代码选择

- 打开登录界面
- 默认显示 🇭🇰 +852
- 点击选择器，弹出国家列表
- 选择不同国家/地区
- 确认 placeholder 和验证规则已更新

### 3. 测试手机号输入

- 输入香港号码：91234567
- 输入大陆号码：13800138000
- 输入错误格式，确认显示错误提示

### 4. 测试验证码发送

- 输入正确格式的手机号
- 点击"发送验证码"
- 确认请求参数包含 `phone` 和 `countryCode`

### 5. 测试登录

- 输入验证码
- 点击"登录"
- 确认登录成功

## 常见问题

### Q: 如何添加新的国家/地区？

A: 在 `countryCodeData.ts` 的 `COUNTRY_CODES` 数组中添加新的条目：

```typescript
{
  code: '+123',
  name: '新國家',
  nameSimplified: '新国家',
  nameEn: 'New Country',
  flag: '🏳️',
  region: 'intl',
  placeholder: '123 456 789',
  placeholderSimplified: '123 456 789',
  pattern: '^\\d{9}$', // 可选
}
```

### Q: 如何修改默认国家代码？

A: 修改 `countryCodeData.ts` 中的 `DEFAULT_COUNTRY_CODE`：

```typescript
export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[1]; // 改为大陆 +86
```

### Q: 如何自定义选择器样式？

A: 修改 `CountryCodePicker.tsx` 中的 `styles` 对象。

### Q: 验证码接口返回错误怎么办？

A: 检查：
1. 后端 core 服务是否正常运行
2. 环境变量是否正确配置（腾讯云密钥等）
3. Redis 是否正常运行
4. 手机号格式是否正确

## 后续优化建议

1. **添加常用国家**：根据用户分布添加更多国家/地区
2. **搜索功能**：在国家列表中添加搜索框
3. **记住选择**：使用 AsyncStorage 记住用户上次选择的国家
4. **自动检测**：根据设备语言/地理位置自动选择国家
5. **号码格式化**：输入时自动添加空格（如 9123 4567）

## 相关文档

- [后端 SMS 配置指南](../core/SMS_CONFIG_EXAMPLE.md)
- [注册登录设计文档](../app.doc/features/注册登录设计文档.md)
- [手机号登录改造方案](../手机号登录改造方案分析.md)

## 技术支持

如有问题，请查看日志：

```bash
# 前端日志（Metro bundler）
npm start

# 后端日志
cd ../core
npm run dev
```

日志中会显示详细的请求参数和错误信息。

