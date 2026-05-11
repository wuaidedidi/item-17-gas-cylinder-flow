import { approvalStatusLabels, approvalTargetLabels, cylinderStatusLabels, recordStatusLabels, roleLabels, severityLabels, userStatusLabels, warningStatusLabels } from './labels';

export const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export const roleOptions = toOptions(roleLabels);
export const userStatusOptions = toOptions(userStatusLabels);
export const cylinderStatusOptions = toOptions(cylinderStatusLabels);
export const recordStatusOptions = toOptions(recordStatusLabels);
export const warningStatusOptions = toOptions(warningStatusLabels);
export const severityOptions = toOptions(severityLabels);
export const approvalStatusOptions = toOptions(approvalStatusLabels);
export const approvalTargetOptions = toOptions(approvalTargetLabels);

