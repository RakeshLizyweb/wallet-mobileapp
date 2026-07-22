import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ForgotPinScreen from '../screens/auth/ForgotPinScreen';
import ResetPinScreen from '../screens/auth/ResetPinScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: '' }} />
      <Stack.Screen name="ForgotPin" component={ForgotPinScreen} options={{ title: '' }} />
      <Stack.Screen name="ResetPin" component={ResetPinScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
