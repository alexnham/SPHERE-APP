import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, TrendingUp, PiggyBank, Shield, ArrowRight } from 'lucide-react-native';
import { FeatureItem } from './FeatureItem';

interface WelcomeSlideProps {
  colors: any;
  onNext: () => void;
}

export const WelcomeSlide = ({ colors, onNext }: WelcomeSlideProps) => (
  <View style={styles.container}>
    <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
      <Sparkles size={40} color={colors.primary} strokeWidth={1.5} />
    </View>
    <Text style={[styles.title, { color: colors.text }]}>Welcome to Sphere</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      Your personal finance companion that helps you spend smarter, save more, and reach your goals faster.
    </Text>

    <View style={styles.features}>
      <FeatureItem
        icon="trending-up"
        title="Track Spending"
        description="See where your money goes"
        color="#10b981"
        colors={colors}
      />
      <FeatureItem
        icon="piggy-bank"
        title="Save Smarter"
        description="Automated savings vaults"
        color="#3b82f6"
        colors={colors}
      />
      <FeatureItem
        icon="shield"
        title="Stay Secure"
        description="Bank-level encryption"
        color="#8b5cf6"
        colors={colors}
      />
    </View>

    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onNext}>
      <Text style={styles.buttonText}>Get Started</Text>
      <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  features: { width: '100%', gap: 12, marginBottom: 32 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});