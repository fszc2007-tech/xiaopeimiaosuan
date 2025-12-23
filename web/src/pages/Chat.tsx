/**
 * AI 對話頁面（H5 版 - 完整版）
 * 
 * ✅ 繁體中文
 * ✅ 與 App 端 UI 和邏輯保持一致
 * ✅ SSE 流式對話
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatService } from '@/services/api/chatService';
import { useChartStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  followUps?: string[];
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortRef = useRef<(() => void) | null>(null);
  
  // 從 URL 參數獲取初始問題和上下文
  const initialQuestion = searchParams.get('question');
  const topic = searchParams.get('topic');
  const source = searchParams.get('source');
  
  const { currentChartId } = useChartStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('new');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);
  
  // 初始加載時發送初始問題
  useEffect(() => {
    if (initialQuestion && currentChartId) {
      setInputText(initialQuestion);
      // 自動發送初始問題
      setTimeout(() => {
        handleSend(initialQuestion);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 發送消息（SSE 流式）
  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading || isStreaming) return;
    
    if (!currentChartId) {
      alert('請先選擇一個命盤');
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    
    try {
      const { reader, abort } = await chatService.sendMessageStream({
        conversationId,
        message: messageText,
        chartId: currentChartId,
        topic: topic || undefined,
        source: source || undefined,
      });
      
      readerRef.current = reader;
      abortRef.current = abort;
      
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let newConversationId = conversationId;
      let followUps: string[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream complete');
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              // 處理不同類型的事件
              if (parsed.type === 'conversation_id') {
                newConversationId = parsed.conversationId;
                setConversationId(parsed.conversationId);
              } else if (parsed.type === 'content') {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              } else if (parsed.type === 'follow_ups') {
                followUps = parsed.followUps || [];
              } else if (parsed.type === 'error') {
                console.error('Stream error:', parsed.error);
                throw new Error(parsed.error.message || '對話失敗');
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
      
      // 流式完成，添加完整消息
      if (fullContent) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
          followUps: followUps.length > 0 ? followUps : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      
      setStreamingContent('');
      setIsStreaming(false);
    } catch (error: any) {
      console.error('發送消息失敗:', error);
      
      // 添加錯誤消息
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，發生錯誤：${error.message || '請稍後重試'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent('');
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      readerRef.current = null;
      abortRef.current = null;
    }
  };
  
  // 取消正在生成的對話
  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current();
      setIsStreaming(false);
      setStreamingContent('');
      setIsLoading(false);
      
      // 調用後端取消接口
      if (conversationId && conversationId !== 'new') {
        chatService.cancelGeneration(conversationId).catch(console.error);
      }
    }
  };
  
  // 處理追問點擊
  const handleFollowUpClick = (question: string) => {
    setInputText(question);
    setTimeout(() => {
      handleSend(question);
    }, 100);
  };
  
  // 處理Enter鍵
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 組件卸載時取消請求
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, []);
  
  return (
    <div className="chat-page">
      {/* 頭部 */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/charts')}>
          ← 返回
        </button>
        <div className="chat-title">
          <h1>小佩 AI 助手</h1>
          <p className="status">{isStreaming ? '正在思考...' : '在線'}</p>
        </div>
        <button className="icon-button" onClick={() => navigate('/chat-history')}>
          📋
        </button>
      </div>
      
      {/* 消息列表 */}
      <div className="messages-container">
        {messages.length === 0 && !streamingContent ? (
          <div className="empty-chat">
            <div className="welcome-icon">👋</div>
            <h2>您好！我是小佩</h2>
            <p>我可以幫您解讀命盤、回答命理問題</p>
            <div className="suggested-questions">
              <button className="suggestion-chip" onClick={() => handleFollowUpClick('我的命盤有什麼特點？')}>
                我的命盤有什麼特點？
              </button>
              <button className="suggestion-chip" onClick={() => handleFollowUpClick('今年的運勢如何？')}>
                今年的運勢如何？
              </button>
              <button className="suggestion-chip" onClick={() => handleFollowUpClick('桃花運怎麼樣？')}>
                桃花運怎麼樣？
              </button>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`message-wrapper ${message.role}`}>
                  {message.role === 'assistant' && (
                    <div className="message-avatar">🤖</div>
                  )}
                  <div className={`message-bubble ${message.role}`}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="markdown-content">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="message-avatar">👤</div>
                  )}
                </div>
                
                {/* 追問建議 */}
                {message.role === 'assistant' && message.followUps && message.followUps.length > 0 && (
                  <div className="follow-ups-container">
                    <p className="follow-ups-label">您可能還想問：</p>
                    <div className="follow-ups-list">
                      {message.followUps.map((followUp, index) => (
                        <button
                          key={index}
                          className="follow-up-chip"
                          onClick={() => handleFollowUpClick(followUp)}
                          disabled={isLoading || isStreaming}
                        >
                          {followUp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* 流式內容 */}
            {isStreaming && streamingContent && (
              <div className="message-wrapper assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble assistant streaming">
                  <ReactMarkdown className="markdown-content">
                    {streamingContent}
                  </ReactMarkdown>
                  <div className="streaming-cursor">▊</div>
                </div>
              </div>
            )}
            
            {/* 思考中狀態 */}
            {isLoading && !streamingContent && (
              <div className="message-wrapper assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble assistant loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* 輸入區域 */}
      <div className="chat-input-container">
        {isStreaming && (
          <button className="cancel-button" onClick={handleCancel}>
            停止生成
          </button>
        )}
        <textarea
          className="chat-input"
          placeholder={isStreaming ? '正在生成回復...' : '輸入您的問題...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isLoading || isStreaming}
        />
        <button
          className="send-button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading || isStreaming}
        >
          發送
        </button>
      </div>
    </div>
  );
};

