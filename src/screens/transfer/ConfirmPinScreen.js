import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PinInput from '../../components/PinInput';
import Screen from '../../components/Screen';
import { apiErrorMessage } from '../../api/client';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

// A dedicated screen (instead of a <Modal>) for entering the PIN before a
// transfer — the PIN pad is a genuinely fresh screen mount every time it's
// navigated to, so autoFocus reliably opens the keyboard, unlike a Modal
// whose contents stay mounted-but-hidden between opens.
export default function ConfirmPinScreen({ route, navigation }) {
  const { title = 'Confirm payment', subtitle, onConfirm, successMessage } = route.params;
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleChange = async (value) => {
    setPin(value);
    setError(null);
    if (value.length !== 6) return;

    setChecking(true);
    try {
      const transfer = await onConfirm(value);
      navigation.replace('TransferSuccess', { transfer, message: successMessage });
    } catch (e) {
      setError(apiErrorMessage(e, 'Incorrect PIN.'));
      setPin('');
      setChecking(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.pinWrap}>
          <PinInput value={pin} onChange={handleChange} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {checking ? <Text style={styles.status}>Verifying…</Text> : null}

        <Text style={styles.cancel} onPress={() => navigation.goBack()}>
          Cancel
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pinWrap: { marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center' },
  status: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  cancel: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm, marginTop: spacing.xl },
});
