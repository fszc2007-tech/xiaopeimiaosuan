# 神煞元数据配置实施说明

## 实施日期
2024年11月

## 改动概述

本次改动在**保持计算逻辑完全不变**的前提下，完成了以下优化：

### 1. 数据清洗修正 ✅

#### 1.1 桃花/咸池统一处理
- **问题**：代码中两个独立函数，逻辑完全相同
- **修正**：统一为一个计算函数（"桃花"），但两个名称都显示
- **实现**：在 `computeShensha` 中，当命中"桃花"时，同时添加"咸池"名称
- **影响**：无，计算结果完全一致，只是显示名称更规范

#### 1.2 亡神命名区分
- **问题**：命局版和流年版都叫"亡神"，容易混淆
- **修正**：命局版改为"亡神（命局）"
- **影响**：API 返回的神煞名称会从"亡神"变为"亡神（命局）"，需要前端适配

### 2. 元数据配置 ✅

#### 2.1 创建元数据配置文件
- **文件**：`core/engine/shensha/metadata.js`
- **内容**：37个神煞的完整元数据配置
- **分类**：
  - 核心贵人神煞：2个
  - 辅助吉星神煞：5个
  - 组合神煞：22个（含4个子分类）
  - 空亡系统：3个
  - 流年神煞：5个

#### 2.2 元数据结构
```javascript
{
  id: string,              // 唯一标识（snake_case）
  name: string,            // 显示名称（中文）
  aliases?: string[],      // 别名
  group: string,           // 大类
  subGroup: string | null, // 子分类
  scope: 'natal' | 'flow_year', // 作用域
  isCore: boolean,         // 是否核心神煞
  primaryTrigger: string,  // 主要触发依据
  extraTriggers?: string[], // 额外触发依据
  tags: string[]           // 语义标签
}
```

#### 2.3 辅助函数
- `getMetadataByName(name)` - 根据名称获取元数据
- `getMetadataById(id)` - 根据ID获取元数据
- `getMetadataByGroup(group)` - 根据分组获取
- `getMetadataBySubGroup(subGroup)` - 根据子分组获取
- `getAllMetadata()` - 获取所有元数据

## 计算逻辑验证

### ✅ 计算逻辑完全不变

1. **所有计算函数保持不变**
   - RULES 对象中的所有计算逻辑完全一致
   - 只是修正了命名和统一了桃花/咸池

2. **输出格式保持不变**
   ```javascript
   {
     hits_by_pillar: {
       "年柱": ["天乙贵人", "太极贵人", ...],
       "月柱": ["亡神（命局）", "文昌贵人", ...],
       "日柱": ["桃花", "咸池", ...],
       "时柱": [...]
     }
   }
   ```

3. **向后兼容性**
   - API 输出格式不变
   - 只是神煞名称有微调（亡神 → 亡神（命局））
   - 桃花和咸池都会显示（之前只显示一个）

## 神煞统计（修正后）

### 总计：37个神煞

1. **核心贵人神煞（2个）**
   - 天乙贵人
   - 文昌贵人

2. **辅助吉星神煞（5个）**
   - 太极贵人
   - 月德贵人
   - 天德贵人
   - 红鸾
   - 天喜

3. **组合神煞（22个）**
   - **三合局系（5个）**：桃花（咸池）、驿马、将星、华盖、亡神（命局）
   - **孤寡丧吊系（5个）**：孤辰、寡宿、丧门、吊客、披麻
   - **德合系（2个）**：月德合、天德合
   - **禄位与才华系（10个）**：德秀贵人、龙德贵人、国印贵人、天厨贵人、建禄、专禄、词馆、流霞、八专

4. **空亡系统（3个）**
   - 年空亡
   - 月空亡
   - 日空亡

5. **流年神煞（5个）**
   - 太岁
   - 岁驾
   - 病符
   - 亡神（流年）
   - 劫煞（流年）

## 使用示例

### 获取元数据

```javascript
import { getMetadataByName, getMetadataByGroup } from './shensha/metadata.js';

// 根据名称获取
const taoHuaMeta = getMetadataByName('桃花');
// 返回：{ id: 'tao_hua', name: '桃花', aliases: ['咸池'], ... }

// 根据分组获取
const coreNobles = getMetadataByGroup('core_noble');
// 返回：核心贵人神煞列表

// 根据子分组获取
const solitudeDeath = getMetadataBySubGroup('solitude_death');
// 返回：孤寡丧吊系神煞列表
```

### 在 LLM 解读中使用

```javascript
// 获取孤寡丧吊系神煞
const solitudeDeathList = getMetadataBySubGroup('solitude_death');
const names = solitudeDeathList.map(m => m.name);
// 可以生成提示词："你命盘中孤寡丧吊类神煞偏多：孤辰、寡宿、丧门..."
```

## 注意事项

1. **API 兼容性**
   - 输出格式不变：`{ hits_by_pillar: {...} }`
   - 元数据不暴露给 API（内部配置）
   - 如需元数据，可通过新增可选字段：`shensha_metadata?: ShenshaMetadata[]`

2. **前端适配**
   - "亡神" → "亡神（命局）"（需要前端显示适配）
   - "桃花"和"咸池"都会显示（之前可能只显示一个）

3. **计算准确性**
   - ✅ 所有计算逻辑完全不变
   - ✅ 只是修正了命名和统一了显示
   - ✅ 核心是不要算错 - 已验证

## 后续优化建议

1. **API 扩展**（可选）
   - 如需元数据，可在 API 响应中新增可选字段
   - 例如：`result.shensha_metadata = getAllMetadata()`

2. **LLM 解读优化**
   - 利用 subGroup 进行分组解读
   - 例如："你命盘中孤寡丧吊类神煞偏多，需要注意人际关系..."

3. **UI 聚合展示**
   - 根据 subGroup 进行分组展示
   - 例如：在命盘详情页按子分类聚合显示





