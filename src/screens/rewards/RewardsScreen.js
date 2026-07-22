import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as rewardsApi from '../../api/rewards';
import { apiErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

const REWARD_ICONS = {
  cashback: 'cash-outline',
  points: 'star-outline',
  coupon: 'pricetag-outline',
  lucky: 'sparkles-outline',
};

export default function RewardsScreen() {
  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    Promise.all([rewardsApi.listRewards(), rewardsApi.getRewardsSummary()])
      .then(([cardsRes, summaryRes]) => {
        setCards(cardsRes.data);
        setSummary(summaryRes.data);
      })
      .catch((e) => showAlert('Could not load rewards', apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleScratch = async (card) => {
    setBusyId(card.id);
    try {
      const res = await rewardsApi.scratchCard(card.id);
      setCards((prev) => prev.map((c) => (c.id === card.id ? res.data : c)));
    } catch (e) {
      showAlert('Could not scratch card', apiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleRedeem = async (card) => {
    setBusyId(card.id);
    try {
      const res = await rewardsApi.redeemCard(card.id);
      setCards((prev) => prev.map((c) => (c.id === card.id ? res.data : c)));
      showAlert('Reward redeemed', describeReward(res.data));
    } catch (e) {
      showAlert('Could not redeem reward', apiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Rewards</Text>

      {summary ? (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <SummaryItem label="Cashback earned" value={formatCurrency(summary.total_cashback_earned)} />
            <SummaryItem label="Points" value={String(summary.reward_points)} />
          </View>
          <View style={styles.summaryRow}>
            <SummaryItem label="To scratch" value={String(summary.unscratched_count)} />
            <SummaryItem label="To redeem" value={String(summary.unredeemed_count)} />
          </View>
        </Card>
      ) : null}

      {!loading && cards.length === 0 ? (
        <EmptyState title="No rewards yet" subtitle="Send money to earn scratch cards." />
      ) : (
        cards.map((card) => (
          <Card key={card.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={card.is_scratched ? REWARD_ICONS[card.reward?.type] || 'gift-outline' : 'gift-outline'}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                {card.is_scratched ? (
                  <>
                    <Text style={styles.rewardTitle}>{describeReward(card)}</Text>
                    <Text style={styles.rewardMeta}>
                      {card.is_redeemed ? 'Redeemed' : 'Ready to redeem'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.rewardTitle}>Mystery reward</Text>
                )}
              </View>
              {!card.is_scratched ? (
                <Button
                  title="Scratch"
                  onPress={() => handleScratch(card)}
                  loading={busyId === card.id}
                  style={styles.smallButton}
                />
              ) : !card.is_redeemed ? (
                <Button
                  title="Redeem"
                  variant="outline"
                  onPress={() => handleRedeem(card)}
                  loading={busyId === card.id}
                  style={styles.smallButton}
                />
              ) : (
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              )}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function describeReward(card) {
  const reward = card.reward;
  if (!reward) return 'Mystery reward';
  if (reward.type === 'coupon') return `Coupon: ${reward.coupon_code}`;
  if (reward.type === 'points') return `${reward.value} reward points`;
  return `${formatCurrency(reward.value)} ${reward.type === 'lucky' ? 'lucky cashback' : 'cashback'}`;
}

function SummaryItem({ label, value }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.md },
  summaryCard: { backgroundColor: colors.primary, borderWidth: 0, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1 },
  summaryValue: { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: '800' },
  summaryLabel: { color: colors.primaryLight, fontSize: fontSize.xs, marginTop: 2 },
  card: { marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rewardTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  rewardMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  smallButton: { minHeight: 40, paddingHorizontal: spacing.md },
});
