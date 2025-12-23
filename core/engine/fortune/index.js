// 新增理由：大运流年流月计算模块
// 回滚方式：回退此文件

// ===== 基础干支 =====
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const YANG_STEMS = new Set(["甲","丙","戊","庚","壬"]);

function mod(n,m){ return ((n % m) + m) % m; }
function stemIndex(s){ return STEMS.indexOf(s); }
function branchIndex(z){ return BRANCHES.indexOf(z); }

// ====== 太阳黄经 & 节气（与 v6.0 同源的简化实现） ======
const DEG = Math.PI/180;
function jd(date){ return date.getTime()/86400000 + 2440587.5; }         // UTC→JD
function cent(jd){ return (jd - 2451545.0)/36525; }                      // TT/世纪
function normDeg(x){ let y = x % 360; if(y<0) y += 360; return y; }

function sunMeanAnom(T){ return normDeg(357.52911 + T*(35999.05029 - 0.0001537*T)); }
function sunMeanLong(T){ return normDeg(280.46646 + T*(36000.76983 + 0.0003032*T)); }
function sunEqCenter(T,M){ const r=M*DEG;
  return (1.914602 - T*(0.004817 + 0.000014*T))*Math.sin(r)
       + (0.019993 - 0.000101*T)*Math.sin(2*r)
       + 0.000289*Math.sin(3*r);
}
function sunAppLong(T,L){ const omega = normDeg(125.04 - 1934.136*T); return L - 0.00569 - 0.00478*Math.sin(omega*DEG); }

function solarLongitude(dateUTC){
  const jdUTC = jd(dateUTC), jdTT = jdUTC + 69/86400; // ΔT≈69s，足够工程精度
  const T = cent(jdTT);
  const L0 = sunMeanLong(T), M = sunMeanAnom(T), C = sunEqCenter(T,M);
  return normDeg(sunAppLong(T, L0 + C));
}

// 24节点名（与 v6.0 同序：lambda∈[0,15)→"春分"为 prev）
const SOLAR_NAMES = ["春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露",
                     "秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","惊蛰"];

// 数值逼近到指定黄经
function solveSolarLongitude(dateGuess, targetDeg){
  const f=(d)=>{ let y = solarLongitude(d) - targetDeg; return ((y+540)%360)-180; };
  let a = new Date(dateGuess.getTime() - 36*3600*1000);
  let b = new Date(dateGuess.getTime() + 36*3600*1000);
  let fa = f(a), fb = f(b);
  for(let i=0;i<40;i++){
    const t = b.getTime() - fb*(b.getTime()-a.getTime())/(fb-fa || 1e-9);
    const m = new Date(t), fm = f(m);
    a = b; fa = fb; b = m; fb = fm;
    if(Math.abs(fb) < 1e-6 || Math.abs(a.getTime()-b.getTime()) < 1000) break;
  }
  return b;
}

// 返回"上一个/下一个"15°节点（v6.0 用法）
function solarWindow(dateUTC){
  const lambda = solarLongitude(dateUTC);
  const prevK = Math.floor(lambda/15), nextK = prevK + 1;
  const prev = solveSolarLongitude(new Date(dateUTC.getTime() - 10*86400000), prevK*15);
  const next = solveSolarLongitude(new Date(dateUTC.getTime() + 10*86400000), nextK*15);
  return [{name:SOLAR_NAMES[mod(prevK,24)], time:prev}, {name:SOLAR_NAMES[mod(nextK,24)], time:next}];
}

// 找"下一个节"（非中气）。按常用 12"节"集合筛选。
const JIE_SET = new Set(["立春","惊蛰","清明","立夏","芒种","小暑","立秋","白露","寒露","立冬","大雪","小寒"]);
function nextJie(dateUTC){
  const lambda = solarLongitude(dateUTC);
  let k = Math.floor(lambda/15) + 1; // 下一个 15°
  for(let i=0;i<30;i++,k++){
    const name = SOLAR_NAMES[mod(k,24)];
    if(JIE_SET.has(name)){
      const t = solveSolarLongitude(dateUTC, mod(k,24)*15);
      return { name, time: t };
    }
  }
  throw new Error("nextJie 计算失败");
}

// —— 月支：按"上一个节气名"映射（与你现版一致）
function monthBranchByPrevTerm(name){
  const map={"立春":"寅","雨水":"寅","惊蛰":"卯","春分":"卯","清明":"辰","谷雨":"辰",
             "立夏":"巳","小满":"巳","芒种":"午","夏至":"午","小暑":"未","大暑":"未",
             "立秋":"申","处暑":"申","白露":"酉","秋分":"酉","寒露":"戌","霜降":"戌",
             "立冬":"亥","小雪":"亥","大雪":"子","冬至":"子","小寒":"丑","大寒":"丑"};
  return map[name] || "申";
}

