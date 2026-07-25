import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';
import PinPromptModal from '../../components/PinPromptModal';
import Screen from '../../components/Screen';
import * as banksApi from '../../api/banks';
import * as transfersApi from '../../api/transfers';
import { apiErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function WithdrawScreen({ navigation }) {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [amount, setAmount] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    banksApi
      .listBanks()
      .then((res) => {
        setBanks(res.data);
        const verified = res.data.find((b) => b.is_verified);
        setSelectedBankId((verified || res.data[0])?.id ?? null);
      })
      .catch((e) => showAlert('Could not load bank accounts', apiErrorMessage(e)))
      .finally(() => setLoadingBanks(false));
  }, []);

  const handleSubmit = () => {
    if (!selectedBankId) {
      showAlert('Select a bank account', 'Add a verified bank account first.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showAlert('Invalid amount', 'Enter a valid amount to withdraw.');
      return;
    }
    setShowPinPrompt(true);
  };

  const submitWithdrawal = async (pin) => {
    const res = await transfersApi.walletToBank(selectedBankId, Number(amount), pin);
    setShowPinPrompt(false);
    navigation.replace('TransferSuccess', { transfer: res.data, message: 'Withdrawal successful' });
  };

  return (
    <Screen>
      <Text style={styles.title}>Withdraw to bank</Text>
      <Text style={styles.subtitle}>Only verified bank accounts can receive withdrawals.</Text>

      {loadingBanks ? null : banks.length === 0 ? (
        <EmptyState
          title="No bank accounts yet"
          subtitle="Add a bank account first from your profile."
        />
      ) : (
        <View style={styles.bankList}>
          {banks.map((bank) => (
            <Pressable key={bank.id} onPress={() => setSelectedBankId(bank.id)}>
              <Card
                style={[
                  styles.bankCard,
                  selectedBankId === bank.id && styles.bankCardSelected,
                  !bank.is_verified && styles.bankCardDisabled,
                ]}
              >
                <View style={styles.bankRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bankName}>{bank.bank_name}</Text>
                    <Text style={styles.bankAccount}>{bank.masked_account_number}</Text>
                  </View>
                  {bank.is_verified ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  ) : (
                    <Text style={styles.unverified}>Unverified</Text>
                  )}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
      />

      <Button title="Withdraw" onPress={handleSubmit} style={{ marginTop: spacing.sm }} />

      <PinPromptModal
        visible={showPinPrompt}
        title="Confirm withdrawal"
        subtitle={`Withdraw ${formatCurrency(Number(amount) || 0)} to your bank account`}
        onSubmit={submitWithdrawal}
        onCancel={() => setShowPinPrompt(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  bankList: { marginBottom: spacing.md },
  bankCard: { marginBottom: spacing.sm, borderWidth: 1.5 },
  bankCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  bankCardDisabled: { opacity: 0.6 },
  bankRow: { flexDirection: 'row', alignItems: 'center' },
  bankName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  bankAccount: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  unverified: { fontSize: fontSize.xs, color: colors.warning, fontWeight: '600' },
});
