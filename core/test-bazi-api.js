/**
 * 测试八字计算 API
 */

const axios = require('axios');

const API_BASE = 'http://10.89.148.75:3000';

async function testBaziAPI() {
  console.log('========================================');
  console.log('🧪 开始测试八字计算 API');
  console.log('========================================\n');

  try {
    // 步骤 1: 跳过验证码请求（我们知道固定验证码是 123456）
    console.log('📱 步骤 1: 跳过验证码请求（固定验证码：123456）\n');

    // 步骤 2: 直接登录获取 token
    console.log('🔐 步骤 2: 登录...');
    const loginResponse = await axios.post(`${API_BASE}/api/v1/auth/login_or_register`, {
      phone: '13636602202',
      code: '123456',
      channel: 'cn', // 使用 channel 参数（CN 区域）
    });
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.userId;
    console.log('✅ 登录成功');
    console.log('   Token:', token.substring(0, 30) + '...');
    console.log('   User ID:', userId);
    console.log('');

    // 步骤 3: 创建命盘
    console.log('📊 步骤 3: 创建命盘...');
    const chartData = {
      name: '测试命主',
      gender: 'male',
      birth: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      },
    };
    
    console.log('   发送数据:', JSON.stringify(chartData, null, 2));
    
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
    
    console.log('✅ 命盘创建成功！');
    console.log('   Chart ID:', chartResponse.data.data.chartId);
    console.log('   Profile ID:', chartResponse.data.data.profileId);
    console.log('   结果字段数量:', Object.keys(chartResponse.data.data.result).length);
    console.log('');

    // 步骤 4: 获取命盘列表
    console.log('📋 步骤 4: 获取命盘列表...');
    const listResponse = await axios.get(
      `${API_BASE}/api/v1/bazi/charts?page=1&pageSize=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    console.log('✅ 命盘列表获取成功');
    console.log('   总数:', listResponse.data.data.total);
    console.log('   当前页命盘数:', listResponse.data.data.profiles ? listResponse.data.data.profiles.length : 0);
    console.log('');

    console.log('========================================');
    console.log('🎉 所有测试通过！');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('   错误信息:', error.message);
    
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data?.details) {
        console.error('\n   详细错误:', error.response.data.details);
      }
    }
    
    console.error('\n   完整错误:');
    console.error(error);
    
    process.exit(1);
  }
}

testBaziAPI();

