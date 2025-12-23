/**
 * LLM 计费统计页面
 */

import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Button,
  Space,
  Statistic,
  Spin,
  message,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  getBillingSummary,
  getBillingTrend,
  getBillingByModel,
} from '../../services/billingService';
import type {
  BillingSummary,
  BillingTrendItem,
  BillingByModelItem,
} from '../../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 数字格式化
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

const formatCurrency = (yuan: number): string => {
  return `¥ ${new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(yuan)}`;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [trend, setTrend] = useState<BillingTrendItem[]>([]);
  const [byModel, setByModel] = useState<BillingByModelItem[]>([]);

  // 筛选参数
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [provider, setProvider] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string | undefined>(undefined);
  const [quickSelect, setQuickSelect] = useState<string>('本月');

  // 初始化：设置为本月
  useEffect(() => {
    const now = dayjs();
    const monthStart = now.startOf('month');
    const monthEnd = now.endOf('month');
    setDateRange([monthStart, monthEnd]);
  }, []);

  // 获取数据
  const fetchData = async () => {
    if (!dateRange) return;

    setLoading(true);
    try {
      const params = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        provider,
        model,
      };

      // 并行请求
      const [summaryData, trendData, byModelData] = await Promise.all([
        getBillingSummary(params),
        getBillingTrend({
          start_date: params.start_date,
          end_date: params.end_date,
          provider: params.provider,
          model: params.model,
        }),
        getBillingByModel(params),
      ]);

      setSummary(summaryData);
      setTrend(trendData.items);
      setByModel(byModelData.items);
    } catch (error: any) {
      message.error(error.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, provider, model]);

  // 快捷时间选择
  const handleQuickSelect = (value: string) => {
    setQuickSelect(value);
    const now = dayjs();

    switch (value) {
      case '今天':
        setDateRange([now, now]);
        break;
      case '昨天':
        setDateRange([now.subtract(1, 'day'), now.subtract(1, 'day')]);
        break;
      case '近7天':
        setDateRange([now.subtract(6, 'day'), now]);
        break;
      case '本月':
        setDateRange([now.startOf('month'), now.endOf('month')]);
        break;
      case '上月':
        setDateRange(
          [now.subtract(1, 'month').startOf('month'), now.subtract(1, 'month').endOf('month')]
        );
        break;
      case '自定义':
        // 保持当前选择
        break;
    }
  };

  // 判断是否为本月（用于显示预估）
  const isCurrentMonth = () => {
    if (!dateRange) return false;
    const now = dayjs();
    return (
      dateRange[0].month() === now.month() &&
      dateRange[0].year() === now.year() &&
      dateRange[1].month() === now.month() &&
      dateRange[1].year() === now.year()
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>LLM 计费统计</h1>

      {/* 筛选区 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle" wrap>
          <Select
            value={quickSelect}
            onChange={handleQuickSelect}
            style={{ width: 120 }}
          >
            <Option value="今天">今天</Option>
            <Option value="昨天">昨天</Option>
            <Option value="近7天">近7天</Option>
            <Option value="本月">本月</Option>
            <Option value="上月">上月</Option>
            <Option value="自定义">自定义</Option>
          </Select>

          {quickSelect === '自定义' && (
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="YYYY-MM-DD"
            />
          )}

          <Select
            placeholder="Provider"
            allowClear
            value={provider}
            onChange={setProvider}
            style={{ width: 120 }}
          >
            <Option value="deepseek">DeepSeek</Option>
            <Option value="openai">OpenAI</Option>
            <Option value="qwen">Qwen</Option>
          </Select>

          <Select
            placeholder="Model"
            allowClear
            value={model}
            onChange={setModel}
            style={{ width: 180 }}
          >
            {provider === 'deepseek' && (
              <>
                <Option value="deepseek-chat">deepseek-chat</Option>
                <Option value="deepseek-reasoner">deepseek-reasoner</Option>
              </>
            )}
            {provider === 'openai' && (
              <>
                <Option value="gpt-4">gpt-4</Option>
                <Option value="gpt-4o">gpt-4o</Option>
              </>
            )}
            {provider === 'qwen' && (
              <>
                <Option value="qwen-max">qwen-max</Option>
              </>
            )}
          </Select>

          <Button type="primary" onClick={fetchData} loading={loading}>
            查询
          </Button>
        </Space>
      </Card>

      {loading && !summary ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : summary ? (
        <>
          {/* 关键指标卡片 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="本期累计总 Tokens"
                  value={formatNumber(summary.total_tokens)}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ fontSize: '24px' }}
                />
                <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                  输入：{formatNumber(summary.total_input_tokens)} / 输出：{formatNumber(summary.total_output_tokens)}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="本期累计费用"
                  value={formatCurrency(summary.total_cost_yuan)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: '24px' }}
                />
                <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                  约 {summary.total_cost_cents} 分
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="预估本月 Tokens"
                  value={summary.forecast_month_tokens ? formatNumber(summary.forecast_month_tokens) : 'N/A'}
                  prefix={<RiseOutlined />}
                  valueStyle={{ fontSize: '24px' }}
                />
                {summary.forecast_basis_days && (
                  <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                    基于 {summary.forecast_basis_days} 天数据推算
                  </div>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="预估本月费用"
                  value={summary.forecast_month_cost_yuan ? formatCurrency(summary.forecast_month_cost_yuan) : 'N/A'}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ fontSize: '24px' }}
                />
                {summary.forecast_used_ratio !== undefined && summary.forecast_used_ratio > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                      已用 {Math.round(summary.forecast_used_ratio * 100)}%
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, summary.forecast_used_ratio * 100)}%`,
                          height: '100%',
                          backgroundColor: '#1890ff',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                )}
                {summary.forecast_note && (
                  <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
                    {summary.forecast_note}
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* 趋势图区域 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Card title="Token 消耗趋势" style={{ height: '320px' }}>
                {trend.length > 0 ? (
                  <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* TODO: 集成图表库（ECharts / Ant Design Charts） */}
                    <div style={{ color: '#999' }}>
                      图表功能待实现（数据已就绪：{trend.length} 个数据点）
                    </div>
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Card title="费用趋势" style={{ height: '320px' }}>
                {trend.length > 0 ? (
                  <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* TODO: 集成图表库（ECharts / Ant Design Charts） */}
                    <div style={{ color: '#999' }}>
                      图表功能待实现（数据已就绪：{trend.length} 个数据点）
                    </div>
                  </div>
                ) : (
                  <Empty description="暂无数据" />
                )}
              </Card>
            </Col>
          </Row>

          {/* 按模型统计 */}
          {byModel.length > 0 && (
            <Card title="按模型统计">
              <Row gutter={16}>
                {byModel.map((item) => (
                  <Col span={8} key={`${item.provider}-${item.model}`} style={{ marginBottom: '16px' }}>
                    <Card size="small">
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{item.provider}</strong> / {item.model}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        <div>Tokens: {formatNumber(item.total_tokens)}</div>
                        <div>费用: {formatCurrency(item.total_cost_yuan)}</div>
                        <div>请求数: {formatNumber(item.request_count)}</div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      ) : (
        <Empty description="暂无数据" />
      )}
    </div>
  );
}

