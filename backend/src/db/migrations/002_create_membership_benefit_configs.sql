-- 创建会员权益配置表
-- 用于灵活配置不同会员等级的权益（优惠券、折扣、推广比例等）

CREATE TABLE IF NOT EXISTS membership_benefit_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    membership_level ENUM('silver', 'gold', 'platinum') NOT NULL COMMENT '会员等级',
    benefit_type ENUM('coupon', 'discount', 'promotion_rate', 'hosting_welcome') NOT NULL COMMENT '权益类型',
    benefit_value JSON NOT NULL COMMENT '权益值（优惠券ID列表、折扣比例等）',
    description VARCHAR(500) COMMENT '权益描述',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_membership_level (membership_level),
    INDEX idx_benefit_type (benefit_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员权益配置表';
