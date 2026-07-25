import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as accountApi from '../../api/account';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function AccountScreen({ navigation }) {
  const { sessionPin } = useAuth();
  const [balance, setBalance] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [balanceRes, statementRes] = await Promise.all([
        accountApi.getBalance(sessionPin),
        accountApi.getMiniStatement(),
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

  return (
    <Screen>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>
        Money added by an admin, and any payment other people send you, lands here. Move it to your Wallet to spend it.
      </Text>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Account balance</Text>
        <Text style={styles.balanceValue}>
          {loading ? '—' : formatCurrency(balance?.available_balance, balance?.currency)}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.accountNumber}>{balance?.account_number}</Text>
      </Card>

      <Button
        title="Move to wallet"
        onPress={() => navigation.navigate('MoveToWallet')}
        style={{ marginBottom: spacing.lg }}
      />

      <Text style={styles.sectionTitle}>Recent activity</Text>

      {activity.length === 0 && !loading ? (
        <Card>
          <Text style={styles.emptyText}>No account activity yet.</Text>
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
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  balanceCard: { backgroundColor: colors.primaryDark, borderWidth: 0, marginBottom: spacing.lg },
  balanceLabel: { color: colors.primaryLight, fontSize: fontSize.sm },
  balanceValue: { color: colors.textInverse, fontSize: fontSize.xxl, fontWeight: '800', marginTop: spacing.xs },
  accountNumber: { color: colors.primaryLight, fontSize: fontSize.xs, marginTop: spacing.sm },
  errorText: { color: colors.dangerLight, fontSize: fontSize.xs, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
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
