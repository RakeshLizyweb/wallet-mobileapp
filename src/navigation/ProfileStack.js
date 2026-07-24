import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BankListScreen from '../screens/banks/BankListScreen';
import AddBankScreen from '../screens/banks/AddBankScreen';
import VerificationScreen from '../screens/verification/VerificationScreen';
import SubmitVerificationScreen from '../screens/verification/SubmitVerificationScreen';
import VirtualCardScreen from '../screens/verification/VirtualCardScreen';
import LimitsScreen from '../screens/profile/LimitsScreen';
import ChangePinScreen from '../screens/profile/ChangePinScreen';
import ChangeNationalityScreen from '../screens/profile/ChangeNationalityScreen';
import DevicesScreen from '../screens/profile/DevicesScreen';
import AccountSettingsScreen from '../screens/profile/AccountSettingsScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
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
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BankList" component={BankListScreen} options={{ title: '' }} />
      <Stack.Screen name="AddBank" component={AddBankScreen} options={{ title: '' }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: '' }} />
      <Stack.Screen name="SubmitVerification" component={SubmitVerificationScreen} options={{ title: '' }} />
      <Stack.Screen name="VirtualCard" component={VirtualCardScreen} options={{ title: '' }} />
      <Stack.Screen name="Limits" component={LimitsScreen} options={{ title: '' }} />
      <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: '' }} />
      <Stack.Screen name="ChangeNationality" component={ChangeNationalityScreen} options={{ title: '' }} />
      <Stack.Screen name="Devices" component={DevicesScreen} options={{ title: '' }} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
