import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';

interface CreditUtilizationProps {
  utilizationPercent: number;
}

export function CreditUtilization({ utilizationPercent }: CreditUtilizationProps) {
  const { colors } = useTheme();
  const isHigh = utilizationPercent > 30;
  const barColor = isHigh ? '#f59e0b' : '#10b981';

  return (
    <Card>
      <View style={styles.utilizationHeader}>
        <Text style={styles.utilizationIcon}>📊</Text>
        <Text style={[styles.utilizationLabel, { color: colors.textSecondary }]}>
          Credit Utilization
        </Text>
        <Text style={[styles.utilizationPercent, { color: barColor }]}>
          {utilizationPercent.toFixed(0)}%
        </Text>
      </View>
      <View style={[styles.utilizationBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.utilizationFill,
            {
              width: `${Math.min(100, utilizationPercent)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.utilizationHint, { color: colors.textSecondary }]}>
        {isHigh
          ? 'High utilization may affect your credit score'
          : 'Good! Under 30% is ideal'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  utilizationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  utilizationIcon: { fontSize: 16, marginRight: 8 },
  utilizationLabel: { flex: 1, fontSize: 13 },
  utilizationPercent: { fontSize: 14, fontWeight: '600' },
  utilizationBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  utilizationFill: { height: '100%', borderRadius: 4 },
  utilizationHint: { fontSize: 11 },
});