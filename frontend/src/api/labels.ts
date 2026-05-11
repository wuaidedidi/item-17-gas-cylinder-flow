export const roleLabels: Record<string, string> = {
  ADMIN: '系统管理员',
  WAREHOUSE_MANAGER: '仓库管理员',
  SAFETY_OFFICER: '安全员',
  INSPECTOR: '巡检员',
  GENERAL_USER: '普通用户',
};

export const userStatusLabels: Record<string, string> = {
  ACTIVE: '启用',
  DISABLED: '禁用',
};

export const cylinderStatusLabels: Record<string, string> = {
  IN_STOCK: '在库',
  IN_TRANSIT: '流转中',
  UNDER_INSPECTION: '巡检复核',
  IN_MAINTENANCE: '维修中',
  SCRAPPED: '已报废',
};

export const recordStatusLabels: Record<string, string> = {
  PENDING: '待确认',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  REJECTED: '已驳回',
};

export const warningStatusLabels: Record<string, string> = {
  OPEN: '待处理',
  PROCESSING: '处理中',
  CLOSED: '已关闭',
};

export const severityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

export const approvalStatusLabels: Record<string, string> = {
  PENDING: '待处理',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

export const approvalTargetLabels: Record<string, string> = {
  CYLINDER: '气瓶档案',
  INBOUND: '入库记录',
  OUTBOUND: '出库记录',
  INSPECTION: '巡检记录',
  MAINTENANCE: '维修保养',
  WARNING: '风险预警',
};

export const statusColor = (value?: string) => {
  if (!value) return 'default';
  if (['ACTIVE', 'IN_STOCK', 'COMPLETED', 'APPROVED', 'CLOSED'].includes(value)) return 'green';
  if (['OPEN', 'HIGH', 'REJECTED', 'SCRAPPED'].includes(value)) return 'red';
  if (['PROCESSING', 'IN_TRANSIT', 'IN_MAINTENANCE', 'MEDIUM', 'PENDING', 'UNDER_INSPECTION'].includes(value)) return 'orange';
  return 'blue';
};

