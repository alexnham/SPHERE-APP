import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface GoalItemProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}

export const GoalItem = ({ icon, label, selected, onPress, colors }: GoalItemProps) => (
  <TouchableOpacity
    style={[
      styles.container,
      { backgroundColor: selected ? `${colors.primary}15` : colors.surface },
      selected && { borderColor: colors.primary, borderWidth: 2 },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.icon}>{icon}</Text>
    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    <View
      style={[
        styles.check,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : 'transparent',
        },
      ]}
    >
      {selected && <Text style={styles.checkMark}>✓</Text>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  icon: { fontSize: 20 },
  label: { flex: 1, fontSize: 14, fontWeight: '500' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
});