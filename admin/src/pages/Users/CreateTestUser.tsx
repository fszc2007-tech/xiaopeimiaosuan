/**
 * 创建测试用户页面
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createTestUser } from '../../services/userService';
import type { CreateTestUserRequest } from '../../types';

export default function CreateTestUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: CreateTestUserRequest) => {
    setLoading(true);
    try {
      const user = await createTestUser(values);
      message.success('测试用户创建成功！');
      form.resetFields();
      // 可选：导航到用户详情
      navigate(`/users/${user.userId}`);
    } catch (error: any) {
      message.error(error.message || '创建测试用户失败');
    } finally {
      setLoading(false);
    }
  };

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

      <Card title="创建测试用户">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ appRegion: 'CN' }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="手机号"
            name="phone"
            tooltip="测试阶段可不填"
          >
            <Input placeholder="请输入手机号（可选）" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            tooltip="测试阶段可不填"
          >
            <Input placeholder="请输入邮箱（可选）" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不少于6位' },
            ]}
          >
            <Input.Password placeholder="请输入密码（至少6位）" />
          </Form.Item>

          <Form.Item
            label="地区"
            name="appRegion"
            rules={[{ required: true, message: '请选择地区' }]}
          >
            <Select
              options={[
                { label: '中国大陆 (CN)', value: 'CN' },
                { label: '香港 (HK)', value: 'HK' },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

