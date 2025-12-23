#!/usr/bin/env node
/**
 * 小佩项目自动化检测与修复脚本
 * 
 * 功能：
 * - 检查依赖和版本
 * - 检查配置文件
 * - 检查环境变量
 * - 自动安装缺失的包
 * - 清理缓存
 * - 修复常见问题
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

const projects = [
  {
    name: 'App (React Native)',
    path: 'app',
    type: 'app',
    requiredEnvVars: ['EXPO_PUBLIC_API_BASE_URL'],
  },
  {
    name: 'Admin (Vite + React)',
    path: 'admin',
    type: 'admin',
    port: 5173,
  },
  {
    name: 'Core (Node.js + Express)',
    path: 'core',
    type: 'core',
    port: 3000,
    requiredEnvVars: [
      'XIAOPEI_CORE_PORT',
      'XIAOPEI_MYSQL_HOST',
      'XIAOPEI_MYSQL_PORT',
      'XIAOPEI_MYSQL_USER',
      'XIAOPEI_MYSQL_PASSWORD',
      'XIAOPEI_MYSQL_DATABASE',
      'XIAOPEI_JWT_SECRET',
      'XIAOPEI_ENCRYPTION_KEY',
    ],
  },
];

const rootDir = resolve(__dirname, '..');

class ProjectChecker {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  checkNodeVersion() {
    try {
      const version = execSync('node --version', { encoding: 'utf-8' }).trim();
      const major = parseInt(version.replace('v', '').split('.')[0]);
      if (major < 18) {
        return {
          passed: false,
          message: `Node.js 版本过低: ${version}，需要 18+`,
        };
      }
      return { passed: true, message: `Node.js 版本: ${version} ✓` };
    } catch (error) {
      return { passed: false, message: '无法检测 Node.js 版本' };
    }
  }

  checkNpmVersion() {
    try {
      const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
      return { passed: true, message: `npm 版本: ${version} ✓` };
    } catch (error) {
      return { passed: false, message: '无法检测 npm 版本' };
    }
  }

  checkProjectDependencies(project) {
    const results = [];
    const projectPath = join(rootDir, project.path);
    const packageJsonPath = join(projectPath, 'package.json');
    const nodeModulesPath = join(projectPath, 'node_modules');
    const packageLockPath = join(projectPath, 'package-lock.json');

    // 检查 package.json
    if (!existsSync(packageJsonPath)) {
      results.push({
        passed: false,
        message: `${project.name}: package.json 不存在`,
      });
      return results;
    }

    // 检查 node_modules
    if (!existsSync(nodeModulesPath)) {
      results.push({
        passed: false,
        message: `${project.name}: node_modules 不存在`,
        fix: () => {
          log(`正在安装 ${project.name} 的依赖...`, 'yellow');
          try {
            execSync('npm install', {
              cwd: projectPath,
              stdio: 'inherit',
            });
            log(`${project.name} 依赖安装完成 ✓`, 'green');
          } catch (error) {
            log(`${project.name} 依赖安装失败`, 'red');
          }
        },
      });
    } else {
      results.push({
        passed: true,
        message: `${project.name}: node_modules 存在 ✓`,
      });
    }

    // 检查 package-lock.json
    if (!existsSync(packageLockPath)) {
      results.push({
        passed: false,
        message: `${project.name}: package-lock.json 不存在`,
        fix: () => {
          log(`正在生成 ${project.name} 的 package-lock.json...`, 'yellow');
          try {
            execSync('npm install', {
              cwd: projectPath,
              stdio: 'inherit',
            });
            log(`${project.name} package-lock.json 生成完成 ✓`, 'green');
          } catch (error) {
            log(`${project.name} package-lock.json 生成失败`, 'red');
          }
        },
      });
    }

    return results;
  }

  checkConfigFiles(project) {
    const results = [];
    const projectPath = join(rootDir, project.path);

    // 检查 TypeScript 配置
    const tsconfigPath = join(projectPath, 'tsconfig.json');
    if (project.type !== 'app' || existsSync(tsconfigPath)) {
      if (existsSync(tsconfigPath)) {
        try {
          const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
          
          // Admin 使用引用配置，需要检查 tsconfig.app.json
          if (project.type === 'admin' && tsconfig.references) {
            const tsconfigAppPath = join(projectPath, 'tsconfig.app.json');
            if (existsSync(tsconfigAppPath)) {
              const tsconfigApp = JSON.parse(readFileSync(tsconfigAppPath, 'utf-8'));
              if (tsconfigApp.compilerOptions?.strict !== undefined) {
                results.push({
                  passed: true,
                  message: `${project.name}: tsconfig.json (引用配置) 存在且配置正确 ✓`,
                });
              } else {
                results.push({
                  passed: false,
                  message: `${project.name}: tsconfig.app.json 缺少 strict 配置`,
                });
              }
            } else {
              results.push({
                passed: false,
                message: `${project.name}: tsconfig.app.json 不存在`,
              });
            }
          } else if (tsconfig.compilerOptions?.strict !== undefined) {
            results.push({
              passed: true,
              message: `${project.name}: tsconfig.json 存在且配置正确 ✓`,
            });
          } else {
            results.push({
              passed: false,
              message: `${project.name}: tsconfig.json 缺少 strict 配置`,
            });
          }
        } catch (error) {
          results.push({
            passed: false,
            message: `${project.name}: tsconfig.json 格式错误`,
          });
        }
      } else if (project.type === 'core' || project.type === 'admin') {
        results.push({
          passed: false,
          message: `${project.name}: tsconfig.json 不存在`,
        });
      }
    }

    // 检查项目特定配置
    if (project.type === 'app') {
      // 检查 babel.config.js
      const babelConfigPath = join(projectPath, 'babel.config.js');
      if (!existsSync(babelConfigPath)) {
        results.push({
          passed: false,
          message: `${project.name}: babel.config.js 不存在`,
        });
      } else {
        results.push({
          passed: true,
          message: `${project.name}: babel.config.js 存在 ✓`,
        });
      }

      // 检查 metro.config.js
      const metroConfigPath = join(projectPath, 'metro.config.js');
      if (!existsSync(metroConfigPath)) {
        results.push({
          passed: false,
          message: `${project.name}: metro.config.js 不存在`,
        });
      } else {
        results.push({
          passed: true,
          message: `${project.name}: metro.config.js 存在 ✓`,
        });
      }
    }

    if (project.type === 'admin') {
      // 检查 vite.config.ts
      const viteConfigPath = join(projectPath, 'vite.config.ts');
      if (!existsSync(viteConfigPath)) {
        results.push({
          passed: false,
          message: `${project.name}: vite.config.ts 不存在`,
        });
      } else {
        results.push({
          passed: true,
          message: `${project.name}: vite.config.ts 存在 ✓`,
        });
      }
    }

    return results;
  }

  checkEnvFiles(project) {
    const results = [];
    const projectPath = join(rootDir, project.path);
    const envPath = join(projectPath, '.env');
    const envExamplePath = join(projectPath, '.env.example');

    // 检查 .env.example
    if (project.requiredEnvVars && project.requiredEnvVars.length > 0) {
      if (!existsSync(envExamplePath)) {
        results.push({
          passed: false,
          message: `${project.name}: .env.example 不存在`,
        });
      }
    }

    // 检查 .env
    if (!existsSync(envPath)) {
      if (existsSync(envExamplePath)) {
        results.push({
          passed: false,
          message: `${project.name}: .env 不存在，但 .env.example 存在`,
          fix: () => {
            log(`正在从 .env.example 创建 ${project.name} 的 .env...`, 'yellow');
            try {
              const exampleContent = readFileSync(envExamplePath, 'utf-8');
              writeFileSync(envPath, exampleContent);
              log(`${project.name} .env 创建完成，请填写配置 ✓`, 'green');
            } catch (error) {
              log(`${project.name} .env 创建失败`, 'red');
            }
          },
        });
      }
    } else {
      // 检查必需的环境变量
      if (project.requiredEnvVars) {
        const envContent = readFileSync(envPath, 'utf-8');
        const missingVars = [];
        for (const varName of project.requiredEnvVars) {
          if (!envContent.includes(varName)) {
            missingVars.push(varName);
          }
        }
        if (missingVars.length > 0) {
          results.push({
            passed: false,
            message: `${project.name}: .env 缺少必需变量: ${missingVars.join(', ')}`,
          });
        } else {
          results.push({
            passed: true,
            message: `${project.name}: .env 配置完整 ✓`,
          });
        }
      } else {
        results.push({
          passed: true,
          message: `${project.name}: .env 存在 ✓`,
        });
      }
    }

    return results;
  }

  checkPathAliases(project) {
    const results = [];
    const projectPath = join(rootDir, project.path);
    const tsconfigPath = join(projectPath, 'tsconfig.json');

    // Core 不需要路径别名
    if (project.type === 'core') {
      return results;
    }

    if (existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
        
        // Admin 使用引用配置，需要检查 tsconfig.app.json
        let actualConfig = tsconfig;
        if (project.type === 'admin' && tsconfig.references && !tsconfig.compilerOptions) {
          const tsconfigAppPath = join(projectPath, 'tsconfig.app.json');
          if (existsSync(tsconfigAppPath)) {
            try {
              actualConfig = JSON.parse(readFileSync(tsconfigAppPath, 'utf-8'));
            } catch (error) {
              // 忽略解析错误
            }
          }
        }
        
        const paths = actualConfig.compilerOptions?.paths;
        const baseUrl = actualConfig.compilerOptions?.baseUrl;

        if (paths && paths['@/*']) {
          results.push({
            passed: true,
            message: `${project.name}: 路径别名 @/* 已配置 ✓`,
          });
        } else {
          results.push({
            passed: false,
            message: `${project.name}: 路径别名 @/* 未配置`,
          });
        }

        if (baseUrl) {
          results.push({
            passed: true,
            message: `${project.name}: baseUrl 已配置 ✓`,
          });
        }
      } catch (error) {
        // 忽略解析错误，已在其他检查中处理
      }
    }

    return results;
  }

  checkPortConfig(project) {
    const results = [];
    if (!project.port) return results;

    const projectPath = join(rootDir, project.path);

    if (project.type === 'core') {
      // 检查 server.ts 中的端口配置
      const serverPath = join(projectPath, 'src', 'server.ts');
      if (existsSync(serverPath)) {
        const serverContent = readFileSync(serverPath, 'utf-8');
        if (serverContent.includes(`XIAOPEI_CORE_PORT`) || serverContent.includes('3000')) {
          results.push({
            passed: true,
            message: `${project.name}: 端口配置正确（使用环境变量）✓`,
          });
        }
      }
    }

    if (project.type === 'admin') {
      // 检查 vite.config.ts 中的端口配置
      const viteConfigPath = join(projectPath, 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const viteContent = readFileSync(viteConfigPath, 'utf-8');
        if (viteContent.includes('port: 5173')) {
          results.push({
            passed: true,
            message: `${project.name}: 端口配置正确（5173）✓`,
          });
        }
      }
    }

    return results;
  }

  checkVersionCompatibility() {
    const results = [];
    const versions = {};

    // 收集所有项目的 TypeScript 版本
    for (const project of projects) {
      const projectPath = join(rootDir, project.path);
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          const tsVersion = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;
          if (tsVersion) {
            versions[project.name] = tsVersion;
          }
        } catch (error) {
          // 忽略
        }
      }
    }

    // 检查版本一致性（允许小版本差异）
    const versionList = Object.values(versions);
    if (versionList.length > 1) {
      const uniqueVersions = new Set(versionList.map(v => {
        const parts = v.split('.');
        return parts[0] + '.' + parts[1];
      }));
      if (uniqueVersions.size > 1) {
        results.push({
          passed: false,
          message: `TypeScript 版本不一致: ${Object.entries(versions).map(([name, v]) => `${name}: ${v}`).join(', ')}`,
        });
      } else {
        results.push({
          passed: true,
          message: `TypeScript 版本基本一致 ✓`,
        });
      }
    }

    return results;
  }

  async runAllChecks(autoFix = false) {
    logSection('小佩项目自动化检测与修复');
    log(`运行时间: ${new Date().toLocaleString('zh-CN')}`, 'blue');

    // 1. 检查 Node.js 和 npm 版本
    logSection('1. 环境检查');
    const nodeCheck = this.checkNodeVersion();
    this.reportResult(nodeCheck);
    const npmCheck = this.checkNpmVersion();
    this.reportResult(npmCheck);

    // 2. 检查项目依赖
    logSection('2. 依赖检查');
    for (const project of projects) {
      const results = this.checkProjectDependencies(project);
      results.forEach(result => {
        this.reportResult(result);
        if (!result.passed && result.fix && autoFix) {
          this.fixes.push(result.fix);
        }
      });
    }

    // 3. 检查配置文件
    logSection('3. 配置文件检查');
    for (const project of projects) {
      const results = this.checkConfigFiles(project);
      results.forEach(result => this.reportResult(result));
    }

    // 4. 检查环境变量
    logSection('4. 环境变量检查');
    for (const project of projects) {
      const results = this.checkEnvFiles(project);
      results.forEach(result => {
        this.reportResult(result);
        if (!result.passed && result.fix && autoFix) {
          this.fixes.push(result.fix);
        }
      });
    }

    // 5. 检查路径别名
    logSection('5. 路径别名检查');
    for (const project of projects) {
      const results = this.checkPathAliases(project);
      results.forEach(result => this.reportResult(result));
    }

    // 6. 检查端口配置
    logSection('6. 端口配置检查');
    for (const project of projects) {
      const results = this.checkPortConfig(project);
      results.forEach(result => this.reportResult(result));
    }

    // 7. 检查版本兼容性
    logSection('7. 版本兼容性检查');
    const versionResults = this.checkVersionCompatibility();
    versionResults.forEach(result => this.reportResult(result));

    // 执行修复
    if (autoFix && this.fixes.length > 0) {
      logSection('执行自动修复');
      for (const fix of this.fixes) {
        fix();
      }
    }

    // 总结
    logSection('检查完成');
    const totalIssues = this.issues.filter(i => !i.passed).length;
    if (totalIssues === 0) {
      log('✓ 所有检查通过！', 'green');
    } else {
      log(`发现 ${totalIssues} 个问题`, 'yellow');
      if (!autoFix) {
        log('提示: 使用 --fix 参数可以自动修复部分问题', 'cyan');
      }
    }
  }

  reportResult(result) {
    if (result.passed) {
      log(`  ✓ ${result.message}`, 'green');
    } else {
      log(`  ✗ ${result.message}`, 'red');
      this.issues.push(result);
    }
  }
}

// 清理缓存函数
function cleanCache(project) {
  const projectPath = join(rootDir, project.path);
  log(`正在清理 ${project.name} 的缓存...`, 'yellow');

  try {
    if (project.type === 'app') {
      // Expo 缓存目录
      const expoCachePath = join(projectPath, '.expo');
      if (existsSync(expoCachePath)) {
        execSync(`rm -rf "${expoCachePath}"`, { cwd: projectPath });
        log(`${project.name}: .expo 缓存已清理 ✓`, 'green');
      }
    }

    if (project.type === 'admin') {
      // Vite 缓存
      const viteCachePath = join(projectPath, 'node_modules', '.vite');
      if (existsSync(viteCachePath)) {
        execSync(`rm -rf "${viteCachePath}"`, { cwd: projectPath });
        log(`${project.name}: Vite 缓存已清理 ✓`, 'green');
      }
    }

    // node_modules/.cache
    const cachePath = join(projectPath, 'node_modules', '.cache');
    if (existsSync(cachePath)) {
      execSync(`rm -rf "${cachePath}"`, { cwd: projectPath });
      log(`${project.name}: node_modules/.cache 已清理 ✓`, 'green');
    }

    // npm 缓存（可选）
    log(`${project.name}: 缓存清理完成 ✓`, 'green');
  } catch (error) {
    log(`${project.name}: 缓存清理失败: ${error.message}`, 'red');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const autoFix = args.includes('--fix') || args.includes('-f');
  const clean = args.includes('--clean') || args.includes('-c');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
小佩项目自动化检测与修复脚本

用法:
  node scripts/check-and-fix.js [选项]

选项:
  --fix, -f      自动修复可修复的问题
  --clean, -c    清理所有项目的缓存
  --help, -h     显示帮助信息

示例:
  node scripts/check-and-fix.js           # 仅检查
  node scripts/check-and-fix.js --fix     # 检查并自动修复
  node scripts/check-and-fix.js --clean   # 清理缓存
    `);
    return;
  }

  const checker = new ProjectChecker();

  if (clean) {
    logSection('清理缓存');
    for (const project of projects) {
      cleanCache(project);
    }
    log('缓存清理完成 ✓', 'green');
  }

  await checker.runAllChecks(autoFix);
}

// 运行
main().catch(error => {
  log(`错误: ${error.message}`, 'red');
  process.exit(1);
});

