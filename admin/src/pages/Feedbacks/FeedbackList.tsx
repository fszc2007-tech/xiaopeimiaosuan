/**
 * 反馈管理页面
 * 
 * 功能：
 * - 查看所有用户反馈
 * - 按类型、状态筛选
 * - 更新反馈状态
 * - 回复反馈
 */

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Card,
  Modal,
  Form,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { ReloadOutlined, MessageOutlined } from '@ant-design/icons';
import { getFeedbackList, updateFeedback } from '../../services/feedbackService';
import type { Feedback, FeedbackListParams } from '../../types';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

// 反馈类型标签
const typeMap = {
  suggest: { label: '使用建议', color: 'blue' },
  problem: { label: '遇到问题', color: 'red' },
};

// 状态标签
const statusMap = {
  pending: { label: '待处理', color: 'orange' },
  processing: { label: '处理中', color: 'blue' },
  resolved: { label: '已解决', color: 'green' },
};

export default function FeedbackList() {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<FeedbackListParams>({
    page: 1,
    pageSize: 20,
  });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [form] = Form.useForm();

  // 获取反馈列表
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const result = await getFeedbackList(filters);
      setFeedbacks(result.items);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error: any) {
      message.error(error.message || '获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  // 处理状态变更
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateFeedback(id, { status: status as any });
      message.success('状态更新成功');
      fetchFeedbacks();
    } catch (error: any) {
      message.error(error.message || '状态更新失败');
    }
  };

  // 打开回复对话框
  const handleOpenReply = (record: Feedback) => {
    setCurrentFeedback(record);
    form.setFieldsValue({
      status: record.status,
      adminReply: record.adminReply || '',
    });
    setReplyModalVisible(true);
  };

  // 提交回复
  const handleSubmitReply = async () => {
    try {
      const values = await form.validateFields();
      if (!currentFeedback) return;

      await updateFeedback(currentFeedback.id, {
        status: values.status,
        adminReply: values.adminReply,
      });

      message.success('回复提交成功');
      setReplyModalVisible(false);
      setCurrentFeedback(null);
      form.resetFields();
      fetchFeedbacks();
    } catch (error: any) {
      message.error(error.message || '回复提交失败');
    }
  };

  // 表格列配置
  const columns: TableProps<Feedback>['columns'] = [
    {
      title: '反馈类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: 'suggest' | 'problem') => (
        <Tag color={typeMap[type].color}>{typeMap[type].label}</Tag>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 180,
      ellipsis: true,
      render: (userId) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{userId}</Text>
      ),
    },
    {
      title: '反馈内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ marginBottom: 0 }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      ellipsis: true,
      render: (contact) => contact || <Text type="secondary">未填写</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: '100%' }}
          size="small"
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="pending">{statusMap.pending.label}</Option>
          <Option value="processing">{statusMap.processing.label}</Option>
          <Option value="resolved">{statusMap.resolved.label}</Option>
        </Select>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (createdAt) => new Date(createdAt).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<MessageOutlined />}
          onClick={() => handleOpenReply(record)}
        >
          回复
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="反馈管理"
        extra={
          <Space>
            <Select
              placeholder="类型"
              style={{ width: 120 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value, page: 1 })}
            >
              <Option value="suggest">使用建议</Option>
              <Option value="problem">遇到问题</Option>
            </Select>
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="resolved">已解决</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchFeedbacks}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, pageSize });
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 回复对话框 */}
      <Modal
        title="回复反馈"
        open={replyModalVisible}
        onOk={handleSubmitReply}
        onCancel={() => {
          setReplyModalVisible(false);
          setCurrentFeedback(null);
          form.resetFields();
        }}
        width={700}
        okText="提交"
        cancelText="取消"
      >
        {currentFeedback && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>用户ID：</Text>
              <Text code style={{ fontSize: 12 }}>{currentFeedback.userId}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>反馈类型：</Text>
              <Tag color={typeMap[currentFeedback.type].color}>
                {typeMap[currentFeedback.type].label}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>反馈内容：</Text>
              <Paragraph>{currentFeedback.content}</Paragraph>
            </div>
            {currentFeedback.contact && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>联系方式：</Text>
                <Text>{currentFeedback.contact}</Text>
              </div>
            )}

            <Form form={form} layout="vertical">
              <Form.Item
                label="处理状态"
                name="status"
                rules={[{ required: true, message: '请选择处理状态' }]}
              >
                <Select>
                  <Option value="pending">待处理</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="resolved">已解决</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="管理员回复"
                name="adminReply"
              >
                <TextArea rows={4} placeholder="请输入回复内容..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}

