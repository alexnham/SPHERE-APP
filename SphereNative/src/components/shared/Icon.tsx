import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Sparkles,
  TrendingUp,
  PiggyBank,
  Shield,
  Building2,
  Lock,
  Eye,
  Check,
  Target,
  CreditCard,
  Home,
  BarChart3,
  ChevronRight,
  ArrowRight,
  User,
  LogOut,
  Settings,
  Plus,
  X,
  ChevronLeft,
  Calendar,
  DollarSign,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  'piggy-bank': PiggyBank,
  shield: Shield,
  building: Building2,
  bank: Building2,
  lock: Lock,
  eye: Eye,
  check: Check,
  target: Target,
  'credit-card': CreditCard,
  home: Home,
  'bar-chart': BarChart3,
  'chevron-right': ChevronRight,
  'arrow-right': ArrowRight,
  user: User,
  logout: LogOut,
  settings: Settings,
  plus: Plus,
  x: X,
  close: X,
  'chevron-left': ChevronLeft,
  calendar: Calendar,
  dollar: DollarSign,
  wallet: Wallet,
};

interface IconProps {
  name: keyof typeof iconMap | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const Icon = ({ name, size = 24, color = '#000', strokeWidth = 2, style }: IconProps) => {
  const IconComponent = iconMap[name.toLowerCase()];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return (
    <View style={style}>
      <IconComponent size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
};

// Export individual icons for direct use
export {
  Sparkles,
  TrendingUp,
  PiggyBank,
  Shield,
  Building2,
  Lock,
  Eye,
  Check,
  Target,
  CreditCard,
  Home,
  BarChart3,
  ChevronRight,
  ArrowRight,
  User,
  LogOut,
  Settings,
  Plus,
  X,
  ChevronLeft,
  Calendar,
  DollarSign,
  Wallet,
};
