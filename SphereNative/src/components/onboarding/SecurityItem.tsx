import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SecurityItemProps {
  icon: string;
  text: string;
  color: string;
  colors: any;
}

export const SecurityItem = ({ icon, text, color, colors }: SecurityItemProps) => (
  <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <Text style={[styles.icon, { color }]}>{icon}</Text>
    <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  icon: { fontSize: 18 },
  text: { fontSize: 13 },
});