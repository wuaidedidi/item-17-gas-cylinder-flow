import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Descriptions, Drawer, Form, Input, Modal, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { http, showSuccess } from '../api/http';
import { cylinderStatusLabels } from '../api/labels';
import { cylinderStatusOptions } from '../api/options';
import { EntityTag } from '../components/EntityTag';
import { PageHeader } from '../components/PageHeader';
import { cleanPayload } from '../utils/form';

export const CylindersPage = () => {
  const [form] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const values = queryForm.getFieldsValue();
      const data = await http.get<any, any>('/cylinders', {
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
    load(1, pageSize);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'IN_STOCK' });
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      lastInspectionAt: record.lastInspectionAt ? dayjs(record.lastInspectionAt) : undefined,
      nextInspectionAt: record.nextInspectionAt ? dayjs(record.nextInspectionAt) : undefined,
      nextMaintenanceAt: record.nextMaintenanceAt ? dayjs(record.nextMaintenanceAt) : undefined,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = cleanPayload(values);
    if (editing) {
      await http.patch(`/cylinders/${editing.id}`, payload);
      showSuccess('气瓶档案已更新');
    } else {
      await http.post('/cylinders', payload);
      showSuccess('气瓶档案已创建');
    }
    setModalOpen(false);
    await load(1, pageSize);
  };

  const remove = (record: any) => {
    Modal.confirm({
      title: '确认删除该气瓶档案？',
      content: `气瓶编码：${record.code}`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await http.delete(`/cylinders/${record.id}`);
        showSuccess('气瓶档案已删除');
        await load(1, pageSize);
      },
    });
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: '气瓶编码', dataIndex: 'code', width: 180, fixed: 'left' },
      { title: '名称', dataIndex: 'name', width: 140 },
      { title: '气体类型', dataIndex: 'gasType', width: 110 },
      { title: '容量', dataIndex: 'capacity', width: 90 },
      { title: '压力等级', dataIndex: 'pressureLevel', width: 110 },
      { title: '库位', dataIndex: 'warehouseLocation', width: 150, ellipsis: true },
      { title: '责任方', dataIndex: 'currentHolder', width: 140, ellipsis: true },
      { title: '状态', dataIndex: 'status', width: 120, render: (v) => <EntityTag value={v} labels={cylinderStatusLabels} /> },
      { title: '下次巡检', dataIndex: 'nextInspectionAt', width: 130, render: (v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-') },
      {
        title: '操作',
        key: 'actions',
        width: 230,
        fixed: 'right',
        render: (_, record) => (
          <Space className="table-actions">
            <Button icon={<EyeOutlined />} onClick={async () => setDetail(await http.get(`/cylinders/${record.id}`))}>
              详情
            </Button>
            <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => remove(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [pageSize],
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="气瓶档案管理"
        description="统一维护气瓶编码、规格、库位、责任方和有效期信息。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            编码建档
          </Button>
        }
      />

      <section className="content-panel">
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => load(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="编码、名称、气体类型" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="全部状态" allowClear options={cylinderStatusOptions} className="filter-select" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                queryForm.resetFields();
                load(1, pageSize);
              }}
            >
              重置
            </Button>
          </Space>
        </Form>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          scroll={{ x: 1320 }}
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
        title={editing ? '编辑气瓶档案' : '气瓶编码建档'}
        open={modalOpen}
        width={820}
        onCancel={() => setModalOpen(false)}
        onOk={submit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" requiredMark className="modal-grid-form">
          <Form.Item name="code" label="气瓶编码" rules={[{ required: true, message: '请输入气瓶编码' }]}>
            <Input placeholder="如 CYL-20260509-001" />
          </Form.Item>
          <Form.Item name="name" label="气瓶名称" rules={[{ required: true, message: '请输入气瓶名称' }]}>
            <Input placeholder="如 氧气气瓶" />
          </Form.Item>
          <Form.Item name="type" label="气瓶类型">
            <Input placeholder="如 钢瓶" />
          </Form.Item>
          <Form.Item name="gasType" label="气体类型">
            <Input placeholder="如 氧气、氮气" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <Input placeholder="如 40L" />
          </Form.Item>
          <Form.Item name="pressureLevel" label="压力等级">
            <Input placeholder="如 15MPa" />
          </Form.Item>
          <Form.Item name="manufacturer" label="制造商">
            <Input placeholder="请输入制造商" />
          </Form.Item>
          <Form.Item name="serialNo" label="出厂编号">
            <Input placeholder="请输入出厂编号" />
          </Form.Item>
          <Form.Item name="warehouseLocation" label="库位">
            <Input placeholder="如 A区-01排-03位" />
          </Form.Item>
          <Form.Item name="currentHolder" label="当前责任方">
            <Input placeholder="如 仓库待发、车间一线" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={cylinderStatusOptions} />
          </Form.Item>
          <Form.Item name="lastInspectionAt" label="上次巡检">
            <DatePicker className="full-control" />
          </Form.Item>
          <Form.Item name="nextInspectionAt" label="下次巡检">
            <DatePicker className="full-control" />
          </Form.Item>
          <Form.Item name="nextMaintenanceAt" label="下次保养">
            <DatePicker className="full-control" />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="form-span-2">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        width={620}
        title="气瓶档案详情"
        open={!!detail}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <Space direction="vertical" size={18} className="drawer-stack">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="气瓶编码">{detail.code}</Descriptions.Item>
              <Descriptions.Item label="名称">{detail.name}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <EntityTag value={detail.status} labels={cylinderStatusLabels} />
              </Descriptions.Item>
              <Descriptions.Item label="库位">{detail.warehouseLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="责任方">{detail.currentHolder || '-'}</Descriptions.Item>
              <Descriptions.Item label="制造商">{detail.manufacturer || '-'}</Descriptions.Item>
              <Descriptions.Item label="出厂编号">{detail.serialNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <div>
              <Typography.Title level={5}>最近生命周期记录</Typography.Title>
              <div className="mini-timeline">
                {[...(detail.inboundRecords || []), ...(detail.outboundRecords || []), ...(detail.inspectionRecords || []), ...(detail.maintenanceRecords || []), ...(detail.warnings || [])].slice(0, 8).map((item: any) => (
                  <div key={`${item.recordNo || item.warningNo}-${item.id}`}>
                    <strong>{item.recordNo || item.warningNo}</strong>
                    <span>{item.remark || item.result || item.title || item.content || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
};

