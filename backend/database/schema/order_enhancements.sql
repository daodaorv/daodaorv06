-- 订单管理系统增强数据库设计

-- 订单时间节点记录表
CREATE TABLE IF NOT EXISTS order_timeline (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  status_code VARCHAR(20) NOT NULL COMMENT '状态代码',
  status_name VARCHAR(50) NOT NULL COMMENT '状态名称',
  description TEXT COMMENT '状态描述',
  operator_id BIGINT COMMENT '操作人ID',
  operator_type ENUM('user', 'admin', 'system', 'driver') DEFAULT 'user' COMMENT '操作人类型',
  operator_name VARCHAR(100) COMMENT '操作人姓名',
  notes TEXT COMMENT '备注',
  images JSON COMMENT '相关图片（取车验车照片等）',
  location JSON COMMENT '地理位置信息',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_status_code (status_code),
  INDEX idx_operator_id (operator_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单时间节点记录表';

-- 订单提醒设置表
CREATE TABLE IF NOT EXISTS order_reminders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '提醒ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  reminder_type ENUM('pickup', 'return', 'payment', 'inspection') NOT NULL COMMENT '提醒类型',
  reminder_time DATETIME NOT NULL COMMENT '提醒时间',
  message TEXT NOT NULL COMMENT '提醒消息',
  channels JSON COMMENT '提醒渠道（wechat, sms, email, app）',
  status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending' COMMENT '提醒状态',
  sent_at TIMESTAMP NULL COMMENT '发送时间',
  read_at TIMESTAMP NULL COMMENT '阅读时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_reminder_type (reminder_type),
  INDEX idx_reminder_time (reminder_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单提醒设置表';

-- 订单退款申请表
CREATE TABLE IF NOT EXISTS order_refund_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '退款申请ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  refund_type ENUM('full', 'partial') NOT NULL COMMENT '退款类型',
  refund_amount DECIMAL(10,2) NOT NULL COMMENT '退款金额',
  refund_reason VARCHAR(500) NOT NULL COMMENT '退款原因',
  detailed_reason TEXT COMMENT '详细原因说明',
  evidence_images JSON COMMENT '证据图片',

  -- 处理信息
  status ENUM('pending', 'processing', 'approved', 'rejected', 'completed') DEFAULT 'pending' COMMENT '处理状态',
  admin_notes TEXT COMMENT '管理员备注',
  processed_by BIGINT COMMENT '处理人ID',
  processed_at TIMESTAMP NULL COMMENT '处理时间',
  refund_method ENUM('original', 'balance', 'bank') DEFAULT 'original' COMMENT '退款方式',
  refund_account JSON COMMENT '退款账户信息',
  actual_refund_amount DECIMAL(10,2) COMMENT '实际退款金额',
  refund_transaction_no VARCHAR(100) COMMENT '退款交易号',
  refund_completed_at TIMESTAMP NULL COMMENT '退款完成时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  UNIQUE KEY uk_order_refund (order_id) -- 每个订单只能有一个退款申请
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单退款申请表';

-- 订单评价邀请表
CREATE TABLE IF NOT EXISTS order_review_invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '邀请ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
  invitation_type ENUM('vehicle', 'service', 'overall') DEFAULT 'overall' COMMENT '邀请类型',

  -- 发送状态
  status ENUM('pending', 'sent', 'opened', 'responded', 'expired') DEFAULT 'pending' COMMENT '邀请状态',
  sent_at TIMESTAMP NULL COMMENT '发送时间',
  opened_at TIMESTAMP NULL COMMENT '打开时间',
  responded_at TIMESTAMP NULL COMMENT '回应时间',
  expires_at TIMESTAMP NULL COMMENT '过期时间',

  -- 渠道信息
  channel ENUM('wechat', 'sms', 'email', 'app') DEFAULT 'wechat' COMMENT '发送渠道',
  template_id VARCHAR(100) COMMENT '消息模板ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at),
  UNIQUE KEY uk_order_user_type (order_id, user_id, invitation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价邀请表';

-- 订单异常记录表
CREATE TABLE IF NOT EXISTS order_exceptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '异常记录ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  exception_type ENUM('late_pickup', 'late_return', 'damage', 'violation', 'accident', 'dispute') NOT NULL COMMENT '异常类型',
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT '严重程度',
  description TEXT NOT NULL COMMENT '异常描述',

  -- 处理信息
  status ENUM('pending', 'investigating', 'resolved', 'escalated') DEFAULT 'pending' COMMENT '处理状态',
  resolution TEXT COMMENT '解决方案',
  penalty_amount DECIMAL(10,2) COMMENT '罚金金额',
  compensation_amount DECIMAL(10,2) COMMENT '补偿金额',

  -- 相关人员
  reporter_id BIGINT COMMENT '报告人ID',
  reporter_type ENUM('user', 'driver', 'admin', 'system') DEFAULT 'user' COMMENT '报告人类型',
  handler_id BIGINT COMMENT '处理人ID',

  evidence_files JSON COMMENT '证据文件',
  notes TEXT COMMENT '备注',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_exception_type (exception_type),
  idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单异常记录表';

-- 订单消息通知表
CREATE TABLE IF NOT EXISTS order_notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  recipient_id BIGINT NOT NULL COMMENT '接收人ID',
  recipient_type ENUM('user', 'driver', 'admin', 'owner') NOT NULL COMMENT '接收人类型',

  notification_type ENUM('status_change', 'reminder', 'exception', 'payment', 'review') NOT NULL COMMENT '通知类型',
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT NOT NULL COMMENT '通知内容',

  -- 发送渠道
  channels JSON COMMENT '发送渠道（wechat, sms, email, app）',
  read_status ENUM('unread', 'read') DEFAULT 'unread' COMMENT '阅读状态',
  read_at TIMESTAMP NULL COMMENT '阅读时间',

  -- 关联数据
  related_data JSON COMMENT '相关数据',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_recipient (recipient_id, recipient_type),
  idx_notification_type (notification_type),
  idx_read_status (read_status),
  idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单消息通知表';

-- 订单费用明细表（扩展现有费用表）
CREATE TABLE IF NOT EXISTS order_fee_details (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '费用明细ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  fee_type ENUM('vehicle', 'insurance', 'service', 'deposit', 'penalty', 'compensation', 'discount', 'refund') NOT NULL COMMENT '费用类型',
  fee_name VARCHAR(100) NOT NULL COMMENT '费用名称',
  amount DECIMAL(10,2) NOT NULL COMMENT '费用金额',
  unit_price DECIMAL(10,2) COMMENT '单价',
  quantity DECIMAL(10,2) COMMENT '数量',

  -- 计算规则
  calculation_rule VARCHAR(500) COMMENT '计算规则说明',
  base_amount DECIMAL(10,2) COMMENT '基数金额',
  rate DECIMAL(5,4) COMMENT '费率',

  -- 状态
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending' COMMENT '费用状态',
  is_refundable TINYINT(1) DEFAULT 1 COMMENT '是否可退款',
  refunded_amount DECIMAL(10,2) DEFAULT 0 COMMENT '已退款金额',

  description TEXT COMMENT '费用描述',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_fee_type (fee_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单费用明细表';

-- 订单文件管理表
CREATE TABLE IF NOT EXISTS order_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '文件ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  file_type ENUM('contract', 'id_card', 'driver_license', 'vehicle_photo', 'inspection_photo', 'evidence', 'other') NOT NULL COMMENT '文件类型',
  file_name VARCHAR(200) NOT NULL COMMENT '文件名称',
  file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
  file_size INT COMMENT '文件大小（字节）',
  file_format VARCHAR(10) COMMENT '文件格式',

  -- 上传信息
  uploaded_by BIGINT COMMENT '上传人ID',
  uploader_type ENUM('user', 'driver', 'admin') DEFAULT 'user' COMMENT '上传人类型',
  upload_source ENUM('app', 'web', 'admin_system') DEFAULT 'app' COMMENT '上传来源',

  description TEXT COMMENT '文件描述',
  is_required TINYINT(1) DEFAULT 0 COMMENT '是否必需文件',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_file_type (file_type),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单文件管理表';

-- 为现有orders表添加新字段
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS parent_order_id BIGINT DEFAULT NULL COMMENT '父订单ID（用于改单、续单等）',
ADD COLUMN IF NOT EXISTS order_version INT DEFAULT 1 COMMENT '订单版本号',
ADD COLUMN IF NOT EXISTS priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '订单优先级',
ADD COLUMN IF NOT EXISTS source_channel ENUM('app', 'web', 'wechat', 'phone', 'offline') DEFAULT 'app' COMMENT '订单来源渠道',
ADD COLUMN IF NOT EXISTS assigned_driver_id BIGINT DEFAULT NULL COMMENT '分配的司机ID',
ADD COLUMN IF NOT EXISTS assigned_driver_name VARCHAR(100) DEFAULT NULL COMMENT '司机姓名',
ADD COLUMN IF NOT EXISTS pickup_contact_name VARCHAR(100) DEFAULT NULL COMMENT '取车联系人姓名',
ADD COLUMN IF NOT EXISTS pickup_contact_phone VARCHAR(20) DEFAULT NULL COMMENT '取车联系人电话',
ADD COLUMN IF NOT EXISTS return_contact_name VARCHAR(100) DEFAULT NULL COMMENT '还车联系人姓名',
ADD COLUMN IF NOT EXISTS return_contact_phone VARCHAR(20) DEFAULT NULL COMMENT '还车联系人电话',
ADD COLUMN IF NOT EXISTS special_requirements TEXT COMMENT '特殊要求',
ADD COLUMN IF NOT EXISTS internal_notes TEXT COMMENT '内部备注',
ADD COLUMN IF NOT EXISTS total_distance DECIMAL(10,2) DEFAULT NULL COMMENT '总行驶里程（公里）',
ADD COLUMN IF NOT EXISTS fuel_level_pickup DECIMAL(3,1) DEFAULT NULL COMMENT '取车时油量',
ADD COLUMN IF NOT EXISTS fuel_level_return DECIMAL(3,1) DEFAULT NULL COMMENT '还车时油量',
ADD COLUMN IF NOT EXISTS damage_status_pickup ENUM('none', 'minor', 'major') DEFAULT 'none' COMMENT '取车时车况',
ADD COLUMN IF NOT EXISTS damage_status_return ENUM('none', 'minor', 'major') DEFAULT 'none' COMMENT '还车时车况',
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
ADD COLUMN IF NOT EXISTS cancellation_penalty DECIMAL(10,2) DEFAULT 0 COMMENT '取消罚金',
ADD COLUMN IF NOT EXISTS customer_rating INT DEFAULT NULL COMMENT '客户评分（1-5）',
ADD COLUMN IF NOT EXISTS driver_rating INT DEFAULT NULL COMMENT '司机评分（1-5）',
ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后状态变更时间',
ADD COLUMN IF NOT EXISTS estimated_completion_time DATETIME DEFAULT NULL COMMENT '预计完成时间',
ADD COLUMN IF NOT EXISTS auto_reminder_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用自动提醒',
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100) DEFAULT NULL COMMENT '紧急联系人',
ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20) DEFAULT NULL COMMENT '紧急联系电话';

-- 添加索引
ALTER TABLE orders
ADD INDEX idx_parent_order_id (parent_order_id),
ADD INDEX idx_priority (priority),
ADD INDEX idx_source_channel (source_channel),
ADD INDEX idx_assigned_driver_id (assigned_driver_id),
ADD INDEX idx_pickup_time (pickup_time),
ADD INDEX idx_return_time (return_time),
ADD INDEX idx_created_at (created_at),
ADD INDEX idx_last_status_change_at (last_status_change_at);

-- 创建触发器：订单状态变更时自动记录时间线
DELIMITER //
CREATE TRIGGER after_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  IF NEW.status_id != OLD.status_id THEN
    -- 获取状态名称
    SET @status_name = (SELECT name FROM order_status WHERE id = NEW.status_id);
    SET @status_code = (SELECT code FROM order_status WHERE id = NEW.status_id);

    -- 插入时间线记录
    INSERT INTO order_timeline (
      order_id,
      status_code,
      status_name,
      description,
      operator_type,
      notes
    ) VALUES (
      NEW.id,
      @status_code,
      @status_name,
      CONCAT('订单状态从 "', (SELECT name FROM order_status WHERE id = OLD.status_id), '" 变更为 "', @status_name, '"'),
      'system',
      '系统自动记录状态变更'
    );

    -- 更新最后状态变更时间
    UPDATE orders SET last_status_change_at = NOW() WHERE id = NEW.id;
  END IF;
END//
DELIMITER ;

-- 创建存储过程：自动生成订单提醒
DELIMITER //
CREATE PROCEDURE GenerateOrderReminders()
BEGIN
  -- 生成取车提醒（提前2小时）
  INSERT INTO order_reminders (order_id, user_id, reminder_type, reminder_time, message, channels, status)
  SELECT
    o.id,
    o.user_id,
    'pickup',
    DATE_SUB(o.pickup_time, INTERVAL 2 HOUR),
    CONCAT('您有订单将在2小时后取车，订单号：', o.order_no, '，请准时到达取车地点。'),
    JSON_ARRAY('wechat', 'sms'),
    'pending'
  FROM orders o
  WHERE o.status_id = 3 -- 待取车
    AND o.pickup_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
    AND o.auto_reminder_enabled = 1
    AND NOT EXISTS (
      SELECT 1 FROM order_reminders r
      WHERE r.order_id = o.id
        AND r.reminder_type = 'pickup'
        AND r.status = 'pending'
    )
    ON DUPLICATE KEY UPDATE
      reminder_time = VALUES(reminder_time),
      message = VALUES(message);

  -- 生成还车提醒（提前1小时）
  INSERT INTO order_reminders (order_id, user_id, reminder_type, reminder_time, message, channels, status)
  SELECT
    o.id,
    o.user_id,
    'return',
    DATE_SUB(o.return_time, INTERVAL 1 HOUR),
    CONCAT('您有订单将在1小时后到期，订单号：', o.order_no, '，请及时还车。'),
    JSON_ARRAY('wechat', 'sms'),
    'pending'
  FROM orders o
  WHERE o.status_id = 4 -- 使用中
    AND o.return_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
    AND o.auto_reminder_enabled = 1
    AND NOT EXISTS (
      SELECT 1 FROM order_reminders r
      WHERE r.order_id = o.id
        AND r.reminder_type = 'return'
        AND r.status = 'pending'
    )
    ON DUPLICATE KEY UPDATE
      reminder_time = VALUES(reminder_time),
      message = VALUES(message);
END//
DELIMITER ;

-- 创建定时任务（事件调度器）
SET GLOBAL event_scheduler = ON;

-- 创建每天执行的任务
CREATE EVENT IF NOT EXISTS daily_order_tasks
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '08:00:00')
DO
BEGIN
  CALL GenerateOrderReminders();

  -- 过期未支付的订单自动取消
  UPDATE orders
  SET status_id = 7, -- 已取消
      cancellation_reason = '超时未支付自动取消',
      cancellation_penalty = 0
  WHERE status_id = 1 -- 待支付
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE);

  -- 发送评价邀请（订单完成后24小时）
  INSERT INTO order_review_invitations (order_id, user_id, vehicle_id, invitation_type, status, expires_at)
  SELECT
    o.id,
    o.user_id,
    o.vehicle_id,
    'overall',
    'pending',
    DATE_ADD(NOW(), INTERVAL 7 DAY) -- 7天后过期
  FROM orders o
  WHERE o.status_id = 6 -- 已完成
    AND o.completed_at BETWEEN DATE_SUB(NOW(), INTERVAL 24 HOUR) AND DATE_SUB(NOW(), INTERVAL 23 HOUR)
    AND NOT EXISTS (
      SELECT 1 FROM order_review_invitations r
      WHERE r.order_id = o.id
        AND r.invitation_type = 'overall'
    );
END//

-- 添加视图：订单完整信息视图
CREATE OR REPLACE VIEW order_complete_view AS
SELECT
  o.*,
  os.name as status_name,
  os.code as status_code,
  u.nickname as user_nickname,
  u.phone as user_phone,
  v.name as vehicle_name,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.plate_number as vehicle_plate_number,
  ps.name as pickup_store_name,
  ps.address as pickup_store_address,
  rs.name as return_store_name,
  rs.address as return_store_address,
  d.nickname as driver_nickname,
  d.phone as driver_phone,
  -- 费用汇总
  (SELECT SUM(amount) FROM order_fee_details WHERE order_id = o.id AND status = 'confirmed') as total_confirmed_fees,
  (SELECT COUNT(*) FROM order_reminders WHERE order_id = o.id AND status = 'sent') as reminders_sent,
  (SELECT COUNT(*) FROM order_exceptions WHERE order_id = o.id AND status != 'resolved') as pending_exceptions,
  (SELECT COUNT(*) FROM order_files WHERE order_id = o.id) as file_count,
  -- 时间线最新记录
  (SELECT description FROM order_timeline WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as latest_timeline_note
FROM orders o
LEFT JOIN order_status os ON o.status_id = os.id
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN vehicles v ON o.vehicle_id = v.id
LEFT JOIN stores ps ON o.pickup_store_id = ps.id
LEFT JOIN stores rs ON o.return_store_id = rs.id
LEFT JOIN users d ON o.assigned_driver_id = d.id;