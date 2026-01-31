import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AnimatedMoney } from '../../shared/AnimatedMoney';
import { formatCurrency } from '../../../lib/utils';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  radius?: number;
  strokeWidth?: number;
  label?: string;
  amount: string | number; // Can be string or number for animation
  colors: any;
  gradientColors?: { start: string; end: string };
  animated?: boolean; // Enable counting animation
}

export const ProgressRing = ({
  progress,
  size = 200,
  radius = 90,
  strokeWidth = 8,
  label,
  amount,
  colors,
  gradientColors,
  animated = false,
}: ProgressRingProps) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const gradientId = `ringGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  const startColor = gradientColors?.start || colors.primary;
  const endColor = gradientColors?.end || colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={startColor} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={endColor} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringContent}>
          {label && (
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          )}
          {animated && typeof amount === 'number' ? (
            <AnimatedMoney
              value={amount}
              style={[styles.amount, { color: colors.text }]}
              duration={1500}
            />
          ) : (
            <Text style={[styles.amount, { color: colors.text }]}>
              {typeof amount === 'number' ? formatCurrency(amount) : amount}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
  },
});
