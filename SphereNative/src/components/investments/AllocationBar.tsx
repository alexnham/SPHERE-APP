import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { allocations } from './constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AllocationBarProps {
  colors: any;
}

export const AllocationBar = ({ colors }: AllocationBarProps) => {
  const barWidth = SCREEN_WIDTH - 64;

  return (
    <View style={styles.allocationSection}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        Asset Allocation
      </Text>

      {/* Stacked bar */}
      <View style={styles.allocationBarContainer}>
        <Svg width={barWidth} height={12}>
          {(() => {
            let currentX = 0;
            return allocations.map((allocation, index) => {
              const width = (allocation.value / 100) * barWidth;
              const x = currentX;
              currentX += width;

              return (
                <Rect
                  key={allocation.name}
                  x={x}
                  y={0}
                  width={width}
                  height={12}
                  rx={index === 0 ? 6 : 0}
                  ry={index === 0 ? 6 : 0}
                  fill={allocation.color}
                />
              );
            });
          })()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.allocationLegend}>
        {allocations.map((allocation) => (
          <View key={allocation.name} style={styles.allocationLegendItem}>
            <View
              style={[styles.allocationDot, { backgroundColor: allocation.color }]}
            />
            <Text style={[styles.allocationName, { color: colors.textSecondary }]}>
              {allocation.name}
            </Text>
            <Text style={[styles.allocationPercent, { color: colors.text }]}>
              {allocation.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  allocationSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  allocationBarContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  allocationLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allocationLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 4,
  },
  allocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  allocationName: {
    fontSize: 12,
    flex: 1,
  },
  allocationPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
});