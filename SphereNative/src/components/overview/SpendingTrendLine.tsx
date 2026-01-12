import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { transactions } from '../../lib/mockData';

interface SpendingTrendLineProps {
  colors: any;
}

export const SpendingTrendLine = ({ colors }: SpendingTrendLineProps) => {
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
        <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
          This month's spending
        </Text>
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

const styles = StyleSheet.create({
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
});