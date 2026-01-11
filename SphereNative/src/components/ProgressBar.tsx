import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius } from '../lib/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar = ({ progress, color, height = 8, style }: ProgressBarProps) => {
  const { colors } = useTheme();
  const fillColor = color || colors.primary;

  return (
    <View style={[styles.container, { height, backgroundColor: colors.muted }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: fillColor,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});