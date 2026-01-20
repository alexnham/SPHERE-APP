import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { accounts, transactions, dailySpendData } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  SpendingTrendLine,
  SafeToSpendCard,
  UpcomingBillsCard,
  WeeklyInsightCard,
} from '../components/overview';
import { calculateSafeToSpend } from '../lib/mockData';
import { TrendingDown, TrendingUp, ChevronRight, Calendar, BarChart3, CreditCard } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';
import { differenceInDays } from 'date-fns';

// Simple mini sparkline component
const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={width} height={height} style={{ overflow: 'visible' }}>
      <Defs>
        <LinearGradient id="sparklineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Polyline
        fill="none"
        stroke="url(#sparklineGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <Circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="4"
        fill={color}
      />
    </Svg>
  );
};

export default function OverviewScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Calculate total available
  const totalAvailable = accounts
    .filter(a => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  // Calculate safe to spend
  const { safeToSpend, breakdown } = calculateSafeToSpend();

  // Calculate weekly spending trend for simple view
  const weeklyData = useMemo(() => {
    const now = new Date();
    const last7Days = dailySpendData
      .filter(d => differenceInDays(now, d.date) <= 7)
      .map(d => d.amount);
    
    const thisWeekTotal = last7Days.reduce((sum, d) => sum + d, 0);
    const prevWeekDays = dailySpendData
      .filter(d => {
        const days = differenceInDays(now, d.date);
        return days > 7 && days <= 14;
      })
      .map(d => d.amount);
    const prevWeekTotal = prevWeekDays.reduce((sum, d) => sum + d, 0);
    const weeklyChange = prevWeekTotal > 0 ? ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0;
    
    return { last7Days, weeklyChange };
  }, []);

  const isSpendingDown = weeklyData.weeklyChange < 0;

  // Simple View - Clean, minimal UI with visual elements
  if (isSimpleView) {
    const ringProgress = 0.25; // 25% of ring filled
    const ringRadius = 90;
    const circumference = 2 * Math.PI * ringRadius;
    const strokeDashoffset = circumference * (1 - ringProgress);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple Total Available with visual ring */}
        <View style={styles.simpleHeroContainer}>
          <View style={styles.ringContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
                </LinearGradient>
              </Defs>
              <Circle
                cx="100"
                cy="100"
                r={ringRadius}
                fill="none"
                stroke={colors.border}
                strokeWidth="8"
              />
              <Circle
                cx="100"
                cy="100"
                r={ringRadius}
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
              />
            </Svg>
            <View style={styles.ringContent}>
              <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>Available</Text>
              <Text style={[styles.ringAmount, { color: colors.text }]}>
                {formatCurrency(totalAvailable)}
              </Text>
            </View>
          </View>
        </View>

        {/* Safe to Spend with mini chart */}
        <Card>
          <View style={styles.simpleSafeToSpend}>
            <View style={styles.simpleSafeToSpendLeft}>
              <Text style={[styles.simpleSafeToSpendLabel, { color: colors.textSecondary }]}>
                Safe to spend
              </Text>
              <Text style={[styles.simpleSafeToSpendAmount, { color: colors.primary }]}>
                {formatCurrency(safeToSpend)}
              </Text>
              <View style={styles.simpleTrendContainer}>
                {isSpendingDown ? (
                  <TrendingDown size={16} color="#10b981" strokeWidth={2} />
                ) : (
                  <TrendingUp size={16} color="#f59e0b" strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.simpleTrendText,
                    { color: isSpendingDown ? '#10b981' : '#f59e0b' },
                  ]}
                >
                  {Math.abs(weeklyData.weeklyChange).toFixed(0)}% vs last week
                </Text>
              </View>
            </View>
            <MiniSparkline
              data={weeklyData.last7Days.length > 1 ? weeklyData.last7Days : [0, 0]}
              color={colors.primary}
            />
          </View>
        </Card>

        {/* Simple Quick Actions */}
        <View style={styles.simpleActionsContainer}>
          {[
            { label: 'Upcoming Bills', path: 'Bills' as const, icon: Calendar },
            { label: 'Spending & Budget', path: 'Main' as const, icon: BarChart3 },
            { label: 'Your Accounts', path: 'Main' as const, icon: CreditCard },
          ].map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.simpleActionButton, { backgroundColor: colors.card }]}
              onPress={() => {
                navigation.navigate(item.path);
              }}
            >
              <View style={styles.simpleActionLeft}>
                <View style={[styles.simpleActionIcon, { backgroundColor: colors.surface }]}>
                  <item.icon size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.simpleActionLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  }

  // Detailed View - Full data display
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Overview</Text>
      </View>

      {/* Hero Section - Total Available */}
      <Card>
        <View style={styles.heroContent}>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
            Total Available
          </Text>
          <Text style={[styles.heroAmount, { color: colors.text }]}>
            {formatCurrency(totalAvailable)}
          </Text>
          <SpendingTrendLine colors={colors} />
        </View>
      </Card>

      {/* Safe to Spend */}
      <SafeToSpendCard colors={colors} />

      {/* Upcoming Bills */}
      <UpcomingBillsCard colors={colors} />

      {/* Weekly Insight */}
      <WeeklyInsightCard colors={colors} />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  simpleContentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  pageHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 16,
  },
  // Simple view styles
  simpleHeroContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  ringContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  ringAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  simpleSafeToSpend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  simpleSafeToSpendLeft: {
    flex: 1,
  },
  simpleSafeToSpendLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  simpleSafeToSpendAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  simpleTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  simpleTrendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  simpleActionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    marginTop: 8,
  },
  simpleActionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  simpleActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  simpleActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleActionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});