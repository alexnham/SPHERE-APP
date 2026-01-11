import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import { liabilities } from '../lib/mockData';
import { Card}  from '../components/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Debt type colors
const debtTypeColors: Record<string, string> = {
  credit_card: '#ec4899',
  student_loan: '#8b5cf6',
  auto_loan: '#3b82f6',
  mortgage: '#10b981',
  personal_loan: '#f59e0b',
  bnpl: '#06b6d4',
  loan: '#3b82f6',
};

// Debt type labels
const debtTypeLabels: Record<string, string> = {
  credit_card: 'Credit Card',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  mortgage: 'Mortgage',
  personal_loan: 'Personal Loan',
  bnpl: 'Buy Now Pay Later',
  loan: 'Loan',
};

// Debt type icons
const debtTypeIcons: Record<string, string> = {
  credit_card: '💳',
  student_loan: '🎓',
  auto_loan: '🚗',
  mortgage: '🏠',
  personal_loan: '💰',
  bnpl: '🛒',
  loan: '📄',
};

// Calculate totals
const totalDebt = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
const totalLimit = liabilities.reduce(
  (sum, l) => sum + (l.creditLimit || l.currentBalance * 1.5),
  0
);
const utilizationPercent = Math.min(100, (totalDebt / totalLimit) * 100);

// Group debts by type
const debtByType = liabilities.reduce((acc, debt) => {
  acc[debt.type] = (acc[debt.type] || 0) + debt.currentBalance;
  return acc;
}, {} as Record<string, number>);

// Safe to spend calculation (mock)
const safeToSpend = 1247;

// Sort options
type SortOption = 'due_date' | 'amount' | 'apr';
const sortLabels: Record<SortOption, string> = {
  due_date: 'Due Date',
  amount: 'Amount',
  apr: 'Interest Rate',
};

// ============ SEMI-CIRCLE GAUGE COMPONENT ============
const SemiCircleGauge = ({
  percent,
  colors,
}: {
  percent: number;
  colors: any;
}) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2 + 10;

  // Arc path for semi-circle (180 degrees)
  const createArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Background arc (full semi-circle: 180 to 360)
  const bgPath = createArc(180, 360);

  // Progress arc
  const progressAngle = 180 + (percent / 100) * 180;
  const progressPath = createArc(180, progressAngle);

  // Get color based on utilization
  const getGaugeColor = () => {
    if (percent >= 80) return '#ef4444';
    if (percent >= 50) return '#f59e0b';
    return colors.primary;
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size / 2 + 30}>
        {/* Background arc */}
        <Path
          d={bgPath}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <Path
          d={progressPath}
          fill="none"
          stroke={getGaugeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugePercent, { color: colors.textSecondary }]}>
          {percent.toFixed(0)}% utilized
        </Text>
      </View>
    </View>
  );
};

