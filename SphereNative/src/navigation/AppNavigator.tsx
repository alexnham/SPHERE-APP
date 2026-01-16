import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { 
  LayoutDashboard, 
  Wallet, 
  Building2, 
  CreditCard, 
  TrendingUp 
} from 'lucide-react-native';

// Screens
import OverviewScreen from '../screens/OverviewScreen';
import SpendingScreen from '../screens/SpendingScreen';
import DebtsScreen from '../screens/DebtsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DebtDetailScreen from '../screens/DebtDetailScreen';
import BillsScreen from '../screens/BillsScreen';
import WeeklyReflectionScreen from '../screens/WeeklyReflectionScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  DebtDetail: { id: string };
  Bills: undefined;
  WeeklyReflection: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Overview: undefined;
  Spending: undefined;
  Debts: undefined;
  Accounts: undefined;
  Invest: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const { colors } = useTheme();
  const iconColor = focused ? colors.primary : colors.textSecondary;
  const iconSize = 22;
  
  const icons: Record<string, React.ReactNode> = {
    Overview: <LayoutDashboard size={iconSize} color={iconColor} strokeWidth={2} />,
    Spending: <Wallet size={iconSize} color={iconColor} strokeWidth={2} />,
    Debts: <Building2 size={iconSize} color={iconColor} strokeWidth={2} />,
    Accounts: <CreditCard size={iconSize} color={iconColor} strokeWidth={2} />,
    Invest: <TrendingUp size={iconSize} color={iconColor} strokeWidth={2} />,
  };
  return (
    <View style={styles.iconContainer}>
      {icons[name]}
    </View>
  );
};

// Wrapper component that adds the Header to each screen
const ScreenWithHeader = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleNotificationsPress = () => {
    console.log('Notifications pressed');
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      <Header
        onSettingsPress={handleSettingsPress}
        onNotificationsPress={handleNotificationsPress}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

// Wrapped screen components
const OverviewWithHeader = () => (
  <ScreenWithHeader><OverviewScreen /></ScreenWithHeader>
);
const SpendingWithHeader = () => (
  <ScreenWithHeader><SpendingScreen /></ScreenWithHeader>
);
const DebtsWithHeader = () => (
  <ScreenWithHeader><DebtsScreen /></ScreenWithHeader>
);
const AccountsWithHeader = () => (
  <ScreenWithHeader><AccountsScreen /></ScreenWithHeader>
);
const InvestmentsWithHeader = () => (
  <ScreenWithHeader><InvestmentsScreen /></ScreenWithHeader>
);

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewWithHeader} />
      <Tab.Screen name="Spending" component={SpendingWithHeader} />
      <Tab.Screen name="Debts" component={DebtsWithHeader} />
      <Tab.Screen name="Accounts" component={AccountsWithHeader} />
      <Tab.Screen name="Invest" component={InvestmentsWithHeader} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DebtDetail" component={DebtDetailScreen} />
      <Stack.Screen name="Bills" component={BillsScreen} />
      <Stack.Screen name="WeeklyReflection" component={WeeklyReflectionScreen} />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  content: { flex: 1 },
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
});