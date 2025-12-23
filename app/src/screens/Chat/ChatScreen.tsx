/**
 * 聊天页 / ChatScreen
 * 
 * 参考文档：
 * - app.doc/features/聊天页设计文档（公共组件版）.md
 * - app.doc/前端路由与页面结构设计文档.md
 * - AI使用次数前端拦截方案-最终实施规格.md v1.1
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { RootStackParamList } from '@/types/navigation';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { FollowUpSuggestions } from '@/components/chat/FollowUpSuggestions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { BackButton } from '@/components/common/BackButton';
import { useAuthStore, useProStore } from '@/store';
import { chatService } from '@/services/api';
import { normalizeToZhHK } from '@/utils/normalizeText';
import { useTranslation } from 'react-i18next';
import { ENV } from '@/config/env';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  followUps?: string[]; // 追问建议（仅 assistant 消息）
}

type ChatRouteProps = RouteProp<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<ChatRouteProps>();
  const navigation = useNavigation();
  
  const {
    conversationId: initialConversationId,
    question,
    masterId,
    topic,
    source,
    sectionKey,
    shenShaCode,
    chartId, // 兼容 chartId 参数（从聊天记录页面传入）
  } = route.params || {};
  
  // 兼容处理：如果 masterId 不存在，使用 chartId（从聊天记录页面传入时使用 chartId）
  const effectiveMasterId = masterId || chartId;
  
  // 获取用户状态和 Pro 状态
  const user = useAuthStore((state) => state.user);
  const isPro = useProStore((state) => state.isPro);
  const aiUsageStatus = useProStore((state) => state.aiUsageStatus);
  const fetchAiUsageStatus = useProStore((state) => state.fetchAiUsageStatus);
  const consumeAiUsageLocally = useProStore((state) => state.consumeAiUsageLocally);
  const resetAiUsage = useProStore((state) => state.resetAiUsage);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSending, setIsSending] = useState(false); // 规则 5：并发保护
  const [conversationId, setConversationId] = useState<string>(initialConversationId || 'new');
  
  // 错误对话框状态
  const [errorDialog, setErrorDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  
  // AI 次数限制对话框状态
  const [limitDialog, setLimitDialog] = useState({
    visible: false,
  });
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null); // 输入框引用
  const currentRequestRef = useRef<string | null>(null); // 保存当前请求的 conversationId
  const xhrRef = useRef<XMLHttpRequest | null>(null); // 保存 XMLHttpRequest 引用
  const isCancelledRef = useRef<boolean>(false); // 是否主动取消
  const isUnmountedRef = useRef<boolean>(false); // 组件是否已卸载
  const isFirstMessageRef = useRef<boolean>(conversationId === 'new'); // 是否是第一条消息（用于决定是否传 sectionKey）
  
  // 取消正在生成的对话
  const cancelGeneration = useCallback(async () => {
    // 设置主动取消标志
    isCancelledRef.current = true;
    
    const currentConvId = currentRequestRef.current;
    if (currentConvId && currentConvId !== 'new') {
      try {
        const token = useAuthStore.getState().token;
        const url = `${ENV.API_BASE_URL}/api/v1/chat/conversations/${currentConvId}/cancel`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('[Chat] Cancel request sent for conversation:', currentConvId);
      } catch (error) {
        // 忽略错误（后端可能已断开）
        console.log('[Chat] Cancel request failed (ignored):', error);
      }
    }
    
    // 取消 XMLHttpRequest
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    
    setIsThinking(false);
    currentRequestRef.current = null;
  }, []);
  
  // 加载历史消息（如果有 conversationId）
  useEffect(() => {
    const loadHistory = async () => {
      // 如果有 conversationId 且不是 'new'，加载历史消息
      if (initialConversationId && initialConversationId !== 'new') {
        try {
          setIsLoading(true);
          const result = await chatService.getConversationDetail({
            conversationId: initialConversationId,
            page: 1,
            pageSize: 100, // 加载所有消息
          });
          
          // 转换消息格式：后端格式 -> 前端格式
          // ⚠️ 重要：只对助手消息做简繁转换，用户消息保持原样
          const historyMessages: ChatMessage[] = result.messages.map((msg) => ({
            id: msg.messageId,
            role: msg.role,
            text: msg.role === 'assistant' 
              ? normalizeToZhHK(msg.content)  // 助手消息：转换为繁体
              : msg.content,                   // 用户消息：保持原样
            createdAt: msg.timestamp,
          }));
          
          setMessages(historyMessages);
          
          // 滚动到底部
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        } catch (error: any) {
          console.error('[Chat] Failed to load conversation history:', error);
          // 如果加载失败，不显示错误（可能是新对话）
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadHistory();
  }, [initialConversationId]);
  
  // 组件卸载时取消生成
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true; // 标记组件已卸载
      cancelGeneration();
    };
  }, [cancelGeneration]);
  
  // App 切换到后台时取消生成
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        cancelGeneration();
      }
    });
    return () => subscription.remove();
  }, [cancelGeneration]);
  
  // 规则 4.2：监听 isPro 变化，Pro 时清空 AI 状态
  useEffect(() => {
    if (isPro) {
      // Pro 用户完全不需要 aiUsageStatus
      resetAiUsage();
      console.log('[ChatScreen] isPro = true, AI 状态已清空');
    }
  }, [isPro, resetAiUsage]);
  
  // 规则 3：页面聚焦时获取 AI 使用状态（非 Pro 用户）
  useFocusEffect(
    useCallback(() => {
      if (user && !isPro) {
        fetchAiUsageStatus().catch(() => {
          // 静默失败，后端兜底
          console.warn('[ChatScreen] fetchAiUsageStatus failed (silent)');
        });
      }
    }, [user, isPro, fetchAiUsageStatus]),
  );
  
  // 规则 6：统一的 AI 次数限制提示 UI（使用系统 ConfirmDialog）
  const showLimitReachedUi = useCallback(() => {
    setLimitDialog({ visible: true });
  }, []);
  
  // 处理「去开通会员」
  const handleGoToSubscription = useCallback(() => {
    setLimitDialog({ visible: false });
    navigation.navigate('ProSubscription' as never);
  }, [navigation]);
  
  // 处理「稍后再说」
  const handleDismissLimit = useCallback(() => {
    setLimitDialog({ visible: false });
  }, []);
  
  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    
    // 基础检查
    if (!messageText || !effectiveMasterId) {
      return;
    }
    
    // 规则 5：并发保护（必须）
    if (isSending) {
      console.log('[ChatScreen] isSending = true, 防止并发请求');
      return;
    }
    
    setIsSending(true);
    
    try {
      // 规则 2 + 规则 7：拦截检查（非 Pro 用户）
      if (!isPro) {
        // 如果状态为空，尝试拉一次（但不强制）
        if (!aiUsageStatus) {
          try {
            await fetchAiUsageStatus();
          } catch {
            // 拉不到 → 不拦截，允许发送（后端兜底）
            console.warn('[ChatScreen] fetchAiUsageStatus failed, 允许发送（后端兜底）');
          }
        }
        
        // 规则 7：如果本地剩余 <= 0，强制刷新一次确认（避免跨日误拦截）
        const currentStatus = useProStore.getState().aiUsageStatus;
        if (currentStatus && currentStatus.aiRemaining <= 0) {
          console.log('[ChatScreen] aiRemaining <= 0, 强制刷新确认');
          try {
            // 强制刷新，忽略节流
            await fetchAiUsageStatus({ force: true });
          } catch {
            // 拉不到 → 宁可放行，交给后端兜底
            console.warn('[ChatScreen] 强制刷新失败, 允许发送（后端兜底）');
          }
          
          // 用最新的状态再做一次判断
          const latest = useProStore.getState().aiUsageStatus;
          if (latest && latest.aiRemaining <= 0) {
            // 确认仍然 <= 0，才拦截
            console.log('[ChatScreen] 确认 aiRemaining <= 0, 拦截发送');
            showLimitReachedUi();
            return;
          }
          // 如果刷新后 > 0，继续发送（跨日重置了）
          console.log('[ChatScreen] 刷新后 aiRemaining > 0, 继续发送（跨日重置）');
        }
      }
      
      // 清空输入框
      setInputText('');
      
      // 添加用户消息到列表
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: messageText,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsThinking(true);
      
      // 滚动到底部
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 重置取消标志（新请求开始时）
      isCancelledRef.current = false;
      
      // 发送消息并接收流式响应
      await sendMessageWithStream(messageText);
      
      // 规则 5.4：发送成功后本地更新状态（只要接口返回 2xx 并开始输出，就算一次使用）
      if (!isPro && aiUsageStatus) {
        consumeAiUsageLocally();
      }
      
    } catch (error: any) {
      // 如果是主动取消或组件已卸载，不显示错误
      if (isCancelledRef.current || isUnmountedRef.current) {
        console.log('[Chat] Request cancelled or component unmounted, ignoring error');
        return;
      }
      
      // 规则 6：检查是否为 AI 次数限制错误（优先处理，不输出错误日志）
      if (error?.code === 'AI_DAILY_LIMIT_REACHED' || 
          (error?.message && error.message.includes('AI_DAILY_LIMIT_REACHED'))) {
        setIsThinking(false);
        
        // 统一使用 showLimitReachedUi
        showLimitReachedUi();
        
        // 可选：同步后端状态
        if (error.data) {
          // 如果后端返回了最新状态，可以更新本地
          console.log('[ChatScreen] 同步后端 AI 状态:', error.data);
        } else {
          // 或者强制刷新一次
          fetchAiUsageStatus({ force: true }).catch(() => {});
        }
        return;
      }
      
      // 其他错误才输出日志
      console.error('发送消息失败:', error);
      setIsThinking(false);
      
      // 显示友好的错误提示
      let errorMessage = '發送消息失敗，請稍後再試';
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        // SSL 证书错误（网络环境问题）
        if (errorMsg.includes('certificate') || errorMsg.includes('hostname') || errorMsg.includes('ssl')) {
          errorMessage = '網絡連接異常，可能是網絡環境問題。請嘗試：\n1. 切換到其他網絡（如手機熱點）\n2. 檢查是否使用了公共 WiFi\n3. 稍後再試';
        }
        // 网络连接错误
        else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('connection')) {
          errorMessage = '網絡連接失敗，請檢查您的網絡設置';
        }
        // 服务器错误
        else if (errorMsg.includes('server') || errorMsg.includes('500')) {
          errorMessage = '伺服器開小差了，請稍後再試';
        }
        // 其他错误，显示原始错误信息（截取前100字符）
        else {
          errorMessage = `發送失敗：${error.message.substring(0, 100)}`;
        }
      }
      
      setErrorDialog({
        visible: true,
        title: '發送失敗',
        message: errorMessage,
      });
    } finally {
      // 规则 5：必须在 finally 中重置 isSending
      setIsSending(false);
    }
  };
  
  const sendMessageWithStream = async (messageText: string) => {
    // 使用 XMLHttpRequest 实现 SSE（React Native 兼容）
    const url = `${ENV.API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`;
    
    // sectionKey 和 shenShaCode 只在第一条消息时传递（用于生成卡片解读）
    // 后续的追问应该走聊天模式，不再传这些参数
    const body = {
      message: messageText,
      chartId: effectiveMasterId!, // 使用 effectiveMasterId 作为 chartId
      ...(topic && { topic }),
      ...(source && { source }),
      // 只在第一条消息时传递 sectionKey 和 shenShaCode
      ...(isFirstMessageRef.current && sectionKey && { sectionKey }),
      ...(isFirstMessageRef.current && shenShaCode && { shenShaCode }),
    };
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 保存引用
      xhrRef.current = xhr;
      currentRequestRef.current = conversationId;
      
      // 从 authStore 获取 token
      const token = useAuthStore.getState().token;
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      let assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: '',
        createdAt: new Date().toISOString(),
      };
      
      let buffer = '';
      let hasAddedMessage = false;
      
      xhr.onprogress = () => {
        // 获取当前已接收的数据
        const responseText = xhr.responseText;
        const newData = responseText.substring(buffer.length);
        buffer = responseText;
        
        // 添加 assistant 消息（首次）
        if (!hasAddedMessage) {
          setMessages(prev => [...prev, assistantMessage]);
          setIsThinking(false);
          hasAddedMessage = true;
        }
        
        // 处理 SSE 数据
        const lines = newData.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'chunk') {
                // ⚠️ 重要：只对助手消息做简繁转换，用户消息绝对不转换
                const normalizedContent = normalizeToZhHK(data.content);
                
                // 更新消息内容
                assistantMessage.text += normalizedContent;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = { ...assistantMessage };
                  return newMessages;
                });
                
                // 滚动到底部
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              } else if (data.type === 'followups') {
                // 处理追问建议
                // ⚠️ 追问建议是系统生成的，需要转换为繁体
                if (data.followups && Array.isArray(data.followups)) {
                  // 将对象数组转换为字符串数组（提取 question 字段）
                  const followUpTexts = data.followups.map((item: any) => {
                    // 支持两种格式：对象 { type, question } 或直接是字符串
                    const question = typeof item === 'string' ? item : (item.question || item);
                    // 转换为繁体
                    return normalizeToZhHK(question);
                  });
                  
                  // 更新 assistant 消息的追问建议
                  assistantMessage.followUps = followUpTexts;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0) {
                      newMessages[lastIndex] = { ...assistantMessage };
                    }
                    return newMessages;
                  });
                  
                  console.log('[ChatScreen] Received followups:', followUpTexts);
                }
              } else if (data.type === 'done') {
                // 完成，更新 conversationId
                if (data.conversationId) {
                  setConversationId(data.conversationId);
                  currentRequestRef.current = data.conversationId;
                }
                assistantMessage.id = data.messageId || assistantMessage.id;
              } else if (data.type === 'error') {
                // 规则 6 + 规则 3.5：检查是否为 AI 次数限制错误（优先处理，不输出错误日志）
                if (data.code === 'AI_DAILY_LIMIT_REACHED') {
                  // 移除已添加的 assistant 消息（如果存在）
                  setMessages(prev => {
                    const filtered = prev.filter(msg => msg.id !== assistantMessage.id);
                    return filtered;
                  });
                  
                  setIsThinking(false);
                  
                  // 规则 6：统一使用 showLimitReachedUi
                  showLimitReachedUi();
                  
                  // 规则 3.5：统一错误格式 reject
                  reject({
                    code: 'AI_DAILY_LIMIT_REACHED',
                    message: data.message || '今日解讀次數已用完',
                    data: data.details, // 可选：包含最新状态
                  });
                  return;
                }
                
                // 其他错误才输出日志
                console.error('Stream error:', data.message);
                
                // 更新 assistant 消息显示错误信息（系统生成的错误消息也需要转换）
                assistantMessage.text = normalizeToZhHK(`❌ 錯誤：${data.message}`);
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (lastIndex >= 0) {
                    newMessages[lastIndex] = { ...assistantMessage };
                  }
                  return newMessages;
                });
                
                // 显示错误提示
                let errorMessage = '獲取回答失敗，請稍後再試';
                if (data.message) {
                  const errorMsg = data.message.toLowerCase();
                  if (errorMsg.includes('certificate') || errorMsg.includes('hostname') || errorMsg.includes('ssl')) {
                    errorMessage = '網絡連接異常，可能是網絡環境問題。請嘗試切換網絡或稍後再試';
                  } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
                    errorMessage = '網絡連接失敗，請檢查您的網絡設置';
                  } else {
                    errorMessage = `錯誤：${data.message.substring(0, 100)}`;
                  }
                }
                
                setErrorDialog({
                  visible: true,
                  type: 'error',
                  title: '獲取回答失敗',
                  message: errorMessage,
                });
                
                // 规则 3.5：统一错误格式
                reject({
                  code: data.code || 'STREAM_ERROR',
                  message: data.message,
                });
              }
            } catch (e) {
              // 忽略解析错误（可能是不完整的行）
            }
          }
        }
      };
      
      xhr.onload = () => {
        // 清理引用
        xhrRef.current = null;
        currentRequestRef.current = null;
        // 重置取消标志（请求成功完成）
        isCancelledRef.current = false;
        
        if (xhr.status >= 200 && xhr.status < 300) {
          // 第一条消息发送成功后，后续消息不再传 sectionKey（走聊天模式）
          isFirstMessageRef.current = false;
          resolve(undefined);
        } else {
          // 检查是否是 429 状态码（AI 次数限制）
          if (xhr.status === 429) {
            try {
              const responseText = xhr.responseText;
              if (responseText) {
                const response = JSON.parse(responseText);
                if (response?.error?.code === 'AI_DAILY_LIMIT_REACHED') {
                  // 规则 3.5：统一错误格式
                  reject({
                    code: 'AI_DAILY_LIMIT_REACHED',
                    message: response.error.message || '今日解讀次數已用完',
                    data: response.error.details,
                  });
                  return;
                }
              }
            } catch (e) {
              // 解析失败，继续使用通用错误
            }
          }
          // 规则 3.5：统一错误格式
          reject({
            code: 'HTTP_ERROR',
            message: `HTTP error! status: ${xhr.status}`,
          });
        }
      };
      
      xhr.onerror = () => {
        // 清理引用
        xhrRef.current = null;
        currentRequestRef.current = null;
        // 重置取消标志（网络错误，不是主动取消）
        isCancelledRef.current = false;
        
        // 显示错误消息
        setIsThinking(false);
        const errorMessage = '網絡連接失敗，請檢查您的網絡設置後重試';
        setErrorDialog({
          visible: true,
          type: 'error',
          title: '網絡錯誤',
          message: errorMessage,
        });
        
        // 规则 3.5：统一错误格式
        reject({
          code: 'NETWORK_ERROR',
          message: 'Network error',
        });
      };
      
      xhr.onabort = () => {
        // 清理引用
        xhrRef.current = null;
        currentRequestRef.current = null;
        
        // 如果是主动取消，不 reject（静默处理）
        if (isCancelledRef.current) {
          resolve(undefined);
        } else {
          // 非主动取消（如网络问题），才 reject
          // 规则 3.5：统一错误格式
          reject({
            code: 'REQUEST_ABORTED',
            message: 'Request aborted',
          });
        }
      };
      
      xhr.send(JSON.stringify(body));
    });
  };
  
  // 首轮问题自动发送（只有在没有历史消息且有问题时才自动发送）
  useEffect(() => {
    if (question && effectiveMasterId && (!initialConversationId || initialConversationId === 'new')) {
      // 只有在新建对话时才自动发送
      handleSendMessage(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, effectiveMasterId, initialConversationId]);
  
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    
    return (
      <View>
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}>
          <View style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
          ]}>
            {isUser ? (
              <Text style={[
                styles.messageText,
                styles.userMessageText,
              ]}>
                {item.text}
              </Text>
            ) : (
              <Markdown style={markdownStyles}>
                {item.text}
              </Markdown>
            )}
          </View>
        </View>
        
        {/* 追问建议（仅 AI 消息且有建议时显示） */}
        {!isUser && item.followUps && item.followUps.length > 0 && (
          <FollowUpSuggestions
            suggestions={item.followUps}
            onSuggestionPress={(suggestion) => handleSendMessage(suggestion)}
          />
        )}
      </View>
    );
  };
  
  const renderThinkingBubble = () => {
    if (!isThinking) return null;
    
    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, styles.assistantMessageBubble, styles.thinkingBubble]}>
          <ActivityIndicator size="small" color={colors.ink} />
          <Text style={[styles.messageText, styles.assistantMessageText, styles.thinkingText]}>
            思考中...
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView testID="chat-screen" style={styles.container} edges={['top', 'bottom']}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>与小佩聊天</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* 消息列表 */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={renderThinkingBubble}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        />
        
        {/* 底部输入框 */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              inputRef.current?.focus();
            }}
            style={styles.inputWrapper}
          >
            <TextInput
              ref={inputRef}
              testID="chat-input"
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="輸入消息..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              editable={true}
              keyboardType="default"
              returnKeyType="send"
              blurOnSubmit={false}
              textAlignVertical="top"
              onFocus={() => {
                // 确保键盘弹出时滚动到底部
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onSubmitEditing={() => {
                if (inputText.trim() && !isThinking) {
                  handleSendMessage();
                }
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="send-button"
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={Boolean(!inputText.trim() || isThinking)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sendButtonText, !inputText.trim() && styles.sendButtonTextDisabled]}>發送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* 错误对话框 */}
      <ConfirmDialog
        visible={errorDialog.visible}
        title={errorDialog.title}
        message={errorDialog.message}
        confirmText="確定"
        onConfirm={() => setErrorDialog({ ...errorDialog, visible: false })}
      />
      
      {/* AI 次数限制对话框（规则 6：统一 UI） */}
      <ConfirmDialog
        visible={limitDialog.visible}
        title="今日免費解讀用完囉"
        message={`今天 ${aiUsageStatus?.aiDailyLimit || 5} 次免費解讀已用完。\n升級小佩會員，每天 100 次 AI 解讀。`}
        cancelText="稍後再說"
        confirmText="升級會員"
        onCancel={handleDismissLimit}
        onConfirm={handleGoToSubscription}
      />
    </SafeAreaView>
  );
};

