/**
 * 會員管理 - 用戶列表頁面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Input,
  Space,
  Tag,
  message,
  Card,
  Tooltip,
  Select,
} from 'antd';
import type { TableProps } from 'antd';
import { getMembershipUserList } from '../../services/membershipService';
import type { MembershipUserListItem, MembershipUserListParams } from '../../types';

const { Search } = Input;
const { Option } = Select;

// 格式化會員方案顯示
function formatProPlan(plan?: string): string {
  if (!plan) return '免費用戶';
  const planMap: Record<string, string> = {
    monthly: '月付',
    quarterly: '季付',
    yearly: '年付',
    lifetime: '終身',
  };
  return `小佩會員（${planMap[plan] || plan}）`;
}

// 檢查會員是否過期
function isProExpired(proExpiresAt?: string): boolean {
  if (!proExpiresAt) return false;
  return new Date(proExpiresAt) < new Date();
}

export default function MembershipUserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MembershipUserListItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<MembershipUserListParams>({
    page: 1,
    pageSize: 20,
  });

  // 獲取用戶列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getMembershipUserList(filters);
      setItems(result.items);
      setPagination({
        current: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      });
    } catch (error: any) {
      message.error(error.message || '獲取用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // 表格列配置
  const columns: TableProps<MembershipUserListItem>['columns'] = [
    {
      title: '用戶 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 220,
      ellipsis: true,
      render: (userId) => (
        <Tooltip title="點擊查看詳情">
          <a
            onClick={() => navigate(`/membership/users/${userId}`)}
            style={{ fontSize: 12 }}
          >
            {userId}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '手機',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => <span style={{ fontSize: 12 }}>{phone || '-'}</span>,
    },
    {
      title: '註冊時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => (
        <span style={{ fontSize: 12 }}>
          {new Date(createdAt).toLocaleString('zh-TW')}
        </span>
      ),
    },
    {
      title: '會員狀態',
      dataIndex: 'proPlan',
      key: 'proPlan',
      width: 150,
      render: (proPlan, record) => {
        const isExpired = record.isPro && isProExpired(record.proExpiresAt);
        const statusText = formatProPlan(proPlan);
        return (
          <Tag
            color={record.isPro && !isExpired ? 'gold' : 'default'}
            style={{ fontSize: 11 }}
          >
            {isExpired ? `${statusText} (已過期)` : statusText}
          </Tag>
        );
      },
    },
    {
      title: '會員到期時間',
      dataIndex: 'proExpiresAt',
      key: 'proExpiresAt',
      width: 180,
      render: (proExpiresAt) => (
        <span style={{ fontSize: 12 }}>
          {proExpiresAt
            ? new Date(proExpiresAt).toLocaleString('zh-TW')
            : '-'}
        </span>
      ),
    },
    {
      title: '今日 AI 解讀',
      key: 'aiUsage',
      width: 120,
      render: (_, record) => {
        const { aiCallsToday, aiDailyLimit } = record;
        const percentage = (aiCallsToday / aiDailyLimit) * 100;
        const isHigh = percentage >= 80;
        const isFull = percentage >= 100;
        return (
          <span
            style={{
              fontSize: 12,
              color: isFull ? 'red' : isHigh ? 'orange' : 'inherit',
            }}
          >
            {aiCallsToday} / {aiDailyLimit}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <a
          onClick={() => navigate(`/membership/users/${record.userId}`)}
          style={{ fontSize: 12 }}
        >
          查看詳情
        </a>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters({ ...filters, q: value, page: 1 });
  };

  const handleProFilter = (value: string) => {
    const isPro = value === 'all' ? undefined : value === 'pro';
    setFilters({ ...filters, isPro, page: 1 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters({ ...filters, page, pageSize });
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <Card
        title={<span style={{ fontSize: 14 }}>會員管理 - 用戶列表</span>}
        style={{ marginBottom: 12 }}
        size="small"
      >
        <Space style={{ marginBottom: 10 }} wrap>
          <Search
            placeholder="搜尋手機號或用戶 ID"
            style={{ width: 250 }}
            size="small"
            onSearch={handleSearch}
            allowClear
          />
          <Select
            placeholder="會員狀態"
            style={{ width: 150 }}
            size="small"
            defaultValue="all"
            onChange={handleProFilter}
          >
            <Option value="all">全部</Option>
            <Option value="free">只看免費用戶</Option>
            <Option value="pro">只看會員用戶</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          rowKey="userId"
          loading={loading}
          size="small"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => (
              <span style={{ fontSize: 12 }}>共 {total} 條</span>
            ),
            onChange: handlePageChange,
            size: 'small',
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </Card>
    </div>
  );
}


