import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AccountBreakdownCardProps {
  accountsByType: Record<string, number>;
  totalAssets: number;
  accountTypeColors: Record<string, string>;
  colors: any;
}

export const AccountBreakdownCard = ({
  accountsByType,
  totalAssets,
  accountTypeColors,
  colors,
}: AccountBreakdownCardProps) => {
  const barWidth = SCREEN_WIDTH - 80;

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Account Breakdown
      </Text>

      {/* Stacked Bar */}
      <View style={styles.stackedBarContainer}>
        <Svg width={barWidth} height={16}>
          {(() => {
            let currentX = 0;
            return Object.entries(accountsByType).map(([type, amount], index) => {
              const width = (amount / totalAssets) * barWidth;
              const x = currentX;
              currentX += width;

              return (
                <Rect
                  key={type}
                  x={x}
                  y={0}
                  width={width}
                  height={16}
                  rx={index === 0 ? 8 : 0}
                  ry={index === 0 ? 8 : 0}
                  fill={accountTypeColors[type] || colors.primary}
                />
              );
            });
          })()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {Object.entries(accountsByType).map(([type, amount]) => (
          <View key={type} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: accountTypeColors[type] || colors.primary },
                ]}
              />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
            <Text style={[styles.legendAmount, { color: colors.text }]}>
              {formatCurrency(amount)}
            </Text>
          </View>
        ))}
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
  stackedBarContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  legendContainer: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});