// 测试 POST API 的简单脚本
const http = require('http');

const postData = JSON.stringify({
  name: '测试车型API',
  brand: '测试品牌',
  series: '测试系列',
  type: 'B型',
  seats: 4,
  sleep_capacity: 2,
  length: 5.5,
  width: 2.0,
  height: 2.5,
  fuel_type: '柴油',
  transmission: '自动',
  engine_displacement: 2.0,
  description: '测试POST API',
  status: 'active'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/vehicles/models',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('发送 POST 请求...');
console.log('请求数据:', postData);
console.log('');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应内容:', data);
    try {
      const json = JSON.parse(data);
      console.log('解析后的响应:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('无法解析为 JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

req.write(postData);
req.end();
