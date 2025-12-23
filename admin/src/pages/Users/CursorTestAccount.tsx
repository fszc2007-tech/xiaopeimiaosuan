/**
 * Cursor 测试账号页面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getCursorTestAccount,
  resetCursorPassword,
} from '../../services/userService';
import type { CursorTestAccount as CursorTestAccountType } from '../../types';

export default function CursorTestAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<CursorTestAccountType | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form] = Form.useForm();

  // 获取测试账号
  const fetchAccount = async () => {
    setLoading(true);
    try {
      const result = await getCursorTestAccount();
      setAccount(result);
    } catch (error: any) {
      message.error(error.message || '获取测试账号失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} 已复制！`);
  };

  // 重置密码
  const handleResetPassword = async (values: { password: string }) => {
    setResetting(true);
    try {
      await resetCursorPassword(values.password);
      message.success('密码重置成功！');
      setResetModalOpen(false);
      form.resetFields();
      fetchAccount(); // 重新获取账号信息
    } catch (error: any) {
      message.error(error.message || '密码重置失败');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!account) {
    return (
      <Card title="Cursor 测试账号">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>未找到测试账号</p>
          <Button onClick={fetchAccount}>重新加载</Button>
        </div>
      </Card>
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

      <Card
        title="Cursor 测试账号"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setResetModalOpen(true)}
          >
            重置密码
          </Button>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="用户 ID">
            <Space>
              <span>{account.userId}</span>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(account.userId, '用户 ID')}
              >
                复制
              </Button>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="手机号">
            <Space>
              <span>{account.phone}</span>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(account.phone, '手机号')}
              >
                复制
              </Button>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="邮箱">
            <Space>
              <span>{account.email}</span>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(account.email, '邮箱')}
              >
                复制
              </Button>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="密码">
            <Space>
              <span style={{ fontFamily: 'monospace' }}>
                {account.password}
              </span>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(account.password, '密码')}
              >
                复制
              </Button>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="地区">
            <Tag color={account.appRegion === 'CN' ? 'blue' : 'purple'}>
              {account.appRegion === 'CN' ? '中国大陆' : '香港'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            {new Date(account.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <h4>使用说明</h4>
          <ul>
            <li>此账号用于 Cursor AI 开发时的功能测试</li>
            <li>开发环境密码固定，生产环境随机生成</li>
            <li>可通过"重置密码"按钮更新密码</li>
          </ul>
        </div>
      </Card>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置 Cursor 测试账号密码"
        open={resetModalOpen}
        onCancel={() => {
          setResetModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不少于6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={resetting}>
                确认重置
              </Button>
              <Button
                onClick={() => {
                  setResetModalOpen(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

