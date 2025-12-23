/**
 * 四柱表格组件
 * 
 * 表格式布局：
 * - 左列：标签（主星、天干、地支、藏干、副星、纳音、星运、自坐、空亡、神煞）
 * - 右4列：年柱、月柱、日柱、时柱数据
 * 
 * 数据来源：chart.pillars（来自Core八字引擎）
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing } from '@/theme';
import { normalizeToZhHK } from '@/utils/normalizeText';

// ===== 类型定义（匹配引擎输出）=====
export interface PillarData {
  stem?: string;              // 天干（引擎字段）
  branch?: string;            // 地支（引擎字段）
  gan?: string;               // 天干（前端简化字段）
  zhi?: string;               // 地支（前端简化字段）
  nayin?: string;             // 纳音
  canggan?: string[];         // 藏干数组
  hidden_tagged?: string[][]; // 藏干带标签 [["庚","本"],["壬","中"]]
  shishen?: string;           // 主星（十神）
  sub_stars?: string[];       // 副星（藏干十神）
  zizuo?: string;             // 自坐（十二长生）
  self_sit?: string;          // 自坐（同 zizuo）
  xingyun?: string;           // 星运
  shensha?: string[];         // 神煞列表
  kongwang?: string[];        // 空亡
}

export interface FourPillarsData {
  year: PillarData;
  month: PillarData;
  day: PillarData;
  hour: PillarData;
}

interface FourPillarsTableProps {
  pillars: FourPillarsData;
  onShenShaPress?: (shenSha: string, pillarName: string) => void;
  onShishenPress?: (shishen: string, pillarName: string) => void; // 副星（十神）点击回调
}

// ===== 五行配色 =====
const WUXING_COLORS = {
  '木': '#52b788',
  '火': '#ff6b6b',
  '土': '#d4a373',
  '金': '#ffd700',
  '水': '#4a90e2',
};

// 天干对应五行
const STEM_WUXING_MAP: { [key: string]: string } = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支对应五行（本气）
const BRANCH_WUXING_MAP: { [key: string]: string } = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

// ===== 主组件 =====
export const FourPillarsTable: React.FC<FourPillarsTableProps> = ({
  pillars,
  onShenShaPress,
  onShishenPress,
}) => {
  const { t } = useTranslation();

  console.log('四柱数据:', pillars);

  const pillarKeys: Array<keyof FourPillarsData> = ['year', 'month', 'day', 'hour'];
  const pillarLabels = [
    t('charts.fourPillars.yearPillar'),
    t('charts.fourPillars.monthPillar'),
    t('charts.fourPillars.dayPillar'),
    t('charts.fourPillars.hourPillar'),
  ];

  // 获取天干五行颜色
  const getStemColor = (stem: string) => {
    const wuxing = STEM_WUXING_MAP[stem] || '水';
    return WUXING_COLORS[wuxing as keyof typeof WUXING_COLORS];
  };

  // 获取地支五行颜色
  const getBranchColor = (branch: string) => {
    const wuxing = BRANCH_WUXING_MAP[branch] || '土';
    return WUXING_COLORS[wuxing as keyof typeof WUXING_COLORS];
  };

  // 表格行：标题行
  const renderHeaderRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.headerLabel}>日期</Text>
      </View>
      {pillarLabels.map((label, index) => (
        <View key={index} style={styles.dataCell}>
          <Text style={styles.headerText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  // 表格行：主星
  const renderShishenRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.mainStar')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={styles.shishenText}>
              {pillar.shishen ? normalizeToZhHK(pillar.shishen) : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：天干
  const renderStemRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.stem')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        const stem = pillar.stem || pillar.gan || '-';
        const stemColor = getStemColor(stem);
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={[styles.ganzhiText, { color: stemColor }]}>{stem}</Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：地支
  const renderBranchRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.branch')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        const branch = pillar.branch || pillar.zhi || '-';
        const branchColor = getBranchColor(branch);
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={[styles.ganzhiText, { color: branchColor }]}>{branch}</Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：藏干
  const renderCangganRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.canggan')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        const hiddenTagged = pillar.hidden_tagged || [];
        return (
          <View key={key} style={styles.dataCell}>
            {hiddenTagged.length > 0 ? (
              hiddenTagged.map(([stem, label], index) => {
                const wuxing = STEM_WUXING_MAP[stem] || '水';
                const wuxingColor = WUXING_COLORS[wuxing as keyof typeof WUXING_COLORS];
                return (
                  <Text key={index} style={[styles.cangganText, { color: wuxingColor }]}>
                    {stem}{wuxing}
                  </Text>
                );
              })
            ) : (
              <Text style={styles.valueText}>-</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  // 表格行：副星
  const renderSubStarsRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.subStars')}</Text>
      </View>
      {pillarKeys.map((key, colIndex) => {
        const pillar = pillars[key];
        const subStars = pillar.sub_stars || [];
        return (
          <View key={key} style={styles.dataCell}>
            {subStars.length > 0 ? (
              <View style={styles.subStarsContainer}>
                {subStars.map((star, index) => (
                  <Pressable
                    key={index}
                    testID={`substar-chip-${star}-${key}`}
                    style={({ pressed }) => [
                      styles.subStarChip,
                      pressed && styles.subStarChipPressed,
                    ]}
                    onPress={() => onShishenPress?.(star, pillarLabels[colIndex])}
                  >
                    <Text style={styles.subStarText}>{normalizeToZhHK(star)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.valueText}>-</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  // 表格行：纳音
  const renderNayinRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.nayin')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={styles.valueText}>
              {pillar.nayin ? normalizeToZhHK(pillar.nayin) : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：星运
  const renderXingyunRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.xingyun')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={styles.valueText}>
              {pillar.xingyun ? normalizeToZhHK(pillar.xingyun) : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：自坐
  const renderZizuoRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.zizuo')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        const zizuo = pillar.zizuo || pillar.self_sit;
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={styles.valueText}>
              {zizuo ? normalizeToZhHK(zizuo) : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：空亡
  const renderKongwangRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.kongwang')}</Text>
      </View>
      {pillarKeys.map((key) => {
        const pillar = pillars[key];
        // 使用柱子的 kongwang 字段（基于旬空计算）
        const kongwang = pillar.kongwang || [];
        return (
          <View key={key} style={styles.dataCell}>
            <Text style={styles.valueText}>
              {kongwang.length > 0 ? kongwang.map(k => normalizeToZhHK(k)).join(' ') : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // 表格行：神煞
  const renderShenShaRow = () => (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{t('charts.fourPillars.shensha')}</Text>
      </View>
      {pillarKeys.map((key, colIndex) => {
        const pillar = pillars[key];
        const shenShaList = (pillar.shensha || []).filter(s => !s.includes('空亡'));
        return (
          <View key={key} style={styles.dataCell}>
            {shenShaList.length > 0 ? (
              <View style={styles.shenShaContainer}>
                {shenShaList.map((shenSha, index) => (
                  <Pressable
                    key={index}
                    testID={`shensha-chip-${shenSha}-${key}`}
                    style={({ pressed }) => [
                      styles.shenShaChip,
                      pressed && styles.shenShaChipPressed,
                    ]}
                    onPress={() => onShenShaPress?.(shenSha, pillarLabels[colIndex])}
                  >
                    <Text style={styles.shenShaText}>{normalizeToZhHK(shenSha)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.valueText}>-</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container} testID="four-pillars-table">
      {renderHeaderRow()}
      {renderShishenRow()}
      {renderStemRow()}
      {renderBranchRow()}
      {renderCangganRow()}
      {renderSubStarsRow()}
      {renderNayinRow()}
      {renderXingyunRow()}
      {renderZizuoRow()}
      {renderKongwangRow()}
      {renderShenShaRow()}
    </View>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },

  // 表格行
  row: {
    flexDirection: 'row',
    minHeight: 40,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8ecff',
  },

  // 左侧标签列
  labelCell: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    // 去掉背景色
  },

  // 数据列（4个柱子）
  dataCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },

  // 表头标签
  headerLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal, // 去掉加粗
    color: colors.ink, // 改为黑色
  },

  // 表头文本（柱子标题）
  headerText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal, // 去掉加粗
    color: colors.ink, // 改为黑色
  },

  // 标签文本
  labelText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal, // 去掉加粗
    color: colors.ink, // 改为黑色
  },

  // 主星文本
  shishenText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal, // 去掉加粗
    color: colors.ink, // 改为黑色
  },

  // 天干地支文本
  ganzhiText: {
    fontSize: 28,
    fontWeight: fontWeights.normal, // 去掉加粗
  },

  // 藏干文本
  cangganText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal, // 去掉加粗
    lineHeight: 18,
  },

  // 通用值文本
  valueText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 18,
  },

  // 神煞容器
  shenShaContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },

  // 神煞标签
  shenShaChip: {
    // 去掉背景色和边框
    paddingVertical: 2,
  },
  shenShaChipPressed: {
    opacity: 0.7,
  },
  shenShaText: {
    fontSize: fontSizes.sm,
    color: '#52b788', // 绿色字体
    fontWeight: fontWeights.normal,
  },
  // 副星容器
  subStarsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  // 副星标签（可点击）
  subStarChip: {
    paddingVertical: 2,
  },
  subStarChipPressed: {
    opacity: 0.7,
  },
  subStarText: {
    fontSize: fontSizes.sm,
    color: '#52b788', // 绿色字体，与神煞保持一致
    fontWeight: fontWeights.normal,
  },
});
