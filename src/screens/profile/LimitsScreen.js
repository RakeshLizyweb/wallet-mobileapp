import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as walletApi from '../../api/wallet';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const PERIODS = [{ key: 'monthly', label: 'Monthly' }];

export default function LimitsScreen() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi
      .getLimits()
      .then((res) => setUsage(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Transaction limits</Text>
      <Text style={styles.subtitle}>Verify your identity to raise these limits.</Text>

      {PERIODS.map((period) => {
        const limit = usage?.limits?.[period.key];
        const used = usage?.[period.key] || 0;
        const pct = limit ? Math.min(100, (used / limit) * 100) : 0;

        return (
          <Card key={period.key} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{period.label}</Text>
              <Text style={styles.value}>
                {formatCurrency(used)} / {limit ? formatCurrency(limit) : 'Unlimited'}
              </Text>
            </View>
            {limit ? (
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  value: { fontSize: fontSize.xs, color: colors.textMuted },
  barTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.primary },
});
