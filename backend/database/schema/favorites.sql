-- 收藏功能相关数据表

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  target_type ENUM('vehicle', 'article', 'store') NOT NULL COMMENT '收藏目标类型',
  target_id BIGINT NOT NULL COMMENT '收藏目标ID',
  target_title VARCHAR(200) NOT NULL COMMENT '收藏目标标题',
  target_image VARCHAR(500) COMMENT '收藏目标图片',
  target_price DECIMAL(10,2) COMMENT '收藏目标价格（车辆时）',
  target_data JSON COMMENT '收藏目标其他数据（JSON格式）',

  -- 分组和标签
  folder_name VARCHAR(50) DEFAULT '默认收藏夹' COMMENT '收藏夹名称',
  tags JSON COMMENT '收藏标签列表',
  note TEXT COMMENT '收藏备注',

  -- 状态
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否有效（0=已取消收藏）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_target_title (target_title),
  INDEX idx_folder_name (folder_name),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  UNIQUE KEY uk_user_target_favorite (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 收藏夹表
CREATE TABLE IF NOT EXISTS favorite_folders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏夹ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  name VARCHAR(50) NOT NULL COMMENT '收藏夹名称',
  description TEXT COMMENT '收藏夹描述',
  icon VARCHAR(50) DEFAULT 'star' COMMENT '图标',
  color VARCHAR(7) DEFAULT '#FF9F29' COMMENT '颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认收藏夹',
  is_private TINYINT(1) DEFAULT 1 COMMENT '是否私有',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_sort_order (sort_order),
  UNIQUE KEY uk_user_folder_name (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏夹表';

-- 收藏操作日志表
CREATE TABLE IF NOT EXISTS favorite_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  favorite_id BIGINT COMMENT '收藏ID',
  target_type ENUM('vehicle', 'article', 'store') NOT NULL COMMENT '操作目标类型',
  target_id BIGINT NOT NULL COMMENT '操作目标ID',
  action ENUM('add', 'remove', 'move', 'update') NOT NULL COMMENT '操作类型',
  old_folder VARCHAR(50) COMMENT '原收藏夹（移动时）',
  new_folder VARCHAR(50) COMMENT '新收藏夹（移动时）',
  reason VARCHAR(200) COMMENT '操作原因',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_favorite_id (favorite_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏操作日志表';

-- 收藏统计表
CREATE TABLE IF NOT EXISTS favorite_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  target_type ENUM('vehicle', 'article', 'store') NOT NULL COMMENT '统计目标类型',
  target_id BIGINT NOT NULL COMMENT '统计目标ID',
  favorite_count INT DEFAULT 0 COMMENT '收藏总数',
  daily_count INT DEFAULT 0 COMMENT '今日新增收藏',
  weekly_count INT DEFAULT 0 COMMENT '本周新增收藏',
  monthly_count INT DEFAULT 0 COMMENT '本月新增收藏',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_target (target_type, target_id),
  INDEX idx_favorite_count (favorite_count),
  INDEX idx_updated_at (updated_at),
  UNIQUE KEY uk_target_type_id (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏统计表';

-- 插入默认收藏夹（用户注册时创建）
-- 这个触发器会在用户注册后自动创建默认收藏夹
DELIMITER //
CREATE TRIGGER after_user_insert_create_default_folder
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  -- 为新用户创建默认收藏夹
  INSERT INTO favorite_folders (
    user_id, name, description, is_default, sort_order
  ) VALUES (
    NEW.id, '默认收藏夹', '系统默认收藏夹', 1, 0
  );
END//
DELIMITER ;

-- 创建触发器：收藏后自动更新统计
DELIMITER //
CREATE TRIGGER after_favorite_insert_update_stats
AFTER INSERT ON user_favorites
FOR EACH ROW
BEGIN
  INSERT INTO favorite_stats (
    target_type, target_id, favorite_count, daily_count, weekly_count, monthly_count
  ) VALUES (
    NEW.target_type, NEW.target_id, 1, 1, 1, 1
  )
  ON DUPLICATE KEY UPDATE
    favorite_count = favorite_count + 1,
    daily_count = daily_count + 1,
    weekly_count = weekly_count + 1,
    monthly_count = monthly_count + 1;
END//
DELIMITER ;

-- 创建触发器：取消收藏后自动更新统计
DELIMITER //
CREATE TRIGGER after_favorite_delete_update_stats
AFTER UPDATE ON user_favorites
FOR EACH ROW
BEGIN
  -- 如果收藏被取消（is_active从1变为0）
  IF OLD.is_active = 1 AND NEW.is_active = 0 THEN
    UPDATE favorite_stats SET
      favorite_count = favorite_count - 1,
      daily_count = GREATEST(daily_count - 1, 0),
      weekly_count = GREATEST(weekly_count - 1, 0),
      monthly_count = GREATEST(monthly_count - 1, 0)
    WHERE target_type = NEW.target_type AND target_id = NEW.target_id;
  END IF;
END//
DELIMITER ;

-- 创建存储过程：重置日/周/月统计
DELIMITER //
CREATE PROCEDURE ResetFavoriteStats()
BEGIN
  UPDATE favorite_stats SET
    daily_count = 0,
    weekly_count = 0,
    monthly_count = 0
  WHERE 1=1;
END//
DELIMITER ;