-- =====================================================
-- 迁移脚本：特惠商城管理表创建
-- 版本：v1.0
-- 创建时间：2026-01-06
-- 描述：创建特惠商城管理所需的4个核心表
-- =====================================================

-- 1. 优惠券产品表
CREATE TABLE IF NOT EXISTS coupon_products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_id BIGINT NOT NULL COMMENT '关联的优惠券ID',
  product_title VARCHAR(100) NOT NULL COMMENT '产品标题',
  product_description TEXT COMMENT '产品描述',
  product_image VARCHAR(500) COMMENT '产品图片URL',
  display_position VARCHAR(50) COMMENT '展示位置：newbie-新人专区, hot-热门推荐, limited-限时特惠',
  special_tags JSON COMMENT '特殊标签：["新人专享","会员专属","即将售罄"]',
  display_order INT DEFAULT 0 COMMENT '展示顺序',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-上架, inactive-下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_status (status),
  INDEX idx_display_position (display_position),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券产品表';

-- 2. 获取方式配置表
CREATE TABLE IF NOT EXISTS coupon_acquisition_methods (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_product_id BIGINT NOT NULL COMMENT '优惠券产品ID',
  method_type VARCHAR(20) NOT NULL COMMENT '获取方式：free-免费领取, points-积分兑换, cash-现金购买, combo-积分+现金, share-分享得券, invite-邀请得券',
  method_config JSON NOT NULL COMMENT '获取方式配置（根据类型不同，配置不同）',
  priority INT DEFAULT 0 COMMENT '展示优先级',
  is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
  start_time TIMESTAMP NULL COMMENT '生效时间',
  end_time TIMESTAMP NULL COMMENT '失效时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (coupon_product_id),
  INDEX idx_method_type (method_type),
  INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='获取方式配置表';

-- 3. 优惠券库存表
CREATE TABLE IF NOT EXISTS coupon_inventory (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_product_id BIGINT NOT NULL COMMENT '优惠券产品ID',
  total_stock INT NOT NULL DEFAULT 0 COMMENT '总库存',
  sold_count INT NOT NULL DEFAULT 0 COMMENT '已售出数量',
  remaining_stock INT NOT NULL DEFAULT 0 COMMENT '剩余库存',
  warning_threshold INT DEFAULT 100 COMMENT '库存预警阈值',
  auto_offline_when_empty TINYINT DEFAULT 1 COMMENT '库存耗尽时自动下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_product_id (coupon_product_id),
  INDEX idx_remaining_stock (remaining_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券库存表';

-- 4. 限购规则表
CREATE TABLE IF NOT EXISTS coupon_purchase_limits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_product_id BIGINT NOT NULL COMMENT '优惠券产品ID',
  method_type VARCHAR(20) NOT NULL COMMENT '获取方式类型',
  limit_per_user INT NOT NULL DEFAULT 1 COMMENT '每人限购次数',
  limit_period VARCHAR(20) DEFAULT 'total' COMMENT '限购周期：daily-每日, weekly-每周, monthly-每月, total-总计',
  user_type VARCHAR(20) DEFAULT 'all' COMMENT '用户类型：all-所有用户, newbie-新用户, member-会员',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (coupon_product_id),
  INDEX idx_method_type (method_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='限购规则表';

-- 5. 优惠券销售记录表
CREATE TABLE IF NOT EXISTS coupon_sales_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_product_id BIGINT NOT NULL COMMENT '优惠券产品ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  method_type VARCHAR(20) NOT NULL COMMENT '获取方式',
  points_spent INT DEFAULT 0 COMMENT '消耗积分',
  cash_spent DECIMAL(10,2) DEFAULT 0 COMMENT '消耗现金',
  coupon_id BIGINT NOT NULL COMMENT '获得的优惠券ID',
  source VARCHAR(50) COMMENT '来源：direct-直接购买, share-分享, invite-邀请',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_id (coupon_product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_method_type (method_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券销售记录表';
