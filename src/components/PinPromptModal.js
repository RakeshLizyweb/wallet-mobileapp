import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import PinInput from './PinInput';
import { apiErrorMessage } from '../api/client';
import { colors } from '../theme/colors';
import { radius, spacing, fontSize } from '../theme/spacing';

// Always prompts for the PIN fresh at the moment of a transaction, rather
// than reusing the PIN captured when the app was unlocked — money-moving
// actions should never rely on a cached PIN sitting in memory.
export default function PinPromptModal({ visible, title = 'Enter your PIN', subtitle, onSubmit, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const reset = () => {
    setPin('');
    setError(null);
    setChecking(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleChange = async (value) => {
    setPin(value);
    setError(null);
    if (value.length !== 6) return;

    setChecking(true);
    try {
      await onSubmit(value);
      reset();
    } catch (e) {
      setError(apiErrorMessage(e, 'Incorrect PIN.'));
      setPin('');
      setChecking(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.pinWrap}>
            <PinInput value={pin} onChange={handleChange} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {checking ? <Text style={styles.status}>Verifying…</Text> : null}

          <Pressable onPress={handleCancel} style={styles.cancelButton} disabled={checking}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  pinWrap: { marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center' },
  status: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  cancelButton: { marginTop: spacing.lg },
  cancel: { color: colors.primary, fontWeight: '700', fontSize: fontSize.sm },
});
