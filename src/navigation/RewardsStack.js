import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RewardsScreen from '../screens/rewards/RewardsScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RewardsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="RewardsMain" component={RewardsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
