import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch, ActivityIndicator, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { Card } from '../Card';
import { InfoTooltip } from '../shared';
import { formatCurrency } from '../../lib/utils';
import { Umbrella, Settings, Sparkles, X, Plus } from 'lucide-react-native';
import { useVaults } from '../../hooks/useVaults';
import { updateVault, getProfile, updateProfile, createVault } from '../../lib/database';

interface SavingsVaultsProps {
  colors: any;
}

export const SavingsVaults = ({ colors }: SavingsVaultsProps) => {
  const { vaults, loading: vaultsLoading, refresh: refreshVaults } = useVaults();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Find Rainy Day vault (or first vault if Rainy Day doesn't exist)
  const rainyDayVault = useMemo(() => {
    return vaults.find(v => v.name.toLowerCase().includes('buffer')) || vaults[0];
  }, [vaults]);

  // Create Rainy Day vault if it doesn't exist
  useEffect(() => {
    const ensureRainyDayVault = async () => {
      if (!vaultsLoading && vaults.length === 0) {
        try {
          await createVault({
            name: 'buffer',
            icon: '☔',
            balance: 0,
            color: 'from-blue-400 to-blue-500',
            description: 'For unexpected moments',
          });
          await refreshVaults();
        } catch (error) {
          console.error('Error creating Rainy Day vault:', error);
        }
      }
    };
    ensureRainyDayVault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultsLoading, vaults.length]);

  // Fetch profile for round-up settings
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const roundUpEnabled = profile?.round_up_enabled ?? true;
  const smartRoundUp = profile?.smart_round_up ?? true;
  const roundUpMultiplier = profile?.round_up_multiplier ?? 1;

  const handleQuickAdd = async (amount: number) => {
    if (!rainyDayVault) return;
    
    try {
      setUpdating(true);
      const newBalance = (rainyDayVault.balance || 0) + amount;
      await updateVault({
        id: rainyDayVault.id,
        balance: newBalance,
      });
      await refreshVaults();
    } catch (error) {
      console.error('Error updating vault:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCustomAdd = async () => {
    if (!rainyDayVault || !customValue) return;
    
    const amount = parseFloat(customValue);
    if (isNaN(amount) || amount <= 0) return;
    
    try {
      setUpdating(true);
      const newBalance = (rainyDayVault.balance || 0) + amount;
      await updateVault({
        id: rainyDayVault.id,
        balance: newBalance,
      });
      await refreshVaults();
      setCustomValue('');
      setShowCustomInput(false);
    } catch (error) {
      console.error('Error updating vault:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetCustomValue = async () => {
    if (!rainyDayVault || !customValue) return;
    
    const amount = parseFloat(customValue);
    if (isNaN(amount) || amount < 0) return;
    
    try {
      setUpdating(true);
      await updateVault({
        id: rainyDayVault.id,
        balance: amount,
      });
      await refreshVaults();
      setCustomValue('');
      setShowCustomInput(false);
    } catch (error) {
      console.error('Error updating vault:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateRoundUp = async (field: string, value: boolean | number) => {
    try {
      const updatedProfile = { ...profile, [field]: value };
      setProfile(updatedProfile);
      await updateProfile({ [field]: value });
    } catch (error) {
      console.error('Error updating round-up settings:', error);
      // Revert on error
      setProfile(profile);
    }
  };

  const balance = rainyDayVault?.balance || 0;
  const isLoading = vaultsLoading || loadingProfile;

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading vault...
          </Text>
        </View>
      </Card>
    );
  }

  // Show message if no vault exists
  if (!rainyDayVault) {
    return (
      <Card>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No savings vault found. A Rainy Day vault will be created automatically.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <View style={styles.vaultHeader}>
        <View style={styles.vaultHeaderLeft}>
          <View style={[styles.vaultIcon, { backgroundColor: `${colors.border}80` }]}>
            <Umbrella size={18} color={colors.textSecondary} strokeWidth={2} />
          </View>
          <Text style={[styles.vaultLabel, { color: colors.textSecondary }]}>
            {"Rainy Day Buffer"}
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
            style={[
              styles.quickAddButton, 
              { 
                backgroundColor: `${colors.primary}20`,
                opacity: updating ? 0.5 : 1,
              }
            ]}
            onPress={() => handleQuickAdd(amount)}
            disabled={updating}
          >
            <Text style={[styles.quickAddText, { color: colors.primary }]}>
              +${amount}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.customAddButton,
            { 
              backgroundColor: `${colors.primary}20`,
              opacity: updating ? 0.5 : 1,
            }
          ]}
          onPress={() => setShowCustomInput(!showCustomInput)}
          disabled={updating}
        >
          <Plus size={14} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Custom Value Input */}
      {showCustomInput && (
        <View style={[styles.customInputContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.customInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            value={customValue}
            onChangeText={setCustomValue}
            keyboardType="decimal-pad"
            editable={!updating}
          />
          <View style={styles.customInputButtons}>
            <TouchableOpacity
              style={[styles.customInputButton, { backgroundColor: `${colors.primary}20` }]}
              onPress={handleCustomAdd}
              disabled={updating || !customValue}
            >
              <Text style={[styles.customInputButtonText, { color: colors.primary }]}>
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customInputButton, { backgroundColor: `${colors.border}40` }]}
              onPress={handleSetCustomValue}
              disabled={updating || !customValue}
            >
              <Text style={[styles.customInputButtonText, { color: colors.text }]}>
                Set
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            <Text style={[styles.roundUpAmount, { color: '#10b981' }]}>
              {roundUpMultiplier}x
            </Text>
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
                onValueChange={(value) => handleUpdateRoundUp('round_up_enabled', value)}
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
                onValueChange={(value) => handleUpdateRoundUp('smart_round_up', value)}
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
                onValueChange={(value) => handleUpdateRoundUp('round_up_multiplier', value)}
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
  customAddButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  customInputButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  customInputButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});