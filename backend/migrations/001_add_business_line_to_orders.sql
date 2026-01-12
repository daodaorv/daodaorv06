-- =====================================================
-- 迁移脚本:订单管理业务线字段添加
-- 版本:v1.0
-- 创建时间:2026-01-06
-- 描述:为订单表和分润表添加业务线字段,支持按业务线分离管理
-- =====================================================

-- 1. 为订单表添加业务线字段（如果不存在）
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS business_line VARCHAR(50) NOT NULL DEFAULT 'vehicle_rental'
COMMENT '业务线:vehicle_rental-房车租赁, campsite-营地预订, special_offer-特惠租车, rv_tour-房车旅游';

-- 2. 创建业务线相关索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_business_line ON orders(business_line);
CREATE INDEX IF NOT EXISTS idx_business_line_status ON orders(business_line, status);
CREATE INDEX IF NOT EXISTS idx_business_line_date ON orders(business_line, created_at);

-- 3. 为分润表添加业务线字段(如果表存在)
-- ALTER TABLE profit_distributions
-- ADD COLUMN business_line VARCHAR(50) NOT NULL DEFAULT 'vehicle_rental'
-- COMMENT '业务线:vehicle_rental-房车租赁, campsite-营地预订, special_offer-特惠租车, rv_tour-房车旅游';

