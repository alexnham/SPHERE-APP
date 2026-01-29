import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, ArrowRight } from 'lucide-react-native';
import { GoogleIcon } from '../shared/GoogleIcon';

interface GoogleSignInSlideProps {
  colors: any;
  isLoading: boolean;
  onSignIn: () => void;
  onNext?: () => void;
  userEmail?: string | null;
  userName?: string | null;
}

export const GoogleSignInSlide = ({ colors, isLoading, onSignIn, onNext, userEmail, userName }: GoogleSignInSlideProps) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <GoogleIcon size={40} />
    </View>
    <Text style={[styles.title, { color: colors.text }]}>
      {userEmail ? 'Signed in!' : 'Sign in with Google'}
    </Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      {userEmail 
        ? `Welcome, ${userName || userEmail}! Your account is connected.`
        : "Securely sign in with your Google account. We'll never post anything without your permission."
      }
    </Text>

    {userEmail ? (
      <>
        <View style={[styles.successContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.successIcon}>
            <Check size={24} color="#fff" strokeWidth={3} />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={[styles.successTitle, { color: colors.text }]}>{userName || 'User'}</Text>
            <Text style={[styles.successEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>
        </View>
        {onNext && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={onNext}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </>
    ) : (
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
            <GoogleIcon size={20} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>
    )}

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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 12,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  successEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});