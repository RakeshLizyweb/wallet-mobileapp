import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function SetPinScreen() {
  const { markPinSetupDone } = useAuth();
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      showAlert('Invalid PIN', 'Your PIN must be exactly 6 digits.');
      return;
    }
    if (pin !== pinConfirmation) {
      showAlert('PIN mismatch', 'Both PIN entries must match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.setPin(pin, pinConfirmation);
      markPinSetupDone(pin);
    } catch (e) {
      showAlert('Could not set PIN', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Create your PIN</Text>
      <Text style={styles.subtitle}>
        This 6-digit PIN protects your wallet. You'll need it to open the app, view your balance,
        and send money.
      </Text>

      <View style={styles.form}>
        <Input
          label="6-digit PIN"
          value={pin}
          onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <Input
          label="Confirm PIN"
          value={pinConfirmation}
          onChangeText={(v) => setPinConfirmation(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <Button title="Set PIN" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
