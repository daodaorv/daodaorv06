const express = require('express');
const cors = require('cors');
const faker = require('faker');

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 响应格式标准化
function createResponse(data = {}, code = 0, message = 'success') {
  return {
    code,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    }
  };
}

// 错误响应
function createErrorResponse(code, message) {
  return createResponse({}, code, message);
}

// Mock数据生成器
const mockData = {
  // 用户相关
  users: {
    login: {
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user: {
        id: faker.datatype.number({ min: 1 }),
        phone: faker.phone.phoneNumber('138########'),
        nickname: faker.name.findName(),
        avatar: faker.image.avatar(),
        userType: 'customer',
        status: 'active'
      }
    },
    profile: {
      id: faker.datatype.number({ min: 1 }),
      nickname: faker.name.findName(),
      avatar: faker.image.avatar(),
      gender: faker.datatype.number({ min: 0, max: 2 }),
      birthday: faker.date.past(30, '1990-01-01').toISOString().split('T')[0],
      idCard: '******************',
      realNameVerified: faker.datatype.boolean(),
      phone: faker.phone.phoneNumber('138########')
    }
  },

  // 车辆相关
  vehicles: {
    list: Array(10).fill(null).map(() => ({
      id: faker.datatype.number({ min: 1 }),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      type: faker.datatype.number({ min: 1, max: 5 }),
      seats: faker.datatype.number({ min: 2, max: 8 }),
      licensePlate: faker.vehicle.vin(),
      year: faker.datatype.number({ min: 2018, max: 2024 }),
      pricePerDay: faker.datatype.number({ min: 300, max: 2000 }),
      images: [
        faker.image.transport(),
        faker.image.transport(),
        faker.image.transport()
      ],
      features: ['GPS', '蓝牙', 'USB充电', '自动空调'],
      rating: faker.datatype.number({ min: 3, max: 5, precision: 0.1 }),
      reviewCount: faker.datatype.number({ min: 10, max: 200 }),
      storeId: faker.datatype.number({ min: 1 }),
      storeName: faker.company.name(),
      status: 'available'
    })),
    detail: {
      id: faker.datatype.number({ min: 1 }),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      type: faker.datatype.number({ min: 1, max: 5 }),
      seats: faker.datatype.number({ min: 2, max: 8 }),
      licensePlate: faker.vehicle.vin(),
      year: faker.datatype.number({ min: 2018, max: 2024 }),
      mileage: faker.datatype.number({ min: 10000, max: 100000 }),
      engine: '2.0L 涡轮增压',
      transmission: '自动',
      fuelType: '汽油',
      pricePerDay: faker.datatype.number({ min: 300, max: 2000 }),
      deposit: faker.datatype.number({ min: 1000, max: 5000 }),
      images: Array(5).fill(null).map(() => faker.image.transport()),
      features: [
        'GPS导航', '蓝牙音乐', 'USB充电接口', '自动空调',
        '倒车雷达', '行车记录仪', '车载冰箱', 'LED大灯'
      ],
      description: faker.lorem.paragraphs(3),
      rating: faker.datatype.number({ min: 3, max: 5, precision: 0.1 }),
      reviewCount: faker.datatype.number({ min: 10, max: 200 }),
      storeId: faker.datatype.number({ min: 1 }),
      storeName: faker.company.name(),
      storeAddress: faker.address.streetAddress(),
      storePhone: faker.phone.phoneNumber('021-########'),
      status: 'available'
    }
  },

  // 订单相关
  orders: {
    list: Array(5).fill(null).map(() => ({
      id: faker.datatype.number({ min: 1000 }),
      orderNo: 'DD' + Date.now() + faker.datatype.number({ min: 1000 }),
      vehicleInfo: {
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        images: [faker.image.transport()]
      },
      startDate: faker.date.soon(10).toISOString().split('T')[0],
      endDate: faker.date.soon(20).toISOString().split('T')[0],
      totalPrice: faker.datatype.number({ min: 1000, max: 10000 }),
      status: faker.datatype.number({ min: 0, max: 5 }),
      createdAt: faker.date.recent().toISOString()
    })),
    detail: {
      id: faker.datatype.number({ min: 1000 }),
      orderNo: 'DD' + Date.now() + faker.datatype.number({ min: 1000 }),
      userInfo: {
        id: faker.datatype.number({ min: 1 }),
        nickname: faker.name.findName(),
        phone: faker.phone.phoneNumber('138########')
      },
      vehicleInfo: {
        id: faker.datatype.number({ min: 1 }),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        licensePlate: faker.vehicle.vin(),
        images: [faker.image.transport()]
      },
      startDate: faker.date.soon(10).toISOString().split('T')[0],
      endDate: faker.date.soon(20).toISOString().split('T')[0],
      days: faker.datatype.number({ min: 1, max: 30 }),
      dailyPrice: faker.datatype.number({ min: 300, max: 2000 }),
      insurancePrice: faker.datatype.number({ min: 50, max: 200 }),
      totalPrice: faker.datatype.number({ min: 1000, max: 10000 }),
      status: faker.datatype.number({ min: 0, max: 5 }),
      paymentStatus: faker.datatype.number({ min: 0, max: 2 }),
      createdAt: faker.date.recent().toISOString()
    }
  }
};

// API路由
app.use('/api/v1', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 认证相关
app.post('/api/v1/auth/login', (req, res) => {
  const { phone, code } = req.body;
  if (phone && code) {
    res.json(createResponse(mockData.users.login));
  } else {
    res.status(400).json(createErrorResponse(400001, '手机号和验证码不能为空'));
  }
});

app.get('/api/v1/auth/profile', (req, res) => {
  const token = req.headers.authorization;
  if (token) {
    res.json(createResponse(mockData.users.profile));
  } else {
    res.status(401).json(createErrorResponse(401001, '请先登录'));
  }
});

// 车辆相关
app.get('/api/v1/vehicles', (req, res) => {
  const { page = 1, limit = 10, brand, type } = req.query;
  let vehicles = [...mockData.vehicles.list];

  // 简单过滤
  if (brand) {
    vehicles = vehicles.filter(v => v.brand.includes(brand));
  }
  if (type) {
    vehicles = vehicles.filter(v => v.type === parseInt(type));
  }

  const total = vehicles.length;
  const start = (page - 1) * limit;
  const data = vehicles.slice(start, start + parseInt(limit));

  res.json(createResponse({
    list: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

app.get('/api/v1/vehicles/:id', (req, res) => {
  const { id } = req.params;
  // 模拟根据ID查询
  mockData.vehicles.detail.id = parseInt(id);
  res.json(createResponse(mockData.vehicles.detail));
});

// 订单相关
app.get('/api/v1/orders', (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  let orders = [...mockData.orders.list];

  if (status !== undefined) {
    orders = orders.filter(o => o.status === parseInt(status));
  }

  const total = orders.length;
  const start = (page - 1) * limit;
  const data = orders.slice(start, start + parseInt(limit));

  res.json(createResponse({
    list: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

app.get('/api/v1/orders/:id', (req, res) => {
  const { id } = req.params;
  mockData.orders.detail.id = parseInt(id);
  mockData.orders.detail.orderNo = 'DD' + Date.now() + id;
  res.json(createResponse(mockData.orders.detail));
});

// 通用404处理
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse(404001, `接口 ${req.originalUrl} 不存在`));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Mock Server Error:', err);
  res.status(500).json(createErrorResponse(500001, '服务器内部错误'));
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 Mock服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`📖 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

module.exports = app;