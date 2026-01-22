import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { Transaction } from '../../lib/mockData';
import { categoryColors } from '../../lib/mockData';
import { startOfWeek, endOfWeek, eachWeekOfInterval, subDays } from 'date-fns';

interface SpendingInsightsProps {
  colors: any;
  transactions?: Transaction[];
}

// Map API primary categories to display names and colors
// This maps Plaid's primary_category values to friendly names and colors
const categoryMapping: Record<string, { name: string; color: string }> = {
  // Shopping & Merchandise
  'GENERAL_MERCHANDISE': { name: 'Shopping', color: '#ec4899' },
  'GENERAL_MERCHANDISE_ONLINE': { name: 'Shopping', color: '#ec4899' },
  'GENERAL_MERCHANDISE_SUPERSTORES': { name: 'Shopping', color: '#ec4899' },
  
  // Food & Dining
  'FOOD_AND_DRINK': { name: 'Food & Dining', color: '#f97316' },
  'RESTAURANTS': { name: 'Dining', color: '#f97316' },
  'FAST_FOOD': { name: 'Fast Food', color: '#f97316' },
  'GROCERIES': { name: 'Groceries', color: '#22c55e' },
  'COFFEE_SHOPS': { name: 'Coffee', color: '#92400e' },
  
  // Transportation
  'TRANSPORTATION': { name: 'Transportation', color: '#3b82f6' },
  'GAS_STATIONS': { name: 'Gas', color: '#64748b' },
  'AUTOMOTIVE': { name: 'Automotive', color: '#3b82f6' },
  'TAXIS': { name: 'Taxis', color: '#3b82f6' },
  'PUBLIC_TRANSPORTATION': { name: 'Public Transit', color: '#3b82f6' },
  
  // Services
  'GENERAL_SERVICES': { name: 'Services', color: '#8b5cf6' },
  'TELECOMMUNICATION_SERVICES': { name: 'Phone & Internet', color: '#6b7280' },
  'UTILITIES': { name: 'Utilities', color: '#6b7280' },
  'RENT_AND_UTILITIES': { name: 'Bills & Utilities', color: '#6b7280' },
  
  // Entertainment & Recreation
  'ENTERTAINMENT': { name: 'Entertainment', color: '#8b5cf6' },
  'RECREATION': { name: 'Recreation', color: '#8b5cf6' },
  'SPORTING_GOODS': { name: 'Sports', color: '#8b5cf6' },
  'MUSIC_AND_VIDEO': { name: 'Media', color: '#8b5cf6' },
  
  // Travel
  'TRAVEL': { name: 'Travel', color: '#06b6d4' },
  'LODGING': { name: 'Lodging', color: '#06b6d4' },
  'AIRLINES_AND_AVIATION_SERVICES': { name: 'Airlines', color: '#06b6d4' },
  
  // Health
  'HEALTHCARE': { name: 'Health', color: '#ef4444' },
  'PHARMACIES': { name: 'Pharmacies', color: '#ef4444' },
  'MEDICAL': { name: 'Medical', color: '#ef4444' },
  
  // Tech & Electronics
  'ELECTRONICS': { name: 'Tech', color: '#06b6d4' },
  'COMPUTER_AND_ELECTRONICS': { name: 'Tech', color: '#06b6d4' },
  
  // Other
  'OTHER': { name: 'Other', color: '#9ca3af' },
  'GENERAL': { name: 'Other', color: '#9ca3af' },
};

