import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  CreditCard,
  GraduationCap,
  Car,
  Home,
  Banknote,
  ShoppingCart,
  FileText,
} from 'lucide-react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { debtTypeColors, debtTypeLabels, debtTypeIconNames } from './constants';

interface DebtTypeBreakdownProps {
  debtByType: Record<string, number>;
  totalDebt: number;
  colors: any;
}

// Icon map for debt types
const debtTypeIconMap: Record<string, React.ComponentType<any>> = {
  CreditCard,
  GraduationCap,
  Car,
  Home,
  Banknote,
  ShoppingCart,
  FileText,
};

export const DebtTypeBreakdown = ({ debtByType, totalDebt, colors }: DebtTypeBreakdownProps) => {
  const sortedTypes = Object.entries(debtByType).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        By Category
      </Text>
      <View style={styles.breakdownList}>
        {sortedTypes.map(([type, amount]) => {
          const percent = (amount / totalDebt) * 100;
          const iconName = debtTypeIconNames[type] || 'CreditCard';
          const IconComponent = debtTypeIconMap[iconName] || CreditCard;
          
          return (
            <View key={type} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View style={styles.breakdownLeft}>
                  <View style={styles.breakdownIcon}>
                    <IconComponent size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>
                    {debtTypeLabels[type] || type.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: colors.text }]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
              <View style={[styles.breakdownBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: debtTypeColors[type] || colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownList: {
    gap: 16,
  },
  breakdownItem: {
    marginBottom: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    marginRight: 8,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});