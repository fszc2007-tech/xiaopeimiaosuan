#!/bin/bash

# 推送到 GitHub 仓库的脚本
# 使用方法：./push-to-github.sh

set -e

REPO_NAME="xiaopeimiaosuan"
GITHUB_USER="你的GitHub用户名"  # 请替换为你的 GitHub 用户名

echo "=========================================="
echo "推送到 GitHub 仓库"
echo "=========================================="
echo ""

# 检查是否已配置远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ 远程仓库已配置: $(git remote get-url origin)"
    read -p "是否要更新远程仓库 URL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    fi
else
    echo "配置远程仓库..."
    read -p "请输入你的 GitHub 用户名: " GITHUB_USER
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

echo ""
echo "推送代码到 GitHub..."
echo ""

# 推送代码
git push -u origin main

echo ""
echo "✅ 代码已成功推送到 GitHub!"
echo "仓库地址: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
