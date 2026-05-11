SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

CREATE DATABASE IF NOT EXISTS gas_cylinder_flow
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gas_cylinder_flow;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NULL,
  email VARCHAR(128) NULL,
  role ENUM('ADMIN','WAREHOUSE_MANAGER','SAFETY_OFFICER','INSPECTOR','GENERAL_USER') NOT NULL DEFAULT 'GENERAL_USER',
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  remark TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY users_username_key (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cylinders (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(64) NULL,
  gasType VARCHAR(64) NULL,
  capacity VARCHAR(64) NULL,
  pressureLevel VARCHAR(64) NULL,
  manufacturer VARCHAR(128) NULL,
  serialNo VARCHAR(128) NULL,
  warehouseLocation VARCHAR(128) NULL,
  currentHolder VARCHAR(128) NULL,
  status ENUM('IN_STOCK','IN_TRANSIT','UNDER_INSPECTION','IN_MAINTENANCE','SCRAPPED') NOT NULL DEFAULT 'IN_STOCK',
  lastInspectionAt DATETIME(3) NULL,
  nextInspectionAt DATETIME(3) NULL,
  nextMaintenanceAt DATETIME(3) NULL,
  remark TEXT NULL,
  createdById INT NULL,
  updatedById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY cylinders_code_key (code),
  KEY cylinders_createdById_idx (createdById),
  KEY cylinders_updatedById_idx (updatedById),
  CONSTRAINT cylinders_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT cylinders_updatedById_fkey FOREIGN KEY (updatedById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inbound_records (
  id INT NOT NULL AUTO_INCREMENT,
  recordNo VARCHAR(64) NOT NULL,
  cylinderId INT NOT NULL,
  inboundAt DATETIME(3) NOT NULL,
  sourceLocation VARCHAR(128) NULL,
  destinationLocation VARCHAR(128) NULL,
  handlerName VARCHAR(64) NOT NULL,
  status ENUM('PENDING','PROCESSING','COMPLETED','REJECTED') NOT NULL DEFAULT 'COMPLETED',
  remark TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY inbound_records_recordNo_key (recordNo),
  KEY inbound_records_cylinderId_idx (cylinderId),
  KEY inbound_records_createdById_idx (createdById),
  CONSTRAINT inbound_records_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE RESTRICT,
  CONSTRAINT inbound_records_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS outbound_records (
  id INT NOT NULL AUTO_INCREMENT,
  recordNo VARCHAR(64) NOT NULL,
  cylinderId INT NOT NULL,
  outboundAt DATETIME(3) NOT NULL,
  targetLocation VARCHAR(128) NULL,
  handlerName VARCHAR(64) NOT NULL,
  purpose VARCHAR(128) NULL,
  status ENUM('PENDING','PROCESSING','COMPLETED','REJECTED') NOT NULL DEFAULT 'COMPLETED',
  remark TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY outbound_records_recordNo_key (recordNo),
  KEY outbound_records_cylinderId_idx (cylinderId),
  KEY outbound_records_createdById_idx (createdById),
  CONSTRAINT outbound_records_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE RESTRICT,
  CONSTRAINT outbound_records_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inspection_records (
  id INT NOT NULL AUTO_INCREMENT,
  recordNo VARCHAR(64) NOT NULL,
  cylinderId INT NOT NULL,
  inspectedAt DATETIME(3) NOT NULL,
  inspectorName VARCHAR(64) NOT NULL,
  result VARCHAR(128) NOT NULL,
  isAbnormal BOOLEAN NOT NULL DEFAULT FALSE,
  issues TEXT NULL,
  nextInspectionAt DATETIME(3) NULL,
  status ENUM('PENDING','PROCESSING','COMPLETED','REJECTED') NOT NULL DEFAULT 'COMPLETED',
  remark TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY inspection_records_recordNo_key (recordNo),
  KEY inspection_records_cylinderId_idx (cylinderId),
  KEY inspection_records_createdById_idx (createdById),
  CONSTRAINT inspection_records_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE RESTRICT,
  CONSTRAINT inspection_records_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT NOT NULL AUTO_INCREMENT,
  recordNo VARCHAR(64) NOT NULL,
  cylinderId INT NOT NULL,
  maintainedAt DATETIME(3) NOT NULL,
  technicianName VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  result VARCHAR(128) NULL,
  nextMaintenanceAt DATETIME(3) NULL,
  status ENUM('PENDING','PROCESSING','COMPLETED','REJECTED') NOT NULL DEFAULT 'COMPLETED',
  remark TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY maintenance_records_recordNo_key (recordNo),
  KEY maintenance_records_cylinderId_idx (cylinderId),
  KEY maintenance_records_createdById_idx (createdById),
  CONSTRAINT maintenance_records_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE RESTRICT,
  CONSTRAINT maintenance_records_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS warning_rules (
  id INT NOT NULL AUTO_INCREMENT,
  ruleName VARCHAR(128) NOT NULL,
  ruleType VARCHAR(64) NOT NULL,
  thresholdValue INT NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY warning_rules_createdById_idx (createdById),
  CONSTRAINT warning_rules_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS warnings (
  id INT NOT NULL AUTO_INCREMENT,
  warningNo VARCHAR(64) NOT NULL,
  cylinderId INT NULL,
  ruleId INT NULL,
  title VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  status ENUM('OPEN','PROCESSING','CLOSED') NOT NULL DEFAULT 'OPEN',
  source VARCHAR(64) NOT NULL,
  detectedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  handledAt DATETIME(3) NULL,
  handledById INT NULL,
  resolvedRemark TEXT NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY warnings_warningNo_key (warningNo),
  KEY warnings_cylinderId_idx (cylinderId),
  KEY warnings_ruleId_idx (ruleId),
  KEY warnings_handledById_idx (handledById),
  KEY warnings_createdById_idx (createdById),
  CONSTRAINT warnings_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE SET NULL,
  CONSTRAINT warnings_ruleId_fkey FOREIGN KEY (ruleId) REFERENCES warning_rules(id) ON DELETE SET NULL,
  CONSTRAINT warnings_handledById_fkey FOREIGN KEY (handledById) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT warnings_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trace_logs (
  id INT NOT NULL AUTO_INCREMENT,
  cylinderId INT NULL,
  cylinderCode VARCHAR(64) NOT NULL,
  queryKeyword VARCHAR(128) NULL,
  traceType VARCHAR(64) NOT NULL,
  querySource ENUM('MANUAL','SCANNER','LIST') NOT NULL DEFAULT 'MANUAL',
  resultSummary TEXT NULL,
  operatorName VARCHAR(64) NULL,
  createdById INT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY trace_logs_cylinderId_idx (cylinderId),
  KEY trace_logs_createdById_idx (createdById),
  CONSTRAINT trace_logs_cylinderId_fkey FOREIGN KEY (cylinderId) REFERENCES cylinders(id) ON DELETE SET NULL,
  CONSTRAINT trace_logs_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_logs (
  id INT NOT NULL AUTO_INCREMENT,
  approvalNo VARCHAR(64) NOT NULL,
  targetType ENUM('CYLINDER','INBOUND','OUTBOUND','INSPECTION','MAINTENANCE','WARNING') NOT NULL,
  targetId INT NOT NULL,
  action VARCHAR(128) NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  opinion TEXT NULL,
  approverId INT NULL,
  createdById INT NULL,
  approvedAt DATETIME(3) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY approval_logs_approvalNo_key (approvalNo),
  KEY approval_logs_approverId_idx (approverId),
  KEY approval_logs_createdById_idx (createdById),
  CONSTRAINT approval_logs_approverId_fkey FOREIGN KEY (approverId) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT approval_logs_createdById_fkey FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @pwd = 'pbkdf2$600000$025d233b7b85ef2a9945e0ac934beb5b$5e8e4fc6af3e1a1aee97d7dd1303bdbe67b5c210d1d849ecada114a4a96c68cd0d7cbd4ca5b3d88b1d205f58b7cdb431c47dc77eac1e4d764e25093c07900af2';

INSERT INTO users (id, username, password, name, phone, email, role, status, remark) VALUES
  (1, 'admin', @pwd, '系统管理员', '13800000001', 'admin@example.com', 'ADMIN', 'ACTIVE', '初始化管理员账号'),
  (2, 'warehouse', @pwd, '仓库管理员', '13800000002', 'warehouse@example.com', 'WAREHOUSE_MANAGER', 'ACTIVE', '负责出入库流转'),
  (3, 'safety', @pwd, '安全员', '13800000003', 'safety@example.com', 'SAFETY_OFFICER', 'ACTIVE', '负责预警处理和维修闭环'),
  (4, 'inspector', @pwd, '巡检员', '13800000004', 'inspector@example.com', 'INSPECTOR', 'ACTIVE', '负责现场巡检'),
  (5, 'guest', @pwd, '普通用户', NULL, NULL, 'GENERAL_USER', 'ACTIVE', '默认注册用户示例')
ON DUPLICATE KEY UPDATE role = VALUES(role), status = VALUES(status);

INSERT INTO cylinders (id, code, name, type, gasType, capacity, pressureLevel, manufacturer, serialNo, warehouseLocation, currentHolder, status, lastInspectionAt, nextInspectionAt, nextMaintenanceAt, remark, createdById, updatedById) VALUES
  (1, 'CYL-20260509-001', '乙炔气瓶', '钢瓶', '乙炔', '40L', '1.6MPa', '华东容器制造', 'SN-A20260509-001', 'A区-01排-03位', '仓库待发', 'IN_STOCK', '2026-05-01 08:00:00.000', '2026-06-01 00:00:00.000', '2026-07-01 00:00:00.000', '演示数据：用于入库与巡检流程演示', 1, 1),
  (2, 'CYL-20260509-002', '氧气气瓶', '钢瓶', '氧气', '45L', '15MPa', '南方特种设备厂', 'SN-O20260509-002', 'B区-04排-09位', '车间一线', 'IN_TRANSIT', '2026-05-02 09:00:00.000', '2026-06-02 00:00:00.000', '2026-07-02 00:00:00.000', '演示数据：带有流转轨迹', 2, 2),
  (3, 'CYL-20260509-003', '氮气气瓶', '钢瓶', '氮气', '50L', '15MPa', '东部压力容器', 'SN-N20260509-003', 'C区-02排-01位', '维修待检', 'IN_MAINTENANCE', '2026-05-05 11:30:00.000', '2026-06-05 00:00:00.000', '2026-07-06 00:00:00.000', '演示数据：用于维修流程和预警处理', 3, 3)
ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP(3);

INSERT INTO inbound_records (id, recordNo, cylinderId, inboundAt, sourceLocation, destinationLocation, handlerName, status, remark, createdById) VALUES
  (1, 'INB-20260509-001', 1, '2026-05-01 08:00:00.000', '供应商仓库', 'A区仓储中心', '张仓库', 'COMPLETED', '首次入库记录', 1)
ON DUPLICATE KEY UPDATE remark = VALUES(remark);

INSERT INTO outbound_records (id, recordNo, cylinderId, outboundAt, targetLocation, handlerName, purpose, status, remark, createdById) VALUES
  (1, 'OUT-20260509-001', 2, '2026-05-03 10:30:00.000', '车间装配线', '李仓库', '设备供气', 'COMPLETED', '已完成出库流转', 2)
ON DUPLICATE KEY UPDATE remark = VALUES(remark);

INSERT INTO inspection_records (id, recordNo, cylinderId, inspectedAt, inspectorName, result, isAbnormal, issues, nextInspectionAt, status, remark, createdById) VALUES
  (1, 'INS-20260509-001', 3, '2026-05-05 11:30:00.000', '王巡检', '发现阀门轻微磨损', TRUE, '阀门外观存在细微划痕，建议复检', '2026-06-05 00:00:00.000', 'COMPLETED', '已生成预警', 4)
ON DUPLICATE KEY UPDATE remark = VALUES(remark);

INSERT INTO maintenance_records (id, recordNo, cylinderId, maintainedAt, technicianName, content, result, nextMaintenanceAt, status, remark, createdById) VALUES
  (1, 'MNT-20260509-001', 3, '2026-05-06 09:00:00.000', '赵维修', '更换阀门密封圈并完成气密测试', '已修复', '2026-07-06 00:00:00.000', 'COMPLETED', '维修完成，可恢复使用', 3)
ON DUPLICATE KEY UPDATE remark = VALUES(remark);

INSERT INTO warning_rules (id, ruleName, ruleType, thresholdValue, severity, enabled, description, createdById) VALUES
  (1, '巡检超期预警', 'inspection_due', 30, 'HIGH', TRUE, '超过30天未巡检的气瓶自动进入高风险预警', 1),
  (2, '维修超期预警', 'maintenance_due', 60, 'MEDIUM', TRUE, '超过60天未完成维护的气瓶进入中风险预警', 1)
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled);

INSERT INTO warnings (id, warningNo, cylinderId, ruleId, title, content, severity, status, source, detectedAt, createdById) VALUES
  (1, 'WARN-20260509-001', 3, 1, '巡检异常需要复核', '巡检记录发现阀门磨损，需安全员完成复核并留痕', 'HIGH', 'PROCESSING', 'inspection', '2026-05-05 11:40:00.000', 4)
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO trace_logs (id, cylinderId, cylinderCode, queryKeyword, traceType, querySource, resultSummary, operatorName, createdById) VALUES
  (1, 1, 'CYL-20260509-001', 'CYL-20260509-001', '首次建档查询', 'LIST', '完成入库建档，当前状态为在库。', '系统管理员', 1)
ON DUPLICATE KEY UPDATE resultSummary = VALUES(resultSummary);

INSERT INTO approval_logs (id, approvalNo, targetType, targetId, action, status, opinion, approverId, createdById, approvedAt) VALUES
  (1, 'APR-20260509-001', 'INBOUND', 1, '入库记录留痕', 'APPROVED', '已确认入库信息完整', 1, 1, '2026-05-01 09:00:00.000'),
  (2, 'APR-20260509-002', 'WARNING', 1, '预警处理留痕', 'PENDING', '等待安全员复核', NULL, 4, NULL)
ON DUPLICATE KEY UPDATE opinion = VALUES(opinion);

