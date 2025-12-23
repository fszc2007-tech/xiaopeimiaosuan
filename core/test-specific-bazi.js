/**
 * 测试特定八字计算
 * 2025年6月20日 早上8点 女 公历
 */

const axios = require('axios');

const API_BASE = 'http://10.89.148.75:3000';

async function testSpecificBazi() {
  console.log('========================================');
  console.log('🔮 测试八字计算');
  console.log('========================================\n');
  
  console.log('📅 出生信息:');
  console.log('   日期: 2025年6月20日');
  console.log('   时间: 早上8点');
  console.log('   性别: 女');
  console.log('   历法: 公历');
  console.log('');

  try {
    // 1. 登录获取 token
    console.log('🔐 步骤 1: 登录...');
    const loginResponse = await axios.post(`${API_BASE}/api/v1/auth/login_or_register`, {
      phone: '13636602202',
      code: '123456',
      channel: 'cn',
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');

    // 2. 创建命盘
    console.log('📊 步骤 2: 计算八字...');
    const chartData = {
      name: '测试女命',
      gender: 'female',
      birth: {
        year: 2025,
        month: 6,
        day: 20,
        hour: 8,
        minute: 0,
      },
    };
    
    const chartResponse = await axios.post(
      `${API_BASE}/api/v1/bazi/chart`,
      chartData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const result = chartResponse.data.data.result;
    
    console.log('✅ 八字计算成功！\n');
    
    console.log('========================================');
    console.log('📋 八字结果');
    console.log('========================================\n');
    
    // 显示基本信息
    console.log('👤 基本信息:');
    console.log(`   姓名: ${result.basic?.name || '测试女命'}`);
    console.log(`   性别: ${result.basic?.sex === 'female' ? '女' : '男'}`);
    console.log(`   出生: ${result.basic?.gregorian_birth || '2025-06-20'} ${result.basic?.birth_time || '08:00'}`);
    console.log(`   历法: ${result.basic?.calendar_type || '公历'}`);
    console.log('');
    
    // 显示四柱
    console.log('🎋 四柱八字:');
    const pillars = result.pillars || {};
    
    if (pillars.year) {
      console.log('   年柱:', pillars.year.stem + pillars.year.branch, 
                  `(${pillars.year.nayin || ''})`);
    }
    if (pillars.month) {
      console.log('   月柱:', pillars.month.stem + pillars.month.branch, 
                  `(${pillars.month.nayin || ''})`);
    }
    if (pillars.day) {
      console.log('   日柱:', pillars.day.stem + pillars.day.branch, 
                  `(${pillars.day.nayin || ''})`);
    }
    if (pillars.hour) {
      console.log('   时柱:', pillars.hour.stem + pillars.hour.branch, 
                  `(${pillars.hour.nayin || ''})`);
    }
    console.log('');
    
    // 显示藏干
    console.log('🔸 藏干信息:');
    ['year', 'month', 'day', 'hour'].forEach((pillarType) => {
      const pillar = pillars[pillarType];
      if (pillar && pillar.canggan && pillar.canggan.length > 0) {
        const pillarName = {year: '年', month: '月', day: '日', hour: '时'}[pillarType];
        console.log(`   ${pillarName}柱藏干:`, pillar.canggan.join(', '));
      }
    });
    console.log('');
    
    // 显示十神
    console.log('⭐ 十神分析:');
    ['year', 'month', 'day', 'hour'].forEach((pillarType) => {
      const pillar = pillars[pillarType];
      if (pillar && pillar.shishen) {
        const pillarName = {year: '年', month: '月', day: '日', hour: '时'}[pillarType];
        console.log(`   ${pillarName}柱主星:`, pillar.shishen);
        if (pillar.sub_stars && pillar.sub_stars.length > 0) {
          console.log(`   ${pillarName}柱副星:`, pillar.sub_stars.join(', '));
        }
      }
    });
    console.log('');
    
    // 显示五行
    if (result.wuxing) {
      console.log('🌟 五行分析:');
      const wuxing = result.wuxing;
      console.log('   天干:', wuxing.tiangan_wuxing || '未知');
      console.log('   地支:', wuxing.dizhi_wuxing || '未知');
      if (wuxing.counts) {
        console.log('   五行统计:');
        Object.entries(wuxing.counts).forEach(([element, count]) => {
          console.log(`     ${element}: ${count}`);
        });
      }
      console.log('');
    }
    
    // 显示日元信息
    if (result.riyuan) {
      console.log('☀️ 日元信息:');
      console.log('   日主:', result.riyuan.stem || '未知');
      console.log('   日支:', result.riyuan.branch || '未知');
      if (result.riyuan.strength) {
        console.log('   强弱:', result.riyuan.strength);
      }
      console.log('');
    }
    
    // 显示完整 JSON（方便查看所有数据）
    console.log('========================================');
    console.log('📄 完整结果 (JSON):');
    console.log('========================================');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n========================================');
    console.log('🎉 测试完成！');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('   错误信息:', error.message);
    
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

testSpecificBazi();

