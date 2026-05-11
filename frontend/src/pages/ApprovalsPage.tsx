import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { approvalStatusLabels, approvalTargetLabels } from '../api/labels';
import { approvalStatusOptions, approvalTargetOptions } from '../api/options';
import { http } from '../api/http';
import { EntityTag } from '../components/EntityTag';
import { PageHeader } from '../components/PageHeader';

export const ApprovalsPage = () => {
  const [queryForm] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const data = await http.get<any, any>('/approvals', {
        params: { ...queryForm.getFieldsValue(), page: nextPage, pageSize: nextPageSize },
      });
      setItems(data.list);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, pageSize);
  }, []);

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: '审批编号', dataIndex: 'approvalNo', width: 180, fixed: 'left' },
      { title: '对象类型', dataIndex: 'targetType', width: 120, render: (v) => approvalTargetLabels[v] || v },
      { title: '动作', dataIndex: 'action', width: 160 },
      { title: '状态', dataIndex: 'status', width: 110, render: (v) => <EntityTag value={v} labels={approvalStatusLabels} /> },
      { title: '处理人', dataIndex: ['approver', 'name'], width: 120, render: (v) => v || '-' },
      { title: '创建人', dataIndex: ['createdBy', 'name'], width: 120, render: (v) => v || '-' },
      { title: '创建时间', dataIndex: 'createdAt', width: 170, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
      { title: '意见', dataIndex: 'opinion', ellipsis: true },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <PageHeader title="审批留痕" description="查看入库、出库、巡检、维修和预警处理过程中的审批与处理记录。" />
      <section className="content-panel">
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => load(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="审批编号、动作、意见" allowClear />
          </Form.Item>
          <Form.Item name="targetType">
            <Select placeholder="对象类型" allowClear options={approvalTargetOptions} className="filter-select" />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="审批状态" allowClear options={approvalStatusOptions} className="filter-select" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { queryForm.resetFields(); load(1, pageSize); }}>重置</Button>
          </Space>
        </Form>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
            onChange: load,
          }}
        />
      </section>
    </div>
  );
};

