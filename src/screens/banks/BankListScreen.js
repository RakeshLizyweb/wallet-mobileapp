import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as banksApi from '../../api/banks';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function BankListScreen({ navigation }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    banksApi
      .listBanks()
      .then((res) => setBanks(res.data))
      .catch((e) => showAlert('Could not load bank accounts', apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSetPrimary = async (bank) => {
    try {
      await banksApi.setPrimaryBank(bank.id);
      load();
    } catch (e) {
      showAlert('Could not update', apiErrorMessage(e));
    }
  };

  const handleDelete = (bank) => {
    showAlert('Remove bank account', `Remove ${bank.bank_name} ${bank.masked_account_number}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await banksApi.deleteBank(bank.id);
            load();
          } catch (e) {
            showAlert('Could not remove', apiErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Bank accounts</Text>

      {!loading && banks.length === 0 ? (
        <EmptyState title="No bank accounts yet" subtitle="Add one to withdraw or top up your wallet." />
      ) : (
        banks.map((bank) => (
          <Card key={bank.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>{bank.bank_name}</Text>
                <Text style={styles.account}>{bank.masked_account_number}</Text>
                <View style={styles.badges}>
                  {bank.is_primary ? <Badge text="Primary" color={colors.primary} /> : null}
                  <Badge
                    text={bank.is_verified ? 'Verified' : 'Pending verification'}
                    color={bank.is_verified ? colors.success : colors.warning}
                  />
                </View>
              </View>
              <Pressable onPress={() => handleDelete(bank)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
            {!bank.is_primary ? (
              <Button
                title="Set as primary"
                variant="ghost"
                onPress={() => handleSetPrimary(bank)}
                style={{ marginTop: spacing.xs, alignSelf: 'flex-start', minHeight: 36 }}
              />
            ) : null}
          </Card>
        ))
      )}

      <Button title="Add bank account" onPress={() => navigation.navigate('AddBank')} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  bankName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  account: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
});
