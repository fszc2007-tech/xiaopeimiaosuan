module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // 禁止在前端代码中引入 core/engine
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '**/core/engine/**',
              '**/../../core/engine/**',
              '**/../../../core/engine/**',
              '../core/engine/**',
              '../../core/engine/**',
              '../../../core/engine/**',
            ],
            message:
              '禁止在前端代码中引入 core/engine，所有排盘计算必须通过 API 调用。请使用 chartService.createChart() 代替。',
          },
        ],
      },
    ],
    // 禁止使用 any 类型
    '@typescript-eslint/no-explicit-any': 'error',
    // 要求使用 const
    'prefer-const': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'core/',
    'admin/',
  ],
};

