import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import { investmentAccounts } from '../lib/mockData';
import { Card } from '../components/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate portfolio totals
const portfolioValue = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
const totalContributions = investmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
const totalGain = portfolioValue - totalContributions;
const gainPercent = ((totalGain / totalContributions) * 100);
const isPositive = totalGain >= 0;

// Generate 12-month performance data
const generatePerformanceData = () => {
  const data: number[] = [];
  let value = totalContributions;
  for (let i = 12; i >= 0; i--) {
    const monthlyChange = (Math.random() * 0.06 - 0.02) + 0.015;
    value = value * (1 + monthlyChange);
    data.push(Math.round(value));
  }
  data[data.length - 1] = Math.round(portfolioValue);
  return data;
};

const performanceData = generatePerformanceData();
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Now'];

// Asset allocation data
const allocations = [
  { name: 'US Stocks', value: 55, color: '#10b981' },
  { name: 'International', value: 20, color: '#14b8a6' },
  { name: 'Bonds', value: 15, color: '#6b7280' },
  { name: 'Real Estate', value: 10, color: '#f59e0b' },
];

// Projection calculation
const calculateProjection = (years: number, monthlyContribution: number = 500) => {
  const annualReturn = 0.07;
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  
  let futureValue = portfolioValue;
  for (let i = 0; i < months; i++) {
    futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
  }
  return futureValue;
};

const fiveYearProjection = calculateProjection(5);
const tenYearProjection = calculateProjection(10);

