#!/bin/bash
# 安装 mkcert 本地 CA 到系统信任列表

echo "正在安装本地 CA 到系统信任列表..."
echo "需要输入您的 Mac 密码"
echo ""

mkcert -install

echo ""
echo "✅ 安装完成！"
echo "现在访问 https://localhost:5173 应该不会有安全警告了"

