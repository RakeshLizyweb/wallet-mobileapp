import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import * as verificationApi from '../../api/verification';
import { colors } from '../../theme/colors';
import { radius, spacing, fontSize } from '../../theme/spacing';

export default function VirtualCardScreen({ navigation }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setNotFound(false);
      verificationApi
        .getVirtualCard()
        .then((res) => setCard(res.data))
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (notFound || !card) {
    return (
      <Screen>
        <EmptyState
          title="No virtual card yet"
          subtitle="Complete identity verification to unlock your virtual Visa card."
        />
        <Button title="Start verification" onPress={() => navigation.navigate('Verification')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Virtual card</Text>

      <View style={styles.card}>
        <Text style={styles.cardBrand}>VISA</Text>
        <Text style={styles.cardNumber}>{card.masked_card_number}</Text>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>Valid thru</Text>
            <Text style={styles.cardValue}>{card.expiry_date}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Status</Text>
            <Text style={styles.cardValue}>{card.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This is a simulated virtual card for demonstration purposes and cannot be used for real payments.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    height: 190,
    justifyContent: 'space-between',
  },
  cardBrand: { color: colors.textInverse, fontWeight: '800', fontSize: fontSize.lg, alignSelf: 'flex-end' },
  cardNumber: { color: colors.textInverse, fontSize: fontSize.lg, letterSpacing: 2, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: colors.primaryLight, fontSize: fontSize.xs },
  cardValue: { color: colors.textInverse, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'capitalize' },
  disclaimer: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' },
});
