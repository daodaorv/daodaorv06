-- 初始化数据脚本
-- 用于插入托管车主角色和初始权益配置

-- 1. 插入托管车主角色（如果不存在）
INSERT INTO roles (name, code, type, data_scope, description, status)
SELECT '托管车主', 'hosting_owner', 'customer', 'self', '托管车辆的车主角色，可以查看收益、提现等', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'hosting_owner'
);

-- 2. 插入托管欢迎权益配置示例
-- 注意：需要根据实际的优惠券ID进行调整
INSERT INTO membership_benefit_configs
(membership_level, benefit_type, benefit_value, description, status)
VALUES
-- 托管欢迎优惠券（示例，需要替换实际的优惠券ID）
('silver', 'hosting_welcome', '{"coupon_ids": []}', '托管欢迎优惠券（请在后台配置实际优惠券ID）', 'active'),
-- 初始推广比例
('silver', 'hosting_welcome', '{"rate": 0.05}', '托管车主初始推广比例5%', 'active')
ON DUPLICATE KEY UPDATE
benefit_value = VALUES(benefit_value),
description = VALUES(description);

-- 3. 查询验证
SELECT * FROM roles WHERE code = 'hosting_owner';
SELECT * FROM membership_benefit_configs WHERE benefit_type = 'hosting_welcome';
