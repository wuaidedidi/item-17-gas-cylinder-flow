import { FieldTimeOutlined, ReloadOutlined, ScanOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, Space, Table, Timeline, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { http, showSuccess } from '../api/http';
import { PageHeader } from '../components/PageHeader';

export const TracePage = () => {
  const [form] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const data = await http.get<any, any>('/trace/search', {
        params: { keyword: values.keyword, source: 'SCANNER' },
      });
      setResult(data);
      showSuccess(data.found ? '追踪查询完成' : data.message);
      await loadLogs(1, pageSize);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (nextPage = page, nextPageSize = pageSize) => {
    const data = await http.get<any, any>('/trace/logs', {
      params: { ...queryForm.getFieldsValue(), page: nextPage, pageSize: nextPageSize },
    });
    setLogs(data.list);
    setTotal(data.total);
    setPage(data.page);
    setPageSize(data.pageSize);
  };

  useEffect(() => {
    loadLogs(1, pageSize);
  }, []);

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: '气瓶编码', dataIndex: 'cylinderCode', width: 180 },
      { title: '查询关键词', dataIndex: 'queryKeyword', width: 160 },
      { title: '查询方式', dataIndex: 'querySource', width: 110, render: (v) => (v === 'SCANNER' ? '扫码入口' : '手动查询') },
      { title: '查询人', dataIndex: ['createdBy', 'name'], width: 120, render: (v, r) => v || r.operatorName || '-' },
      { title: '查询时间', dataIndex: 'createdAt', width: 170, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
      { title: '结果摘要', dataIndex: 'resultSummary', ellipsis: true },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <PageHeader title="责任追踪查询" description="通过气瓶编码或扫码枪输入，查询完整流转、巡检、维修与预警轨迹。" />
      <section className="trace-hero">
        <div>
          <Typography.Title level={3}>扫码追踪入口</Typography.Title>
          <Typography.Text>支持扫码枪直接输入编码，也可以手动输入气瓶编码、出厂编号或名称。</Typography.Text>
        </div>
        <Form form={form} className="trace-search" onFinish={search}>
          <Form.Item name="keyword" rules={[{ required: true, message: '请输入气瓶编码或关键词' }]}>
            <Input size="large" prefix={<ScanOutlined />} placeholder="如 CYL-20260509-001" allowClear />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
            查询轨迹
          </Button>
        </Form>
      </section>

      <section className="content-panel">
        <div className="panel-title">
          <Typography.Title level={4}>生命周期轨迹</Typography.Title>
          <Typography.Text>{result?.found ? `${result.cylinder.code} · ${result.cylinder.name}` : '查询后展示气瓶全过程记录'}</Typography.Text>
        </div>
        {result?.found ? (
          <Timeline
            mode="left"
            items={result.timeline.map((item: any) => ({
              dot: <FieldTimeOutlined />,
              label: dayjs(item.time).format('YYYY-MM-DD HH:mm'),
              children: (
                <div className="timeline-card">
                  <strong>{item.type} · {item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={result?.message || '暂无查询结果'} />
        )}
      </section>

      <section className="content-panel">
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => loadLogs(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="气瓶编码、查询关键词" allowClear />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { queryForm.resetFields(); loadLogs(1, pageSize); }}>重置</Button>
          </Space>
        </Form>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={logs}
          scroll={{ x: 980 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
            onChange: loadLogs,
          }}
        />
      </section>
    </div>
  );
};

