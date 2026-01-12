-- 创建车辆收藏表
CREATE TABLE IF NOT EXISTS vehicle_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    UNIQUE KEY uk_user_vehicle (user_id, vehicle_id) COMMENT '用户-车辆唯一索引',
    KEY idx_user_id (user_id) COMMENT '用户ID索引',
    KEY idx_vehicle_id (vehicle_id) COMMENT '车辆ID索引',
    KEY idx_created_at (created_at) COMMENT '创建时间索引',

    -- 外键约束
    CONSTRAINT fk_vehicle_favorites_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicle_favorites_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆收藏表';
