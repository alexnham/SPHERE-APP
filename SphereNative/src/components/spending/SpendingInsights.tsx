import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { budgetData, weeklySpendingData } from './constants';

interface SpendingInsightsProps {
  colors: any;
}

export const SpendingInsights = ({ colors }: SpendingInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 4;

  // Calculate spending by category
  const totalSpending = budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const pieData = budgetData.categories
    .map((cat) => ({
      name: cat.name,
      value: cat.spent,
      color: cat.color,
      percent: ((cat.spent / totalSpending) * 100).toFixed(0),
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate trend
  const lastWeek = weeklySpendingData[weeklySpendingData.length - 1]?.spending || 0;
  const prevWeek = weeklySpendingData[weeklySpendingData.length - 2]?.spending || 0;
  const trendPercent = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : 0;
  const isSpendingUp = trendPercent > 0;

  const maxWeekly = Math.max(...weeklySpendingData.map((d) => d.spending));
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
          <Text style={{ marginRight: 4 }}>{isSpendingUp ? '📈' : '📉'}</Text>
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
              {pieData.map((item, index) => {
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
              })}
              {/* Inner circle for donut effect */}
              <Circle cx={80} cy={80} r={32} fill={colors.card} />
            </Svg>
            {/* Center text */}
            <View style={styles.pieCenter}>
              <Text style={[styles.pieCenterAmount, { color: colors.text }]}>
                {formatCurrency(totalSpending)}
              </Text>
              <Text style={[styles.pieCenterLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Legend - expandable */}
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
                <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                  {isExpanded
                    ? '▲ Show less'
                    : `▼ Show ${pieData.length - INITIAL_ITEMS} more`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
          <TouchableOpacity
            style={[styles.topCategoryCard, { backgroundColor: colors.surface }]}
          >
            <View>
              <Text style={[styles.topCategoryLabel, { color: colors.textSecondary }]}>
                Top category
              </Text>
              <Text style={[styles.topCategoryName, { color: colors.text }]}>
                {pieData[0]?.name}
              </Text>
            </View>
            <View style={styles.topCategoryRight}>
              <Text style={[styles.topCategoryAmount, { color: colors.text }]}>
                {formatCurrency(pieData[0]?.value || 0)}
              </Text>
              <Text style={[styles.topCategoryPercent, { color: colors.textSecondary }]}>
                {pieData[0]?.percent}% of total
              </Text>
            </View>
          </TouchableOpacity>
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
    gap: 16,
  },
  pieChartColumn: {
    flex: 1,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  pieCenterAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pieCenterLabel: {
    fontSize: 10,
  },
  legendContainer: {
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '600',
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
  },
  barChartTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    marginBottom: 4,
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  topCategoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  topCategoryLabel: {
    fontSize: 10,
  },
  topCategoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  topCategoryRight: {
    alignItems: 'flex-end',
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  topCategoryPercent: {
    fontSize: 10,
  },
});