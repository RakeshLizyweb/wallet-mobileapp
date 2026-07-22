import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import PinInput from '../../components/PinInput';
import Screen from '../../components/Screen';
import * as walletApi from '../../api/wallet';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function PinLockScreen() {
  const { user, unlockApp, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleChange = async (value) => {
    setPin(value);
    setError(null);
    if (value.length === 6) {
      setChecking(true);
      try {
        await walletApi.getBalance(value);
        unlockApp(value);
      } catch (e) {
        setError(apiErrorMessage(e, 'Incorrect PIN.'));
        setPin('');
      } finally {
        setChecking(false);
      }
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'there'}</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>

        <View style={styles.pinWrap}>
          <PinInput value={pin} onChange={handleChange} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {checking ? <Text style={styles.status}>Checking…</Text> : null}

        <Button title="Log out" variant="ghost" onPress={logout} style={{ marginTop: spacing.xl }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  greeting: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  pinWrap: { marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.sm },
  status: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.sm },
});