// ============ DEBT TYPE BREAKDOWN COMPONENT ============
const DebtTypeBreakdown = ({ colors }: { colors: any }) => {
  const sortedTypes = Object.entries(debtByType).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        By Category
      </Text>
      <View style={styles.breakdownList}>
        {sortedTypes.map(([type, amount], index) => {
          const percent = (amount / totalDebt) * 100;
          return (
            <View key={type} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownIcon}>
                    {debtTypeIcons[type] || '💳'}
                  </Text>
                  <Text
                    style={[styles.breakdownName, { color: colors.text }]
                    }
                  >
                    {debtTypeLabels[type] || type.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: colors.text }]}
                >
                  {formatCurrency(amount)}
                </Text>
              </View>
              <View
                style={[styles.breakdownBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: debtTypeColors[type] || colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

// ============ DEBT ITEM COMPONENT ============
const DebtItem = ({
  debt,
  colors,
  onPress,
}: {
  debt: typeof liabilities[0];
  colors: any;
  onPress: () => void;
}) => {
  // Calculate days until due
  const daysUntilDue = debt.dueDate
    ? Math.ceil(
        (new Date(debt.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Credit utilization for credit cards
  const utilizationPercent =
    debt.type === 'credit_card' && debt.creditLimit
      ? (debt.currentBalance / debt.creditLimit) * 100
      : null;

  // Urgency state
  const getUrgencyState = () => {
    if (daysUntilDue !== null && daysUntilDue < 0)
      return { label: 'Overdue', color: '#ef4444' };
    if (daysUntilDue !== null && daysUntilDue <= 3)
      return { label: `${daysUntilDue} days`, color: '#ef4444' };
    if (daysUntilDue !== null && daysUntilDue <= 7)
      return { label: `${daysUntilDue} days`, color: '#f59e0b' };
    if (daysUntilDue !== null)
      return { label: `${daysUntilDue} days`, color: colors.textSecondary };
    return { label: 'No due date', color: colors.textSecondary };
  };

  const urgency = getUrgencyState();
  const displayAmount = debt.minimumPayment || debt.currentBalance;

  return (
    <TouchableOpacity
      style={[
        styles.debtItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.debtItemContent}>
        {/* Icon */}
        <View
          style={[styles.debtIcon, { backgroundColor: `${colors.border}80` }]}
        >
          <Text style={styles.debtIconText}>
            {debtTypeIcons[debt.type] || '💳'}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.debtInfo}>
          <View style={styles.debtNameRow}>
            <Text style={[styles.debtLender, { color: colors.text }]}>
              {debt.name}
            </Text>
            <Text style={[styles.debtType, { color: colors.textSecondary }]}>
              • {debtTypeLabels[debt.type] || debt.type}
            </Text>
          </View>
          <View style={styles.debtMetaRow}>
            {debt.dueDate && (
              <Text style={[styles.debtMeta, { color: colors.textSecondary }]}>
                Due{' '}
                {new Date(debt.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • <Text style={{ color: urgency.color }}>{urgency.label}</Text>
              </Text>
            )}
            {utilizationPercent !== null && (
              <Text
                style={[
                  styles.debtUtilization,
                  {
                    color: utilizationPercent > 30 ? '#f59e0b' : '#10b981',
                  },
                ]}
              >
                • {utilizationPercent.toFixed(0)}% used
              </Text>
            )}
          </View>
        </View>

        {/* Amount + chevron */}
        <View style={styles.debtAmountSection}>
          <Text style={[styles.debtAmount, { color: colors.text }]}>
            {formatCurrency(displayAmount)}
          </Text>
          {debt.minimumPayment && (
            <Text style={[styles.debtMinLabel, { color: colors.textSecondary }]}>
              min due
            </Text>
          )}
        </View>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============ DEBT DASHBOARD COMPONENT ============
const DebtDashboard = ({ colors }: { colors: any }) => {
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sort liabilities
  const sortedLiabilities = [...liabilities].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'amount':
        return b.currentBalance - a.currentBalance;
      case 'apr':
        return (b.apr || 0) - (a.apr || 0);
      default:
        return 0;
    }
  });

  return (
    <Card>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>
            Lenders & Debts
          </Text>
          <Text style={[styles.dashboardSubtitle, { color: colors.textSecondary }]}>
            Total owed: {formatCurrency(totalDebt)}
          </Text>
        </View>
        <View style={styles.safeToPaySection}>
          <Text style={[styles.safeToPayLabel, { color: colors.textSecondary }]}>
            Safe to pay today
          </Text>
          <Text style={styles.safeToPayAmount}>{formatCurrency(safeToSpend)}</Text>
        </View>
      </View>

      {/* Sort Control */}
      <View style={styles.sortSection}>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Text style={[styles.sortIcon, { color: colors.textSecondary }]}>
            ↕️
          </Text>
          <Text style={[styles.sortText, { color: colors.textSecondary }]}>
            {sortLabels[sortBy]}
          </Text>
          <Text style={[styles.sortChevron, { color: colors.textSecondary }]}>
            ▼
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(Object.keys(sortLabels) as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortMenuItem,
                sortBy === option && { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortMenuText,
                  { color: sortBy === option ? colors.primary : colors.text },
                ]}
              >
                {option === 'due_date' && 'Due Date (soonest first)'}
                {option === 'amount' && 'Amount (highest first)'}
                {option === 'apr' && 'Interest Rate (highest first)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Debt List */}
      <View style={styles.debtList}>
        {sortedLiabilities.map((debt) => (
          <DebtItem
            key={debt.id}
            debt={debt}
            colors={colors}
            onPress={() => {
              console.log('Navigate to debt:', debt.id);
            }}
          />
        ))}
      </View>
    </Card>
  );
};

// ============ MAIN SCREEN ============
export default function DebtsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Lenders & Debts
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your liabilities and payment schedules
        </Text>
      </View>

      {/* Total Debt with Semi-circle Gauge */}
      <Card>
        <View style={styles.totalDebtCard}>
          <SemiCircleGauge percent={utilizationPercent} colors={colors} />
          <Text style={[styles.totalDebtAmount, { color: colors.text }]}
          >
            {formatCurrency(totalDebt)}
          </Text>
          <Text style={[styles.totalDebtLabel, { color: colors.textSecondary }]}>
            Total Debt
          </Text>
        </View>
      </Card>

      {/* Debt Breakdown by Type */}
      <DebtTypeBreakdown colors={colors} />

      {/* Debt Dashboard */}
      <DebtDashboard colors={colors} />

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
    marginBottom: 20,
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
  totalDebtCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gaugeContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  gaugeCenter: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  gaugePercent: {
    fontSize: 12,
  },
  totalDebtAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: -10,
  },
  totalDebtLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownList: {
    gap: 16,
  },
  breakdownItem: {
    marginBottom: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dashboardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  safeToPaySection: {
    alignItems: 'flex-end',
  },
  safeToPayLabel: {
    fontSize: 11,
  },
  safeToPayAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
  },
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sortIcon: {
    fontSize: 12,
  },
  sortText: {
    fontSize: 12,
  },
  sortChevron: {
    fontSize: 10,
  },
  sortMenu: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortMenuText: {
    fontSize: 14,
  },
  debtList: {
    gap: 12,
  },
  debtItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  debtItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  debtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debtIconText: {
    fontSize: 18,
  },
  debtInfo: {
    flex: 1,
    marginRight: 12,
  },
  debtNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  debtLender: {
    fontSize: 14,
    fontWeight: '600',
  },
  debtType: {
    fontSize: 11,
    marginLeft: 4,
  },
  debtMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  debtMeta: {
    fontSize: 11,
  },
  debtUtilization: {
    fontSize: 11,
    marginLeft: 4,
  },
  debtAmountSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  debtMinLabel: {
    fontSize: 10,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  bottomPadding: {
    height: 40,
  },
});