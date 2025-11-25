-- 评价系统相关数据表

-- 评价表
CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
  order_id BIGINT NOT NULL COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '评价用户ID',
  vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
  owner_id BIGINT NOT NULL COMMENT '车主ID',

  -- 评分
  overall_rating DECIMAL(2,1) NOT NULL COMMENT '总体评分 (1.0-5.0)',
  vehicle_rating DECIMAL(2,1) NOT NULL COMMENT '车辆评分 (1.0-5.0)',
  service_rating DECIMAL(2,1) NOT NULL COMMENT '服务评分 (1.0-5.0)',
  cleanliness_rating DECIMAL(2,1) NOT NULL COMMENT '卫生评分 (1.0-5.0)',
  accuracy_rating DECIMAL(2,1) NOT NULL COMMENT '描述准确性评分 (1.0-5.0)',

  -- 评价内容
  content TEXT COMMENT '评价内容',
  images JSON COMMENT '评价图片列表',
  tags JSON COMMENT '评价标签列表（如：车辆状况好、服务周到等）',

  -- 审核状态
  status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'pending' COMMENT '审核状态',
  review_reason TEXT COMMENT '审核原因',
  reviewed_by BIGINT COMMENT '审核人ID',
  reviewed_at TIMESTAMP NULL COMMENT '审核时间',

  -- 互动数据
  like_count INT DEFAULT 0 COMMENT '点赞数',
  reply_count INT DEFAULT 0 COMMENT '回复数',
  is_hidden TINYINT(1) DEFAULT 0 COMMENT '是否隐藏（用户自己隐藏）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status),
  INDEX idx_overall_rating (overall_rating),
  INDEX idx_created_at (created_at),
  UNIQUE KEY uk_order_rating (order_id) -- 每个订单只能评价一次
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户评价表';

