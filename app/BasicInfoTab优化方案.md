# BasicInfoTab UI 优化与功能实现方案

## 🎨 UI 优化目标

### 参考风格（ManualBaziScreen）
- ✅ 渐变背景
- ✅ 卡片阴影和圆角
- ✅ 紫蓝色系配色
- ✅ 现代化图标
- ✅ 优雅的间距

### 需要优化的元素

1. **背景**：添加柔和渐变
2. **卡片样式**：增加阴影和更大圆角
3. **字段显示**：更紧凑美观
4. **图标**：使用 lucide-react-native
5. **颜色**：紫蓝色主题

---

## 📊 功能实现需求

### 1. 日主概览
**数据来源**: `result.analysis.dayMaster`

```typescript
{
  gan: '癸',
  wuxing: '水',
  strength: 45,
  strengthLabel: '身弱'
}
```

**显示内容**:
- 日主天干
- 五行属性
- 性格特质（需要从 AI 获取或预设）

### 2. 含藏干统计
**数据来源**: `result.analysis.hiddenStems` (需要添加到类型)

```typescript
{
  甲: 2,
  乙: 1,
  丙: 3,
  // ...
}
```

**显示**: 柱状图或表格

### 3. 身强身弱参考
**数据来源**: `result.analysis.strengthAnalysis` (需要添加)

```typescript
{
  score: 45,  // 0-100
  label: '身弱',
  factors: {
    得令: false,
    得地: true,
    得生: false,
    得助: true
  }
}
```

**显示**: 评分条 + 四得因素

### 4. 喜忌用神
**数据来源**: `result.analysis.gods` (需要添加)

```typescript
{
  favorable: ['木', '火'],  // 喜用神
  unfavorable: ['金', '水'],  // 忌神
  neutral: ['土']  // 闲神
}
```

**显示**: 分类标签

---

## 🎯 实施步骤

### Phase 1: UI 优化 ✅
1. 添加渐变背景
2. 优化卡片样式
3. 添加图标
4. 统一配色

### Phase 2: 扩展类型定义 ✅
1. 更新 `BaziChartDto`
2. 添加新的分析字段

### Phase 3: 更新 Mock 数据 ✅
1. 补充完整的分析数据
2. 确保数据结构完整

### Phase 4: 实现组件 ✅
1. 日主概览卡片
2. 含藏干统计
3. 身强身弱参考
4. 喜忌用神

---

## 📝 实施中...

