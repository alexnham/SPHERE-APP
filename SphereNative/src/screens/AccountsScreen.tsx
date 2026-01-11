import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Switch,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import { accounts, liabilities } from '../lib/mockData';
import { Card } from '../components/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate net worth
const totalAssets = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
const totalLiabilities = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
const netWorth = totalAssets - totalLiabilities;

// Account type colors
const accountTypeColors: Record<string, string> = {
  checking: '#8b5cf6',
  savings: '#10b981',
  investment: '#f59e0b',
};

// Account type icons
const accountTypeIcons: Record<string, string> = {
  checking: '🏦',
  savings: '🐷',
  investment: '🚀',
};

// Group accounts by type
const accountsByType = accounts.reduce((acc, account) => {
  acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
  return acc;
}, {} as Record<string, number>);

// ============ NET WORTH CARD COMPONENT ============
const NetWorthCard = ({ colors }: { colors: any }) => {
  const assetsPercent = 100;
  const liabilitiesPercent = (totalLiabilities / totalAssets) * 100;

  return (
    <Card>
      {/* Net Worth Header */}
      <View style={styles.netWorthHeader}>
        <Text style={[styles.netWorthLabel, { color: colors.textSecondary }]}>
          Net Worth
        </Text>
        <Text style={[styles.netWorthAmount, { color: colors.text }]}>
          {formatCurrency(netWorth)}
        </Text>
      </View>

      {/* Assets vs Liabilities Bars */}
      <View style={styles.barsContainer}>
        {/* Assets Bar */}
        <View style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barIcon}>📈</Text>
            <View style={styles.barLabelContent}>
              <View style={styles.barLabelTop}>
                <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>
                  Assets
                </Text>
                <Text style={[styles.barAmount, { color: colors.text }]}>
                  {formatCurrency(totalAssets)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${assetsPercent}%`,
                      backgroundColor: '#10b981',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Liabilities Bar */}
        <View style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barIcon}>📉</Text>
            <View style={styles.barLabelContent}>
              <View style={styles.barLabelTop}>
                <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>
                  Debts
                </Text>
                <Text style={[styles.barAmount, { color: colors.text }]}>
                  {formatCurrency(totalLiabilities)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${liabilitiesPercent}%`,
                      backgroundColor: '#ef4444',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

// ============ ACCOUNT BREAKDOWN CARD COMPONENT ============
const AccountBreakdownCard = ({ colors }: { colors: any }) => {
  const barWidth = SCREEN_WIDTH - 80;

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Account Breakdown
      </Text>

      {/* Stacked Bar */}
      <View style={styles.stackedBarContainer}>
        <Svg width={barWidth} height={16}>
          {(() => {
            let currentX = 0;
            return Object.entries(accountsByType).map(([type, amount], index) => {
              const width = (amount / totalAssets) * barWidth;
              const x = currentX;
              currentX += width;

              return (
                <Rect
                  key={type}
                  x={x}
                  y={0}
                  width={width}
                  height={16}
                  rx={index === 0 ? 8 : 0}
                  ry={index === 0 ? 8 : 0}
                  fill={accountTypeColors[type] || colors.primary}
                />
              );
            });
          })()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {Object.entries(accountsByType).map(([type, amount]) => (
          <View key={type} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: accountTypeColors[type] || colors.primary },
                ]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
            <Text style={[styles.legendAmount, { color: colors.text }]}>
              {formatCurrency(amount)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

// ============ ACCOUNTS OVERVIEW COMPONENT ============
const AccountsOverview = ({ colors }: { colors: any }) => {
  return (
    <Card>
      {/* Header */}
      <View style={styles.overviewHeader}>
        <Text style={[styles.overviewTitle, { color: colors.text }]}>
          Net Worth
        </Text>
        <View style={styles.overviewActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={{ color: colors.primary }}>💸</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={{ color: colors.textSecondary }}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Net Worth Display */}
      <View style={styles.netWorthDisplay}>
        <Text style={[styles.netWorthBig, { color: colors.text }]}>
          {formatCurrency(netWorth)}
        </Text>
        <View style={styles.netWorthMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📈</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}
            >
              Assets:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}
            >
              {formatCurrency(totalAssets)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📉</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}
            >
              Debts:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatCurrency(totalLiabilities)}
            </Text>
          </View>
        </View>
      </View>

      {/* Accounts List */}
      <View style={styles.accountsSection}>
        <Text
          style={[styles.accountsSectionTitle, { color: colors.textSecondary }]}
        >
          YOUR ACCOUNTS
        </Text>
        {accounts.map((account) => (
          <View
            key={account.id}
            style={[
              styles.accountItem,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.accountLeft}>
              <View
                style={[
                  styles.accountIcon,
                  { backgroundColor: `${colors.border}80` },
                ]}
              >
                <Text style={styles.accountIconText}>
                  {accountTypeIcons[account.type] || '🏦'}
                </Text>
              </View>
              <View>
                <Text style={[styles.accountName, { color: colors.text }]}>
                  {account.name}
                </Text>
                <Text
                  style={[styles.accountInstitution, { color: colors.textSecondary }]}
                >
                  {account.institution}
                </Text>
              </View>
            </View>
            <View style={styles.accountRight}>
              <Text style={[styles.accountBalance, { color: colors.text }]}>
                {formatCurrency(account.currentBalance)}
              </Text>
              {account.type === 'checking' &&
                account.availableBalance !== account.currentBalance && (
                  <Text
                    style={[styles.accountAvailable, { color: colors.textSecondary }]}
                  >
                    {formatCurrency(account.availableBalance)} available
                  </Text>
                )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

// ============ SAVINGS VAULTS COMPONENT ============
const SavingsVaults = ({ colors }: { colors: any }) => {
  const [balance, setBalance] = useState(485);
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [smartRoundUp, setSmartRoundUp] = useState(true);
  const [roundUpMultiplier, setRoundUpMultiplier] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const handleQuickAdd = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <Card>
      {/* Header */}
      <View style={styles.vaultHeader}>
        <View style={styles.vaultHeaderLeft}>
          <View style={[styles.vaultIcon, { backgroundColor: `${colors.border}80` }]}>
            <Text>☂️</Text>
          </View>
          <Text style={[styles.vaultLabel, { color: colors.textSecondary }]}
          >
            Rainy Day Buffer
          </Text>
          <TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>ⓘ</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={{ color: colors.textSecondary }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <Text style={[styles.vaultBalance, { color: colors.text }]}>
        {formatCurrency(balance)}
      </Text>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddRow}>
        <Text style={[styles.quickAddLabel, { color: colors.textSecondary }]}
        >
          Quick add:
        </Text>
        {[5, 10, 20].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.quickAddButton, { backgroundColor: `${colors.primary}20` }]}
            onPress={() => handleQuickAdd(amount)}
          >
            <Text style={[styles.quickAddText, { color: colors.primary }]}>
              +${amount}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Round-up Status */}
      {roundUpEnabled && (
        <View style={[styles.roundUpStatus, { backgroundColor: colors.surface }]}>
          <View style={styles.roundUpLeft}>
            <View style={styles.roundUpDot} />
            <Text style={[styles.roundUpText, { color: colors.textSecondary }]}>
              Round-ups {smartRoundUp ? '(smart)' : ''} active
            </Text>
          </View>
          <View style={styles.roundUpRight}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.roundUpAmount}>+$12</Text>
          </View>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Round-Up Settings
              </Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={{ fontSize: 20, color: colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Enable Round-ups */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Enable Round-Ups
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Automatically round up purchases to save
                </Text>
              </View>
              <Switch
                value={roundUpEnabled}
                onValueChange={setRoundUpEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {roundUpEnabled && (
              <>
                {/* Smart Mode */}
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Smart Mode
                    </Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                      Only round up on stable spending days
                    </Text>
                  </View>
                  <Switch
                    value={smartRoundUp}
                    onValueChange={setSmartRoundUp}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {/* Multiplier */}
                <View style={styles.multiplierSection}>
                  <View style={styles.multiplierHeader}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Round-Up Multiplier
                    </Text>
                    <Text style={[styles.multiplierValue, { color: colors.primary }]}>
                      {roundUpMultiplier}x
                    </Text>
                  </View>
                  <View style={styles.multiplierButtons}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.multiplierButton,
                          {
                            backgroundColor:
                              roundUpMultiplier === val
                                ? colors.primary
                                : colors.surface,
                          },
                        ]}
                        onPress={() => setRoundUpMultiplier(val)}
                      >
                        <Text
                          style={{
                            color:
                              roundUpMultiplier === val ? '#fff' : colors.text,
                            fontWeight: '600',
                          }}
                        >
                          {val}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.multiplierLabels}>
                    <Text style={[styles.multiplierLabel, { color: colors.textSecondary }]}>
                      1x (normal)
                    </Text>
                    <Text style={[styles.multiplierLabel, { color: colors.textSecondary }]}>
                      5x (boost)
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Card>
  );
};

// ============ MAIN SCREEN ============
export default function AccountsScreen() {
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
          Accounts & Banks
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your linked accounts and savings vaults
        </Text>
      </View>

      {/* Net Worth Summary */}
      <NetWorthCard colors={colors} />

      {/* Account Breakdown */}
      <AccountBreakdownCard colors={colors} />

      {/* Accounts Overview */}
      <AccountsOverview colors={colors} />

      {/* Savings Vaults */}
      <SavingsVaults colors={colors} />

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
  netWorthHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  netWorthLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  barsContainer: {
    gap: 16,
  },
  barRow: {
    marginBottom: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  barLabelContent: {
    flex: 1,
  },
  barLabelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabelText: {
    fontSize: 14,
  },
  barAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  stackedBarContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  legendContainer: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  overviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  netWorthDisplay: {
    marginBottom: 24,
  },
  netWorthBig: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  netWorthMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountsSection: {
    gap: 12,
  },
  accountsSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIconText: {
    fontSize: 18,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountInstitution: {
    fontSize: 12,
    marginTop: 2,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountAvailable: {
    fontSize: 11,
    marginTop: 2,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vaultIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaultLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsButton: {
    padding: 8,
  },
  vaultBalance: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quickAddLabel: {
    fontSize: 12,
  },
  quickAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roundUpStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  roundUpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundUpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  roundUpText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roundUpRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sparkle: {
    fontSize: 12,
  },
  roundUpAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  multiplierSection: {
    paddingTop: 16,
  },
  multiplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  multiplierValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  multiplierButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  multiplierButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  multiplierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  multiplierLabel: {
    fontSize: 11,
  },
  bottomPadding: {
    height: 40,
  },
});