/**
 * Google OAuth 配置
 * 
 * ⚠️ P0 关键说明：
 * - webClientId 必须是 Web 类型的 Client ID（不是 Android/iOS Client ID）
 * - 只有配置了有效的 webClientId，idToken 才会非空
 * - 没有 webClientId，整个登录链路无法工作
 */

/**
 * 按环境注入配置（dev/staging/prod）
 */
const getGoogleConfig = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  return {
    // ⚠️ P0 必须：Web Client ID（必须是 Web 类型的 Client ID）
    // 只有配置了有效的 webClientId，idToken 才会非空
    webClientId: env === 'production' 
      ? '343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com'  // 生产环境 Web Client ID
      : '343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com',  // 开发环境 Web Client ID（当前与生产相同）
    
    // iOS Client ID（已确认）
    iosClientId: '343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com',
    
    // Android Client ID（已确认）
    androidClientId: '343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com',
    
    // 请求的权限范围
    scopes: ['profile', 'email'],
    
    // 是否请求离线访问
    offlineAccess: false,
  };
};

export const GOOGLE_CONFIG = getGoogleConfig();

// 启动时打印配置（开发模式 + 生产环境诊断）
if (__DEV__) {
  console.log('[Google Config] 🔑 Web Client ID:', GOOGLE_CONFIG.webClientId);
  console.log('[Google Config] 📱 iOS Client ID:', GOOGLE_CONFIG.iosClientId);
  console.log('[Google Config] 🤖 Android Client ID:', GOOGLE_CONFIG.androidClientId);
}

// ⚠️ P0 诊断：生产环境也强制打印一次（用于排查）
console.warn('[GOOGLE CONFIG DIAGNOSTIC] 🔍 Web Client ID:', GOOGLE_CONFIG.webClientId);
console.warn('[GOOGLE CONFIG DIAGNOSTIC] 🔍 Environment:', process.env.EXPO_PUBLIC_ENV || 'development');

