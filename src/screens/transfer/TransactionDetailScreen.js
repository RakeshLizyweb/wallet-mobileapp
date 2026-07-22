import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import { apiErrorMessage } from '../../api/client';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function TransactionDetailScreen({ route }) {
  const { reference } = route.params;
  const [transfer, setTransfer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    transfersApi
      .getTransfer(reference)
      .then((res) => setTransfer(res.data))
      .catch((e) => setError(apiErrorMessage(e)));
  }, [reference]);

  if (error) {
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }

  if (!transfer) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.amountWrap}>
        <Text style={styles.amount}>{formatCurrency(transfer.amount)}</Text>
        <Text style={[styles.status, { color: transfer.status === 'success' ? colors.success : colors.warning }]}>
          {transfer.status}
        </Text>
      </View>

      <Card>
        <Row label="Reference number" value={transfer.reference_number} />
        <Row label="Type" value={transfer.type.replace(/_/g, ' ')} capitalize />
        <Row label="Direction" value={transfer.direction} capitalize />
        {transfer.fee ? <Row label="Fee" value={formatCurrency(transfer.fee)} /> : null}
        <Row label="Total" value={formatCurrency(transfer.total_amount)} />
        {transfer.counterparty ? (
          <>
            <Row label="Name" value={transfer.counterparty.name} />
            <Row label="UPI handle" value={transfer.counterparty.upi_handle} />
          </>
        ) : null}
        {transfer.bank_account ? (
          <>
            <Row label="Bank" value={transfer.bank_account.bank_name} />
            <Row label="Account" value={transfer.bank_account.masked_account_number} />
          </>
        ) : null}
        {transfer.sender_note ? <Row label="Note" value={transfer.sender_note} /> : null}
        {transfer.failure_reason ? <Row label="Reason" value={transfer.failure_reason} /> : null}
        <Row label="Date" value={formatDateTime(transfer.completed_at || transfer.created_at)} />
      </Card>
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  amountWrap: { alignItems: 'center', marginBottom: spacing.lg },
  amount: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  status: { fontSize: fontSize.sm, fontWeight: '700', textTransform: 'capitalize', marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  rowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