// 月干：年干→月干表（与你现版一致）
const MONTH_STEM_BY_YEAR_STEM={
  "甲": ["丙","丁","戊","己","庚","辛","壬","癸","甲","乙","丙","丁"],
  "己": ["丙","丁","戊","己","庚","辛","壬","癸","甲","乙","丙","丁"],
  "乙": ["戊","己","庚","辛","壬","癸","甲","乙","丙","丁","戊","己"],
  "庚": ["戊","己","庚","辛","壬","癸","甲","乙","丙","丁","戊","己"],
  "丙": ["庚","辛","壬","癸","甲","乙","丙","丁","戊","己","庚","辛"],
  "辛": ["庚","辛","壬","癸","甲","乙","丙","丁","戊","己","庚","辛"],
  "丁": ["壬","癸","甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
  "壬": ["壬","癸","甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
  "戊": ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸","甲","乙"],
  "癸": ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸","甲","乙"]
};

// ====== 立春分年（年柱） ======
function yearPillarByLichun(dateUTC){
  const lichunGuess = new Date(Date.UTC(dateUTC.getUTCFullYear(),1,4,0,0,0)); // 附近
  const lichunUTC = solveSolarLongitude(lichunGuess, 21*15); // 315°
  const y = (dateUTC < lichunUTC) ? dateUTC.getUTCFullYear()-1 : dateUTC.getUTCFullYear();
  const idx = mod(y - 1984, 60);
  return { stem: STEMS[mod(idx,10)], branch: BRANCHES[mod(idx,12)] };
}

// ====== 大运方向（男阳女阴顺，男阴女阳逆） ======
// ✅ 修复：支持中文和英文格式
function normalizeSexForFortune(sex) {
  if (sex == null) return 'unknown';
  const s = String(sex).trim().toLowerCase();
  if (['男', 'male', 'm', 'man', 'boy', '1', 'true'].includes(s)) return 'male';
  if (['女', 'female', 'f', 'woman', 'girl', '0', 'false'].includes(s)) return 'female';
  return 'unknown';
}

export function yunDirection(sex, yearStem){
  const normalizedSex = normalizeSexForFortune(sex);
  const isYangYear = YANG_STEMS.has(yearStem);
  // ✅ 修复：使用标准化后的性别判断
  return (normalizedSex === "male" && isYangYear) || (normalizedSex === "female" && !isYangYear) ? "forward" : "backward";
}

// ====== 起运（"三天一岁"法：出生→下一个"节"的时差折算） ======
/**
 * 计算起运岁月（3天=1岁，1天=4个月）
 * @param {Date} birthUTC  出生 UTC 时间（Date 对象）
 * @returns {{years:number, months:number, days:number, hours:number, diffDays:number, nextJieName:string, nextJieUTC:Date}}
 */
export function qiYun3DaysRule(birthUTC){
  const { name, time: next } = nextJie(birthUTC); // 下一个"节"（请确保返回 UTC）
  // 严格用 UTC 差值
  const diffMs   = next.getTime() - birthUTC.getTime();
  const diffDays = diffMs / 86400000;

  // —— 口径修正：先取整到"整天"（月份只可能是 0/4/8）
  const daysInt  = Math.floor(diffDays + 1e-7);   // 防毛刺，更稳妥

  // 三天一岁 → 精确到"岁+月"，不保留天/小时
  const years  = Math.floor(daysInt / 3);
  const months = (daysInt - years * 3) * 4;      // 只会得到 0/4/8

  // 与你原返回结构对齐
  const days   = 0;
  const hours  = 0;

  return { years, months, days, hours, diffDays, daysInt, nextJieName: name, nextJieUTC: next };
}

// ====== 大运序列（每 10 年一柱；第一步=在月柱基础上先走一柱） ======
/**
 * 由"月柱"推大运干支序列
 * @param {{stem:string, branch:string}} monthPillar  出生月柱（与主盘口径一致：建议"节入月"）
 * @param {'forward'|'backward'} dir                  顺/逆（男阳女阴顺、男阴女阳逆）
 * @param {number} [steps=8]                          生成几步（每步=10年）
 * @param {number} [offset=1]                         第一柱相对月柱的偏移：默认 1；若"在节上出生且师承取本柱"为第一步，可设 0
 * @returns {Array<{stem:string, branch:string}>}
 */
export function luckPillars(monthPillar, dir='forward', steps=8, offset=1){
  // —— 输入校验
  if(!monthPillar || typeof monthPillar.stem!=='string' || typeof monthPillar.branch!=='string'){
    throw new Error('monthPillar 无效：需要 {stem, branch}');
  }
  const s0 = stemIndex(monthPillar.stem);
  const b0 = branchIndex(monthPillar.branch);
  if(s0<0 || b0<0) throw new Error(`monthPillar 无效：stem=${monthPillar.stem}，branch=${monthPillar.branch}`);

  if(dir!=='forward' && dir!=='backward'){
    throw new Error(`dir 无效：${dir}（应为 'forward' 或 'backward'）`);
  }
  if(!Number.isInteger(steps) || steps<0) throw new Error(`steps 无效：${steps}`);
  if(!Number.isInteger(offset) || offset<0) throw new Error(`offset 无效：${offset}`);

  // —— 计算起点：在月柱基础上先偏移 offset 柱
  let sIdx = s0, bIdx = b0;
  if(dir==='forward'){
    sIdx = mod(sIdx + offset, 10);
    bIdx = mod(bIdx + offset, 12);
  }else{
    sIdx = mod(sIdx - offset, 10);
    bIdx = mod(bIdx - offset, 12);
  }

  // —— 生成序列
  const out = [];
  for(let i=0; i<steps; i++){
    out.push({ stem: STEMS[sIdx], branch: BRANCHES[bIdx] });
    if(dir==='forward'){
      sIdx = mod(sIdx + 1, 10);
      bIdx = mod(bIdx + 1, 12);
    }else{
      sIdx = mod(sIdx - 1, 10);
      bIdx = mod(bIdx - 1, 12);
    }
  }
  return out;
}

// ====== 流年（立春分年） ======
/**
 * @param {Date} dateUTC 某一时刻（UTC）
 * @returns {{stem:string, branch:string, year:number, lichunUTC:Date}}
 */
export function liuNianPillar(dateUTC){
  const lcGuess = new Date(Date.UTC(dateUTC.getUTCFullYear(),1,4,0,0,0));
  const lichunUTC = solveSolarLongitude(lcGuess, 21*15);
  const y = (dateUTC < lichunUTC) ? dateUTC.getUTCFullYear()-1 : dateUTC.getUTCFullYear();
  const idx = mod(y - 1984, 60);
  return { stem: STEMS[mod(idx,10)], branch: BRANCHES[mod(idx,12)], year: y, lichunUTC };
}

// ====== 流月（节入月；年干→月干表） ======
/**
 * @param {Date} dateUTC 任一时刻（UTC）
 * @param {string} yearStem 当年干（建议：用 liuNianPillar(dateUTC).stem）
 * @returns {{stem:string, branch:string, prevTerm:{name:string,time:Date}, nextTerm:{name:string,time:Date}}}
 */
export function liuYuePillar(dateUTC, yearStem){
  const [prev, next] = solarWindow(dateUTC);              // 上/下一个 15° 节气
  const monthBranch = monthBranchByPrevTerm(prev.name);   // 以"上一节气名"定支
  const idx = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"].indexOf(monthBranch);
  if(idx<0) throw new Error("monthBranch 计算失败");
  const stem = (MONTH_STEM_BY_YEAR_STEM[yearStem] || [])[idx];
  if(!stem) throw new Error("yearStem 无法映射月干");
  return { stem, branch: monthBranch, prevTerm: prev, nextTerm: next };
}

// ====== 便捷聚合：给出生信息 → 起运 & 大运/当前流年流月 ======
/**
 * @param {Date} birthUTC 出生 UTC
 * @param {"male"|"female"} sex 性别（定大运顺逆）
 * @param {{stem:string, branch:string}} monthPillar 出生时的月柱（你的盘已算好）
 * @param {{now?:Date}} [opts]
 */
export function computeAllFortunes(birthUTC, sex, monthPillar, opts={}){
  const now = opts.now || new Date();
  const yearInfo = liuNianPillar(now);
  const monthInfo = liuYuePillar(now, yearInfo.stem);
  const birthYearInfo = yearPillarByLichun(birthUTC); // 使用出生年的年干
  const dir = yunDirection(sex, birthYearInfo.stem); // 用出生年的干
  const qi = qiYun3DaysRule(birthUTC);
  const lucks = luckPillars(monthPillar, dir, 8);
  return { dir, qi, lucks, currentYear: yearInfo, currentMonth: monthInfo };
}
