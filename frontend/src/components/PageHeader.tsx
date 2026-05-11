import { ReactNode } from 'react';
import { Typography } from 'antd';

export const PageHeader = ({
  title,
  description,
  extra,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
}) => (
  <div className="page-header">
    <div>
      <Typography.Title level={2}>{title}</Typography.Title>
      {description ? <Typography.Text>{description}</Typography.Text> : null}
    </div>
    {extra ? <div className="page-header-extra">{extra}</div> : null}
  </div>
);

