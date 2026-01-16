import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { dailySpendData } from '../../lib/mockData';
import { MiniSparkline } from './MiniSparkline';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Sparkles, BarChart3, PartyPopper } from 'lucide-react-native';

interface WeeklyInsightCardProps {
  colors: any;
}

export const WeeklyInsightCard = ({ colors }: WeeklyInsightCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
    <TouchableOpacity onPress={() => navigation.navigate('WeeklyReflection')}>
      <Card>
        {/* Header */}
        <View style={styles.insightHeader}>
          <View style={styles.insightHeaderLeft}>
            <Sparkles size={18} color={colors.primary} strokeWidth={2} />
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
          <View style={styles.messageContent}>
            {isDown ? (
              <PartyPopper size={14} color="#10b981" strokeWidth={2} style={{ marginRight: 6 }} />
            ) : (
              <BarChart3 size={14} color={colors.textSecondary} strokeWidth={2} style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.insightMessageText, { color: colors.textSecondary }]}>
              {isDown
                ? "Great job! You're spending less than last week."
                : "Your spending is up this week. Check your transactions."}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  insightAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  insightBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insightRight: {
    marginLeft: 16,
  },
  insightMessage: {
    padding: 12,
    borderRadius: 10,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightMessageText: {
    fontSize: 13,
    flex: 1,
  },
});