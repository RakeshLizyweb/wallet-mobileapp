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

export default function ChangePinScreen({ navigation }) {
  const { setSessionPin } = useAuth();
  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (currentPin.length !== 6) {
      showAlert('Missing PIN', 'Enter your current PIN.');
      return;
    }
    if (pin.length !== 6 || pin !== pinConfirmation) {
      showAlert('PIN mismatch', 'Your new PIN and confirmation must match and be 6 digits.');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePin(currentPin, pin, pinConfirmation);
      setSessionPin(pin);
      showAlert('PIN updated', 'Your transaction PIN has been changed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      showAlert('Could not change PIN', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Change your PIN</Text>
      <Text style={styles.subtitle}>Enter your current PIN and choose a new one.</Text>

      <View style={styles.form}>
        <Input
          label="Current PIN"
          value={currentPin}
          onChangeText={(v) => setCurrentPin(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
        />
        <Input
          label="New PIN"
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
        <Button title="Update PIN" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
