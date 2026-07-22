import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as walletApi from '../../api/wallet';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const ACTIONS = [
  { key: 'send', label: 'Send', icon: 'arrow-up-circle', screen: 'SendMoney' },
  { key: 'scan', label: 'Scan & Pay', icon: 'qr-code', screen: 'ScanQr' },
  { key: 'add', label: 'Add Money', icon: 'add-circle', screen: 'AddMoney' },
  { key: 'withdraw', label: 'Withdraw', icon: 'arrow-down-circle', screen: 'Withdraw' },
];

export default function HomeScreen({ navigation }) {
  const { user, sessionPin } = useAuth();
  const [balance, setBalance] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, statementRes] = await Promise.all([
        walletApi.getBalance(sessionPin),
        walletApi.getMiniStatement(),
      ]);
      setBalance(balanceRes.data);
      setActivity(statementRes.data);
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
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>
          {loading ? '—' : formatCurrency(balance?.available_balance, balance?.currency)}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.walletNumber}>{balance?.wallet_number}</Text>
      </Card>

      <View style={styles.actionsRow}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            style={styles.actionItem}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={26} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Pressable onPress={() => navigation.navigate('TransactionHistory')}>
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      </View>

      {activity.length === 0 && !loading ? (
        <Card>
          <Text style={styles.emptyText}>No transactions yet. Send or add money to get started.</Text>
        </Card>
      ) : (
        activity.map((item, index) => (
          <Card key={index} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: item.type === 'credit' ? colors.successLight : colors.dangerLight },
                ]}
              >
                <Ionicons
                  name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={item.type === 'credit' ? colors.success : colors.danger}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {item.description || item.category}
                </Text>
                <Text style={styles.activityDate}>{formatDateTime(item.created_at)}</Text>
              </View>
              <Text
                style={[
                  styles.activityAmount,
                  { color: item.type === 'credit' ? colors.success : colors.text },
                ]}
              >
                {item.type === 'credit' ? '+' : '-'}
                {formatCurrency(item.amount)}
              </Text>
            </View>
          </Card>
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
  walletNumber: { color: colors.primaryLight, fontSize: fontSize.xs, marginTop: spacing.sm },
  errorText: { color: colors.dangerLight, fontSize: fontSize.xs, marginTop: spacing.xs },
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
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: { fontSize: fontSize.xs, color: colors.text, textAlign: 'center', fontWeight: '600' },
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
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  activityDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  activityAmount: { fontSize: fontSize.sm, fontWeight: '700' },
});
