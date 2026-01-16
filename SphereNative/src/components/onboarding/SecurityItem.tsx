import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock, Eye, Check, Shield, type LucideIcon } from 'lucide-react-native';

const iconMap: Record<string, LucideIcon> = {
  lock: Lock,
  eye: Eye,
  check: Check,
  shield: Shield,
};

interface SecurityItemProps {
  icon: string;
  text: string;
  color: string;
  colors: any;
}

export const SecurityItem = ({ icon, text, color, colors }: SecurityItemProps) => {
  const IconComponent = iconMap[icon];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.iconWrapper}>
        {IconComponent ? (
          <IconComponent size={18} color={color} strokeWidth={2} />
        ) : (
          <Text style={[styles.iconFallback, { color }]}>{icon}</Text>
        )}
      </View>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  iconWrapper: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: { fontSize: 18 },
  text: { fontSize: 13 },
});