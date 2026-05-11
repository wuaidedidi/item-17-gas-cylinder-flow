import { Tag } from 'antd';
import { statusColor } from '../api/labels';

export const EntityTag = ({ value, labels }: { value?: string; labels: Record<string, string> }) => (
  <Tag color={statusColor(value)}>{labels[value || ''] || value || '-'}</Tag>
);

