import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../../utils/alert';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Screen from '../../components/Screen';
import * as authApi from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../constants/countries';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

export default function ChangeNationalityScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [nationality, setNationality] = useState(user?.nationality || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nationality) {
      showAlert('Missing nationality', 'Select your nationality.');
      return;
    }
    setLoading(true);
    try {
      await authApi.updateNationality(nationality);
      await refreshUser();
      showAlert('Nationality updated', 'Your nationality has been changed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      showAlert('Could not update nationality', apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Nationality</Text>
      <Text style={styles.subtitle}>
        This determines whether you verify your identity with a passport or a citizen ID. Changing it only affects
        verifications you submit from now on.
      </Text>

      <View style={styles.form}>
        <Select label="Nationality" value={nationality} onChange={setNationality} options={COUNTRIES} />
        <Button title="Save" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { marginTop: spacing.sm },
});
