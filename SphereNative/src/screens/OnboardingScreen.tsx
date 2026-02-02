import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createLinkToken, createLinkTokenWithRedirect, exchangePublicToken, getAccounts, getSummary } from '../lib/plaid';
import { createVault, getVaults } from '../lib/database';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import { create as createPlaidLink, open as openPlaidLink } from 'react-native-plaid-link-sdk';
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

  const [linkToken, setLinkToken] = useState<string | null>(null);
  // const [showPlaid, setShowPlaid] = useState(false); // not needed with openLink
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<PlaidAccount[]>([]);

  // Get user info from auth context
  const userEmail = user?.email || null;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;

  // If user is already authenticated, automatically navigate to main app
  useEffect(() => {
    if (user) {
      // User has an account, skip onboarding and go to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [user, navigation]);

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
      let link_token: string | undefined = undefined;

      // If native (mobile), request a link token that includes a redirect_uri
      if (Platform.OS !== 'web') {
        const redirectUri = ExpoLinking.createURL('plaid-link-callback');
        const res = await createLinkTokenWithRedirect(redirectUri);
        link_token = res?.link_token;
        console.log('Link token (with redirect) received:', link_token ? 'Yes' : 'No');
      } else {
        const res = await createLinkToken();
        link_token = res?.link_token;
        console.log('Link token received:', link_token ? 'Yes' : 'No');
      }

      // Step 2: Open Plaid Link
      if (Platform.OS === 'web') {
        // For web, we can use the Plaid Link directly (or simulate in dev)
        console.log('=== WEB: Showing Plaid connection alert ===');
        // For web, directly simulate the connection instead of showing alert
        // This ensures it always runs
        await simulatePlaidConnection();
      } else {
        // Native: use react-native-plaid-link-sdk create/open for a full in-app native experience
        try {
          // Initialize a Plaid Link session with the token
          createPlaidLink({ token: link_token ?? '' });

          // Open Plaid Link and handle success/exit
          openPlaidLink({
            onSuccess: async (result: any) => {
              // result should include publicToken or public_token
              const publicToken = result?.publicToken ?? result?.public_token ?? null;
              if (publicToken) {
                await handlePlaidSuccess(publicToken);
              } else {
                // Fallback: try fetching accounts from backend
                await fetchConnectedAccounts();
                setIsLoading(false);
              }
            },
            onExit: (result: any) => {
              const err = result?.error ?? null;
              handlePlaidExit(err);
              setIsLoading(false);
            },
          });
          // Don't set loading to false here - Plaid Link is async, callbacks will handle it
        } catch (err) {
          console.error('Error opening Plaid Link via native SDK:', err);
          setIsLoading(false);
          // Fallback: open hosted link in in-app browser
          try {
            const redirectUri = ExpoLinking.createURL('plaid-link-callback');
            const plaidLinkUrl = `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${link_token}&redirect_uri=${encodeURIComponent(redirectUri)}`;
            const result = await WebBrowser.openAuthSessionAsync(plaidLinkUrl, redirectUri);
            if (result.type === 'success' && result.url) {
              const parsed = ExpoLinking.parse(result.url);
              const params: any = parsed.queryParams || {};
              const publicToken = params.public_token ?? params.publicToken ?? null;
              if (publicToken) {
                await handlePlaidSuccess(publicToken);
              } else {
                await fetchConnectedAccounts();
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
            try { WebBrowser.maybeCompleteAuthSession(); } catch (e) {}
          } catch (err2) {
            console.error('Fallback WebBrowser error', err2);
            Alert.alert('Open Failed', 'Could not open Plaid Link. Try again later.');
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('=== PLAID LINK ERROR ===', error);
      Alert.alert('Error', 'Failed to initialize bank connection. Please try again.');
      setIsLoading(false);
    }
    // Removed finally block - loading state is managed by callbacks and error handlers
  };

  // Handler called when Plaid Link completes successfully
  const handlePlaidSuccess = async (publicToken: string) => {
    setIsLoading(true);
    try {
      const res = await exchangePublicToken(publicToken);
      if (res?.success) {
        await fetchConnectedAccounts();
        // Don't auto-advance - let user decide to continue or add more banks
        Alert.alert('Bank Connected!', `Successfully linked accounts. You can add more banks or continue.`);
      } else {
        Alert.alert('Connection Failed', 'Unable to exchange token.');
      }
    } catch (err) {
      console.error('Plaid exchange error', err);
      Alert.alert('Error', 'Failed to complete bank connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidExit = (error: any) => {
    if (error) {
      console.error('Plaid Link exit', error);
      Alert.alert('Plaid Link Closed', error.display_message || error.error_message || 'Link closed');
    }
  };

  // Simulate Plaid connection for development
  const simulatePlaidConnection = async () => {
    setIsLoading(true);
    
    // Generate unique IDs based on timestamp and random number to avoid duplicates
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    // Simulated accounts data (similar to what Plaid would return)
    // Use unique IDs so each connection adds new accounts
    const simulatedAccounts: PlaidAccount[] = [
      {
        id: `acc_${timestamp}_${random}_1`,
        name: 'Checking Account',
        type: 'depository',
        subtype: 'checking',
        current_balance: 2847.50,
        institution_name: 'Chase Bank',
      },
      {
        id: `acc_${timestamp}_${random}_2`,
        name: 'Savings Account',
        type: 'depository',
        subtype: 'savings',
        current_balance: 15420.00,
        institution_name: 'Chase Bank',
      },
      {
        id: `acc_${timestamp}_${random}_3`,
        name: 'Credit Card',
        type: 'credit',
        subtype: 'credit card',
        current_balance: -1250.75,
        institution_name: 'Bank of America',
      },
    ];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add to existing accounts instead of replacing
    setConnectedAccounts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newAccounts = simulatedAccounts.filter(a => !existingIds.has(a.id));
      return [...prev, ...newAccounts];
    });
    
    setConnectedBanks(prev => {
      const newBanks = simulatedAccounts
        .map(a => a.institution_name)
        .filter(Boolean) as string[];
      return [...new Set([...prev, ...newBanks])];
    });
    
    console.log('=== PLAID CONNECTION SIMULATED ===');
    console.log('Connected Accounts:', JSON.stringify(simulatedAccounts, null, 2));
    
    setIsLoading(false);
    // Don't auto-advance - let user decide to continue or add more banks
    Alert.alert('Bank Connected!', `Successfully linked accounts. You can add more banks or continue.`);
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
        // Map accounts to PlaidAccount format and merge with existing
        const newAccounts: PlaidAccount[] = accounts.map(acc => ({
          id: acc.id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          current_balance: acc.current_balance,
          institution_name: acc.institution_name,
        }));

        // Add new accounts that don't already exist
        setConnectedAccounts(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const uniqueNewAccounts = newAccounts.filter(a => !existingIds.has(a.id));
          return [...prev, ...uniqueNewAccounts];
        });

        // Update banks list with unique institutions
        setConnectedBanks(prev => {
          const newBanks = newAccounts
            .map(a => a.institution_name)
            .filter(Boolean) as string[];
          return [...new Set([...prev, ...newBanks])];
        });
        
        // Don't auto-advance - let user decide to continue or add more banks
        // Alert will be shown by handlePlaidSuccess
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleComplete = async () => {
    // Create Buffer vault if it doesn't exist
    try {
      const existingVaults = await getVaults();
      const bufferVault = existingVaults.find(v => v.name.toLowerCase().includes('buffer'));
      
      if (!bufferVault) {
        await createVault({
          name: 'Buffer',
          icon: '☔',
          balance: 0,
          color: 'from-blue-400 to-blue-500',
          description: 'For unexpected moments',
        });
        console.log('Buffer vault created during onboarding');
      }
    } catch (error) {
      console.error('Error creating Buffer vault during onboarding:', error);
      // Don't block onboarding completion if vault creation fails
    }

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
          onNext={nextSlide}
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

      {/* Native Plaid Link handled via openLink from SDK (no modal component needed) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});