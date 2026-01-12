import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface CategoryBreakdownProps {
  categories: [string, number][];
  totalSpend: number;
}

export function CategoryBreakdown({ categories, totalSpend }: CategoryBreakdownProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        📊 Where It Went
      </Text>
      {categories.map(([category, amount]) => {
        const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
        return (
          <View key={category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
              <Text style={[styles.categoryAmount, { color: colors.textSecondary }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
            <View style={[styles.categoryBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.categoryBarFill,
                  { width: `${percentage}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  categoryItem: { marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryName: { fontSize: 14, fontWeight: '500' },
  categoryAmount: { fontSize: 13 },
  categoryBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: 4 },
});