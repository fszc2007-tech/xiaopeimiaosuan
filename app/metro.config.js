const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 配置路径别名解析
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  // 支持 Markdown 文件
  assetExts: [...config.resolver.assetExts, 'md'],
};

module.exports = config;