// ============ AREA CHART COMPONENT ============
const PerformanceChart = ({ colors }: { colors: any }) => {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 160;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const minValue = Math.min(...performanceData) * 0.95;
  const maxValue = Math.max(...performanceData) * 1.05;
  const valueRange = maxValue - minValue;

  // Generate path points
  const points = performanceData.map((value, index) => {
    const x = (index / (performanceData.length - 1)) * chartWidth;
    const y = paddingTop + graphHeight - ((value - minValue) / valueRange) * graphHeight;
    return { x, y };
  });

  // Create line path
  const linePath = points
    .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(' ');

  // Create area path
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight - paddingBottom} L 0 ${chartHeight - paddingBottom} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <Line
            key={i}
            x1={0}
            y1={paddingTop + (graphHeight / 3) * i}
            x2={chartWidth}
            y2={paddingTop + (graphHeight / 3) * i}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
            opacity={0.5}
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {['Jan', 'Apr', 'Jul', 'Oct', 'Now'].map((label, index) => (
          <Text
            key={index}
            style={[styles.xAxisLabel, { color: colors.textSecondary }]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============ ALLOCATION BAR COMPONENT ============
const AllocationBar = ({ colors }: { colors: any }) => {
  const barWidth = SCREEN_WIDTH - 64;

  return (
    <View style={styles.allocationSection}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        Asset Allocation
      </Text>

      {/* Stacked bar */}
      <View style={styles.allocationBarContainer}>
        <Svg width={barWidth} height={12}>
          {(() => {
            let currentX = 0;
            return allocations.map((allocation, index) => {
              const width = (allocation.value / 100) * barWidth;
              const x = currentX;
              currentX += width;

              return (
                <Rect
                  key={allocation.name}
                  x={x}
                  y={0}
                  width={width}
                  height={12}
                  rx={index === 0 ? 6 : 0}
                  ry={index === 0 ? 6 : 0}
                  fill={allocation.color}
                />
              );
            });
          })()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.allocationLegend}>
        {allocations.map((allocation) => (
          <View key={allocation.name} style={styles.allocationLegendItem}>
            <View
              style={[styles.allocationDot, { backgroundColor: allocation.color }]}
            />
            <Text style={[styles.allocationName, { color: colors.textSecondary }]}>
              {allocation.name}
            </Text>
            <Text style={[styles.allocationPercent, { color: colors.text }]}>
              {allocation.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============ INVESTMENT ACCOUNT ITEM COMPONENT ============
const InvestmentAccountItem = ({
  account,
  colors,
}: {
  account: typeof investmentAccounts[0];
  colors: any;
}) => {
  const isAccountPositive = account.gain >= 0;

  return (
    <View
      style={[
        styles.accountItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.accountHeader}>
        <View style={styles.accountNameRow}>
          <View
            style={[styles.accountDot, { backgroundColor: account.color }]}
          />
          <Text style={[styles.accountName, { color: colors.text }]}>
            {account.name}
          </Text>
        </View>
        <Text style={[styles.accountInstitution, { color: colors.textSecondary }]}>
          {account.institution}
        </Text>
      </View>
      <View style={styles.accountFooter}>
        <View>
          <Text style={[styles.accountBalance, { color: colors.text }]}>
            {formatCurrency(account.balance)}
          </Text>
          <Text style={[styles.accountContributed, { color: colors.textSecondary }]}>
            Contributed: {formatCurrency(account.contributions)}
          </Text>
        </View>
        <View style={styles.accountGainSection}>
          <View style={styles.accountGainRow}>
            <Text style={{ marginRight: 4 }}>
              {isAccountPositive ? '📈' : '📉'}
            </Text>
            <Text
              style={[
                styles.accountGain,
                { color: isAccountPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isAccountPositive ? '+' : ''}
              {formatCurrency(account.gain)}
            </Text>
          </View>
          <Text
            style={[
              styles.accountGainPercent,
              { color: isAccountPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isAccountPositive ? '+' : ''}
            {account.gainPercent.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============ MAIN INVESTMENT PORTFOLIO COMPONENT ============
const InvestmentPortfolio = ({ colors }: { colors: any }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      {/* Header */}
      <View style={styles.portfolioHeader}>
        <View>
          <Text style={[styles.portfolioTitle, { color: colors.text }]}>
            Investment Portfolio
          </Text>
          <Text style={[styles.portfolioSubtitle, { color: colors.textSecondary }]}>
            Long-term growth focus
          </Text>
        </View>
        <View style={styles.lowDopamineTag}>
          <Text style={{ marginRight: 4 }}>🔒</Text>
          <Text style={[styles.lowDopamineText, { color: colors.textSecondary }]}>
            Low-dopamine view
          </Text>
        </View>
      </View>

      {/* Main Stats - Clickable */}
      <TouchableOpacity
        style={styles.mainStats}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        {/* Total Value */}
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Value
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(portfolioValue)}
          </Text>
          <View style={styles.expandIcon}>
            <Text style={{ color: colors.textSecondary }}>
              {expanded ? '▲' : '▼'}
            </Text>
          </View>
        </View>

        {/* Total Return */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: isPositive
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Return
          </Text>
          <View style={styles.returnRow}>
            <Text
              style={[
                styles.statValue,
                { color: isPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(totalGain)}
            </Text>
            <Text style={{ marginLeft: 8 }}>{isPositive ? '📈' : '📉'}</Text>
          </View>
          <Text
            style={[
              styles.returnPercent,
              { color: isPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isPositive ? '+' : ''}
            {gainPercent.toFixed(1)}% all time
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Account Details */}
      {expanded && (
        <View style={styles.expandedSection}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.expandedTitle, { color: colors.textSecondary }]}>
            Individual Accounts
          </Text>
          {investmentAccounts.map((account) => (
            <InvestmentAccountItem
              key={account.id}
              account={account}
              colors={colors}
            />
          ))}
        </View>
      )}

      {/* Performance Chart */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          12-Month Performance
        </Text>
        <PerformanceChart colors={colors} />
      </View>

      {/* Asset Allocation */}
      <AllocationBar colors={colors} />

      {/* Long-term Projections */}
      <View
        style={[
          styles.projectionsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.projectionsHeader}>
          <Text style={{ marginRight: 8 }}>ℹ️</Text>
          <Text style={[styles.projectionsTitle, { color: colors.text }]}>
            If you keep contributing $500/mo
          </Text>
        </View>
        <View style={styles.projectionsGrid}>
          <View style={styles.projectionItem}>
            <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
              5-year projection
            </Text>
            <Text style={[styles.projectionValue, { color: colors.text }]}>
              {formatCurrency(fiveYearProjection)}
            </Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
              10-year projection
            </Text>
            <Text style={[styles.projectionValue, { color: colors.text }]}>
              {formatCurrency(tenYearProjection)}
            </Text>
          </View>
        </View>
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          *Assumes 7% annual return. Past performance doesn't guarantee future results.
        </Text>
      </View>

      {/* Low-dopamine footer */}
      <View style={styles.footerMessage}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Investing is a marathon, not a sprint • Check back monthly, not daily
        </Text>
      </View>
    </Card>
  );
};

// ============ SIMPLE VIEW COMPONENT ============
const SimpleView = ({ colors }: { colors: any }) => {
  return (
    <>
      {/* Portfolio Value Card */}
      <Card>
        <View style={styles.simpleHeader}>
          <Text style={[styles.simpleLabel, { color: colors.textSecondary }]}>
            Portfolio Value
          </Text>
          <Text style={[styles.simpleValue, { color: colors.text }]}>
            {formatCurrency(portfolioValue)}
          </Text>
          <View style={styles.simpleGainRow}>
            <Text style={{ marginRight: 4 }}>📈</Text>
            <Text style={styles.simpleGain}>
              +{formatCurrency(totalGain)} ({gainPercent.toFixed(1)}%)
            </Text>
          </View>
        </View>

        {/* Mini Area Chart */}
        <View style={styles.miniChartContainer}>
          <PerformanceChart colors={colors} />
          <Text style={[styles.chartPeriod, { color: colors.textSecondary }]}>
            Last 12 months
          </Text>
        </View>
      </Card>

      {/* Portfolio Breakdown */}
      <Card>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Your Portfolios
        </Text>
        {investmentAccounts.map((account, index) => {
          const percent = (account.balance / portfolioValue) * 100;
          return (
            <View key={account.id} style={styles.simpleAccountItem}>
              <View style={styles.simpleAccountHeader}>
                <Text style={[styles.simpleAccountName, { color: colors.text }]}>
                  {account.name}
                </Text>
                <Text style={[styles.simpleAccountBalance, { color: colors.text }]}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>
              <View
                style={[styles.simpleProgressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.simpleProgressFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: '#10b981',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </Card>
    </>
  );
};

// ============ MAIN SCREEN ============
export default function InvestmentsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Investments</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your portfolio performance
        </Text>
      </View>

      {/* Investment Portfolio */}
      <InvestmentPortfolio colors={colors} />

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
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  portfolioSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  lowDopamineTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowDopamineText: {
    fontSize: 11,
  },
  mainStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  expandIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  returnPercent: {
    fontSize: 13,
    marginTop: 4,
  },
  expandedSection: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  accountItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountInstitution: {
    fontSize: 11,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountContributed: {
    fontSize: 11,
    marginTop: 4,
  },
  accountGainSection: {
    alignItems: 'flex-end',
  },
  accountGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountGain: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountGainPercent: {
    fontSize: 11,
    marginTop: 2,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 11,
  },
  allocationSection: {
    marginBottom: 24,
  },
  allocationBarContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  allocationLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allocationLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 4,
  },
  allocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  allocationName: {
    fontSize: 12,
    flex: 1,
  },
  allocationPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectionsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  projectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectionsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  projectionItem: {
    flex: 1,
  },
  projectionLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  footerMessage: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Simple View Styles
  simpleHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  simpleLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  simpleValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  simpleGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  simpleGain: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  miniChartContainer: {
    alignItems: 'center',
  },
  chartPeriod: {
    fontSize: 11,
    marginTop: 8,
  },
  simpleAccountItem: {
    marginBottom: 16,
  },
  simpleAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  simpleAccountName: {
    fontSize: 14,
  },
  simpleAccountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  simpleProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  simpleProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomPadding: {
    height: 40,
  },
});