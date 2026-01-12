import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  TabButton,
  SpendingInsights,
  SpendingCalendar,
  BudgetGoals,
} from '../components/spending';

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
  bottomPadding: {
    height: 40,
  },
});