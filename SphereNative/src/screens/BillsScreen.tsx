import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { BillsHeader, BillsSummary, BillsList } from '../components/bills';
import {
  SimpleBillsSummary,
} from '../components/simple';
import { Calendar, AlertCircle } from 'lucide-react-native';
import { useBills } from '../hooks/useBills';

export default function BillsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [acknowledgedBills, setAcknowledgedBills] = useState<Set<string>>(new Set());
  const { bills, loading: billsLoading } = useBills();

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  }, [bills]);

  const totalMonthly = useMemo(() => {
    return sortedBills
    .filter((b) => b.cadence === 'monthly')
    .reduce((sum, b) => sum + b.avgAmount, 0);
  }, [sortedBills]);

  const totalUpcoming = useMemo(() => {
    return sortedBills
    .filter(
      (b) =>
        differenceInDays(b.nextDate, new Date()) <= 7 &&
        differenceInDays(b.nextDate, new Date()) >= 0
    )
    .reduce((sum, b) => sum + b.avgAmount, 0);
  }, [sortedBills]);

  const acknowledgeBill = (billId: string) => {
    setAcknowledgedBills((prev) => new Set([...prev, billId]));
  };

  const thisWeek = useMemo(() => {
    return sortedBills.filter((b) => {
    const days = differenceInDays(b.nextDate, new Date());
    return days >= 0 && days <= 7;
  });
  }, [sortedBills]);

  const laterBills = useMemo(() => {
    return sortedBills.filter((b) => differenceInDays(b.nextDate, new Date()) > 7);
  }, [sortedBills]);

  if (billsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

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
            billCount={bills.length}
            onBack={() => navigation.goBack()}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.simpleContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Simple Summary */}
          <SimpleBillsSummary
            amount={totalUpcoming}
            subtitle="Due in next 7 days"
            colors={colors}
          />

          {/* This Week Bills - Simplified */}
          {thisWeek.length > 0 && (
            <View style={styles.simpleBillsSection}>
              <Text style={[styles.simpleSectionTitle, { color: colors.text }]}>
                Due This Week ({thisWeek.length})
              </Text>
              {thisWeek.slice(0, totalUpcoming).map((bill) => {
                const daysUntil = differenceInDays(bill.nextDate, new Date());
                const isUrgent = daysUntil <= 3;
                return (
                  <Card key={bill.id}>
                    <View style={styles.simpleBillItem}>
                      <View style={styles.simpleBillLeft}>
                        {isUrgent && <AlertCircle size={16} color="#ef4444" strokeWidth={2} />}
                        <View style={styles.simpleBillInfo}>
                          <Text 
                            style={[styles.simpleBillName, { color: colors.text }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {bill.merchant}
                          </Text>
                          <Text style={[styles.simpleBillDate, { color: colors.textSecondary }]}>
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        style={[styles.simpleBillAmount, { color: colors.text }]}
                        numberOfLines={1}
                      >
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
          billCount={bills.length}
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
  simpleContentContainer: { padding: 16, gap: 20 },
  simpleBillsSection: {
    gap: 4,
    marginTop: 4,
  },
  simpleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  simpleBillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleBillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 12,
  },
  simpleBillInfo: {
    flex: 1,
    minWidth: 0,
  },
  simpleBillName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  simpleBillDate: {
    fontSize: 12,
  },
  simpleBillAmount: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 0,
  },
  bottomPadding: { height: 40 },
  loadingText: {
    fontSize: 14,
  },
});