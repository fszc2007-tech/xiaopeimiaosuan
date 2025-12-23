/**
 * 神煞弹窗集成测试
 * 
 * 测试数据流：
 * 1. 点击神煞 -> 触发 onShenShaPress
 * 2. 弹窗显示 -> 调用 API 获取数据
 * 3. 数据展示 -> 验证内容是否正确
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ShenShaPopup } from '../components/ShenShaPopup';
import { shenshaService } from '../services/api/shenshaService';
import { getShenshaCode, getPillarType } from '../utils/shenshaMapping';

// Mock API 服务
jest.mock('../services/api/shenshaService');
jest.mock('../utils/shenshaMapping');

const mockShenshaService = shenshaService as jest.Mocked<typeof shenshaService>;
const mockGetShenshaCode = getShenshaCode as jest.MockedFunction<typeof getShenshaCode>;
const mockGetPillarType = getPillarType as jest.MockedFunction<typeof getPillarType>;

describe('神煞弹窗组件测试', () => {
  const mockData = {
    code: 'tai_ji_gui_ren',
    name: '太极贵人',
    badge_text: '吉神',
    type: 'auspicious' as const,
    short_title: '祖上或有信仰、从事偏门、玄学之人',
    summary: '代表对神秘事物、玄学、哲学、宗教有先天悟性和缘分。性格正直专注，喜欢独立思考，有钻研精神，容易在专业领域有所成就。',
    bullet_points: [
      '祖上或有信仰、从事偏门、玄学之人',
      '自身天生对神秘事物有好奇心和感知力',
    ],
    pillar_explanation: [
      {
        pillar: 'year' as const,
        text: '祖上或有信仰、从事偏门、玄学之人。自身天生对神秘事物有好奇心和感知力。',
      },
    ],
    recommended_questions: [
      '太极贵人對我的影響是什麼？',
      '年柱的太极贵人會如何影響我？',
      '我該如何善用太极贵人？',
      '太极贵人需要注意什麼？',
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShenshaCode.mockReturnValue('tai_ji_gui_ren');
    mockGetPillarType.mockReturnValue('year');
    mockShenshaService.getReading.mockResolvedValue(mockData);
  });

  it('应该正确显示神煞名称和柱位', async () => {
    const onClose = jest.fn();
    const { getByTestId, getByText } = render(
      <ShenShaPopup
        visible={true}
        shenShaName="太极贵人"
        pillarLabel="年柱"
        chartId="test-chart-id"
        chartProfileId="test-profile-id"
        gender="male"
        onClose={onClose}
      />
    );

    // 等待数据加载
    await waitFor(() => {
      expect(mockShenshaService.getReading).toHaveBeenCalledWith('tai_ji_gui_ren', 'year', 'male');
    });

    // 验证标题显示
    const title = getByTestId('shensha-popup-title');
    expect(title).toBeTruthy();
    expect(getByText('太极贵人')).toBeTruthy();
  });

  it('应该显示解读内容', async () => {
    const onClose = jest.fn();
    const { getByTestId, getByText } = render(
      <ShenShaPopup
        visible={true}
        shenShaName="太极贵人"
        pillarLabel="年柱"
        chartId="test-chart-id"
        chartProfileId="test-profile-id"
        gender="male"
        onClose={onClose}
      />
    );

    // 等待数据加载
    await waitFor(() => {
      expect(getByTestId('shensha-popup-summary')).toBeTruthy();
    });

    // 验证总结内容
    const summaryText = getByTestId('shensha-popup-summary-text');
    expect(summaryText).toBeTruthy();
    expect(summaryText.props.children).toContain('代表对神秘事物');
  });

  it('应该能够关闭弹窗', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ShenShaPopup
        visible={true}
        shenShaName="太极贵人"
        pillarLabel="年柱"
        chartId="test-chart-id"
        chartProfileId="test-profile-id"
        gender="male"
        onClose={onClose}
      />
    );

    // 点击遮罩层
    const overlay = getByTestId('shensha-popup-overlay');
    fireEvent.press(overlay);

    // 验证 onClose 被调用
    expect(onClose).toHaveBeenCalled();
  });

  it('应该处理 API 错误', async () => {
    mockShenshaService.getReading.mockRejectedValue(new Error('获取神煞解读失败'));

    const onClose = jest.fn();
    const { getByText } = render(
      <ShenShaPopup
        visible={true}
        shenShaName="太极贵人"
        pillarLabel="年柱"
        chartId="test-chart-id"
        chartProfileId="test-profile-id"
        gender="male"
        onClose={onClose}
      />
    );

    // 等待错误显示
    await waitFor(() => {
      expect(getByText(/获取神煞解读失败|加载失败/)).toBeTruthy();
    });
  });

  it('应该正确映射神煞名称到代码', () => {
    const onClose = jest.fn();
    render(
      <ShenShaPopup
        visible={true}
        shenShaName="太极贵人"
        pillarLabel="年柱"
        chartId="test-chart-id"
        chartProfileId="test-profile-id"
        gender="male"
        onClose={onClose}
      />
    );

    // 验证映射函数被调用
    expect(mockGetShenshaCode).toHaveBeenCalledWith('太极贵人');
    expect(mockGetPillarType).toHaveBeenCalledWith('年柱');
  });
});





