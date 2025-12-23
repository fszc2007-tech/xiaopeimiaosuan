/**
 * 用户详情页面
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Tabs,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getUserDetail } from '../../services/userService';
import type { User } from '../../types';

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 获取用户详情
  const fetchUserDetail = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await getUserDetail(userId);
      setUser(result);
    } catch (error: any) {
      message.error(error.message || '获取用户详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Space direction="vertical" size="large">
          <div style={{ fontSize: 16, color: '#999' }}>用户不存在或已被删除</div>
          <Button type="primary" onClick={() => navigate('/users')}>
            返回用户列表
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/users')}
        >
          返回列表
        </Button>
      </Space>

      <Card title="用户详情">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户 ID" span={2}>
            {user.userId}
          </Descriptions.Item>

          <Descriptions.Item label="手机号">
            {user.phone || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="邮箱">
            {user.email || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="地区">
            <Tag color={user.appRegion?.toUpperCase() === 'CN' ? 'blue' : 'purple'}>
              {user.appRegion?.toUpperCase() === 'CN' ? '中国大陆' : '香港'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Pro 状态">
            <Tag color={user.isPro ? 'gold' : 'default'}>
              {user.isPro ? 'Pro 用户' : '普通用户'}
            </Tag>
          </Descriptions.Item>

          {user.isPro && (
            <>
              <Descriptions.Item label="Pro 套餐">
                {user.proPlan === 'lifetime' ? (
                  <Tag color="red">永久会员</Tag>
                ) : user.proPlan === 'yearly' ? (
                  <Tag color="orange">年度会员</Tag>
                ) : user.proPlan === 'monthly' ? (
                  <Tag color="green">月度会员</Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Pro 到期时间">
                {user.proPlan === 'lifetime'
                  ? '永久有效'
                  : user.proExpiresAt
                  ? new Date(user.proExpiresAt).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="注册时间">
            {new Date(user.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>

          <Descriptions.Item label="最后登录">
            {user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
              : '未登录'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 扩展区域：可添加命盘档案、对话记录等 */}
      <Card title="相关数据" style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'charts',
              label: '命盘档案',
              children: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>开发中...</div>,
            },
            {
              key: 'chats',
              label: '对话记录',
              children: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>开发中...</div>,
            },
            {
              key: 'subscriptions',
              label: '订阅记录',
              children: <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>开发中...</div>,
            },
          ]}
        />
      </Card>
    </div>
  );
}

