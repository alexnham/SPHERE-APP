import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface OnboardingHeaderProps {
  currentSlide: number;
  totalSlides: number;
  onBack: () => void;
  onSkip: () => void;
  colors: any;
  topInset: number;
}

export const OnboardingHeader = ({
  currentSlide,
  totalSlides,
  onBack,
  onSkip,
  colors,
  topInset,
}: OnboardingHeaderProps) => (
  <View style={[styles.container, { paddingTop: topInset + 8 }]}>
    {currentSlide > 0 ? (
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <Text style={[styles.backArrow, { color: colors.textSecondary }]}>←</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.button} />
    )}

    <View style={styles.dots}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentSlide
                  ? colors.primary
                  : index < currentSlide
                  ? `${colors.primary}99`
                  : colors.border,
              width: index === currentSlide ? 24 : 6,
            },
          ]}
        />
      ))}
    </View>

    <TouchableOpacity onPress={onSkip} style={styles.button}>
      <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  button: { width: 50 },
  backArrow: { fontSize: 24 },
  skipText: { fontSize: 14 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});