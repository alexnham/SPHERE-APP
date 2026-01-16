import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Calendar } from 'lucide-react-native';

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
      <View style={styles.titleRow}>
        <Calendar size={20} color={colors.primary} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Upcoming Bills
        </Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        {billCount} recurring charges detected
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: { gap: 8 },
  backText: { fontSize: 16, fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13 },
});