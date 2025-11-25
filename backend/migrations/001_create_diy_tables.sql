-- DIY页面配置表
CREATE TABLE diy_pages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '页面名称',
  description TEXT COMMENT '页面描述',
  page_type ENUM('home', 'community', 'crowdfunding', 'profile') NOT NULL COMMENT '页面类型',
  config JSON NOT NULL COMMENT '页面配置数据',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '页面状态',
  version INT DEFAULT 1 COMMENT '当前版本号',
  created_by VARCHAR(36) NOT NULL COMMENT '创建者ID',
  updated_by VARCHAR(36) COMMENT '最后更新者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  published_at TIMESTAMP NULL COMMENT '发布时间',
  INDEX idx_page_type_status (page_type, status),
  INDEX idx_created_by (created_by),
  INDEX idx_status (status)
) COMMENT='DIY页面配置表';

-- 组件库表
CREATE TABLE diy_components (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '组件名称',
  type VARCHAR(100) NOT NULL COMMENT '组件类型标识',
  category ENUM('basic', 'layout', 'business', 'navigation', 'media', 'form') NOT NULL COMMENT '组件分类',
  icon VARCHAR(255) COMMENT '组件图标',
  config_schema JSON COMMENT '组件配置模式',
  default_props JSON COMMENT '组件默认属性',
  preview_image VARCHAR(500) COMMENT '组件预览图',
  is_system BOOLEAN DEFAULT TRUE COMMENT '是否系统组件',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_by VARCHAR(36) NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创���时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_type (type),
  INDEX idx_category_active (category, is_active),
  INDEX idx_is_system (is_system)
) COMMENT='DIY组件库表';

-- 页面模板表
CREATE TABLE diy_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '模板名称',
  description TEXT COMMENT '模板描述',
  category VARCHAR(100) NOT NULL COMMENT '模板分类',
  thumbnail VARCHAR(500) COMMENT '模板缩略图',
  preview_data JSON NOT NULL COMMENT '模板预览数据',
  config JSON NOT NULL COMMENT '模板配置数据',
  tags JSON COMMENT '模板标签',
  is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  rating DECIMAL(3,2) DEFAULT 0 COMMENT '评分',
  created_by VARCHAR(36) NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_public (category, is_public),
  INDEX idx_rating (rating DESC),
  INDEX idx_usage_count (usage_count DESC)
) COMMENT='DIY页面模板表';

-- 页面发布历史表
CREATE TABLE diy_page_publications (
  id VARCHAR(36) PRIMARY KEY,
  page_id VARCHAR(36) NOT NULL COMMENT '页面ID',
  version INT NOT NULL COMMENT '版本号',
  config JSON NOT NULL COMMENT '版本配置数据',
  status ENUM('active', 'inactive', 'replaced') DEFAULT 'active' COMMENT '版本状态',
  published_by VARCHAR(36) NOT NULL COMMENT '发布者ID',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  replaced_at TIMESTAMP NULL COMMENT '替换时间',
  INDEX idx_page_id_status (page_id, status),
  INDEX idx_published_at (published_at DESC),
  FOREIGN KEY (page_id) REFERENCES diy_pages(id) ON DELETE CASCADE
) COMMENT='DIY页面发布历史表';

-- 用户操作日志表
CREATE TABLE diy_operation_logs (
  id VARCHAR(36) PRIMARY KEY,
  page_id VARCHAR(36) COMMENT '页面ID',
  action_type ENUM('create', 'update', 'delete', 'publish', 'restore', 'copy') NOT NULL COMMENT '操作类型',
  details JSON COMMENT '操作详情',
  before_config JSON COMMENT '操作前配置',
  after_config JSON COMMENT '操作后配置',
  user_id VARCHAR(36) NOT NULL COMMENT '操作者ID',
  ip_address VARCHAR(45) COMMENT '操作IP地址',
  user_agent TEXT COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_page_id_action (page_id, action_type),
  INDEX idx_user_id_action (user_id, action_type),
  INDEX idx_created_at (created_at DESC)
) COMMENT='DIY用户操作日志表';

-- 媒体资源表
CREATE TABLE diy_media_resources (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '资源名称',
  type ENUM('image', 'video', 'icon', 'audio', 'document') NOT NULL COMMENT '资源类型',
  file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
  file_url VARCHAR(500) NOT NULL COMMENT '访问URL',
  file_size INT COMMENT '文件大小(字节)',
  mime_type VARCHAR(100) COMMENT 'MIME类型',
  dimensions JSON COMMENT '尺寸信息(宽高)',
  metadata JSON COMMENT '其他元数据',
  uploaded_by VARCHAR(36) NOT NULL COMMENT '上传者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_type (type),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at DESC)
) COMMENT='DIY媒体资源表';

