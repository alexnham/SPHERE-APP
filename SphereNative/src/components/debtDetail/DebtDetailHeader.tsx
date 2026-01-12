import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getIcon, getTypeLabel } from './constants';

interface DebtDetailHeaderProps {
  name: string;
  type: string;
  onBack: () => void;
}

export function DebtDetailHeader({ name, type, onBack }: DebtDetailHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        <View style={[styles.debtIcon, { backgroundColor: colors.muted }]}>
          <Text style={styles.debtIconText}>{getIcon(type)}</Text>
        </View>
        <View>
          <Text style={[styles.debtName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.debtType, { color: colors.textSecondary }]}>
            {getTypeLabel(type)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  debtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtIconText: { fontSize: 20 },
  debtName: { fontSize: 16, fontWeight: '600' },
  debtType: { fontSize: 12 },
});