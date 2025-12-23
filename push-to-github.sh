#!/bin/bash

echo "=========================================="
echo "GitHub 推送脚本"
echo "=========================================="
echo ""
echo "请确保你已经："
echo "1. 在 GitHub 上创建了仓库: https://github.com/gaoxuxu/xiaopei-app"
echo "2. 创建了 Personal Access Token: https://github.com/settings/tokens/new"
echo "   (需要勾选 'repo' 权限)"
echo ""
echo "=========================================="
echo ""

# 检查是否已配置远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "配置远程仓库..."
    git remote add origin https://github.com/gaoxuxu/xiaopei-app.git
fi

echo "开始推送代码到 GitHub..."
echo ""
echo "当提示输入用户名时，请输入你的 GitHub 用户名"
echo "当提示输入密码时，请粘贴你的 Personal Access Token"
echo ""

# 推送代码
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码已成功推送到 GitHub！"
    echo "仓库地址: https://github.com/gaoxuxu/xiaopei-app"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "1. 仓库是否已创建"
    echo "2. Token 是否正确"
    echo "3. 网络连接是否正常"
fi

