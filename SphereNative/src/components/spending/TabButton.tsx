import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Target, type LucideIcon } from 'lucide-react-native';

const iconMap: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  target: Target,
};

interface TabButtonProps {
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

export const TabButton = ({ title, icon, isActive, onPress, colors }: TabButtonProps) => {
  const IconComponent = iconMap[icon];
  const iconColor = isActive ? '#fff' : colors.textSecondary;
  
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      {IconComponent && <IconComponent size={16} color={iconColor} strokeWidth={2} style={{ marginRight: 6 }} />}
      <Text
        style={[
          styles.tabButtonText,
          { color: isActive ? '#fff' : colors.textSecondary },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});