-- 评价回复表
CREATE TABLE IF NOT EXISTS rating_replies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '回复ID',
  rating_id BIGINT NOT NULL COMMENT '评价ID',
  user_id BIGINT NOT NULL COMMENT '回复用户ID',
  parent_id BIGINT DEFAULT NULL COMMENT '父回复ID（用于多级回复）',
  to_user_id BIGINT DEFAULT NULL COMMENT '回复目标用户ID',
  content TEXT NOT NULL COMMENT '回复内容',

  -- 审核状态
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT '审核状态',
  review_reason TEXT COMMENT '审核原因',

  -- 互动数据
  like_count INT DEFAULT 0 COMMENT '点赞数',
  is_deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_rating_id (rating_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价回复表';

-- 评价点赞记录表
CREATE TABLE IF NOT EXISTS rating_likes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  rating_id BIGINT NOT NULL COMMENT '评价ID',
  user_id BIGINT NOT NULL COMMENT '点赞用户ID',
  target_type ENUM('rating', 'reply') DEFAULT 'rating' COMMENT '点赞目标类型',
  target_id BIGINT NOT NULL COMMENT '目标ID（评价ID或回复ID）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rating_id (rating_id),
  INDEX idx_user_id (user_id),
  INDEX idx_target (target_type, target_id),
  UNIQUE KEY uk_user_target_like (user_id, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价点赞记录表';

-- 评价标签表
CREATE TABLE IF NOT EXISTS rating_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  category ENUM('vehicle', 'service', 'general') NOT NULL COMMENT '标签分类',
  color VARCHAR(7) DEFAULT '#FF9F29' COMMENT '标签颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_category (category),
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价标签表';

-- 车辆评分统计表
CREATE TABLE IF NOT EXISTS vehicle_rating_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  vehicle_id BIGINT NOT NULL UNIQUE COMMENT '车辆ID',
  owner_id BIGINT NOT NULL COMMENT '车主ID',

  -- 评分统计
  total_ratings INT DEFAULT 0 COMMENT '总评价数',
  overall_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '总体平均评分',
  vehicle_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '车辆平均评分',
  service_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '服务平均评分',
  cleanliness_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '卫生平均评分',
  accuracy_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '描述准确性平均评分',

  -- 评分分布（1-5星各有多少）
  rating_distribution JSON COMMENT '评分分布（{"5星": 10, "4星": 5, ...}）',

  -- 标签统计
  top_tags JSON COMMENT '热门标签（前10个）',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_overall_rating (overall_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆评分统计表';

-- 插入默认评价标签
INSERT INTO rating_tags (name, category, sort_order) VALUES
-- 车辆相关标签
('车况如新', 'vehicle', 1),
('空间宽敞', 'vehicle', 2),
('驾驶舒适', 'vehicle', 3),
('设备齐全', 'vehicle', 4),
('干净整洁', 'vehicle', 5),

-- 服务相关标签
('服务周到', 'service', 1),
('响应及时', 'service', 2),
('专业热情', 'service', 3),
('沟通顺畅', 'service', 4),
('取车便捷', 'service', 5),

-- 综合标签
('性价比高', 'general', 1),
('体验很好', 'general', 2),
('推荐朋友', 'general', 3),
('会再次选择', 'general', 4),
('超出预期', 'general', 5);

-- 创建触发器：评价创建后自动更新车辆评分统计
DELIMITER //
CREATE TRIGGER after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
  INSERT INTO vehicle_rating_stats (vehicle_id, owner_id, total_ratings, overall_rating)
  VALUES (NEW.vehicle_id, NEW.owner_id, 1, NEW.overall_rating)
  ON DUPLICATE KEY UPDATE
    total_ratings = total_ratings + 1,
    overall_rating = (
      (overall_rating * total_ratings + NEW.overall_rating) / (total_ratings + 1)
    ),
    vehicle_rating = (
      (vehicle_rating * (total_ratings - 1) + NEW.vehicle_rating) / total_ratings
    ),
    service_rating = (
      (service_rating * (total_ratings - 1) + NEW.service_rating) / total_ratings
    ),
    cleanliness_rating = (
      (cleanliness_rating * (total_ratings - 1) + NEW.cleanliness_rating) / total_ratings
    ),
    accuracy_rating = (
      (accuracy_rating * (total_ratings - 1) + NEW.accuracy_rating) / total_ratings
    );
END//
DELIMITER ;

-- 创建触发器：评价更新后重新计算统计
DELIMITER //
CREATE TRIGGER after_rating_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
  -- 如果评分发生变化，重新计算平均值
  IF NEW.overall_rating != OLD.overall_rating OR
     NEW.vehicle_rating != OLD.vehicle_rating OR
     NEW.service_rating != OLD.service_rating OR
     NEW.cleanliness_rating != OLD.cleanliness_rating OR
     NEW.accuracy_rating != OLD.accuracy_rating THEN

    -- 重新计算该车辆的所有评分统计
    UPDATE vehicle_rating_stats vrs SET
      vrs.overall_rating = (
        SELECT AVG(r.overall_rating) FROM ratings r
        WHERE r.vehicle_id = NEW.vehicle_id AND r.status = 'approved'
      ),
      vrs.vehicle_rating = (
        SELECT AVG(r.vehicle_rating) FROM ratings r
        WHERE r.vehicle_id = NEW.vehicle_id AND r.status = 'approved'
      ),
      vrs.service_rating = (
        SELECT AVG(r.service_rating) FROM ratings r
        WHERE r.vehicle_id = NEW.vehicle_id AND r.status = 'approved'
      ),
      vrs.cleanliness_rating = (
        SELECT AVG(r.cleanliness_rating) FROM ratings r
        WHERE r.vehicle_id = NEW.vehicle_id AND r.status = 'approved'
      ),
      vrs.accuracy_rating = (
        SELECT AVG(r.accuracy_rating) FROM ratings r
        WHERE r.vehicle_id = NEW.vehicle_id AND r.status = 'approved'
      )
    WHERE vrs.vehicle_id = NEW.vehicle_id;
  END IF;
END//
DELIMITER ;