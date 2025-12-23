/**
 * 主題設置頁面
 * 
 * 功能：
 * - 跟隨系統開關
 * - 淺色/深色模式選擇
 * - 即時生效，持久化存儲
 * 
 * 交互規則（已拍板）：
 * - Switch「跟隨系統」= themeMode === 'system'
 * - 「跟隨系統」開啟時，單選列表仍可點擊（點擊後自動關閉跟隨系統）
 * - Switch 從 ON → OFF 時，落到當前 resolvedTheme
 * - 勾選顯示當前 resolvedTheme（目前生效）
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { useTheme } from '@/theme';
import { fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import { ThemeMode } from '@/theme/themeResolver';

export const ThemeSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { themeMode, resolvedTheme, colors, setThemeMode } = useTheme();

  // 是否跟隨系統
  const isFollowSystem = themeMode === 'system';

  // 處理跟隨系統開關變化
  const handleFollowSystemChange = (value: boolean) => {
    if (value) {
      // 開啟：設置為 system
      setThemeMode('system');
    } else {
      // 關閉：落到當前 resolvedTheme
      setThemeMode(resolvedTheme);
    }
  };

  // 處理模式選擇
  const handleModeSelect = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
  };

  // 獲取當前顯示的模式文字
  const getCurrentModeText = () => {
    return resolvedTheme === 'dark' ? '深色' : '淺色';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 頂部導航欄 */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>主題設置</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 跟隨系統 */}
        <Section title="" colors={colors}>
          <View style={[styles.switchCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.switchCellContent}>
              <View style={[styles.cellIcon, { backgroundColor: colors.greenSoftBg }]}>
                <Palette color={colors.primary} size={20} />
              </View>
              <View style={styles.cellTextContent}>
                <Text style={[styles.cellLabel, { color: colors.textPrimary }]}>跟隨系統</Text>
                <Text style={[styles.cellDesc, { color: colors.textSecondary }]}>
                  開啟後，將跟隨系統打開或關閉深色模式
                </Text>
                {isFollowSystem && (
                  <Text style={[styles.cellDescSmall, { color: colors.primary }]}>
                    目前：{getCurrentModeText()}
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={isFollowSystem}
              onValueChange={handleFollowSystemChange}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Section>

        {/* 手動選擇 */}
        <Section title="手動選擇" colors={colors}>
          <View style={[styles.sectionContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* 淺色模式 */}
            <Pressable
              style={({ pressed }) => [
                styles.radioCell,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.greenSoftBg, opacity: 0.8 },
              ]}
              onPress={() => handleModeSelect('light')}
            >
              <View style={styles.radioCellContent}>
                <View style={[styles.cellIcon, { backgroundColor: colors.greenSoftBg }]}>
                  <Sun color={colors.brandOrange} size={20} />
                </View>
                <View style={styles.cellTextContent}>
                  <Text style={[styles.cellLabel, { color: colors.textPrimary }]}>淺色模式</Text>
                </View>
              </View>
              {resolvedTheme === 'light' && (
                <Check color={colors.primary} size={20} />
              )}
            </Pressable>

            {/* 深色模式 */}
            <Pressable
              style={({ pressed }) => [
                styles.radioCell,
                styles.radioCellLast,
                pressed && { backgroundColor: colors.greenSoftBg, opacity: 0.8 },
              ]}
              onPress={() => handleModeSelect('dark')}
            >
              <View style={styles.radioCellContent}>
                <View style={[styles.cellIcon, { backgroundColor: colors.blueSoftBg }]}>
                  <Moon color={colors.brandBlue} size={20} />
                </View>
                <View style={styles.cellTextContent}>
                  <Text style={[styles.cellLabel, { color: colors.textPrimary }]}>深色模式</Text>
                </View>
              </View>
              {resolvedTheme === 'dark' && (
                <Check color={colors.primary} size={20} />
              )}
            </Pressable>
          </View>
        </Section>

        {/* 說明文字 */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: colors.textTertiary }]}>
            選擇「跟隨系統」後，App 會根據您的設備設置自動切換淺色或深色模式。
          </Text>
        </View>

        {/* 底部空白 */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Section 組件
interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
}

const Section: React.FC<SectionProps> = ({ title, children, colors }) => (
  <View style={styles.section}>
    {title ? <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerRight: {
    width: 40,
  },

  // Section
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },

  // Switch Cell
  switchCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  switchCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },

  // Radio Cell
  radioCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  radioCellLast: {
    borderBottomWidth: 0,
  },
  radioCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Cell Icon
  cellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  // Cell Text
  cellTextContent: {
    flex: 1,
  },
  cellLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    marginBottom: 2,
  },
  cellDesc: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * 1.4,
  },
  cellDescSmall: {
    fontSize: fontSizes.xs,
    marginTop: 4,
    fontWeight: fontWeights.medium,
  },

  // Info Section
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  infoText: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * 1.5,
  },

  footer: {
    height: spacing['2xl'],
  },
});

export default ThemeSettingsScreen;

