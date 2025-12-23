/**
 * 會員管理 - 用戶詳情頁面
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
  Modal,
  Form,
  Select,
  Radio,
  Alert,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  getMembershipUserDetail,
  grantMembership,
  revokeMembership,
  resetTodayAiCalls,
} from '../../services/membershipService';
import type {
  MembershipUserDetail,
  GrantMembershipRequest,
} from '../../types';

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

// 獲取 AI 上限說明
function getAiLimitDescription(
  aiDailyLimit: number,
  isPro: boolean,
  createdAt: string
): string {
  if (isPro) {
    return `今日上限：100 次（小佩會員）`;
  }
  const isFirstDay =
    new Date(createdAt).toDateString() === new Date().toDateString();
  if (isFirstDay) {
    return `今日上限：10 次（註冊首日）`;
  }
  return `今日上限：5 次（免費用戶）`;
}

export default function MembershipUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<MembershipUserDetail | null>(null);
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [revokeModalVisible, setRevokeModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [grantForm] = Form.useForm();

  // 獲取用戶詳情
  const fetchUserDetail = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await getMembershipUserDetail(userId);
      setUser(result);
    } catch (error: any) {
      message.error(error.message || '獲取用戶詳情失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  // 開通 / 延長會員
  const handleGrant = async (values: GrantMembershipRequest) => {
    if (!userId) return;

    setGrantLoading(true);
    try {
      await grantMembership(userId, values);
      message.success('會員開通/延長成功');
      setGrantModalVisible(false);
      grantForm.resetFields();
      fetchUserDetail();
    } catch (error: any) {
      message.error(error.message || '操作失敗');
    } finally {
      setGrantLoading(false);
    }
  };

  // 取消會員
  const handleRevoke = async () => {
    if (!userId) return;

    setRevokeLoading(true);
    try {
      await revokeMembership(userId);
      message.success('會員已取消');
      setRevokeModalVisible(false);
      fetchUserDetail();
    } catch (error: any) {
      message.error(error.message || '操作失敗');
    } finally {
      setRevokeLoading(false);
    }
  };

  // 重置今日 AI 次數
  const handleReset = async () => {
    if (!userId) return;

    setResetLoading(true);
    try {
      await resetTodayAiCalls(userId);
      message.success('今日 AI 次數已重置');
      setResetModalVisible(false);
      fetchUserDetail();
    } catch (error: any) {
      message.error(error.message || '操作失敗');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="載入中..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Space direction="vertical" size="large">
          <div style={{ fontSize: 16, color: '#999' }}>
            用戶不存在或已被刪除
          </div>
          <Button type="primary" onClick={() => navigate('/membership/users')}>
            返回用戶列表
          </Button>
        </Space>
      </div>
    );
  }

  const isExpired = user.isPro && isProExpired(user.proExpiresAt);
  const aiPercentage = (user.aiCallsToday / user.aiDailyLimit) * 100;
  const isAiHigh = aiPercentage >= 80;
  const isAiFull = aiPercentage >= 100;

  return (
    <div style={{ padding: '12px 16px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/membership/users')}
        >
          返回列表
        </Button>
      </Space>

      {/* 基本資訊 */}
      <Card title="基本資訊" style={{ marginBottom: 16 }} size="small">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="用戶 ID" span={2}>
            {user.userId}
          </Descriptions.Item>
          <Descriptions.Item label="手機">
            {user.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="註冊時間">
            {new Date(user.createdAt).toLocaleString('zh-TW')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 會員資訊 */}
      <Card
        title="會員資訊"
        style={{ marginBottom: 16 }}
        size="small"
        extra={
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => setGrantModalVisible(true)}
            >
              手動開通 / 延長會員
            </Button>
            {user.isPro && (
              <Button
                danger
                size="small"
                onClick={() => setRevokeModalVisible(true)}
              >
                設為免費用戶
              </Button>
            )}
          </Space>
        }
      >
        {isExpired && (
          <Alert
            message="會員狀態異常：已過期"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="會員狀態">
            <Tag color={user.isPro && !isExpired ? 'gold' : 'default'}>
              {isExpired
                ? `${formatProPlan(user.proPlan)} (已過期)`
                : formatProPlan(user.proPlan)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="方案">
            {user.proPlan || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="會員到期時間" span={2}>
            {user.proExpiresAt
              ? new Date(user.proExpiresAt).toLocaleString('zh-TW')
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* AI 解讀次數 */}
      <Card
        title="AI 解讀次數"
        style={{ marginBottom: 16 }}
        size="small"
        extra={
          <Button
            size="small"
            onClick={() => setResetModalVisible(true)}
          >
            重置今日解讀次數
          </Button>
        }
      >
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="今日日期">
            {user.aiCallsDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="今日 AI 解讀次數">
            <span
              style={{
                color: isAiFull ? 'red' : isAiHigh ? 'orange' : 'inherit',
                fontWeight: isAiFull ? 'bold' : 'normal',
              }}
            >
              {user.aiCallsToday} / {user.aiDailyLimit}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="說明" span={2}>
            {getAiLimitDescription(
              user.aiDailyLimit,
              user.isPro,
              user.createdAt
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 開通 / 延長會員 Modal */}
      <Modal
        title="手動開通 / 延長會員"
        open={grantModalVisible}
        onOk={() => grantForm.submit()}
        onCancel={() => {
          setGrantModalVisible(false);
          grantForm.resetFields();
        }}
        confirmLoading={grantLoading}
      >
        <Form
          form={grantForm}
          layout="vertical"
          onFinish={handleGrant}
          initialValues={{ mode: 'extend' }}
        >
          <Form.Item
            name="plan"
            label="方案"
            rules={[{ required: true, message: '請選擇方案' }]}
          >
            <Select>
              <Option value="monthly">月付方案 (monthly)</Option>
              <Option value="quarterly">季付方案 (quarterly)</Option>
              <Option value="yearly">年付方案 (yearly)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="mode"
            label="模式"
            rules={[{ required: true, message: '請選擇模式' }]}
          >
            <Radio.Group>
              <Radio value="extend">從原到期日往後延長</Radio>
              <Radio value="fromNow">從現在起算</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 取消會員 Modal */}
      <Modal
        title="取消會員"
        open={revokeModalVisible}
        onOk={handleRevoke}
        onCancel={() => setRevokeModalVisible(false)}
        confirmLoading={revokeLoading}
        okText="確定"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>確定要立即取消該用戶的會員權益嗎？</p>
        <p style={{ color: '#999', fontSize: 12 }}>
          取消後，該用戶會恢復為免費用戶。
        </p>
      </Modal>

      {/* 重置 AI 次數 Modal */}
      <Modal
        title="重置今日 AI 次數"
        open={resetModalVisible}
        onOk={handleReset}
        onCancel={() => setResetModalVisible(false)}
        confirmLoading={resetLoading}
        okText="確定"
        cancelText="取消"
      >
        <p>確定要將該用戶今天的 AI 解讀次數重置為 0 嗎？</p>
        <p style={{ color: '#999', fontSize: 12 }}>
          通常用於客服補償或內部測試。
        </p>
      </Modal>
    </div>
  );
}


