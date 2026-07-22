import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import SetPinScreen from '../screens/auth/SetPinScreen';
import PinLockScreen from '../screens/auth/PinLockScreen';
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { bootstrapping, isAuthenticated, requiresPinSetup, unlocked } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  let content = <AuthStack />;
  if (isAuthenticated) {
    if (requiresPinSetup) content = <SetPinScreen />;
    else if (!unlocked) content = <PinLockScreen />;
    else content = <MainTabs />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}
