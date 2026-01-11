import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Screens - Fixed import paths
import OverviewScreen from '../screens/OverviewScreen';
import SpendingScreen from '../screens/SpendingScreen';
import DebtsScreen from '../screens/DebtsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';

export type RootStackParamList = {
  Main: undefined;
  DebtDetail: { id: string };
  Settings: undefined;
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

// Simple icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Overview: '📊',
    Spending: '💰',
    Debts: '🏦',
    Accounts: '💳',
    Invest: '📈',
  };
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>{icons[name]}</Text>
    </View>
  );
};

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Spending" component={SpendingScreen} />
      <Tab.Screen name="Debts" component={DebtsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Invest" component={InvestmentsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
});