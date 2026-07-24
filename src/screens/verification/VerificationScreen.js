import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import * as verificationApi from '../../api/verification';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

const STATUS_COPY = {
  approved: { title: "You're verified!", color: colors.success },
  pending: { title: 'Verification under review', color: colors.warning },
  rejected: { title: 'Verification rejected', color: colors.danger },
};

export default function VerificationScreen({ navigation }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    verificationApi
      .getVerificationStatus()
      .then((res) => setVerification(res.data))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
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

  const canSubmit = !verification || verification.status === 'rejected';
  const statusMeta = verification ? STATUS_COPY[verification.status] : null;

  return (
    <Screen>
      <Text style={styles.title}>Identity verification</Text>
      <Text style={styles.subtitle}>
        Verify your passport or citizen ID to raise your transaction limits and unlock a virtual Visa card.
      </Text>

      {verification ? (
        <Card style={styles.card}>
          <Text style={[styles.status, { color: statusMeta?.color }]}>{statusMeta?.title}</Text>
          <Text style={styles.detail}>
            {verification.document_type === 'citizen_id' ? 'Citizen ID' : 'Passport'}: {verification.document_number}
          </Text>
          <Text style={styles.detail}>Expiry: {verification.document_expiry}</Text>
          {verification.rejection_reason ? (
            <Text style={styles.reason}>Reason: {verification.rejection_reason}</Text>
          ) : null}
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.detail}>You haven't submitted your verification yet.</Text>
        </Card>
      )}

      {canSubmit ? (
        <Button
          title={verification ? 'Resubmit verification' : 'Start verification'}
          onPress={() => navigation.navigate('SubmitVerification')}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  status: { fontSize: fontSize.md, fontWeight: '800', marginBottom: spacing.sm },
  detail: { fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  reason: { fontSize: fontSize.sm, color: colors.danger, marginTop: spacing.sm },
});
