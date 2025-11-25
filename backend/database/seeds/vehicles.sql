-- 车辆相关Mock数据插入脚本
-- 创建时间: 2025-11-19
-- 版本: v1.0

-- 1. 插入车辆品牌数据
INSERT INTO `vehicle_brands` (`name`, `name_en`, `logo_url`, `description`, `country`, `sort_order`, `status`) VALUES
('奔驰', 'Mercedes-Benz', '/static/logos/mercedes.png', '德国豪华汽车品牌，以高品质和可靠性著称', '德国', 100, 'active'),
('福特', 'Ford', '/static/logos/ford.png', '美国汽车制造商，全顺系列在商用车领域表现卓越', '美国', 90, 'active'),
('依维柯', 'Iveco', '/static/logos/iveco.png', '意大利商用车制造商，房车专用底盘技术领先', '意大利', 80, 'active'),
('斯堪尼亚', 'Scania', '/static/logos/scania.png', '瑞典重型汽车制造商，以耐用性和可靠性闻名', '瑞典', 70, 'active'),
('大众', 'Volkswagen', '/static/logos/vw.png', '德国汽车品牌，T系列房车深受欧洲用户喜爱', '德国', 60, 'active'),
('丰田', 'Toyota', '/static/logos/toyota.png', '日本汽车品牌，海狮系列房车底盘稳定可靠', '日本', 50, 'active'),
('日产', 'Nissan', '/static/logos/nissan.png', '日本汽车制造商，NV系列房车实用性强', '日本', 40, 'active'),
('别克', 'Buick', '/static/logos/buick.png', '美国通用汽车旗下品牌，商务房车系列舒适度高', '美国', 30, 'active'),
('金龙', 'Kinglong', '/static/logos/kinglong.png', '中国客车制造商，大型房车技术成熟', '中国', 20, 'active'),
('宇通', 'Yutong', '/static/logos/yutong.png', '中国客车制造商，房车产品线丰富', '中国', 10, 'active');

-- 2. 插入车辆型号数据
INSERT INTO `vehicle_models` (`brand_id`, `name`, `name_en`, `category`, `length`, `width`, `height`, `fuel_type`, `transmission`, `seats`, `sleepers`, `toilet`, `kitchen`, `shower`, `water_tank`, `description`, `status`) VALUES
-- 奔驰系列
(1, 'Sprinter 524', 'Sprinter 524', '自行式C型', 7.35, 2.10, 2.97, '柴油', '自动', 4, 4, '固定式', '完整', '完整', 120, '奔驰Sprinter豪华房车，适合家庭出游', 'active'),
(1, 'Vito 119', 'Vito 119', '自行式B型', 5.14, 1.93, 2.58, '柴油', '自动', 4, 2, '便携式', '简易', '无', 80, '奔驰Vito商务房车，城市驾驶灵活', 'active'),

-- 福特系列
(2, '全顺V362', 'Transit V362', '自行式C型', 5.99, 2.06, 2.80, '柴油', '手动', 6, 3, '固定式', '完整', '简易', 100, '福特全顺经典房车，性价比高', 'active'),
(2, '新世代全顺', 'New Transit', '自行式B型', 5.34, 1.98, 2.63, '柴油', '手动', 4, 2, '无', '简易', '无', 60, '福特新世代全顺，改装潜力大', 'active'),

-- 依维柯系列
(3, 'Daily 70C', 'Daily 70C', '自行式A型', 8.00, 2.50, 3.20, '柴油', '手自一体', 6, 6, '固定式', '完整', '完整', 200, '依维柯Daily高端房车，空间宽敞', 'active'),
(3, 'Daily 35S', 'Daily 35S', '自行式C型', 6.50, 2.10, 2.90, '柴油', '手动', 4, 4, '固定式', '完整', '简易', 150, '依维柯Daily经济型房车', 'active'),

-- 大众系列
(5, 'T6.1 California', 'T6.1 California', '自行式B型', 5.05, 1.90, 2.50, '柴油', '手动', 4, 2, '便携式', '简易', '无', 70, '大众T6.1加州版房车，品质精良', 'active'),
(5, 'Crafter', 'Crafter', '自行式C型', 7.20, 2.30, 2.85, '柴油', '自动', 6, 4, '固定式', '完整', '简易', 120, '大众Crafter大空间房车', 'active'),

-- 丰田系列
(6, '海狮HIACE', 'HIACE', '自行式B型', 5.38, 1.88, 2.28, '汽油', '手动', 6, 3, '无', '简易', '无', 80, '丰田海狮房车，可靠性极高', 'active'),
(6, '考斯特', 'Coaster', '自行式A型', 7.70, 2.10, 2.80, '汽油', '手动', 8, 6, '固定式', '完整', '完整', 150, '丰田考斯特大型房车', 'active');

