-- 叨叨房车车辆相关数据表结构
-- 创建时间: 2025-11-19
-- 版本: v1.0

-- 1. 车辆品牌表
CREATE TABLE `vehicle_brands` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '品牌ID',
  `name` VARCHAR(100) NOT NULL COMMENT '品牌名称',
  `name_en` VARCHAR(100) COMMENT '品牌英文名称',
  `logo_url` VARCHAR(500) COMMENT '品牌logo图片URL',
  `description` TEXT COMMENT '品牌描述',
  `country` VARCHAR(50) COMMENT '品牌国家',
  `website` VARCHAR(200) COMMENT '品牌官网',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY `uk_vehicle_brands_name` (`name`),
  INDEX `idx_vehicle_brands_status` (`status`),
  INDEX `idx_vehicle_brands_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆品牌表';

-- 2. 车辆型号表
CREATE TABLE `vehicle_models` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '型号ID',
  `brand_id` BIGINT NOT NULL COMMENT '品牌ID',
  `name` VARCHAR(100) NOT NULL COMMENT '型号名称',
  `name_en` VARCHAR(100) COMMENT '型号英文名称',
  `series` VARCHAR(100) COMMENT '车系',
  `year` INT COMMENT '年份',
  `category` ENUM('A型', 'B型', 'C型', '拖挂A型', '拖挂B型', '拖挂C型', '房车巴士', '越野房车', '自行式A型', '自行式B型', '自行式C型') NOT NULL COMMENT '房车类型',
  `length` DECIMAL(6,2) COMMENT '车身长度(米)',
  `width` DECIMAL(5,2) COMMENT '车身宽度(米)',
  `height` DECIMAL(5,2) COMMENT '车身高度(米)',
  `wheelbase` DECIMAL(5,2) COMMENT '轴距(米)',
  `curb_weight` INT COMMENT '整备质量(kg)',
  `max_weight` INT COMMENT '最大总质量(kg)',
  `fuel_type` ENUM('汽油', '柴油', '新能源', '混动', '液化气', '天然气') NOT NULL COMMENT '燃料类型',
  `transmission` ENUM('手动', '自动', '手自一体', '无级变速', '双离合') NOT NULL COMMENT '变速箱类型',
  `displacement` DECIMAL(4,1) COMMENT '排量(L)',
  `seats` TINYINT DEFAULT 2 COMMENT '核定载客人数',
  `sleepers` TINYINT DEFAULT 2 COMMENT '睡眠人数',
  `toilet` ENUM('无', '便携式', '固定式') DEFAULT '无' COMMENT '卫生间类型',
  `kitchen` ENUM('无', '简易', '完整') DEFAULT '无' COMMENT '厨房类型',
  `shower` ENUM('无', '简易', '完整') DEFAULT '无' COMMENT '淋浴类型',
  `water_tank` INT COMMENT '水箱容量(L)',
  `description` TEXT COMMENT '型号描述',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY `uk_vehicle_models_brand_name` (`brand_id`, `name`),
  INDEX `idx_vehicle_models_brand_id` (`brand_id`),
  INDEX `idx_vehicle_models_category` (`category`),
  INDEX `idx_vehicle_models_seats` (`seats`),
  INDEX `idx_vehicle_models_fuel_type` (`fuel_type`),
  INDEX `idx_vehicle_models_status` (`status`),
  FOREIGN KEY (`brand_id`) REFERENCES `vehicle_brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆型号表';

