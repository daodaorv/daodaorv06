-- 帮助中心相关数据表

-- 帮助分类表
CREATE TABLE IF NOT EXISTS help_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  description TEXT COMMENT '分类描述',
  icon VARCHAR(50) COMMENT '分类图标',
  color VARCHAR(7) DEFAULT '#FF9F29' COMMENT '分类颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  parent_id BIGINT DEFAULT NULL COMMENT '父分类ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_parent_id (parent_id),
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助分类表';

-- 帮助文章表
CREATE TABLE IF NOT EXISTS help_articles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  category_id BIGINT NOT NULL COMMENT '分类ID',
  title VARCHAR(200) NOT NULL COMMENT '文章标题',
  summary TEXT COMMENT '文章摘要',
  content LONGTEXT NOT NULL COMMENT '文章内容',
  cover_image VARCHAR(500) COMMENT '封面图片',
  author_id BIGINT COMMENT '作者ID',

  -- 阅读相关
  view_count INT DEFAULT 0 COMMENT '阅读次数',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  helpful_count INT DEFAULT 0 COMMENT '有用数',

  -- 排序和状态
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_top TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',

  -- SEO优化
  keywords VARCHAR(500) COMMENT '关键词',
  description VARCHAR(500) COMMENT '描述',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_top (is_top),
  INDEX idx_is_active (is_active),
  INDEX idx_view_count (view_count),
  INDEX idx_created_at (created_at),
  FULLTEXT idx_search (title, content, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助文章表';

-- 帮助文章标签关联表
CREATE TABLE IF NOT EXISTS help_article_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  article_id BIGINT NOT NULL COMMENT '文章ID',
  tag_id BIGINT NOT NULL COMMENT '标签ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_article_id (article_id),
  INDEX idx_tag_id (tag_id),
  UNIQUE KEY uk_article_tag (article_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助文章标签关联表';

-- 帮助标签表
CREATE TABLE IF NOT EXISTS help_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  color VARCHAR(7) DEFAULT '#FF9F29' COMMENT '标签颜色',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助标签表';

-- 用户反馈表
CREATE TABLE IF NOT EXISTS help_feedback (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '反馈ID',
  user_id BIGINT COMMENT '用户ID',
  article_id BIGINT COMMENT '相关文章ID',
  type ENUM('helpful', 'not_helpful', 'suggestion', 'complaint') NOT NULL COMMENT '反馈类型',
  content TEXT NOT NULL COMMENT '反馈内容',
  contact_info VARCHAR(200) COMMENT '联系方式',

  -- 处理状态
  status ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending' COMMENT '处理状态',
  admin_reply TEXT COMMENT '管理员回复',
  processed_by BIGINT COMMENT '处理人ID',
  processed_at TIMESTAMP NULL COMMENT '处理时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_article_id (article_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户反馈表';

-- 搜索记录表
CREATE TABLE IF NOT EXISTS help_search_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '搜索ID',
  user_id BIGINT COMMENT '用户ID',
  keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
  result_count INT DEFAULT 0 COMMENT '搜索结果数',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_keyword (keyword),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索记录表';

-- 帮助中心统计表
CREATE TABLE IF NOT EXISTS help_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  date DATE NOT NULL UNIQUE COMMENT '统计日期',
  total_views INT DEFAULT 0 COMMENT '总浏览量',
  unique_visitors INT DEFAULT 0 COMMENT '独立访客数',
  article_views INT DEFAULT 0 COMMENT '文章浏览量',
  searches INT DEFAULT 0 COMMENT '搜索次数',
  feedback_count INT DEFAULT 0 COMMENT '反馈数量',
  helpful_count INT DEFAULT 0 COMMENT '有用反馈数',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助中心统计表';

-- 插入默认帮助分类和文章数据
INSERT INTO help_categories (name, description, icon, sort_order, parent_id) VALUES
('常见问题', '用户使用过程中遇到的高频问题', 'question', 1, NULL),
('租赁指南', '房车租赁流程和注意事项', 'book', 2, NULL),
('支付说明', '支付方式和费用说明', 'wallet', 3, NULL),
('账户管理', '账户相关操作和管理', 'user', 4, NULL),
('安全须知', '用车安全和保险说明', 'shield', 5, NULL),
('售后服务', '客服联系方式和售后政策', 'service', 6, NULL);

-- 插入二级分类
INSERT INTO help_categories (name, description, icon, sort_order, parent_id) VALUES
('注册登录', '用户注册和登录相关问题', 'user', 1, 4),
('实名认证', '身份认证和资质审核', 'id-card', 2, 4),
('押金说明', '押金支付和退还流程', 'money', 1, 3);

-- 插入默认标签
INSERT INTO help_tags (name, color, sort_order) VALUES
('新手必读', '#FF4D4F', 1),
('热门问题', '#FFB800', 2),
('重要', '#52C41A', 3),
('流程说明', '#1890FF', 4),
('常见问题', '#722ED1', 5);

-- 插入示例帮助文章
INSERT INTO help_articles (category_id, title, summary, content, view_count, sort_order, is_top) VALUES
-- 常见问题
(1, '如何注册成为叨叨房车用户？', '详细介绍用户注册流程和所需资料',
'## 注册流程\n\n1. 下载叨叨房车APP或打开小程序\n2. 点击"注册"按钮\n3. 输入手机号码获取验证码\n4. 设置登录密码\n5. 完成实名认证\n6. 开始使用\n\n## 所需资料\n\n- 手机号码\n- 身份证号码\n- 驾驶证照片', 120, 1, 1),

(1, '房车租赁需要什么证件？', '说明租赁房车所需的必备证件和材料',
'## 必备证件\n\n### 个人证件\n- 身份证原件\n- 驾驶证原件（C1或C2驾照）\n- 驾龄要求：1年以上\n\n### 证件要求\n- 身份证在有效期内\n- 驾驶证在有效期内\n- 驾驶证准驾车型包含小型汽车\n\n## 注意事项\n\n- 证件信息必须真实有效\n- 取车时需要出示原件\n- 部分高端车型可能需要更高驾龄要求', 200, 2, 0),

-- 租赁指南
(2, '房车租赁完整流程', '从预订到还车的详细流程说明',
'## 租赁流程\n\n### 1. 车辆选择\n- 浏览车辆列表\n- 查看车辆详情和评价\n- 选择合适的车辆\n\n### 2. 预订下单\n- 选择取还车时间和地点\n- 填写联系信息\n- 支付订单费用\n\n### 3. 取车验车\n- 携带证件到指定地点\n- 工作人员介绍车辆使用\n- 检查车况和设备\n- 签署租赁合同\n\n### 4. 用车过程\n- 安全驾驶\n- 保持车辆清洁\n- 遇到问题及时联系客服\n\n### 5. 还车结算\n- 按时归还车辆\n- 工作人员检查车况\n- 结算费用\n- 完成押金退还', 350, 1, 1);

-- 更新文章浏览量的存储过程
DELIMITER //
CREATE PROCEDURE IncrementArticleViewCount(IN articleId BIGINT)
BEGIN
  UPDATE help_articles
  SET view_count = view_count + 1
  WHERE id = articleId AND is_active = 1;
END//
DELIMITER ;