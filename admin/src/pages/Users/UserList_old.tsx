/**
 * 用户列表页面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Card,
  Tooltip,
} from 'antd';
import type { TableProps } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { getUserList } from '../../services/userService';
import type { User, UserListParams } from '../../types';

const { Search } = Input;

export default function UserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    pageSize: 20,
  });

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUserList(filters);
      setUsers(result.users);
      setPagination({
        current: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      });
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // 表格列配置
  const columns: TableProps<User>['columns'] = [
    {
      title: '用户 ID',
      dataIndex: 'id',
      key: 'id',
      width: 280,
      render: (id) => (
        <Tooltip title="点击查看详情">
          <a onClick={() => navigate(`/users/${id}`)}>{id}</a>
        </Tooltip>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => phone || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) => email || '-',
    },
    {
      title: '地区',
      dataIndex: 'appRegion',
      key: 'appRegion',
      width: 80,
      filters: [
        { text: '中国大陆', value: 'CN' },
        { text: '香港', value: 'HK' },
      ],
      render: (region) => (
        <Tag color={region === 'CN' ? 'blue' : 'purple'}>
          {region === 'CN' ? '大陆' : '香港'}
        </Tag>
      ),
    },
    {
      title: 'Pro 状态',
      dataIndex: 'isPro',
      key: 'isPro',
      width: 100,
      filters: [
        { text: 'Pro 用户', value: true },
        { text: '普通用户', value: false },
      ],
      render: (isPro) => (
        <Tag color={isPro ? 'gold' : 'default'}>
          {isPro ? 'Pro' : '普通'}
        </Tag>
      ),
    },
    {
      title: 'Pro 到期时间',
      dataIndex: 'proExpiresAt',
      key: 'proExpiresAt',
      width: 180,
      render: (expiresAt, record) => {
        if (!record.isPro) return '-';
        if (record.proPlan === 'lifetime') return <Tag color="red">永久</Tag>;
        return expiresAt ? new Date(expiresAt).toLocaleString('zh-CN') : '-';
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => new Date(createdAt).toLocaleString('zh-CN'),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (lastLoginAt) =>
        lastLoginAt ? new Date(lastLoginAt).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/users/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/users/create')}
            >
              创建测试用户
            </Button>
            <Button
              icon={<UserOutlined />}
              onClick={() => navigate('/users/cursor-test')}
            >
              Cursor 测试账号
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索手机号或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={(value) =>
              setFilters({ ...filters, search: value, page: 1 })
            }
          />
          <Select
            placeholder="Pro 状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) =>
              setFilters({ ...filters, isPro: value, page: 1 })
            }
            options={[
              { label: 'Pro 用户', value: true },
              { label: '普通用户', value: false },
            ]}
          />
          <Select
            placeholder="地区"
            allowClear
            style={{ width: 120 }}
            onChange={(value) =>
              setFilters({ ...filters, appRegion: value, page: 1 })
            }
            options={[
              { label: '中国大陆', value: 'CN' },
              { label: '香港', value: 'HK' },
            ]}
          />
        </Space>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, pageSize });
            },
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
}

