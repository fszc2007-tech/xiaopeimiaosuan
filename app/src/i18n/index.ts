/**
 * i18n 配置
 * 
 * 第一期：仅支持 zh-HK（繁体中文 / 香港）
 * 第二期：添加 zh-CN（简体中文 / 中国大陆）
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhHK from './locales/zh-HK';

// 配置 i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-HK': {
        translation: zhHK,
      },
      // 第二期添加：
      // 'zh-CN': {
      //   translation: zhCN,
      // },
    },
    lng: 'zh-HK', // 默认语言
    fallbackLng: 'zh-HK',
    interpolation: {
      escapeValue: false, // React 已经处理了 XSS
    },
    compatibilityJSON: 'v4', // 兼容 i18next v4
  });

export default i18n;

