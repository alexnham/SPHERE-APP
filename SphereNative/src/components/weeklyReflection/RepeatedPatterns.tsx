import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface MerchantData {
  count: number;
  total: number;
}

interface RepeatedPatternsProps {
  merchants: [string, MerchantData][];
}

export function RepeatedPatterns({ merchants }: RepeatedPatternsProps) {
  const { colors } = useTheme();

  if (merchants.length === 0) return null;

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🔄 What Repeated
      </Text>
      {merchants.map(([merchant, data]) => (
        <View
          key={merchant}
          style={[styles.merchantItem, { backgroundColor: colors.surface }]}
        >
          <View>
            <Text style={[styles.merchantName, { color: colors.text }]}>{merchant}</Text>
            <Text style={[styles.merchantMeta, { color: colors.textSecondary }]}>
              {data.count} visits
            </Text>
          </View>
          <Text style={[styles.merchantTotal, { color: colors.text }]}>
            {formatCurrency(data.total)}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  merchantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  merchantName: { fontSize: 14, fontWeight: '500' },
  merchantMeta: { fontSize: 11, marginTop: 2 },
  merchantTotal: { fontSize: 14, fontWeight: '600' },
});