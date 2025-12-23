/**
 * LLM 配置卡片组件
 */

import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Tag,
  message,
  Divider,
} from 'antd';
import { ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { LLMConfig } from '../../types';

interface LLMCardProps {
  config: LLMConfig;
  onUpdate: () => void;
}

export default function LLMCard({ config, onUpdate }: LLMCardProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // 获取模型显示名称
  const getDisplayName = () => {
    switch (config.provider) {
      case 'deepseek':
        return 'DeepSeek';
      case 'chatgpt':
        return 'ChatGPT';
      case 'qwen':
        return 'Qwen（通义千问）';
      default:
        return config.provider;
    }
  };

  // 获取标签颜色
  const getTagColor = () => {
    if (!config.enabled) return 'default';
    return config.hasApiKey ? 'success' : 'warning';
  };

  // 获取状态文本
  const getStatusText = () => {
    if (!config.enabled) return '已禁用';
    return config.hasApiKey ? '已配置' : '未配置';
  };

  // 保存配置（由父组件实现）
  const handleSave = () => {
    form.validateFields().then((values) => {
      // 由父组件处理保存逻辑
      message.info('保存功能请在父组件实现');
    });
  };

  // 测试连接（由父组件实现）
  const handleTest = () => {
    message.info('测试功能请在父组件实现');
  };

  return (
    <Card
      title={
        <Space>
          <ApiOutlined />
          {getDisplayName()}
          <Tag color={getTagColor()}>{getStatusText()}</Tag>
        </Space>
      }
      extra={
        config.updatedAt && (
          <span style={{ fontSize: 12, color: '#999' }}>
            更新于：{new Date(config.updatedAt).toLocaleString('zh-CN')}
          </span>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enabled: config.enabled,
          apiKey: '',
          thinkingMode: config.config?.thinkingMode || false,
        }}
      >
        <Form.Item label="启用状态" name="enabled" valuePropName="checked">
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            disabled={!config.hasApiKey && !form.getFieldValue('apiKey')}
          />
        </Form.Item>

        <Form.Item
          label="API Key"
          name="apiKey"
          extra={
            config.hasApiKey && config.apiKeyMasked
              ? `当前: ${config.apiKeyMasked}`
              : '首次配置或更新 API Key'
          }
        >
          <Input.Password
            placeholder="请输入 API Key"
            autoComplete="new-password"
          />
        </Form.Item>

        {/* DeepSeek 专用：思考模式 */}
        {config.provider === 'deepseek' && (
          <Form.Item
            label="思考模式"
            name="thinkingMode"
            valuePropName="checked"
            tooltip="启用后将使用 DeepSeek 的思考模式（Thinking Mode）"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        )}

        <Divider />

        <Space>
          <Button type="primary" onClick={handleSave} loading={saving}>
            保存配置
          </Button>
          <Button onClick={handleTest} loading={testing} disabled={!config.hasApiKey}>
            测试连接
          </Button>
        </Space>
      </Form>
    </Card>
  );
}

