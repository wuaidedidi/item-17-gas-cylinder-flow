import { AlertOutlined, BuildOutlined, DatabaseOutlined, FieldTimeOutlined, ScanOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Progress, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs from 'dayjs';
import { http } from '../api/http';
import { cylinderStatusLabels, severityLabels, warningStatusLabels } from '../api/labels';
import { PageHeader } from '../components/PageHeader';
import { EntityTag } from '../components/EntityTag';

const metricConfig = [
  { key: 'inStock', title: '在库气瓶数', icon: <DatabaseOutlined />, unit: '只' },
  { key: 'activeWarnings', title: '异常预警数', icon: <AlertOutlined />, unit: '条' },
  { key: 'inspectionRate', title: '近30天巡检完成率', icon: <SafetyCertificateOutlined />, unit: '%' },
  { key: 'maintenanceInProgress', title: '维修中数量', icon: <BuildOutlined />, unit: '只' },
  { key: 'traceQueries', title: '责任追踪查询次数', icon: <ScanOutlined />, unit: '次' },
];

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryData, trendData] = await Promise.all([
        http.get<any, any>('/dashboard/summary'),
        http.get<any, any[]>('/dashboard/trends'),
      ]);
      setSummary(summaryData);
      setTrends(trendData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <Spin className="page-spin" size="large" />;
  }

  const metrics = summary?.metrics || {};

  return (
    <div className="page-stack">
      <PageHeader title="安全看板" description="集中查看气瓶库存、异常预警、巡检完成率和责任追踪热度。" />
      <Row gutter={[16, 16]}>
        {metricConfig.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={item.key === 'inspectionRate' ? 8 : 4}>
            <Card className="metric-card">
              <div className="metric-icon">{item.icon}</div>
              <Typography.Text>{item.title}</Typography.Text>
              {item.key === 'inspectionRate' ? (
                <Progress percent={metrics[item.key] || 0} strokeColor="#0f9f6e" />
              ) : (
                <div className="metric-value">
                  {metrics[item.key] ?? 0}
                  <span>{item.unit}</span>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <section className="content-panel chart-panel">
            <div className="panel-title">
              <Typography.Title level={4}>近 7 天安全作业趋势</Typography.Title>
              <Typography.Text>巡检、维修和预警按天汇总</Typography.Text>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="inspection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#116dff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#116dff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ecf3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="inspections" name="巡检" stroke="#116dff" fill="url(#inspection)" />
                  <Area type="monotone" dataKey="warnings" name="预警" stroke="#dc2626" fill="#fee2e2" />
                  <Area type="monotone" dataKey="maintenance" name="维修" stroke="#0f9f6e" fill="#dcfce7" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Col>
        <Col xs={24} xl={9}>
          <section className="content-panel">
            <div className="panel-title">
              <Typography.Title level={4}>当前待关注预警</Typography.Title>
              <Typography.Text>优先处理高风险与处理中事项</Typography.Text>
            </div>
            <div className="warning-list">
              {summary?.recentWarnings?.length ? (
                summary.recentWarnings.map((item: any) => (
                  <div className="warning-item" key={item.id}>
                    <Space direction="vertical" size={4}>
                      <Space wrap>
                        <Tag color={item.severity === 'HIGH' ? 'red' : 'orange'}>{severityLabels[item.severity]}</Tag>
                        <EntityTag value={item.status} labels={warningStatusLabels} />
                      </Space>
                      <strong>{item.title}</strong>
                      <span>{item.cylinder?.code || '未关联气瓶'} · {dayjs(item.detectedAt).format('MM-DD HH:mm')}</span>
                    </Space>
                  </div>
                ))
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无待处理预警" />
              )}
            </div>
          </section>
        </Col>
      </Row>

      <section className="content-panel">
        <div className="panel-title">
          <Typography.Title level={4}>最近巡检记录</Typography.Title>
          <Typography.Text>用于快速复核异常气瓶与巡检节奏</Typography.Text>
        </div>
        <Table
          rowKey="id"
          size="middle"
          pagination={false}
          dataSource={summary?.recentInspections || []}
          scroll={{ x: 900 }}
          columns={[
            { title: '记录编号', dataIndex: 'recordNo', width: 170 },
            { title: '气瓶编码', dataIndex: ['cylinder', 'code'], width: 180 },
            { title: '气瓶名称', dataIndex: ['cylinder', 'name'], width: 140 },
            { title: '巡检员', dataIndex: 'inspectorName', width: 120 },
            { title: '巡检时间', dataIndex: 'inspectedAt', width: 170, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
            { title: '当前状态', dataIndex: ['cylinder', 'status'], width: 120, render: (v) => <EntityTag value={v} labels={cylinderStatusLabels} /> },
            { title: '结果', dataIndex: 'result', ellipsis: true },
          ]}
        />
      </section>
    </div>
  );
};

