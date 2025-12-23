/**
 * 聊天状态管理
 */

import { create } from 'zustand';
import { Conversation, ChatMessage } from '../types';

interface ChatState {
  // 状态
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isThinking: boolean; // AI 思考中
  
  // 操作
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsThinking: (isThinking: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // 初始状态
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isThinking: false,
  
  // 设置对话列表
  setConversations: (conversations) => set({ conversations }),
  
  // 添加对话
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),
  
  // 删除对话
  deleteConversation: (conversationId) => set((state) => ({
    conversations: state.conversations.filter(
      (conv) => conv.conversationId !== conversationId
    ),
  })),
  
  // 设置当前对话
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  
  // 设置消息列表
  setMessages: (messages) => set({ messages }),
  
  // 添加消息
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  // 设置加载状态
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // 设置 AI 思考状态
  setIsThinking: (isThinking) => set({ isThinking }),
  
  // 清空消息
  clearMessages: () => set({ messages: [] }),
}));

