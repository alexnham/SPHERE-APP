import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Clock, Info, X, Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../lib/utils';

interface CostOfWaitingProps {
  currentBalance: number;
  apr: number;
}

export function CostOfWaiting({ currentBalance, apr }: CostOfWaitingProps) {
  const { colors } = useTheme();
  const [showInfo, setShowInfo] = useState(false);

  const dailyRate = apr / 365 / 100;
  const costWaiting7Days = currentBalance * dailyRate * 7;
  const costWaiting30Days = currentBalance * dailyRate * 30;

  return (
    <View style={[styles.costCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
      <View style={styles.costHeader}>
        <View style={styles.costTitleRow}>
          <Clock size={18} color="#b45309" style={{ marginRight: 6 }} />
          <Text style={[styles.costTitle, { color: '#b45309' }]}>Cost of Waiting</Text>
        </View>
        <TouchableOpacity
          style={[styles.infoButton, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}
          onPress={() => setShowInfo(true)}
        >
          <Info size={14} color="#b45309" />
        </TouchableOpacity>
      </View>
      <View style={styles.costGrid}>
        <View style={[styles.costItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
            Wait 7 days
          </Text>
          <Text style={[styles.costValue, { color: '#f59e0b' }]}>
            +{formatCurrency(costWaiting7Days)}
          </Text>
        </View>
        <View style={[styles.costItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
            Wait 30 days
          </Text>
          <Text style={[styles.costValue, { color: '#ef4444' }]}>
            +{formatCurrency(costWaiting30Days)}
          </Text>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfo(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Why does timing matter?
              </Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Credit cards and loans charge{' '}
                <Text style={{ fontWeight: '700', color: colors.text }}>daily interest</Text>{' '}
                on your balance. The longer you wait to pay, the more interest accumulates.
              </Text>

              <View style={styles.bulletPoint}>
                <Text style={[styles.bullet, { color: '#f59e0b' }]}>•</Text>
                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>Interest:</Text>{' '}
                  Calculated daily based on your APR (Annual Percentage Rate) divided by 365.
                </Text>
              </View>

              <View style={styles.bulletPoint}>
                <Text style={[styles.bullet, { color: '#ef4444' }]}>•</Text>
                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>Late fees:</Text>{' '}
                  If you miss the due date, you'll be charged a penalty fee on top of interest.
                </Text>
              </View>

              <View style={[styles.tipBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Lightbulb size={14} color="#f59e0b" style={{ marginRight: 6, marginTop: 2 }} />
                  <Text style={[styles.tipText, { color: colors.textSecondary, flex: 1 }]}>
                    Paying early saves you money and protects your credit score!
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  costCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costTitleRow: { flexDirection: 'row', alignItems: 'center' },
  costIcon: { fontSize: 16, marginRight: 8 },
  costTitle: { fontSize: 14, fontWeight: '600' },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: { fontSize: 14 },
  costGrid: { flexDirection: 'row', gap: 12 },
  costItem: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  costLabel: { fontSize: 11, marginBottom: 4 },
  costValue: { fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalBody: { maxHeight: 300 },
  modalText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  bulletPoint: { flexDirection: 'row', marginBottom: 12 },
  bullet: { fontSize: 18, fontWeight: '700', marginRight: 8, marginTop: -2 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18 },
  tipBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipText: { fontSize: 12, textAlign: 'center' },
});