-- 订单相关数据表

-- 订单状态枚举
CREATE TABLE IF NOT EXISTS order_status (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '状态ID',
  name VARCHAR(50) NOT NULL COMMENT '状态名称',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '状态代码',
  description TEXT COMMENT '状态描述',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态表';

-- 插入订单状态数据
INSERT INTO order_status (name, code, description, sort_order) VALUES
('待支付', 'pending_payment', '订单已创建，等待用户支付', 1),
('待确认', 'pending_confirmation', '已支付，等待商家确认', 2),
('待取车', 'pending_pickup', '已确认，等待用户取车', 3),
('使用中', 'in_progress', '用户正在使用房车', 4),
('待还车', 'pending_return', '租赁期结束，等待用户还车', 5),
('已完成', 'completed', '订单已完成，等待结算', 6),
('已取消', 'cancelled', '订单已取消', 7),
('已退款', 'refunded', '订单已退款', 8);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
  pickup_store_id BIGINT NOT NULL COMMENT '取车门店ID',
  return_store_id BIGINT COMMENT '还车门店ID（异地还车时）',
  status_id INT NOT NULL DEFAULT 1 COMMENT '订单状态ID',

  -- 时间信息
  pickup_time DATETIME NOT NULL COMMENT '取车时间',
  return_time DATETIME NOT NULL COMMENT '还车时间',
  actual_pickup_time DATETIME COMMENT '实际取车时间',
  actual_return_time DATETIME COMMENT '实际还车时间',

  -- 费用信息
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  vehicle_fee DECIMAL(10,2) NOT NULL COMMENT '车辆租赁费用',
  insurance_fee DECIMAL(10,2) DEFAULT 0 COMMENT '保险费用',
  service_fee DECIMAL(10,2) DEFAULT 0 COMMENT '服务费用',
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金金额',
  coupon_discount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠券折扣',
  actual_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',

  -- 用户信息
  contact_name VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  contact_phone VARCHAR(20) NOT NULL COMMENT '联系人电话',
  id_card_number VARCHAR(18) NOT NULL COMMENT '身份证号',
  driver_license_number VARCHAR(50) COMMENT '驾驶证号',

  -- 优惠信息
  coupon_id BIGINT COMMENT '使用的优惠券ID',
  promotion_id BIGINT COMMENT '使用的促销活动ID',

  -- 备注信息
  user_remark TEXT COMMENT '用户备注',
  admin_remark TEXT COMMENT '管理员备注',

  -- 取消信息
  cancel_reason VARCHAR(200) COMMENT '取消原因',
  cancel_time TIMESTAMP NULL COMMENT '取消时间',
  cancel_by VARCHAR(20) COMMENT '取消方（user/admin/system）',

  -- 评价信息
  is_rated TINYINT(1) DEFAULT 0 COMMENT '是否已评价',
  rating_id BIGINT COMMENT '评价ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_status_id (status_id),
  INDEX idx_pickup_store_id (pickup_store_id),
  INDEX idx_return_store_id (return_store_id),
  INDEX idx_pickup_time (pickup_time),
  INDEX idx_return_time (return_time),
  INDEX idx_created_at (created_at),
  INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单状态日志表
CREATE TABLE IF NOT EXISTS order_status_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  from_status_id INT COMMENT '原状态ID',
  to_status_id INT NOT NULL COMMENT '新状态ID',
  operator_id BIGINT COMMENT '操作人ID',
  operator_type VARCHAR(20) NOT NULL COMMENT '操作人类型（user/admin/system）',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_to_status_id (to_status_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态变更日志表';

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '支付ID',
  payment_no VARCHAR(32) NOT NULL UNIQUE COMMENT '支付流水号',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  payment_type VARCHAR(20) NOT NULL COMMENT '支付类型（deposit/full_payment/balance）',
  payment_method VARCHAR(20) NOT NULL COMMENT '支付方式（wechat/alipay/balance）',
  amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '支付状态（pending/success/failed/refunded）',

  -- 第三方支付信息
  third_party_transaction_id VARCHAR(100) COMMENT '第三方交易流水号',
  third_party_response TEXT COMMENT '第三方支付响应数据',

  -- 时间信息
  paid_time TIMESTAMP NULL COMMENT '支付完成时间',
  refund_time TIMESTAMP NULL COMMENT '退款时间',
  refund_amount DECIMAL(10,2) DEFAULT 0 COMMENT '退款金额',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_payment_no (payment_no),
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_type (payment_type),
  INDEX idx_paid_time (paid_time),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- 订单车辆检查记录表
CREATE TABLE IF NOT EXISTS order_vehicle_inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '检查记录ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  inspection_type VARCHAR(20) NOT NULL COMMENT '检查类型（pickup/return）',
  inspector_id BIGINT NOT NULL COMMENT '检查人ID',
  inspector_type VARCHAR(20) NOT NULL COMMENT '检查人类型（user/admin）',

  -- 车况检查
  mileage INT DEFAULT 0 COMMENT '里程表读数',
  fuel_level DECIMAL(3,1) DEFAULT 0 COMMENT '油量百分比',
  exterior_condition TEXT COMMENT '外观状况',
  interior_condition TEXT COMMENT '内饰状况',
  equipment_status TEXT COMMENT '设备状态',
  damage_description TEXT COMMENT '损坏描述',
  damage_images JSON COMMENT '损坏照片URLs',

  -- 证件检查
  id_card_checked TINYINT(1) DEFAULT 0 COMMENT '身份证是否已检查',
  driver_license_checked TINYINT(1) DEFAULT 0 COMMENT '驾驶证是否已检查',
  deposit_paid TINYINT(1) DEFAULT 0 COMMENT '押金是否已支付',

  customer_signature VARCHAR(200) COMMENT '客户签名',
  staff_signature VARCHAR(200) COMMENT '员工签名',

  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_inspection_type (inspection_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单车辆检查记录表';

-- 订单费用明细表
CREATE TABLE IF NOT EXISTS order_fee_details (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '费用明细ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  fee_type VARCHAR(50) NOT NULL COMMENT '费用类型（rental/insurance/service/penalty/extra）',
  fee_name VARCHAR(100) NOT NULL COMMENT '费用名称',
  fee_code VARCHAR(50) COMMENT '费用代码',
  unit_price DECIMAL(10,2) NOT NULL COMMENT '单价',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1 COMMENT '数量',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '费用金额',
  description TEXT COMMENT '费用描述',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_fee_type (fee_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单费用明细表';

-- 订单延期记录表
CREATE TABLE IF NOT EXISTS order_extensions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '延期记录ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  original_return_time DATETIME NOT NULL COMMENT '原还车时间',
  new_return_time DATETIME NOT NULL COMMENT '新还车时间',
  extension_hours INT NOT NULL COMMENT '延期小时数',
  extension_fee DECIMAL(10,2) NOT NULL COMMENT '延期费用',
  request_time DATETIME NOT NULL COMMENT '申请时间',
  approved_time TIMESTAMP NULL COMMENT '审批时间',
  approver_id BIGINT COMMENT '审批人ID',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending/approved/rejected）',
  remark TEXT COMMENT '备注',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_request_time (request_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单延期记录表';

-- 订单评价表
CREATE TABLE IF NOT EXISTS order_ratings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
  order_id BIGINT NOT NULL UNIQUE COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
  rating DECIMAL(2,1) NOT NULL COMMENT '总体评分（1-5）',

  -- 详细评分
  vehicle_condition_rating DECIMAL(2,1) COMMENT '车况评分',
  service_attitude_rating DECIMAL(2,1) COMMENT '服务态度评分',
  value_for_money_rating DECIMAL(2,1) COMMENT '性价比评分',

  -- 评价内容
  comment TEXT COMMENT '评价内容',
  images JSON COMMENT '评价图片URLs',

  -- 标签
  tags JSON COMMENT '评价标签',

  -- 商家回复
  merchant_reply TEXT COMMENT '商家回复',
  merchant_reply_time TIMESTAMP NULL COMMENT '商家回复时间',

  is_anonymous TINYINT(1) DEFAULT 0 COMMENT '是否匿名评价',
  is_hidden TINYINT(1) DEFAULT 0 COMMENT '是否隐藏',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价表';