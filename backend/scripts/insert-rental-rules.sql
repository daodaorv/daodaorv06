-- 插入租车须知数据
-- 使用方法：在 MySQL 客户端或 Docker 容器中执行此脚本

USE daodao;

-- 清空现有数据（可选）
-- DELETE FROM rental_rules WHERE product_type = 'vehicle';

-- 插入车辆租赁须知
INSERT INTO rental_rules (product_type, version, content, status, created_at, updated_at)
VALUES (
  'vehicle',
  '1.0.0',
  JSON_OBJECT(
    'productType', 'vehicle',
    'version', '1.0.0',
    'sections', JSON_ARRAY(
      -- 第一部分：租车条件
      JSON_OBJECT(
        'id', 'rental-conditions',
        'title', '租车条件',
        'items', JSON_ARRAY(
          JSON_OBJECT('title', '年龄要求', 'description', '驾驶员年龄需满21周岁，持有效驾驶证满1年以上'),
          JSON_OBJECT('title', '证件要求', 'description', '需提供本人有效身份证、驾驶证原件，驾驶证需在有效期内'),
          JSON_OBJECT('title', '押金要求', 'description', '需缴纳车辆押金，具体金额根据车型而定，还车后无违章即退还'),
          JSON_OBJECT('title', '信用要求', 'description', '需通过信用审核，无不良信用记录')
        )
      ),
      -- 第二部分：取还车说明
      JSON_OBJECT(
        'id', 'pickup-return',
        'title', '取还车说明',
        'items', JSON_ARRAY(
          JSON_OBJECT('title', '取车时间', 'description', '请按预订时间准时取车，如需提前或延后，请提前联系客服'),
          JSON_OBJECT('title', '取车地点', 'description', '支持门店自取或送车上门服务（部分地区需额外收费）'),
          JSON_OBJECT('title', '还车时间', 'description', '请按约定时间还车，超时将按小时收取超时费用'),
          JSON_OBJECT('title', '还车地点', 'description', '需还至取车门店，如需异地还车请提前说明并支付异地还车费')
        )
      ),
      -- 第三部分：用车规范
      JSON_OBJECT(
        'id', 'usage-rules',
        'title', '用车规范',
        'highlight', '请严格遵守交通法规，安全驾驶',
        'items', JSON_ARRAY(
          JSON_OBJECT('title', '驾驶人员', 'description', '仅限订单登记的驾驶员驾驶，不得转借他人'),
          JSON_OBJECT('title', '行驶范围', 'description', '仅限中国大陆境内使用，不得出境'),
          JSON_OBJECT('title', '禁止行为', 'description', '禁止酒驾、毒驾、疲劳驾驶；禁止参与非法活动；禁止改装车辆'),
          JSON_OBJECT('title', '车辆保养', 'description', '租期内需按要求进行车辆保养和维护')
        )
      )
    )
  ),
  'active',
  NOW(),
  NOW()
);
