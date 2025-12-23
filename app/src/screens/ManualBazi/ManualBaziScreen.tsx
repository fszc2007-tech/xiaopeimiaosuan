/**
 * 手動排盤頁 / ManualBaziScreen
 * 
 * 修復內容：
 * - ✅ Picker 顯示當前選中的值
 * - ✅ 添加下拉箭頭圖標
 * - ✅ 修復文字換行問題
 * - ✅ 可點擊的視覺反饋
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  ChevronDown,
  Sparkles,
} from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { BirthDateTimePickerSheet } from '@/components/birth';
import { BirthInputVM, DEFAULT_BIRTH_INPUT } from '@/types/birth';
import { RootStackParamList } from '@/types/navigation';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import * as chartService from '@/services/api/baziApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BaziFormData {
  gender: 'male' | 'female' | null;
  calendarType: 'solar' | 'lunar' | null;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  name?: string;
  birthPlace?: string;
  relation?: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
}

export const ManualBaziScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  
  const [formData, setFormData] = useState<BaziFormData>({
    gender: null,
    calendarType: null,
    year: '1990',
    month: '1',
    day: '1',
    hour: '0',
    minute: '0',
    name: '',
    birthPlace: '',
    relation: undefined,
  });
  
  // 出生信息（用於新彈窗）
  const [birthInput, setBirthInput] = useState<BirthInputVM>({
    ...DEFAULT_BIRTH_INPUT,
    calendarType: formData.calendarType || null,
  });
  
  // 出生信息彈窗顯示狀態
  const [birthPickerVisible, setBirthPickerVisible] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // 同步 birthInput 到 formData（用於顯示）
  useEffect(() => {
    setFormData({
      ...formData,
      calendarType: birthInput.calendarType,
      year: birthInput.year.toString(),
      month: birthInput.month.toString(),
      day: birthInput.day.toString(),
      hour: birthInput.hour.toString(),
      minute: birthInput.minute.toString(),
    });
  }, [birthInput]);

  // 曆法雙向聯動：基礎信息頁 → 彈窗
  useEffect(() => {
    if (formData.calendarType) {
      setBirthInput({
        ...birthInput,
        calendarType: formData.calendarType,
      });
    }
  }, [formData.calendarType]);

  const isFormValid = () => {
    return (
      formData.gender &&
      formData.calendarType &&
      formData.year &&
      formData.month &&
      formData.day &&
      formData.hour !== null &&
      formData.minute !== null
    );
  };

  // 處理出生信息彈窗確認
  const handleBirthInputConfirm = (value: BirthInputVM) => {
    setBirthInput(value);
    // 同步曆法到基礎信息頁
    setFormData({
      ...formData,
      calendarType: value.calendarType,
    });
    setBirthPickerVisible(false);
  };
  
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert(t('dialog.tip'), t('dialog.pleaseFillAllFields'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const requestData: any = {
        name: formData.name || t('dialog.unnamed'),
        gender: formData.gender!,
        birth: {
          year: birthInput.year,
          month: birthInput.month,
          day: birthInput.day,
          hour: birthInput.hour,
          minute: birthInput.minute,
          calendar_type: birthInput.calendarType, // ✅ 新增：曆法類型
        },
        timezone_offset_minutes: birthInput.timezoneOffsetMinutes, // ✅ 新增：時區偏移
        is_dst: birthInput.isDst, // ✅ 新增：夏令時
        ...(formData.relation && { relationType: formData.relation }),
        ...(formData.birthPlace && { 
          birth_place: formData.birthPlace,
          notes: `出生地：${formData.birthPlace}` 
        }),
      };
      
      console.log('📤 提交排盤數據:', requestData);
      
      // ✅ chartService.computeChart 使用辅助函数，直接返回数据（不是 ApiResponse）
      const result = await chartService.computeChart(requestData);
      
      console.log('✅ 命盤創建成功:', result);
      
      // 獲取返回的命盤 ID（直接从 result 访问，不需要 .data）
      const chartId = result?.chartId;
      const profileId = result?.profileId;
      
      console.log('📊 命盤ID:', chartId, '檔案ID:', profileId);
      
      if (chartId && profileId) {
        // 直接跳轉到命盤詳情頁
        navigation.replace('ChartDetail', {
          chartId: chartId,
          masterId: profileId,
          initialTab: 'basic',
        });
      } else {
        // 如果沒有返回 ID（不應該發生），則顯示成功提示並返回
        Alert.alert(t('dialog.success'), t('dialog.chartCreated'), [
          {
            text: t('dialog.confirm'),
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('❌ 創建命盤失敗:', error);
      Alert.alert(t('dialog.error'), error.message || t('dialog.createChartFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* 渐变背景 */}
      <LinearGradient
        colors={['#f8f9fa', '#ffffff', '#f8f9fa']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>排盤，開啟生命之旅</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 基本出生信息（必填） */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>基本資訊</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>必填</Text>
                  </View>
                </View>
              </View>
              
              {/* 性别和曆法 - 同一行 */}
              <View style={styles.rowContainer}>
                {/* 性别 */}
                <View style={styles.halfField}>
                  <View style={styles.fieldLabelRow}>
                    <User size={16} color={colors.textSecondary} />
                    <Text style={styles.fieldLabel}>性別</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        styles.chipSmall,
                        formData.gender === 'male' && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, gender: 'male' })}
                      activeOpacity={0.6}
                      accessibilityLabel="選擇性別：男"
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.gender === 'male' }}
                    >
                      <User size={14} color={formData.gender === 'male' ? '#ffffff' : colors.primary} />
                      <Text style={[
                        styles.chipText,
                        styles.chipTextSmall,
                        formData.gender === 'male' && styles.chipTextSelected,
                      ]}>
                        男
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        styles.chipSmall,
                        formData.gender === 'female' && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, gender: 'female' })}
                      activeOpacity={0.6}
                      accessibilityLabel="選擇性別：女"
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.gender === 'female' }}
                    >
                      <User size={14} color={formData.gender === 'female' ? '#ffffff' : colors.primary} />
                      <Text style={[
                        styles.chipText,
                        styles.chipTextSmall,
                        formData.gender === 'female' && styles.chipTextSelected,
                      ]}>
                        女
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* 曆法 */}
                <View style={styles.halfField}>
                  <View style={styles.fieldLabelRow}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={styles.fieldLabel}>曆法</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        styles.chipSmall,
                        formData.calendarType === 'solar' && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, calendarType: 'solar' })}
                      activeOpacity={0.6}
                      accessibilityLabel="選擇曆法：公曆"
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.calendarType === 'solar' }}
                    >
                      <Calendar size={14} color={formData.calendarType === 'solar' ? '#ffffff' : colors.primary} />
                      <Text style={[
                        styles.chipText,
                        styles.chipTextSmall,
                        formData.calendarType === 'solar' && styles.chipTextSelected,
                      ]}>
                        公曆
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        styles.chipSmall,
                        formData.calendarType === 'lunar' && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, calendarType: 'lunar' })}
                      activeOpacity={0.6}
                      accessibilityLabel="選擇曆法：農曆"
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.calendarType === 'lunar' }}
                    >
                      <Calendar size={14} color={formData.calendarType === 'lunar' ? '#ffffff' : colors.primary} />
                      <Text style={[
                        styles.chipText,
                        styles.chipTextSmall,
                        formData.calendarType === 'lunar' && styles.chipTextSelected,
                      ]}>
                        農曆
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* 出生日期 */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>出生日期</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setBirthPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateTimeInputText}>
                    {formData.year}年{formData.month}月{formData.day}日
                  </Text>
                  <ChevronDown size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {/* 出生时间 */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>出生時間</Text>
                </View>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setBirthPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateTimeInputText}>
                    {formData.hour.toString().padStart(2, '0')}:{formData.minute.toString().padStart(2, '0')}
                  </Text>
                  <ChevronDown size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 更多选项（可选） */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>更多信息</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalBadgeText}>可選</Text>
                  </View>
                </View>
              </View>
              
              {/* 案例名称 */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>案例名稱</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    focusedField === 'name' && styles.textInputFocused,
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t('manualBazi.namePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel={t('manualBazi.nameInputLabel')}
                  accessibilityHint={t('manualBazi.nameInputHint')}
                />
              </View>
              
              {/* 出生城市 */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.fieldLabel}>{t('manualBazi.birthPlace')}</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    focusedField === 'birthPlace' && styles.textInputFocused,
                  ]}
                  value={formData.birthPlace}
                  onChangeText={(text) => setFormData({ ...formData, birthPlace: text })}
                  placeholder={t('manualBazi.birthPlacePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  onFocus={() => setFocusedField('birthPlace')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
            
            {/* 底部留白 */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* 底部按钮 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={Boolean(!isFormValid() || isSubmitting)}
            activeOpacity={0.8}
            accessibilityLabel={isSubmitting ? t('dialog.sending') : t('dialog.startBazi')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isFormValid() || isSubmitting }}
          >
            <Sparkles size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? t('dialog.sending') : t('dialog.startBazi')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 出生信息选择弹窗 */}
      <BirthDateTimePickerSheet
        visible={birthPickerVisible}
        initialValue={birthInput}
        onConfirm={handleBirthInputConfirm}
        onCancel={() => setBirthPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  requiredBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredBadgeText: {
    fontSize: 10,
    fontWeight: fontWeights.semibold,
    color: '#dc2626',
  },
  optionalBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalBadgeText: {
    fontSize: 10,
    fontWeight: fontWeights.semibold,
    color: '#0284c7',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 20, // ✅ 大幅增加到 20px，确保绝对不会重叠
    marginBottom: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 12, // ✅ 增加到 12px，确保按钮不会挤在一起
  },
  chip: {
    paddingHorizontal: 8, // ✅ 固定 8px，更紧凑
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#d0d9ff',
    backgroundColor: '#fafaff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    minWidth: 70, // ✅ 大幅减小到 70，留出足够空间
    minHeight: 44,
    flexDirection: 'row',
    gap: 5, // ✅ 图标和文字间距减小到 5px
  },
  chipSmall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 80, // ✅ 限制最大宽度，防止按钮过宽导致重叠
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  chipTextSmall: {
    fontSize: 13, // ✅ 缩小字体，防止换行
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: fontWeights.bold,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#d0d9ff',
    backgroundColor: '#fafaff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeInputText: {
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  textInput: {
    minHeight: 46, // ✅ 从 height 改为 minHeight，更灵活
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, // ✅ 增加垂直内边距
    fontSize: 14,
    color: colors.ink,
    backgroundColor: '#fafaff',
    borderRadius: 12,
    borderWidth: 0.5, // ✅ 从 1 改为 0.5，边框更细
    borderColor: '#d0d9ff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  textInputFocused: {
    borderColor: colors.primary,
    borderWidth: 1, // ✅ 从 1.5 改为 1，聚焦时稍微粗一点但不会太粗
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 44,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  buttonIcon: {
    // 图标样式
  },
  submitButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
});
