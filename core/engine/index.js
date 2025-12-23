// 新增理由：八字引擎主入口，整合所有模块
// 回滚方式：回退此文件

import { solarToLunar, lunarToSolar } from './lunar/index.js';
import { solarLongitude, solveSolarLongitude, solarWindow, monthBranchByPrevTerm } from './astronomy/index.js';
import { yearPillarByLichun, monthPillar, dayPillar, hourPillar } from './ganzhi/index.js';
import { hiddenTaggedOf, hiddenPlainOf, tenGod, nayin, stage12, computeXingyun } from './mingli/index.js';
import { computeAllShensha } from './shensha/index.js';
import { 
  buildEnergyFlowMetrics as _buildEnergyFlowMetrics,
  buildGuancaiPattern as _buildGuancaiPattern,
  buildYongshenPattern as _buildYongshenPattern,
  buildMinggeSummary as _buildMinggeSummary,
  buildLuckRhythmMetrics as _buildLuckRhythmMetrics,
  buildTimeCoordinateMetrics as _buildTimeCoordinateMetrics,
  // LuckRhythm helpers (for TimeCoordinate and compute)
  getElementFromPillar as _getElementFromPillar,
  determineFavourLevel as _determineFavourLevel,
  analyzeClashHarmPunish as _analyzeClashHarmPunish,
  isChong as _isChong,
  calculateFavourScore as _calculateFavourScore,
} from './cards/index.js';
import { parseTZFlexible, formatTZ } from './utils/timezone.js';
import { hourIndexFromLocalHour, applyTrueSolarTime } from './astronomy/tst.js';
import { computeAllFortunes, luckPillars, liuNianPillar, liuYuePillar } from './fortune/index.js';
import { normalizeGender, isMale } from './utils/gender.js';
import { computeDayMasterStrength } from './analysis/daymaster.js';
import { computeWuXing } from './analysis/wuxing.js';
import { computeFavoredAvoid } from './analysis/favored.js';
import { judgeStructure } from './analysis/structure.js';
import { analyzeTiyong } from './analysis/tiyong.js';
import { analyzeDogong } from './analysis/dogong.js';
import { calculatePurity } from './analysis/purity.js';
import { analyzeWealthRooting } from './analysis/wealthRoot.js';
import { calculateAllPalaces } from './mingli/palaces.js';
import { kongWangByIndex } from './shensha/kongwang.js';
import { getSeason, getTiaohouRules, generateTiaohouLabel, mapTiaohouTendency, generateTiaohouSuggestion } from './analysis/tiaohou.js';

/**
 * 八字引擎主类
 */
export class BaziEngine {
  constructor() {
    this.version = "6.0";
  }

