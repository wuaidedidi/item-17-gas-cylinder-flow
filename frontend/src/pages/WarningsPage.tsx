import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Space, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { http, showSuccess } from '../api/http';
import { severityLabels, warningStatusLabels } from '../api/labels';
import { severityOptions, warningStatusOptions } from '../api/options';
import { EntityTag } from '../components/EntityTag';
import { PageHeader } from '../components/PageHeader';

export const WarningsPage = () => {
  const [queryForm] = Form.useForm();
  const [form] = Form.useForm();
  const [active, setActive] = useState<'warnings' | 'rules'>('warnings');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'warning' | 'handle' | 'rule' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [cylinders, setCylinders] = useState<any[]>([]);

  const loadCylinders = async () => {
    const data = await http.get<any, any>('/cylinders', { params: { page: 1, pageSize: 100 } });
    setCylinders(data.list);
  };

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const values = queryForm.getFieldsValue();
      const url = active === 'warnings' ? '/warnings' : '/warnings/rules/list';
      const data = await http.get<any, any>(url, { params: { ...values, page: nextPage, pageSize: nextPageSize } });
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

  const openModal = (type: 'warning' | 'handle' | 'rule', record?: any) => {
    setModalType(type);
    setEditing(record || null);
    form.resetFields();
    if (type === 'handle') {
      form.setFieldsValue({ status: 'CLOSED' });
    }
    if (type === 'rule' && record) {
      form.setFieldsValue(record);
    }
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (modalType === 'warning') {
      await http.post('/warnings', values);
      showSuccess('预警已创建');
    }
    if (modalType === 'handle') {
      await http.patch(`/warnings/${editing.id}/handle`, values);
      showSuccess('预警处理已留痕');
    }
    if (modalType === 'rule') {
      if (editing) {
        await http.patch(`/warnings/rules/${editing.id}`, values);
        showSuccess('预警规则已更新');
      } else {
        await http.post('/warnings/rules', values);
        showSuccess('预警规则已创建');
      }
    }
    setModalType(null);
    form.resetFields();
    await load(1, pageSize);
  };

  const deleteRule = (record: any) => {
    Modal.confirm({
      title: '确认删除该预警规则？',
      content: record.ruleName,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await http.delete(`/warnings/rules/${record.id}`);
        showSuccess('预警规则已删除');
        await load(1, pageSize);
      },
    });
  };

  const warningColumns: ColumnsType<any> = useMemo(
    () => [
      { title: '预警编号', dataIndex: 'warningNo', width: 180, fixed: 'left' },
      { title: '气瓶编码', dataIndex: ['cylinder', 'code'], width: 170, render: (v) => v || '-' },
      { title: '标题', dataIndex: 'title', width: 180, ellipsis: true },
      { title: '级别', dataIndex: 'severity', width: 90, render: (v) => <EntityTag value={v} labels={severityLabels} /> },
      { title: '状态', dataIndex: 'status', width: 110, render: (v) => <EntityTag value={v} labels={warningStatusLabels} /> },
      { title: '来源', dataIndex: 'source', width: 100 },
      { title: '发现时间', dataIndex: 'detectedAt', width: 170, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
      { title: '内容', dataIndex: 'content', ellipsis: true },
      {
        title: '操作',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Button icon={<CheckCircleOutlined />} disabled={record.status === 'CLOSED'} onClick={() => openModal('handle', record)}>
            处理
          </Button>
        ),
      },
    ],
    [],
  );

  const ruleColumns: ColumnsType<any> = useMemo(
    () => [
      { title: '规则名称', dataIndex: 'ruleName', width: 180, fixed: 'left' },
      { title: '规则类型', dataIndex: 'ruleType', width: 140 },
      { title: '阈值', dataIndex: 'thresholdValue', width: 90 },
      { title: '级别', dataIndex: 'severity', width: 90, render: (v) => <EntityTag value={v} labels={severityLabels} /> },
      { title: '启用', dataIndex: 'enabled', width: 90, render: (v) => (v ? '启用' : '停用') },
      { title: '已生成预警', dataIndex: ['_count', 'warnings'], width: 120 },
      { title: '说明', dataIndex: 'description', ellipsis: true },
      {
        title: '操作',
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space className="table-actions">
            <Button icon={<EditOutlined />} onClick={() => openModal('rule', record)}>编辑</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => deleteRule(record)}>删除</Button>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="风险预警管理"
        description="管理异常预警、处理意见和规则阈值，形成安全员处理闭环。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(active === 'warnings' ? 'warning' : 'rule')}>
            新增{active === 'warnings' ? '预警' : '规则'}
          </Button>
        }
      />
      <section className="content-panel">
        <Tabs
          activeKey={active}
          onChange={(key) => setActive(key as 'warnings' | 'rules')}
          items={[
            { key: 'warnings', label: '预警记录' },
            { key: 'rules', label: '预警规则' },
          ]}
        />
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => load(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="编号、标题、气瓶编码" allowClear />
          </Form.Item>
          <Form.Item name="severity">
            <Select placeholder="全部级别" allowClear options={severityOptions} className="filter-select" />
          </Form.Item>
          {active === 'warnings' ? (
            <Form.Item name="status">
              <Select placeholder="全部状态" allowClear options={warningStatusOptions} className="filter-select" />
            </Form.Item>
          ) : null}
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { queryForm.resetFields(); load(1, pageSize); }}>重置</Button>
          </Space>
        </Form>
        <Table
          rowKey="id"
          loading={loading}
          columns={active === 'warnings' ? warningColumns : ruleColumns}
          dataSource={items}
          scroll={{ x: active === 'warnings' ? 1320 : 1060 }}
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
        title={modalType === 'handle' ? '处理预警' : modalType === 'rule' ? (editing ? '编辑预警规则' : '新增预警规则') : '新增预警'}
        open={!!modalType}
        width={720}
        onCancel={() => setModalType(null)}
        onOk={submit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" requiredMark className="modal-grid-form">
          {modalType === 'warning' ? (
            <>
              <Form.Item name="cylinderId" label="关联气瓶">
                <Select allowClear showSearch placeholder="可选，选择关联气瓶" optionFilterProp="label" options={cylinders.map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` }))} />
              </Form.Item>
              <Form.Item name="severity" label="预警级别" rules={[{ required: true, message: '请选择预警级别' }]}>
                <Select options={severityOptions} />
              </Form.Item>
              <Form.Item name="title" label="预警标题" rules={[{ required: true, message: '请输入预警标题' }]} className="form-span-2">
                <Input placeholder="请输入预警标题" />
              </Form.Item>
              <Form.Item name="content" label="预警内容" rules={[{ required: true, message: '请输入预警内容' }]} className="form-span-2">
                <Input.TextArea rows={3} placeholder="请输入预警内容" />
              </Form.Item>
            </>
          ) : null}
          {modalType === 'handle' ? (
            <>
              <Form.Item name="status" label="处理状态" rules={[{ required: true, message: '请选择处理状态' }]}>
                <Select options={warningStatusOptions.filter((item) => item.value !== 'OPEN')} />
              </Form.Item>
              <Form.Item name="resolvedRemark" label="处理意见" className="form-span-2" rules={[{ required: true, message: '请输入处理意见' }]}>
                <Input.TextArea rows={4} placeholder="请输入处理意见" />
              </Form.Item>
            </>
          ) : null}
          {modalType === 'rule' ? (
            <>
              <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
                <Input placeholder="请输入规则名称" />
              </Form.Item>
              <Form.Item name="ruleType" label="规则类型" rules={[{ required: true, message: '请输入规则类型' }]}>
                <Input placeholder="如 inspection_due" />
              </Form.Item>
              <Form.Item name="thresholdValue" label="阈值" rules={[{ required: true, message: '请输入阈值' }]}>
                <Input type="number" min={1} placeholder="请输入阈值" />
              </Form.Item>
              <Form.Item name="severity" label="预警级别" rules={[{ required: true, message: '请选择预警级别' }]}>
                <Select options={severityOptions} />
              </Form.Item>
              <Form.Item name="enabled" label="启用状态" initialValue={true}>
                <Select options={[{ value: true, label: '启用' }, { value: false, label: '停用' }]} />
              </Form.Item>
              <Form.Item name="description" label="规则说明" className="form-span-2">
                <Input.TextArea rows={3} placeholder="请输入规则说明" />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};

