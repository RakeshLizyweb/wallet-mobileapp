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

export default function LoginScreen({ navigation }) {
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
      await authApi.login(phone.trim());
      navigation.navigate('VerifyOtp', { phone: phone.trim(), purpose: 'login' });
    } catch (e) {
      showAlert('Login failed', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in with your phone number.</Text>

      <View style={styles.form}>
        <Input
          label="Phone number"
          placeholder="9876543210"
          value={phone}
          onChangeText={setPhone}
          error={error}
          keyboardType="phone-pad"
        />
        <Button title="Send OTP" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
        <Button
          title="Forgot your PIN?"
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPin')}
          style={{ marginTop: spacing.xs }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
