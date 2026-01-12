import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { recurringCharges } from '../lib/mockData';
import { BillsHeader, BillsSummary, BillsList } from '../components/bills';

export default function BillsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [acknowledgedBills, setAcknowledgedBills] = useState<Set<string>>(new Set());

  const sortedBills = [...recurringCharges].sort(
    (a, b) => a.nextDate.getTime() - b.nextDate.getTime()
  );

  const totalMonthly = sortedBills
    .filter((b) => b.cadence === 'monthly')
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const totalUpcoming = sortedBills
    .filter(
      (b) =>
        differenceInDays(b.nextDate, new Date()) <= 7 &&
        differenceInDays(b.nextDate, new Date()) >= 0
    )
    .reduce((sum, b) => sum + b.avgAmount, 0);

  const acknowledgeBill = (billId: string) => {
    setAcknowledgedBills((prev) => new Set([...prev, billId]));
  };

  const thisWeek = sortedBills.filter((b) => {
    const days = differenceInDays(b.nextDate, new Date());
    return days >= 0 && days <= 7;
  });

  const laterBills = sortedBills.filter(
    (b) => differenceInDays(b.nextDate, new Date()) > 7
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <BillsHeader
          billCount={recurringCharges.length}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BillsSummary totalUpcoming={totalUpcoming} totalMonthly={totalMonthly} />

        <BillsList
          title="⏰ Due This Week"
          bills={thisWeek}
          acknowledgedBills={acknowledgedBills}
          showAckButton
          onAcknowledge={acknowledgeBill}
        />

        <BillsList title="📅 Coming Up Later" bills={laterBills} />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  bottomPadding: { height: 40 },
});