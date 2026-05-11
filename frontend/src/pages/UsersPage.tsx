import { EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { userStatusLabels, roleLabels } from '../api/labels';
import { roleOptions, userStatusOptions } from '../api/options';
import { http, showSuccess } from '../api/http';
import { EntityTag } from '../components/EntityTag';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../auth/AuthProvider';

export const UsersPage = () => {
  const { user } = useAuth();
  const [queryForm] = Form.useForm();
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const data = await http.get<any, any>('/users', {
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

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
  };

  const submit = async () => {
    const values = await form.validateFields();
    await http.patch(`/users/${editing.id}`, values);
    showSuccess('用户信息已更新');
    setEditing(null);
    await load(page, pageSize);
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: '用户名', dataIndex: 'username', width: 140, fixed: 'left' },
      { title: '姓名', dataIndex: 'name', width: 120 },
      { title: '角色', dataIndex: 'role', width: 130, render: (v) => <EntityTag value={v} labels={roleLabels} /> },
      { title: '状态', dataIndex: 'status', width: 100, render: (v) => <EntityTag value={v} labels={userStatusLabels} /> },
      { title: '手机号', dataIndex: 'phone', width: 140, render: (v) => v || '-' },
      { title: '邮箱', dataIndex: 'email', width: 180, render: (v) => v || '-' },
      { title: '创建时间', dataIndex: 'createdAt', width: 170, render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
      {
        title: '操作',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
        ),
      },
    ],
    [],
  );

  const isSelf = editing?.id === user?.id;

  return (
    <div className="page-stack">
      <PageHeader title="用户管理" description="管理员统一维护账号状态和角色权限，角色为单选配置。" />
      <section className="content-panel">
        <Form form={queryForm} className="toolbar-form" layout="inline" onFinish={() => load(1, pageSize)}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="用户名、姓名、手机号" allowClear />
          </Form.Item>
          <Form.Item name="role">
            <Select placeholder="全部角色" allowClear options={roleOptions} className="filter-select" />
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
          scroll={{ x: 1080 }}
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
      <Modal title="编辑用户" open={!!editing} width={680} onCancel={() => setEditing(null)} onOk={submit} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" requiredMark className="modal-grid-form">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roleOptions} disabled={isSelf} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={userStatusOptions} disabled={isSelf} />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }]}>
            <Input placeholder="可选，填写时需为 11 位手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="可选，填写时需为正确邮箱" />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="form-span-2">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

