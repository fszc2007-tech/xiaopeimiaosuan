# Git Hooks 配置

本目录包含 Git Hooks 配置，用于在代码提交前进行安全检查。

## 配置说明

### pre-commit

在代码提交前自动检查：
- 是否引入了 `core/engine`
- 是否包含 prompt 模板
- 是否进行了 blocks 计算

如果发现违规代码，提交将被阻止。

## 安装

如果使用 husky：

```bash
npx husky install
npx husky add .husky/pre-commit "sh .husky/pre-commit"
```

## 手动运行

```bash
sh .husky/pre-commit
```

