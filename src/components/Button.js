import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, fontSize } from '../theme/spacing';

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}) {
  const isDisabled = disabled || loading;
  const variantStyle = styles[variant] || styles.primary;
  const textVariantStyle = styles[`${variant}Text`] || styles.primaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textInverse} />
      ) : (
        <Text style={[styles.text, textVariantStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: colors.textInverse },
  danger: { backgroundColor: colors.danger },
  dangerText: { color: colors.textInverse },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  outlineText: { color: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: colors.primary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
