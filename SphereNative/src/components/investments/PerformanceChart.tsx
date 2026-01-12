import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { performanceData } from './constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PerformanceChartProps {
  colors: any;
}

export const PerformanceChart = ({ colors }: PerformanceChartProps) => {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 160;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const minValue = Math.min(...performanceData) * 0.95;
  const maxValue = Math.max(...performanceData) * 1.05;
  const valueRange = maxValue - minValue;

  // Generate path points
  const points = performanceData.map((value, index) => {
    const x = (index / (performanceData.length - 1)) * chartWidth;
    const y = paddingTop + graphHeight - ((value - minValue) / valueRange) * graphHeight;
    return { x, y };
  });

  // Create line path
  const linePath = points
    .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(' ');

  // Create area path
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight - paddingBottom} L 0 ${chartHeight - paddingBottom} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <Line
            key={i}
            x1={0}
            y1={paddingTop + (graphHeight / 3) * i}
            x2={chartWidth}
            y2={paddingTop + (graphHeight / 3) * i}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {['Jan', 'Apr', 'Jul', 'Oct', 'Now'].map((label, index) => (
          <Text
            key={index}
            style={[styles.xAxisLabel, { color: colors.textSecondary }]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 11,
  },
});