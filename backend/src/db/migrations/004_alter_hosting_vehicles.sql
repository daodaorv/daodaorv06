-- 修改托管车辆表，新增关联申请ID字段

ALTER TABLE hosting_vehicles
ADD COLUMN application_id BIGINT NULL COMMENT '关联的申请ID' AFTER user_id;

-- 添加索引
ALTER TABLE hosting_vehicles
ADD INDEX idx_application_id (application_id);
