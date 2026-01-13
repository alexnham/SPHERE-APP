import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
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

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    Alert.alert('Welcome to Sphere!', 'Successfully signed in with Google');
    nextSlide();
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handlePlaidConnect = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConnectedBanks(['Chase Bank', 'Bank of America']);
    setIsLoading(false);
    Alert.alert('Banks Connected!', 'Successfully linked 2 accounts');
    nextSlide();
  };

  const handleComplete = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const slides = [
    { key: 'welcome', component: <WelcomeSlide colors={colors} onNext={nextSlide} /> },
    {
      key: 'google',
      component: <GoogleSignInSlide colors={colors} isLoading={isLoading} onSignIn={handleGoogleSignIn} />,
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
          onConnect={handlePlaidConnect}
          onSkip={nextSlide}
          onNext={nextSlide}
        />
      ),
    },
    {
      key: 'done',
      component: <AllSetSlide colors={colors} connectedBanks={connectedBanks} onComplete={handleComplete} />,
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