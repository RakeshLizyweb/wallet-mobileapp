import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PinPromptModal from '../../components/PinPromptModal';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const COPY = {
  toWallet: {
    title: 'Move to wallet',
    subtitle: 'Move money from your Account into your Wallet so you can spend it, pay other people, or scan & pay with it.',
    buttonTitle: 'Move to wallet',
    successMessage: 'Moved to your wallet',
    confirmSubtitle: (amount) => `Move ${amount} to your wallet`,
  },
  toAccount: {
    title: 'Move to account',
    subtitle: 'Move money from your Wallet back into your Account. No bank involved — it moves straight between your own two balances.',
    buttonTitle: 'Move to account',
    successMessage: 'Moved to your account',
    confirmSubtitle: (amount) => `Move ${amount} to your account`,
  },
};

export default function MoveToWalletScreen({ route, navigation }) {
  const [direction, setDirection] = useState(route.params?.direction === 'toAccount' ? 'toAccount' : 'toWallet');
  const [amount, setAmount] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);

  const copy = COPY[direction];

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      showAlert('Invalid amount', 'Enter a valid amount to move.');
      return;
    }
    setShowPinPrompt(true);
  };

  const submitMove = async (pin) => {
    const res =
      direction === 'toAccount'
        ? await transfersApi.walletToAccount(Number(amount), pin)
        : await transfersApi.accountToWallet(Number(amount), pin);
    setShowPinPrompt(false);
    navigation.replace('TransferSuccess', { transfer: res.data, message: copy.successMessage });
  };

  return (
    <Screen>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

      <View style={styles.directionRow}>
        <Pressable
          style={[styles.directionOption, direction === 'toWallet' && styles.directionOptionActive]}
          onPress={() => setDirection('toWallet')}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={18}
            color={direction === 'toWallet' ? colors.textInverse : colors.text}
          />
          <Text style={[styles.directionText, direction === 'toWallet' && styles.directionTextActive]}>
            Account → Wallet
          </Text>
        </Pressable>
        <Pressable
          style={[styles.directionOption, direction === 'toAccount' && styles.directionOptionActive]}
          onPress={() => setDirection('toAccount')}
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={18}
            color={direction === 'toAccount' ? colors.textInverse : colors.text}
          />
          <Text style={[styles.directionText, direction === 'toAccount' && styles.directionTextActive]}>
            Wallet → Account
          </Text>
        </Pressable>
      </View>

      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
        keyboardType="decimal-pad"
      />

      <Button title={copy.buttonTitle} onPress={handleSubmit} style={{ marginTop: spacing.sm }} />

      <PinPromptModal
        visible={showPinPrompt}
        title="Confirm transfer"
        subtitle={copy.confirmSubtitle(formatCurrency(Number(amount) || 0))}
        onSubmit={submitMove}
        onCancel={() => setShowPinPrompt(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  directionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  directionOption: {
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
  directionOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  directionText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  directionTextActive: { color: colors.textInverse },
});
