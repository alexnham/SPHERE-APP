import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createLinkToken, exchangePublicToken, getAccounts, getSummary } from '../lib/plaid';
import {
  OnboardingHeader,
  WelcomeSlide,
  GoogleSignInSlide,
  GoalsSlide,
  ConnectBankSlide,
  AllSetSlide,
} from '../components/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SLIDES = 5;

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  current_balance: number;
  institution_name?: string;
}

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { user, signInWithGoogle } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<PlaidAccount[]>([]);

  // Get user info from auth context
  const userEmail = user?.email || null;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  // Real Google OAuth sign in
  const handleGoogleSignIn = async () => {
    if (user) {
      // Already signed in, just go to next slide
      nextSlide();
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log('=== GOOGLE OAUTH SUCCESS ===');
        console.log('User signed in successfully');
        Alert.alert('Welcome to Sphere!', 'Successfully signed in with Google');
        nextSlide();
      } else {
        console.log('=== GOOGLE OAUTH FAILED ===');
        console.log('Error:', result.error);
        Alert.alert('Sign In Failed', result.error || 'Could not sign in with Google');
      }
    } catch (error) {
      console.error('=== GOOGLE OAUTH ERROR ===', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Real Plaid connection
  const handlePlaidConnect = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in with Google first to connect your bank.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Get a link token from the backend
      console.log('=== PLAID LINK: Getting link token ===');
      const { link_token } = await createLinkToken();
      console.log('Link token received:', link_token ? 'Yes' : 'No');

      // Step 2: Open Plaid Link
      // For React Native, we need to use the Plaid Link SDK
      // Since react-native-plaid-link-sdk requires native setup,
      // we'll use a WebView-based approach for now or simulate success
      
      // Note: In production, you would use:
      // import { PlaidLink } from 'react-native-plaid-link-sdk';
      // For now, we'll open Plaid Link in a browser (development approach)
      
      if (Platform.OS === 'web') {
        // For web, we can use the Plaid Link directly
        Alert.alert(
          'Connect Bank',
          'In production, this would open Plaid Link. For development, simulating a successful connection.',
          [
            {
              text: 'Simulate Connection',
              onPress: async () => {
                // Simulate getting accounts
                await simulatePlaidConnection();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        // For native, open Plaid Link in a browser
        // This is a simplified approach - in production, use react-native-plaid-link-sdk
        const plaidLinkUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${link_token}`;
        
        Alert.alert(
          'Connect Bank',
          'This will open Plaid Link to connect your bank account.',
          [
            {
              text: 'Open Plaid',
              onPress: async () => {
                try {
                  await Linking.openURL(plaidLinkUrl);
                  // After user returns, try to fetch accounts
                  setTimeout(async () => {
                    await fetchConnectedAccounts();
                  }, 2000);
                } catch (err) {
                  console.error('Error opening Plaid Link:', err);
                  // Fallback to simulation
                  await simulatePlaidConnection();
                }
              },
            },
            {
              text: 'Simulate (Dev)',
              onPress: async () => {
                await simulatePlaidConnection();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('=== PLAID LINK ERROR ===', error);
      Alert.alert('Error', 'Failed to initialize bank connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Plaid connection for development
  const simulatePlaidConnection = async () => {
    setIsLoading(true);
    
    // Simulated accounts data (similar to what Plaid would return)
    const simulatedAccounts: PlaidAccount[] = [
      {
        id: 'acc_1',
        name: 'Checking Account',
        type: 'depository',
        subtype: 'checking',
        current_balance: 2847.50,
        institution_name: 'Chase Bank',
      },
      {
        id: 'acc_2',
        name: 'Savings Account',
        type: 'depository',
        subtype: 'savings',
        current_balance: 15420.00,
        institution_name: 'Chase Bank',
      },
      {
        id: 'acc_3',
        name: 'Credit Card',
        type: 'credit',
        subtype: 'credit card',
        current_balance: -1250.75,
        institution_name: 'Bank of America',
      },
    ];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnectedAccounts(simulatedAccounts);
    setConnectedBanks(['Chase Bank', 'Bank of America']);
    
    console.log('=== PLAID CONNECTION SIMULATED ===');
    console.log('Connected Accounts:', JSON.stringify(simulatedAccounts, null, 2));
    
    setIsLoading(false);
    Alert.alert('Banks Connected!', `Successfully linked ${simulatedAccounts.length} accounts`);
    nextSlide();
  };

  // Fetch real connected accounts from backend
  const fetchConnectedAccounts = async () => {
    try {
      console.log('=== FETCHING CONNECTED ACCOUNTS ===');
      const accounts = await getAccounts();
      const summary = await getSummary();
      
      console.log('Accounts:', JSON.stringify(accounts, null, 2));
      console.log('Summary:', JSON.stringify(summary, null, 2));

      if (accounts.length > 0) {
        setConnectedAccounts(accounts);
        const uniqueBanks = [...new Set(accounts.map(a => a.institution_name).filter(Boolean))] as string[];
        setConnectedBanks(uniqueBanks);
        
        Alert.alert('Banks Connected!', `Successfully linked ${accounts.length} accounts`);
        nextSlide();
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleComplete = () => {
    // Log all collected onboarding data
    const onboardingData = {
      timestamp: new Date().toISOString(),
      user: {
        email: userEmail,
        name: userName,
        id: user?.id,
      },
      selectedGoals,
      connectedBanks,
      connectedAccounts: connectedAccounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        balance: acc.current_balance,
        institution: acc.institution_name,
      })),
      totalBalance: connectedAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0),
    };

    console.log('========================================');
    console.log('=== ONBOARDING COMPLETE - DATA LOG ===');
    console.log('========================================');
    console.log(JSON.stringify(onboardingData, null, 2));
    console.log('========================================');

    Alert.alert(
      'Onboarding Data Logged',
      `Check console for details:\n\n• User: ${userEmail || 'Not signed in'}\n• Goals: ${selectedGoals.length}\n• Accounts: ${connectedAccounts.length}`,
      [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
    );
  };

  const handleSkip = () => {
    // Log partial data even on skip
    console.log('=== ONBOARDING SKIPPED ===');
    console.log('Current slide:', currentSlide);
    console.log('User:', userEmail);
    console.log('Goals:', selectedGoals);
    navigation.goBack();
  };

  const slides = [
    { key: 'welcome', component: <WelcomeSlide colors={colors} onNext={nextSlide} /> },
    {
      key: 'google',
      component: (
        <GoogleSignInSlide 
          colors={colors} 
          isLoading={isLoading} 
          onSignIn={handleGoogleSignIn}
          userEmail={userEmail}
          userName={userName}
        />
      ),
    },
    {
      key: 'goals',
      component: (
        <GoalsSlide
          colors={colors}
          selectedGoals={selectedGoals}
          onToggleGoal={toggleGoal}
          onNext={nextSlide}
        />
      ),
    },
    {
      key: 'bank',
      component: (
        <ConnectBankSlide
          colors={colors}
          isLoading={isLoading}
          connectedBanks={connectedBanks}
          connectedAccounts={connectedAccounts}
          onConnect={handlePlaidConnect}
          onSkip={nextSlide}
          onNext={nextSlide}
        />
      ),
    },
    {
      key: 'done',
      component: (
        <AllSetSlide 
          colors={colors} 
          connectedBanks={connectedBanks}
          connectedAccounts={connectedAccounts}
          userEmail={userEmail}
          userName={userName}
          selectedGoals={selectedGoals}
          onComplete={handleComplete} 
        />
      ),
    },
  ];

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>{item.component}</View>
  );

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OnboardingHeader
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onBack={prevSlide}
        onSkip={handleSkip}
        colors={colors}
        topInset={insets.top}
      />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});