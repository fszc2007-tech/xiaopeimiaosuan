/**
 * 点踩原因选择底部弹窗
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { ChatMessage, DislikeReason } from '@/types/chat';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

interface DislikeBottomSheetProps {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
  onSubmit: (messageId: string, reasons: DislikeReason[], comment?: string) => void;
}

// 点踩原因选项（与后端 DISLIKE_REASONS 对齐）
const DISLIKE_REASON_OPTIONS: { id: DislikeReason; label: string }[] = [
  { id: 'understand_wrong', label: '理解錯題意' },
  { id: 'not_professional', label: '命理解讀不準／不專業' },
  { id: 'too_generic', label: '內容太空泛，沒有幫助' },
  { id: 'incorrect', label: '內容有錯誤或前後矛盾' },
  { id: 'expression_bad', label: '文字表達不好（太長／看不懂）' },
  { id: 'other', label: '其他' },
];

export const DislikeBottomSheet: React.FC<DislikeBottomSheetProps> = ({
  visible,
  message,
  onClose,
  onSubmit,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<DislikeReason[]>([]);
  const [comment, setComment] = useState('');

  const handleReasonToggle = (reasonId: DislikeReason) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = () => {
    if (!message) return;
    
    if (selectedReasons.length === 0) {
      // 可以提示用户至少选择一个原因，或者允许空数组
      // 根据需求，这里允许空数组提交
    }
    
    onSubmit(message.messageId, selectedReasons, comment.trim() || undefined);
    
    // 重置状态
    setSelectedReasons([]);
    setComment('');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSelectedReasons([]);
    setComment('');
    onClose();
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={dismissKeyboard}>
          {/* 拖拽指示器 */}
          <View style={styles.dragIndicator} />

          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>選擇不滿意原因</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>取消</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 原因选项 */}
            <View style={styles.reasonsContainer}>
              {DISLIKE_REASON_OPTIONS.map((option) => {
                const isSelected = selectedReasons.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                    onPress={() => handleReasonToggle(option.id)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 备注输入 */}
            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="請描述您的具體意見..."
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.commentHint}>
                {comment.length}/500
              </Text>
            </View>
          </ScrollView>

          {/* 提交按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, selectedReasons.length === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={selectedReasons.length === 0}
            >
              <Text style={[styles.submitButtonText, selectedReasons.length === 0 && styles.submitButtonTextDisabled]}>
                提交
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: Dimensions.get('window').height * 0.55, // 固定半屏高度
    paddingTop: spacing.xs,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.disabledBg,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  closeButton: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  reasonsContainer: {
    paddingVertical: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: 4, // 4px 保持一致间距
    backgroundColor: colors.bg,
  },
  reasonItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: radius.xs,
    backgroundColor: colors.cardBg,
  },
  reasonLabel: {
    fontSize: fontSizes.md,
    color: colors.ink,
    flex: 1,
  },
  reasonLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  commentSection: {
    marginTop: 1, // 1px
    marginBottom: spacing.lg,
  },
  commentLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  commentInput: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.ink,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  submitButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.cardBg,
  },
  submitButtonTextDisabled: {
    color: colors.textSecondary,
  },
});

