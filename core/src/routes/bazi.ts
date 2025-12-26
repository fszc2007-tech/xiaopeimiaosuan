/**
 * 命盘路由
 * 
 * 路径：/api/v1/bazi/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createRateLimitMiddleware } from '../middleware/rateLimit';
import * as baziService from '../modules/bazi/baziService';
import * as chartProfileService from '../services/chartProfileService';
import * as shenshaReadingService from '../modules/shensha/shenshaReadingService';
import * as shishenReadingService from '../modules/shishen/shishenReadingService';
import * as dayStemService from '../modules/dayStem/dayStemService';
import { ApiResponse } from '../types';

const router = Router();

// 日主解读接口（公开，无需认证）
router.get('/day-stem/:stem', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stem } = req.params;
    
    // 验证日主天干
    const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    if (!validStems.includes(stem)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STEM',
          message: '无效的日主天干',
          details: { stem, validStems },
        },
      } as ApiResponse);
    }
    
    // 获取解读内容
    const reading = await dayStemService.getDayStemReading(stem);
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DAY_STEM_READING_NOT_FOUND',
          message: '该日主的解读内容尚未配置',
          details: { stem },
        },
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: reading,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

// 所有其他命盘路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/bazi/chart
 * 计算命盘
 * 
 * 注意：此接口同时创建 bazi_charts 和 chart_profiles 记录
 */
router.post('/chart', createRateLimitMiddleware('bazi_compute'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { name, gender, birth, relationType = 'self', relationLabel, notes, forceRecompute } = req.body;
    
    // 验证输入
    if (!name || !gender || !birth) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：name, gender, birth',
        },
      } as ApiResponse);
    }
    
    // 1. 调用命盘计算服务（已包含创建 chart_profile）
    const chartResult = await baziService.computeChart({
      userId,
      name,
      gender,
      birth,
      forceRecompute,
      relationType, // 传递关系类型
    });
    
    res.json({
      success: true,
      data: {
        chartId: chartResult.chartId,
        profileId: chartResult.chartProfileId,
        result: chartResult.result,
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/bazi/charts
 * 获取命盘档案列表（含命盘数据）
 */
router.get('/charts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { search, relationType, sortBy, limit, offset } = req.query;

    // 解析关系类型筛选
    let relationTypeArray: chartProfileService.RelationType[] | undefined;
    if (relationType) {
      if (typeof relationType === 'string') {
        relationTypeArray = [relationType as chartProfileService.RelationType];
      } else if (Array.isArray(relationType)) {
        relationTypeArray = relationType as chartProfileService.RelationType[];
      }
    }

    // 获取档案列表
    const { profiles, total } = await chartProfileService.getChartProfiles(userId, {
      search: search as string,
      relationType: relationTypeArray,
      sortBy: sortBy as 'recent' | 'created' | 'relation',
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      data: {
        profiles,
        total,
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/bazi/charts/:chartId
 * 获取命盘详情
 */
router.get('/charts/:chartId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { chartId } = req.params;
    
    const result = await baziService.getChartDetail({ userId, chartId });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Chart not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHART_NOT_FOUND',
          message: '命盘不存在',
        },
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * DELETE /api/v1/bazi/charts/:chartId
 * 删除命盘
 */
router.delete('/charts/:chartId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { chartId } = req.params;
    
    await baziService.deleteChart({ userId, chartId });
    
    res.json({
      success: true,
      data: {
        message: '删除成功',
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});


/**
 * GET /api/v1/bazi/shensha/:code
 * 获取神煞解读内容
 * 
 * Query Params:
 * - pillarType: 'year' | 'month' | 'day' | 'hour' (可选)
 * - gender: 'male' | 'female' (必填，排盤時必然有性別)
 * 
 * 如果数据库中没有数据，返回错误（不降级到 LLM）
 */
router.get('/shensha/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { pillarType, gender } = req.query;
    
    // 驗證性別參數（必填）
    if (!gender || (gender !== 'male' && gender !== 'female')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GENDER',
          message: '性別參數必填且必須為 male 或 female',
        },
      } as ApiResponse);
    }
    
    // 获取解读内容（性別必填）
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bazi.ts:227',message:'Requesting shensha reading',data:{code,pillarType,gender},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const reading = await shenshaReadingService.getShenshaReading(
      code,
      pillarType as shenshaReadingService.PillarType | undefined,
      gender as shenshaReadingService.GenderType
    );
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHENSHA_READING_NOT_FOUND',
          message: '該神煞的解讀內容尚未配置',
          details: {
            shensha_code: code,
            pillar_type: pillarType || null,
            gender: gender,
          },
        },
      } as ApiResponse);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bazi.ts:250',message:'Sending shensha reading response',data:{code:reading.code,name:reading.name,nameLength:reading.name?.length,nameBytes:Buffer.from(reading.name||'').length,summaryPreview:reading.summary?.substring(0,50),timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // 确保响应使用 UTF-8 编码
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({
      success: true,
      data: reading,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/bazi/shishen/:code
 * 获取十神解读内容
 * 
 * Query Params:
 * - pillarType: 'year' | 'month' | 'day' | 'hour' (可选)
 * - gender: 'male' | 'female' (必填，排盤時必然有性別)
 * - chartId: string (可选，用于判断喜神/忌神)
 */
router.get('/shishen/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { pillarType, gender, chartId } = req.query;
    
    // 驗證性別參數（必填）
    if (!gender || (gender !== 'male' && gender !== 'female')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GENDER',
          message: '性別參數必填且必須為 male 或 female',
        },
      } as ApiResponse);
    }
    
    // 获取命盘数据（用于判断喜神/忌神）
    let baziData = null;
    if (chartId && req.userId) {
      try {
        baziData = await baziService.getChartDetail({ 
          userId: req.userId, 
          chartId: chartId as string 
        });
      } catch (e) {
        // 忽略获取命盘失败的错误
      }
    }
    
    // 获取解读内容
    const reading = await shishenReadingService.getShishenReading(
      code,
      pillarType as shishenReadingService.PillarType | undefined,
      gender as shishenReadingService.GenderType,
      baziData
    );
    
    if (!reading) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHISHEN_READING_NOT_FOUND',
          message: '該十神的解讀內容尚未配置',
          details: {
            shishen_code: code,
            pillar_type: pillarType || null,
            gender: gender,
          },
        },
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: reading,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

