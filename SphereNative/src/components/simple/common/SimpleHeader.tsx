import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SimpleHeaderProps {
  title: string;
  colors: any;
}

export const SimpleHeader = ({ title, colors }: SimpleHeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