-- 3. 插入车辆特性数据
INSERT INTO `vehicle_features` (`name`, `icon`, `description`, `feature_type`, `sort_order`, `status`) VALUES
('空调', 'ac', '车载空调系统，制冷制热', '基础配置', 100, 'active'),
('冰箱', 'fridge', '车载冰箱，保鲜食物', '生活设施', 90, 'active'),
('微波炉', 'microwave', '车载微波炉，加热食物', '生活设施', 80, 'active'),
('电磁炉', 'induction', '电磁炉设备，安全烹饪', '生活设施', 70, 'active'),
('热水器', 'heater', '车载热水器，提供热水', '生活设施', 60, 'active'),
('太阳能板', 'solar', '太阳能发电系统', '外部配置', 50, 'active'),
('发电机', 'generator', '车载发电机组', '外部配置', 40, 'active'),
('卫星电视', 'tv', '卫星电视接收系统', '娱乐设施', 30, 'active'),
('音响系统', 'audio', '高品质车载音响', '娱乐设施', 20, 'active'),
('WiFi热点', 'wifi', '车载WiFi路由器', '娱乐设施', 10, 'active'),
('倒车雷达', 'radar', '倒车雷达预警系统', '安全配置', 95, 'active'),
('倒车影像', 'camera', '高清倒车摄像头', '安全配置', 85, 'active'),
('ABS防抱死', 'abs', 'ABS刹车防抱死系统', '安全配置', 75, 'active'),
('ESP稳定系统', 'esp', 'ESP电子稳定程序', '安全配置', 65, 'active'),
('安全气囊', 'airbag', '主副驾驶安全气囊', '安全配置', 55, 'active'),
('电动天窗', 'sunroof', '电动天窗，采光通风', '外部配置', 45, 'active'),
('遮阳棚', 'awning', '手动/电动遮阳棚', '外部配置', 35, 'active'),
('自行车架', 'bike', '自行车携带架', '外部配置', 25, 'active'),
('行李架', 'luggage', '车顶行李架', '外部配置', 15, 'active'),
('GPS导航', 'gps', '车载GPS导航系统', '娱乐设施', 5, 'active');

-- 4. 插入车辆数据 (模拟数据)
INSERT INTO `vehicles` (`vehicle_model_id`, `store_id`, `nickname`, `color`, `daily_rate`, `weekly_rate`, `monthly_rate`, `deposit`, `kilometer_limit`, `excess_km_fee`, `availability_status`, `rating_avg`, `rating_count`, `rental_count`, `description`, `sort_order`, `status`) VALUES
-- 奔驰Sprinter
(1, 1, '豪华奔驰Sprinter', '白色', 800.00, 5200.00, 20000.00, 5000.00, 300, 3.00, '可用', 4.8, 156, 89, '奔驰Sprinter豪华房车，配备齐全，适合长途旅行', 100, 'active'),
(1, 2, '舒适奔驰Sprinter', '银色', 750.00, 4900.00, 18000.00, 5000.00, 300, 3.00, '可用', 4.7, 132, 76, '奔驰Sprinter舒适版，性价比优秀', 95, 'active'),

-- 福特全顺
(3, 1, '经典福特全顺', '蓝色', 380.00, 2500.00, 9000.00, 3000.00, 250, 2.00, '可用', 4.5, 89, 134, '福特全顺经典房车，经济实用', 80, 'active'),
(4, 3, '实用福特新世代', '白色', 450.00, 3000.00, 11000.00, 3500.00, 280, 2.50, '可用', 4.4, 76, 98, '福特新世代全顺，改装潜力大', 75, 'active'),

-- 依维柯Daily
(5, 2, '豪华依维柯Daily', '红色', 1200.00, 8000.00, 30000.00, 8000.00, 400, 5.00, '可用', 4.9, 67, 45, '依维柯Daily高端房车，豪华配置', 120, 'active'),
(6, 4, '经济依维柯Daily', '灰色', 650.00, 4200.00, 15000.00, 4000.00, 350, 3.50, '可用', 4.6, 78, 67, '依维柯Daily经济型，价格实惠', 85, 'active'),

-- 大众T6.1
(7, 1, '精致大众T6.1', '橙色', 520.00, 3300.00, 12000.00, 3500.00, 200, 2.50, '可用', 4.7, 112, 145, '大众T6.1加州版，德国品质', 90, 'active'),
(8, 3, '实用大众Crafter', '绿色', 680.00, 4500.00, 16000.00, 4000.00, 300, 3.00, '可用', 4.5, 93, 82, '大众Crafter大空间房车', 88, 'active'),

-- 丰田海狮
(9, 2, '可靠丰田海狮', '黑色', 420.00, 2800.00, 10000.00, 3000.00, 280, 2.00, '已预定', 4.8, 134, 201, '丰田海狮房车，超高可靠性', 82, 'active'),
(10, 4, '大型丰田考斯特', '黄色', 950.00, 6200.00, 22000.00, 6000.00, 350, 4.00, '使用中', 4.6, 89, 56, '丰田考斯特大型房车，适合团队出行', 105, 'active');

