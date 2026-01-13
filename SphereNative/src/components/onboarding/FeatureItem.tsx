import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  colors: any;
}

export const FeatureItem = ({ icon, title, description, color, colors }: FeatureItemProps) => (
  <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <View style={[styles.iconWrapper, { backgroundColor: `${color}20` }]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <View style={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  description: { fontSize: 12 },
});