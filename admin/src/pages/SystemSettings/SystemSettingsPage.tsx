/**
 * 系统设置页面
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  InputNumber,
  Button,
  Space,
  Divider,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import {
  getSystemSettings,
  updateRateLimit,
  updateProFeatureGate,
  updateRateLimitConfig,
} from '../../services/systemService';
import type { SystemSettings } from '../../types';

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [form] = Form.useForm();

  // 获取系统配置
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getSystemSettings();
      setSettings(result);

      // 设置表单初始值
      form.setFieldsValue({
        // 限流开关
        rateLimit_baziCompute: result.rateLimitEnabled.bazi_compute,
        rateLimit_chat: result.rateLimitEnabled.chat,

        // Pro 功能门禁
        proFeature_shensha: result.proFeatureGate.shensha,
        proFeature_overview: result.proFeatureGate.overview,
        proFeature_advancedChat: result.proFeatureGate.advanced_chat,

        // 限流次数配置
        rateLimitConfig_baziComputeLimit:
          result.rateLimitConfig.bazi_compute_daily_limit,
        rateLimitConfig_baziComputeLimitPro:
          result.rateLimitConfig.bazi_compute_daily_limit_pro,
        rateLimitConfig_chatLimit: result.rateLimitConfig.chat_daily_limit,
        rateLimitConfig_chatLimitPro:
          result.rateLimitConfig.chat_daily_limit_pro,
      });
    } catch (error: any) {
      message.error(error.message || '获取系统配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 保存所有配置
  const handleSaveAll = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // 1. 更新限流开关
      await updateRateLimit({
        bazi_compute: values.rateLimit_baziCompute,
        chat: values.rateLimit_chat,
      });

      // 2. 更新 Pro 功能门禁
      await updateProFeatureGate({
        shensha: values.proFeature_shensha,
        overview: values.proFeature_overview,
        advanced_chat: values.proFeature_advancedChat,
      });

      // 3. 更新限流次数配置
      await updateRateLimitConfig({
        bazi_compute_daily_limit: values.rateLimitConfig_baziComputeLimit,
        bazi_compute_daily_limit_pro: values.rateLimitConfig_baziComputeLimitPro,
        chat_daily_limit: values.rateLimitConfig_chatLimit,
        chat_daily_limit_pro: values.rateLimitConfig_chatLimitPro,
      });

      message.success('系统配置已更新！');
      fetchSettings(); // 重新获取配置
    } catch (error: any) {
      message.error(error.message || '保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!settings) {
    return (
      <Card title="系统设置">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>未能加载系统配置</p>
          <Button onClick={fetchSettings}>重新加载</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <SettingOutlined />
            系统设置
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleSaveAll}
            loading={saving}
          >
            保存所有配置
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          {/* 限流管理 */}
          <Card
            type="inner"
            title="📊 限流管理"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="排盘限流"
                  name="rateLimit_baziCompute"
                  valuePropName="checked"
                  tooltip="控制非 Pro 用户的排盘功能是否受限流限制"
                >
                  <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="对话限流"
                  name="rateLimit_chat"
                  valuePropName="checked"
                  tooltip="控制非 Pro 用户的对话功能是否受限流限制"
                >
                  <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Pro 功能门禁 */}
          <Card
            type="inner"
            title={
              <Space>
                <LockOutlined />
                Pro 功能门禁
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="神煞解读"
                  name="proFeature_shensha"
                  valuePropName="checked"
                  tooltip="是否需要 Pro 权限才能使用神煞解读功能"
                >
                  <Switch
                    checkedChildren="需要 Pro"
                    unCheckedChildren="免费"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="命盘总览"
                  name="proFeature_overview"
                  valuePropName="checked"
                  tooltip="是否需要 Pro 权限才能使用命盘总览功能"
                >
                  <Switch
                    checkedChildren="需要 Pro"
                    unCheckedChildren="免费"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="高级对话"
                  name="proFeature_advancedChat"
                  valuePropName="checked"
                  tooltip="是否需要 Pro 权限才能使用高级对话功能"
                >
                  <Switch
                    checkedChildren="需要 Pro"
                    unCheckedChildren="免费"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 限流次数配置 */}
          <Card type="inner" title="⚙️ 限流次数配置">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="排盘 - 普通用户（次/天）"
                  name="rateLimitConfig_baziComputeLimit"
                  rules={[
                    { required: true, message: '请输入限制次数' },
                    { type: 'number', min: 0, message: '不能小于0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="例如：5"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="排盘 - Pro 用户（次/天）"
                  name="rateLimitConfig_baziComputeLimitPro"
                  rules={[
                    { required: true, message: '请输入限制次数' },
                    { type: 'number', min: 0, message: '不能小于0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="例如：9999（无限制）"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="对话 - 普通用户（次/天）"
                  name="rateLimitConfig_chatLimit"
                  rules={[
                    { required: true, message: '请输入限制次数' },
                    { type: 'number', min: 0, message: '不能小于0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="例如：50"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="对话 - Pro 用户（次/天）"
                  name="rateLimitConfig_chatLimitPro"
                  rules={[
                    { required: true, message: '请输入限制次数' },
                    { type: 'number', min: 0, message: '不能小于0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="例如：9999（无限制）"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => form.resetFields()}>重置</Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSaveAll}
                loading={saving}
              >
                保存所有配置
              </Button>
            </Space>
          </div>
        </Form>

        {/* 使用说明 */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <h4>配置说明</h4>
          <ul style={{ marginBottom: 0 }}>
            <li>
              <strong>限流管理</strong>：控制非 Pro
              用户的功能使用次数是否受限
            </li>
            <li>
              <strong>Pro 功能门禁</strong>：控制特定功能是否需要 Pro
              权限才能访问
            </li>
            <li>
              <strong>限流次数配置</strong>：设置普通用户和 Pro
              用户的每日使用次数上限
            </li>
            <li>Pro 用户会自动跳过限流检查</li>
            <li>配置修改后立即生效，无需重启服务</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

