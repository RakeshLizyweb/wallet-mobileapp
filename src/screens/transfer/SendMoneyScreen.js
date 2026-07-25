import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import PinPromptModal from '../../components/PinPromptModal';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import * as usersApi from '../../api/users';
import { formatCurrency } from '../../utils/format';
import { PEER_TRANSFER_FEE_RATE } from '../../constants/fees';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function SendMoneyScreen({ route, navigation }) {
  const [recipient, setRecipient] = useState(route.params?.recipient || null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [method, setMethod] = useState('wallet');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (route.params?.recipient) {
      setRecipient(route.params.recipient);
    }
  }, [route.params?.recipient]);

  useEffect(() => {
    if (recipient || query.trim().length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      usersApi
        .searchByPhone(query.trim())
        .then((res) => {
          if (!cancelled) setResults(res.data);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, recipient]);

  const selectResult = (user) => {
    setRecipient({ name: user.name, identifier: user.phone, subtitle: user.phone });
    setQuery('');
    setResults([]);
  };

  const changeRecipient = () => {
    setRecipient(null);
    navigation.setParams({ recipient: undefined });
  };

  const validate = () => {
    const next = {};
    if (!amount || Number(amount) <= 0) next.amount = 'Enter a valid amount.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendingAmount = Number(amount) || 0;
  const fee = Math.round(sendingAmount * PEER_TRANSFER_FEE_RATE * 100) / 100;
  const reachingAmount = Math.round((sendingAmount - fee) * 100) / 100;

  const handleSend = () => {
    if (!validate()) return;
    setShowPinPrompt(true);
  };

  const submitPayment = async (pin) => {
    const res =
      method === 'account'
        ? await transfersApi.accountToAccount(recipient.identifier, Number(amount), pin, note.trim() || undefined)
        : await transfersApi.walletToWallet(recipient.identifier, Number(amount), pin, note.trim() || undefined);
    setShowPinPrompt(false);
    navigation.replace('TransferSuccess', { transfer: res.data, message: 'Money sent successfully' });
  };

  if (!recipient) {
    return (
      <Screen scroll={false}>
        <Text style={styles.title}>Send money</Text>
        <Text style={styles.subtitle}>Search for someone by phone number, or scan their QR code.</Text>

        <Input
          placeholder="Search by phone number"
          value={query}
          onChangeText={setQuery}
          keyboardType="phone-pad"
          autoFocus
        />

        <Pressable style={styles.qrRow} onPress={() => navigation.navigate('ScanQr')}>
          <View style={styles.qrIcon}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.qrTitle}>Scan QR to pay</Text>
            <Text style={styles.qrSubtitle}>Point your camera at a Wallet QR code</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {searching ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ marginTop: spacing.sm }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable onPress={() => selectResult(item)}>
              <Card style={styles.resultCard}>
                <View style={styles.resultAvatar}>
                  <Text style={styles.resultAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultPhone}>{item.phone}</Text>
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            !searching && query.trim().length >= 3 ? (
              <Text style={styles.emptyText}>No matching users found.</Text>
            ) : null
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Send money</Text>

      <Card style={styles.recipientCard}>
        <View style={styles.resultAvatar}>
          <Text style={styles.resultAvatarText}>{recipient.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultName}>{recipient.name}</Text>
          <Text style={styles.resultPhone}>{recipient.subtitle}</Text>
        </View>
        <Pressable onPress={changeRecipient}>
          <Text style={styles.changeLink}>Change</Text>
        </Pressable>
      </Card>

      <Text style={styles.label}>Pay with</Text>
      <View style={styles.methodRow}>
        <Pressable
          style={[styles.methodOption, method === 'wallet' && styles.methodOptionActive]}
          onPress={() => setMethod('wallet')}
        >
          <Ionicons name="wallet-outline" size={18} color={method === 'wallet' ? colors.textInverse : colors.text} />
          <Text style={[styles.methodText, method === 'wallet' && styles.methodTextActive]}>Wallet</Text>
        </Pressable>
        <Pressable
          style={[styles.methodOption, method === 'account' && styles.methodOptionActive]}
          onPress={() => setMethod('account')}
        >
          <Ionicons name="business-outline" size={18} color={method === 'account' ? colors.textInverse : colors.text} />
          <Text style={[styles.methodText, method === 'account' && styles.methodTextActive]}>Account</Text>
        </Pressable>
      </View>
      <Text style={styles.methodHint}>{recipient.name} will receive this in their Account.</Text>

      <View style={styles.form}>
        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          error={errors.amount}
          keyboardType="decimal-pad"
        />

        {sendingAmount > 0 ? (
          <Card style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Sending amount</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(sendingAmount)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fee (1%)</Text>
              <Text style={styles.breakdownValue}>-{formatCurrency(fee)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownRowFinal]}>
              <Text style={styles.breakdownLabelFinal}>{recipient.name} receives</Text>
              <Text style={styles.breakdownValueFinal}>{formatCurrency(reachingAmount)}</Text>
            </View>
          </Card>
        ) : null}

        <Input label="Note (optional)" placeholder="What's this for?" value={note} onChangeText={setNote} />

        <Button title="Send money" onPress={handleSend} style={{ marginTop: spacing.sm }} />
      </View>

      <PinPromptModal
        visible={showPinPrompt}
        title="Confirm payment"
        subtitle={`Send ${formatCurrency(sendingAmount)} — ${recipient.name} gets ${formatCurrency(reachingAmount)}`}
        onSubmit={submitPayment}
        onCancel={() => setShowPinPrompt(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
  breakdownCard: { marginTop: spacing.xs, marginBottom: spacing.md },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  breakdownRowFinal: { marginTop: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  breakdownLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  breakdownValue: { fontSize: fontSize.xs, color: colors.textMuted },
  breakdownLabelFinal: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  breakdownValueFinal: { fontSize: fontSize.sm, fontWeight: '800', color: colors.success },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  qrIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  qrTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  qrSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  resultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  resultAvatarText: { color: colors.textInverse, fontWeight: '800' },
  resultName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  resultPhone: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  recipientCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  changeLink: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  methodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  methodHint: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.lg },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  methodTextActive: { color: colors.textInverse },
});
