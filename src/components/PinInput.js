import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, fontSize } from '../theme/spacing';

export default function PinInput({ value, onChange, length = 6, autoFocus = true, secure = true }) {
  const inputRef = useRef(null);
  const digits = value.split('');

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.box, digits[i] ? styles.boxFilled : null]}>
            <Text style={styles.digit}>{digits[i] ? (secure ? '•' : digits[i]) : ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  box: {
    width: 44,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxFilled: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  digit: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
});
