/**
 * 聊天相关 API 服务
 */

import { get, del } from './apiClient';
import { ConversationDetailDto, ConversationItemDto } from '@/types';
import { ENV } from '@/config/env';

export const chatService = {
  /**
   * 获取对话列表
   */
  async getConversations(params: {
    masterIds?: string[];
    dateFilter?: 'today' | 'week' | 'month' | 'all';
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: ConversationItemDto[];
    total: number;
  }> {
    const { masterIds, dateFilter, page = 1, pageSize = 20 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (masterIds && masterIds.length > 0) {
      queryParams.append('masterIds', masterIds.join(','));
    }
    
    if (dateFilter) {
      queryParams.append('dateFilter', dateFilter);
    }
    
    return await get<{
      items: ConversationItemDto[];
      total: number;
    }>(`/api/v1/chat/conversations?${queryParams.toString()}`);
  },
  
  /**
   * 获取对话详情（消息列表）
   */
  async getConversationDetail(params: {
    conversationId: string;
    page?: number;
    pageSize?: number;
  }): Promise<ConversationDetailDto> {
    const { conversationId, page = 1, pageSize = 50 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    return await get<ConversationDetailDto>(
      `/api/v1/chat/conversations/${conversationId}?${queryParams.toString()}`
    );
  },
  
  /**
   * 发送消息（SSE 流式）
   * 
   * 注意：此方法返回一个 EventSource 对象用于接收流式数据
   * 调用方需要自行处理流式事件
   */
  sendMessage(params: {
    conversationId: string;
    message: string;
    chartId: string;
    topic?: string;
    source?: string;
    sectionKey?: string;
    shenShaCode?: string;
  }): {
    eventSource: EventSource;
    conversationId: string;
  } {
    const { conversationId, message, chartId, topic, source, sectionKey, shenShaCode } = params;
    
    // 构建请求 URL 和 body
    const url = `${ENV.API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`;
    
    const body = {
      message,
      chartId,
      ...(topic && { topic }),
      ...(source && { source }),
      ...(sectionKey && { sectionKey }),
      ...(shenShaCode && { shenShaCode }),
    };
    
    // 注意：React Native 不支持原生 EventSource
    // 需要使用 react-native-sse 或 react-native-event-source
    // 这里先用 fetch + ReadableStream 实现
    
    // TODO: 使用 fetch stream 实现 SSE
    // 暂时抛出错误，提示需要在前端实现 SSE 处理
    throw new Error('SSE 流式消息接收需要在组件中使用 fetch stream 实现');
  },
  
  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await del(`/api/v1/chat/conversations/${conversationId}`);
  },
  
  /**
   * 获取命主列表（用于筛选）
   */
  async getMastersForFilter(): Promise<{
    masterId: string;
    masterName: string;
    conversationCount: number;
  }[]> {
    const result = await get<{
      masters: {
        masterId: string;
        masterName: string;
        conversationCount: number;
      }[];
    }>('/api/v1/chat/conversations/filters/masters');
    
    return result.masters;
  },
};
