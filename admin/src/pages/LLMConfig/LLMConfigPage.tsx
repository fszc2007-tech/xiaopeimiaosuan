/**
 * LLM 配置页面
 */

import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Tag,
  message,
  Divider,
  Spin,
} from 'antd';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  getAllLLMConfigs,
  updateLLMConfig,
  testLLMConnection,
} from '../../services/llmService';
import type { LLMConfig } from '../../types';

export default function LLMConfigPage() {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // 获取所有配置
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const result = await getAllLLMConfigs();
      setConfigs(result);
    } catch (error: any) {
      message.error(error.message || '获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 获取模型显示名称
  const getDisplayName = (provider: string) => {
    switch (provider) {
      case 'deepseek':
        return 'DeepSeek';
      case 'chatgpt':
        return 'ChatGPT';
      case 'qwen':
        return 'Qwen（通义千问）';
      default:
        return provider;
    }
  };

  // 保存配置
  const handleSave = async (config: LLMConfig, values: any) => {
    setSavingProvider(config.provider);
    try {
      // 提取字段名（去掉 provider 前缀）
      const fieldPrefix = `${config.provider}_`;
      const updateData: any = {
        isEnabled: values[`${fieldPrefix}enabled`] !== undefined ? values[`${fieldPrefix}enabled`] : values.enabled,
        temperature: values[`${fieldPrefix}temperature`] !== undefined ? values[`${fieldPrefix}temperature`] : values.temperature,
        maxTokens: values[`${fieldPrefix}maxTokens`] !== undefined ? values[`${fieldPrefix}maxTokens`] : values.maxTokens,
      };

      // 如果有新的 API Key，则更新
      const apiKeyValue = values[`${fieldPrefix}apiKey`] || values.apiKey;
      if (apiKeyValue) {
        updateData.apiKey = apiKeyValue;
      }

      // DeepSeek 专用配置
      if (config.provider === 'deepseek') {
        const thinkingValue = values[`${fieldPrefix}thinkingMode`] !== undefined 
          ? values[`${fieldPrefix}thinkingMode`] 
          : values.thinkingMode;
        updateData.enableThinking = thinkingValue;
      }

      await updateLLMConfig(config.provider as any, updateData);
      message.success(`${getDisplayName(config.provider)} 配置已更新！`);
      fetchConfigs(); // 重新获取配置
    } catch (error: any) {
      message.error(error.message || '保存配置失败');
    } finally {
      setSavingProvider(null);
    }
  };

  // 测试连接
  const handleTest = async (config: LLMConfig) => {
    if (!config.hasApiKey) {
      message.warning('请先配置 API Key');
      return;
    }

    setTestingProvider(config.provider);
    try {
      const result = await testLLMConnection(config.provider as any);
      if (result.status === 'success') {
        message.success(
          `${getDisplayName(config.provider)} 连接成功！延迟: ${result.responseTime}ms`
        );
      } else {
        message.error(`${getDisplayName(config.provider)} 连接失败: ${result.message}`);
      }
    } catch (error: any) {
      message.error(error.message || '测试连接失败');
    } finally {
      setTestingProvider(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      <Card title="LLM 模型配置" style={{ marginBottom: 16 }}>
        <p style={{ color: '#666', marginBottom: 0 }}>
          配置小佩 App 使用的大语言模型（LLM）。支持 DeepSeek、ChatGPT、Qwen 三个模型。
        </p>
      </Card>

      <Row gutter={[16, 16]}>
        {configs && configs.length > 0 ? configs.map((config) => (
          <Col key={config.provider} xs={24} lg={12} xl={8}>
            <Card
              title={
                <Space>
                  <ApiOutlined />
                  {getDisplayName(config.provider)}
                  {config.isEnabled ? (
                    config.hasApiKey ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        已启用
                      </Tag>
                    ) : (
                      <Tag color="warning">未配置 API Key</Tag>
                    )
                  ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>
                      未启用
                    </Tag>
                  )}
                </Space>
              }
              extra={
                config.updatedAt && (
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {new Date(config.updatedAt).toLocaleString('zh-CN')}
                  </span>
                )
              }
            >
              <Form
                layout="vertical"
                initialValues={{
                  [`${config.provider}_enabled`]: config.isEnabled,
                  [`${config.provider}_apiKey`]: '',
                  [`${config.provider}_thinkingMode`]: config.enableThinking || false,
                  [`${config.provider}_temperature`]: config.temperature || 0.7,
                  [`${config.provider}_maxTokens`]: config.maxTokens || 2000,
                }}
                onFinish={(values) => handleSave(config, values)}
              >
                <Form.Item
                  label="启用状态"
                  name={`${config.provider}_enabled`}
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="启用" 
                    unCheckedChildren="禁用" 
                  />
                </Form.Item>

                <Form.Item
                  label="API Key"
                  name={`${config.provider}_apiKey`}
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

                {/* 温度参数 */}
                <Form.Item
                  label="温度 (Temperature)"
                  name={`${config.provider}_temperature`}
                  extra="控制输出随机性，0-1 之间，值越高越随机"
                  rules={[
                    { required: true, message: '请输入温度值' },
                    { type: 'number', min: 0, max: 1, message: '温度值必须在 0-1 之间' }
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={1}
                    step={0.1}
                    style={{ width: '100%' }}
                    placeholder="0.7"
                  />
                </Form.Item>

                {/* Token 长度 */}
                <Form.Item
                  label="最大 Token 长度"
                  name={`${config.provider}_maxTokens`}
                  extra="单次响应的最大 token 数量"
                  rules={[
                    { required: true, message: '请输入最大 Token 长度' },
                    { type: 'number', min: 1, max: 32000, message: 'Token 长度必须在 1-32000 之间' }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={32000}
                    step={100}
                    style={{ width: '100%' }}
                    placeholder="2000"
                  />
                </Form.Item>

                {/* DeepSeek 专用：思考模式 */}
                {config.provider === 'deepseek' && (
                  <Form.Item
                    label="思考模式"
                    name={`${config.provider}_thinkingMode`}
                    valuePropName="checked"
                    tooltip="启用后将使用 DeepSeek 的 Thinking Mode"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                )}

                <Divider />

                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={savingProvider === config.provider}
                  >
                    保存配置
                  </Button>
                  <Button
                    onClick={() => handleTest(config)}
                    loading={testingProvider === config.provider}
                    disabled={!config.hasApiKey}
                  >
                    测试连接
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
        )) : (
          <Col span={24}>
            <Card>
              <p style={{ textAlign: 'center', color: '#999' }}>暂无配置</p>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

