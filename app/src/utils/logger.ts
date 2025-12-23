/**
 * 统一日志工具
 * 记录所有用户操作和系统状态
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogCategory = 'auth' | 'api' | 'navigation' | 'user_action' | 'system';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // 最多保存 500 条日志

  private formatTimestamp(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  }

  private log(level: LogLevel, category: LogCategory, action: string, data?: any) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      category,
      action,
      data,
    };

    // 保存到内存
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    const prefix = `[${entry.timestamp}] [${category.toUpperCase()}]`;
    const message = `${action}`;
    const logData = data ? JSON.stringify(data, null, 2) : '';

    switch (level) {
      case 'error':
        console.error(`❌ ${prefix} ${message}`, logData);
        break;
      case 'warn':
        console.warn(`⚠️ ${prefix} ${message}`, logData);
        break;
      case 'debug':
        console.debug(`🔍 ${prefix} ${message}`, logData);
        break;
      default:
        console.log(`✅ ${prefix} ${message}`, logData);
    }
  }

  // 认证相关
  auth(action: string, data?: any) {
    this.log('info', 'auth', action, data);
  }

  // API 调用
  api(action: string, data?: any) {
    this.log('info', 'api', action, data);
  }

  // 导航
  navigation(action: string, data?: any) {
    this.log('info', 'navigation', action, data);
  }

  // 用户操作
  userAction(action: string, data?: any) {
    this.log('info', 'user_action', action, data);
  }

  // 系统状态
  system(action: string, data?: any) {
    this.log('info', 'system', action, data);
  }

  // 错误
  error(category: LogCategory, action: string, error: any) {
    this.log('error', category, action, {
      message: error?.message || String(error),
      stack: error?.stack,
    });
  }

  // 警告
  warn(category: LogCategory, action: string, data?: any) {
    this.log('warn', category, action, data);
  }

  // 调试
  debug(category: LogCategory, action: string, data?: any) {
    this.log('debug', category, action, data);
  }

  // 获取最近的日志
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // 清空日志
  clear() {
    this.logs = [];
  }

  // 导出日志
  export(): string {
    return this.logs.map(entry => 
      `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.action} ${entry.data ? JSON.stringify(entry.data) : ''}`
    ).join('\n');
  }
}

export const logger = new Logger();

// 全局错误捕获
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error('system', '全局错误', {
      isFatal,
      error: error?.message || String(error),
      stack: error?.stack,
    });
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

