import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { radius, spacing, fontSize } from '../theme/spacing';

export default function Select({ label, value, options, onChange, placeholder = 'Select…', error, style }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.field, error && styles.fieldError]} onPress={() => setOpen(true)}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search…"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onChange(item);
                  close();
                }}
              >
                <Text style={item === value ? styles.optionTextActive : styles.optionText}>{item}</Text>
                {item === value ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger },
  value: { fontSize: fontSize.md, color: colors.text },
  placeholder: { fontSize: fontSize.md, color: colors.textMuted },
  error: { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  sheetTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  search: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  list: { marginTop: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: { fontSize: fontSize.md, color: colors.text },
  optionTextActive: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.textMuted, paddingVertical: spacing.lg },
});
