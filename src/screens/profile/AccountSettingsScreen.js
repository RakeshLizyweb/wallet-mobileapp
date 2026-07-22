import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PinInput from '../../components/PinInput';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function AccountSettingsScreen() {
  const { clearSession } = useAuth();
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState(null); // 'deactivate' | 'delete'
  const [loading, setLoading] = useState(false);

  const runAction = async (action) => {
    if (pin.length !== 6) {
      showAlert('PIN required', 'Enter your 6-digit PIN to continue.');
      return;
    }
    setLoading(true);
    try {
      if (action === 'deactivate') {
        await authApi.deactivateAccount(pin);
      } else {
        await authApi.deleteAccount(pin);
      }
      await clearSession();
    } catch (e) {
      showAlert('Could not complete this action', apiErrorMessage(e));
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const confirmAndRun = (action) => {
    showAlert(
      action === 'deactivate' ? 'Deactivate account' : 'Delete account',
      action === 'deactivate'
        ? 'You can contact support to reactivate your account later.'
        : 'This will permanently delete your account. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: () => runAction(action) },
      ]
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>Account settings</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Deactivate account</Text>
        <Text style={styles.cardBody}>
          Temporarily disable your account. You won't be able to log in until it's reactivated.
        </Text>
        <Button
          title="Deactivate"
          variant="outline"
          onPress={() => setMode('deactivate')}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Delete account</Text>
        <Text style={styles.cardBody}>Permanently delete your account and personal data.</Text>
        <Button title="Delete account" variant="danger" onPress={() => setMode('delete')} style={{ marginTop: spacing.sm }} />
      </Card>

      {mode ? (
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Enter your PIN to confirm</Text>
          <PinInput value={pin} onChange={setPin} />
          <Button
            title="Confirm"
            loading={loading}
            onPress={() => confirmAndRun(mode)}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  pinSection: { marginTop: spacing.lg, alignItems: 'center' },
  pinLabel: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.md, fontWeight: '600' },
});
