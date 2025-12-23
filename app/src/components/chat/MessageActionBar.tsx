/**
 * 消息操作栏组件
 * 
 * 功能：复制、点赞、点踩、分享
 * 样式：参考 GPT 的简洁图标风格
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Copy, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react-native';
import { ChatMessage } from '@/types/chat';
import { colors, spacing } from '@/theme';

interface MessageActionBarProps {
  message: ChatMessage;
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
}

export const MessageActionBar: React.FC<MessageActionBarProps> = ({
  message,
  onCopy,
  onLike,
  onDislike,
  onShare,
}) => {
  const rating = message.feedback?.rating;
  const isLiked = rating === 'up';
  const isDisliked = rating === 'down';

  const iconColor = colors.textSecondary;
  const iconSize = 18;
  const strokeWidth = 2; // 加粗

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onCopy} 
        style={styles.iconButton} 
        activeOpacity={0.5}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Copy size={iconSize} color={iconColor} strokeWidth={strokeWidth} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onLike} 
        style={styles.iconButton} 
        activeOpacity={0.5}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ThumbsUp 
          size={iconSize} 
          color={isLiked ? colors.primary : iconColor} 
          strokeWidth={strokeWidth}
          fill={isLiked ? colors.primary : 'none'}
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onDislike} 
        style={styles.iconButton} 
        activeOpacity={0.5}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ThumbsDown 
          size={iconSize} 
          color={isDisliked ? colors.error : iconColor} 
          strokeWidth={strokeWidth}
          fill={isDisliked ? colors.error : 'none'}
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onShare} 
        style={styles.iconButton} 
        activeOpacity={0.5}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Share2 size={iconSize} color={iconColor} strokeWidth={strokeWidth} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -3, // 负边距，更贴近文字
    marginBottom: 4, // 底部间距 4px
    gap: 5, // 图标间距 5px
  },
  iconButton: {
    padding: 1,
  },
});

