import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  progress: number; // 0-100
  radius?: number;
  size?: number;
  label?: string;
  amount: string;
  statusText?: string;
  statusColor?: string;
  statusIcon?: React.ReactNode;
  colors: any;
}

export const CircularProgress = ({
  progress,
  radius = 42,
  size = 160,
  label,
  amount,
  statusText,
  statusColor,
  statusIcon,
  colors,
}: CircularProgressProps) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const progressColor = progress <= 100 ? colors.primary : '#f59e0b';

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth="8"
          />
          <Circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View style={styles.ringContent}>
          {label && (
            <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>{label}</Text>
          )}
          <Text style={[styles.ringPercent, { color: colors.text }]}>
            {progress.toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>

      {statusText && (
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor || '#10b981'}20` }]}>
          {statusIcon}
          <Text style={[styles.statusText, { color: statusColor || '#10b981' }]}>
            {statusText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  ringWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  ringPercent: {
    fontSize: 24,
    fontWeight: '700',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