  /**
   * 计算八字
   * @param {Object} birthJson 出生信息
   * @returns {Object} 八字结果
   */
  async compute(birthJson, options = {}) {
    const {
      sex, calendar_type, year, month, day, hour, minute, tz,
      use_tst = false, hour_ref = "midnight", place = ""
    } = birthJson;
    
    // ✅ 统一时间源：从 options 获取 now，如果没有则使用当前时间
    const now = options.now || new Date();

    // ✅ 标准化性别输入（统一处理各种格式）
    const normalizedSex = normalizeGender(sex);
    if (normalizedSex === 'unknown') {
      console.warn('[BaziEngine] Unknown gender input:', sex, 'defaulting to female');
    }

    // 1. 处理农历输入
    let solarDate;
    let calendarFrom = "";
    
    if (calendar_type === "农历") {
      // 农历输入直接转换为公历
      const solar = lunarToSolar(year, month, day, birthJson.isLeap || false);
      solarDate = { year: solar.year, month: solar.month, day: solar.day };
      calendarFrom = `农历输入：${year}年${birthJson.isLeap ? "闰" : ""}${month}月${day}日 → 换算公历 ${solar.year}-${solar.month}-${solar.day}`;
    } else {
      solarDate = { year, month, day };
      calendarFrom = `公历输入：${year}-${month}-${day}`;
    }

    // 2. 时间解析
    const { hour: parsedHour, minute: parsedMinute } = parseTimeString(hour, minute);
    
    // 3. 时区处理
    const tzMin = parseTZFlexible(tz);
    const local = new Date(Date.UTC(solarDate.year, solarDate.month - 1, solarDate.day, parsedHour, parsedMinute) - tzMin * 60000);
    const utc = new Date(local.getTime() + tzMin * 60000);

    // 3. 真太阳时修正
    let hourBase = local;
    if (use_tst && birthJson.longitude) {
      hourBase = applyTrueSolarTime(local, birthJson.longitude, birthJson.std_meridian || 120);
    }

    // 4. 计算四柱
    const lichun = solveSolarLongitude(new Date(Date.UTC(utc.getUTCFullYear(), 1, 4, 0, 0, 0)), 21 * 15);
    const yearP = yearPillarByLichun(utc, lichun);

    const [prev, next] = solarWindow(utc);
    const monthBranch = monthBranchByPrevTerm(prev.name);
    const monthP = monthPillar(yearP.stem, monthBranch);

    const dayP = dayPillar(utc);

    // 处理夜子时
    let dayStemForHour = dayP.stem;
    if (hour_ref === "prev_zi" && (hour >= 23 || hour < 1)) {
      dayStemForHour = dayPillar(new Date(utc.getTime() - 24 * 3600 * 1000)).stem;
    }

    const hourIdx = hourIndexFromLocalHour(hourBase.getHours() + hourBase.getMinutes() / 60);
    const hourP = hourPillar(dayStemForHour, hourIdx, "wushudun");

    // 5. 丰富四柱信息（使用标准化后的性别）
    const pillars = {
      year: this.enrichPillar(yearP, dayP.stem, normalizedSex),
      month: this.enrichPillar(monthP, dayP.stem, normalizedSex),
      day: this.enrichPillar(dayP, dayP.stem, normalizedSex, true),
      hour: this.enrichPillar(hourP, dayP.stem, normalizedSex)
    };

    // 6. 计算神煞
    const shensha = this.calculateShensha(pillars);

    // 7. 计算大运流年流月（使用标准化后的性别）
    const fortune = computeAllFortunes(utc, normalizedSex, monthP, { now: new Date() });

    // 8. 计算分析数据（新增）
    const dayMasterStrength = computeDayMasterStrength(pillars, { school: 'ziping' });
    const wuxingPercent = computeWuXing(pillars);
    const favoredAvoid = computeFavoredAvoid(pillars, dayMasterStrength, wuxingPercent);
    
    // 计算格局
    const structureResult = await judgeStructure(pillars, dayMasterStrength, { school: 'ziping' });
    
    // 计算做功（需要基础分析对象）
    const baseAnalysis = {
      dayMaster: { gan: dayP.stem },
      strength: dayMasterStrength
    };
    const dogongResult = analyzeDogong(pillars, baseAnalysis, {});
    
    // 计算体用（需要做功的 graph 和 strengthMap）
    const tiyongResult = analyzeTiyong(pillars, dogongResult.strengthMap, dogongResult.graph, {});
    
    // 计算清浊（需要格局的 W 和 structureName）
    const purityResult = calculatePurity(
      pillars, 
      dayMasterStrength, 
      structureResult.W || {}, 
      structureResult.structure || '未知格局',
      {}
    );
    
    // 计算调候
    const dayMasterElement = this.getStemWuxing(dayP.stem);
    const season = getSeason(pillars.month?.branch);
    const tiaohouResult = getTiaohouRules(season, dayMasterElement, pillars);
    
    // 计算宫位（命宫、胎元、身宫）
    let palacesResult = null;
    try {
      // 确保 pillars 结构正确（需要 stem 和 branch）
      const pillarsForPalaces = {
        year: { stem: pillars.year.stem, branch: pillars.year.branch },
        month: { stem: pillars.month.stem, branch: pillars.month.branch },
        hour: { stem: pillars.hour.stem, branch: pillars.hour.branch }
      };
      palacesResult = calculateAllPalaces(pillarsForPalaces);
    } catch (error) {
      console.error('[BaziEngine] 宫位计算失败:', error);
      // 如果宫位计算失败，使用默认值
      palacesResult = {
        mingGong: null,
        taiYuan: null,
        shenGong: null,
        mingShenRelation: '计算失败'
      };
    }
    
    // 计算藏干统计
    const hiddenStems = {};
    ['year', 'month', 'day', 'hour'].forEach(pillarName => {
      const pillar = pillars[pillarName];
      if (pillar && pillar.canggan) {
        pillar.canggan.forEach(stem => {
          hiddenStems[stem] = (hiddenStems[stem] || 0) + 1;
        });
      }
    });
    
    // 获取日主信息
    const dayMaster = {
      gan: dayP.stem,
      zhi: dayP.branch,
      wuxing: this.getStemWuxing(dayP.stem),
      yinyang: this.getStemYinYang(dayP.stem),
      strength: Math.round(dayMasterStrength.score * 100), // 转换为 0-100
      strengthLabel: dayMasterStrength.band,
      description: `日主${dayP.stem}${dayP.branch}，五行属${this.getStemWuxing(dayP.stem)}，${dayP.stem === '甲' || dayP.stem === '丙' || dayP.stem === '戊' || dayP.stem === '庚' || dayP.stem === '壬' ? '阳' : '阴'}干。当前日主强弱为${dayMasterStrength.band}。`
    };
    
    const analysis = {
      dayMaster,
      wuxingPercent,
      nayin: {
        year: pillars.year.nayin,
        month: pillars.month.nayin,
        day: pillars.day.nayin,
        hour: pillars.hour.nayin,
      },
      hiddenStems,
      strengthAnalysis: {
        score: Math.round(dayMasterStrength.score * 100),
        label: dayMasterStrength.band,
        factors: {
          得令: dayMasterStrength.detail?.w_month > 0.4,
          得地: dayMasterStrength.detail?.root > 0.3,
          得生: dayMasterStrength.detail?.help > 0.2,
          得助: dayMasterStrength.detail?.help > 0.15,
        },
        // ✅ 新增：返回完整的数值数据供前端显示
        detail: {
          w_month: dayMasterStrength.detail?.w_month || 0,
          root: dayMasterStrength.detail?.root || 0,
          help: dayMasterStrength.detail?.help || 0,
          drain: dayMasterStrength.detail?.drain || 0,
          // 额外信息
          biPower: dayMasterStrength.detail?.biPower || 0,
          printPower: dayMasterStrength.detail?.printPower || 0,
        }
      },
      gods: {
        favorable: favoredAvoid.favored,
        unfavorable: favoredAvoid.avoid,
        neutral: [],
        wangxiang: favoredAvoid.wangxiang || {},
      },
      // 新增：格局分析
      structure: {
        name: structureResult.structure || '未知格局',
        confidence: structureResult.confidence || 0,
        reasons: structureResult.reasons || [],
        tenGodWeights: structureResult.W || {},
        // 破格因素和格局纯度
        pogeFactors: structureResult.pogeFactors || [],
        patternPurity: structureResult.patternPurity || null, // 格局纯度（包含破格和救应）
      },
      // 新增：体用分析
      tiyong: {
        carryingCapacity: tiyongResult.carryingCapacity || 0,
        bodyStrength: tiyongResult.bodyStrength || 0,
        useStrength: tiyongResult.useStrength || 0,
        passThroughDegree: tiyongResult.passThroughDegree || 0,
        destructionPenalty: tiyongResult.destructionPenalty || 0,
        capacityLevel: tiyongResult.capacityLevel || '中等',
        interpretation: tiyongResult.interpretation || ''
      },
      // 新增：做功分析
      dogong: {
        coreLine: dogongResult.coreLine ? {
          path: Array.isArray(dogongResult.coreLine.path) ? dogongResult.coreLine.path : null,
          type: dogongResult.coreLine.type ? (typeof dogongResult.coreLine.type === 'object' ? dogongResult.coreLine.type.type : dogongResult.coreLine.type) : null,
          workForce: typeof dogongResult.coreLine.workForce === 'number' ? dogongResult.coreLine.workForce : 0
        } : null,
        strongestPaths: (dogongResult.strongestPaths || []).slice(0, 5).map(path => ({
          path: Array.isArray(path.path) ? path.path : null,
          type: path.type ? (typeof path.type === 'object' ? path.type.type : path.type) : null,
          workForce: typeof path.workForce === 'number' ? path.workForce : 0
        })),
        workTypeSummary: dogongResult.workTypeSummary || {}
      },
      // 新增：清浊分析
      purity: {
        score: purityResult.score || 0,
        level: purityResult.level || '中清',
        details: purityResult.details || {}
      },
      // 新增：宫位分析（四柱宫位含义 + 命宫胎元身宫）
      palaces: {
        // 四柱宫位含义（八字基本概念）
        fourPillarsPalaces: {
          year: {
            name: '年柱',
            meanings: ['祖上', '父母', '童年运势', '根基'],
            ganMeaning: '通常代表祖父、父亲或外部环境',
            zhiMeaning: '通常代表祖母、母亲或祖业、原生家庭'
          },
          month: {
            name: '月柱',
            meanings: ['父母', '兄弟', '事业', '工作环境', '青年运势'],
            ganMeaning: '代表门户、步入社会后的初步发展',
            zhiMeaning: '月令（月支）决定五行能量旺衰，非常重要'
          },
          day: {
            name: '日柱',
            meanings: ['自己', '配偶', '中年运势'],
            ganMeaning: '日主（日干）代表自己，是八字分析的核心',
            zhiMeaning: '婚姻宫、配偶，看婚姻感情最关键的位置'
          },
          hour: {
            name: '时柱',
            meanings: ['子女', '晚辈', '学生', '晚年运势', '成果'],
            ganMeaning: '通常代表子女、事业成果',
            zhiMeaning: '通常代表晚年生活、最终的归宿'
          }
        },
        // 命宫、胎元、身宫（紫微斗数概念，保留作为补充）
        mingGong: palacesResult?.mingGong || null,
        taiYuan: palacesResult?.taiYuan || null,
        shenGong: palacesResult?.shenGong || null,
        mingShenRelation: palacesResult?.mingShenRelation || null
      },
      // 新增：命格總評
      minggeSummary: this.buildMinggeSummary(
        dayMasterStrength,
        structureResult,
        purityResult,
        structureResult.patternPurity || null,
        tiaohouResult
      ),
      // 新增：用神格局
      yongshenPattern: this.buildYongshenPattern(
        wuxingPercent,
        favoredAvoid,
        tiyongResult,
        dogongResult,
        purityResult,
        tiaohouResult,
        pillars,
        dayP.stem
      ),
      // 新增：官財格局
      guancaiPattern: await this.buildGuancaiPatternAsync(
        structureResult,
        purityResult,
        { factors: structureResult.pogeFactors || [] },
        structureResult.patternPurity || {},
        dogongResult,
        pillars,
        dayP.stem
      ),
      // 新增：能量流通
      energyFlow: this.buildEnergyFlowMetrics(
        structureResult,
        dayMasterStrength,
        favoredAvoid,
        wuxingPercent,
        dogongResult,
        structureResult.patternPurity || {},
        purityResult
      ),
    };

    // 9. 计算大运年龄和详细信息（基于实际起运时间）
    // 起运年龄：按照标准算法，第一个大运开始年龄 = 起运年龄
    const startAgeYears = fortune.qi.years; // 只取"岁"以匹配区间口径
    
    // 计算第一个大运的起运时间（精确到月）
    const firstLuckStartUTC = this.addYearsMonthsUTC(utc, fortune.qi.years, fortune.qi.months);
    
    // 若在"节点上出生"，把第一步设为月柱本身
    const offset = (fortune.qi.years === 0 && fortune.qi.months === 0) ? 0 : 1;
    
    // 重新计算大运序列（确保顺逆和offset正确）
    const dir = fortune.dir;
    const lucks = luckPillars(monthP, dir, 8, offset);
    
    const luckCycleWithAge = lucks.map((luck, index) => {
      const startAge = startAgeYears + index * 10;
      const endAge = startAgeYears + (index + 1) * 10;

      // 起止时间：以"120个月"为步进（精确到月）
      const startUTC = this.addYearsMonthsUTC(firstLuckStartUTC, index * 10, 0);
      const endUTC = this.addYearsMonthsUTC(firstLuckStartUTC, (index + 1) * 10, 0);

      // 为大运创建临时的四柱信息来计算神煞
      const tempPillars = {
        year: pillars.year,
        month: luck, // 大运替换月柱
        day: pillars.day,
        hour: pillars.hour
      };
      const enrichedLuck = this.enrichPillar(luck, pillars.day.stem, normalizedSex, false, true, tempPillars);
      
      // 计算大运五行
      const luckElement = this.getElementFromPillar(luck);
      
      // 判断原始喜忌
      const rawFavour = this.determineFavourLevel(
        luckElement,
        favoredAvoid.favored,  // 用神五行数组
        favoredAvoid.avoid    // 忌神五行数组
      );
      
      // 分析冲合刑害
      const clashHarmPunish = this.analyzeClashHarmPunish(luck, pillars);
      
      // 计算喜忌强度（-2 ~ +2）
      const favourScore = this.calculateFavourScore(
        luckElement,
        favoredAvoid,
        clashHarmPunish
      );
      
      return {
        ...enrichedLuck,
        startAge,                    // 整岁区间起点（左闭）
        endAge,                      // 整岁区间终点（右开）
        ageRange: `${startAge}-${endAge}岁`,
        startUTC,                    // 实际起运时间（精确到月）
        endUTC,
        rawFavour,                   // ✅ 新增：原始喜忌判断
        favourScore,                 // ✅ 新增：喜忌强度（-2 ~ +2）
      };
    });

    // 10. 计算流年详细信息
    // 为流年创建临时的四柱信息来计算神煞
    const tempPillarsForYear = {
      year: fortune.currentYear, // 流年替换年柱
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour
    };
    // 流年神煞计算：基于流年替换年柱的临时四柱
    const shenshaResultForYear = this.computeShensha(tempPillarsForYear);
    const enrichedFlowYear = this.enrichPillar(fortune.currentYear, dayP.stem, normalizedSex, false, false, null);
    // 手动设置流年神煞（基于年柱位置）
    enrichedFlowYear.shensha = shenshaResultForYear.hits_by_pillar["年柱"] || [];
    // 添加流年年份信息
    enrichedFlowYear.year = new Date().getFullYear();
    enrichedFlowYear.ganzhi = `${enrichedFlowYear.stem}${enrichedFlowYear.branch}`;
    
    // 计算流月详细信息
    const enrichedFlowMonth = this.enrichPillar(fortune.currentMonth, dayP.stem, normalizedSex, false, false, null);
    enrichedFlowMonth.ganzhi = `${enrichedFlowMonth.stem}${enrichedFlowMonth.branch}`;
    // 保留流月的节气信息
    if (fortune.currentMonth.prevTerm) {
      enrichedFlowMonth.prevTerm = fortune.currentMonth.prevTerm;
    }
    if (fortune.currentMonth.nextTerm) {
      enrichedFlowMonth.nextTerm = fortune.currentMonth.nextTerm;
    }
    
    // 11. 构建 derived 对象（用于行运节奏计算）
    const derived = {
      luck_cycle: luckCycleWithAge, // 大运序列（含年龄）
      flow_years: [enrichedFlowYear], // 当前流年（含详细信息）
      flow_months: [enrichedFlowMonth], // 当前流月（含详细信息）
      qi_yun: fortune.qi, // 起运信息
      yun_direction: fortune.dir, // 大运方向
      start_age: startAgeYears // 起运年龄
    };
    
    // 12. 添加行运节奏（需要在 derived 定义之后）
    analysis.luckRhythm = await this.buildLuckRhythmMetrics(
      derived,
      birthJson,
      dayMasterStrength,
      favoredAvoid,
      structureResult,
      pillars
    );
    
    // 13. 添加时间坐标（需要在 luckRhythm 计算之后）
    try {
      analysis.timeCoordinate = await this.buildTimeCoordinateMetrics(
        analysis.luckRhythm,
        {
          pillars,
          analysis: {
            gods: {
              favorable: favoredAvoid.favored,
              unfavorable: favoredAvoid.avoid,
            },
          },
        },
        birthJson,
        { now }  // ✅ 统一时间源，使用 compute() 方法传入的 now
      );
    } catch (e) {
      console.warn('[BaziEngine] Failed to build timeCoordinate', e);
      // 时间坐标计算失败不影响其他分析结果
    }
    
    // 14. 构建结果（包含 analysis）
    return {
      pillars,
      analysis, // ← 新增
      derived,
      shensha,
      meta: {
        version: this.version,
        calendar_from: calendarFrom,
        lichun_time: lichun.toISOString()
      }
    };
  }

