import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function ForgotPinScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      setError('Enter a valid phone number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPin(phone.trim());
      navigation.navigate('ResetPin', { phone: phone.trim() });
    } catch (e) {
      showAlert('Could not send OTP', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Reset your PIN</Text>
      <Text style={styles.subtitle}>Enter your phone number to receive a verification code.</Text>

      <View style={styles.form}>
        <Input
          label="Phone number"
          placeholder="9876543210"
          value={phone}
          onChangeText={setPhone}
          error={error}
          keyboardType="phone-pad"
        />
        <Button title="Send code" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
