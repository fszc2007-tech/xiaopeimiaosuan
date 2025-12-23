/**
 * 對話相關 API（H5 版）
 * 
 * ✅ 與 App 端邏輯完全一致
 * ✅ 支持 SSE 流式對話
 */

import { get, del } from './apiClient';

export interface ConversationItem {
  conversationId: string;
  chartId: string;
  topic?: string;
  firstQuestion: string;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ConversationDetail {
  conversationId: string;
  chartId: string;
  topic?: string;
  messages: Message[];
  total: number;
}

export const chatService = {
  /**
   * 獲取對話列表
   */
  async getConversations(params: {
    masterIds?: string[];
    dateFilter?: 'today' | 'week' | 'month' | 'all';
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: ConversationItem[];
    total: number;
  }> {
    const { page = 1, pageSize = 20, masterIds, dateFilter } = params;
    
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
    
    return get<{
      items: ConversationItem[];
      total: number;
    }>(`/api/v1/chat/conversations?${queryParams.toString()}`);
  },

  /**
   * 獲取對話詳情（消息列表）
   */
  async getConversationDetail(params: {
    conversationId: string;
    page?: number;
    pageSize?: number;
  }): Promise<ConversationDetail> {
    const { conversationId, page = 1, pageSize = 50 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    return get<ConversationDetail>(
      `/api/v1/chat/conversations/${conversationId}?${queryParams.toString()}`
    );
  },

  /**
   * 發送消息（SSE 流式）
   * 
   * ✅ 與 App 端完全一致的流式實現
   */
  async sendMessageStream(params: {
    conversationId: string;
    message: string;
    chartId: string;
    topic?: string;
    source?: string;
    sectionKey?: string;
    shenShaCode?: string;
  }): Promise<{
    reader: ReadableStreamDefaultReader<Uint8Array>;
    abort: () => void;
  }> {
    const { conversationId, message, chartId, topic, source, sectionKey, shenShaCode } = params;
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const url = `${apiBaseUrl}/api/v1/chat/conversations/${conversationId}/messages`;
    
    const token = localStorage.getItem('XIAOPEI_TOKEN');
    
    const controller = new AbortController();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        chartId,
        ...(topic && { topic }),
        ...(source && { source }),
        ...(sectionKey && { sectionKey }),
        ...(shenShaCode && { shenShaCode }),
      }),
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    
    return {
      reader,
      abort: () => controller.abort(),
    };
  },

  /**
   * 取消生成（調用後端取消接口）
   */
  async cancelGeneration(conversationId: string): Promise<void> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const url = `${apiBaseUrl}/api/v1/chat/conversations/${conversationId}/cancel`;
    
    const token = localStorage.getItem('XIAOPEI_TOKEN');
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 刪除對話
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return del<void>(`/api/v1/chat/conversations/${conversationId}`);
  },
};