  /**
   * 组装命格總評数据
   * 委托给 cards/minggeSummary.js 模块
   */
  buildMinggeSummary(dayMasterStrength, structureResult, purityResult, patternPurityResult, tiaohouResult) {
    return _buildMinggeSummary(dayMasterStrength, structureResult, purityResult, patternPurityResult, tiaohouResult);
  }

  /**
   * 组装「用神格局」数据
   * 委托给 cards/yongshenPattern.js 模块
   */
  buildYongshenPattern(wuxingResult, favoredResult, tiyongResult, dogongResult, purityResult, tiaohouResult, pillars, dayStem) {
    const helpers = {
      extractWorkPatternTags: this.extractWorkPatternTags.bind(this),
      extractWorkLineName: this.extractWorkLineName.bind(this),
      generateWorkLineName: this.generateWorkLineName.bind(this),
    };
    
    return _buildYongshenPattern(
      wuxingResult, 
      favoredResult, 
      tiyongResult, 
      dogongResult, 
      purityResult, 
      tiaohouResult, 
      pillars, 
      dayStem,
      helpers
    );
  }

  /**
   * 组装「官財格局」数据（异步包装，用于计算财星根气）
   * 
   * Phase 1 版本：
   * - 使用 analyzeWealthRooting() 简化版
   * - 稳定度阈值写死在函数内
   * - riskFactors/supportFactors 直接使用 type 字符串
   * 
   * Phase 2 优化方向：
   * - 升级为 analyzeWealthRootingEnhanced()
   * - 稳定度阈值从配置文件读取
   * - riskFactors/supportFactors 改为 code + label 双层结构
   */
  async buildGuancaiPatternAsync(
    structureResult,
    purityResult,
    pogeResult,
    patternPurityResult,
    dogongResult,
    pillars,
    dayStem
  ) {
    // 计算财星根气（异步，在上游完成）
    const wealthRootResult = await analyzeWealthRooting(pillars, dayStem);
    
    // 调用纯函数组装数据
    return this.buildGuancaiPattern(
      structureResult,
      purityResult,
      pogeResult,
      patternPurityResult,
      dogongResult,
      wealthRootResult
    );
  }

