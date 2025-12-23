/**
 * ChatGPT (OpenAI) API 集成
 * 
 * 模型：gpt-4o
 * 
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */

import axios from 'axios';
import { ILLMProvider, LLMConfig, LLMRequest, LLMResponse, StreamChunk } from '../types';

export class ChatGPTProvider implements ILLMProvider {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  /**
   * ⚠️ 已废弃：ChatGPT 仅支持流式响应
   * 此方法会自动转为流式调用并返回完整结果
   */
  async chat(request: LLMRequest): Promise<LLMResponse> {
    console.warn('[ChatGPT] chat() is deprecated. Use chatStream() instead.');
    
    // 自动转为流式调用
    let fullContent = '';
    
    for await (const chunk of this.chatStream(request)) {
      if (!chunk.done) {
        fullContent += chunk.content;
      }
    }
    
    return {
      content: fullContent,
      finishReason: 'stop',
    };
  }
  
  /**
   * 流式对话
   */
  async *chatStream(request: LLMRequest): AsyncGenerator<StreamChunk> {
    const { messages, temperature = 0.7, maxTokens = 2000 } = request;
    
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
          timeout: 60000,
        }
      );
      
      // 处理流式响应
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;
              
              if (delta?.content) {
                yield { content: delta.content, done: false };
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[ChatGPT] Stream failed:', error.response?.data || error.message);
      throw new Error(`ChatGPT API 流式调用失败: ${error.message}`);
    }
  }
  
  getModelName(): string {
    return 'gpt-4o';
  }
}

