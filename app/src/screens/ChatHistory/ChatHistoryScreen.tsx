/**
 * 聊天记录页面
 * 
 * 功能：
 * - 展示历史对话列表
 * - 按时间分组
 * - 搜索对话
 * - 删除对话
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MessageCircle, Trash2, Clock } from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { SCREEN_NAMES } from '@/constants/routes';
import { chatService } from '@/services/api';
import { ConversationItemDto } from '@/types';
import { ConfirmDialog, MessageDialog, MessageType } from '@/components/common';

// 类型定义（兼容本地使用）
interface Conversation {
  conversationId: string;
  chartId: string;
  chartName: string;
  topic?: string;
  lastMessage: string;
  lastMessageAt: string;
}

export const ChatHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageDialog, setMessageDialog] = useState<{
    visible: boolean;
    type: MessageType;
    title: string;
    message?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
  });

  // 获取对话列表
  const fetchConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // 调用 Core API
      const result = await chatService.getConversations({
        page: 1,
        pageSize: 100, // 获取所有对话
        dateFilter: 'all',
      });
      
      // 转换数据格式
      const convertedData: Conversation[] = result.items.map((item: ConversationItemDto) => ({
        conversationId: item.conversationId,
        chartId: item.masterId,
        chartName: item.masterName,
        topic: item.topic,
        lastMessage: item.lastMessagePreview || item.firstQuestion || '暂无消息',
        lastMessageAt: typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.toISOString(),
      }));
      
      setConversations(convertedData);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      Alert.alert('错误', error.message || '获取聊天记录失败');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 页面聚焦时刷新
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // 下拉刷新
  const handleRefresh = () => {
    fetchConversations(true);
  };

  // 点击对话
  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate(SCREEN_NAMES.CHAT as any, {
      conversationId: conversation.conversationId,
      masterId: conversation.chartId, // 传递 masterId（chartId 实际存储的是 masterId）
    });
  };

  // 删除对话
  const handleDelete = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConversationId) return;
    
    try {
      await chatService.deleteConversation(selectedConversationId);
      setDeleteDialogVisible(false);
      setSelectedConversationId(null);
      setMessageDialog({
        visible: true,
        type: 'success',
        title: '成功',
        message: '對話已刪除',
      });
      fetchConversations(true);
    } catch (error: any) {
      setDeleteDialogVisible(false);
      setSelectedConversationId(null);
      setMessageDialog({
        visible: true,
        type: 'error',
        title: '错误',
        message: error.message || '刪除失敗',
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogVisible(false);
    setSelectedConversationId(null);
  };

  // 按日期分组
  const groupedConversations = groupByDate(conversations);

  // 空状态
  if (!isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with back button */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>我的解讀</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <MessageCircle color={colors.textSecondary} size={80} strokeWidth={1} />
          <Text style={styles.emptyTitle}>還沒有任何對話記錄</Text>
          <Text style={styles.emptyDesc}>
            開始和小佩聊天吧，你的對話記錄會自動保存在這裡。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>我的解讀</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 对话列表 */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {Object.entries(groupedConversations).map(([date, convs]) => (
          <View key={date} style={styles.section}>
            <Text style={styles.sectionTitle}>{date}</Text>
            {convs.map((conversation) => (
              <ConversationCard
                key={conversation.conversationId}
                conversation={conversation}
                onPress={() => handleConversationPress(conversation)}
                onDelete={() => handleDelete(conversation.conversationId)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="確認刪除"
        message="確定要刪除這段對話嗎？此操作無法撤銷。"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />

      {/* 消息提示弹窗 */}
      <MessageDialog
        visible={messageDialog.visible}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
        onConfirm={() => setMessageDialog({ ...messageDialog, visible: false })}
      />
    </SafeAreaView>
  );
};

// 对话卡片组件
interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  onDelete: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onPress,
  onDelete,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationCard,
        pressed && styles.conversationCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle}>{conversation.chartName}</Text>
          <Text style={styles.conversationTime}>
            {formatRelativeTime(conversation.lastMessageAt)}
          </Text>
        </View>
        
        <Text style={styles.conversationMessage} numberOfLines={2}>
          {stripMarkdown(conversation.lastMessage)}
        </Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Trash2 color={colors.brandRed} size={18} />
      </Pressable>
    </Pressable>
  );
};

// 去除 Markdown 符号，转换为纯文本
function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // 移除标题标记 (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体标记 (**text** 或 __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // 移除斜体标记 (*text* 或 _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除代码块标记 (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码标记 (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接标记 ([text](url))
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 移除列表标记 (- * +)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // 移除数字列表标记 (1. 2. 3.)
    .replace(/^\d+\.\s+/gm, '')
    // 移除引用标记 (>)
    .replace(/^>\s+/gm, '')
    // 移除水平线 (---)
    .replace(/^---+$/gm, '')
    // 移除多余的空行
    .replace(/\n{3,}/g, '\n\n')
    // 去除首尾空白
    .trim();
}

// 按日期分组函数
function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const groups: Record<string, Conversation[]> = {};
  
  conversations.forEach((conv) => {
    const date = formatDate(conv.lastMessageAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
  });
  
  return groups;
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return '今天';
  } else if (isSameDay(date, yesterday)) {
    return '昨天';
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// 格式化相对时间
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

// 判断是否同一天
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.md,
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
  
  // 列表
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  
  // 对话卡片
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  conversationCardPressed: {
    opacity: 0.7,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  conversationTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  conversationMessage: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deleteButton: {
    padding: spacing.sm,
    justifyContent: 'center',
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

