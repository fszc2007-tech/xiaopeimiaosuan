/**
 * 用户列表页面（紧凑版）
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  message,
  Card,
  Tooltip,
} from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
      dataIndex: 'userId',
      key: 'userId',
      width: 220,
      ellipsis: true,
      render: (userId) => (
        <Tooltip title="点击查看详情">
          <a onClick={() => navigate(`/users/${userId}`)} style={{ fontSize: 12 }}>{userId}</a>
        </Tooltip>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone) => <span style={{ fontSize: 12 }}>{phone || '-'}</span>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
      render: (email) => <span style={{ fontSize: 12 }}>{email || '-'}</span>,
    },
    {
      title: '地区',
      dataIndex: 'appRegion',
      key: 'appRegion',
      width: 70,
      render: (region) => {
        const isCN = region?.toUpperCase() === 'CN';
        return (
          <Tag color={isCN ? 'blue' : 'purple'} style={{ fontSize: 11 }}>
            {isCN ? '大陆' : '香港'}
          </Tag>
        );
      },
    },
    {
      title: 'Pro 状态',
      dataIndex: 'isPro',
      key: 'isPro',
      width: 80,
      render: (isPro) => (
        <Tag color={isPro ? 'gold' : 'default'} style={{ fontSize: 11 }}>
          {isPro ? 'Pro' : '普通'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/users/${record.userId}`)}
          style={{ padding: 0, height: 'auto', fontSize: 12 }}
        >
          详情
        </Button>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters({...filters, search: value, page: 1});
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters({...filters, page, pageSize});
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <Card 
        title={<span style={{ fontSize: 14 }}>用户列表</span>} 
        style={{ marginBottom: 12 }}
        size="small"
      >
        <Space style={{ marginBottom: 10 }} wrap>
          <Search
            placeholder="搜索手机号/邮箱"
            style={{ width: 200 }}
            size="small"
            onSearch={handleSearch}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => navigate('/users/test')}
          >
            创建测试用户
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => <span style={{ fontSize: 12 }}>共 {total} 条</span>,
            onChange: handlePageChange,
            size: 'small',
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </Card>
    </div>
  );
}
