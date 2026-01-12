import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SemiCircleGaugeProps {
  percent: number;
  colors: any;
}

export const SemiCircleGauge = ({ percent, colors }: SemiCircleGaugeProps) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2 + 10;

  // Arc path for semi-circle (180 degrees)
  const createArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Background arc (full semi-circle: 180 to 360)
  const bgPath = createArc(180, 360);

  // Progress arc
  const progressAngle = 180 + (percent / 100) * 180;
  const progressPath = createArc(180, progressAngle);

  // Get color based on utilization
  const getGaugeColor = () => {
    if (percent >= 80) return '#ef4444';
    if (percent >= 50) return '#f59e0b';
    return colors.primary;
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size / 2 + 30}>
        {/* Background arc */}
        <Path
          d={bgPath}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <Path
          d={progressPath}
          fill="none"
          stroke={getGaugeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugePercent, { color: colors.textSecondary }]}>
          {percent.toFixed(0)}% utilized
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gaugeContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  gaugeCenter: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  gaugePercent: {
    fontSize: 12,
  },
});