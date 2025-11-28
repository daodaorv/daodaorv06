INSERT INTO users (phone, password_hash, username, user_type, status)
VALUES ('13800138000', '$2a$12$PmDQ0pYkMD2lW305K3K8eeILigSqLdquOwrcg3ZFMfGb9y5eZxRmy', 'admin', 'pc_admin', 'active')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
