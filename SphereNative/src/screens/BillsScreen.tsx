import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { recurringCharges } from '../lib/mockData';
import { BillsHeader, BillsSummary, BillsList } from '../components/bills';
import { Calendar, AlertCircle } from 'lucide-react-native';

export default function BillsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
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

  // Simple View
  if (isSimpleView) {
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
          contentContainerStyle={styles.simpleContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Simple Summary */}
          <Card>
            <View style={styles.simpleSummary}>
              <View style={styles.simpleSummaryHeader}>
                <Calendar size={20} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.simpleSummaryTitle, { color: colors.text }]}>
                  Upcoming Bills
                </Text>
              </View>
              <Text style={[styles.simpleSummaryAmount, { color: colors.text }]}>
                {formatCurrency(totalUpcoming)}
              </Text>
              <Text style={[styles.simpleSummarySubtext, { color: colors.textSecondary }]}>
                Due in next 7 days
              </Text>
            </View>
          </Card>

          {/* This Week Bills - Simplified */}
          {thisWeek.length > 0 && (
            <View style={styles.simpleBillsSection}>
              <Text style={[styles.simpleSectionTitle, { color: colors.text }]}>
                Due This Week ({thisWeek.length})
              </Text>
              {thisWeek.slice(0, 3).map((bill) => {
                const daysUntil = differenceInDays(bill.nextDate, new Date());
                const isUrgent = daysUntil <= 3;
                return (
                  <Card key={bill.id}>
                    <View style={styles.simpleBillItem}>
                      <View style={styles.simpleBillLeft}>
                        {isUrgent && <AlertCircle size={16} color="#ef4444" strokeWidth={2} />}
                        <View style={styles.simpleBillInfo}>
                          <Text style={[styles.simpleBillName, { color: colors.text }]}>
                            {bill.merchant}
                          </Text>
                          <Text style={[styles.simpleBillDate, { color: colors.textSecondary }]}>
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.simpleBillAmount, { color: colors.text }]}>
                        {formatCurrency(bill.avgAmount)}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  }

  // Detailed View
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
          title="Due This Week"
          bills={thisWeek}
          acknowledgedBills={acknowledgedBills}
          showAckButton
          onAcknowledge={acknowledgeBill}
        />

        <BillsList title="Coming Up Later" bills={laterBills} />

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
  simpleContentContainer: { padding: 16, gap: 16 },
  simpleSummary: {
    padding: 20,
    alignItems: 'center',
  },
  simpleSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  simpleSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  simpleSummaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  simpleSummarySubtext: {
    fontSize: 13,
  },
  simpleBillsSection: {
    gap: 12,
  },
  simpleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  simpleBillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  simpleBillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  simpleBillInfo: {
    flex: 1,
  },
  simpleBillName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  simpleBillDate: {
    fontSize: 12,
  },
  simpleBillAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: { height: 40 },
});