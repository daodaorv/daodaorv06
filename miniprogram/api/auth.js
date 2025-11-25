import request from '@/utils/request.js';

export const authApi = {
  // 发送验证码
  sendCode(data) {
    return request.post('/auth/send-code', data);
  },

  // 用户注册
  register(data) {
    return request.post('/auth/register', data);
  },

  // 密码登录
  login(data) {
    return request.post('/auth/login', data);
  },

  // 验证码登录
  loginWithCode(data) {
    return request.post('/auth/login-with-code', data);
  },

  // 微信登录
  wechatLogin(data) {
    return request.post('/auth/wechat-login', data);
  },

  // QQ登录
  qqLogin(data) {
    return request.post('/auth/qq-login', data);
  },

  // Apple登录
  appleLogin(data) {
    return request.post('/auth/apple-login', data);
  },

  // 自动登录（检查token有效性）
  autoLogin() {
    return request.post('/auth/auto-login');
  },

  // 刷新token
  refreshToken() {
    return request.post('/auth/refresh-token');
  },

  // 登出
  logout() {
    return request.post('/auth/logout');
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/users/profile');
  },

  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/users/profile', data);
  },

  // 获取登录日志
  getLoginLogs(params) {
    return request.get('/users/login-logs', params);
  },

  // 忘记密码
  forgotPassword(data) {
    return request.post('/auth/forgot-password', data);
  },

  // 重置密码
  resetPassword(data) {
    return request.post('/auth/reset-password', data);
  },

  // 修改密码
  changePassword(data) {
    return request.post('/auth/change-password', data);
  },
};