-- 插入初始组件数据
INSERT INTO diy_components (id, name, type, category, icon, config_schema, default_props, preview_image, is_system, sort_order, created_by) VALUES
('text-basic', '基础文本', 'text', 'basic', 'document-text',
 '{"props": [{"key": "content", "type": "text", "label": "文本内容", "required": true}, {"key": "fontSize", "type": "number", "label": "字体大小", "min": 12, "max": 72, "default": 14}, {"key": "color", "type": "color", "label": "文字颜色", "default": "#333333"}, {"key": "fontWeight", "type": "select", "label": "字体粗细", "options": ["normal", "bold", "500"], "default": "normal"}, {"key": "textAlign", "type": "select", "label": "对齐方式", "options": ["left", "center", "right"], "default": "left"}]}',
 '{"content": "请输入文本内容", "fontSize": 14, "color": "#333333", "fontWeight": "normal", "textAlign": "left"}',
'/static/components/text-preview.png', true, 1, 'system'),

('image-basic', '基础图片', 'image', 'basic', 'image',
'{"props": [{"key": "src", "type": "image", "label": "图片地址", "required": true}, {"key": "mode", "type": "select", "label": "显示模式", "options": ["scaleToFill", "aspectFit", "aspectFill", "widthFix", "heightFix"], "default": "aspectFit"}, {"key": "width", "type": "number", "label": "宽度"}, {"key": "height", "type": "number", "label": "高度"}, {"key": "borderRadius", "type": "number", "label": "圆角", "min": 0, "max": 50, "default": 0}]}',
'{"src": "/static/placeholder-image.png", "mode": "aspectFit", "borderRadius": 0}',
'/static/components/image-preview.png', true, 2, 'system'),

('button-basic', '基础按钮', 'button', 'basic', 'navigation',
'{"props": [{"key": "text", "type": "text", "label": "按钮文字", "required": true}, {"key": "type", "type": "select", "label": "按钮类型", "options": ["primary", "default", "success", "warning", "error"], "default": "default"}, {"key": "size", "type": "select", "label": "按钮大小", "options": ["mini", "small", "medium", "large"], "default": "medium"}, {"key": "round", "type": "boolean", "label": "圆角按钮", "default": false}, {"key": "action", "type": "action", "label": "点击动作"}]}',
'{"text": "点击按钮", "type": "default", "size": "medium", "round": false}',
'/static/components/button-preview.png', true, 3, 'system'),

('kingkong-nav', '金刚区导航', 'kingkong', 'navigation', 'grid',
'{"props": [{"key": "title", "type": "text", "label": "标题"}, {"key": "columns", "type": "select", "label": "列数", "options": [2, 3, 4, 5], "default": 4}, {"key": "iconSize", "type": "number", "label": "图标大小", "min": 16, "max": 48, "default": 24}, {"key": "items", "type": "array", "label": "导航项目", "required": true, "itemSchema": {"title": {"type": "text", "label": "标题"}, "iconType": {"type": "icon", "label": "图标"}, "iconColor": {"type": "color", "label": "图标颜色", "default": "#FF9F29"}, "action": {"type": "action", "label": "跳转动作"}}}]}',
'{"title": "快捷服务", "columns": 4, "iconSize": 24, "items": [{"title": "特惠租车", "iconType": "ticket", "iconColor": "#FF9F29", "action": {"type": "page", "target": "/pages/vehicles/index"}}, {"title": "营地预定", "iconType": "home-filled", "iconColor": "#48BB78", "action": {"type": "page", "target": "/pages/camping/index"}}, {"title": "房车旅游", "iconType": "location-filled", "iconColor": "#4299E1", "action": {"type": "page", "target": "/pages/travel/index"}}, {"title": "房车众筹", "iconType": "wallet", "iconColor": "#8860D0", "action": {"type": "page", "target": "/pages/crowdfunding/index"}}]}',
'/static/components/kingkong-preview.png', true, 10, 'system'),

('banner-carousel', '轮播横幅', 'banner', 'media', 'image',
'{"props": [{"key": "images", "type": "array", "label": "轮播图片", "required": true, "itemSchema": {"url": {"type": "image", "label": "图片地址"}, "link": {"type": "action", "label": "跳转链接"}, "title": {"type": "text", "label": "图片标题"}}}, {"key": "autoplay", "type": "boolean", "label": "自动播放", "default": true}, {"key": "interval", "type": "number", "label": "播放间隔(秒)", "min": 1, "max": 10, "default": 3}, {"key": "indicatorDots", "type": "boolean", "label": "显示指示器", "default": true}, {"key": "height", "type": "number", "label": "高度", "min": 100, "max": 500, "default": 200}]}',
'{"images": [{"url": "/static/banner-1.jpg", "title": "金秋出游季", "link": {"type": "page", "target": "/pages/vehicles/index"}}], "autoplay": true, "interval": 3, "indicatorDots": true, "height": 200}',
'/static/components/banner-preview.png', true, 11, 'system'),

