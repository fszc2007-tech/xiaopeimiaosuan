// 新增理由：数学工具函数
// 回滚方式：回退此文件

/**
 * 模运算（处理负数）
 */
export function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 * 标准化角度到 0-360 度
 */
export function normDeg(x) {
  let y = x % 360;
  if (y < 0) y += 360;
  return y;
}

/**
 * 儒略日计算（UTC）
 */
export function jdnUTC(d) {
  const y = d.getUTCFullYear();
  let m = d.getUTCMonth() + 1;
  const day = d.getUTCDate() + d.getUTCHours() / 24 + 
              d.getUTCMinutes() / (24 * 60) + 
              d.getUTCSeconds() / (24 * 3600);
  
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  return Math.floor(365.25 * (Y + 4716)) + 
         Math.floor(30.6001 * (M + 1)) + 
         day + B - 1524.5;
}

/**
 * 儒略日计算（简化版）
 */
export function jd(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * 世纪数计算
 */
export function cent(jd) {
  return (jd - 2451545.0) / 36525;
}

/**
 * 牛顿法求解（用于节气计算）
 */
export function newtonSolve(f, df, x0, maxIter = 40, tolerance = 1e-6) {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    if (Math.abs(fx) < tolerance) break;
    
    const dfx = df(x);
    if (Math.abs(dfx) < 1e-9) break;
    
    x = x - fx / dfx;
  }
  return x;
}

/**
 * 二分法求解
 */
export function bisectionSolve(f, a, b, maxIter = 40, tolerance = 1e-6) {
  let fa = f(a), fb = f(b);
  
  for (let i = 0; i < maxIter; i++) {
    if (Math.abs(fb) < tolerance || Math.abs(a - b) < 1000) break;
    
    const t = b - fb * (b - a) / (fb - fa || 1e-9);
    const m = t;
    const fm = f(m);
    
    a = b; fa = fb;
    b = m; fb = fm;
  }
  
  return b;
}
