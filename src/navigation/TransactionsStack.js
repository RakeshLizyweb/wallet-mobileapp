import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransactionHistoryScreen from '../screens/transfer/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/transfer/TransactionDetailScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function TransactionsStack() {
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
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction' }} />
    </Stack.Navigator>
  );
}
