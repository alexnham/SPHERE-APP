import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';

// Mock user data
const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@gmail.com',
  phone: '+1 (555) 123-4567',
  memberSince: 'January 2024',
};

const mockConnectedBanks = [
  { name: 'Chase Bank', accounts: 3, lastSync: '2 hours ago' },
  { name: 'Bank of America', accounts: 2, lastSync: '1 day ago' },
];

interface SettingItemProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  colors: any;
}

const SettingItem = ({ icon, label, description, onPress, colors }: SettingItemProps) => (
  <TouchableOpacity
    style={[styles.settingItem, { backgroundColor: colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
      <Text style={styles.settingIconText}>{icon}</Text>
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
    <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {mockUser.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {mockUser.email}
              </Text>
              <Text style={[styles.profileMember, { color: colors.textSecondary }]}>
                Member since {mockUser.memberSince}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Connected Banks */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Connected Banks
          </Text>
          {mockConnectedBanks.map((bank, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.bankItem, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.bankIcon, { backgroundColor: colors.muted }]}>
                <Text>🏦</Text>
              </View>
              <View style={styles.bankInfo}>
                <Text style={[styles.bankName, { color: colors.text }]}>
                  {bank.name}
                </Text>
                <Text style={[styles.bankMeta, { color: colors.textSecondary }]}>
                  {bank.accounts} accounts • Synced {bank.lastSync}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Quick Settings */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Quick Settings
          </Text>

          {/* Dark Mode Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                <Text style={styles.settingIconText}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Push Notifications Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                <Text style={styles.settingIconText}>🔔</Text>
              </View>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  Receive alerts and reminders
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Biometric Auth Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                <Text style={styles.settingIconText}>🔐</Text>
              </View>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Biometric Login
                </Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  Use Face ID or fingerprint
                </Text>
              </View>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Account Settings */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account
          </Text>
          <SettingItem
            icon="👤"
            label="Personal Information"
            description="Name, email, phone number"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="🛡️"
            label="Security"
            description="Password, 2FA, login history"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="📱"
            label="Devices"
            description="Manage connected devices"
            onPress={() => {}}
            colors={colors}
          />
        </Card>

        {/* Preferences */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Preferences
          </Text>
          <SettingItem
            icon="💳"
            label="Payment Methods"
            description="Manage your payment options"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="🔗"
            label="Add New Account"
            description="Connect another bank or card"
            onPress={() => {}}
            colors={colors}
          />
        </Card>

        {/* Support */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>
          <SettingItem
            icon="❓"
            label="Help Center"
            description="FAQs and support articles"
            onPress={() => {}}
            colors={colors}
          />
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.destructiveMuted }]}
        >
          <Text style={[styles.logoutText, { color: colors.destructive }]}>
            Log Out
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  profileMember: {
    fontSize: 11,
    marginTop: 4,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
  },
  bankMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: 11,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});