  /**
   * 组装「官財格局」数据（纯函数）
   * 委托给 cards/guancaiPattern.js 模块
   */
  buildGuancaiPattern(
    structureResult,
    purityResult,
    pogeResult,
    patternPurityResult,
    dogongResult,
    wealthRootResult
  ) {
    return _buildGuancaiPattern(
      structureResult,
      purityResult,
      pogeResult,
      patternPurityResult,
      dogongResult,
      wealthRootResult
    );
  }

  /**
   * 组装「能量流通」数据
   * 委托给 cards/energyFlow.js 模块
   */
  buildEnergyFlowMetrics(
    structureResult,
    strengthResult,
    favoredAvoid,
    wuxingPercent,
    dogongResult,
    patternPurityResult,
    purityResult
  ) {
    // 传递辅助函数给新模块
    const helpers = {
      extractWorkPatternTags: this.extractWorkPatternTags.bind(this),
      generateWorkLineName: this.generateWorkLineName.bind(this),
    };
    
    return _buildEnergyFlowMetrics(
      structureResult,
      strengthResult,
      favoredAvoid,
      wuxingPercent,
      dogongResult,
      patternPurityResult,
      purityResult,
      helpers
    );
  }

  /**
   * 从四柱中提取指定五行对应的十神
   */
  extractTenGodsForElements(pillars, dayStem, elements) {
    if (!pillars || !dayStem || !elements || elements.length === 0) {
      return [];
    }

    const tenGodsSet = new Set();
    const STEM_ELEMENT = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
    };

