import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import SendMoneyScreen from '../screens/transfer/SendMoneyScreen';
import AccountScreen from '../screens/transfer/AccountScreen';
import MoveToWalletScreen from '../screens/transfer/MoveToWalletScreen';
import ConfirmPinScreen from '../screens/transfer/ConfirmPinScreen';
import TransferSuccessScreen from '../screens/transfer/TransferSuccessScreen';
import TransactionDetailScreen from '../screens/transfer/TransactionDetailScreen';
import ScanQrScreen from '../screens/qr/ScanQrScreen';
import MyQrScreen from '../screens/qr/MyQrScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
};

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SendMoney" component={SendMoneyScreen} options={{ title: '' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: '' }} />
      <Stack.Screen name="MoveToWallet" component={MoveToWalletScreen} options={{ title: '' }} />
      <Stack.Screen name="ConfirmPin" component={ConfirmPinScreen} options={{ title: '' }} />
      <Stack.Screen name="MyQr" component={MyQrScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScanQr" component={ScanQrScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction' }} />
    </Stack.Navigator>
  );
}
