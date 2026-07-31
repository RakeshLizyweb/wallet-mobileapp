import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, fontSize } from '../theme/spacing';

export default function Input({ label, error, style, autoFocus, ...props }) {
  const inputRef = useRef(null);

  // Native TextInput autoFocus is unreliable right after a screen transition
  // or inside a Modal — the keyboard often silently never appears. A short
  // delayed manual focus after mount is the standard, reliable fix.
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={inputRef}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
});
