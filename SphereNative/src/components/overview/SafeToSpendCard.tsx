import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { InfoTooltip } from '../shared';
import { formatCurrency } from '../../lib/utils';
import { 
  Shield, 
  Wallet, 
  TrendingDown, 
  Calendar 
} from 'lucide-react-native';

interface SafeToSpendCardProps {
  colors: any;
  safeToSpend?: number;
  breakdown?: {
    liquidAvailable: number;
    pendingOutflows: number;
    upcoming7dEssentials: number;
    userBuffer: number;
    isVaultBuffer?: boolean;
    bufferVaultName?: string;
  };
  weeklyData?: {
    last7Days: number[];
    weeklyChange: number;
  };
}

const defaultBreakdown = {
  liquidAvailable: 0,
  pendingOutflows: 0,
  upcoming7dEssentials: 0,
  userBuffer: 0,
};

// Icon map for breakdown items
const breakdownIcons: Record<string, React.FC<{size: number, color: string, strokeWidth: number}>> = {
  available: Wallet,
  pending: TrendingDown,
  bills: Calendar,
  buffer: Shield,
};

// Breakdown Item Component
const BreakdownItem = ({ iconKey, label, value, colors, type }: any) => {
  const getColor = () => {
    switch (type) {
      case 'positive': return colors.text;
      case 'pending': return '#f59e0b';
      case 'committed': return '#8b5cf6';
      case 'buffer': return '#6b7280';
      default: return colors.text;
    }
  };

  const IconComponent = breakdownIcons[iconKey];

  return (
    <View style={[styles.breakdownItem, { backgroundColor: `${colors.border}40` }]}>
      <View style={styles.breakdownLeft}>
        <View style={[styles.breakdownIcon, { backgroundColor: colors.surface }]}>
          {IconComponent && <IconComponent size={14} color={getColor()} strokeWidth={2} />}
        </View>
        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.breakdownValue, { color: getColor() }]}>
        {value >= 0 ? '+' : ''}{formatCurrency(value)}
      </Text>
    </View>
  );
};

export const SafeToSpendCard = ({ colors, safeToSpend = 0, breakdown = defaultBreakdown }: SafeToSpendCardProps) => {
  const healthPercent = breakdown.liquidAvailable > 0 
    ? Math.min(100, (safeToSpend / breakdown.liquidAvailable) * 100) 
    : 0;

  return (
    <Card>
      {/* Header */}
      <View style={styles.stsHeader}>
        <View style={styles.stsHeaderLeft}>
          <View style={[styles.stsIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Shield size={18} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.stsLabel, { color: colors.textSecondary }]}>Safe to Spend</Text>
          <InfoTooltip
            title="Safe to Spend"
            content="This is what you can comfortably spend today without affecting upcoming bills or your safety buffer."
          />
        </View>
        <View style={[styles.healthBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={[styles.healthText, { color: '#10b981' }]}>{Math.round(healthPercent)}%</Text>
        </View>
      </View>

      {/* Amount */}
      <Text style={[styles.stsAmount, { color: colors.text }]}>{formatCurrency(safeToSpend)}</Text>

      {/* Breakdown Items */}
      <View style={styles.breakdownList}>
        <BreakdownItem iconKey="available" label="Available" value={breakdown.liquidAvailable} colors={colors} type="positive" />
        <BreakdownItem iconKey="pending" label="Pending" value={-breakdown.pendingOutflows} colors={colors} type="pending" />
        <BreakdownItem iconKey="bills" label="Bills (7 days)" value={-breakdown.upcoming7dEssentials} colors={colors} type="committed" />
        <BreakdownItem 
          iconKey="buffer" 
          label={
            breakdown.isVaultBuffer && breakdown.bufferVaultName 
              ? breakdown.bufferVaultName 
              : breakdown.isVaultBuffer 
              ? "Savings Vaults" 
              : "Buffer"
          } 
          value={-breakdown.userBuffer} 
          colors={colors} 
          type="buffer" 
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '700',
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
    padding: 12,
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
});