import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { colors } from '../../theme/colors';
import { spacing, fontSize, radius } from '../../theme/spacing';

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Z</Text>
          </View>
          <Text style={styles.appName}>Zemapay</Text>
          <Text style={styles.tagline}>Send, save and grow your money — all in one place.</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Create an account" onPress={() => navigation.navigate('Register')} />
          <Button
            title="I already have an account"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.xl },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { color: colors.textInverse, fontSize: 40, fontWeight: '800' },
  appName: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  actions: { width: '100%' },
});
