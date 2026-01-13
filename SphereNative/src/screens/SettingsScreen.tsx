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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
          <TouchableOpacity
            style={[styles.addBankButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={[styles.addBankText, { color: colors.primary }]}>+ Add Another Bank</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Settings */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Quick Settings
          </Text>

          {/* Dark Mode Toggle */}
          <View style={[styles.toggleItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
              <Text style={styles.settingIconText}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.toggleContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Push Notifications */}
          <View style={[styles.toggleItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
              <Text style={styles.settingIconText}>🔔</Text>
            </View>
            <View style={styles.toggleContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get alerts for bills and spending
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Biometric Auth */}
          <View style={[styles.toggleItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
              <Text style={styles.settingIconText}>🔐</Text>
            </View>
            <View style={styles.toggleContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Biometric Login
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Use Face ID or fingerprint
              </Text>
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
            icon="🔒"
            label="Security"
            description="Password, 2FA settings"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="📊"
            label="Data & Privacy"
            description="Export data, delete account"
            onPress={() => {}}
            colors={colors}
          />
          <SettingItem
            icon="❓"
            label="Help & Support"
            description="FAQ, contact us"
            onPress={() => {}}
            colors={colors}
          />
        </Card>

        {/* Developer Section - Temp Button */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Developer
          </Text>
          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.devButtonIcon}>🚀</Text>
            <View style={styles.devButtonContent}>
              <Text style={styles.devButtonText}>Launch Onboarding Flow</Text>
              <Text style={styles.devButtonSubtext}>
                Test OAuth & Plaid mock integration
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Sign Out */}
        <TouchableOpacity style={[styles.signOutButton, { borderColor: colors.border }]}>
          <Text style={[styles.signOutText, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Sphere v1.0.0
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { width: 70 },
  backText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: '600' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  profileMember: { fontSize: 11, marginTop: 4 },
  editButton: { fontSize: 14, fontWeight: '500' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfo: { flex: 1, marginLeft: 12 },
  bankName: { fontSize: 14, fontWeight: '500' },
  bankMeta: { fontSize: 11, marginTop: 2 },
  chevron: { fontSize: 20 },
  addBankButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
  },
  addBankText: { fontSize: 14, fontWeight: '500' },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleContent: { flex: 1, marginLeft: 12 },
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
  },
  settingIconText: { fontSize: 18 },
  settingContent: { flex: 1, marginLeft: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  settingDescription: { fontSize: 11, marginTop: 2 },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  devButtonIcon: { fontSize: 24 },
  devButtonContent: { flex: 1 },
  devButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  devButtonSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: { fontSize: 15, fontWeight: '600' },
  versionText: { fontSize: 12, textAlign: 'center', marginTop: 16 },
  bottomPadding: { height: 40 },
});