import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Shield, 
  CreditCard, 
  Home, 
  BarChart3, 
  TrendingUp, 
  Check,
  type LucideIcon 
} from 'lucide-react-native';

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  'credit-card': CreditCard,
  home: Home,
  'bar-chart': BarChart3,
  'trending-up': TrendingUp,
};

interface GoalItemProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}

export const GoalItem = ({ icon, label, selected, onPress, colors }: GoalItemProps) => {
  const IconComponent = iconMap[icon];
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: selected ? `${colors.primary}15` : colors.surface },
        selected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        {IconComponent ? (
          <IconComponent size={20} color={selected ? colors.primary : colors.textSecondary} strokeWidth={2} />
        ) : (
          <Text style={[styles.iconFallback, { color: colors.textSecondary }]}>{icon}</Text>
        )}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.check,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected && <Check size={14} color="#fff" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: { fontSize: 20 },
  label: { flex: 1, fontSize: 14, fontWeight: '500' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});