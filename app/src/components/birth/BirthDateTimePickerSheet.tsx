/**
 * 出生信息選擇彈窗
 * 
 * 功能：
 * - 曆法選擇（公曆/農曆）
 * - 五列滾輪選擇器（年月日時分）
 * - 「今」按鈕快速選擇當前時間
 * - 時區顯示（V1 固定東八區）
 * - 夏令時開關
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Switch,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { ChevronLeft, Clock, HelpCircle } from 'lucide-react-native';
import { BirthInputVM, CalendarType } from '@/types/birth';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 50; // 每行高度
const VISIBLE_ITEMS = 5; // 可見行數
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2); // 2，中間那一行

interface BirthDateTimePickerSheetProps {
  visible: boolean;
  initialValue: BirthInputVM;
  onConfirm: (value: BirthInputVM) => void;
  onCancel: () => void;
}

export const BirthDateTimePickerSheet: React.FC<BirthDateTimePickerSheetProps> = ({
  visible,
  initialValue,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState<BirthInputVM>(initialValue);
  const [calendarType, setCalendarType] = useState<CalendarType>(initialValue.calendarType);
  
  // 滚轮引用
  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // 当弹窗打开时，同步初始值
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setCalendarType(initialValue.calendarType);
    }
  }, [visible, initialValue]);

  // 生成选项数组
  const years = Array.from({ length: 126 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // 根據年月計算天數（公曆）
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 使用 useMemo 确保 days 数组在年月变化时正确更新
  const days = useMemo(() => {
    const daysCount = getDaysInMonth(value.year, value.month);
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [value.year, value.month]);

  // 滚动到选中位置
  const scrollToSelected = (
    ref: React.RefObject<ScrollView | null>,
    items: number[],
    selectedValue: number
  ) => {
    const index = items.indexOf(selectedValue);
    if (index < 0 || !ref.current) return;

    const offsetY = index * ITEM_HEIGHT;
    ref.current.scrollTo({ y: offsetY, animated: false });
  };

  // 處理滾動結束（只算選中值，不再 scrollTo）
  const handleWheelScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    items: number[],
    setter: (val: number) => void
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);
    if (index < 0) index = 0;
    if (index >= items.length) index = items.length - 1;

    const selected = items[index];
    setter(selected);
  };

  // 處理年月變化，自動調整日期
  useEffect(() => {
    const maxDay = getDaysInMonth(value.year, value.month);
    if (value.day > maxDay) {
      setValue((prev) => ({ ...prev, day: maxDay }));
    }
  }, [value.year, value.month]);


  // 確認
  const handleConfirm = () => {
    onConfirm({
      ...value,
      calendarType,
    });
  };

  // 渲染滾輪（不再有 null 占位項）
  const renderWheel = (
    ref: React.RefObject<ScrollView | null>,
    items: number[],
    selectedValue: number,
    unit: string,
    setter: (val: number) => void
  ) => {
    return (
      <View style={styles.wheelContainer}>
        <ScrollView
          ref={ref}
          style={styles.wheel}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => handleWheelScrollEnd(e, items, setter)}
          onScrollEndDrag={(e) => handleWheelScrollEnd(e, items, setter)}
          contentContainerStyle={styles.wheelContent}
          onLayout={() => {
            setTimeout(() => {
              scrollToSelected(ref, items, selectedValue);
            }, 50);
          }}
        >
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <View
                key={`${unit}-${index}`}
                style={[
                  styles.wheelItem,
                  isSelected && styles.wheelItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.wheelItemText,
                    isSelected && styles.wheelItemTextSelected,
                  ]}
                >
                  {item}{unit}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        {/* 中間選中指示器 */}
        <View style={styles.wheelIndicator} />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        
        <View style={styles.container}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>選擇出生信息</Text>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.confirmText}>確定</Text>
            </TouchableOpacity>
          </View>

          {/* 曆法 Tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                calendarType === 'solar' && styles.tabActive,
              ]}
              onPress={() => setCalendarType('solar')}
            >
              <Text
                style={[
                  styles.tabText,
                  calendarType === 'solar' && styles.tabTextActive,
                ]}
              >
                公曆
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                calendarType === 'lunar' && styles.tabActive,
              ]}
              onPress={() => setCalendarType('lunar')}
            >
              <Text
                style={[
                  styles.tabText,
                  calendarType === 'lunar' && styles.tabTextActive,
                ]}
              >
                農曆
              </Text>
            </TouchableOpacity>
          </View>

          {/* 滾輪區域 */}
          <View style={styles.wheelsContainer}>
            {/* 五列滾輪 */}
            <View style={styles.wheelsRow}>
              {renderWheel(
                yearScrollRef,
                years,
                value.year,
                '年',
                (val) => setValue((prev) => ({ ...prev, year: val }))
              )}
              {renderWheel(
                monthScrollRef,
                months,
                value.month,
                '月',
                (val) => setValue((prev) => ({ ...prev, month: val }))
              )}
              {renderWheel(
                dayScrollRef,
                days,
                value.day,
                '日',
                (val) => setValue((prev) => ({ ...prev, day: val }))
              )}
              {renderWheel(
                hourScrollRef,
                hours,
                value.hour,
                '時',
                (val) => setValue((prev) => ({ ...prev, hour: val }))
              )}
              {renderWheel(
                minuteScrollRef,
                minutes,
                value.minute,
                '分',
                (val) => setValue((prev) => ({ ...prev, minute: val }))
              )}
            </View>
          </View>

          {/* 時區 & 夏令時 */}
          <View style={styles.timezoneSection}>
            <View style={styles.timezoneRow}>
              <View style={styles.timezoneLabel}>
                <Text style={styles.timezoneText}>東八區（北京時間）</Text>
              </View>
              
              <View style={styles.dstRow}>
                <Text style={styles.dstLabel}>夏令時</Text>
                <Switch
                  value={value.isDst}
                  onValueChange={(val) => setValue((prev) => ({ ...prev, isDst: val }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.border}
                />
                <TouchableOpacity style={styles.helpButton}>
                  <HelpCircle size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  cancelText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: fontSizes.base,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: fontWeights.semibold,
  },
  wheelsContainer: {
    position: 'relative',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginVertical: spacing.md,
  },
  wheelsRow: {
    flexDirection: 'row',
    height: '100%',
  },
  wheelContainer: {
    flex: 1,
    position: 'relative',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheel: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT * CENTER_INDEX, // 上下各 2 行留白
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemSelected: {
    backgroundColor: '#f0f4ff',
  },
  wheelItemText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  wheelItemTextSelected: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  wheelIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * CENTER_INDEX,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(85, 104, 211, 0.05)',
    pointerEvents: 'none',
  },
  timezoneSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timezoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timezoneLabel: {
    flex: 1,
  },
  timezoneText: {
    fontSize: fontSizes.base,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  dstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dstLabel: {
    fontSize: fontSizes.base,
    color: colors.ink,
    marginRight: spacing.xs,
  },
  helpButton: {
    padding: spacing.xs,
  },
});

