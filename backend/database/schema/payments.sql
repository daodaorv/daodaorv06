-- 支付相关数据表

-- 支付方式配置表
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '支付方式ID',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '支付方式代码',
  name VARCHAR(100) NOT NULL COMMENT '支付方式名称',
  description VARCHAR(500) COMMENT '支付方式描述',
  icon_url VARCHAR(500) COMMENT '图标URL',
  is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序',
  config JSON COMMENT '支付配置参数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付方式配置表';

-- 插入默认支付方式
INSERT INTO payment_methods (code, name, description, icon_url, is_enabled, sort_order) VALUES
('wechat', '微信支付', '使用微信余额、银行卡等方式支付', '/static/payment/wechat.png', 1, 1),
('alipay', '支付宝', '使用支付宝余额、花呗、银行卡等方式支付', '/static/payment/alipay.png', 1, 2),
('balance', '余额支付', '使用账户余额支付', '/static/payment/balance.png', 1, 3),
('unionpay', '银联支付', '使用银联卡支付', '/static/payment/unionpay.png', 0, 4);

-- 支付渠道配置表
CREATE TABLE IF NOT EXISTS payment_channels (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '渠道ID',
  method_code VARCHAR(50) NOT NULL COMMENT '支付方式代码',
  channel_code VARCHAR(50) NOT NULL COMMENT '渠道代码',
  channel_name VARCHAR(100) NOT NULL COMMENT '渠道名称',
  provider VARCHAR(50) NOT NULL COMMENT '支付提供商（wechat/alipay/unionpay）',
  environment VARCHAR(20) DEFAULT 'production' COMMENT '环境（sandbox/production）',
  merchant_id VARCHAR(100) COMMENT '商户ID',
  app_id VARCHAR(100) COMMENT '应用ID',
  app_secret VARCHAR(500) COMMENT '应用密钥（加密存储）',
  public_key TEXT COMMENT '公钥（RSA）',
  private_key TEXT COMMENT '私钥（RSA，加密存储）',
  cert_path VARCHAR(500) COMMENT '证书路径',
  notify_url VARCHAR(500) COMMENT '支付回调地址',
  refund_url VARCHAR(500) COMMENT '退款回调地址',
  config JSON COMMENT '其他配置参数',
  is_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_method_code (method_code),
  INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付渠道配置表';

-- 支付交易流水表（扩展现有的payments表）
ALTER TABLE payments
ADD COLUMN channel_id INT COMMENT '支付渠道ID' AFTER payment_method,
ADD COLUMN transaction_no VARCHAR(100) COMMENT '第三方交易流水号' AFTER third_party_transaction_id,
ADD COLUMN client_ip VARCHAR(45) COMMENT '客户端IP',
ADD COLUMN device_info VARCHAR(200) COMMENT '设备信息',
ADD COLUMN extend_params JSON COMMENT '扩展参数',
ADD COLUMN pay_time TIMESTAMP NULL COMMENT '支付完成时间（精确）' AFTER paid_time,
ADD COLUMN failure_reason VARCHAR(500) COMMENT '支付失败原因',
ADD COLUMN is_batch TINYINT(1) DEFAULT 0 COMMENT '是否批量支付',
ADD COLUMN parent_payment_id BIGINT COMMENT '父支付ID（批量支付时）';

-- 支付日志表
CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  payment_id BIGINT COMMENT '支付记录ID',
  payment_no VARCHAR(32) COMMENT '支付流水号',
  action VARCHAR(50) NOT NULL COMMENT '操作类型（create/query/pay/refund/notify）',
  request_data JSON COMMENT '请求数据',
  response_data JSON COMMENT '响应数据',
  status VARCHAR(20) NOT NULL COMMENT '操作状态（success/failed/pending）',
  error_code VARCHAR(100) COMMENT '错误代码',
  error_message VARCHAR(500) COMMENT '错误信息',
  duration_ms INT COMMENT '处理耗时（毫秒）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_payment_id (payment_id),
  INDEX idx_payment_no (payment_no),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付日志表';

-- 支付退款记录表（扩展现有的payments表，这里创建独立的退款表）
CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '退款ID',
  refund_no VARCHAR(32) NOT NULL UNIQUE COMMENT '退款单号',
  payment_id BIGINT NOT NULL COMMENT '原支付记录ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  refund_amount DECIMAL(10,2) NOT NULL COMMENT '退款金额',
  refund_reason VARCHAR(500) COMMENT '退款原因',
  refund_type VARCHAR(20) NOT NULL DEFAULT 'full' COMMENT '退款类型（full/partial）',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '退款状态（pending/processing/success/failed/cancelled）',

  -- 第三方退款信息
  third_party_refund_id VARCHAR(100) COMMENT '第三方退款单号',
  channel_id INT COMMENT '支付渠道ID',

  -- 处理信息
  apply_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  process_time TIMESTAMP NULL COMMENT '处理时间',
  success_time TIMESTAMP NULL COMMENT '成功时间',
  failure_reason VARCHAR(500) COMMENT '失败原因',

  -- 操作信息
  operator_id BIGINT COMMENT '操作人ID',
  operator_type VARCHAR(20) NOT NULL COMMENT '操作人类型（user/admin/system）',
  admin_remark TEXT COMMENT '管理员备注',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_refund_no (refund_no),
  INDEX idx_payment_id (payment_id),
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_apply_time (apply_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付退款记录表';

-- 账户余额表
CREATE TABLE IF NOT EXISTS user_balances (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '余额记录ID',
  user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
  available_balance DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '可用余额',
  frozen_balance DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '冻结余额',
  total_recharge DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计充值',
  total_consume DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '累计消费',
  last_recharge_time TIMESTAMP NULL COMMENT '最后充值时间',
  last_consume_time TIMESTAMP NULL COMMENT '最后消费时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户账户余额表';

-- 余额变动记录表
CREATE TABLE IF NOT EXISTS balance_transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '交易记录ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  transaction_no VARCHAR(32) NOT NULL UNIQUE COMMENT '交易流水号',
  transaction_type VARCHAR(20) NOT NULL COMMENT '交易类型（recharge/consume/refreeze/unfreeze/withdraw）',
  amount DECIMAL(10,2) NOT NULL COMMENT '变动金额',
  balance_before DECIMAL(10,2) NOT NULL COMMENT '变动前余额',
  balance_after DECIMAL(10,2) NOT NULL COMMENT '变动后余额',
  frozen_amount DECIMAL(10,2) DEFAULT 0 COMMENT '冻结金额变动',

  -- 关联信息
  related_order_id BIGINT COMMENT '关联订单ID',
  related_payment_id BIGINT COMMENT '关联支付ID',
  related_refund_id BIGINT COMMENT '关联退款ID',

  -- 描述信息
  description VARCHAR(500) COMMENT '交易描述',
  remark TEXT COMMENT '备注',

  -- 处理信息
  status VARCHAR(20) NOT NULL DEFAULT 'success' COMMENT '交易状态（success/failed/pending）',
  operator_id BIGINT COMMENT '操作人ID',
  operator_type VARCHAR(20) COMMENT '操作人类型',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_transaction_no (transaction_no),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_related_order_id (related_order_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 充值订单表
CREATE TABLE IF NOT EXISTS recharge_orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '充值订单ID',
  recharge_no VARCHAR(32) NOT NULL UNIQUE COMMENT '充值单号',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
  bonus_amount DECIMAL(10,2) DEFAULT 0 COMMENT '赠送金额',
  actual_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  payment_method VARCHAR(20) NOT NULL COMMENT '支付方式',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '支付状态',

  -- 第三方支付信息
  third_party_transaction_id VARCHAR(100) COMMENT '第三方交易流水号',
  pay_time TIMESTAMP NULL COMMENT '支付时间',

  -- 活动信息
  promotion_id BIGINT COMMENT '活动ID',
  promotion_rule JSON COMMENT '活动规则',

  -- 状态信息
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态（pending/paid/failed/cancelled/refunded）',
  failure_reason VARCHAR(500) COMMENT '失败原因',

  -- 时间信息
  expire_time TIMESTAMP COMMENT '过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_recharge_no (recharge_no),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值订单表';

-- 支付配置表
CREATE TABLE IF NOT EXISTS payment_configs (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  config_value TEXT NOT NULL COMMENT '配置值',
  config_type VARCHAR(20) NOT NULL COMMENT '配置类型（string/json/number/boolean）',
  description VARCHAR(500) COMMENT '配置描述',
  is_encrypted TINYINT(1) DEFAULT 0 COMMENT '是否加密存储',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付系统配置表';

-- 插入默认配置
INSERT INTO payment_configs (config_key, config_value, config_type, description) VALUES
('payment_timeout', '1800', 'number', '支付超时时间（秒）'),
('refund_auto_confirm', 'true', 'boolean', '退款自动确认'),
('max_refund_days', '90', 'number', '最大退款天数'),
('balance_pay_enabled', 'true', 'boolean', '是否启用余额支付'),
('min_recharge_amount', '1.00', 'string', '最小充值金额'),
('max_recharge_amount', '10000.00', 'string', '最大充值金额'),
('daily_recharge_limit', '50000.00', 'string', '每日充值限额'),
('recharge_bonus_enabled', 'false', 'boolean', '是否启用充值赠送');