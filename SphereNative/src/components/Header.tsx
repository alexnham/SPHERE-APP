import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings } from 'lucide-react-native';

interface HeaderProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const Header = ({ onSettingsPress, onNotificationsPress }: HeaderProps) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const displayName = 'there'; // Can be replaced with actual user name

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* Left - Greeting */}
      <View style={styles.leftSection}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting()}, {displayName}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {format(now, 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* Right - Action Buttons */}
      <View style={styles.rightSection}>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={onNotificationsPress}
        >
          <Bell size={20} color={colors.text} strokeWidth={2} />
          {/* Notification dot */}
          <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={onSettingsPress}
        >
          <Settings size={20} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});