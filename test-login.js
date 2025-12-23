#!/usr/bin/env node
/**
 * 登录流程测试脚本
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
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

async function testLogin() {
  console.log('========================================');
  console.log('🧪 开始测试登录流程');
  console.log('========================================\n');

  // 1. 测试健康检查
  console.log('1️⃣ 测试 Core 服务健康检查...');
  try {
    const health = await request('GET', '/health');
    console.log('✅ Core 服务正常:', health.body.data);
  } catch (err) {
    console.error('❌ Core 服务异常:', err);
    return;
  }

  console.log('');

  // 2. 测试错误的验证码
  console.log('2️⃣ 测试错误验证码（应该被拒绝）...');
  try {
    const result = await request('POST', '/api/v1/auth/login_or_register', {
      phone: '13912345678',
      code: '999999',
      channel: 'cn',
    });
    console.log('❌ 错误：错误验证码应该被拒绝，但登录成功了:', result.body);
  } catch (err) {
    if (err.body && err.body.error && err.body.error.message.includes('123456')) {
      console.log('✅ 正确：错误验证码被拒绝');
    } else {
      console.log('❌ 异常错误:', err);
    }
  }

  console.log('');

  // 3. 测试正确的验证码
  console.log('3️⃣ 测试正确验证码 123456...');
  try {
    const result = await request('POST', '/api/v1/auth/login_or_register', {
      phone: '13912345678',
      code: '123456',
      channel: 'cn',
    });
    
    if (result.body.success && result.body.data) {
      const { token, user } = result.body.data;
      console.log('✅ 登录成功!');
      console.log('   用户ID:', user.userId);
      console.log('   手机号:', user.phone);
      console.log('   Token前20字符:', token.substring(0, 20) + '...');
      
      // 4. 测试使用 token 访问需要认证的接口
      console.log('');
      console.log('4️⃣ 测试使用 token 获取用户信息...');
      try {
        const meResult = await request('GET', '/api/v1/auth/me');
        console.log('❌ 没有 token 应该返回 401，但请求成功了');
      } catch (err) {
        if (err.status === 401) {
          console.log('✅ 正确：没有 token 返回 401');
        } else {
          console.log('❌ 异常状态码:', err.status);
        }
      }

      console.log('');
      console.log('5️⃣ 测试携带 token 获取用户信息...');
      try {
        const meWithToken = await requestWithAuth('GET', '/api/v1/auth/me', null, token);
        if (meWithToken.body.success) {
          console.log('✅ 携带 token 成功获取用户信息');
          console.log('   用户ID:', meWithToken.body.data.userId);
        } else {
          console.log('❌ 返回格式错误:', meWithToken.body);
        }
      } catch (err) {
        console.log('❌ 请求失败:', err);
      }

    } else {
      console.log('❌ 登录失败:', result.body);
    }
  } catch (err) {
    console.log('❌ 登录请求失败:', err);
  }

  console.log('');
  console.log('========================================');
  console.log('✅ 测试完成');
  console.log('========================================');
}

function requestWithAuth(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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

// 运行测试
testLogin().catch(console.error);

