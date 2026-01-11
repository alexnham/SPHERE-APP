import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import {
  dailySpendData,
  transactions,
  categoryColors,
} from '../lib/mockData';
import { Card } from '../components/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ DATA ============
const budgetData = {
  spent: 2847,
  budget: 4000,
  categories: [
    { name: 'Groceries', spent: 423, budget: 500, color: categoryColors['Groceries'] || '#22c55e', icon: '🥑' },
    { name: 'Shopping', spent: 287, budget: 300, color: categoryColors['Shopping'] || '#ec4899', icon: '🛍️' },
    { name: 'Coffee', spent: 72, budget: 80, color: categoryColors['Coffee'] || '#8B4513', icon: '☕' },
    { name: 'Transport', spent: 134, budget: 150, color: categoryColors['Transport'] || '#3b82f6', icon: '🚗' },
    { name: 'Dining', spent: 234, budget: 250, color: categoryColors['Dining'] || '#f97316', icon: '🍽️' },
    { name: 'Gas', spent: 98, budget: 120, color: categoryColors['Gas'] || '#6b7280', icon: '⛽' },
    { name: 'Health', spent: 89, budget: 100, color: categoryColors['Health'] || '#ec4899', icon: '💊' },
    { name: 'Tech', spent: 187, budget: 200, color: categoryColors['Tech'] || '#06b6d4', icon: '💻' },
  ],
};

const weeklySpendingData = [
  { week: 'Week 1', spending: 687 },
  { week: 'Week 2', spending: 823 },
  { week: 'Week 3', spending: 592 },
  { week: 'Week 4', spending: 745 },
];

