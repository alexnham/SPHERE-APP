import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { AnimatedMoney } from '../components/shared';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  SpendingTrendLine,
  SafeToSpendCard,
  UpcomingBillsCard,
  WeeklyInsightCard,
} from '../components/overview';
import {
  SimpleHeader,
  ProgressRing,
} from '../components/simple';
import { useAccounts } from '../hooks/useAccounts';
import { useSummary } from '../hooks/useSummary';
import { useBills } from '../hooks/useBills';
import { useTransactions } from '../hooks/useTransactions';
import { useVaults } from '../hooks/useVaults';
import { calculateSafeToSpend, generateDailySpendData } from '../lib/database';
import { ChevronRight, Calendar, BarChart3, CreditCard, TrendingDown, TrendingUp } from 'lucide-react-native';
import { differenceInDays } from 'date-fns';
import { MiniSparkline } from '../components/overview/MiniSparkline';

export default function OverviewScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { summary, loading: summaryLoading } = useSummary();
  const { bills, loading: billsLoading } = useBills();
  const { vaults } = useVaults(); // Listen to vault changes to refresh safe to spend
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { transactions, loading: transactionsLoading } = useTransactions({
    start_date: startOfMonth.toISOString().split('T')[0],
    limit: 1000,
  });
  const [safeToSpendData, setSafeToSpendData] = React.useState<{ safeToSpend: number; breakdown: any } | null>(null);
  const [dailySpendData, setDailySpendData] = React.useState<Array<{ date: Date; amount: number; categories: Record<string, number> }>>([]);
  const [loadingSafeToSpend, setLoadingSafeToSpend] = React.useState(true);

  // Function to fetch safe to spend and daily spend data
  const fetchData = React.useCallback(async () => {
    try {
      setLoadingSafeToSpend(true);
      const [safeToSpend, dailySpend] = await Promise.all([
        calculateSafeToSpend(),
        generateDailySpendData(),
      ]);
      setSafeToSpendData(safeToSpend);
      setDailySpendData(dailySpend);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Set default values on error to prevent UI from breaking
      setSafeToSpendData({
        safeToSpend: 0,
        breakdown: {
          liquidAvailable: 0,
          pendingOutflows: 0,
          upcoming7dEssentials: 0,
          userBuffer: 0,
          isVaultBuffer: false,
        },
      });
      setDailySpendData([]);
    } finally {
      setLoadingSafeToSpend(false);
    }
  }, []);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Also refresh when accounts or vaults change
  React.useEffect(() => {
    fetchData();
  }, [accounts, vaults, fetchData]);

  // Calculate total available - only checking accounts (includes cash management)
  const totalAvailable = useMemo(() => {
    console.log(accounts.filter(a => a.type === 'checking').map(a => a.availableBalance));
    return accounts
      .filter(a => a.type === 'checking') // Only checking accounts (cash management is a type of checking)
      .reduce((sum, a) => sum + a.availableBalance, 0);
  }, [accounts]);
  console.log(totalAvailable);

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
  }, [dailySpendData]);

  const isSpendingDown = weeklyData.weeklyChange < 0;

  const isLoading = accountsLoading || summaryLoading || loadingSafeToSpend || billsLoading || transactionsLoading;
  const safeToSpend = safeToSpendData?.safeToSpend || 0;
  const breakdown = safeToSpendData?.breakdown || { 
    liquidAvailable: 0, 
    pendingOutflows: 0, 
    upcoming7dEssentials: 0, 
    userBuffer: 0,
    isVaultBuffer: false,
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  // Simple View - Clean, minimal UI with visual elements
  if (isSimpleView) {
    const ringProgress = safeToSpend / totalAvailable
    console.log(ringProgress);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple Total Available with visual ring */}
        <ProgressRing
          progress={ringProgress}
          label="Available"
          amount={totalAvailable}
          colors={colors}
          animated={true}
        />

        {/* Safe to Spend with mini chart */}
        <Card>
          <View style={styles.simpleSafeToSpend}>
            <View style={styles.simpleSafeToSpendLeft}>
              <Text style={[styles.simpleSafeToSpendLabel, { color: colors.textSecondary }]}>
                Safe to spend
              </Text>
              <AnimatedMoney
                value={safeToSpend}
                style={[styles.simpleSafeToSpendAmount, { color: colors.primary }]}
                duration={1500}
              />
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
          <AnimatedMoney
            value={totalAvailable}
            style={[styles.heroAmount, { color: colors.text }]}
            duration={1500}
          />
          <SpendingTrendLine colors={colors} transactions={transactions} />
        </View>
      </Card>

      {/* Safe to Spend */}
      <SafeToSpendCard colors={colors} safeToSpend={safeToSpend} breakdown={breakdown} />

      {/* Upcoming Bills */}
      <UpcomingBillsCard colors={colors} bills={bills} />

      {/* Weekly Insight */}
      <WeeklyInsightCard colors={colors} dailySpendData={dailySpendData} />

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
  loadingText: {
    fontSize: 14,
  },
});