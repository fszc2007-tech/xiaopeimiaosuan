#!/usr/bin/env node
/**
 * 完整业务流程测试脚本
 * 
 * 测试流程：
 * 1. 登录获取 token
 * 2. 创建命盘
 * 3. 获取命盘详情
 * 4. 获取命盘列表
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
let authToken = '';

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, body: json });
          } else {
            resolve({ status: res.statusCode, body: json });
          }
        } catch (err) {
          reject({ status: res.statusCode, body, error: err.message });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFullFlow() {
  console.log('========================================');
  console.log('🧪 开始测试完整业务流程');
  console.log('========================================\n');

  // 1. 登录
  console.log('1️⃣ 登录...');
  try {
    const loginResult = await request('POST', '/api/v1/auth/login_or_register', {
      phone: '13912345678',
      code: '123456',
      channel: 'cn',
    });
    
    if (loginResult.body.success) {
      authToken = loginResult.body.data.token;
      console.log('✅ 登录成功');
      console.log('   用户:', loginResult.body.data.user.nickname);
    } else {
      console.log('❌ 登录失败');
      return;
    }
  } catch (err) {
    console.log('❌ 登录请求失败:', err);
    return;
  }

  console.log('');

  // 2. 创建命盘
  console.log('2️⃣ 创建命盘...');
  let chartId = '';
  try {
    const createResult = await request('POST', '/api/v1/bazi/chart', {
      name: '测试命主',
      gender: 'male',
      birth: {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
      },
      relationType: 'self',
    }, authToken);
    
    if (createResult.body.success) {
      chartId = createResult.body.data.chartId;
      console.log('✅ 创建命盘成功');
      console.log('   命盘ID:', chartId);
      console.log('   四柱:', 
        createResult.body.data.result?.pillars?.year?.stem + createResult.body.data.result?.pillars?.year?.branch,
        createResult.body.data.result?.pillars?.month?.stem + createResult.body.data.result?.pillars?.month?.branch,
        createResult.body.data.result?.pillars?.day?.stem + createResult.body.data.result?.pillars?.day?.branch,
        createResult.body.data.result?.pillars?.hour?.stem + createResult.body.data.result?.pillars?.hour?.branch
      );
    } else {
      console.log('❌ 创建命盘失败:', createResult.body);
      return;
    }
  } catch (err) {
    console.log('❌ 创建命盘请求失败:', err.status, err.body?.error?.message || err);
    return;
  }

  console.log('');

  // 3. 获取命盘详情
  console.log('3️⃣ 获取命盘详情...');
  try {
    const detailResult = await request('GET', `/api/v1/bazi/charts/${chartId}`, null, authToken);
    
    if (detailResult.body.success) {
      console.log('✅ 获取命盘详情成功');
      console.log('   命主:', detailResult.body.data.name);
      console.log('   性别:', detailResult.body.data.gender);
    } else {
      console.log('❌ 获取命盘详情失败:', detailResult.body);
    }
  } catch (err) {
    console.log('❌ 获取命盘详情请求失败:', err.status, err.body?.error?.message || err);
  }

  console.log('');

  // 4. 获取命盘列表
  console.log('4️⃣ 获取命盘列表...');
  try {
    const listResult = await request('GET', '/api/v1/bazi/charts', null, authToken);
    
    if (listResult.body.success) {
      console.log('✅ 获取命盘列表成功');
      console.log('   总数:', listResult.body.data.total);
      if (listResult.body.data.profiles && listResult.body.data.profiles.length > 0) {
        listResult.body.data.profiles.forEach((profile, index) => {
          console.log(`   [${index + 1}] ${profile.name} (${profile.relationType})`);
        });
      }
    } else {
      console.log('❌ 获取命盘列表失败:', listResult.body);
    }
  } catch (err) {
    console.log('❌ 获取命盘列表请求失败:', err.status, err.body?.error?.message || err);
  }

  console.log('');
  console.log('========================================');
  console.log('✅ 测试完成');
  console.log('========================================');
}

// 运行测试
testFullFlow().catch(console.error);

