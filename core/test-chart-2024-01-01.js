/**
 * 完整测试命盘流程
 * 测试命盘：2024年1月1日 早上10点 女 公历
 * 
 * 测试内容：
 * 1. 登录获取 token
 * 2. 创建命盘
 * 3. 获取命盘列表
 * 4. 获取命盘详情
 * 5. 验证数据完整性
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://172.20.10.2:3000';
const TEST_PHONE = '13636602202';
const TEST_CODE = '123456';

// 测试命盘数据（标准测试用例）
const TEST_CHART = {
  name: '测试女命',
  gender: 'female',
  birth: {
    year: 2024,
    month: 1,
    day: 1,
    hour: 10,
    minute: 0,
  },
};

async function testChartFullFlow() {
  console.log('========================================');
  console.log('🧪 完整命盘流程测试');
  console.log('========================================\n');
  
  console.log('📅 测试命盘信息:');
  console.log(`   姓名: ${TEST_CHART.name}`);
  console.log(`   日期: ${TEST_CHART.birth.year}年${TEST_CHART.birth.month}月${TEST_CHART.birth.day}日`);
  console.log(`   时间: ${TEST_CHART.birth.hour}:${String(TEST_CHART.birth.minute).padStart(2, '0')}`);
  console.log(`   性别: ${TEST_CHART.gender === 'female' ? '女' : '男'}`);
  console.log(`   历法: 公历`);
  console.log('');

  let token = '';
  let userId = '';
  let chartId = '';
  let profileId = '';

  try {
    // ========== 步骤 1: 登录 ==========
    console.log('🔐 步骤 1: 登录获取 Token...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/v1/auth/login_or_register`, {
        phone: TEST_PHONE,
        code: TEST_CODE,
        channel: 'cn',
      });
      
      if (!loginResponse.data.success) {
        throw new Error(`登录失败: ${loginResponse.data.error?.message}`);
      }
      
      token = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.userId;
      console.log('✅ 登录成功');
      console.log(`   User ID: ${userId}`);
      console.log(`   Token: ${token.substring(0, 30)}...`);
      console.log('');
    } catch (error) {
      console.error('❌ 登录失败:', error.response?.data || error.message);
      throw error;
    }

    // ========== 步骤 2: 创建命盘 ==========
    console.log('📊 步骤 2: 创建命盘...');
    try {
      const chartResponse = await axios.post(
        `${API_BASE}/api/v1/bazi/chart`,
        TEST_CHART,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!chartResponse.data.success) {
        throw new Error(`创建命盘失败: ${chartResponse.data.error?.message}`);
      }
      
      chartId = chartResponse.data.data.chartId;
      profileId = chartResponse.data.data.profileId;
      
      console.log('✅ 命盘创建成功');
      console.log(`   Chart ID: ${chartId}`);
      console.log(`   Profile ID: ${profileId}`);
      console.log('');
    } catch (error) {
      console.error('❌ 创建命盘失败:', error.response?.data || error.message);
      throw error;
    }

    // ========== 步骤 3: 验证八字结果 ==========
    console.log('🔍 步骤 3: 验证八字结果...');
    try {
      const detailResponse = await axios.get(
        `${API_BASE}/api/v1/bazi/charts/${chartId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!detailResponse.data.success) {
        throw new Error(`获取命盘详情失败: ${detailResponse.data.error?.message}`);
      }
      
      const result = detailResponse.data.data.result;
      const pillars = result.pillars;
      
      console.log('📋 八字结果:');
      console.log(`   年柱: ${pillars.year.stem}${pillars.year.branch} (${pillars.year.nayin})`);
      console.log(`   月柱: ${pillars.month.stem}${pillars.month.branch} (${pillars.month.nayin})`);
      console.log(`   日柱: ${pillars.day.stem}${pillars.day.branch} (${pillars.day.nayin})`);
      console.log(`   时柱: ${pillars.hour.stem}${pillars.hour.branch} (${pillars.hour.nayin})`);
      console.log('');
      
      // 验证神煞
      if (result.shensha && result.shensha.hits_by_pillar) {
        console.log('🔮 神煞统计:');
        const shenshaByPillar = result.shensha.hits_by_pillar;
        ['年柱', '月柱', '日柱', '时柱'].forEach(pillar => {
          const shenshaList = shenshaByPillar[pillar] || [];
          if (shenshaList.length > 0) {
            console.log(`   ${pillar}: ${shenshaList.join(', ')}`);
          }
        });
        const totalShensha = Object.values(shenshaByPillar)
          .reduce((sum, arr) => sum + (arr?.length || 0), 0);
        console.log(`   神煞总数: ${totalShensha}`);
        console.log('');
      }
      
      console.log('✅ 八字结果验证通过！');
      console.log('');
    } catch (error) {
      console.error('❌ 验证八字结果失败:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.error('   ⚠️  返回 404 - CHART_NOT_FOUND');
        console.error('   💡 可能原因:');
        console.error('      1. chartId 和 userId 不匹配');
        console.error('      2. 数据库关联关系有问题');
        console.error('      3. JOIN 查询条件不正确');
      }
      throw error;
    }

    // ========== 步骤 4: 获取命盘列表 ==========
    console.log('📋 步骤 4: 获取命盘列表...');
    try {
      const listResponse = await axios.get(
        `${API_BASE}/api/v1/bazi/charts`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!listResponse.data.success) {
        throw new Error(`获取命盘列表失败: ${listResponse.data.error?.message}`);
      }
      
      const { profiles, total, currentProfileId } = listResponse.data.data;
      
      console.log('✅ 命盘列表获取成功');
      console.log(`   总数: ${total}`);
      console.log(`   当前命主: ${currentProfileId || '无'}`);
      console.log(`   列表数量: ${profiles.length}`);
      
      // 验证新创建的命盘是否在列表中
      const foundProfile = profiles.find(p => p.chartId === chartId);
      if (foundProfile) {
        console.log('✅ 新创建的命盘在列表中');
        console.log(`   名称: ${foundProfile.name}`);
        console.log(`   Chart ID: ${foundProfile.chartId}`);
        console.log(`   Profile ID: ${foundProfile.profileId}`);
      } else {
        console.error('❌ 新创建的命盘不在列表中！');
        console.error('   查找的 Chart ID:', chartId);
        console.error('   列表中的 Chart IDs:', profiles.map(p => p.chartId));
      }
      console.log('');
    } catch (error) {
      console.error('❌ 获取命盘列表失败:', error.response?.data || error.message);
      throw error;
    }

    // ========== 步骤 5: 再次获取命盘详情（验证数据一致性） ==========
    console.log('🔍 步骤 5: 再次获取命盘详情（验证数据一致性）...');
    try {
      const detailResponse2 = await axios.get(
        `${API_BASE}/api/v1/bazi/charts/${chartId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!detailResponse2.data.success) {
        throw new Error(`获取命盘详情失败: ${detailResponse2.data.error?.message}`);
      }
      
      const data = detailResponse2.data.data;
      
      console.log('✅ 命盘详情获取成功');
      console.log('📊 数据结构验证:');
      
      // 验证必要字段
      const checks = [
        { path: 'profile', name: '档案信息' },
        { path: 'profile.name', name: '姓名' },
        { path: 'profile.gender', name: '性别' },
        { path: 'result', name: '计算结果' },
        { path: 'result.pillars', name: '四柱' },
        { path: 'result.pillars.year', name: '年柱' },
        { path: 'result.pillars.month', name: '月柱' },
        { path: 'result.pillars.day', name: '日柱' },
        { path: 'result.pillars.hour', name: '时柱' },
        { path: 'result.analysis', name: '分析结果' },
        { path: 'result.shensha', name: '神煞' },
      ];
      
      let allFieldsExist = true;
      for (const check of checks) {
        const keys = check.path.split('.');
        let value = data;
        for (const key of keys) {
          value = value?.[key];
        }
        
        if (value === undefined || value === null) {
          console.error(`❌ 缺少字段: ${check.name} (${check.path})`);
          allFieldsExist = false;
        } else {
          console.log(`   ✅ ${check.name}`);
        }
      }
      
      // ========== 详细验证分析字段 ==========
      console.log('');
      console.log('📊 详细分析字段验证:');
      
      const analysis = data.result.analysis || {};
      let analysisFieldsOk = true;
      
      // 1. 综合纯度 (purity)
      if (analysis.purity) {
        console.log('   ✅ 综合纯度 (purity)');
        const purity = analysis.purity;
        if (purity.score !== undefined && purity.level) {
          console.log(`      分数: ${purity.score}, 等级: ${purity.level}`);
          if (purity.details) {
            console.log(`      详情: 格局纯度=${purity.details.patternPurity || 'N/A'}, 用神得力=${purity.details.yongshenStrength || 'N/A'}`);
          }
        } else {
          console.error('      ⚠️  综合纯度字段不完整');
          analysisFieldsOk = false;
        }
      } else {
        console.error('   ❌ 缺少综合纯度 (purity)');
        analysisFieldsOk = false;
      }
      
      // 2. 格局 (structure)
      if (analysis.structure) {
        console.log('   ✅ 格局 (structure)');
        const structure = analysis.structure;
        if (structure.name && structure.confidence !== undefined) {
          console.log(`      格局名称: ${structure.name}, 置信度: ${structure.confidence}`);
        } else {
          console.error('      ⚠️  格局字段不完整');
          analysisFieldsOk = false;
        }
      } else {
        console.error('   ❌ 缺少格局 (structure)');
        analysisFieldsOk = false;
      }
      
      // 3. 破格因素 (poge)
      let pogeFound = false;
      // 优先检查 structure.pogeFactors
      if (analysis.structure?.pogeFactors) {
        console.log('   ✅ 破格因素 (structure.pogeFactors)');
        const factors = analysis.structure.pogeFactors;
        if (Array.isArray(factors)) {
          console.log(`      破格因素数量: ${factors.length}`);
          if (factors.length > 0) {
            console.log(`      示例: ${factors[0].type || factors[0]}`);
          } else {
            console.log('      (无破格因素)');
          }
          pogeFound = true;
        }
      }
      
      // 检查 analysis.poge
      if (!pogeFound && analysis.poge) {
        console.log('   ✅ 破格因素 (analysis.poge)');
        const poge = analysis.poge;
        if (Array.isArray(poge.factors) || Array.isArray(poge)) {
          const factors = Array.isArray(poge.factors) ? poge.factors : poge;
          console.log(`      破格因素数量: ${factors.length}`);
          if (factors.length > 0) {
            console.log(`      示例: ${factors[0].type || factors[0]}`);
          }
          pogeFound = true;
        }
      }
      
      if (!pogeFound) {
        console.log('   ⚠️  未找到破格因素字段 (可能无破格因素)');
      }
      
      // 4. 救应分析 (rescue)
      let rescueFound = false;
      // 优先检查 structure.patternPurity.rescueFactors
      if (analysis.structure?.patternPurity?.rescueFactors) {
        console.log('   ✅ 救应分析 (structure.patternPurity.rescueFactors)');
        const rescueFactors = analysis.structure.patternPurity.rescueFactors;
        if (Array.isArray(rescueFactors)) {
          console.log(`      救应因素数量: ${rescueFactors.length}`);
          if (rescueFactors.length > 0) {
            console.log(`      示例: ${rescueFactors[0].type || rescueFactors[0]}`);
          } else {
            console.log('      (无救应因素)');
          }
          rescueFound = true;
        }
      }
      
      // 检查 analysis.purity.rescueFactors
      if (!rescueFound && analysis.purity?.rescueFactors) {
        console.log('   ✅ 救应分析 (purity.rescueFactors)');
        const rescueFactors = analysis.purity.rescueFactors;
        if (Array.isArray(rescueFactors)) {
          console.log(`      救应因素数量: ${rescueFactors.length}`);
          if (rescueFactors.length > 0) {
            console.log(`      示例: ${rescueFactors[0].type || rescueFactors[0]}`);
          }
          rescueFound = true;
        }
      }
      
      if (!rescueFound) {
        console.log('   ⚠️  未找到救应分析字段 (可能无救应因素)');
      }
      
      // 5. 格局纯度 (patternPurity)
      if (analysis.structure?.patternPurity) {
        console.log('   ✅ 格局纯度 (structure.patternPurity)');
        const patternPurity = analysis.structure.patternPurity;
        if (patternPurity.level || patternPurity.score !== undefined) {
          console.log(`      等级: ${patternPurity.level || 'N/A'}, 分数: ${patternPurity.score || 'N/A'}`);
          if (patternPurity.pogeFactors) {
            console.log(`      破格因素数量: ${patternPurity.pogeFactors.length || 0}`);
          }
          if (patternPurity.rescueFactors) {
            console.log(`      救应因素数量: ${patternPurity.rescueFactors.length || 0}`);
          }
          if (patternPurity.description) {
            console.log(`      描述: ${patternPurity.description.substring(0, 50)}...`);
          }
        }
      } else if (analysis.purity?.patternPurity) {
        console.log('   ✅ 格局纯度 (purity.patternPurity)');
        const patternPurity = analysis.purity.patternPurity;
        if (typeof patternPurity === 'number') {
          console.log(`      分数: ${patternPurity} (数值类型)`);
        } else if (patternPurity.level || patternPurity.score !== undefined) {
          console.log(`      等级: ${patternPurity.level || 'N/A'}, 分数: ${patternPurity.score || 'N/A'}`);
        }
      } else {
        console.log('   ⚠️  未找到格局纯度字段 (patternPurity)');
        // 检查是否在 purity.details 中（数值类型）
        if (analysis.purity?.details?.patternPurity !== undefined) {
          console.log(`      (格局纯度分数在 purity.details.patternPurity 中: ${analysis.purity.details.patternPurity})`);
        }
      }
      
      console.log('');
      
      if (allFieldsExist && analysisFieldsOk) {
        console.log('✅ 所有必要字段都存在且完整');
      } else {
        console.log('⚠️  部分字段缺失或不完整');
      }
      
      // 验证神煞数据
      if (data.result.shensha && data.result.shensha.hits_by_pillar) {
        const shenshaCount = Object.values(data.result.shensha.hits_by_pillar)
          .reduce((sum, arr) => sum + (arr?.length || 0), 0);
        console.log(`   📊 神煞总数: ${shenshaCount}`);
      }
      
      console.log('');
    } catch (error) {
      console.error('❌ 获取命盘详情失败:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.error('   ⚠️  返回 404，可能是 CHART_NOT_FOUND 错误');
        console.error('   💡 可能原因:');
        console.error('      1. chartId 和 userId 不匹配');
        console.error('      2. 数据库关联关系有问题');
        console.error('      3. chartId 不存在');
      }
      throw error;
    }

    // ========== 测试总结 ==========
    console.log('========================================');
    console.log('✅ 测试完成！');
    console.log('========================================');
    console.log('');
    console.log('📊 测试结果:');
    console.log(`   ✅ 登录: 成功`);
    console.log(`   ✅ 创建命盘: 成功 (Chart ID: ${chartId})`);
    console.log(`   ✅ 获取列表: 成功`);
    console.log(`   ✅ 获取详情: 成功`);
    console.log(`   ✅ 数据完整性: 通过`);
    console.log('');
    console.log('📝 测试命盘信息（请记住）:');
    console.log('   日期: 2024年1月1日');
    console.log('   时间: 早上10点');
    console.log('   性别: 女');
    console.log('   历法: 公历');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('========================================');
    console.log('❌ 测试失败');
    console.log('========================================');
    console.log('');
    console.error('错误详情:', error.response?.data || error.message);
    console.log('');
    
    if (error.response?.status === 404) {
      console.log('💡 404 错误分析:');
      console.log('   可能原因:');
      console.log('   1. chartId 不存在或已被删除');
      console.log('   2. chartId 和 userId 不匹配（权限问题）');
      console.log('   3. 数据库关联关系有问题');
      console.log('   4. JOIN 查询条件不正确');
      console.log('');
      console.log('🔍 建议检查:');
      console.log('   1. 检查 bazi_charts 表中是否有该 chartId');
      console.log('   2. 检查 chart_profiles 表中是否有对应的 chart_profile_id');
      console.log('   3. 检查 JOIN 条件是否正确');
      console.log('   4. 检查 userId 是否匹配');
    }
    
    process.exit(1);
  }
}

// 运行测试
testChartFullFlow();

