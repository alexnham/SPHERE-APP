import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { 
  calculateSafeToSpend, 
  recurringCharges, 
  dailySpendData, 
  transactions,
  accounts 
} from '../lib/mockData';
import { formatCurrency, getDaysUntil } from '../lib/utils';

// Mini Sparkline Component
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
  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <Svg width={width} height={height}>
      <Polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <Circle cx={lastX} cy={lastY} r="4" fill={color} />
    </Svg>
  );
};

// Spending Trend Line
const SpendingTrendLine = ({ colors }: { colors: any }) => {
  const now = new Date();
  const currentDay = now.getDate();
  
  const dailyData: { day: number; spending: number }[] = [];
  let cumulative = 0;
  
  for (let day = 1; day <= currentDay; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const daySpending = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === date.getFullYear() &&
               tDate.getMonth() === date.getMonth() &&
               tDate.getDate() === date.getDate();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    cumulative += daySpending;
    dailyData.push({ day, spending: Math.round(cumulative) });
  }

  if (dailyData.length < 2) return null;

  const max = Math.max(...dailyData.map(d => d.spending));
  const min = Math.min(...dailyData.map(d => d.spending));
  const range = max - min || 1;
  const height = 48;
  const width = 280;

  const points = dailyData.map((d, i) => {
    const x = (i / (dailyData.length - 1)) * width;
    const y = height - ((d.spending - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Calculate trend
  const midPoint = Math.floor(dailyData.length / 2);
  const firstHalf = dailyData.slice(0, midPoint);
  const secondHalf = dailyData.slice(midPoint);
  const firstAvg = firstHalf.reduce((s, d) => s + d.spending, 0) / firstHalf.length || 0;
  const secondAvg = secondHalf.reduce((s, d) => s + d.spending, 0) / secondHalf.length || 0;
  const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  const isUp = trend > 0;

  return (
    <View style={styles.trendContainer}>
      <View style={styles.trendHeader}>
        <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>This month's spending</Text>
        <View style={styles.trendBadge}>
          <Text style={{ color: isUp ? '#ef4444' : '#10b981', fontSize: 11, fontWeight: '500' }}>
            {isUp ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
          </Text>
        </View>
      </View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Polyline
          fill="none"
          stroke="url(#trendGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </Svg>
    </View>
  );
};

// Breakdown Item Component
const BreakdownItem = ({ icon, label, value, colors, type }: any) => {
  const getColor = () => {
    switch (type) {
      case 'positive': return colors.text;
      case 'pending': return '#f59e0b';
      case 'committed': return '#8b5cf6';
      case 'buffer': return '#6b7280';
      default: return colors.text;
    }
  };

  return (
    <View style={[styles.breakdownItem, { backgroundColor: `${colors.border}40` }]}>
      <View style={styles.breakdownLeft}>
        <View style={[styles.breakdownIcon, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 12 }}>{icon}</Text>
        </View>
        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.breakdownValue, { color: getColor() }]}>
        {value >= 0 ? '+' : ''}{formatCurrency(value)}
      </Text>
    </View>
  );
};

// Safe to Spend Card
const SafeToSpendCard = ({ colors }: { colors: any }) => {
  const { safeToSpend, breakdown } = calculateSafeToSpend();
  const healthPercent = Math.min(100, (safeToSpend / breakdown.liquidAvailable) * 100);

  return (
    <Card>
      {/* Header */}
      <View style={styles.stsHeader}>
        <View style={styles.stsHeaderLeft}>
          <View style={[styles.stsIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={styles.stsIconText}>🛡️</Text>
          </View>
          <Text style={[styles.stsLabel, { color: colors.textSecondary }]}>Safe to Spend</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>ⓘ</Text>
        </View>
        <View style={[styles.healthBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={[styles.healthText, { color: '#10b981' }]}>{Math.round(healthPercent)}%</Text>
        </View>
      </View>

      {/* Amount */}
      <Text style={[styles.stsAmount, { color: colors.text }]}>{formatCurrency(safeToSpend)}</Text>

      {/* Breakdown Items */}
      <View style={styles.breakdownList}>
        <BreakdownItem icon="💰" label="Available" value={breakdown.liquidAvailable} colors={colors} type="positive" />
        <BreakdownItem icon="📉" label="Pending" value={-breakdown.pendingOutflows} colors={colors} type="pending" />
        <BreakdownItem icon="📅" label="Bills (7 days)" value={-breakdown.upcoming7dEssentials} colors={colors} type="committed" />
        <BreakdownItem icon="🛡️" label="Buffer" value={-breakdown.userBuffer} colors={colors} type="buffer" />
      </View>
    </Card>
  );
};

// Upcoming Bills Card
const UpcomingBillsCard = ({ colors }: { colors: any }) => {
  const sortedBills = [...recurringCharges].sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  const totalUpcoming = sortedBills
    .filter(b => getDaysUntil(b.nextDate) <= 7 && getDaysUntil(b.nextDate) >= 0)
    .reduce((sum, b) => sum + b.avgAmount, 0);
  const displayedBills = sortedBills.slice(0, 3);
  const remainingCount = sortedBills.length - 3;

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = { 
      Entertainment: '📺', 
      'Bills & Utilities': '⚡', 
      Utilities: '⚡',
      Health: '💪', 
      Tech: '📱', 
      Food: '🍽️', 
      Transport: '🚗' 
    };
    return map[category] || '📄';
  };

  const getCadenceLabel = (cadence: string) => {
    const map: Record<string, string> = { 
      weekly: 'Weekly', 
      biweekly: 'Bi-weekly', 
      monthly: 'Monthly', 
      yearly: 'Yearly' 
    };
    return map[cadence] || cadence;
  };

  return (
    <Card>
      {/* Header */}
      <View style={styles.billsHeader}>
        <View style={styles.billsHeaderLeft}>
          <Text style={{ fontSize: 16, color: colors.primary }}>📅</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming Bills</Text>
        </View>
        <View style={styles.billsHeaderRight}>
          <Text style={[styles.billsSubtitle, { color: colors.textSecondary }]}>Next 7 days</Text>
          <Text style={[styles.billsTotal, { color: colors.text }]}>{formatCurrency(totalUpcoming)}</Text>
        </View>
      </View>

      {/* Bills List */}
      <View style={styles.billsList}>
        {displayedBills.map((bill) => {
          const daysUntil = getDaysUntil(bill.nextDate);
          const isUrgent = daysUntil <= 3;

          return (
            <View
              key={bill.id}
              style={[styles.billItem, { backgroundColor: colors.surface }]}
            >
              <View style={styles.billLeft}>
                <View style={[styles.billIcon, { backgroundColor: `${colors.border}80` }]}>
                  <Text>{getCategoryIcon(bill.category)}</Text>
                </View>
                <View>
                  <Text style={[styles.billName, { color: colors.text }]}>{bill.merchant}</Text>
                  <Text style={[styles.billCadence, { color: colors.textSecondary }]}>
                    {getCadenceLabel(bill.cadence)}
                  </Text>
                </View>
              </View>
              <View style={styles.billRight}>
                <Text style={[styles.billAmount, { color: colors.text }]}>
                  {formatCurrency(bill.avgAmount)}
                </Text>
                <Text
                  style={[
                    styles.billDays,
                    { color: isUrgent ? '#ef4444' : colors.textSecondary },
                  ]}
                >
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* See More */}
      {remainingCount > 0 && (
        <TouchableOpacity style={styles.seeMore}>
          <Text style={[styles.seeMoreText, { color: colors.primary }]}>
            +{remainingCount} more bills
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

// Weekly Insight Card
const WeeklyInsightCard = ({ colors }: { colors: any }) => {
  // Get last 14 days spending
  const last14Days = dailySpendData.slice(0, 14);
  const thisWeek = last14Days.slice(0, 7);
  const lastWeek = last14Days.slice(7, 14);

  const thisWeekTotal = thisWeek.reduce((sum, d) => sum + d.amount, 0);
  const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.amount, 0);
  const weekChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
  const isDown = weekChange < 0;

  // Sparkline data
  const sparklineData = thisWeek.map(d => d.amount).reverse();

  return (
    <Card>
      {/* Header */}
      <View style={styles.insightHeader}>
        <View style={styles.insightHeaderLeft}>
          <Text style={{ fontSize: 16 }}>✨</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Insight</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.insightContent}>
        <View style={styles.insightLeft}>
          <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
            This week vs last week
          </Text>
          <View style={styles.insightStats}>
            <Text style={[styles.insightAmount, { color: colors.text }]}>
              {formatCurrency(thisWeekTotal)}
            </Text>
            <View
              style={[
                styles.insightBadge,
                {
                  backgroundColor: isDown
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isDown ? '#10b981' : '#ef4444',
                }}
              >
                {isDown ? '↓' : '↑'} {Math.abs(weekChange).toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.insightRight}>
          <MiniSparkline data={sparklineData} color={isDown ? '#10b981' : '#ef4444'} />
        </View>
      </View>

      {/* Message */}
      <View style={[styles.insightMessage, { backgroundColor: colors.surface }]}>
        <Text style={[styles.insightMessageText, { color: colors.textSecondary }]}>
          {isDown
            ? "🎉 Great job! You're spending less than last week."
            : "📊 Your spending is up this week. Check your transactions."}
        </Text>
      </View>
    </Card>
  );
};

// Main Overview Screen
export default function OverviewScreen() {
  const { colors } = useTheme();

  // Calculate total available
  const totalAvailable = accounts
    .filter(a => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning</Text>
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
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
  trendContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  trendLabel: {
    fontSize: 12,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  stsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stsIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stsIconText: {
    fontSize: 16,
  },
  stsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stsAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  breakdownList: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  billsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  billsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  billsHeaderRight: {
    alignItems: 'flex-end',
  },
  billsSubtitle: {
    fontSize: 11,
  },
  billsTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  billsList: {
    gap: 10,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billName: {
    fontSize: 14,
    fontWeight: '500',
  },
  billCadence: {
    fontSize: 11,
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  billDays: {
    fontSize: 11,
    marginTop: 2,
  },
  seeMore: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightLeft: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  insightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightRight: {
    marginLeft: 16,
  },
  insightMessage: {
    padding: 12,
    borderRadius: 10,
  },
  insightMessageText: {
    fontSize: 13,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});