// ============ TAB COMPONENT ============
const TabButton = ({
  title,
  icon,
  isActive,
  onPress,
  colors,
}: {
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      {
        backgroundColor: isActive ? colors.primary : colors.surface,
        borderColor: isActive ? colors.primary : colors.border,
      },
    ]}
    onPress={onPress}
  >
    <Text style={{ marginRight: 6 }}>{icon}</Text>
    <Text
      style={[
        styles.tabButtonText,
        { color: isActive ? '#fff' : colors.textSecondary },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// ============ SPENDING INSIGHTS COMPONENT ============
const SpendingInsights = ({ colors }: { colors: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 4;

  // Calculate spending by category
  const totalSpending = budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const pieData = budgetData.categories
    .map((cat) => ({
      name: cat.name,
      value: cat.spent,
      color: cat.color,
      percent: ((cat.spent / totalSpending) * 100).toFixed(0),
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate trend
  const lastWeek = weeklySpendingData[weeklySpendingData.length - 1]?.spending || 0;
  const prevWeek = weeklySpendingData[weeklySpendingData.length - 2]?.spending || 0;
  const trendPercent = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : 0;
  const isSpendingUp = trendPercent > 0;

  const maxWeekly = Math.max(...weeklySpendingData.map((d) => d.spending));
  const barChartHeight = 140;

  return (
    <Card>
      {/* Header with trend badge */}
      <View style={styles.insightsHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Spending Insights
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Last 30 days breakdown
          </Text>
        </View>
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor: isSpendingUp
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            },
          ]}
        >
          <Text style={{ marginRight: 4 }}>{isSpendingUp ? '📈' : '📉'}</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isSpendingUp ? '#ef4444' : '#10b981',
            }}
          >
            {Math.abs(trendPercent).toFixed(0)}% vs last week
          </Text>
        </View>
      </View>

      {/* Two column layout */}
      <View style={styles.insightsGrid}>
        {/* Pie Chart Column */}
        <View style={styles.pieChartColumn}>
          <View style={styles.pieChartContainer}>
            <Svg width={160} height={160}>
              {pieData.map((item, index) => {
                const startAngle = pieData
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / totalSpending) * 360, -90);
                const sweepAngle = (item.value / totalSpending) * 360;
                const endAngle = startAngle + sweepAngle;

                const x1 = 80 + 50 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 80 + 50 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 80 + 50 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 80 + 50 * Math.sin((endAngle * Math.PI) / 180);

                const largeArc = sweepAngle > 180 ? 1 : 0;

                return (
                  <Path
                    key={index}
                    d={`M 80 80 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    opacity={0.85}
                  />
                );
              })}
              {/* Inner circle for donut effect */}
              <Circle cx={80} cy={80} r={32} fill={colors.card} />
            </Svg>
            {/* Center text */}
            <View style={styles.pieCenter}>
              <Text style={[styles.pieCenterAmount, { color: colors.text }]}>
                {formatCurrency(totalSpending)}
              </Text>
              <Text style={[styles.pieCenterLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Legend - expandable */}
          <View style={styles.legendContainer}>
            {(isExpanded ? pieData : pieData.slice(0, INITIAL_ITEMS)).map(
              (item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[styles.legendDot, { backgroundColor: item.color }]}
                    />
                    <Text
                      style={[styles.legendText, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.legendPercent, { color: colors.text }]}>
                    {item.percent}%
                  </Text>
                </View>
              )
            )}
            {pieData.length > INITIAL_ITEMS && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                  {isExpanded
                    ? '▲ Show less'
                    : `▼ Show ${pieData.length - INITIAL_ITEMS} more`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bar Chart Column */}
        <View style={styles.barChartColumn}>
          <Text style={[styles.barChartTitle, { color: colors.text }]}>
            Weekly Spending
          </Text>
          <View style={[styles.barChart, { height: barChartHeight }]}>
            {weeklySpendingData.map((item, index) => {
              const barHeight = (item.spending / maxWeekly) * (barChartHeight - 30);
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                    ${item.spending}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {item.week.replace('Week ', 'W')}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Top Category Callout */}
          <TouchableOpacity
            style={[styles.topCategoryCard, { backgroundColor: colors.surface }]}
          >
            <View>
              <Text style={[styles.topCategoryLabel, { color: colors.textSecondary }]}>
                Top category
              </Text>
              <Text style={[styles.topCategoryName, { color: colors.text }]}>
                {pieData[0]?.name}
              </Text>
            </View>
            <View style={styles.topCategoryRight}>
              <Text style={[styles.topCategoryAmount, { color: colors.text }]}>
                {formatCurrency(pieData[0]?.value || 0)}
              </Text>
              <Text style={[styles.topCategoryPercent, { color: colors.textSecondary }]}>
                {pieData[0]?.percent}% of total
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

// ============ SPENDING CALENDAR COMPONENT ============
const SpendingCalendar = ({ colors }: { colors: any }) => {
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

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Navigate month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Get spending for a day
  const getSpendForDay = (day: number) => {
    const dayData = dailySpendData.find((d) => {
      const date = new Date(d.date);
      return (
        date.getDate() === day &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
    return dayData?.amount || 0;
  };

  // Get transactions for a day
  const getTransactionsForDay = (day: number) => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        date.getDate() === day &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        t.amount > 0
      );
    });
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
  const cellSize = (SCREEN_WIDTH - 80) / 7;

  const handleDayPress = (day: number) => {
    const isFuture = new Date(currentYear, currentMonth, day) > today;
    if (!isFuture) {
      setSelectedDate(new Date(currentYear, currentMonth, day));
      setShowModal(true);
    }
  };

  const selectedDayTransactions = selectedDate
    ? getTransactionsForDay(selectedDate.getDate())
    : [];

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
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <Text
            key={index}
            style={[
              styles.weekDayLabel,
              { color: colors.textSecondary, width: cellSize },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={index} style={{ width: cellSize, height: cellSize }} />;
          }
          const spending = getSpendForDay(day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isFuture = new Date(currentYear, currentMonth, day) > today;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarCell,
                {
                  width: cellSize,
                  height: cellSize,
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
                  ${spending}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.calendarLegend}>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
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

// ============ BUDGET GOALS COMPONENT ============
const BudgetGoals = ({ colors }: { colors: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS = 3;

  const totalBudget = budgetData.categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = budgetData.categories.reduce((sum, c) => sum + c.spent, 0);
  const overallProgress = Math.min(100, (totalSpent / totalBudget) * 100);

  // Days calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const expectedProgress = (dayOfMonth / daysInMonth) * 100;
  const isOnTrack = overallProgress <= expectedProgress + 5;

  // Spending pace
  const expectedSpending = Math.round((totalBudget * dayOfMonth) / daysInMonth);
  const difference = totalSpent - expectedSpending;
  const percentDiff = expectedSpending > 0 ? Math.abs((difference / expectedSpending) * 100) : 0;
  const isUnder = difference <= 0;
  const isWarning = difference > 0 && percentDiff <= 20;

  const sortedCategories = [...budgetData.categories].sort(
    (a, b) => b.spent / b.budget - a.spent / a.budget
  );

  return (
    <Card>
      {/* Header */}
      <View style={styles.budgetHeader}>
        <View style={styles.budgetHeaderLeft}>
          <View style={[styles.targetIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Text>🎯</Text>
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Monthly Budgets
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {daysRemaining} days remaining
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.trackBadge,
            {
              backgroundColor: isOnTrack
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
            },
          ]}
        >
          <Text style={{ marginRight: 4 }}>{isOnTrack ? '✓' : '⚠️'}</Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: isOnTrack ? '#10b981' : '#f59e0b',
            }}
          >
            {isOnTrack ? 'On Track' : 'Ahead of Pace'}
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={[styles.overallProgress, { backgroundColor: colors.surface }]}>
        <View style={styles.overallProgressHeader}>
          <Text style={[styles.overallLabel, { color: colors.text }]}>
            Overall Spending
          </Text>
          <Text style={[styles.overallAmount, { color: colors.textSecondary }]}>
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${overallProgress}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabelText, { color: colors.textSecondary }]}>
            {overallProgress.toFixed(0)}% used
          </Text>
          <Text style={[styles.progressLabelText, { color: colors.textSecondary }]}>
            📈 {expectedProgress.toFixed(0)}% expected
          </Text>
        </View>
      </View>

      {/* Spending Pace Card */}
      <View
        style={[
          styles.paceCard,
          {
            backgroundColor: isUnder
              ? 'rgba(16, 185, 129, 0.1)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            borderColor: isUnder
              ? 'rgba(16, 185, 129, 0.2)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(239, 68, 68, 0.2)',
          },
        ]}
      >
        <View style={styles.paceHeader}>
          <Text style={[styles.paceTitle, { color: colors.text }]}>Spending Pace</Text>
          <View style={styles.paceStatus}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isUnder ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444',
              }}
            >
              {isUnder ? '📉 Under budget' : isWarning ? '📈 Slightly over' : '📈 Over budget'}
            </Text>
          </View>
        </View>
        <View style={styles.paceAmounts}>
          <View>
            <Text style={[styles.paceLabel, { color: colors.textSecondary }]}>
              You've spent
            </Text>
            <Text
              style={[
                styles.paceValue,
                { color: isUnder ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444' },
              ]}
            >
              {formatCurrency(totalSpent)}
            </Text>
          </View>
          <View style={styles.paceRight}>
            <Text style={[styles.paceLabel, { color: colors.textSecondary }]}>
              Should be at
            </Text>
            <Text style={[styles.paceValue, { color: colors.text }]}>
              {formatCurrency(expectedSpending)}
            </Text>
          </View>
        </View>
        <View style={[styles.paceDivider, { borderColor: isUnder ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
          <Text
            style={{
              fontSize: 11,
              color: isUnder ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444',
            }}
          >
            {isUnder
              ? `✓ You're ${formatCurrency(Math.abs(difference))} under your projected spending`
              : `⚠ You're ${formatCurrency(difference)} (${percentDiff.toFixed(0)}%) over your projected spending`}
          </Text>
        </View>
      </View>

      {/* Category Budgets */}
      <View style={styles.categoryList}>
        {(isExpanded ? sortedCategories : sortedCategories.slice(0, INITIAL_ITEMS)).map(
          (category, index) => {
            const progress = Math.min(100, (category.spent / category.budget) * 100);
            const isOverBudget = category.spent > category.budget;
            const isNearLimit = progress >= 80 && !isOverBudget;

            return (
              <View key={index} style={styles.categoryBudgetItem}>
                <View style={styles.categoryBudgetHeader}>
                  <View style={styles.categoryNameRow}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[styles.categoryBudgetName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                  <View style={styles.categoryAmounts}>
                    <Text
                      style={[
                        styles.categorySpent,
                        {
                          color: isOverBudget
                            ? '#ef4444'
                            : isNearLimit
                            ? '#f59e0b'
                            : colors.text,
                        },
                      ]}
                    >
                      {formatCurrency(category.spent)}
                    </Text>
                    <Text style={[styles.categoryBudgetAmt, { color: colors.textSecondary }]}>
                      / {formatCurrency(category.budget)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.categoryProgressBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: isOverBudget
                          ? '#ef4444'
                          : isNearLimit
                          ? '#f59e0b'
                          : category.color,
                      },
                    ]}
                  />
                </View>
                {isOverBudget && (
                  <Text style={styles.overBudgetText}>
                    ⚠️ {formatCurrency(category.spent - category.budget)} over budget
                  </Text>
                )}
              </View>
            );
          }
        )}

        {sortedCategories.length > INITIAL_ITEMS && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: colors.primary }]}>
              {isExpanded
                ? '▲ Show less'
                : `▼ Show ${sortedCategories.length - INITIAL_ITEMS} more`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer insight */}
      <View style={[styles.budgetFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          💡 Your budgets adjust based on your spending patterns. No pressure—just awareness.
        </Text>
      </View>
    </Card>
  );
};

// ============ MAIN SCREEN ============
export default function SpendingScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'spending' | 'budget'>('spending');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Spending & Budgets</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your spending patterns and budget goals
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Spending"
          icon="📈"
          isActive={activeTab === 'spending'}
          onPress={() => setActiveTab('spending')}
          colors={colors}
        />
        <TabButton
          title="Budget"
          icon="🎯"
          isActive={activeTab === 'budget'}
          onPress={() => setActiveTab('budget')}
          colors={colors}
        />
      </View>

      {/* Tab Content */}
      {activeTab === 'spending' ? (
        <>
          <SpendingInsights colors={colors} />
          <SpendingCalendar colors={colors} />
        </>
      ) : (
        <BudgetGoals colors={colors} />
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  pieChartColumn: {
    flex: 1,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  pieCenterAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pieCenterLabel: {
    fontSize: 10,
  },
  legendContainer: {
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    flex: 1,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  barChartColumn: {
    flex: 1,
  },
  barChartTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    marginBottom: 4,
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  topCategoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  topCategoryLabel: {
    fontSize: 10,
  },
  topCategoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  topCategoryRight: {
    alignItems: 'flex-end',
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  topCategoryPercent: {
    fontSize: 10,
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
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
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
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overallProgress: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  overallLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  overallAmount: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabelText: {
    fontSize: 11,
  },
  paceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  paceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paceTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  paceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paceAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paceRight: {
    alignItems: 'flex-end',
  },
  paceLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  paceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  paceDivider: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  categoryList: {
    marginTop: 8,
  },
  categoryBudgetItem: {
    marginBottom: 16,
  },
  categoryBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryBudgetName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySpent: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBudgetAmt: {
    fontSize: 12,
  },
  categoryProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overBudgetText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
  budgetFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});