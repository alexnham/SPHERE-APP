import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { budgetData } from './constants';
import { 
  Target, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb,
  ShoppingCart,
  ShoppingBag,
  Coffee,
  Car,
  Utensils,
  Fuel,
  Pill,
  Laptop,
  ChevronUp,
  ChevronDown,
  type LucideIcon
} from 'lucide-react-native';

// Category icon map
const categoryIconMap: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  'coffee': Coffee,
  'car': Car,
  'utensils': Utensils,
  'fuel': Fuel,
  'pill': Pill,
  'laptop': Laptop,
};

interface BudgetGoalsProps {
  colors: any;
}

export const BudgetGoals = ({ colors }: BudgetGoalsProps) => {
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
            <Target size={20} color={colors.primary} strokeWidth={2} />
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
          {isOnTrack ? (
            <Check size={12} color="#10b981" strokeWidth={3} style={{ marginRight: 4 }} />
          ) : (
            <AlertTriangle size={12} color="#f59e0b" strokeWidth={2} style={{ marginRight: 4 }} />
          )}
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
              { width: `${overallProgress}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabelText, { color: colors.textSecondary }]}>
            {overallProgress.toFixed(0)}% used
          </Text>
          <View style={styles.expectedRow}>
            <TrendingUp size={11} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.progressLabelText, { color: colors.textSecondary, marginLeft: 4 }]}>
              {expectedProgress.toFixed(0)}% expected
            </Text>
          </View>
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
            {isUnder ? (
              <TrendingDown size={12} color="#10b981" strokeWidth={2} style={{ marginRight: 4 }} />
            ) : (
              <TrendingUp size={12} color={isWarning ? '#f59e0b' : '#ef4444'} strokeWidth={2} style={{ marginRight: 4 }} />
            )}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isUnder ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444',
              }}
            >
              {isUnder ? 'Under budget' : isWarning ? 'Slightly over' : 'Over budget'}
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
        <View
          style={[
            styles.paceDivider,
            {
              borderColor: isUnder
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(245, 158, 11, 0.2)',
            },
          ]}
        >
          <View style={styles.paceDividerContent}>
            {isUnder ? (
              <Check size={11} color="#10b981" strokeWidth={3} style={{ marginRight: 4 }} />
            ) : (
              <AlertTriangle size={11} color={isWarning ? '#f59e0b' : '#ef4444'} strokeWidth={2} style={{ marginRight: 4 }} />
            )}
            <Text
              style={{
                fontSize: 11,
                color: isUnder ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444',
                flex: 1,
              }}
            >
              {isUnder
                ? `You're ${formatCurrency(Math.abs(difference))} under your projected spending`
                : `You're ${formatCurrency(difference)} (${percentDiff.toFixed(0)}%) over your projected spending`}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Budgets */}
      <View style={styles.categoryList}>
        {(isExpanded ? sortedCategories : sortedCategories.slice(0, INITIAL_ITEMS)).map(
          (category, index) => {
            const progress = Math.min(100, (category.spent / category.budget) * 100);
            const isOverBudget = category.spent > category.budget;
            const isNearLimit = progress >= 80 && !isOverBudget;
            const IconComponent = categoryIconMap[category.icon];

            return (
              <View key={index} style={styles.categoryBudgetItem}>
                <View style={styles.categoryBudgetHeader}>
                  <View style={styles.categoryNameRow}>
                    {IconComponent && (
                      <IconComponent size={16} color={category.color} strokeWidth={2} style={{ marginRight: 8 }} />
                    )}
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
                  <View style={styles.overBudgetRow}>
                    <AlertTriangle size={11} color="#ef4444" strokeWidth={2} />
                    <Text style={styles.overBudgetText}>
                      {formatCurrency(category.spent - category.budget)} over budget
                    </Text>
                  </View>
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
            <View style={styles.expandButtonContent}>
              {isExpanded ? (
                <ChevronUp size={14} color={colors.primary} strokeWidth={2} />
              ) : (
                <ChevronDown size={14} color={colors.primary} strokeWidth={2} />
              )}
              <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                {isExpanded
                  ? 'Show less'
                  : `Show ${sortedCategories.length - INITIAL_ITEMS} more`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer insight */}
      <View style={[styles.budgetFooter, { borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <Lightbulb size={14} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Your budgets adjust based on your spending patterns. No pressure—just awareness.
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  expectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paceDividerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  overBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  overBudgetText: {
    fontSize: 11,
    color: '#ef4444',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  budgetFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
});