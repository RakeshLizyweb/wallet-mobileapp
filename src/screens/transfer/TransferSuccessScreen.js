import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function TransferSuccessScreen({ route, navigation }) {
  const { transfer, message } = route.params;

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'HomeMain' }] })
    );
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        </View>
        <Text style={styles.title}>{message || 'Transaction successful'}</Text>
        <Text style={styles.amount}>{formatCurrency(transfer.amount)}</Text>

        <Card style={styles.card}>
          <Row label="Reference" value={transfer.reference_number} />
          <Row label="Status" value={transfer.status} capitalize />
          {transfer.fee ? <Row label="Fee" value={formatCurrency(transfer.fee)} /> : null}
          {transfer.counterparty ? <Row label="To" value={transfer.counterparty.name} /> : null}
          {transfer.bank_account ? <Row label="Bank" value={transfer.bank_account.bank_name} /> : null}
          <Row label="Date" value={formatDateTime(transfer.completed_at || transfer.created_at)} />
        </Card>

        <Button title="Done" onPress={goHome} style={{ marginTop: spacing.xl, width: '100%' }} />
      </View>
    </Screen>
  );
}

function Row({ label, value, capitalize }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, capitalize && { textTransform: 'capitalize' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  iconWrap: { marginBottom: spacing.md },
  title: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
  amount: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, marginVertical: spacing.sm },
  card: { width: '100%', marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  rowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
});
