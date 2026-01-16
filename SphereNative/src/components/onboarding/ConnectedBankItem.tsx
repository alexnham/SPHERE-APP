import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface ConnectedBankItemProps {
  name: string;
  colors: any;
}

export const ConnectedBankItem = ({ name, colors }: ConnectedBankItemProps) => (
  <View style={styles.container}>
    <View style={styles.iconWrapper}>
      <Check size={18} color="#10b981" strokeWidth={3} />
    </View>
    <View>
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      <Text style={styles.status}>Connected</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  name: { fontSize: 14, fontWeight: '500' },
  status: { color: '#10b981', fontSize: 12 },
});