    // 遍历四柱
    ['year', 'month', 'day', 'hour'].forEach(pos => {
      const pillar = pillars[pos];
      if (!pillar) return;

      // 检查天干
      if (pillar.stem) {
        const stemElement = STEM_ELEMENT[pillar.stem];
        if (elements.includes(stemElement)) {
          const shishen = tenGod(dayStem, pillar.stem);
          if (shishen && shishen !== '元男' && shishen !== '元女') {
            tenGodsSet.add(shishen);
          }
        }
      }

      // 检查藏干
      if (pillar.canggan && Array.isArray(pillar.canggan)) {
        pillar.canggan.forEach(stem => {
          const stemElement = STEM_ELEMENT[stem];
          if (elements.includes(stemElement)) {
            const shishen = tenGod(dayStem, stem);
            if (shishen) {
              tenGodsSet.add(shishen);
            }
          }
        });
      }
    });

    return Array.from(tenGodsSet);
  }

  /**
   * 归一化分数到 0-100
   */
  normalizeTo100(raw) {
    if (raw == null || isNaN(raw)) return 0;
    // 如果本身是 0–100，保持不变；如果是 0–1，放大到 0–100
    if (raw <= 1) return Math.round(raw * 100);
    return Math.round(raw);
  }

  /**
   * 用神力度分級
   */
  mapYongshenPowerLevel(score) {
    if (score >= 80) return '很強';
    if (score >= 65) return '較強';
    if (score >= 50) return '中等';
    return '偏弱';
  }

  /**
   * 流通度等級
   */
  mapFlowScoreToLevel(score) {
    if (score >= 80) return '順暢';
    if (score >= 60) return '通而不暢';
    if (score >= 40) return '阻塞較多';
    return '嚴重阻塞';
  }

  /**
   * 體用等級映射
   */
  mapTiYongLevel(tiyongResult) {
    if (!tiyongResult) return '體用相協';

    const bodyStrength = tiyongResult.bodyStrength ?? 0;
    const useStrength = tiyongResult.useStrength ?? 0;

    // 体强用弱
    if (bodyStrength > useStrength * 1.2) {
      return '體強用弱';
    }
    // 体弱用强
    if (useStrength > bodyStrength * 1.2) {
      return '體弱用強';
    }
    // 体用相协（差距小于15%）
    if (Math.abs(bodyStrength - useStrength) < 0.15) {
      return '體用相協';
    }
    // 其他情况为失衡
    return '體用失衡';
  }

  /**
   * 做功強度等級
   */
  mapWorkIntensityToLevel(workForce) {
    if (workForce == null || isNaN(workForce)) return '中';
    if (workForce >= 0.7) return '強';
    if (workForce >= 0.4) return '中';
    return '弱';
  }

  /**
   * 提取做功路径名称
   */
  extractWorkLineName(coreLine) {
    if (!coreLine || !coreLine.path) {
      return '';
    }
    return this.generateWorkLineName(coreLine.path, coreLine.relations || []);
  }

  /**
   * 根据路径和关系生成做功路径名称
   */
  generateWorkLineName(path, relations) {
    if (!path || path.length === 0) {
      return '';
    }

    // 十神分组映射
    const TEN_GOD_GROUPS = {
      '比劫': ['比肩', '劫财'],
      '食伤': ['食神', '伤官'],
      '财星': ['正财', '偏财'],
      '官杀': ['正官', '七杀'],
      '印星': ['正印', '偏印']
    };

    // 获取十神分组
    const getTenGodGroup = (shishen) => {
      for (const [group, members] of Object.entries(TEN_GOD_GROUPS)) {
        if (members.includes(shishen)) {
          return group;
        }
      }
      return shishen;
    };

    // 路径名称映射表
    const WORK_PATTERN_NAMES = {
      // 生助类路径
      '食伤→财星': '食傷生財',
      '食神→财星': '食神生財',
      '伤官→财星': '傷官生財',
      '财星→官杀': '財生官殺',
      '印星→比劫': '印比護身',
      '正印→比劫': '印比護身',
      '偏印→比劫': '梟印護身',
      '官杀→印星': '官印相生',
      '七杀→印星': '殺印相生',
      '正官→印星': '官印相生',
      
      // 克制类路径
      '食神→七杀': '食神制殺',
      '食伤→官杀': '食傷制殺',
      '伤官→正官': '傷官見官',
      '比劫→财星': '比劫奪財',
      '财星→印星': '財壞印',
      '官杀→比劫': '官殺克身',
      
      // 复合路径
      '比劫→食伤→财星': '比劫生食傷生財',
      '印星→比劫→食伤': '印比生食傷',
      '食伤→财星→官杀': '食傷生財生官',
    };

    // 1. 过滤掉 "日主"，只保留十神
    const shishenPath = path.filter(node => node !== '日主' && node !== '未知');

    if (shishenPath.length === 0) {
      return '';
    }

    // 2. 将具体十神转换为分组
    const groups = shishenPath.map(shishen => getTenGodGroup(shishen));

    // 3. 生成路径描述
    const pathKey = groups.join('→');

    // 4. 查找映射表
    if (WORK_PATTERN_NAMES[pathKey]) {
      return WORK_PATTERN_NAMES[pathKey];
    }

    // 5. 如果路径较长（3个以上节点），尝试匹配部分路径
    if (groups.length >= 3) {
      // 尝试匹配前两个节点
      const twoNodeKey = `${groups[0]}→${groups[1]}`;
      if (WORK_PATTERN_NAMES[twoNodeKey]) {
        return WORK_PATTERN_NAMES[twoNodeKey];
      }
    }

    // 6. 兜底：根据关系类型生成通用名称
    if (relations.length > 0 && relations.every(r => r === '生')) {
      const firstGroup = groups[0];
      const lastGroup = groups[groups.length - 1];
      return `${firstGroup}生${lastGroup}`;
    } else if (relations.length > 0 && relations.every(r => r === '克')) {
      const firstGroup = groups[0];
      const lastGroup = groups[groups.length - 1];
      return `${firstGroup}克${lastGroup}`;
    }

    // 7. 最终兜底：返回空字符串（类型信息在 extractWorkLineName 中已处理）
    return '';
  }

  /**
   * 提取做功类型标签
   */
  extractWorkPatternTags(dogongResult) {
    if (!dogongResult) {
      return [];
    }

    const tags = new Set();

    // 从 strongestPaths 中提取类型
    if (dogongResult.strongestPaths && Array.isArray(dogongResult.strongestPaths)) {
      dogongResult.strongestPaths.forEach(path => {
        if (path.type && typeof path.type === 'string') {
          tags.add(path.type);
        }
      });
    }

    // 从 workTypeSummary 中提取
    if (dogongResult.workTypeSummary && typeof dogongResult.workTypeSummary === 'object') {
      Object.keys(dogongResult.workTypeSummary).forEach(type => {
        if (type && type !== '未知') {
          tags.add(type);
        }
      });
    }

    return Array.from(tags);
  }

  /**
   * 组装「行运节奏」数据
   * 委托给 cards/luckRhythm.js 模块
   */
  async buildLuckRhythmMetrics(
    derived,
    birthJson,
    strengthResult,
    favoredAvoid,
    structureResult,
    pillars
  ) {
    return _buildLuckRhythmMetrics(
      derived,
      birthJson,
      strengthResult,
      favoredAvoid,
      structureResult,
      pillars
    );
  }

  /**
   * 组装「时间坐标」数据
   * 委托给 cards/timeCoordinate.js 模块
   */
  async buildTimeCoordinateMetrics(luckRhythm, baziChart, birthJson, { now } = {}) {
    const helpers = {
      analyzeClashHarmPunish: this.analyzeClashHarmPunish.bind(this),
      getElementFromPillar: this.getElementFromPillar.bind(this),
      determineFavourLevel: this.determineFavourLevel.bind(this),
    };
    return _buildTimeCoordinateMetrics(luckRhythm, baziChart, birthJson, { now }, helpers);
  }

  // 委托给 luckRhythm 模块的辅助方法（供 TimeCoordinate 等使用）
  getElementFromPillar(pillar) {
    return _getElementFromPillar(pillar);
  }

  determineFavourLevel(element, usefulGods, avoidGods) {
    return _determineFavourLevel(element, usefulGods, avoidGods);
  }

  analyzeClashHarmPunish(luckPillar, pillars) {
    return _analyzeClashHarmPunish(luckPillar, pillars);
  }

  isChong(branch1, branch2) {
    return _isChong(branch1, branch2);
  }

  calculateFavourScore(element, favoredAvoid, clashHarmPunish = []) {
    return _calculateFavourScore(element, favoredAvoid, clashHarmPunish);
  }

  /**
   * 丰富柱信息
   */
  enrichPillar(pillar, dayStem, sex, isDay = false, calculateShensha = false, allPillars = null) {
    const hidPlain = hiddenPlainOf(pillar.branch);
    const hidTagged = hiddenTaggedOf(pillar.branch);
    
    // 计算空亡（基于柱的干支索引）
    const pillarIdx = this.idxFromStemBranch(pillar.stem, pillar.branch);
    const kongwangArray = pillarIdx !== undefined ? kongWangByIndex(pillarIdx) : [];
    
    // 计算星运（日主天干在该地支的十二长生）
    const xingyunValue = computeXingyun(dayStem, pillar.branch);
    
    // 计算自坐（该柱天干在该柱地支的十二长生）
    const zizuoValue = stage12(pillar.stem, pillar.branch);
    
    const enriched = {
      ...pillar,
      nayin: nayin(pillar.stem, pillar.branch),
      canggan: hidPlain,
      hidden_tagged: hidTagged, // [["庚","本"],...]
      shishen: tenGod(dayStem, pillar.stem),
      sub_stars: hidPlain.map(s => tenGod(dayStem, s)), // 副星(藏干十神)
      zizuo: zizuoValue, // 自坐（该柱天干在该柱地支的十二长生）
      xingyun: xingyunValue, // 星运（日主天干在该地支的十二长生）
      self_sit: zizuoValue, // 自坐（同 zizuo）
      kongwang: kongwangArray, // 空亡（两个地支）
      shensha: []
    };

    // 日柱特殊处理（使用 isMale 判断，支持多种输入格式）
    if (isDay) {
      enriched.shishen = isMale(sex) ? "元男" : "元女";
      // 自坐保持十二运表述，不需要特殊处理
    }

    // 计算神煞（如果需要）
    if (calculateShensha && allPillars) {
      const shenshaResult = this.computeShensha(allPillars);
      // 根据柱的类型获取对应的神煞
      const pillarType = this.getPillarType(pillar, allPillars);
      enriched.shensha = shenshaResult.hits_by_pillar[pillarType] || [];
    }

    return enriched;
  }

  /**
   * 获取柱的类型（年柱、月柱、日柱、时柱）
   */
  getPillarType(pillar, allPillars) {
    if (allPillars.year && pillar.stem === allPillars.year.stem && pillar.branch === allPillars.year.branch) {
      return "年柱";
    } else if (allPillars.month && pillar.stem === allPillars.month.stem && pillar.branch === allPillars.month.branch) {
      return "月柱";
    } else if (allPillars.day && pillar.stem === allPillars.day.stem && pillar.branch === allPillars.day.branch) {
      return "日柱";
    } else if (allPillars.hour && pillar.stem === allPillars.hour.stem && pillar.branch === allPillars.hour.branch) {
      return "时柱";
    }
    return "未知";
  }

  /**
   * 获取天干对应的五行
   */
  getStemWuxing(stem) {
    const stemWuxingMap = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
    };
    return stemWuxingMap[stem] || '水';
  }

  /**
   * 获取天干的阴阳属性
   */
  getStemYinYang(stem) {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem) ? '阳' : '阴';
  }

  /**
   * 根据天干地支计算干支索引（用于空亡计算）
   */
  idxFromStemBranch(stem, branch) {
    const TG = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const DZ = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    const s = TG.indexOf(stem);
    const b = DZ.indexOf(branch);
    if (s < 0 || b < 0) return undefined;
    let t = s;
    while (t % 12 !== b) t += 10;
    return t % 60;
  }

  /**
   * 在 UTC 上加"岁/月"（精确到月；保留原日时分秒）
   */
  addYearsMonthsUTC(dateUTC, years, months) {
    const y = dateUTC.getUTCFullYear(), m = dateUTC.getUTCMonth(), d = dateUTC.getUTCDate();
    const hh = dateUTC.getUTCHours(), mm = dateUTC.getUTCMinutes(), ss = dateUTC.getUTCSeconds(), ms = dateUTC.getUTCMilliseconds();
    const totalMonths = y * 12 + m + years * 12 + months;
    const ny = Math.floor(totalMonths / 12), nm = totalMonths % 12;
    
    // 防止月末溢出（31号 → 4月没有31号）
    const maxD = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate(); // 该月最后一天日期
    const nd = Math.min(d, maxD); // 夹逼到月末
    
    return new Date(Date.UTC(ny, nm, nd, hh, mm, ss, ms));
  }


  /**
   * 计算神煞（基于原始HTML代码的完整逻辑）
   */
  calculateShensha(pillars) {
    const result = this.computeShensha(pillars);
    
    // 将结果设置到每个柱
    const pillarMap = { "年柱": "year", "月柱": "month", "日柱": "day", "时柱": "hour" };
    Object.keys(pillarMap).forEach(chineseName => {
      const englishKey = pillarMap[chineseName];
      pillars[englishKey].shensha = result.hits_by_pillar[chineseName] || [];
    });

    return result;
  }

  /**
   * 完整的神煞计算函数
   * 重构后委托给 shensha/compute.js 模块
   */
  computeShensha(pillars) {
    return computeAllShensha(pillars);
  }
}

