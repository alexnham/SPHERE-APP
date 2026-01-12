import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
  backgroundColor: string;
  height?: number;
}

export const ProgressBar = ({ 
  progress, 
  color, 
  backgroundColor, 
  height = 8 
}: ProgressBarProps) => (
  <View style={[styles.container, { backgroundColor, height, borderRadius: height / 2 }]}>
    <View
      style={[
        styles.fill,
        {
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color,
          height,
          borderRadius: height / 2,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});