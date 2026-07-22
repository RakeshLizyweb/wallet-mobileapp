import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PinInput from '../../components/PinInput';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function ResetPinScreen({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      showAlert('Missing code', 'Enter the 6-digit code sent to your phone.');
      return;
    }
    if (pin.length !== 6 || pin !== pinConfirmation) {
      showAlert('PIN mismatch', 'Your new PIN and confirmation must match and be 6 digits.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPin(phone, otp, pin, pinConfirmation);
      showAlert('PIN reset', 'You can now log in with your new PIN.', [
        { text: 'Go to login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      showAlert('Reset failed', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Enter code &amp; new PIN</Text>
      <Text style={styles.subtitle}>Code sent to {phone}</Text>

      <Text style={styles.label}>Verification code</Text>
      <PinInput value={otp} onChange={setOtp} secure={false} />

      <View style={styles.spacer} />

      <Input
        label="New 6-digit PIN"
        value={pin}
        onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />
      <Input
        label="Confirm new PIN"
        value={pinConfirmation}
        onChangeText={(v) => setPinConfirmation(v.replace(/[^0-9]/g, '').slice(0, 6))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      <Button title="Reset PIN" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  spacer: { height: spacing.lg },
});
