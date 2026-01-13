import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface GoogleSignInSlideProps {
  colors: any;
  isLoading: boolean;
  onSignIn: () => void;
}

export const GoogleSignInSlide = ({ colors, isLoading, onSignIn }: GoogleSignInSlideProps) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Text style={styles.googleLogo}>G</Text>
    </View>
    <Text style={[styles.title, { color: colors.text }]}>Sign in with Google</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      Securely sign in with your Google account. We'll never post anything without your permission.
    </Text>

    <TouchableOpacity
      style={[styles.googleButton, { borderColor: colors.border }]}
      onPress={onSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color="#4285F4" style={{ marginRight: 8 }} />
          <Text style={styles.googleButtonText}>Signing in...</Text>
        </>
      ) : (
        <>
          <Text style={styles.googleButtonIcon}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>

    <Text style={[styles.terms, { color: colors.textSecondary }]}>
      By continuing, you agree to our Terms of Service and Privacy Policy
    </Text>
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleLogo: { fontSize: 36, fontWeight: '700', color: '#4285F4' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#fff',
    gap: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonIcon: { fontSize: 18, fontWeight: '700', color: '#4285F4' },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#333' },
  terms: { fontSize: 11, textAlign: 'center', paddingHorizontal: 24 },
});