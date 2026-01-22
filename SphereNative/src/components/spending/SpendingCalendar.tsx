import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { Transaction } from '../../lib/mockData';

interface SpendingCalendarProps {
  colors: any;
  transactions?: Transaction[];
}

export const SpendingCalendar = ({ colors, transactions = [] }: SpendingCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [transactionDirection, setTransactionDirection] = useState<'INFLOW' | 'OUTFLOW'>('OUTFLOW'); // Default to outgoing

  // Debug: Log transactions on mount/update
  useEffect(() => {
    console.log('[SpendingCalendar] Total transactions:', transactions.length);
    const spendingTransactions = transactions.filter(t => 
      t.direction === 'OUTFLOW' || (t.direction === undefined && t.amount < 0)
    );
    console.log('[SpendingCalendar] Spending transactions (OUTFLOW):', spendingTransactions.length);
    if (spendingTransactions.length > 0) {
      console.log('[SpendingCalendar] Sample transaction dates:', spendingTransactions.slice(0, 5).map(t => ({
        id: t.id,
        date: t.date.toISOString(),
        dateString: t.date.toString(),
        dateLocal: `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}-${t.date.getDate().toString().padStart(2, '0')}`,
        amount: t.amount,
        direction: t.direction,
        merchant: t.merchant,
      })));
    }
  }, [transactions]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  // Debug: Log current month/year
  useEffect(() => {
    console.log('[SpendingCalendar] Current month/year:', currentMonth + 1, currentYear);
  }, [currentMonth, currentYear]);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create calendar grid - organized by weeks (rows of 7)
  const calendarWeeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  
  // Add padding for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }
  
  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      calendarWeeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill remaining days in last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendarWeeks.push(currentWeek);
  }

  // Navigate month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Helper: Normalize date to local midnight for consistent comparison
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Helper: Convert category from "WORD_WORD" format to PascalCase
  const formatCategory = (category: string): string => {
    if (!category) return 'Other';
    // Split by underscore, capitalize first letter of each word, join with space
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get transactions for a specific day using posted date
  const getTransactionsForDay = (day: number, month: number, year: number) => {
    const targetDate = new Date(year, month, day);
    const normalizedTarget = normalizeDate(targetDate);
    
    return transactions.filter((t) => {
      // Filter by selected direction (INFLOW or OUTFLOW)
      const matchesDirection = 
        t.direction === transactionDirection ||
        (t.direction === undefined && 
         ((transactionDirection === 'OUTFLOW' && t.amount < 0) || 
          (transactionDirection === 'INFLOW' && t.amount > 0)));
      if (!matchesDirection) return false;
      
      // Use posted date, normalized to midnight
      const txnDate = normalizeDate(t.date);
      const matches = txnDate.getTime() === normalizedTarget.getTime();
      
      if (matches) {
        console.log('[SpendingCalendar] Match found:', {
          day,
          month: month + 1,
          year,
          txnDate: txnDate.toISOString(),
          targetDate: normalizedTarget.toISOString(),
          merchant: t.merchant,
          amount: t.amount,
          direction: t.direction,
        });
      }
      
      return matches;
    });
  };

  // Calculate daily totals from actual transactions (memoized for performance)
  // Uses posted date for display, filtered by selected direction
  const dailySpendTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    console.log('[SpendingCalendar] Calculating daily totals from', transactions.length, 'transactions for direction:', transactionDirection);
    transactions.forEach((t) => {
      // Filter by selected direction (INFLOW or OUTFLOW)
      const matchesDirection = 
        t.direction === transactionDirection ||
        (t.direction === undefined && 
         ((transactionDirection === 'OUTFLOW' && t.amount < 0) || 
          (transactionDirection === 'INFLOW' && t.amount > 0)));
      if (!matchesDirection) return;
      
      // Use posted date, normalized to midnight
      const txnDate = normalizeDate(t.date);
      // Use YYYY-M-D format for key matching (month is 0-indexed, so we use getMonth() directly)
      // This matches the lookup key format: `${currentYear}-${currentMonth}-${day}`
      const key = `${txnDate.getFullYear()}-${txnDate.getMonth()}-${txnDate.getDate()}`;
      totals[key] = (totals[key] || 0) + Math.abs(t.amount);
      console.log('[SpendingCalendar] Transaction:', {
        date: t.date.toISOString(),
        dateLocal: `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}-${t.date.getDate().toString().padStart(2, '0')}`,
        normalized: txnDate.toISOString(),
        key,
        amount: Math.abs(t.amount),
        direction: t.direction,
        merchant: t.merchant,
      });
    });
    console.log('[SpendingCalendar] Daily totals keys:', Object.keys(totals).sort());
    console.log('[SpendingCalendar] Daily totals:', totals);
    return totals;
  }, [transactions, transactionDirection]);

  // Get spending for a day from actual transactions
  const getSpendForDay = (day: number) => {
    // Key format: YYYY-M-D (month is 0-indexed from getMonth())
    const key = `${currentYear}-${currentMonth}-${day}`;
    const amount = dailySpendTotals[key] || 0;
    if (amount > 0) {
      console.log('[SpendingCalendar] Found spending for day', day, 'key:', key, 'amount:', amount);
    } else {
      // Debug: log when we're looking for a key that doesn't exist
      const allKeys = Object.keys(dailySpendTotals);
      if (allKeys.length > 0 && day <= 10) {
        console.log('[SpendingCalendar] Looking for key:', key, 'Available keys sample:', allKeys.slice(0, 5));
      }
    }
    return amount;
  };

  // Get intensity color - same colors for both, but inverted logic
  // For OUTFLOW: lower = green (good), higher = red (bad)
  // For INFLOW: higher = green (good), lower = red (bad)
  const getIntensityColor = (amount: number) => {
    if (amount === 0) return 'transparent';
    
    // Define thresholds
    const low = 30;
    const medium = 80;
    const high = 150;
    
    if (transactionDirection === 'OUTFLOW') {
      // Outgoing: lower amounts are better (green), higher are worse (red)
      if (amount < low) return 'rgba(16, 185, 129, 0.2)'; // Green - low spending
      if (amount < medium) return 'rgba(139, 92, 246, 0.2)'; // Purple - moderate
      if (amount < high) return 'rgba(245, 158, 11, 0.2)'; // Orange - higher
      return 'rgba(239, 68, 68, 0.2)'; // Red - peak spending
    } else {
      // Incoming: higher amounts are better (green), lower are worse (red)
      if (amount < low) return 'rgba(239, 68, 68, 0.2)'; // Red - low income
      if (amount < medium) return 'rgba(245, 158, 11, 0.2)'; // Orange - moderate
      if (amount < high) return 'rgba(139, 92, 246, 0.2)'; // Purple - higher
      return 'rgba(16, 185, 129, 0.2)'; // Green - peak income
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayPress = (day: number) => {
    const pressedDate = new Date(currentYear, currentMonth, day, 0, 0, 0, 0);
    const isFuture = pressedDate > today;
    if (!isFuture) {
      setSelectedDate(pressedDate);
      setShowModal(true);
    }
  };

  // Get transactions for the selected date
  const selectedDayTransactions = selectedDate
    ? getTransactionsForDay(
        selectedDate.getDate(),
        selectedDate.getMonth(),
        selectedDate.getFullYear()
      )
    : [];

  // Calculate total for selected day
  const selectedDayTotal = selectedDayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <Card>
      {/* Header with navigation */}
      <View style={styles.calendarHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Spending Calendar
        </Text>
        {/* Direction Toggle */}
        <View style={styles.directionToggleContainer}>
          <Text style={[styles.directionLabel, { color: colors.textSecondary }]}>
            Outgoing
          </Text>
          <Switch
            value={transactionDirection === 'INFLOW'}
            onValueChange={(value) => setTransactionDirection(value ? 'INFLOW' : 'OUTFLOW')}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
          <Text style={[styles.directionLabel, { color: colors.textSecondary }]}>
            Incoming
          </Text>
        </View>
      </View>
      <View style={styles.monthNavContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surface }]}
          onPress={() => navigateMonth('prev')}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.text }]} numberOfLines={1}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surface }]}
          onPress={() => navigateMonth('next')}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Week day headers */}
      <View style={styles.weekRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={[styles.weekDayLabel, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid - render by weeks */}
      {calendarWeeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.calendarCell} />;
            }

            const spending = getSpendForDay(day);
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const isFuture = new Date(currentYear, currentMonth, day) > today;

            return (
              <TouchableOpacity
                key={`day-${day}`}
                style={[
                  styles.calendarCell,
                  {
                    backgroundColor: getIntensityColor(spending),
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? colors.primary : 'transparent',
                    opacity: isFuture ? 0.3 : 1,
                  },
                ]}
                onPress={() => handleDayPress(day)}
                disabled={isFuture}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    {
                      color: isToday ? colors.primary : colors.text,
                      fontWeight: isToday ? '700' : '500',
                    },
                  ]}
                >
                  {day}
                </Text>
                {spending > 0 && !isFuture && (
                  <Text style={[styles.calendarSpendText, { color: colors.textSecondary }]}>
                    ${Math.round(spending)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={[styles.calendarLegend, { borderTopColor: colors.border }]}>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]} />
          <Text style={[styles.legendSmallText, { color: colors.textSecondary }]}>Light</Text>
        </View>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]} />
          <Text style={[styles.legendSmallText, { color: colors.textSecondary }]}>Moderate</Text>
        </View>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]} />
          <Text style={[styles.legendSmallText, { color: colors.textSecondary }]}>Higher</Text>
        </View>
        <View style={styles.calendarLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} />
          <Text style={[styles.legendSmallText, { color: colors.textSecondary }]}>Peak</Text>
        </View>
      </View>

      {/* Day Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {selectedDayTotal > 0 && (
                  <Text style={[styles.modalTotal, { color: colors.primary }]}>
                    Total: {formatCurrency(selectedDayTotal)}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {selectedDayTransactions.length > 0 ? (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {selectedDayTransactions
                  .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)) // Sort by amount descending
                  .map((txn) => (
                    <View
                      key={txn.id}
                      style={[styles.txnItem, { backgroundColor: colors.surface }]}
                    >
                      <View style={styles.txnLeft}>
                        <Text 
                          style={[styles.txnMerchant, { color: colors.text }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {txn.merchant}
                        </Text>
                        <View style={styles.txnMeta}>
                          <Text style={[styles.txnCategory, { color: colors.textSecondary }]}>
                            {formatCategory(txn.category)}
                          </Text>
                          {txn.pending && (
                            <Text style={[styles.txnPending, { color: '#f59e0b' }]}>
                              Pending
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.txnAmount, { color: colors.text }]}>
                        {formatCurrency(Math.abs(txn.amount))}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            ) : (
              <Text style={[styles.noSpendText, { color: colors.textSecondary }]}>
                No {transactionDirection === 'OUTFLOW' ? 'spending' : 'income'} recorded this day
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarHeader: {
    marginBottom: 12,
  },
  directionToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  directionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    maxWidth: 200,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  calendarCell: {
    flex: 1,
    minHeight: 40,
    maxHeight: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 2,
  },
  calendarDayText: {
    fontSize: 12,
  },
  calendarSpendText: {
    fontSize: 8,
    marginTop: 1,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 4,
  },
  legendSmallText: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalTotal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  modalScroll: {
    maxHeight: 300,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  txnLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  txnMerchant: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  txnMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txnCategory: {
    fontSize: 12,
  },
  txnPending: {
    fontSize: 11,
    fontWeight: '500',
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
  },
  noSpendText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});