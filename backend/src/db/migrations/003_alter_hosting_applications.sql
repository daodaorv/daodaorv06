-- 修改托管申请表，新增审核相关字段

ALTER TABLE hosting_applications
ADD COLUMN reviewed_by BIGINT NULL COMMENT '审核人ID' AFTER status,
ADD COLUMN reviewed_at TIMESTAMP NULL COMMENT '审核时间' AFTER reviewed_by,
ADD COLUMN reject_reason VARCHAR(500) NULL COMMENT '拒绝原因' AFTER reviewed_at;

-- 添加索引
ALTER TABLE hosting_applications
ADD INDEX idx_reviewed_by (reviewed_by);
