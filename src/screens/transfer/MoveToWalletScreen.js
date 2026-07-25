import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PinPromptModal from '../../components/PinPromptModal';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function MoveToWalletScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      showAlert('Invalid amount', 'Enter a valid amount to move.');
      return;
    }
    setShowPinPrompt(true);
  };

  const submitMove = async (pin) => {
    const res = await transfersApi.accountToWallet(Number(amount), pin);
    setShowPinPrompt(false);
    navigation.replace('TransferSuccess', { transfer: res.data, message: 'Moved to your wallet' });
  };

  return (
    <Screen>
      <Text style={styles.title}>Move to wallet</Text>
      <Text style={styles.subtitle}>
        Move money from your Account into your Wallet so you can spend it, pay other people, or scan &amp; pay with it.
      </Text>

      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
      />

      <Button title="Move to wallet" onPress={handleSubmit} style={{ marginTop: spacing.sm }} />

      <PinPromptModal
        visible={showPinPrompt}
        title="Confirm transfer"
        subtitle={`Move ${formatCurrency(Number(amount) || 0)} to your wallet`}
        onSubmit={submitMove}
        onCancel={() => setShowPinPrompt(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
});