// Helper: Convert category from "WORD_WORD" format to PascalCase
const formatCategory = (category: string): string => {
  if (!category) return 'Other';
  
  // Check if we have a mapping
  const upperCategory = category.toUpperCase();
  if (categoryMapping[upperCategory]) {
    return categoryMapping[upperCategory].name;
  }
  
  // Fallback to formatting
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Generate a color from a string (for unmapped categories)
const generateColorFromString = (str: string): string => {
  // Color palette for fallback
  const colors = [
    '#f97316', '#22c55e', '#ec4899', '#3b82f6', '#8b5cf6',
    '#6b7280', '#ef4444', '#92400e', '#64748b', '#06b6d4',
    '#f59e0b', '#10b981', '#6366f1', '#a855f7', '#14b8a6',
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get color for category
const getCategoryColor = (category: string): string => {
  if (!category) return '#9ca3af';
  
  // Check if we have a mapping
  const upperCategory = category.toUpperCase();
  if (categoryMapping[upperCategory]) {
    return categoryMapping[upperCategory].color;
  }
  
  // Try formatted name in categoryColors
  const formatted = formatCategory(category);
  if (categoryColors[formatted]) {
    return categoryColors[formatted];
  }
  
  // Try original category name
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Generate a consistent color from the category name
  return generateColorFromString(category);
};

export const SpendingInsights = ({ colors, transactions = [] }: SpendingInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 4;

  // Calculate spending by category from real transactions (last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const spendingTransactions = useMemo(() => {
    return transactions.filter(t => {
      const isSpending = t.direction === 'OUTFLOW' || (t.direction === undefined && t.amount < 0);
      return isSpending && new Date(t.date) >= thirtyDaysAgo;
    });
  }, [transactions, thirtyDaysAgo]);

  // Group by category
  const categorySpending = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    spendingTransactions.forEach(t => {
      const category = t.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + Math.abs(t.amount);
    });
    return categoryMap;
  }, [spendingTransactions]);

  // Convert to pie data format
  const pieData = useMemo(() => {
    const totalSpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    if (totalSpending === 0) return [];
    
    return Object.entries(categorySpending)
      .map(([category, amount]) => ({
        name: formatCategory(category),
        value: amount,
        color: getCategoryColor(category),
        percent: ((amount / totalSpending) * 100).toFixed(0),
      }))
      .sort((a, b) => b.value - a.value);
  }, [categorySpending]);

  const totalSpending = pieData.reduce((sum, item) => sum + item.value, 0);

  // Calculate weekly spending for bar chart (last 4 weeks)
  const weeklySpendingData = useMemo(() => {
    const now = new Date();
    const fourWeeksAgo = subDays(now, 28);
    const weeks = eachWeekOfInterval(
      { start: fourWeeksAgo, end: now },
      { weekStartsOn: 1 } // Monday
    );

    return weeks.slice(-4).map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekTransactions = spendingTransactions.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate >= weekStart && txnDate <= weekEnd;
      });
      const spending = weekTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        week: `Week ${index + 1}`,
        spending: Math.round(spending),
      };
    });
  }, [spendingTransactions]);

  // Calculate trend
  const lastWeek = weeklySpendingData[weeklySpendingData.length - 1]?.spending || 0;
  const prevWeek = weeklySpendingData[weeklySpendingData.length - 2]?.spending || 0;
  const trendPercent = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : 0;
  const isSpendingUp = trendPercent > 0;

  const maxWeekly = Math.max(...weeklySpendingData.map((d) => d.spending), 1);
  const barChartHeight = 140;

  return (
    <Card>
      {/* Header with trend badge */}
      <View style={styles.insightsHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Spending Insights
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Last 30 days breakdown
          </Text>
        </View>
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor: isSpendingUp
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            },
          ]}
        >
          {isSpendingUp ? (
            <TrendingUp size={14} color="#ef4444" style={{ marginRight: 4 }} />
          ) : (
            <TrendingDown size={14} color="#10b981" style={{ marginRight: 4 }} />
          )}
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isSpendingUp ? '#ef4444' : '#10b981',
            }}
          >
            {Math.abs(trendPercent).toFixed(0)}% vs last week
          </Text>
        </View>
      </View>

      {/* Two column layout */}
      <View style={styles.insightsGrid}>
        {/* Pie Chart Column */}
        <View style={styles.pieChartColumn}>
          <View style={styles.pieChartContainer}>
            <Svg width={160} height={160}>
              {pieData.length > 0 ? pieData.map((item, index) => {
                const startAngle = pieData
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / totalSpending) * 360, -90);
                const sweepAngle = (item.value / totalSpending) * 360;
                const endAngle = startAngle + sweepAngle;

                const x1 = 80 + 50 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 80 + 50 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 80 + 50 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 80 + 50 * Math.sin((endAngle * Math.PI) / 180);

                const largeArc = sweepAngle > 180 ? 1 : 0;

                return (
                  <Path
                    key={index}
                    d={`M 80 80 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    opacity={0.85}
                  />
                );
              }) : (
                <Circle cx={80} cy={80} r={50} fill={colors.border} opacity={0.2} />
              )}
              {/* Inner circle for donut effect */}
              <Circle cx={80} cy={80} r={32} fill={colors.card} />
            </Svg>
            {/* Center text */}
            <View style={styles.pieCenter}>
              <Text style={[styles.pieCenterAmount, { color: colors.text }]} numberOfLines={1}>
                {formatCurrency(totalSpending)}
              </Text>
              <Text style={[styles.pieCenterLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Legend - expandable */}
          {pieData.length > 0 ? (
            <View style={styles.legendContainer}>
              {(isExpanded ? pieData : pieData.slice(0, INITIAL_ITEMS)).map(
                (item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={styles.legendLeft}>
                      <View
                        style={[styles.legendDot, { backgroundColor: item.color }]}
                      />
                      <Text
                        style={[styles.legendText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <Text style={[styles.legendPercent, { color: colors.text }]}>
                      {item.percent}%
                    </Text>
                  </View>
                )
              )}
              {pieData.length > INITIAL_ITEMS && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isExpanded ? (
                      <ChevronUp size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    ) : (
                      <ChevronDown size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                      {isExpanded
                        ? 'Show less'
                        : `Show ${pieData.length - INITIAL_ITEMS} more`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.legendContainer}>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                No spending data available
              </Text>
            </View>
          )}
        </View>

        {/* Bar Chart Column */}
        <View style={styles.barChartColumn}>
          <Text style={[styles.barChartTitle, { color: colors.text }]}>
            Weekly Spending
          </Text>
          <View style={[styles.barChart, { height: barChartHeight }]}>
            {weeklySpendingData.map((item, index) => {
              const barHeight = (item.spending / maxWeekly) * (barChartHeight - 30);
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                    ${item.spending}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: colors.primary },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {item.week.replace('Week ', 'W')}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Top Category Callout */}
          {pieData.length > 0 && (
            <TouchableOpacity
              style={[styles.topCategoryCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.topCategoryLeft}>
                <Text style={[styles.topCategoryLabel, { color: colors.textSecondary }]}>
                  Top category
                </Text>
                <Text 
                  style={[styles.topCategoryName, { color: colors.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {pieData[0]?.name}
                </Text>
              </View>
              <View style={styles.topCategoryRight}>
                <Text 
                  style={[styles.topCategoryAmount, { color: colors.text }]}
                >
                  {formatCurrency(pieData[0]?.value || 0)}
                </Text>
                <Text 
                  style={[styles.topCategoryPercent, { color: colors.textSecondary }]}
                >
                  {pieData[0]?.percent}% of total
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  pieChartColumn: {
    flex: 1,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 160,
    width: 160,
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 64,
    left: 40,
    width: 80,
  },
  pieCenterAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pieCenterLabel: {
    fontSize: 10,
  },
  legendContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 24,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 0,
    marginLeft: 4,
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  barChartColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  barChartTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 140,
  },
  barValue: {
    fontSize: 9,
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 12,
  },
  bar: {
    width: '75%',
    borderRadius: 4,
    minHeight: 4,
    alignSelf: 'center',
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    minHeight: 14,
  },
  topCategoryCard: {
    flexDirection: 'column',
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  topCategoryLeft: {
    marginBottom: 12,
  },
  topCategoryLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  topCategoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  topCategoryRight: {
    alignItems: 'flex-start',
  },
  topCategoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  topCategoryPercent: {
    fontSize: 11,
  },
});