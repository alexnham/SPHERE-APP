import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LegendItemProps {
  color: string;
  label: string;
  value: string;
  colors: any;
}

export const LegendItem = ({ color, label, value, colors }: LegendItemProps) => (
  <View style={styles.container}>
    <View style={styles.left}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
});