// ===== Markdown 样式配置 =====
const markdownStyles = {
  // 正文
  body: {
    fontSize: fontSizes.base,
    lineHeight: 22,
    color: colors.ink,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  // 一级标题 (###)
  heading3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  // 二级标题 (####)
  heading4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  // 三级标题 (#####)
  heading5: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  // 粗体
  strong: {
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  // 段落
  paragraph: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 列表项
  listItem: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: 'row' as const,
  },
  // 无序列表
  bullet_list: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 有序列表
  ordered_list: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 表格
  table: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden' as const,
  },
  // 表格行
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // 表格单元格
  tableCell: {
    padding: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    flex: 1,
  },
  // 表格头部
  tableHeader: {
    backgroundColor: colors.disabledBg,
    fontWeight: fontWeights.semibold,
  },
  // 引用块
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.disabledBg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  // 代码块
  code_inline: {
    backgroundColor: colors.disabledBg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    fontSize: fontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  // 代码块（多行）
  fence: {
    backgroundColor: colors.disabledBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 链接
  link: {
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
  // 水平分割线
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start', // 固定头像在顶部
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginTop: 0, // 头像固定在顶部，不随消息移动
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  userMessageBubble: {
    maxWidth: '70%',
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  assistantMessageBubble: {
    maxWidth: '100%',
    backgroundColor: 'transparent', // 扁平化：无背景
    paddingHorizontal: 0, // 扁平化：移除水平内边距
    paddingVertical: 0, // 扁平化：移除垂直内边距
    borderRadius: 0, // 扁平化：移除圆角
    alignSelf: 'flex-start', // 确保靠左对齐
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg, // "思考中"保留卡片样式
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '50%',
  },
  messageText: {
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.bg,
  },
  assistantMessageText: {
    color: colors.ink,
  },
  thinkingText: {
    marginLeft: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    width: '100%',
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm + 2, // 多行文本时顶部对齐
    fontSize: fontSizes.base,
    color: colors.ink,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    marginLeft: spacing.xs, // 进一步缩小间距，让输入框更靠近发送按钮
    paddingHorizontal: spacing.md,
    height: 44, // 固定高度，与输入框对齐
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  sendButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    color: colors.disabledText,
  },
});

