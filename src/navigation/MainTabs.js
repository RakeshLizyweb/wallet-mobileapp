import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import RewardsStack from './RewardsStack';
import TransactionsStack from './TransactionsStack';
import ProfileStack from './ProfileStack';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Rewards: 'gift',
  Transactions: 'receipt',
  Profile: 'person',
};

// This tab never actually renders — its tabPress listener below always
// intercepts and redirects into HomeStack's camera screen instead, so the
// bottom bar can have a raised center button without a real "Scan" screen.
function ScanPlaceholder() {
  return null;
}

function ScanTabButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.scanWrap}>
      <View style={styles.scanButton}>
        <Ionicons name="qr-code" size={26} color={colors.textInverse} />
      </View>
    </Pressable>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={`${ICONS[route.name]}${focused ? '' : '-outline'}`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Rewards" component={RewardsStack} />
      <Tab.Screen
        name="Scan"
        component={ScanPlaceholder}
        options={{ tabBarButton: (props) => <ScanTabButton {...props} /> }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Home', { screen: 'ScanQr' });
          },
        })}
      />
      <Tab.Screen name="Transactions" component={TransactionsStack} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scanWrap: {
    top: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 4,
    borderColor: colors.surface,
  },
});
