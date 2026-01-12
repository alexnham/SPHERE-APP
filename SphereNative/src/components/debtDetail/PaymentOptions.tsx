import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface PaymentOptionsProps {
  minimumPayment?: number;
  recommendedPayment: number;
  fullBalance: number;
  onPayMinimum?: () => void;
  onPayRecommended?: () => void;
  onPayFull?: () => void;
  onCustomAmount?: () => void;
}

export function PaymentOptions({
  minimumPayment,
  recommendedPayment,
  fullBalance,
  onPayMinimum,
  onPayRecommended,
  onPayFull,
  onCustomAmount,
}: PaymentOptionsProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Options</Text>

      {minimumPayment !== undefined && (
        <TouchableOpacity
          style={[styles.paymentOption, { borderColor: colors.border }]}
          onPress={onPayMinimum}
        >
          <Text style={[styles.paymentLabel, { color: colors.text }]}>Pay Minimum</Text>
          <Text style={[styles.paymentAmount, { color: colors.text }]}>
            {formatCurrency(minimumPayment)}
          </Text>
        </TouchableOpacity>
      )}

      {recommendedPayment > (minimumPayment || 0) && (
        <TouchableOpacity
          style={[
            styles.paymentOption,
            styles.recommendedOption,
            { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
          ]}
          onPress={onPayRecommended}
        >
          <View>
            <Text style={[styles.paymentLabel, { color: colors.primary }]}>Recommended</Text>
            <Text style={[styles.paymentHint, { color: colors.textSecondary }]}>
              Based on safe-to-spend
            </Text>
          </View>
          <Text style={[styles.paymentAmount, { color: colors.primary }]}>
            {formatCurrency(recommendedPayment)}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.paymentOption, { borderColor: colors.border }]}
        onPress={onPayFull}
      >
        <Text style={[styles.paymentLabel, { color: colors.text }]}>Pay in Full</Text>
        <Text style={[styles.paymentAmount, { color: colors.text }]}>
          {formatCurrency(fullBalance)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.customPayment} onPress={onCustomAmount}>
        <Text style={[styles.customPaymentText, { color: colors.textSecondary }]}>
          Custom Amount
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  recommendedOption: { borderWidth: 2 },
  paymentLabel: { fontSize: 14, fontWeight: '500' },
  paymentHint: { fontSize: 11, marginTop: 2 },
  paymentAmount: { fontSize: 16, fontWeight: '600' },
  customPayment: { alignItems: 'center', paddingVertical: 12 },
  customPaymentText: { fontSize: 14 },
});