/**
 * 解析时间字符串
 * @param {string|number} hour 小时（字符串或数字）
 * @param {string|number} minute 分钟（字符串或数字）
 * @returns {Object} 解析后的小时和分钟
 */
function parseTimeString(hour, minute) {
  let parsedHour = 0;
  let parsedMinute = 0;
  
  // 如果 hour 是数字，直接使用
  if (typeof hour === 'number') {
    parsedHour = hour;
  } else if (typeof hour === 'string') {
    // 解析时间字符串
    const timeStr = hour.trim();
    
    // 匹配 "早上2点"、"下午3点"、"晚上8点" 等格式
    const timeMatch = timeStr.match(/(早上|上午|下午|晚上|凌晨|中午|傍晚)?(\d+)(点|时|:)?(\d+)?/);
    if (timeMatch) {
      const period = timeMatch[1] || '';
      const hourNum = parseInt(timeMatch[2]);
      const minuteNum = timeMatch[4] ? parseInt(timeMatch[4]) : 0;
      
      // 处理时间段
      if (period.includes('下午') || period.includes('晚上')) {
        parsedHour = hourNum === 12 ? 12 : hourNum + 12;
      } else if (period.includes('凌晨') && hourNum === 12) {
        parsedHour = 0;
      } else {
        parsedHour = hourNum;
      }
      parsedMinute = minuteNum;
    } else {
      // 尝试直接解析数字
      const numMatch = timeStr.match(/(\d+)(?:[:：](\d+))?/);
      if (numMatch) {
        parsedHour = parseInt(numMatch[1]);
        parsedMinute = numMatch[2] ? parseInt(numMatch[2]) : 0;
      }
    }
  }
  
  // 处理 minute 参数
  if (minute !== undefined) {
    if (typeof minute === 'number') {
      parsedMinute = minute;
    } else if (typeof minute === 'string') {
      const minuteNum = parseInt(minute);
      if (!isNaN(minuteNum)) {
        parsedMinute = minuteNum;
      }
    }
  }
  
  return { hour: parsedHour, minute: parsedMinute };
}

// 创建默认实例
export const baziEngine = new BaziEngine();
