import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { transactions } from '../../lib/mockData';

interface SpendingCalendarProps {
  colors: any;
}

export const SpendingCalendar = ({ colors }: SpendingCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

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

  // Get transactions for a specific day
  const getTransactionsForDay = (day: number, month: number, year: number) => {
    return transactions.filter((t) => {
      const txnDate = new Date(t.date);
      return (
        txnDate.getDate() === day &&
        txnDate.getMonth() === month &&
        txnDate.getFullYear() === year &&
        t.amount > 0
      );
    });
  };

  // Calculate daily spend totals from actual transactions (memoized for performance)
  const dailySpendTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.amount > 0) {
        const txnDate = new Date(t.date);
        const key = `${txnDate.getFullYear()}-${txnDate.getMonth()}-${txnDate.getDate()}`;
        totals[key] = (totals[key] || 0) + t.amount;
      }
    });
    return totals;
  }, []);

  // Get spending for a day from actual transactions
  const getSpendForDay = (day: number) => {
    const key = `${currentYear}-${currentMonth}-${day}`;
    return dailySpendTotals[key] || 0;
  };

  // Get intensity color
  const getIntensityColor = (amount: number) => {
    if (amount === 0) return 'transparent';
    if (amount < 30) return 'rgba(16, 185, 129, 0.2)';
    if (amount < 80) return 'rgba(139, 92, 246, 0.2)';
    if (amount < 150) return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(239, 68, 68, 0.2)';
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
  const selectedDayTotal = selectedDayTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card>
      {/* Header with navigation */}
      <View style={styles.calendarHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Spending Calendar
        </Text>
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={{ color: colors.textSecondary }}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.text }]}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={() => navigateMonth('next')}
          >
            <Text style={{ color: colors.textSecondary }}>▶</Text>
          </TouchableOpacity>
        </View>
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
                <Text style={{ fontSize: 20, color: colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedDayTransactions.length > 0 ? (
              <ScrollView style={styles.modalScroll}>
                {selectedDayTransactions.map((txn) => (
                  <View
                    key={txn.id}
                    style={[styles.txnItem, { backgroundColor: colors.surface }]}
                  >
                    <View>
                      <Text style={[styles.txnMerchant, { color: colors.text }]}>
                        {txn.merchant}
                      </Text>
                      <Text style={[styles.txnCategory, { color: colors.textSecondary }]}>
                        {txn.category}
                      </Text>
                    </View>
                    <Text style={[styles.txnAmount, { color: colors.text }]}>
                      {formatCurrency(txn.amount)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.noSpendText, { color: colors.textSecondary }]}>
                No spending recorded this day
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 120,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
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
  txnMerchant: {
    fontSize: 14,
    fontWeight: '500',
  },
  txnCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  noSpendText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});