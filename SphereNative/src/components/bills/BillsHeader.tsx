import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface BillsHeaderProps {
  billCount: number;
  onBack: () => void;
}

export function BillsHeader({ billCount, onBack }: BillsHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      <View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          📅 Upcoming Bills
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {billCount} recurring charges detected
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: { gap: 8 },
  backText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13 },
});