-- 5. 插入车辆图片数据
INSERT INTO `vehicle_images` (`vehicle_id`, `image_url`, `image_type`, `image_title`, `image_description`, `is_main`, `sort_order`, `status`) VALUES
-- 奔驰Sprinter 图片
(1, '/static/vehicles/mercedes-sprinter-1.jpg', '外观', '奔驰Sprinter外观', '奔驰Sprinter房车外观图片', 1, 1, 'active'),
(1, '/static/vehicles/mercedes-sprinter-2.jpg', '内饰', '奔驰Sprinter驾驶室', '奔驰Sprinter驾驶室内部', 0, 2, 'active'),
(1, '/static/vehicles/mercedes-sprinter-3.jpg', '床位', '奔驰Sprinter主卧', '奔驰Sprinter主卧区域', 0, 3, 'active'),
(1, '/static/vehicles/mercedes-sprinter-4.jpg', '厨房', '奔驰Sprinter厨房', '奔驰Sprinter厨房区域', 0, 4, 'active'),
(1, '/static/vehicles/mercedes-sprinter-5.jpg', '卫生间', '奔驰Sprinter卫生间', '奔驰Sprinter独立卫生间', 0, 5, 'active'),

-- 福特全顺 图片
(3, '/static/vehicles/ford-transit-1.jpg', '外观', '福特全顺外观', '福特全顺房车外观', 1, 1, 'active'),
(3, '/static/vehicles/ford-transit-2.jpg', '内饰', '福特全顺客厅', '福特全顺客厅区域', 0, 2, 'active'),
(3, '/static/vehicles/ford-transit-3.jpg', '床位', '福特全顺床位', '福特全顺睡眠区域', 0, 3, 'active'),

-- 其他车辆的主图
(2, '/static/vehicles/mercedes-vito-1.jpg', '外观', '奔驰Vito外观', '奔驰Vito房车外观', 1, 1, 'active'),
(4, '/static/vehicles/ford-new-transit-1.jpg', '外观', '福特新世代全顺外观', '福特新世代全顺房车外观', 1, 1, 'active'),
(5, '/static/vehicles/iveco-daily-1.jpg', '外观', '依维柯Daily外观', '依维柯Daily高端房车外观', 1, 1, 'active'),
(6, '/static/vehicles/iveco-daily-eco-1.jpg', '外观', '依维柯Daily经济型外观', '依维柯Daily经济型房车外观', 1, 1, 'active'),
(7, '/static/vehicles/vw-t61-1.jpg', '外观', '大众T6.1外观', '大众T6.1加州版房车外观', 1, 1, 'active'),
(8, '/static/vehicles/vw-crafter-1.jpg', '外观', '大众Crafter外观', '大众Crafter大空间房车外观', 1, 1, 'active'),
(9, '/static/vehicles/toyota-hiace-1.jpg', '外观', '丰田海狮外观', '丰田海狮房车外观', 1, 1, 'active'),
(10, '/static/vehicles/toyota-coaster-1.jpg', '外观', '丰田考斯特外观', '丰田考斯特大型房车外观', 1, 1, 'active');

-- 6. 插入车辆特性关联数据
INSERT INTO `vehicle_feature_relations` (`vehicle_id`, `feature_id`) VALUES
-- 奔驰Sprinter特性
(1, 1), (1, 2), (1, 3), (1, 5), (1, 11), (1, 12), (1, 15), (1, 19),
-- 奔驰Vito特性
(2, 1), (2, 2), (2, 11), (2, 12), (2, 19),
-- 福特全顺特性
(3, 1), (3, 2), (3, 4), (3, 11), (3, 12), (3, 19),
-- 福特新世代全顺特性
(4, 1), (4, 2), (4, 11), (4, 12), (4, 19),
-- 依维柯Daily豪华特性
(5, 1), (5, 2), (5, 3), (5, 5), (5, 6), (5, 7), (5, 8), (5, 11), (5, 12), (5, 13), (5, 14), (5, 15), (5, 19),
-- 依维柯Daily经济特性
(6, 1), (6, 2), (6, 11), (6, 12), (6, 19),
-- 大众T6.1特性
(7, 1), (7, 2), (7, 4), (7, 11), (7, 12), (7, 16), (7, 19),
-- 大众Crafter特性
(8, 1), (8, 2), (8, 3), (8, 5), (8, 11), (8, 12), (8, 19),
-- 丰田海狮特性
(9, 1), (9, 2), (9, 11), (9, 12), (9, 19),
-- 丰田考斯特特性
(10, 1), (10, 2), (10, 3), (10, 5), (10, 11), (10, 12), (10, 15), (10, 19);