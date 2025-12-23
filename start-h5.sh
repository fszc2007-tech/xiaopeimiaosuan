#!/bin/bash

# 小佩 H5 版本啟動腳本

echo "========================================"
echo "小佩命理 AI 助手 - H5 版本"
echo "========================================"
echo ""

# 檢查是否在項目根目錄
if [ ! -d "web" ]; then
  echo "❌ 錯誤：請在項目根目錄運行此腳本"
  exit 1
fi

# 進入 H5 目錄
cd web

# 檢查 node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 安裝依賴..."
  npm install
  echo ""
fi

# 啟動開發服務器
echo "🚀 啟動 H5 開發服務器..."
echo ""
echo "訪問地址："
echo "  本地：http://localhost:3002"
echo "  網絡：http://<你的IP>:3002"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

npm run dev


