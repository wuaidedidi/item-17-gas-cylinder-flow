import { ArrowDownOutlined, ArrowUpOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select, Space, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { http, showSuccess } from '../api/http';
import { recordStatusLabels } from '../api/labels';
import { recordStatusOptions } from '../api/options';
import { EntityTag } from '../components/EntityTag';
import { PageHeader } from '../components/PageHeader';
import { cleanPayload } from '../utils/form';

export const FlowPage = () => {
  const [queryForm] = Form.useForm();
  const [form] = Form.useForm();
  const [active, setActive] = useState<'inbound' | 'outbound'>('inbound');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cylinders, setCylinders] = useState<any[]>([]);

  const loadCylinders = async () => {
    const data = await http.get<any, any>('/cylinders', { params: { page: 1, pageSize: 100 } });
    setCylinders(data.list);
  };

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const values = queryForm.getFieldsValue();
      const data = await http.get<any, any>(`/records/${active}`, {
        params: { ...values, page: nextPage, pageSize: nextPageSize },
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
    loadCylinders();
  }, []);

  useEffect(() => {
    queryForm.resetFields();
    load(1, pageSize);
  }, [active]);

  const submit = async () => {
    const values = await form.validateFields();
    await http.post(`/records/${active}`, cleanPayload(values));
    showSuccess(active === 'inbound' ? '入库记录已创建' : '出库记录已创建');
    setModalOpen(false);
    form.resetFields();
    await load(1, pageSize);
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: '记录编号', dataIndex: 'recordNo', width: 180, fixed: 'left' },
      { title: '气瓶编码', dataIndex: ['cylinder', 'code'], width: 180 },
      { title: '气瓶名称', dataIndex: ['cylinder', 'name'], width: 140 },
      {
        title: active === 'inbound' ? '入库时间' : '出库时间',
        dataIndex: active === 'inbound' ? 'inboundAt' : 'outboundAt',
        width: 170,
        render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
      },
      { title: active === 'inbound' ? '来源地点' : '目标地点', dataIndex: active === 'inbound' ? 'sourceLocation' : 'targetLocation', width: 150, ellipsis: true },
      { title: '经办人', dataIndex: 'handlerName', width: 120 },
      { title: '状态', dataIndex: 'status', width: 120, render: (v) => <EntityTag value={v} labels={recordStatusLabels} /> },
      { title: '备注', dataIndex: 'remark', ellipsis: true },
    ],
    [active],
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="出入库流转管理"
        description="记录气瓶从仓库到使用现场的流转过程，并同步更新责任方和当前状态。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新增{active === 'inbound' ? '入库' : '出库'}
          </Button>
        }
      />
      <section className="content-panel">
        <Tabs
          activeKey={active}
          onChange={(key) => setActive(key as 'inbound' | 'outbound')}
          items={[
            { key: 'inbound', label: <span><ArrowDownOutlined /> 入库记录</span> },
            { key: 'outbound', label: <span><ArrowUpOutlined /> 出库记录</span> },
          ]}
        />
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => load(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="记录编号、气瓶编码" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="全部状态" allowClear options={recordStatusOptions} className="filter-select" />
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
          scroll={{ x: 1120 }}
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

      <Modal
        title={active === 'inbound' ? '新增入库记录' : '新增出库记录'}
        open={modalOpen}
        width={720}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" requiredMark className="modal-grid-form">
          <Form.Item name="cylinderId" label="气瓶" rules={[{ required: true, message: '请选择气瓶' }]}>
            <Select
              showSearch
              placeholder="请选择气瓶"
              optionFilterProp="label"
              options={cylinders.map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` }))}
            />
          </Form.Item>
          <Form.Item
            name={active === 'inbound' ? 'inboundAt' : 'outboundAt'}
            label={active === 'inbound' ? '入库时间' : '出库时间'}
            rules={[{ required: true, message: active === 'inbound' ? '请选择入库时间' : '请选择出库时间' }]}
          >
            <DatePicker showTime className="full-control" />
          </Form.Item>
          {active === 'inbound' ? (
            <>
              <Form.Item name="sourceLocation" label="来源地点"><Input placeholder="请输入来源地点" /></Form.Item>
              <Form.Item name="destinationLocation" label="目标库位"><Input placeholder="请输入目标库位" /></Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="targetLocation" label="目标地点"><Input placeholder="请输入目标地点" /></Form.Item>
              <Form.Item name="purpose" label="用途"><Input placeholder="请输入用途" /></Form.Item>
            </>
          )}
          <Form.Item name="handlerName" label="经办人" rules={[{ required: true, message: '请输入经办人' }]}>
            <Input placeholder="请输入经办人" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="COMPLETED">
            <Select options={recordStatusOptions} />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="form-span-2">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

