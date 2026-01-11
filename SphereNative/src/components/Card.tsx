import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, spacing } from '../lib/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
});