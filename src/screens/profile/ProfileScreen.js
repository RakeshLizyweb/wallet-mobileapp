import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const MENU = [
  { key: 'banks', label: 'Bank accounts', icon: 'business-outline', screen: 'BankList' },
  { key: 'verification', label: 'Identity verification', icon: 'shield-checkmark-outline', screen: 'Verification' },
  // Nationality is set once at registration and can't be changed afterward —
  // shown here as a read-only row (no navigation, no chevron) rather than a
  // regular menu item.
  { key: 'nationality', label: 'Nationality', icon: 'flag-outline', readOnly: true },
  { key: 'card', label: 'Virtual card', icon: 'card-outline', screen: 'VirtualCard' },
  { key: 'limits', label: 'Transaction limits', icon: 'speedometer-outline', screen: 'Limits' },
  { key: 'pin', label: 'Change PIN', icon: 'keypad-outline', screen: 'ChangePin' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    showAlert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user?.phone}</Text>
        <Text style={styles.meta}>{user?.upi_handle}</Text>
        {user?.nationality ? <Text style={styles.meta}>{user.nationality}</Text> : null}
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{user?.tier?.toUpperCase()} TIER</Text>
        </View>
      </Card>

      <View style={styles.menu}>
        {MENU.map((item) =>
          item.readOnly ? (
            <View key={item.key} style={styles.menuItem}>
              <Ionicons name={item.icon} size={20} color={colors.text} style={{ marginRight: spacing.sm }} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuValue}>{user?.nationality || '—'}</Text>
            </View>
          ) : (
            <Pressable key={item.key} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
              <Ionicons name={item.icon} size={20} color={colors.text} style={{ marginRight: spacing.sm }} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )
        )}
      </View>

      <Pressable style={styles.menuItem} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: spacing.sm }} />
        <Text style={[styles.menuLabel, { color: colors.danger }]}>Log out</Text>
      </Pressable>

      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('AccountSettings')}>
        <Ionicons name="settings-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
        <Text style={styles.menuLabel}>Deactivate or delete account</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.lg },
  userCard: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.textInverse, fontSize: fontSize.xl, fontWeight: '800' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  tierBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tierText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  menu: { marginBottom: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  menuValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
});