-- 3. 车辆表
CREATE TABLE `vehicles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车辆ID',
  `vehicle_model_id` BIGINT NOT NULL COMMENT '车辆型号ID',
  `license_plate` VARCHAR(20) COMMENT '车牌号',
  `vin` VARCHAR(17) UNIQUE COMMENT '车架号(VIN)',
  `store_id` BIGINT NOT NULL COMMENT '所属门店ID',
  `nickname` VARCHAR(100) COMMENT '车辆昵称',
  `color` VARCHAR(50) COMMENT '车辆颜色',
  `interior_color` VARCHAR(50) COMMENT '内饰颜色',
  `production_date` DATE COMMENT '生产日期',
  `purchase_date` DATE COMMENT '购置日期',
  `initial_mileage` INT DEFAULT 0 COMMENT '初始里程(km)',
  `current_mileage` INT DEFAULT 0 COMMENT '当前里程(km)',
  `daily_rate` DECIMAL(10,2) NOT NULL COMMENT '日租金(元)',
  `weekly_rate` DECIMAL(10,2) COMMENT '周租金(元)',
  `monthly_rate` DECIMAL(10,2) COMMENT '月租金(元)',
  `deposit` DECIMAL(10,2) NOT NULL COMMENT '押金(元)',
  `service_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '服务费(元)',
  `insurance_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '保险费(元)',
  `kilometer_limit` INT DEFAULT 300 COMMENT '每日里程限制(km)',
  `excess_km_fee` DECIMAL(5,2) DEFAULT 2.00 COMMENT '超里程费用(元/km)',
  `minimum_rental_days` TINYINT DEFAULT 1 COMMENT '最少租赁天数',
  `maximum_rental_days` TINYINT DEFAULT 30 COMMENT '最多租赁天数',
  `features` JSON COMMENT '车辆特性(免费WiFi,冰箱,空调等)',
  `accessories` JSON COMMENT '配件清单(厨具,床上用品等)',
  `images` JSON COMMENT '车辆图片URLs',
  `description` TEXT COMMENT '车辆描述',
  `rental_rules` TEXT COMMENT '租赁规则说明',
  `maintenance_status` ENUM('正常', '保养中', '维修中', '待报废') DEFAULT '正常' COMMENT '维护状态',
  `availability_status` ENUM('可用', '已预定', '使用中', '维护中', '不可用') DEFAULT '可用' COMMENT '可用状态',
  `last_maintenance_date` DATE COMMENT '最后保养日期',
  `next_maintenance_date` DATE COMMENT '下次保养日期',
  `rating_avg` DECIMAL(2,1) DEFAULT 0.0 COMMENT '平均评分(1-5分)',
  `rating_count` INT DEFAULT 0 COMMENT '评价数量',
  `rental_count` INT DEFAULT 0 COMMENT '租赁次数',
  `total_rental_days` INT DEFAULT 0 COMMENT '累计租赁天数',
  `total_revenue` DECIMAL(12,2) DEFAULT 0.00 COMMENT '累计收入(元)',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY `uk_vehicles_vin` (`vin`),
  UNIQUE KEY `uk_vehicles_license_plate` (`license_plate`),
  INDEX `idx_vehicles_vehicle_model_id` (`vehicle_model_id`),
  INDEX `idx_vehicles_store_id` (`store_id`),
  INDEX `idx_vehicles_daily_rate` (`daily_rate`),
  INDEX `idx_vehicles_seats` (`seats`),
  INDEX `idx_vehicles_category` (`category`),
  INDEX `idx_vehicles_availability_status` (`availability_status`),
  INDEX `idx_vehicles_maintenance_status` (`maintenance_status`),
  INDEX `idx_vehicles_rating_avg` (`rating_avg`),
  INDEX `idx_vehicles_sort_order` (`sort_order`),
  INDEX `idx_vehicles_status` (`status`),
  FOREIGN KEY (`vehicle_model_id`) REFERENCES `vehicle_models` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆表';

-- 4. 车辆图片表
CREATE TABLE `vehicle_images` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图片ID',
  `vehicle_id` BIGINT NOT NULL COMMENT '车辆ID',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `image_type` ENUM('外观', '内饰', '仪表盘', '床位', '厨房', '卫生间', '驾驶室', '其他') NOT NULL DEFAULT '外观' COMMENT '图片类型',
  `image_title` VARCHAR(200) COMMENT '图片标题',
  `image_description` TEXT COMMENT '图片描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `is_main` BOOLEAN DEFAULT FALSE COMMENT '是否主图',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_vehicle_images_vehicle_id` (`vehicle_id`),
  INDEX `idx_vehicle_images_image_type` (`image_type`),
  INDEX `idx_vehicle_images_is_main` (`is_main`),
  INDEX `idx_vehicle_images_sort_order` (`sort_order`),
  INDEX `idx_vehicle_images_status` (`status`),
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆图片表';

-- 5. 车辆特性表
CREATE TABLE `vehicle_features` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '特性ID',
  `name` VARCHAR(100) NOT NULL COMMENT '特性名称',
  `icon` VARCHAR(100) COMMENT '特性图标',
  `description` TEXT COMMENT '特性描述',
  `feature_type` ENUM('基础配置', '娱乐设施', '生活设施', '安全配置', '外部配置', '其他') NOT NULL DEFAULT '基础配置' COMMENT '特性类型',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY `uk_vehicle_features_name` (`name`),
  INDEX `idx_vehicle_features_feature_type` (`feature_type`),
  INDEX `idx_vehicle_features_sort_order` (`sort_order`),
  INDEX `idx_vehicle_features_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆特性表';

-- 6. 车辆特性关联表
CREATE TABLE `vehicle_feature_relations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
  `vehicle_id` BIGINT NOT NULL COMMENT '车辆ID',
  `feature_id` BIGINT NOT NULL COMMENT '特性ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY `uk_vehicle_feature_relations_vehicle_feature` (`vehicle_id`, `feature_id`),
  INDEX `idx_vehicle_feature_relations_vehicle_id` (`vehicle_id`),
  INDEX `idx_vehicle_feature_relations_feature_id` (`feature_id`),
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`feature_id`) REFERENCES `vehicle_features` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆特性关联表';