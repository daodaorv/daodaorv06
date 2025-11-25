#!/usr/bin/env node

const http = require('http');
const https = require('https');

// 测试服务连通性
function testService(name, url, expectedStatus = 200) {
  return new Promise((resolve) => {
    console.log(`\n🔍 测试 ${name} (${url})...`);

    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, (res) => {
      console.log(`✅ ${name} - 状态码: ${res.statusCode}`);
      console.log(`🔍 响应头: ${JSON.stringify(res.headers, null, 2)}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`🔍 响应数据长度: ${data.length} 字符`);
        console.log(`🔍 响应数据前100字符: ${data.substring(0, 100)}`);

        // 检查是否是HTML页面（Vue应用）
        const isHtmlPage = data.includes('<!DOCTYPE html>') || data.includes('<div id="app">');
        const isHealthCheck = data.includes('Server is running') || data.includes('code":0');

        // 对于HTML页面，如果状态码是200且包含Vue应用结构，认为是成功
        if (res.statusCode === 200 && (isHtmlPage || isHealthCheck)) {
          console.log(`✅ ${name} - 服务正常`);
          if (isHtmlPage) {
            console.log(`   📄 HTML页面已加载，Vue应用正在初始化...`);
          }
          resolve({ name, status: 'success', response: 'HTML/JSON response received' });
        } else if (res.statusCode === expectedStatus) {
          console.log(`✅ ${name} - 服务正常`);
          resolve({ name, status: 'success', response: data.substring(0, 100) });
        } else {
          console.log(`❌ ${name} - 状态码不匹配，期望: ${expectedStatus}, 实际: ${res.statusCode}`);
          resolve({ name, status: 'error', message: `状态码: ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} - 连接失败: ${err.message}`);
      resolve({ name, status: 'error', message: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ ${name} - 请求超时`);
      resolve({ name, status: 'error', message: '请求超时' });
    });
  });
}

// 测试移动管理端登录
async function testMobileAdminLogin() {
  console.log('\n🔑 测试移动管理端登录...');

  const postData = JSON.stringify({
    phone: '13800138000',
    password: '123456',
    loginIp: '192.168.0.102',
    loginDevice: 'Mobile Admin',
    loginPlatform: 'mobile_admin'
  });

  const options = {
    hostname: '192.168.0.102',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 wechatdevtools/1.06.2504060 MicroMessenger/8.0.5 Language/zh_CN webview/'
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log(`✅ 移动管理端登录 - 状态码: ${res.statusCode}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.code === 0 && response.data && response.data.token) {
            console.log('✅ 移动管理端登录成功');
            console.log(`📱 用户: ${response.data.user.username} (${response.data.user.phone})`);
            resolve({ name: '移动管理端登录', status: 'success', token: response.data.token.substring(0, 20) + '...' });
          } else {
            console.log(`❌ 移动管理端登录失败: ${response.message}`);
            resolve({ name: '移动管理端登录', status: 'error', message: response.message });
          }
        } catch (e) {
          console.log(`❌ 移动管理端登录响应解析失败: ${e.message}`);
          resolve({ name: '移动管理端登录', status: 'error', message: '响应解析失败' });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 移动管理端登录请求失败: ${err.message}`);
      resolve({ name: '移动管理端登录', status: 'error', message: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ 移动管理端登录请求超时`);
      resolve({ name: '移动管理端登录', status: 'error', message: '请求超时' });
    });

    req.write(postData);
    req.end();
  });
}

// 主测试函数
async function runIntegrationTests() {
  console.log('🚀 叨叨房车项目联调测试开始...\n');

  // 测试服务列表
  const services = [
    { name: '后端API健康检查', url: 'http://192.168.0.102:3000/health' },
    { name: 'PC管理后台首页', url: 'http://192.168.0.102:5177/' },
    { name: 'PC管理后台登录页', url: 'http://192.168.0.102:5177/login' },
  ];

  const results = [];

  // 测试基础服务
  for (const service of services) {
    const result = await testService(service.name, service.url);
    results.push(result);
  }

  // 测试移动管理端登录
  const loginResult = await testMobileAdminLogin();
  results.push(loginResult);

  // 汇总结果
  console.log('\n📊 测试结果汇总:');
  console.log('=================');

  let successCount = 0;
  let errorCount = 0;

  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.name}: 正常`);
      successCount++;
    } else {
      console.log(`❌ ${result.name}: ${result.message}`);
      errorCount++;
    }
  });

  console.log('\n🎯 测试统计:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${errorCount}`);
  console.log(`📈 成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);

  if (errorCount === 0) {
    console.log('\n🎉 所有服务运行正常！');
  } else {
    console.log('\n⚠️  部分服务存在问题，请检查日志。');
  }

  // 提供访问信息
  console.log('\n🔗 服务访问地址:');
  console.log('=================');
  console.log(`🖥️  PC管理后台: http://192.168.0.102:5177/`);
  console.log(`🔧 后端API: http://192.168.0.102:3000/api/v1/`);
  console.log(`📱 移动管理端: 需要通过HBuilderX或微信开发者工具运行`);
  console.log(`📲 小程序端: 需要通过微信开发者工具运行`);

  console.log('\n👤 测试账号信息:');
  console.log('=================');
  console.log(`📱 手机号: 13800138000`);
  console.log(`🔑 密码: 123456`);
  console.log(`👤 用户类型: 管理员`);
}

// 执行测试
runIntegrationTests().catch(console.error);