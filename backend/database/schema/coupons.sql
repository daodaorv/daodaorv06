-- 优惠券相关数据表

-- 优惠券模板表
CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '优惠券ID',
  name VARCHAR(200) NOT NULL COMMENT '优惠券名称',
  description TEXT COMMENT '优惠券描述',
  type ENUM('fixed', 'percentage') NOT NULL COMMENT '优惠券类型',
  discount DECIMAL(10,2) NOT NULL COMMENT '优惠金额/折扣比例',
  min_amount DECIMAL(10,2) DEFAULT 0 COMMENT '最低使用金额',
  max_discount DECIMAL(10,2) DEFAULT NULL COMMENT '最大优惠金额（百分比优惠券时）',

  -- 使用规则
  applicable_products JSON COMMENT '适用商品ID列表（null表示全部商品）',
  applicable_categories JSON COMMENT '适用分类ID列表',
  applicable_stores JSON COMMENT '适用门店ID列表',

  -- 发放规则
  total_quantity INT DEFAULT 0 COMMENT '总发放数量',
  per_user_limit INT DEFAULT 1 COMMENT '每人限领数量',
  is_stackable TINYINT(1) DEFAULT 0 COMMENT '是否可叠加使用',

  -- 有效期规则
  valid_days INT DEFAULT 30 COMMENT '有效天数',
  valid_from DATETIME COMMENT '有效期开始时间',
  valid_until DATETIME COMMENT '有效期结束时间',

  -- 状态和管理
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_by INT COMMENT '创建者ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_type (type),
  INDEX idx_is_active (is_active),
  INDEX idx_valid_from (valid_from),
  INDEX idx_valid_until (valid_until),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板表';

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户优惠券ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  coupon_id BIGINT NOT NULL COMMENT '优惠券模板ID',
  coupon_code VARCHAR(50) NOT NULL UNIQUE COMMENT '优惠券码',

  -- 状态
  status ENUM('unused', 'used', 'expired', 'cancelled') DEFAULT 'unused' COMMENT '状态',

  -- 使用信息
  used_at TIMESTAMP NULL COMMENT '使用时间',
  used_order_id BIGINT NULL COMMENT '使用的订单ID',

  -- 有效期
  valid_from DATETIME NOT NULL COMMENT '有效开始时间',
  valid_until DATETIME NOT NULL COMMENT '有效结束时间',

  -- 获取信息
  obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获取时间',
  obtain_source ENUM('register', 'activity', 'purchase', 'gift', 'admin') DEFAULT 'activity' COMMENT '获取来源',
  source_related_id BIGINT COMMENT '来源相关ID（活动ID等）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_coupon_code (coupon_code),
  INDEX idx_status (status),
  INDEX idx_valid_from (valid_from),
  INDEX idx_valid_until (valid_until),
  INDEX idx_obtained_at (obtained_at),
  UNIQUE KEY uk_user_coupon_code (user_id, coupon_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

-- 优惠券活动表
CREATE TABLE IF NOT EXISTS coupon_activities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '活动ID',
  title VARCHAR(200) NOT NULL COMMENT '活动标题',
  description TEXT COMMENT '活动描述',
  banner_url VARCHAR(500) COMMENT '活动横幅图片URL',

  -- 活动规则
  coupon_id BIGINT NOT NULL COMMENT '优惠券模板ID',
  distribution_type ENUM('auto', 'manual', 'code', 'task') DEFAULT 'manual' COMMENT '发放方式',
  distribution_condition JSON COMMENT '发放条件',

  -- 时间设置
  start_time DATETIME NOT NULL COMMENT '活动开始时间',
  end_time DATETIME NOT NULL COMMENT '活动结束时间',

  -- 限制条件
  min_user_level ENUM('all', 'vip', 'new') DEFAULT 'all' COMMENT '最低用户等级',
  max_participants INT DEFAULT 0 COMMENT '最大参与人数（0表示无限制）',
  daily_limit INT DEFAULT 0 COMMENT '每日限量（0表示无限制）',

  -- 状态
  status ENUM('draft', 'active', 'paused', 'ended') DEFAULT 'draft' COMMENT '活动状态',

  created_by INT COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_end_time (end_time),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券活动表';

-- 优惠券发放记录表
CREATE TABLE IF NOT EXISTS coupon_distribution_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '发放记录ID',
  activity_id BIGINT COMMENT '活动ID',
  coupon_id BIGINT NOT NULL COMMENT '优惠券模板ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  user_coupon_id BIGINT NOT NULL COMMENT '用户优惠券ID',
  coupon_code VARCHAR(50) NOT NULL COMMENT '优惠券码',

  -- 发放信息
  distribution_type VARCHAR(20) NOT NULL COMMENT '发放方式',
  distribution_reason VARCHAR(500) COMMENT '发放原因',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_activity_id (activity_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id),
  INDEX idx_distribution_type (distribution_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券发放记录表';

-- 优惠券使用记录表
CREATE TABLE IF NOT EXISTS coupon_usage_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '使用记录ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  coupon_id BIGINT NOT NULL COMMENT '优惠券模板ID',
  user_coupon_id BIGINT NOT NULL COMMENT '用户优惠券ID',
  coupon_code VARCHAR(50) NOT NULL COMMENT '优惠券码',

  -- 使用信息
  order_id BIGINT NOT NULL COMMENT '订单ID',
  order_amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  discount_amount DECIMAL(10,2) NOT NULL COMMENT '优惠金额',
  actual_amount DECIMAL(10,2) NOT NULL COMMENT '实际支付金额',

  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_order_id (order_id),
  INDEX idx_used_at (used_at),
  INDEX idx_coupon_code (coupon_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券使用记录表';

-- 插入一些示例优惠券数据
INSERT INTO coupons (name, description, type, discount, min_amount, valid_days, is_active, sort_order) VALUES
('新用户专享券', '新注册用户专享，首次下单立减', 'fixed', 50.00, 100.00, 30, 1, 1),
('满300减30', '订单满300元立减30元', 'fixed', 30.00, 300.00, 60, 1, 2),
('满500减80', '订单满500元立减80元', 'fixed', 80.00, 500.00, 90, 1, 3),
('周末特惠8折', '周末下单享受8折优惠', 'percentage', 20.00, 200.00, 7, 1, 4),
('VIP专享券', 'VIP会员专享，最高减100元', 'fixed', 100.00, 1000.00, 365, 1, 5),
('生日礼券', '生日当月专享，免单券', 'fixed', 200.00, 0, 30, 1, 6);