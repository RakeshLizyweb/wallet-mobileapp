import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as transfersApi from '../../api/transfers';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function SendMoneyScreen({ route, navigation }) {
  const { sessionPin, lockApp } = useAuth();
  const [receiver, setReceiver] = useState(route.params?.receiver || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!receiver.trim()) next.receiver = 'Enter a UPI handle, phone number, or wallet number.';
    if (!amount || Number(amount) <= 0) next.amount = 'Enter a valid amount.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await transfersApi.walletToWallet(receiver.trim(), Number(amount), sessionPin, note.trim() || undefined);
      navigation.replace('TransferSuccess', { transfer: res.data, message: 'Money sent successfully' });
    } catch (e) {
      const message = apiErrorMessage(e);
      if (e?.response?.status === 422 && /pin/i.test(message)) {
        showAlert('PIN required', 'Please unlock the app again to confirm this payment.', [
          { text: 'OK', onPress: lockApp },
        ]);
      } else {
        showAlert('Payment failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Send money</Text>
      <Text style={styles.subtitle}>Send to any Wallet user by their UPI handle, phone, or wallet number.</Text>

      <View style={styles.form}>
        <Input
          label="Send to"
          placeholder="9876543210@wallet"
          value={receiver}
          onChangeText={setReceiver}
          error={errors.receiver}
          autoCapitalize="none"
        />
        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          error={errors.amount}
          keyboardType="decimal-pad"
        />
        <Input label="Note (optional)" placeholder="What's this for?" value={note} onChangeText={setNote} />

        <Button title="Send money" onPress={handleSend} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