('product-card', '商品卡片', 'productCard', 'business', 'shopping-cart-2',
'{"props": [{"key": "image", "type": "image", "label": "商品图片", "required": true}, {"key": "name", "type": "text", "label": "商品名称", "required": true}, {"key": "price", "type": "number", "label": "商品价格"}, {"key": "unit", "type": "text", "label": "价格单位", "default": "/天"}, {"key": "rating", "type": "number", "label": "评分", "min": 0, "max": 5, "default": 5}, {"key": "showPrice", "type": "boolean", "label": "显示价格", "default": true}, {"key": "action", "type": "action", "label": "点击动作"}]}',
'{"image": "/static/product-default.png", "name": "奔驰Sprinter豪华房车", "price": 580, "unit": "/天", "rating": 4.8, "showPrice": true}',
'/static/components/product-card-preview.png', true, 20, 'system');

-- 插入基础页面模板数据
INSERT INTO diy_templates (id, name, description, category, thumbnail, preview_data, config, tags, is_public, usage_count, rating, created_by) VALUES
('home-template-1', '简约商务首页模板', '适合商务风格的房车租赁平台首页，包含轮播图、金���区导航、产品推荐等模块', 'business',
'/static/templates/home-business-thumb.jpg',
'{"title": "商务风格首页", "description": "专业房车租赁服务", "components": [{"type": "banner", "config": {"images": [{"url": "/templates/business-banner.jpg", "title": "专业房车租赁服务"}]}}, {"type": "kingkong", "config": {"title": "专业服务", "columns": 4, "items": [{"title": "商务租车", "iconType": "business"}, {"title": "企业服务", "iconType": "corporate"}, {"title": "长租优惠", "iconType": "discount"}, {"title": "定制服务", "iconType": "custom"}]}}]}',
'{"pageType": "home", "layout": {"type": "fixed"}, "components": [{"id": "banner-1", "type": "banner", "props": {"images": [{"url": "/templates/business-banner.jpg", "title": "专业房车租赁服务", "link": {"type": "page", "target": "/pages/vehicles/index"}}], "height": 200}, "styles": {"margin": "0 0 16px 0"}}, {"id": "kingkong-1", "type": "kingkong", "props": {"title": "专业服务", "columns": 4, "items": [{"title": "商务租车", "iconType": "business", "iconColor": "#1890ff", "action": {"type": "page", "target": "/pages/vehicles/index"}}, {"title": "企业服务", "iconType": "corporate", "iconColor": "#52c41a", "action": {"type": "page", "target": "/pages/business"}}], "styles": {"backgroundColor": "#ffffff", "padding": "16px", "borderRadius": "8px"}}}',
'["商务", "企业", "专业"], true, 0, 0, 'system'),

('home-template-2', '活力青春首页模板', '适合年轻用户群体的活泼风格首页，强调趣味性和互动性', 'youth',
'/static/templates/home-youth-thumb.jpg',
'{"title": "活力青春", "description": "年轻人的房车旅行首选平台", "components": [{"type": "banner", "config": {"images": [{"url": "/templates/youth-banner.jpg", "title": "青春不散场，房车去远方"}]}}, {"type": "kingkong", "config": {"title": "精彩活动", "columns": 4, "items": [{"title": "青年优惠", "iconType": "gift"}, {"title": "社交活动", "iconType": "group"}, {"title": "毕业旅行", "iconType": "graduation"}, {"title": "音乐节", "iconType": "music"}]}}]}',
'{"pageType": "home", "layout": {"type": "responsive"}, "components": [{"id": "banner-2", "type": "banner", "props": {"images": [{"url": "/templates/youth-banner.jpg", "title": "青春不散场，房车去远方", "link": {"type": "page", "target": "/pages/youth"}}], "height": 220}, "styles": {"margin": "0 0 20px 0", "borderRadius": "12px"}}, {"id": "kingkong-2", "type": "kingkong", "props": {"title": "精彩活动", "columns": 4, "items": [{"title": "青年优惠", "iconType": "gift", "iconColor": "#ff4d4f", "action": {"type": "page", "target": "/pages/youth-discount"}}, {"title": "社交活动", "iconType": "group", "iconColor": "#52c41a", "action": {"type": "page", "target": "/pages/social"}}], "styles": {"backgroundColor": "#f8f9fa", "padding": "20px", "borderRadius": "16px"}}}',
'["青春", "社交", "优惠"], true, 0, 0, 'system');