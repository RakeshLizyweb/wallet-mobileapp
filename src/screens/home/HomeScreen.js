import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as walletApi from '../../api/wallet';
import * as accountApi from '../../api/account';
import * as transfersApi from '../../api/transfers';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

// "Add Money" moves straight from the user's own Account into their Wallet
// — no bank account involved — reusing MoveToWalletScreen (which still has
// its own toggle to go the other way, Wallet → Account, if needed).
const ACTIONS = [
  { key: 'send', label: 'Send Money', icon: 'arrow-up-circle', screen: 'SendMoney' },
  { key: 'scan', label: 'Scan & Pay', icon: 'qr-code', screen: 'ScanQr' },
  { key: 'add', label: 'Add Money', icon: 'add-circle', screen: 'MoveToWallet', params: { direction: 'toWallet' } },
  { key: 'history', label: 'History', icon: 'time', tab: 'Transactions', screen: 'TransactionHistory' },
];

export default function HomeScreen({ navigation }) {
  const { user, sessionPin } = useAuth();
  const [balance, setBalance] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, contactsRes, accountRes] = await Promise.all([
        walletApi.getBalance(sessionPin),
        transfersApi.getRecentContacts(),
        accountApi.getBalance(sessionPin),
      ]);
      setBalance(balanceRes.data);
      setContacts(contactsRes.data);
      setAccountBalance(accountRes.data);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }, [sessionPin]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || ''}</Text>
          <Text style={styles.upi}>{user?.upi_handle}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('MyQr')} hitSlop={10} style={{ marginRight: spacing.md }}>
            <Ionicons name="qr-code-outline" size={24} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={10}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Account Balance</Text>
        <Text style={styles.balanceValue}>
          {loading ? '—' : formatCurrency(accountBalance?.available_balance, accountBalance?.currency)}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.balanceFooter}>
          <Text style={styles.walletNumber}>{accountBalance?.account_number}</Text>
          <Pressable
            onPress={() => navigation.navigate('MoveToWallet', { direction: 'toWallet' })}
            hitSlop={8}
          >
            <Text style={styles.moveLink}>Move to wallet ›</Text>
          </Pressable>
        </View>
      </Card>

      <Pressable
        onPress={() => navigation.navigate('MoveToWallet', { direction: 'toAccount' })}
        style={{ marginBottom: spacing.lg }}
      >
        <Card style={styles.accountRow}>
          <View style={styles.accountIcon}>
            <Ionicons name="wallet" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accountLabel}>Wallet Balance</Text>
            <Text style={styles.accountValue}>
              {loading ? '—' : formatCurrency(balance?.available_balance, balance?.currency)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>
      </Pressable>

      <View style={styles.actionsRow}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            style={styles.actionItem}
            onPress={() =>
              action.tab
                ? navigation.navigate(action.tab, { screen: action.screen })
                : navigation.navigate(action.screen, action.params)
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={26} color={colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => navigation.navigate('ReferFriend')} style={{ marginBottom: spacing.lg }}>
        <Card style={styles.referCard}>
          <View style={styles.referIcon}>
            <Ionicons name="people" size={22} color={colors.textInverse} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.referTitle}>Refer a Friend</Text>
            <Text style={styles.referSubtitle}>Give 300 CFA, get 100 CFA for every friend who joins</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
        </Card>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Pressable onPress={() => navigation.navigate('Transactions', { screen: 'TransactionHistory' })}>
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      </View>

      {contacts.length === 0 && !loading ? (
        <Card>
          <Text style={styles.emptyText}>No recent transfers yet. Send money to get started.</Text>
        </Card>
      ) : (
        contacts.map((contact, index) => (
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate('SendMoney', {
                recipient: { name: contact.name, identifier: contact.phone, subtitle: contact.phone },
              })
            }
          >
            <Card style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={styles.activityAvatar}>
                  <Text style={styles.activityAvatarText}>{contact.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {contact.name}
                  </Text>
                  <Text style={styles.activityDate}>{formatDateTime(contact.last_transfer_at)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  upi: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  balanceCard: { backgroundColor: colors.primary, borderWidth: 0, marginBottom: spacing.lg },
  balanceLabel: { color: colors.primaryLight, fontSize: fontSize.sm },
  balanceValue: {
    color: colors.textInverse,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  walletNumber: { color: colors.primaryLight, fontSize: fontSize.xs },
  moveLink: { color: colors.textInverse, fontSize: fontSize.xs, fontWeight: '700' },
  errorText: { color: colors.dangerLight, fontSize: fontSize.xs, marginTop: spacing.xs },
  accountRow: { flexDirection: 'row', alignItems: 'center' },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  accountLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  accountValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionItem: { alignItems: 'center', width: '23%' },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: { fontSize: fontSize.xs, color: colors.text, textAlign: 'center', fontWeight: '600' },
  referCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderWidth: 0 },
  referIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  referTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textInverse },
  referSubtitle: { fontSize: fontSize.xs, color: colors.primaryLight, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
  activityCard: { marginBottom: spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityAvatarText: { color: colors.textInverse, fontWeight: '800', fontSize: fontSize.sm },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  activityDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
