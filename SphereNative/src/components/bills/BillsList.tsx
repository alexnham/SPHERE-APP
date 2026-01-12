import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { BillItem } from './BillItem';

interface Bill {
  id: string;
  merchant: string;
  category: string;
  cadence: string;
  avgAmount: number;
  nextDate: Date;
}

interface BillsListProps {
  title: string;
  bills: Bill[];
  acknowledgedBills?: Set<string>;
  showAckButton?: boolean;
  onAcknowledge?: (id: string) => void;
}

export function BillsList({
  title,
  bills,
  acknowledgedBills = new Set(),
  showAckButton = false,
  onAcknowledge,
}: BillsListProps) {
  const { colors } = useTheme();

  if (bills.length === 0) return null;

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {bills.map((bill) => {
        const daysUntil = differenceInDays(bill.nextDate, new Date());
        return (
          <BillItem
            key={bill.id}
            id={bill.id}
            merchant={bill.merchant}
            category={bill.category}
            cadence={bill.cadence}
            avgAmount={bill.avgAmount}
            nextDate={bill.nextDate}
            daysUntil={daysUntil}
            isAcknowledged={acknowledgedBills.has(bill.id)}
            showAckButton={showAckButton}
            onAcknowledge={onAcknowledge}
          />
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
});