import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import { showAlert } from '../../utils/alert';
import * as referralsApi from '../../api/referrals';
import { apiErrorMessage } from '../../api/client';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function ReferFriendScreen() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    referralsApi
      .getReferralSummary()
      .then((res) => setSummary(res.data))
      .catch((e) => showAlert('Could not load referral info', apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleShare = async () => {
    if (!summary) return;
    try {
      await Share.share({
        message: `Join me on Zemapay! Use my referral code ${summary.code} when you sign up and get ${formatCurrency(
          summary.referred_bonus
        )} after your first transaction.`,
      });
    } catch (e) {
      // user dismissed the share sheet - nothing to do
    }
  };

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
      <Text style={styles.title}>Refer a Friend</Text>
      <Text style={styles.subtitle}>
        Share your code — your friend gets {formatCurrency(summary.referred_bonus)}, you get{' '}
        {formatCurrency(summary.referrer_bonus)} once they complete their first transaction.
      </Text>

      <Card style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your referral code</Text>
        <Text style={styles.code}>{summary.code}</Text>
        <Button title="Share code" onPress={handleShare} style={{ marginTop: spacing.md }} />
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{summary.total_referred}</Text>
          <Text style={styles.statLabel}>Friends referred</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(summary.total_earned)}</Text>
          <Text style={styles.statLabel}>Total earned</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Your referrals</Text>
      {summary.referrals.length === 0 ? (
        <EmptyState title="No referrals yet" subtitle="Share your code to start earning." />
      ) : (
        summary.referrals.map((r, index) => (
          <Card key={index} style={styles.referralCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{r.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.referralName}>{r.name}</Text>
              <Text style={styles.referralDate}>Joined {formatDateTime(r.joined_at)}</Text>
            </View>
            {r.rewarded ? (
              <View style={styles.rewardedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.rewardedText}>Rewarded</Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>Pending first transfer</Text>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  codeCard: { alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.lg },
  codeLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  code: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary, letterSpacing: 2, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  referralCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: { color: colors.textInverse, fontWeight: '800', fontSize: fontSize.sm },
  referralName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  referralDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  rewardedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardedText: { fontSize: fontSize.xs, color: colors.success, fontWeight: '700' },
  pendingText: { fontSize: fontSize.xs, color: colors.textMuted },
});
