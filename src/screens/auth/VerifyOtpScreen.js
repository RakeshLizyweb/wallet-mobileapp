import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import PinInput from '../../components/PinInput';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getDevicePayload } from '../../utils/deviceId';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen({ route }) {
  const { phone, purpose } = route.params;
  const { completeAuth } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (code) => {
    setLoading(true);
    try {
      const device = await getDevicePayload();
      const res = await authApi.verifyOtp(phone, code, purpose, device);
      await completeAuth(res.data);
    } catch (e) {
      showAlert('Verification failed', apiErrorMessage(e));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    setOtp(value);
    if (value.length === 6) handleVerify(value);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(phone, purpose === 'login' ? 'login' : 'registration');
      setCooldown(RESEND_COOLDOWN);
      showAlert('OTP sent', 'A new code has been sent to your phone.');
    } catch (e) {
      showAlert('Could not resend', apiErrorMessage(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {phone}</Text>

      <View style={styles.pinWrap}>
        <PinInput value={otp} onChange={handleChange} secure={false} />
      </View>

      {loading ? <Text style={styles.status}>Verifying…</Text> : null}

      <Button
        title={cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        variant="ghost"
        onPress={handleResend}
        disabled={cooldown > 0}
        loading={resending}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  pinWrap: { marginTop: spacing.md },
  status: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md },
});
