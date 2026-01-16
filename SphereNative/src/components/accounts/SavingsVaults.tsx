import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { Card } from '../Card';
import { InfoTooltip } from '../shared';
import { formatCurrency } from '../../lib/utils';
import { Umbrella, Settings, Sparkles, X } from 'lucide-react-native';

interface SavingsVaultsProps {
  colors: any;
}

export const SavingsVaults = ({ colors }: SavingsVaultsProps) => {
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
            <Umbrella size={18} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <Text style={[styles.vaultLabel, { color: colors.textSecondary }]}>
            Rainy Day Buffer
          </Text>
          <InfoTooltip
            title="Rainy Day Buffer"
            content="Your emergency cushion for unexpected expenses. This buffer protects your budget when life throws surprises your way."
          />
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Settings size={18} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <Text style={[styles.vaultBalance, { color: colors.text }]}>
        {formatCurrency(balance)}
      </Text>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddRow}>
        <Text style={[styles.quickAddLabel, { color: colors.textSecondary }]}>
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
            <Sparkles size={14} color="#f59e0b" strokeWidth={2} style={{ marginRight: 4 }} />
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
                Round-up Settings
              </Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={22} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Enable Round-ups */}
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable Round-ups
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Round up purchases to save automatically
                </Text>
              </View>
              <Switch
                value={roundUpEnabled}
                onValueChange={setRoundUpEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Smart Round-ups */}
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Smart Round-ups
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Only round up when you have the buffer
                </Text>
              </View>
              <Switch
                value={smartRoundUp}
                onValueChange={setSmartRoundUp}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={!roundUpEnabled}
              />
            </View>

            {/* Multiplier */}
            <View style={styles.multiplierSection}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Round-up Multiplier: {roundUpMultiplier}x
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={roundUpMultiplier}
                onValueChange={setRoundUpMultiplier}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                disabled={!roundUpEnabled}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>1x</Text>
                <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>5x</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
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
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaultLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsButton: {
    padding: 8,
  },
  vaultBalance: {
    fontSize: 36,
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
    borderRadius: 20,
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
    borderRadius: 10,
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
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
  },
  multiplierSection: {
    paddingTop: 16,
  },
  slider: {
    marginTop: 12,
    marginBottom: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 11,
  },
});