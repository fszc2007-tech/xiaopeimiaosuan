# 版本更新日志 v1.0.1

## 📅 发布日期
2025-01-21

## 🎯 主要更新

### ✨ 新功能

1. **Markdown 渲染支持**
   - 集成 `react-native-markdown-display` 库
   - AI 消息支持 Markdown 格式渲染（标题、粗体、表格、列表、表情符号等）
   - 优化聊天界面显示效果

2. **Prompt 输出格式规范**
   - 新增 `XIAOPEI_OUTPUT_STYLE` 统一输出格式规范
   - 所有 Prompt 模板集成 Markdown 格式要求
   - 支持表格、表情符号、标题层级等格式化输出

### 🎨 UI 优化

1. **聊天界面优化**
   - 移除 AI 消息头像，简化界面
   - 优化消息左右边距，确保对称（maxWidth: 100%）
   - 扁平化 AI 消息样式，最大化阅读区域

2. **Markdown 样式配置**
   - 自定义标题样式（h3、h4、h5）
   - 表格样式优化（边框、圆角、响应式）
   - 列表、引用块、代码块样式统一

### 🔧 技术改进

1. **聊天路由优化**
   - 统一使用 `promptTemplates` 模块
   - 支持 `sectionKey` 参数，自动选择对应的 Prompt 模板
   - 获取对话历史，支持上下文对话

2. **代码优化**
   - 清理未使用的导入（Logo 组件）
   - 优化样式配置，确保左右对齐

## 📝 详细变更

### 前端 (app/)

- `app/package.json`: 版本号更新至 1.0.1
- `app/app.json`: 版本号更新至 1.0.1
- `app/src/screens/Chat/ChatScreen.tsx`:
  - 集成 `react-native-markdown-display`
  - 移除 AI 消息头像
  - 优化消息边距（maxWidth: 100%）
  - 配置 Markdown 样式

### 后端 (core/)

- `core/package.json`: 版本号更新至 1.0.1
- `core/src/modules/prompt/promptTemplates.ts`:
  - 新增 `XIAOPEI_OUTPUT_STYLE` 常量
  - 更新所有 `buildXXXPrompt` 函数集成格式规范
- `core/src/routes/conversation.ts`:
  - 使用统一的 Prompt 模板
  - 支持对话历史
  - 支持 `sectionKey` 参数

## 🐛 Bug 修复

- 修复聊天消息左右边距不对称问题
- 修复 Markdown 内容额外 padding 导致的布局问题

## 📦 依赖更新

- 新增: `react-native-markdown-display@^7.0.2`

## 🔄 迁移说明

无需特殊迁移步骤，直接更新代码即可。

## 📚 相关文档

- Markdown 渲染组件文档: https://github.com/iamacup/react-native-markdown-display
- Prompt 模板规范: `core/src/modules/prompt/promptTemplates.ts`

---

**版本号**: v1.0.1  
**构建日期**: 2025-01-21

