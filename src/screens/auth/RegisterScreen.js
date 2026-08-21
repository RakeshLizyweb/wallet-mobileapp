import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { COUNTRIES } from '../../constants/countries';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function RegisterScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [referralCode, setReferralCode] = useState(route?.params?.referralCode || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) next.phone = 'Enter a valid phone number.';
    if (!nationality) next.nationality = 'Select your nationality.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register(name.trim(), phone.trim(), nationality, referralCode.trim() || undefined);
      navigation.navigate('VerifyOtp', { phone: phone.trim(), purpose: 'registration' });
    } catch (e) {
      showAlert('Registration failed', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>We'll send a one-time code to verify your number.</Text>

      <View style={styles.form}>
        <Input
          label="Full name"
          placeholder="Alice Johnson"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
        />
        <Input
          label="Phone number"
          placeholder="9876543210"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
        />
        <Select
          label="Nationality"
          placeholder="Select your nationality"
          value={nationality}
          onChange={setNationality}
          options={COUNTRIES}
          error={errors.nationality}
        />
        <Input
          label="Referral code (optional)"
          placeholder="e.g. AB12CD34"
          value={referralCode}
          onChangeText={(v) => setReferralCode(v.toUpperCase())}
          autoCapitalize="characters"
        />
        <Button title="Send OTP" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
