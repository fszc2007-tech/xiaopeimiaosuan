/**
 * 关于小佩页面
 * 
 * 功能：
 * - 显示当前版本号
 * - 用户协议
 * - 私隐政策
 * - 个人资料收集声明
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Shield, Info, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '@/components/common/BackButton';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { PolicyType } from '@/components/auth/AgreementCheckbox';

export const AboutXiaopeiScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // 处理查看政策文档
  const handleViewPolicy = (type: PolicyType) => {
    navigation.navigate('PolicyViewer' as never, { type } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('dialog.aboutXiaopei')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 版本信息 */}
        <Section title="">
          <Cell
            icon={Info}
            iconBg={colors.greenSoftBg}
            iconColor={colors.primary}
            label="當前版本"
            desc="版本 1.0.0"
            onPress={undefined}
          />
        </Section>

        {/* 法律文档 */}
        <Section title="">
          <Cell
            icon={FileText}
            iconBg={colors.greenSoftBg}
            iconColor={colors.brandGreen}
            label={t('dialog.userAgreement')}
            desc="查看服務條款"
            onPress={() => handleViewPolicy('agreement')}
          />
          <Cell
            icon={Shield}
            iconBg={colors.greenSoftBg}
            iconColor={colors.brandGreen}
            label="私隱政策"
            desc="了解我們如何保護您的私隱"
            onPress={() => handleViewPolicy('privacy')}
          />
          <Cell
            icon={FileText}
            iconBg={colors.greenSoftBg}
            iconColor={colors.brandGreen}
            label="個人資料收集聲明"
            desc="了解我們如何收集和使用您的個人資料"
            onPress={() => handleViewPolicy('pics')}
          />
        </Section>

        {/* 底部空白 */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Section 组件
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// Cell 组件
interface CellProps {
  icon: React.ComponentType<{ color: string; size: number }>;
  iconBg: string;
  iconColor: string;
  label: string;
  desc?: string;
  onPress?: (() => void) | undefined;
}

const Cell: React.FC<CellProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  desc,
  onPress,
}) => {
  if (!onPress) {
    // 不可点击的版本信息
    return (
      <View style={styles.cell}>
        <View style={[styles.cellIcon, { backgroundColor: iconBg }]}>
          <Icon color={iconColor} size={20} />
        </View>
        <View style={styles.cellTextContent}>
          <Text style={styles.cellLabel}>{label}</Text>
          {desc && <Text style={styles.cellDesc}>{desc}</Text>}
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        pressed && styles.cellPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.cellIcon, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={20} />
      </View>
      <View style={styles.cellTextContent}>
        <Text style={styles.cellLabel}>{label}</Text>
        {desc && <Text style={styles.cellDesc}>{desc}</Text>}
      </View>
      <ChevronRight color={colors.textSecondary} size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xs,
    paddingBottom: spacing['2xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  headerRight: {
    width: 40,
  },

  // Section
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  // Cell
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellPressed: {
    backgroundColor: colors.greenSoftBg,
    opacity: 0.8,
  },
  cellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cellTextContent: {
    flex: 1,
  },
  cellLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: 2,
  },
  cellDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  footer: {
    height: spacing['2xl'],
  },
});

